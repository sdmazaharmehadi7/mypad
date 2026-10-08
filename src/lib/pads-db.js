import { getDb } from './mongodb.js';
import { normalizePathString } from './pad-path.js';

let indexesEnsured = false;

// Shared global in-memory store across development bundles when MONGODB_URI is not yet provided
if (!global._memoryPadStore) {
  global._memoryPadStore = new Map();
}
const memoryPadStore = global._memoryPadStore;

/**
 * Escapes characters for regex usage
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Formats MongoDB network/TLS errors with helpful context.
 */
function formatDbError(err) {
  if (err && typeof err.message === 'string') {
    if (err.message.includes('SSL alert') || err.message.includes('tlsv1 alert')) {
      const formatted = new Error(
        'MongoDB Atlas connection rejected (SSL / Network Access). Please ensure your current IP address (or 0.0.0.0/0) is added to Network Access in your MongoDB Atlas dashboard.'
      );
      formatted.originalError = err;
      return formatted;
    }
  }
  return err;
}

/**
 * Returns the "pads" collection and ensures the unique index on "path".
 */
export async function getPadsCollection() {
  const db = await getDb('mypad');
  const collection = db.collection('pads');

  if (!indexesEnsured) {
    try {
      await collection.createIndex({ path: 1 }, { unique: true });
      indexesEnsured = true;
    } catch (err) {
      console.error('Failed to create unique index on pads.path:', err);
    }
  }

  return collection;
}

/**
 * Sanitizes and formats a pad document for client consumption.
 */
function serializePad(doc) {
  if (!doc) return null;
  return {
    path: doc.path,
    content: doc.content ?? '',
    theme: doc.theme || 'light',
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
}

/**
 * Normalizes input and retrieves a pad document by its canonical path.
 * If not found, returns null without creating an empty document.
 * @param {string|string[]} rawPath
 * @returns {Promise<{ pad: object|null, normalizedPath: string, error?: string }>}
 */
export async function getPadByPath(rawPath) {
  const norm = typeof rawPath === 'string' ? normalizePathString(rawPath) : normalizePathString(rawPath.join('/'));

  if (!norm.isValid) {
    return { pad: null, normalizedPath: '', error: norm.error };
  }

  // Use MongoDB if configured
  if (process.env.MONGODB_URI) {
    try {
      const collection = await getPadsCollection();
      const doc = await collection.findOne(
        { path: norm.path },
        { projection: { path: 1, content: 1, theme: 1, createdAt: 1, updatedAt: 1, _id: 0 } }
      );
      return {
        pad: serializePad(doc),
        normalizedPath: norm.path,
      };
    } catch (err) {
      const formatted = formatDbError(err);
      console.error('MongoDB getPadByPath error:', formatted.message);
      throw formatted;
    }
  }

  // In-memory fallback
  const memDoc = memoryPadStore.get(norm.path);
  return {
    pad: serializePad(memDoc),
    normalizedPath: norm.path,
  };
}

/**
 * Saves/updates pad content.
 * CRITICAL RULE:
 * If the pad does not exist and content is empty/whitespace only,
 * it avoids creating empty documents to prevent bot or accidental sprawl.
 * @param {string|string[]} rawPath
 * @param {string} content
 * @param {string} [theme]
 * @returns {Promise<{ pad: object|null, skipped: boolean, normalizedPath: string, error?: string }>}
 */
export async function savePadContent(rawPath, content, theme) {
  const norm = typeof rawPath === 'string' ? normalizePathString(rawPath) : normalizePathString(rawPath.join('/'));

  if (!norm.isValid) {
    return { pad: null, skipped: false, normalizedPath: '', error: norm.error };
  }

  const text = content ?? '';
  const isMeaningful = text.trim().length > 0;
  const now = new Date();

  // Use MongoDB if configured
  if (process.env.MONGODB_URI) {
    try {
      const collection = await getPadsCollection();

      // Check if pad already exists using index-only scan (avoid loading document content)
      const existing = await collection.findOne(
        { path: norm.path },
        { projection: { _id: 1 } }
      );

      if (!existing && !isMeaningful) {
        // Do not create empty document for new pads
        return {
          pad: null,
          skipped: true,
          normalizedPath: norm.path,
        };
      }

      const setFields = {
        content: text,
        updatedAt: now,
      };
      if (theme === 'dark' || theme === 'light') {
        setFields.theme = theme;
      }

      // Upsert document
      const doc = await collection.findOneAndUpdate(
        { path: norm.path },
        {
          $set: setFields,
          $setOnInsert: {
            path: norm.path,
            createdAt: now,
            theme: theme === 'dark' ? 'dark' : 'light',
          },
        },
        {
          upsert: true,
          returnDocument: 'after',
          projection: { path: 1, content: 1, theme: 1, createdAt: 1, updatedAt: 1, _id: 0 },
        }
      );

      return {
        pad: serializePad(doc),
        skipped: false,
        normalizedPath: norm.path,
      };
    } catch (err) {
      const formatted = formatDbError(err);
      console.error('MongoDB savePadContent error:', formatted.message);
      throw formatted;
    }
  }

  // In-memory fallback
  const existingMem = memoryPadStore.get(norm.path);
  if (!existingMem && !isMeaningful) {
    return {
      pad: null,
      skipped: true,
      normalizedPath: norm.path,
    };
  }

  const updatedDoc = {
    path: norm.path,
    content: text,
    theme: (theme === 'dark' || theme === 'light') ? theme : (existingMem?.theme || 'light'),
    createdAt: existingMem ? existingMem.createdAt : now,
    updatedAt: now,
  };
  memoryPadStore.set(norm.path, updatedDoc);

  return {
    pad: serializePad(updatedDoc),
    skipped: false,
    normalizedPath: norm.path,
  };
}

/**
 * Saves/updates pad theme preference associated with its pad ID.
 * @param {string|string[]} rawPath
 * @param {string} theme
 * @returns {Promise<{ success: boolean, theme?: string, path?: string, error?: string }>}
 */
export async function savePadTheme(rawPath, theme) {
  const norm = typeof rawPath === 'string' ? normalizePathString(rawPath) : normalizePathString(rawPath.join('/'));

  if (!norm.isValid) {
    return { error: norm.error };
  }

  const cleanTheme = theme === 'dark' ? 'dark' : 'light';
  const now = new Date();

  if (process.env.MONGODB_URI) {
    try {
      const collection = await getPadsCollection();
      await collection.updateOne(
        { path: norm.path },
        {
          $set: { theme: cleanTheme, updatedAt: now },
          $setOnInsert: { path: norm.path, content: '', createdAt: now },
        },
        { upsert: true }
      );
      return { success: true, theme: cleanTheme, path: norm.path };
    } catch (err) {
      const formatted = formatDbError(err);
      console.error('MongoDB savePadTheme error:', formatted.message);
      throw formatted;
    }
  }

  // In-memory fallback
  const existingMem = memoryPadStore.get(norm.path);
  if (existingMem) {
    existingMem.theme = cleanTheme;
    existingMem.updatedAt = now;
  } else {
    memoryPadStore.set(norm.path, {
      path: norm.path,
      content: '',
      theme: cleanTheme,
      createdAt: now,
      updatedAt: now,
    });
  }

  return { success: true, theme: cleanTheme, path: norm.path };
}

/**
 * Retrieves the navigation context (parent, ancestors, siblings, children) for the current pad path.
 * Queries ONLY the paths needed for the current context. Does not load the full database.
 * @param {string|string[]} rawPath
 * @returns {Promise<object>}
 */
export async function getPadNavigationContext(rawPath) {
  const norm = typeof rawPath === 'string' ? normalizePathString(rawPath) : normalizePathString(rawPath.join('/'));

  if (!norm.isValid) {
    return {
      currentPath: '',
      parentPath: null,
      parentName: null,
      ancestors: [],
      siblings: [],
      children: [],
      error: norm.error,
    };
  }

  const currentPath = norm.path;
  const segments = norm.segments;

  // Compute Ancestors chain (for arbitrary nesting navigation: /a -> /a/b -> /a/b/c)
  const ancestors = [];
  let acc = '';
  for (let i = 0; i < segments.length - 1; i++) {
    acc += '/' + segments[i];
    ancestors.push({
      name: decodeSegmentSafe(segments[i]),
      path: acc,
    });
  }

  const parentPath = segments.length > 1 ? '/' + segments.slice(0, -1).join('/') : null;
  const parentName = segments.length > 1 ? decodeSegmentSafe(segments[segments.length - 2]) : null;

  // Immediate children regex
  const childRegex = new RegExp(`^${escapeRegex(currentPath)}/([^/]+)$`);

  // Siblings regex (children of parent, or top-level pads if at root)
  const siblingRegex = parentPath
    ? new RegExp(`^${escapeRegex(parentPath)}/([^/]+)$`)
    : new RegExp(`^/([^/]+)$`);

  let matchedPaths = [];

  if (process.env.MONGODB_URI) {
    try {
      const collection = await getPadsCollection();
      const queries = [{ path: childRegex }];
      if (siblingRegex) {
        queries.push({ path: siblingRegex });
      }

      const docs = await collection
        .find({ $or: queries }, { projection: { path: 1, _id: 0, updatedAt: 1 } })
        .limit(100)
        .toArray();

      matchedPaths = docs.map((d) => d.path);
    } catch (err) {
      const formatted = formatDbError(err);
      console.error('MongoDB getPadNavigationContext error:', formatted.message);
      matchedPaths = [];
    }
  } else {
    // In-memory fallback
    for (const key of memoryPadStore.keys()) {
      if (childRegex.test(key) || (siblingRegex && siblingRegex.test(key))) {
        matchedPaths.push(key);
      }
    }
  }

  const childPathsSet = new Set();
  const siblingPathsSet = new Set();

  for (const p of matchedPaths) {
    if (childRegex.test(p)) {
      childPathsSet.add(p);
    } else if (siblingRegex && siblingRegex.test(p)) {
      siblingPathsSet.add(p);
    }
  }

  // Always ensure current path is included in the siblings list
  if (siblingRegex && siblingRegex.test(currentPath)) {
    siblingPathsSet.add(currentPath);
  }

  const formatItem = (p) => {
    const parts = p.split('/').filter(Boolean);
    const lastSeg = parts[parts.length - 1] || '';
    return {
      path: p,
      name: decodeSegmentSafe(lastSeg),
      isActive: p === currentPath,
    };
  };

  const children = Array.from(childPathsSet)
    .map(formatItem)
    .sort((a, b) => a.name.localeCompare(b.name));

  const siblings = Array.from(siblingPathsSet)
    .map(formatItem)
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    currentPath,
    currentName: decodeSegmentSafe(norm.title),
    parentPath,
    parentName,
    ancestors,
    siblings,
    children,
  };
}

function decodeSegmentSafe(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Backward compatibility aliases
 */
export const updatePadContent = savePadContent;
export const createPad = savePadContent;

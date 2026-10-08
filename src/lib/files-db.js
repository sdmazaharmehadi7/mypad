import { getDb } from './mongodb.js';
import { normalizePathString } from './pad-path.js';
import crypto from 'crypto';

export const MAX_PAD_FILES_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB (5,242,880 bytes)
export const FILE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

let indexesEnsured = false;

// Shared global in-memory store for files if MONGODB_URI is not provided
if (!global._memoryPadFilesStore) {
  global._memoryPadFilesStore = new Map(); // key: fileId -> fileDoc
}
const memoryPadFilesStore = global._memoryPadFilesStore;

/**
 * Sanitizes original filename to prevent directory traversal or control characters.
 */
export function sanitizeFilename(rawFilename) {
  if (!rawFilename || typeof rawFilename !== 'string') {
    return 'attachment';
  }
  // Strip paths
  const base = rawFilename.split(/[/\\]/).pop() || 'attachment';
  // Replace illegal or control characters
  const cleaned = base.replace(/[\x00-\x1f\x7f<>:"/\\|?*]/g, '_').trim();
  return cleaned.slice(0, 255) || 'attachment';
}

/**
 * Formats MongoDB connection or network errors.
 */
function formatDbError(err) {
  if (err && typeof err.message === 'string') {
    if (err.message.includes('SSL alert') || err.message.includes('tlsv1 alert')) {
      const formatted = new Error(
        'MongoDB Atlas connection rejected (SSL / Network Access). Please ensure your IP address is whitelisted in MongoDB Atlas.'
      );
      formatted.originalError = err;
      return formatted;
    }
  }
  return err;
}

/**
 * Ensures indexes on the "pad_files" collection:
 * 1. { padPath: 1, expiresAt: 1 } for fast metadata querying and aggregation.
 * 2. { fileId: 1 } (unique) for fast lookup by file ID.
 * 3. { expiresAt: 1 } with expireAfterSeconds: 0 for automatic MongoDB TTL cleanup.
 */
export async function getFilesCollection() {
  const db = await getDb('mypad');
  const collection = db.collection('pad_files');

  if (!indexesEnsured) {
    try {
      await Promise.all([
        collection.createIndex({ padPath: 1, expiresAt: 1 }),
        collection.createIndex({ fileId: 1 }, { unique: true }),
        collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      ]);
      indexesEnsured = true;
    } catch (err) {
      console.error('Failed to create indexes on pad_files:', err);
    }
  }

  return collection;
}

/**
 * Formats file metadata document for client consumption (NEVER includes binary data).
 */
function serializeFileMetadata(doc) {
  if (!doc) return null;
  return {
    fileId: doc.fileId,
    padId: doc.padId || doc.padPath,
    padPath: doc.padPath,
    filename: doc.filename,
    mimeType: doc.mimeType || 'application/octet-stream',
    size: Number(doc.size) || 0,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    expiresAt: doc.expiresAt instanceof Date ? doc.expiresAt.toISOString() : doc.expiresAt,
  };
}

/**
 * Backend cleanup for expired files.
 * Opportunistically deletes expired files for this pad (or globally).
 */
export async function cleanupExpiredFiles(padPath = null) {
  const now = new Date();

  if (process.env.MONGODB_URI) {
    try {
      const collection = await getFilesCollection();
      const filter = { expiresAt: { $lte: now } };
      if (padPath) {
        filter.padPath = padPath;
      }
      await collection.deleteMany(filter);
    } catch (err) {
      console.error('Error during cleanupExpiredFiles:', err);
    }
    return;
  }

  // In-memory fallback
  for (const [id, doc] of memoryPadFilesStore.entries()) {
    if (new Date(doc.expiresAt) <= now) {
      if (!padPath || doc.padPath === padPath) {
        memoryPadFilesStore.delete(id);
      }
    }
  }
}

/**
 * Calculates current total file size (in bytes) for a pad without loading file binary data.
 * @param {string} rawPath
 * @returns {Promise<number>}
 */
export async function getPadTotalFilesSize(rawPath) {
  const norm = normalizePathString(rawPath);
  if (!norm.isValid) return 0;

  const now = new Date();

  if (process.env.MONGODB_URI) {
    try {
      const collection = await getFilesCollection();
      const result = await collection
        .aggregate([
          {
            $match: {
              padPath: norm.path,
              expiresAt: { $gt: now },
            },
          },
          {
            $group: {
              _id: null,
              totalSize: { $sum: '$size' },
            },
          },
        ])
        .toArray();

      return result.length > 0 && typeof result[0].totalSize === 'number'
        ? result[0].totalSize
        : 0;
    } catch (err) {
      console.error('getPadTotalFilesSize error:', formatDbError(err).message);
      throw formatDbError(err);
    }
  }

  // In-memory fallback
  let total = 0;
  for (const doc of memoryPadFilesStore.values()) {
    if (doc.padPath === norm.path && new Date(doc.expiresAt) > now) {
      total += Number(doc.size) || 0;
    }
  }
  return total;
}

/**
 * Retrieves all file metadata for a pad.
 * CRITICAL: NEVER loads or returns the binary "data" field.
 * @param {string} rawPath
 * @returns {Promise<{ files: Array, totalSize: number, error?: string }>}
 */
export async function getPadFilesMetadata(rawPath) {
  const norm = normalizePathString(rawPath);
  if (!norm.isValid) {
    return { files: [], totalSize: 0, error: norm.error };
  }

  // Opportunistic cleanup of expired files for this pad
  await cleanupExpiredFiles(norm.path);

  const now = new Date();

  if (process.env.MONGODB_URI) {
    try {
      const collection = await getFilesCollection();
      // Strictly project metadata fields only — NEVER include "data"
      const docs = await collection
        .find(
          {
            padPath: norm.path,
            expiresAt: { $gt: now },
          },
          {
            projection: {
              fileId: 1,
              padId: 1,
              padPath: 1,
              filename: 1,
              mimeType: 1,
              size: 1,
              createdAt: 1,
              expiresAt: 1,
              _id: 0,
            },
            sort: { createdAt: -1 },
          }
        )
        .toArray();

      const files = docs.map(serializeFileMetadata);
      const totalSize = files.reduce((acc, f) => acc + f.size, 0);

      return { files, totalSize };
    } catch (err) {
      console.error('getPadFilesMetadata error:', formatDbError(err).message);
      throw formatDbError(err);
    }
  }

  // In-memory fallback
  const files = [];
  let totalSize = 0;
  for (const doc of memoryPadFilesStore.values()) {
    if (doc.padPath === norm.path && new Date(doc.expiresAt) > now) {
      const meta = serializeFileMetadata(doc);
      files.push(meta);
      totalSize += meta.size;
    }
  }
  files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { files, totalSize };
}

/**
 * Saves multiple uploaded files for a pad.
 * Enforces the strict 5 MB total pad size limit on the backend.
 * @param {string} rawPath
 * @param {Array<{ filename: string, mimeType: string, buffer: Buffer }>} filesToSave
 * @returns {Promise<{ savedFiles: Array, totalSize: number, error?: string }>}
 */
export async function savePadFiles(rawPath, filesToSave) {
  const norm = normalizePathString(rawPath);
  if (!norm.isValid) {
    return { savedFiles: [], totalSize: 0, error: norm.error };
  }

  if (!Array.isArray(filesToSave) || filesToSave.length === 0) {
    return { savedFiles: [], totalSize: 0, error: 'No files provided for upload.' };
  }

  // Opportunistic cleanup of expired files
  await cleanupExpiredFiles(norm.path);

  // 1. Calculate the byte size of newly incoming files (measured on backend)
  let incomingBatchSize = 0;
  for (const file of filesToSave) {
    if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
      return { savedFiles: [], totalSize: 0, error: 'Invalid file buffer provided.' };
    }
    incomingBatchSize += file.buffer.length;
  }

  if (incomingBatchSize > MAX_PAD_FILES_SIZE_BYTES) {
    const attemptedMb = (incomingBatchSize / (1024 * 1024)).toFixed(2);
    return {
      savedFiles: [],
      totalSize: 0,
      error: `Upload rejected: selected files (${attemptedMb} MB) exceed the maximum allowed pad limit of 5.0 MB.`,
    };
  }

  // 2. Fetch current total files size without loading binary data
  const currentTotalSize = await getPadTotalFilesSize(norm.path);
  const newTotalSize = currentTotalSize + incomingBatchSize;

  if (newTotalSize > MAX_PAD_FILES_SIZE_BYTES) {
    const currentMb = (currentTotalSize / (1024 * 1024)).toFixed(2);
    const attemptedMb = (incomingBatchSize / (1024 * 1024)).toFixed(2);
    const availableKb = Math.max(0, Math.floor((MAX_PAD_FILES_SIZE_BYTES - currentTotalSize) / 1024));
    return {
      savedFiles: [],
      totalSize: currentTotalSize,
      error: `Upload rejected: pad currently uses ${currentMb} MB. Adding ${attemptedMb} MB would exceed the 5.0 MB limit (${availableKb} KB remaining).`,
    };
  }

  // 3. Prepare documents to insert
  const now = new Date();
  const expiresAt = new Date(now.getTime() + FILE_EXPIRATION_MS);

  const docsToInsert = filesToSave.map((f) => {
    const fileId = crypto.randomUUID();
    const cleanFilename = sanitizeFilename(f.filename);
    const mimeType = f.mimeType && typeof f.mimeType === 'string' ? f.mimeType : 'application/octet-stream';

    return {
      fileId,
      padId: norm.path,
      padPath: norm.path,
      filename: cleanFilename,
      mimeType,
      size: f.buffer.length,
      data: f.buffer, // Binary data stored in MongoDB
      createdAt: now,
      expiresAt,
    };
  });

  if (process.env.MONGODB_URI) {
    try {
      const collection = await getFilesCollection();
      await collection.insertMany(docsToInsert);
      const savedFiles = docsToInsert.map(serializeFileMetadata);
      return { savedFiles, totalSize: newTotalSize };
    } catch (err) {
      console.error('savePadFiles error:', formatDbError(err).message);
      throw formatDbError(err);
    }
  }

  // In-memory fallback
  for (const doc of docsToInsert) {
    memoryPadFilesStore.set(doc.fileId, doc);
  }
  const savedFiles = docsToInsert.map(serializeFileMetadata);
  return { savedFiles, totalSize: newTotalSize };
}

/**
 * Fetches a single specific file for download.
 * Security: strictly validates matching padPath and fileId to prevent cross-pad access.
 * Validates expiration timestamp.
 * @param {string} rawPath
 * @param {string} fileId
 * @returns {Promise<{ file: object|null, error?: string }>}
 */
export async function getPadFileForDownload(rawPath, fileId) {
  const norm = normalizePathString(rawPath);
  if (!norm.isValid) {
    return { file: null, error: norm.error };
  }

  if (!fileId || typeof fileId !== 'string') {
    return { file: null, error: 'Invalid file ID.' };
  }

  const now = new Date();

  if (process.env.MONGODB_URI) {
    try {
      const collection = await getFilesCollection();
      // Ensure file matches BOTH fileId AND padPath, and has not expired
      const doc = await collection.findOne({
        fileId,
        padPath: norm.path,
        expiresAt: { $gt: now },
      });

      if (!doc) {
        return { file: null, error: 'File not found or expired.' };
      }

      // Convert MongoDB Binary/Buffer if needed
      const buffer = Buffer.isBuffer(doc.data)
        ? doc.data
        : doc.data && doc.data.buffer
        ? Buffer.from(doc.data.buffer)
        : Buffer.from(doc.data);

      return {
        file: {
          fileId: doc.fileId,
          padPath: doc.padPath,
          padId: doc.padId || doc.padPath,
          filename: doc.filename,
          mimeType: doc.mimeType || 'application/octet-stream',
          size: Number(doc.size) || buffer.length,
          data: buffer,
          createdAt: doc.createdAt,
          expiresAt: doc.expiresAt,
        },
      };
    } catch (err) {
      console.error('getPadFileForDownload error:', formatDbError(err).message);
      throw formatDbError(err);
    }
  }

  // In-memory fallback
  const doc = memoryPadFilesStore.get(fileId);
  if (!doc || doc.padPath !== norm.path || new Date(doc.expiresAt) <= now) {
    return { file: null, error: 'File not found or expired.' };
  }

  return {
    file: {
      fileId: doc.fileId,
      padPath: doc.padPath,
      padId: doc.padId || doc.padPath,
      filename: doc.filename,
      mimeType: doc.mimeType || 'application/octet-stream',
      size: Number(doc.size) || doc.data.length,
      data: doc.data,
      createdAt: doc.createdAt,
      expiresAt: doc.expiresAt,
    },
  };
}

/**
 * Deletes a single specific file by file ID and pad path.
 * Security: requires both padPath and fileId.
 * @param {string} rawPath
 * @param {string} fileId
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function deletePadFile(rawPath, fileId) {
  const norm = normalizePathString(rawPath);
  if (!norm.isValid) {
    return { success: false, error: norm.error };
  }

  if (!fileId || typeof fileId !== 'string') {
    return { success: false, error: 'Invalid file ID.' };
  }

  if (process.env.MONGODB_URI) {
    try {
      const collection = await getFilesCollection();
      const res = await collection.deleteOne({
        fileId,
        padPath: norm.path,
      });

      if (res.deletedCount === 0) {
        return { success: false, error: 'File not found or already deleted.' };
      }

      return { success: true };
    } catch (err) {
      console.error('deletePadFile error:', formatDbError(err).message);
      throw formatDbError(err);
    }
  }

  // In-memory fallback
  const doc = memoryPadFilesStore.get(fileId);
  if (!doc || doc.padPath !== norm.path) {
    return { success: false, error: 'File not found or already deleted.' };
  }

  memoryPadFilesStore.delete(fileId);
  return { success: true };
}

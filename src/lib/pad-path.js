/**
 * Utility for parsing, safely decoding, normalizing, and validating MyPad paths.
 */

const RESERVED_PREFIXES = new Set([
  '_next',
  'api',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'features',
  'how-it-works',
  'use-cases',
  'for-students',
  'for-developers',
  'online-notepad',
]);

// Disallowed control characters and path traversal patterns
const FORBIDDEN_PATTERN = /[\x00-\x1F\x7F<>:"\\|?*\^]/;

/**
 * Normalizes and validates an array of route path segments.
 * @param {string[]|string|undefined} rawSlug
 * @returns {{ isValid: boolean, path: string, segments: string[], title: string, error?: string }}
 */
export function normalizePadSegments(rawSlug) {
  if (!rawSlug) {
    return {
      isValid: false,
      path: '',
      segments: [],
      title: '',
      error: 'Empty pad path.',
    };
  }

  const rawSegments = Array.isArray(rawSlug) ? rawSlug : [rawSlug];

  if (rawSegments.length === 0) {
    return {
      isValid: false,
      path: '',
      segments: [],
      title: '',
      error: 'Empty pad path.',
    };
  }

  // Enforce reasonable maximum depth (e.g. 10 nested levels)
  if (rawSegments.length > 10) {
    return {
      isValid: false,
      path: '',
      segments: [],
      title: '',
      error: 'Pad path exceeds maximum nesting depth.',
    };
  }

  const decodedSegments = [];

  for (let i = 0; i < rawSegments.length; i++) {
    const raw = rawSegments[i];

    if (typeof raw !== 'string') {
      return {
        isValid: false,
        path: '',
        segments: [],
        title: '',
        error: 'Invalid segment type.',
      };
    }

    // Safely decode URL-encoded sequences (handles %20, unicode, etc.)
    let decoded;
    try {
      decoded = decodeURIComponent(raw).trim();
    } catch {
      return {
        isValid: false,
        path: '',
        segments: [],
        title: '',
        error: `Malformed URL encoding in segment: "${raw}".`,
      };
    }

    // Disallow empty segments after trim
    if (!decoded) {
      return {
        isValid: false,
        path: '',
        segments: [],
        title: '',
        error: 'Pad path cannot contain empty segments.',
      };
    }

    // Disallow path traversal attempts
    if (decoded === '.' || decoded === '..' || decoded.includes('..')) {
      return {
        isValid: false,
        path: '',
        segments: [],
        title: '',
        error: 'Path traversal sequences (".." or ".") are not allowed.',
      };
    }

    // Disallow forbidden control characters
    if (FORBIDDEN_PATTERN.test(decoded)) {
      return {
        isValid: false,
        path: '',
        segments: [],
        title: '',
        error: 'Segment contains illegal or unsafe characters.',
      };
    }

    // Check segment length (prevent buffer/abuse)
    if (decoded.length > 120) {
      return {
        isValid: false,
        path: '',
        segments: [],
        title: '',
        error: 'Segment length exceeds 120 characters limit.',
      };
    }

    decodedSegments.push(decoded);
  }

  // Check reserved system prefixes
  const firstSegment = decodedSegments[0].toLowerCase();
  if (RESERVED_PREFIXES.has(firstSegment)) {
    return {
      isValid: false,
      path: '',
      segments: [],
      title: '',
      error: `"${firstSegment}" is a reserved system path and cannot be used as a pad.`,
    };
  }

  // Construct normalized canonical path: /segment1/segment2
  const canonicalPath = '/' + decodedSegments.join('/');
  const title = decodedSegments[decodedSegments.length - 1];

  return {
    isValid: true,
    path: canonicalPath,
    segments: decodedSegments,
    title,
  };
}

/**
 * Normalizes a raw string path (e.g. "/college/ml" or "project/backend")
 * @param {string} pathString
 * @returns {{ isValid: boolean, path: string, segments: string[], title: string, error?: string }}
 */
export function normalizePathString(pathString) {
  if (!pathString || typeof pathString !== 'string') {
    return {
      isValid: false,
      path: '',
      segments: [],
      title: '',
      error: 'Path must be a non-empty string.',
    };
  }

  const rawSegments = pathString.split('/').filter(Boolean);
  return normalizePadSegments(rawSegments);
}

/**
 * Generates breadcrumb metadata for navigation up the nested path hierarchy.
 * @param {string[]} segments
 * @returns {Array<{ label: string, href: string, isLast: boolean }>}
 */
export function getPadBreadcrumbs(segments) {
  let accumulated = '';
  return segments.map((seg, idx) => {
    accumulated += '/' + encodeURIComponent(seg);
    return {
      label: seg,
      href: accumulated,
      isLast: idx === segments.length - 1,
    };
  });
}

/**
 * Validates a pad path string or segment array.
 * @param {string|string[]} pathInput
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validatePadPath(pathInput) {
  const parsed = Array.isArray(pathInput)
    ? normalizePadSegments(pathInput)
    : normalizePathString(pathInput);
  return {
    isValid: parsed.isValid,
    error: parsed.error,
  };
}

/**
 * Parses a pad path string or segment array and extracts canonical path, room, and segments.
 * @param {string|string[]} pathInput
 * @returns {{ isValid: boolean, path: string, room: string, segments: string[], title: string, error?: string }}
 */
export function parsePadPath(pathInput) {
  const parsed = Array.isArray(pathInput)
    ? normalizePadSegments(pathInput)
    : normalizePathString(pathInput);
  return {
    ...parsed,
    // Canonical room without leading slash (e.g. "college/ml")
    room: parsed.segments.join('/'),
  };
}

/**
 * Normalizes a pad path to its canonical representation (e.g. "/college/ml").
 * Returns an empty string if the path is invalid.
 * @param {string|string[]} pathInput
 * @returns {string}
 */
export function normalizePadPath(pathInput) {
  const parsed = parsePadPath(pathInput);
  return parsed.isValid ? parsed.path : '';
}

import DOMPurify from 'dompurify';

/**
 * Basic fallback regex sanitizer for server-side or non-browser environments.
 */
function fallbackSanitize(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Sanitizes pasted HTML content to prevent XSS attacks while preserving
 * meaningful semantic document tags (headings, bold, lists, links, code, etc.).
 */
export function sanitizeHtml(dirtyHtml) {
  if (!dirtyHtml) return '';

  if (typeof window === 'undefined') {
    return fallbackSanitize(dirtyHtml);
  }

  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'b', 'strong', 'i', 'em', 'u', 's', 'del', 'strike',
      'ul', 'ol', 'li',
      'a', 'blockquote', 'hr', 'pre', 'code', 'br',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'data-type', 'data-checked'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|\/)/i,
    FORBID_TAGS: [
      'script', 'iframe', 'object', 'embed', 'style', 'form', 'input', 'textarea',
      'link', 'meta', 'applet', 'base', 'frame', 'frameset',
    ],
    FORBID_ATTR: [
      'style', 'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur',
      'onkeydown', 'onkeypress', 'onkeyup',
    ],
  });
}

/**
 * Validates URLs for hyperlinks. Disallows javascript: or data: URIs.
 */
export function isValidUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();

  // Allow relative paths starting with /
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;

  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://mypad-org.vercel.app';
    const url = new URL(trimmed, base);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol);
  } catch {
    return false;
  }
}

/**
 * Helper utilities for serializing, deserializing, and normalizing MyPad document content.
 * Guarantees backward compatibility with existing plain-text pads.
 */

/**
 * Converts stored pad content (which can be a Tiptap JSON string or legacy plain text)
 * into a valid Tiptap document JSON object.
 */
export function contentToDoc(raw) {
  if (!raw) {
    return {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    };
  }

  // Already a Tiptap JSON object
  if (typeof raw === 'object' && raw?.type === 'doc') {
    return raw;
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      return {
        type: 'doc',
        content: [{ type: 'paragraph' }],
      };
    }

    // Try parsing as Tiptap JSON
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && parsed.type === 'doc' && Array.isArray(parsed.content)) {
          return parsed;
        }
      } catch {
        // Not a JSON document - fall back to plain text parsing
      }
    }

    // Legacy plain text: split into paragraphs preserving line breaks
    const lines = raw.split(/\r?\n/);
    const content = lines.map((line) => {
      if (!line) {
        return { type: 'paragraph' };
      }
      return {
        type: 'paragraph',
        content: [{ type: 'text', text: line }],
      };
    });

    return {
      type: 'doc',
      content: content.length > 0 ? content : [{ type: 'paragraph' }],
    };
  }

  return {
    type: 'doc',
    content: [{ type: 'paragraph' }],
  };
}

/**
 * Checks whether a Tiptap document is essentially empty (no text, no code, no items).
 */
export function isDocEmpty(doc) {
  if (!doc || !doc.content || doc.content.length === 0) return true;
  if (
    doc.content.length === 1 &&
    doc.content[0].type === 'paragraph' &&
    (!doc.content[0].content || doc.content[0].content.length === 0)
  ) {
    return true;
  }
  return false;
}

/**
 * Fast zero-allocation word counter for raw text.
 */
export function countWords(str) {
  if (!str) return 0;
  let count = 0;
  let inWord = false;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code <= 32 && (code === 32 || code === 10 || code === 13 || code === 9)) {
      inWord = false;
    } else if (!inWord) {
      inWord = true;
      count++;
    }
  }
  return count;
}

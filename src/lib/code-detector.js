/**
 * Conservative code detector for MyPad.
 * Supports at minimum: Java, JavaScript, TypeScript, Python, C, C++, HTML, CSS, SQL, JSON, Bash.
 *
 * CRITICAL RULE:
 * Do NOT convert normal sentences/paragraphs into code.
 * Only detect as code when clear programming structural evidence exists.
 */

const COMMON_EXTENSIONS = {
  js: 'javascript',
  javascript: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  tsx: 'typescript',
  py: 'python',
  python: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  'c++': 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  h: 'c',
  hpp: 'cpp',
  html: 'xml',
  xml: 'xml',
  css: 'css',
  scss: 'css',
  less: 'css',
  sql: 'sql',
  json: 'json',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  shell: 'bash',
};

export function normalizeLanguage(lang) {
  if (!lang) return null;
  const clean = lang.toLowerCase().trim();
  return COMMON_EXTENSIONS[clean] || clean;
}

/**
 * Checks if a string is a markdown-style fenced code block:
 * ```lang
 * code
 * ```
 */
export function extractFencedCode(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();

  // Match ```lang\ncode\n``` or ```\ncode\n``` or unclosed ```lang\ncode
  const match = trimmed.match(/^```([a-zA-Z0-9_+#.-]*)\s*\n([\s\S]*?)(?:\n?```)?$/);
  if (match) {
    const rawLang = match[1] || '';
    const code = match[2];
    return {
      isFenced: true,
      language: normalizeLanguage(rawLang) || 'generic',
      code: code.replace(/\n?```$/, ''),
    };
  }
  return null;
}

/**
 * Conservative heuristic code detection.
 * Returns { isCode: boolean, language: string }
 */
export function detectCode(text) {
  if (!text || typeof text !== 'string') return { isCode: false, language: 'plaintext' };

  const trimmed = text.trim();

  // Too short to reliably detect as code (avoids detecting single words/short phrases)
  if (trimmed.length < 14) {
    return { isCode: false, language: 'plaintext' };
  }

  const lines = trimmed.split('\n');

  // 1. JSON
  // Must start with { or [ and end with } or ]
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null) {
        const hasKeys = Object.keys(parsed).length > 0;
        if (lines.length >= 2 || hasKeys) {
          return { isCode: true, language: 'json' };
        }
      }
    } catch {
      // Not valid JSON
    }
  }

  // 2. HTML / XML
  if (
    trimmed.startsWith('<!DOCTYPE html>') ||
    trimmed.startsWith('<!doctype html>') ||
    (trimmed.startsWith('<html') && trimmed.includes('</html>'))
  ) {
    return { isCode: true, language: 'xml' };
  }

  const htmlTagPattern = /<\/?(?:div|span|button|input|form|table|thead|tbody|tr|td|script|template|header|footer|nav|section|article|p|h[1-6]|a|img|ul|ol|li)(?:\s+[^>]*>|>)/i;
  const htmlTagMatches = (trimmed.match(new RegExp(htmlTagPattern.source, 'gi')) || []).length;
  if (htmlTagMatches >= 2 && trimmed.includes('<') && trimmed.includes('>')) {
    return { isCode: true, language: 'xml' };
  }

  // 3. Bash / Shell script
  if (
    trimmed.startsWith('#!/bin/bash') ||
    trimmed.startsWith('#!/bin/sh') ||
    trimmed.startsWith('#!/usr/bin/env bash')
  ) {
    return { isCode: true, language: 'bash' };
  }

  const bashCommandPatterns = [
    /^\s*(?:sudo\s+)?(?:apt-get|apt|yum|dnf|pacman|brew)\s+(?:install|update|upgrade)/m,
    /^\s*(?:npm|pnpm|yarn|bun)\s+(?:run|install|i|add|test|build|start|dev|create)\b/m,
    /^\s*pip\s+(?:install|uninstall|freeze)\b/m,
    /^\s*git\s+(?:commit|checkout|pull|push|branch|status|rebase|clone|add|diff|merge)\b/m,
    /^\s*docker\s+(?:run|build|compose|ps|stop|exec)\b/m,
    /^\s*curl\s+-[A-Za-z]/m,
    /^\s*export\s+[A-Z_0-9]+=/m,
  ];

  for (const pat of bashCommandPatterns) {
    if (pat.test(trimmed)) {
      return { isCode: true, language: 'bash' };
    }
  }

  // 4. SQL
  const sqlPatterns = [
    /\bSELECT\s+.+\s+FROM\s+/i,
    /\bINSERT\s+INTO\s+.+\s+VALUES/i,
    /\bCREATE\s+TABLE\s+/i,
    /\bALTER\s+TABLE\s+/i,
    /\bUPDATE\s+.+\s+SET\s+/i,
    /\bDELETE\s+FROM\s+/i,
  ];
  for (const pat of sqlPatterns) {
    if (pat.test(trimmed)) {
      return { isCode: true, language: 'sql' };
    }
  }

  // 5. Java
  const javaSpecificPatterns = [
    /public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]/m,
    /System\.out\.println\s*\(/m,
    /public\s+(?:class|interface|enum)\s+[A-Z]\w*/m,
    /@Override\s*\n\s*(?:public|protected|private)/m,
    /import\s+java\.[a-z.]+\s*;/m,
    /public\s+(?:void|int|String|boolean|double|float)\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*\{/m,
  ];
  for (const pat of javaSpecificPatterns) {
    if (pat.test(trimmed)) {
      return { isCode: true, language: 'java' };
    }
  }

  // 6. C / C++
  const cCppPatterns = [
    /#include\s*<[a-z0-9_.]+>/i,
    /\bstd::(?:cout|cin|endl|vector|string|map|unique_ptr|shared_ptr)\b/,
    /\bint\s+main\s*\(\s*(?:int\s+argc|void)?\s*\)/,
    /\bprintf\s*\(\s*".*"\s*[,)]/,
    /\bcout\s*<<\s*/,
  ];
  for (const pat of cCppPatterns) {
    if (pat.test(trimmed)) {
      const isCpp =
        trimmed.includes('std::') ||
        trimmed.includes('<iostream>') ||
        trimmed.includes('<vector>') ||
        trimmed.includes('class ') ||
        trimmed.includes('namespace ');
      return { isCode: true, language: isCpp ? 'cpp' : 'c' };
    }
  }

  // 7. Python
  const pythonPatterns = [
    /^\s*def\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*:/m,
    /^\s*class\s+[a-zA-Z_]\w*(?:\([^)]*\))?\s*:/m,
    /if\s+__name__\s*==\s*['"]__main__['"]\s*:/m,
    /^\s*import\s+[a-zA-Z_]\w*(?:\s+as\s+[a-zA-Z_]\w*)?$/m,
    /^\s*from\s+[a-zA-Z_.]+\s+import\s+[a-zA-Z_*]+/m,
    /print\s*\(\s*f?['"].*['"]\s*\)/m,
    /^\s*elif\s+.+:/m,
  ];
  let pythonMatches = 0;
  for (const pat of pythonPatterns) {
    if (pat.test(trimmed)) pythonMatches++;
  }
  if (
    pythonMatches >= 2 ||
    (pythonMatches === 1 && (trimmed.includes(':') && (trimmed.includes('    ') || trimmed.includes('\t') || lines.length >= 2)))
  ) {
    return { isCode: true, language: 'python' };
  }

  // 8. CSS
  const cssPattern = /^\s*(?:[.#]?[a-zA-Z0-9_-]+|@[a-zA-Z-]+)\s*\{\s*\n?(?:\s*[a-zA-Z-]+:\s*[^;]+;\s*\n?)+\s*\}/m;
  if (
    cssPattern.test(trimmed) &&
    trimmed.includes('{') &&
    trimmed.includes('}') &&
    trimmed.includes(':') &&
    trimmed.includes(';')
  ) {
    return { isCode: true, language: 'css' };
  }

  // 9. JavaScript / TypeScript
  const jsTsPatterns = [
    /^\s*import\s+.+\s+from\s+['"][^'"]+['"]/m,
    /^\s*export\s+(?:default\s+)?(?:function|const|class|let|type|interface)\b/m,
    /^\s*const\s+\w+\s*=\s*(?:require\(|\([^)]*\)\s*=>)/m,
    /\bconsole\.(?:log|error|warn|info)\s*\(/m,
    /\bdocument\.(?:querySelector|getElementById|addEventListener)\s*\(/m,
    /^\s*interface\s+[A-Z]\w*\s*\{/m,
    /^\s*type\s+[A-Z]\w*\s*=\s*/m,
    /\b(?:const|let|var)\s+(?:\{[^}]+\}|\[[^\]]+\]|[a-zA-Z_$]\w*)\s*=\s*.+/m,
    /function\s+[a-zA-Z_$]\w*\s*\([^)]*\)\s*\{/m,
    /for\s*\(\s*(?:let|var|const)\s+.+;\s*.+;\s*.+\)/m,
  ];

  let jsMatches = 0;
  for (const pat of jsTsPatterns) {
    if (pat.test(trimmed)) jsMatches++;
  }

  const isTypeScript =
    trimmed.includes(': string') ||
    trimmed.includes(': number') ||
    trimmed.includes(': boolean') ||
    trimmed.includes('interface ') ||
    trimmed.includes('type ') ||
    trimmed.includes('as const');

  if (
    jsMatches >= 2 ||
    (jsMatches === 1 &&
      (trimmed.includes('=>') ||
        trimmed.includes('function') ||
        trimmed.includes('return ') ||
        trimmed.includes('{') ||
        trimmed.includes(';')))
  ) {
    return { isCode: true, language: isTypeScript ? 'typescript' : 'javascript' };
  }

  // 10. Generic Code Fallback:
  // If the text has strong structural coding hallmarks (multi-line indentation with curly braces or semicolons)
  // but doesn't match an exact language, use safe generic highlighting rather than incorrectly guessing
  const hasBraces = trimmed.includes('{') && trimmed.includes('}');
  const hasIndentedLines = lines.some((l) => /^( {2,}|\t)[a-zA-Z0-9_$]/.test(l));
  const hasSemicolons = (trimmed.match(/;\s*$/m) || []).length >= 2;

  if (lines.length >= 3 && hasBraces && (hasIndentedLines || hasSemicolons)) {
    return { isCode: true, language: 'generic' };
  }

  // Default: Keep as normal prose / paragraphs
  return { isCode: false, language: 'plaintext' };
}

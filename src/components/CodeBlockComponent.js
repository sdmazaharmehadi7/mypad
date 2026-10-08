'use client';

import { useState } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';

export default function CodeBlockComponent({ node }) {
  const [copied, setCopied] = useState(false);
  const rawLang = node.attrs?.language || '';

  const formatLanguageLabel = (lang) => {
    if (!lang || lang === 'plaintext' || lang === 'generic') return 'code';
    const lower = lang.toLowerCase();
    if (lower === 'xml') return 'html';
    if (lower === 'cpp') return 'c++';
    if (lower === 'javascript') return 'javascript';
    if (lower === 'typescript') return 'typescript';
    if (lower === 'python') return 'python';
    if (lower === 'java') return 'java';
    if (lower === 'bash') return 'bash';
    if (lower === 'sql') return 'sql';
    if (lower === 'json') return 'json';
    if (lower === 'css') return 'css';
    if (lower === 'c') return 'c';
    return lower;
  };

  const displayLanguage = formatLanguageLabel(rawLang);

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Copy only original code content - no HTML or markup
    const codeContent = node.textContent;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codeContent).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <NodeViewWrapper className="code-block-container my-3 sm:my-3.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121214] text-zinc-900 dark:text-zinc-100 overflow-hidden shadow-2xs select-auto transition-colors">
      {/* Code Header Bar: Language label + code icon on left, Copy button on right */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-100/90 dark:bg-[#18181b] border-b border-zinc-200/80 dark:border-zinc-800 text-xs font-mono select-none transition-colors">
        <div className="flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
            />
          </svg>
          <span className="text-zinc-600 dark:text-zinc-400 font-medium text-[11px] lowercase tracking-wide">
            {displayLanguage}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-sans font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-white dark:bg-zinc-800/90 hover:bg-zinc-200/70 dark:hover:bg-zinc-700 border border-zinc-200/80 dark:border-zinc-700/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 shadow-3xs"
        >
          {copied ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Copied
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
              Copy
            </span>
          )}
        </button>
      </div>

      {/* Code Text Content: preserved whitespace, horizontal scroll, monospace font */}
      <pre className="p-3 sm:p-3.5 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed whitespace-pre pad-scrollbar">
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
}

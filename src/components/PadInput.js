'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

const SUGGESTIONS = ['notes', 'standup', 'project/api', 'college/math'];

const subscribe = () => () => {};
const getSnapshot = () => window.location.host;
const getServerSnapshot = () => 'mypad.vercel.app';

export default function PadInput() {
  const [padSlug, setPadSlug] = useState('');
  const [feedback, setFeedback] = useState(null);
  const router = useRouter();
  const hostName = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const sanitizeInput = (val) => {
    // Remove leading slash if typed, allow alphanumeric, hyphens, underscores and forward slashes for nesting
    return val
      .replace(/^\/+/, '')
      .replace(/[^a-zA-Z0-9_\-\/]/g, '-')
      .replace(/\/+/g, '/');
  };

  const handleInputChange = (e) => {
    const clean = sanitizeInput(e.target.value);
    setPadSlug(clean);
    if (feedback) setFeedback(null);
  };

  const handleSuggestionClick = (suggestion) => {
    setPadSlug(suggestion);
    setFeedback(null);
    router.push(`/${suggestion}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const target = padSlug.trim();
    if (!target) {
      setFeedback({
        type: 'error',
        message: 'Please enter a pad name to continue (e.g., notes or project/backend).',
      });
      return;
    }

    router.push(`/${target}`);
  };

  return (
    <div id="pad-entry" className="w-full max-w-xl mx-auto scroll-mt-24">
      <form onSubmit={handleSubmit} className="relative group">
        <label htmlFor="pad-path-input" className="sr-only">
          Desired pad name or nested path
        </label>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-xl border border-zinc-200 shadow-xs hover:border-zinc-300 focus-within:border-zinc-950 focus-within:ring-2 focus-within:ring-zinc-950/5 transition-all p-1.5 sm:p-2 gap-2">
          {/* Host Prefix */}
          <div className="flex items-center pl-3 pr-2 py-1.5 sm:py-0 text-zinc-400 select-none text-xs sm:text-sm font-mono tracking-tight shrink-0 border-b sm:border-b-0 sm:border-r border-zinc-100 max-w-[200px] truncate">
            <span className="text-zinc-600 font-medium truncate">{hostName}</span>
            <span className="text-zinc-400 ml-0.5">/</span>
          </div>

          {/* Text Input */}
          <div className="relative flex-1 flex items-center">
            <input
              id="pad-path-input"
              type="text"
              value={padSlug}
              onChange={handleInputChange}
              placeholder="my-notes or project/backend"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className="w-full bg-transparent px-2.5 py-1.5 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none font-mono"
            />
            {padSlug && (
              <button
                type="button"
                onClick={() => {
                  setPadSlug('');
                  setFeedback(null);
                }}
                aria-label="Clear pad path"
                className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors mr-1 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm font-medium transition-all shadow-xs shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
          >
            <span>Open Pad</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </form>

      {/* Inline Feedback Banner */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="mt-2.5 px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between border bg-red-50 text-red-700 border-red-200"
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="ml-2 text-zinc-400 hover:text-zinc-600 focus-visible:outline-none"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Suggestions */}
      <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-500">
        <span className="text-zinc-400">Suggestions:</span>
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => handleSuggestionClick(suggestion)}
            className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
          >
            /{suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

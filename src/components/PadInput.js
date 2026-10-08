'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const SUGGESTIONS = [
  '/notes',
  '/standup',
  '/project',
  '/api',
  '/college',
  '/math',
];

export default function PadInput() {
  const [padSlug, setPadSlug] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isOpening, setIsOpening] = useState(false);
  const isNavigatingRef = useRef(false);
  const router = useRouter();

  // Prefetch suggestions on mount for instant mobile/desktop navigation
  useEffect(() => {
    SUGGESTIONS.forEach((s) => {
      const clean = s.replace(/^\/+/, '');
      router.prefetch(`/${clean}`);
    });
  }, [router]);

  // Reset loading state if user returns via BFCache (browser Back button)
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        setIsOpening(false);
        isNavigatingRef.current = false;
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const sanitizeInput = (val) => {
    // Allow leading slash, alphanumeric, hyphens, underscores and forward slashes
    return val
      .replace(/[^a-zA-Z0-9_\-\/]/g, '-')
      .replace(/\/+/g, '/');
  };

  const handleInputChange = (e) => {
    const clean = sanitizeInput(e.target.value);
    setPadSlug(clean);
    if (feedback) setFeedback(null);
    if (isOpening) {
      setIsOpening(false);
      isNavigatingRef.current = false;
    }

    // Prefetch candidate target if valid
    const target = clean.trim().replace(/^\/+/, '');
    if (target.length >= 2) {
      router.prefetch(`/${target}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (isNavigatingRef.current) return;

    const clean = suggestion.replace(/^\/+/, '');
    setPadSlug(suggestion);
    setFeedback(null);
    isNavigatingRef.current = true;
    setIsOpening(true);

    try {
      router.push(`/${clean}`);
    } catch {
      setIsOpening(false);
      isNavigatingRef.current = false;
    }
  };

  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    if (isNavigatingRef.current) return;

    const target = padSlug.trim().replace(/^\/+/, '');
    if (!target) {
      setFeedback('Please enter a pad name or nested path to open.');
      setIsOpening(false);
      isNavigatingRef.current = false;
      return;
    }

    // Immediately trigger loading feedback before navigation begins
    isNavigatingRef.current = true;
    setIsOpening(true);
    setFeedback(null);

    try {
      router.push(`/${target}`);
    } catch {
      setIsOpening(false);
      isNavigatingRef.current = false;
      setFeedback('Navigation failed. Please try again.');
    }
  }, [padSlug, router]);

  return (
    <div id="pad-entry" className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="relative group text-left">
        <label
          htmlFor="pad-path-input"
          className="block text-xs font-mono text-zinc-500 mb-2 font-medium"
        >
          Desired pad name or nested path
        </label>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-xl border border-zinc-200 shadow-xs hover:border-zinc-300 focus-within:border-zinc-950 focus-within:ring-2 focus-within:ring-zinc-950/5 transition-all p-1.5 sm:p-2 gap-2">
          {/* Text Input */}
          <div className="relative flex-1 flex items-center min-w-0">
            <input
              id="pad-path-input"
              type="text"
              value={padSlug}
              onChange={handleInputChange}
              disabled={isOpening}
              placeholder="/notes/standup/project"
              aria-label="Desired pad name or nested path"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className="w-full bg-transparent px-3 py-2 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none font-mono disabled:opacity-75"
            />
            {padSlug && !isOpening && (
              <button
                type="button"
                onClick={() => {
                  setPadSlug('');
                  setFeedback(null);
                }}
                aria-label="Clear pad path"
                className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors mr-1 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Primary Submit Button with Instant Loading State */}
          <button
            type="submit"
            disabled={isOpening}
            className="inline-flex items-center justify-center min-w-[108px] px-5 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 active:bg-zinc-900 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors shadow-xs shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
          >
            {isOpening ? (
              <span className="inline-flex items-center gap-1.5">
                <svg
                  className="animate-spin -ml-0.5 h-3.5 w-3.5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Opening...</span>
              </span>
            ) : (
              <span>Open Pad</span>
            )}
          </button>
        </div>
      </form>

      {/* Inline Feedback Banner */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="mt-2.5 px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between border bg-red-50 text-red-700 border-red-200 text-left"
        >
          <span>{feedback}</span>
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

      {/* Clickable Suggestions */}
      <div className="mt-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-500">
        <span className="text-zinc-400 font-mono">Suggestions:</span>
        {SUGGESTIONS.map((suggestion) => {
          const clean = suggestion.replace(/^\/+/, '');
          return (
            <button
              key={suggestion}
              type="button"
              disabled={isOpening}
              onMouseEnter={() => router.prefetch(`/${clean}`)}
              onFocus={() => router.prefetch(`/${clean}`)}
              onClick={() => handleSuggestionClick(suggestion)}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-700 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
            >
              {suggestion}
            </button>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

function PadHeader({
  canonicalPath,
  theme = 'light',
  onToggleTheme,
  breadcrumbs,
  saveStatus = 'Saved',
  onRetry,
  wordCount = 0,
  onToggleSidebar,
  isSidebarOpen = false,
  attachmentsCount = 0,
  onToggleAttachments,
  isAttachmentsOpen = false,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isSaved = saveStatus === 'Saved';
  const isSaving = saveStatus === 'Saving...';
  const isFailed = saveStatus === 'Unable to save';

  return (
    <header className="sticky top-0 z-20 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors">
      <div className="w-full px-3 sm:px-5 h-13 flex items-center justify-between gap-3">
        {/* Left: Sidebar Toggle + Brand + Breadcrumb Path */}
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          {/* Sidebar Toggle Button */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label={isSidebarOpen ? 'Close nested pad sidebar' : 'Open nested pad sidebar'}
              aria-expanded={isSidebarOpen}
              title={isSidebarOpen ? 'Close sidebar' : 'Open nested pad sidebar'}
              className={`p-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-400 shrink-0 ${
                isSidebarOpen
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 ring-1 ring-zinc-200 dark:ring-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </button>
          )}

          <Link
            href="/"
            className="flex items-center gap-2 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-400 rounded p-0.5"
            title="Return to MyPad Home"
          >
            <div className="w-6 h-6 rounded bg-zinc-950 dark:bg-zinc-900 dark:border dark:border-zinc-800 flex items-center justify-center text-white font-mono text-[11px] font-semibold group-hover:bg-zinc-800 transition-colors">
              M
            </div>
            <span className="hidden sm:inline font-semibold text-sm tracking-tight text-zinc-950 dark:text-zinc-100">
              MyPad
            </span>
          </Link>

          <span className="text-zinc-300 dark:text-zinc-700 font-mono text-sm select-none">/</span>

          {/* Breadcrumb Path Hierarchy */}
          <nav
            aria-label="Pad Breadcrumbs"
            className="flex items-center gap-1 font-mono text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 overflow-x-auto no-scrollbar py-1"
          >
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.href} className="flex items-center gap-1 shrink-0">
                {idx > 0 && <span className="text-zinc-300 dark:text-zinc-700 select-none">/</span>}
                {crumb.isLast ? (
                  <span className="font-semibold text-zinc-950 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-zinc-950 dark:hover:text-zinc-100 hover:underline transition-colors px-1 py-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-400"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Right: Stats, Theme Toggle, Save State Indicator & Share Button */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Word count & Save State */}
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">
            <span className="hidden sm:inline text-zinc-400 dark:text-zinc-500">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>

            {/* Subtle Save State Badge */}
            <div className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSaved
                    ? 'bg-emerald-500'
                    : isSaving
                    ? 'bg-zinc-400 animate-pulse'
                    : 'bg-red-500'
                }`}
                aria-hidden="true"
              />
              {isFailed ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="text-red-600 dark:text-red-400 hover:underline focus-visible:outline-none font-medium flex items-center gap-1"
                  title="Click to retry saving"
                >
                  <span>Unable to save</span>
                  <span className="text-[10px] text-zinc-400">(Retry)</span>
                </button>
              ) : (
                <span className={isSaving ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'}>
                  {saveStatus}
                </span>
              )}
            </div>
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

          {/* Pad-Specific Theme Toggle */}
          <ThemeToggle
            canonicalPath={canonicalPath}
            theme={theme}
            onToggle={onToggleTheme}
          />

          {/* Attachments Toggle Button */}
          {onToggleAttachments && (
            <button
              type="button"
              onClick={onToggleAttachments}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md border text-xs font-medium transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-400 ${
                isAttachmentsOpen
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
              }`}
              title={isAttachmentsOpen ? 'Close attachments' : 'View and attach files'}
              aria-expanded={isAttachmentsOpen}
              aria-label="Pad Attachments"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.37l-10.94 10.94a1.5 1.5 0 0 1-2.122-2.122l7.693-7.693" />
              </svg>
              <span className="hidden sm:inline">Files</span>
              {attachmentsCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold ${
                    isAttachmentsOpen
                      ? 'bg-zinc-800 text-zinc-100 dark:bg-zinc-300 dark:text-zinc-900'
                      : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  {attachmentsCount}
                </span>
              )}
            </button>
          )}

          {/* Share Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-400"
            title="Copy pad URL to share"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="text-emerald-700 dark:text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default memo(PadHeader);

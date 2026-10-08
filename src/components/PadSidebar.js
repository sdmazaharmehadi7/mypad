'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function PadSidebar({
  navContext,
  isOpen = false,
  onClose,
}) {
  const router = useRouter();
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [childSlug, setChildSlug] = useState('');
  const [copyPathFeedback, setCopyPathFeedback] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  const {
    currentPath = '',
    currentName = '',
    parentPath = null,
    parentName = null,
    ancestors = [],
    siblings = [],
    children = [],
  } = navContext || {};

  // Actions
  const handleCopyPath = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(currentPath);
        setCopyPathFeedback(true);
        setTimeout(() => setCopyPathFeedback(false), 2000);
      }
    } catch {
      setCopyPathFeedback(true);
      setTimeout(() => setCopyPathFeedback(false), 2000);
    }
  };

  const handleSharePad = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setShareFeedback(true);
        setTimeout(() => setShareFeedback(false), 2000);
      }
    } catch {
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2000);
    }
  };

  const handleCreateChildSubmit = (e) => {
    e.preventDefault();
    const clean = childSlug
      .trim()
      .replace(/^\/+/, '')
      .replace(/[^a-zA-Z0-9_\-\/]/g, '-')
      .replace(/\/+/g, '/');

    if (!clean) return;

    const targetUrl = `${currentPath}/${encodeURIComponent(clean)}`;
    setIsCreatingChild(false);
    setChildSlug('');
    if (onClose) onClose();
    router.push(targetUrl);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-zinc-950/20 dark:bg-black/60 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside Panel */}
      <aside
        aria-label="Pad Navigation Sidebar"
        aria-hidden={!isOpen}
        className={`fixed md:sticky top-13 z-30 md:z-10 h-[calc(100vh-3.25rem)] bg-zinc-50/70 dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 flex flex-col transition-all duration-200 ease-in-out shrink-0 overflow-hidden ${
          isOpen
            ? 'w-64 translate-x-0 opacity-100 border-r pointer-events-auto visible'
            : 'w-0 -translate-x-full md:translate-x-0 opacity-0 border-r-0 pointer-events-none invisible'
        }`}
      >
        <div className="w-64 h-full flex flex-col shrink-0">
          {/* Top Header & Actions Toolbar */}
          <div className="p-3 border-b border-zinc-200/60 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                Navigation
              </span>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-zinc-400 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
                  aria-label="Close sidebar"
                  title="Close sidebar"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

          {/* Quick Actions: New Child, Copy Path, Share */}
          <div className="grid grid-cols-3 gap-1 pt-1">
            <button
              type="button"
              onClick={() => setIsCreatingChild(!isCreatingChild)}
              className="inline-flex flex-col items-center justify-center p-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs text-[10px] font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
              title="Create a new child pad under current path"
            >
              <svg className="w-3.5 h-3.5 mb-0.5 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>+ Child</span>
            </button>

            <button
              type="button"
              onClick={handleCopyPath}
              className="inline-flex flex-col items-center justify-center p-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs text-[10px] font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
              title="Copy current canonical path"
            >
              {copyPathFeedback ? (
                <>
                  <svg className="w-3.5 h-3.5 mb-0.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-emerald-700 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 mb-0.5 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                  <span>Copy Path</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSharePad}
              className="inline-flex flex-col items-center justify-center p-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs text-[10px] font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
              title="Share pad URL"
            >
              {shareFeedback ? (
                <>
                  <svg className="w-3.5 h-3.5 mb-0.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-emerald-700 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 mb-0.5 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          {/* Inline Form to Create Child Pad */}
          {isCreatingChild && (
            <form onSubmit={handleCreateChildSubmit} className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <label htmlFor="child-pad-input" className="block text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">
                New child under /{currentName}:
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="child-pad-input"
                  type="text"
                  value={childSlug}
                  onChange={(e) => setChildSlug(e.target.value)}
                  placeholder="e.g. backend or notes"
                  autoFocus
                  className="flex-1 min-w-0 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300"
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded text-[11px] font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 shrink-0"
                >
                  Create
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Tree Content Area */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs font-mono">
          {/* Parent & Ancestor Trail */}
          {parentPath && (
            <div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1 font-semibold">
                Parent
              </span>
              <Link
                href={parentPath}
                onClick={onClose}
                className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 py-1.5 px-2 rounded-md transition-colors group"
                title={`Up to ${parentPath}`}
              >
                <span className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">↑</span>
                <span className="truncate">{parentName}</span>
              </Link>
            </div>
          )}

          {/* Siblings & Current Hierarchy */}
          {parentPath ? (
            <div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5 font-semibold">
                Pads in /{parentName}
              </span>
              <div className="space-y-0.5">
                {siblings.map((sibling) => {
                  if (sibling.isActive) {
                    return (
                      <div key={sibling.path} className="space-y-1">
                        {/* Active current pad item */}
                        <div className="bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-950 dark:text-zinc-100 font-semibold px-2 py-1.5 rounded-md flex items-center justify-between">
                          <span className="truncate">{sibling.name}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ml-1" title="Current location" />
                        </div>

                        {/* Indented Children of Current Pad */}
                        <div className="pl-3 ml-2 border-l border-zinc-200/80 dark:border-zinc-800 space-y-0.5 mt-1">
                          {children.length === 0 ? (
                            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 py-1 italic">
                              No child pads yet
                            </div>
                          ) : (
                            children.map((child) => (
                              <Link
                                key={child.path}
                                href={child.path}
                                onClick={onClose}
                                className="block py-1 px-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded transition-colors truncate"
                                title={child.name}
                              >
                                {child.name}
                              </Link>
                            ))
                          )}
                          <button
                            type="button"
                            onClick={() => setIsCreatingChild(true)}
                            className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 py-1 px-1.5 flex items-center gap-1 transition-colors"
                          >
                            <span>+ New child pad</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={sibling.path}
                      href={sibling.path}
                      onClick={onClose}
                      className="block py-1.5 px-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-colors truncate"
                      title={sibling.name}
                    >
                      {sibling.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            // At root-level pad (e.g. /project)
            <div className="space-y-3">
              {/* Current Active Pad */}
              <div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1 font-semibold">
                  Current Pad
                </span>
                <div className="bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-950 dark:text-zinc-100 font-semibold px-2 py-1.5 rounded-md flex items-center justify-between">
                  <span className="truncate">{currentName}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ml-1" title="Current location" />
                </div>
              </div>

              {/* Children of Root Pad */}
              <div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1 font-semibold">
                  Child Pads
                </span>
                <div className="space-y-0.5">
                  {children.length === 0 ? (
                    <div className="text-[11px] text-zinc-400 dark:text-zinc-500 py-1 italic">
                      No child pads yet
                    </div>
                  ) : (
                    children.map((child) => (
                      <Link
                        key={child.path}
                        href={child.path}
                        onClick={onClose}
                        className="block py-1 px-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded transition-colors truncate"
                        title={child.name}
                      >
                        {child.name}
                      </Link>
                    ))
                  )}
                  <button
                    type="button"
                    onClick={() => setIsCreatingChild(true)}
                    className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 py-1 px-2 flex items-center gap-1 transition-colors"
                  >
                    <span>+ New child pad</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer with current path */}
        <div className="p-2.5 border-t border-zinc-200/70 dark:border-zinc-800/70 bg-white/40 dark:bg-zinc-900/40 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate">
          <span>Location: {currentPath}</span>
        </div>
      </div>
    </aside>
    </>
  );
}

export default memo(PadSidebar);

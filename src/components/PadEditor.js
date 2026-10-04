'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PadHeader from './PadHeader';
import PadSidebar from './PadSidebar';
import { usePadSocket } from '@/lib/use-pad-socket';

const DEBOUNCE_DELAY_MS = 650;

/**
 * Fast zero-allocation word counter.
 * Avoids creating regexes or allocating arrays of strings on every keystroke.
 */
function countWords(str) {
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

export default function PadEditor({
  canonicalPath,
  breadcrumbs,
  initialContent = '',
  navContext,
}) {
  // Local editor text - updates immediately
  const [content, setContent] = useState(initialContent);

  // Subtle save state: 'Saved' | 'Saving...' | 'Unable to save'
  const [saveStatus, setSaveStatus] = useState('Saved');

  // Sidebar starts CLOSED by default on all devices. Opens if the user clicks the toggle button.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Stable sidebar toggle callbacks to prevent unnecessary re-renders of memoized components
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // References for tracking state across async boundaries & preventing race conditions
  const latestContentRef = useRef(initialContent);
  const lastSavedContentRef = useRef(initialContent);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const saveCounterRef = useRef(0);
  const textareaRef = useRef(null);

  // Sync latestContentRef on effect
  useEffect(() => {
    latestContentRef.current = content;
  }, [content]);

  // Compute word count with memoization
  const wordCount = useMemo(() => countWords(content), [content]);

  /**
   * Executes the persistence request to /api/pads
   */
  const performSave = useCallback(async (textToSave, saveId) => {
    // Abort any prior in-flight save request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/pads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: canonicalPath,
          content: textToSave,
        }),
        signal: controller.signal,
      });

      // Ignore response if superseded by a newer save request
      if (saveId !== saveCounterRef.current) {
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server rejected save');
      }

      // Check if another save was initiated in the interim
      if (saveId !== saveCounterRef.current) {
        return;
      }

      lastSavedContentRef.current = textToSave;

      // If user typed more characters while request was in-flight, keep 'Saving...'
      if (latestContentRef.current === textToSave) {
        setSaveStatus('Saved');
      }
    } catch (err) {
      // Ignore AbortError when superseded
      if (err.name === 'AbortError') {
        return;
      }

      // Check if another save took over
      if (saveId !== saveCounterRef.current) {
        return;
      }

      console.error('Auto-save error:', err.message);
      setSaveStatus('Unable to save');
    }
  }, [canonicalPath]);

  /**
   * Schedules debounced save
   */
  const scheduleSave = useCallback((text) => {
    // If text matches last saved, no need to save again
    if (text === lastSavedContentRef.current) {
      setSaveStatus('Saved');
      return;
    }

    setSaveStatus('Saving...');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveCounterRef.current += 1;
      const currentSaveId = saveCounterRef.current;
      performSave(text, currentSaveId);
    }, DEBOUNCE_DELAY_MS);
  }, [performSave]);

  /**
   * Handles real-time remote updates received over Socket.IO from peers in the same room.
   * Updates local state without scheduling a duplicate MongoDB save (the typing peer is saving).
   * Preserves cursor position if the local user is viewing or focused.
   */
  const handleRemoteUpdate = useCallback((remoteText) => {
    if (remoteText === latestContentRef.current) {
      return;
    }

    const textarea = textareaRef.current;
    let selStart = null;
    let selEnd = null;

    if (textarea && document.activeElement === textarea) {
      selStart = textarea.selectionStart;
      selEnd = textarea.selectionEnd;
    }

    latestContentRef.current = remoteText;
    lastSavedContentRef.current = remoteText;
    setContent(remoteText);

    if (selStart !== null && selEnd !== null) {
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          const newStart = Math.min(selStart, remoteText.length);
          const newEnd = Math.min(selEnd, remoteText.length);
          textareaRef.current.setSelectionRange(newStart, newEnd);
        }
      });
    }
  }, []);

  // Initialize real-time Socket.IO collaboration
  const { connectionState, presenceCount, sendUpdate } = usePadSocket({
    canonicalPath,
    onRemoteUpdate: handleRemoteUpdate,
  });

  /**
   * Handles user keystrokes in textarea:
   * 1. Updates local React state immediately for zero typing latency.
   * 2. Broadcasts instantaneous update over Socket.IO to peers in the room.
   * 3. Schedules debounced persistence to MongoDB (single source of truth).
   */
  const handleChange = (e) => {
    const newText = e.target.value;
    latestContentRef.current = newText;
    setContent(newText);
    sendUpdate(newText);
    scheduleSave(newText);
  };

  /**
   * Manual retry handler if save failed
   */
  const handleRetry = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSaveStatus('Saving...');
    saveCounterRef.current += 1;
    performSave(latestContentRef.current, saveCounterRef.current);
  }, [performSave]);

  // Online reconnection handler: retry saving if unsaved changes exist
  useEffect(() => {
    const handleOnline = () => {
      if (latestContentRef.current !== lastSavedContentRef.current) {
        handleRetry();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [handleRetry]);

  // Keyboard shortcut: Escape to close sidebar on mobile
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setUserSidebarToggle(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  // Cleanup timers and in-flight requests on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Top Pad Header */}
      <PadHeader
        canonicalPath={canonicalPath}
        breadcrumbs={breadcrumbs}
        saveStatus={saveStatus}
        onRetry={handleRetry}
        wordCount={wordCount}
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isSidebarOpen}
        connectionState={connectionState}
        presenceCount={presenceCount}
      />

      {/* Main Workspace: Sidebar + Editor */}
      <div className="flex-1 flex w-full relative min-h-0 overflow-hidden">
        <PadSidebar
          navContext={navContext}
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
        />

        {/* Text Canvas Area - full available content width up to right edge */}
        <main className="flex-1 flex flex-col w-full h-full min-w-0 pl-4 sm:pl-8 pr-1 sm:pr-2 py-4 sm:py-6 overflow-hidden">
          <label htmlFor="pad-textarea" className="sr-only">
            Pad text editor for {canonicalPath}
          </label>
          <textarea
            id="pad-textarea"
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            placeholder={`Start typing your notes at ${canonicalPath}...\n\nEvery character is automatically saved.`}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            autoFocus
            className="flex-1 w-full h-full resize-none bg-transparent font-mono text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none leading-relaxed border-none p-0 pr-3 sm:pr-4 selection:bg-zinc-200 pad-scrollbar overflow-y-auto"
          />

          {/* Mobile footer status bar */}
          <div className="sm:hidden pt-2.5 pb-1 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0 pr-2">
            <span>{canonicalPath}</span>
            <span className="flex items-center gap-1.5 text-zinc-600">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  saveStatus === 'Saved'
                    ? 'bg-emerald-500'
                    : saveStatus === 'Saving...'
                    ? 'bg-zinc-400 animate-pulse'
                    : 'bg-red-500'
                }`}
              />
              {saveStatus}
              <span className="text-zinc-300">•</span>
              <span>{presenceCount} online</span>
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}

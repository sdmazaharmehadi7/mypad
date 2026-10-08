'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import PadHeader from './PadHeader';
import PadSidebar from './PadSidebar';
import PadAttachments from './PadAttachments';
import SmartEditor from './SmartEditor';
import { countWords, contentToDoc } from '@/lib/pad-content';

const DEBOUNCE_DELAY_MS = 1500;
const MAX_WAIT_SAFETY_MS = 10000;
const POLL_INTERVAL_MS = 4000;

export default function PadEditor({
  canonicalPath,
  breadcrumbs,
  initialContent = '',
  initialTheme = 'light',
  navContext,
  initialFiles = [],
  initialFilesTotalSize = 0,
}) {
  // Pad-specific theme: loads from localStorage key for this pad, falling back to database initialTheme, default 'light'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && canonicalPath) {
      const saved = localStorage.getItem(`mypad-theme:${canonicalPath}`);
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return initialTheme || 'light';
  });

  // Local editor content (serialized JSON or legacy string)
  const [content, setContent] = useState(initialContent);

  // Word count displayed in PadHeader
  const [wordCount, setWordCount] = useState(() => countWords(initialContent));

  // Subtle save state: 'Saved' | 'Saving...' | 'Unable to save'
  const [saveStatus, setSaveStatus] = useState('Saved');

  // Sidebar starts CLOSED by default on all devices
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Attachments panel state
  const [files, setFiles] = useState(initialFiles);
  const [filesTotalSize, setFilesTotalSize] = useState(initialFilesTotalSize);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);

  // Sync files if initialFiles prop changes
  useEffect(() => {
    setFiles(initialFiles);
    setFilesTotalSize(initialFilesTotalSize);
  }, [initialFiles, initialFilesTotalSize]);

  // Stable attachments callbacks
  const handleToggleAttachments = useCallback(() => {
    setIsAttachmentsOpen((prev) => !prev);
  }, []);

  const handleCloseAttachments = useCallback(() => {
    setIsAttachmentsOpen(false);
  }, []);

  const handleFilesChange = useCallback((updater, newTotalSize) => {
    setFiles((prev) => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      if (typeof newTotalSize === 'number') {
        setFilesTotalSize(newTotalSize);
      } else {
        const sum = updated.reduce((acc, f) => acc + (f.size || 0), 0);
        setFilesTotalSize(sum);
      }
      return updated;
    });
  }, []);

  // Stable sidebar toggle callbacks
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Tracking refs
  const latestContentRef = useRef(initialContent);
  const lastSavedContentRef = useRef(initialContent);
  const debounceTimerRef = useRef(null);
  const maxWaitTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const saveCounterRef = useRef(0);
  const editorRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  // Clear both debounce and safety max-wait timers
  const clearAllTimers = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (maxWaitTimerRef.current) {
      clearTimeout(maxWaitTimerRef.current);
      maxWaitTimerRef.current = null;
    }
  }, []);

  // Sync latestContentRef
  useEffect(() => {
    latestContentRef.current = content;
  }, [content]);

  // Apply pad-specific theme on mount / path change, and reset to light on unmount
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`mypad-theme:${canonicalPath}`) : null;
    const activeTheme = (saved === 'dark' || saved === 'light') ? saved : (initialTheme || 'light');
    setTheme(activeTheme);
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark');
      }
    };
  }, [canonicalPath, initialTheme]);

  // Synchronize cross-tab storage changes for this specific pad
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === `mypad-theme:${canonicalPath}` && (e.newValue === 'dark' || e.newValue === 'light')) {
        setTheme(e.newValue);
        if (e.newValue === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [canonicalPath]);

  // Handle toggling theme specifically for this pad
  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`mypad-theme:${canonicalPath}`, nextTheme);
        } catch {}
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        window.dispatchEvent(
          new CustomEvent('mypad:theme-change', {
            detail: { path: canonicalPath, theme: nextTheme },
          })
        );
      }

      // Cross-tab broadcast for the same pad
      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage({
            type: 'pad-theme',
            theme: nextTheme,
            path: canonicalPath,
          });
        } catch {}
      }

      // Persist theme to database associated with this pad ID
      fetch('/api/pads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: canonicalPath,
          theme: nextTheme,
        }),
      }).catch((err) => {
        console.error('Failed to persist pad theme:', err);
      });

      return nextTheme;
    });
  }, [canonicalPath]);

  /**
   * Executes the persistence request to /api/pads (MongoDB).
   * Ensures older out-of-order saves cannot overwrite newer content.
   */
  const performSave = useCallback(
    async (textToSave, saveId) => {
      // Clear timers now that save is executing
      clearAllTimers();

      // Do not save if text is already persisted
      if (textToSave === lastSavedContentRef.current) {
        setSaveStatus('Saved');
        return;
      }

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

        // Drop response if superseded by a newer save trigger
        if (saveId !== saveCounterRef.current) {
          return;
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Server rejected save');
        }

        if (saveId !== saveCounterRef.current) {
          return;
        }

        lastSavedContentRef.current = textToSave;

        // Broadcast persistence event to other tabs
        if (broadcastChannelRef.current) {
          try {
            broadcastChannelRef.current.postMessage({
              type: 'pad-saved',
              content: textToSave,
              timestamp: Date.now(),
            });
          } catch {
            // Ignore broadcast error
          }
        }

        // If user hasn't typed more while request was in-flight, show 'Saved'
        if (latestContentRef.current === textToSave) {
          setSaveStatus('Saved');
        } else {
          // User typed additional changes while request was in-flight
          setSaveStatus('Saving...');
          scheduleSave(latestContentRef.current);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }

        if (saveId !== saveCounterRef.current) {
          return;
        }

        console.error('Auto-save error:', err.message);
        setSaveStatus('Unable to save');
      }
    },
    [canonicalPath, clearAllTimers]
  );

  /**
   * Schedules debounced persistence:
   * 1. 1.5s debounce after last user keystroke (resets on every keystroke)
   * 2. ~10s safety max-wait interval if user types continuously without pause
   * 3. No-op if content has not changed
   */
  const scheduleSave = useCallback(
    (newContent) => {
      // Do not save if nothing has changed
      if (newContent === lastSavedContentRef.current) {
        clearAllTimers();
        setSaveStatus('Saved');
        return;
      }

      setSaveStatus('Saving...');

      // Reset the 1.5-second debounce timer on every keystroke
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        if (maxWaitTimerRef.current) {
          clearTimeout(maxWaitTimerRef.current);
          maxWaitTimerRef.current = null;
        }
        saveCounterRef.current += 1;
        const currentSaveId = saveCounterRef.current;
        performSave(latestContentRef.current, currentSaveId);
      }, DEBOUNCE_DELAY_MS);

      // Safety save approximately every 10 seconds if user continues typing without a 1.5s pause
      if (!maxWaitTimerRef.current) {
        maxWaitTimerRef.current = setTimeout(() => {
          maxWaitTimerRef.current = null;
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
          }
          saveCounterRef.current += 1;
          const currentSaveId = saveCounterRef.current;
          performSave(latestContentRef.current, currentSaveId);
        }, MAX_WAIT_SAFETY_MS);
      }
    },
    [clearAllTimers, performSave]
  );

  /**
   * Content change handler invoked by SmartEditor.
   * Realtime updates remain instant and responsive across tabs,
   * while MongoDB persistence is debounced.
   */
  const handleContentChange = useCallback(
    (newSerializedContent) => {
      latestContentRef.current = newSerializedContent;
      setContent(newSerializedContent);

      // Realtime cross-tab broadcast without waiting for MongoDB persistence
      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage({
            type: 'pad-realtime',
            content: newSerializedContent,
            timestamp: Date.now(),
          });
        } catch {}
      }

      scheduleSave(newSerializedContent);
    },
    [scheduleSave]
  );

  /**
   * Manual retry handler if save failed
   */
  const handleRetry = useCallback(() => {
    clearAllTimers();
    setSaveStatus('Saving...');
    saveCounterRef.current += 1;
    performSave(latestContentRef.current, saveCounterRef.current);
  }, [clearAllTimers, performSave]);

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
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  // Realtime multi-session sync: BroadcastChannel for tabs + polling for separate browsers
  useEffect(() => {
    const channelName = `mypad:${canonicalPath}`;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(channelName);
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === 'pad-theme' && event.data?.theme) {
          const incomingTheme = event.data.theme;
          setTheme(incomingTheme);
          try {
            localStorage.setItem(`mypad-theme:${canonicalPath}`, incomingTheme);
          } catch {}
          if (incomingTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return;
        }

        if (
          (event.data?.type === 'pad-saved' || event.data?.type === 'pad-realtime') &&
          event.data?.content
        ) {
          const incoming = event.data.content;
          // Only sync if user has no unsaved local changes
          if (latestContentRef.current === lastSavedContentRef.current) {
            lastSavedContentRef.current = incoming;
            latestContentRef.current = incoming;
            setContent(incoming);
            if (editorRef.current) {
              editorRef.current.commands.setContent(contentToDoc(incoming), false);
              setWordCount(countWords(editorRef.current.getText()));
            }
          }
        }
      };
    }

    // Background polling for different browser sessions
    const pollInterval = setInterval(async () => {
      // Don't poll if document is hidden or user has unsaved edits
      if (document.hidden || latestContentRef.current !== lastSavedContentRef.current) {
        return;
      }

      try {
        const res = await fetch(`/api/pads?path=${encodeURIComponent(canonicalPath)}`);
        if (!res.ok) return;
        const data = await res.json();
        const remoteContent = data.pad?.content || '';

        // Check if remote content changed and user is still idle
        if (
          remoteContent &&
          remoteContent !== lastSavedContentRef.current &&
          latestContentRef.current === lastSavedContentRef.current
        ) {
          lastSavedContentRef.current = remoteContent;
          latestContentRef.current = remoteContent;
          setContent(remoteContent);
          if (editorRef.current) {
            editorRef.current.commands.setContent(contentToDoc(remoteContent), false);
            setWordCount(countWords(editorRef.current.getText()));
          }
        }
      } catch {
        // Silently ignore background poll errors
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(pollInterval);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [canonicalPath]);

  // Clean up all timers and in-flight requests when leaving or switching pads
  useEffect(() => {
    return () => {
      clearAllTimers();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [canonicalPath, clearAllTimers]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Top Pad Header */}
      <PadHeader
        canonicalPath={canonicalPath}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        breadcrumbs={breadcrumbs}
        saveStatus={saveStatus}
        onRetry={handleRetry}
        wordCount={wordCount}
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isSidebarOpen}
        attachmentsCount={files.length}
        onToggleAttachments={handleToggleAttachments}
        isAttachmentsOpen={isAttachmentsOpen}
      />

      {/* Main Workspace: Sidebar + Smart Editor + Attachments Drawer */}
      <div className="flex-1 flex w-full relative min-h-0 overflow-hidden">
        <PadSidebar
          navContext={navContext}
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
        />

        {/* Smart Document Editor Area */}
        <main className="flex-1 flex flex-col w-full h-full min-w-0 overflow-hidden bg-white dark:bg-zinc-950">
          <SmartEditor
            canonicalPath={canonicalPath}
            initialContent={initialContent}
            onContentChange={handleContentChange}
            onWordCountChange={setWordCount}
            editorRef={editorRef}
          />

          {/* Mobile footer status bar */}
          <div className="sm:hidden px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400 dark:text-zinc-500 shrink-0 bg-white dark:bg-zinc-950">
            <span className="truncate max-w-[200px]">{canonicalPath}</span>
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 shrink-0">
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
            </span>
          </div>
        </main>

        {/* Attachments Drawer */}
        <PadAttachments
          canonicalPath={canonicalPath}
          isOpen={isAttachmentsOpen}
          onClose={handleCloseAttachments}
          files={files}
          totalSize={filesTotalSize}
          onFilesChange={handleFilesChange}
        />
      </div>
    </div>
  );
}

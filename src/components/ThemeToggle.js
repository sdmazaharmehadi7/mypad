'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle({
  className = '',
  showLabel = false,
  canonicalPath,
  theme: controlledTheme,
  onToggle: controlledOnToggle,
}) {
  const [localTheme, setLocalTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (typeof controlledOnToggle !== 'function') {
      const getActive = () => {
        if (canonicalPath && typeof window !== 'undefined') {
          const saved = localStorage.getItem(`mypad-theme:${canonicalPath}`);
          if (saved === 'dark' || saved === 'light') return saved;
        }
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      };

      setLocalTheme(getActive());

      const handleThemeChange = (e) => {
        if (e?.detail?.path && canonicalPath && e.detail.path !== canonicalPath) {
          return;
        }
        if (e?.detail?.theme) {
          setLocalTheme(e.detail.theme);
        } else {
          setLocalTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        }
      };

      window.addEventListener('mypad:theme-change', handleThemeChange);
      return () => window.removeEventListener('mypad:theme-change', handleThemeChange);
    }
  }, [canonicalPath, controlledOnToggle]);

  const isControlled = typeof controlledOnToggle === 'function';
  const currentTheme = isControlled ? (controlledTheme || 'light') : localTheme;
  const isDark = currentTheme === 'dark';

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isControlled) {
      controlledOnToggle(e);
      return;
    }

    const nextTheme = localTheme === 'dark' ? 'light' : 'dark';
    setLocalTheme(nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (canonicalPath && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`mypad-theme:${canonicalPath}`, nextTheme);
      } catch {}
    }

    window.dispatchEvent(
      new CustomEvent('mypad:theme-change', {
        detail: { path: canonicalPath, theme: nextTheme },
      })
    );
  };

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={`p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 transition-colors shrink-0 ${className}`}
      >
        <span className="w-4 h-4 block" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center gap-2 p-1.5 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-400 cursor-pointer shrink-0 ${className}`}
    >
      {isDark ? (
        // Sun icon for switching back to light mode
        <svg
          className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      ) : (
        // Moon icon for switching to dark mode
        <svg
          className="w-4 h-4 text-zinc-600 hover:text-zinc-950 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      )}
      {showLabel && (
        <span className="text-xs font-medium">
          {isDark ? 'Light mode' : 'Dark mode'}
        </span>
      )}
    </button>
  );
}

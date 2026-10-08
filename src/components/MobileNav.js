'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const navLinks = [
    { label: 'Online Notepad', href: '/online-notepad' },
    { label: 'Features', href: '/features' },
    { label: 'How it works', href: '/how-it-works' },
    { label: 'Use Cases', href: '/use-cases' },
  ];

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-menu"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        className="inline-flex items-center justify-center p-2 rounded-md text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
      >
        {isOpen ? (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          id="mobile-navigation-menu"
          className="fixed inset-x-0 top-14 bg-white border-b border-zinc-200 px-6 py-6 shadow-xl flex flex-col justify-between z-50 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-zinc-800 hover:text-zinc-950 hover:bg-zinc-50 py-2.5 px-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 mt-3 border-t border-zinc-100">
            <p className="text-center text-xs font-mono text-zinc-400">
              Simple shared text, instantly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

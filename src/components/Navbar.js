'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
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
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 rounded-md py-1"
          aria-label="MyPad Home"
        >
          <div className="w-7 h-7 rounded-md bg-zinc-950 flex items-center justify-center text-white font-mono text-xs font-semibold shadow-xs group-hover:bg-zinc-800 transition-colors">
            <span>M</span>
          </div>
          <span className="font-semibold text-base tracking-tight text-zinc-950">
            MyPad
          </span>
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-100 text-zinc-600 border border-zinc-200/60">
            v1.0
          </span>
        </Link>

        {/* Desktop Navigation with descriptive real links */}
        <nav
          className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600"
          aria-label="Main Navigation"
        >
          <Link
            href="/online-notepad"
            className="hover:text-zinc-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 rounded-xs py-1"
          >
            Online Notepad
          </Link>
          <Link
            href="/features"
            className="hover:text-zinc-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 rounded-xs py-1"
          >
            Features
          </Link>
          <Link
            href="/how-it-works"
            className="hover:text-zinc-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 rounded-xs py-1"
          >
            How it works
          </Link>
          <Link
            href="/use-cases"
            className="hover:text-zinc-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 rounded-xs py-1"
          >
            Use Cases
          </Link>
        </nav>

        {/* Mobile Navigation Toggle Button */}
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
        </div>
      </div>

      {/* Mobile Dropdown Navigation Menu */}
      {isOpen && (
        <div
          id="mobile-navigation-menu"
          className="md:hidden border-t border-zinc-200/80 bg-white px-4 sm:px-6 py-4 shadow-lg flex flex-col justify-between animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-zinc-800 hover:text-zinc-950 hover:bg-zinc-50 px-3 py-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 mt-3 border-t border-zinc-100">
            <p className="text-xs font-mono text-zinc-400">
              Simple shared text, instantly.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

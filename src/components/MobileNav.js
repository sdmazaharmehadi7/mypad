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

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navLinks = [
    { label: 'Online Notepad', href: '/online-notepad' },
    { label: 'Features', href: '/features' },
    { label: 'How it works', href: '/how-it-works' },
    { label: 'Use Cases', href: '/use-cases' },
    { label: 'For Developers', href: '/for-developers' },
    { label: 'For Students', href: '/for-students' },
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
          className="fixed inset-x-0 top-14 bottom-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-6 py-8 flex flex-col justify-between"
        >
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-zinc-800 hover:text-zinc-950 py-2 border-b border-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 rounded-xs"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-6">
            <Link
              href="/online-notepad"
              onClick={() => setIsOpen(false)}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-zinc-950 text-white text-sm font-medium hover:bg-zinc-800 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
            >
              Open a Pad
            </Link>
            <p className="mt-3 text-center text-xs text-zinc-500">
              No account or setup required.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
import MobileNav from './MobileNav';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md transition-all">
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

        {/* Actions (Desktop CTA & Mobile Toggle) */}
        <div className="flex items-center gap-3">
          <Link
            href="/online-notepad"
            className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-medium rounded-md bg-zinc-950 text-white hover:bg-zinc-800 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
          >
            Open a Pad
          </Link>

          <MobileNav />
        </div>
      </div>
    </header>
  );
}

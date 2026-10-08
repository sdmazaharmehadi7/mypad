import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200/80 bg-white py-3 sm:py-3.5 text-xs text-zinc-500 shrink-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zinc-950 flex items-center justify-center text-white font-mono text-[9px] font-semibold">
            M
          </div>
          <span className="font-semibold text-zinc-950 text-xs tracking-tight">
            MyPad
          </span>
          <span className="text-zinc-400 text-xs font-mono">
            © {new Date().getFullYear()}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-zinc-500 font-mono text-[11px] ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Operational
          </span>
        </div>

        <nav
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs font-medium text-zinc-600"
          aria-label="Footer Navigation"
        >
          <Link href="/online-notepad" className="hover:text-zinc-950 transition-colors">
            Online Notepad
          </Link>
          <Link href="/features" className="hover:text-zinc-950 transition-colors">
            Features
          </Link>
          <Link href="/how-it-works" className="hover:text-zinc-950 transition-colors">
            How It Works
          </Link>
          <Link href="/use-cases" className="hover:text-zinc-950 transition-colors">
            Use Cases
          </Link>
          <Link href="/for-developers" className="hover:text-zinc-950 transition-colors">
            For Developers
          </Link>
          <Link href="/for-students" className="hover:text-zinc-950 transition-colors">
            For Students
          </Link>
        </nav>
      </div>
    </footer>
  );
}

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-12 text-sm text-zinc-500">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-zinc-950 flex items-center justify-center text-white font-mono text-[10px] font-semibold">
                M
              </div>
              <span className="font-semibold text-zinc-950 text-sm tracking-tight">
                MyPad
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-500 max-w-sm">
              Simple shared text, instantly. A minimal, URL-based collaborative workspace.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-zinc-600" aria-label="Footer Navigation">
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

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} MyPad. All rights reserved.</p>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-zinc-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

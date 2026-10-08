import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found — MyPad',
  description: 'The requested page or pad could not be found.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Top Header */}
      <header className="w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 px-4 sm:px-6 h-14 flex items-center">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-base tracking-tight text-zinc-950 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 rounded py-1"
        >
          <div className="w-7 h-7 rounded-md bg-zinc-950 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-mono text-xs font-semibold">
            M
          </div>
          <span>MyPad</span>
        </Link>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <span className="font-mono text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            404 Error
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
            Page not found
          </h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            The page or workspace you requested does not exist or has been moved.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs sm:text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
            >
              Return to Homepage
            </Link>
            <Link
              href="/online-notepad"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
            >
              Free Online Notepad
            </Link>
          </div>

          {/* Quick Helpful Links */}
          <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Link href="/features" className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">
              Features
            </Link>
            <Link href="/how-it-works" className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">
              How It Works
            </Link>
            <Link href="/use-cases" className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">
              Use Cases
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500">
        © {new Date().getFullYear()} MyPad. Simple shared text, instantly.
      </footer>
    </div>
  );
}

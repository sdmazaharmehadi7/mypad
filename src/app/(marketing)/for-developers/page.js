import Link from 'next/link';

export const metadata = {
  title: 'MyPad for Developers — Quick Code Scratchpad & Shared Logs',
  description:
    'A fast, lightweight online scratchpad for developers. Dump terminal outputs, share API snippets, debug configs, and collaborate in real-time by URL.',
  alternates: {
    canonical: '/for-developers',
  },
  openGraph: {
    title: 'MyPad for Developers — Quick Code Scratchpad & Shared Logs | MyPad',
    description:
      'A fast, lightweight online scratchpad for developers. Dump terminal outputs, share API snippets, debug configs, and collaborate in real-time by URL.',
    url: '/for-developers',
  },
};

export default function ForDevelopersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Breadcrumb / Top Tag */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-4">
        <Link href="/" className="hover:text-zinc-950 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/use-cases" className="hover:text-zinc-950 transition-colors">
          Use Cases
        </Link>
        <span>/</span>
        <span className="text-zinc-950 font-medium">For Developers</span>
      </div>

      {/* Header */}
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-950 leading-tight">
          A minimalist text workspace for developers.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
          Engineered for engineers. Drop terminal logs, share cURL commands, debug JSON payloads, and draft architecture notes without rich-text formatting corrupting your code.
        </p>
      </header>

      {/* Developer Pillars */}
      <section className="mt-14 space-y-10 border-t border-zinc-200/80 pt-10">
        <article className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-lg border border-zinc-200 bg-white">
            <span className="font-mono text-xs text-zinc-400 font-semibold block mb-1">01</span>
            <h2 className="text-base font-semibold text-zinc-950 mb-2">No Smart Quotes or Formatting Traps</h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Standard document editors automatically replace quotes with curly typographic quotation marks, breaking bash scripts and JSON. MyPad preserves raw plaintext and code faithfully.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-zinc-200 bg-white">
            <span className="font-mono text-xs text-zinc-400 font-semibold block mb-1">02</span>
            <h2 className="text-base font-semibold text-zinc-950 mb-2">Microservice Path Hierarchy</h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Structure notes naturally using URL paths like <code className="text-zinc-900 bg-zinc-100 px-1 py-0.5 rounded text-[11px]">/project/backend/api</code> and <code className="text-zinc-900 bg-zinc-100 px-1 py-0.5 rounded text-[11px]">/project/frontend</code>.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-zinc-200 bg-white">
            <span className="font-mono text-xs text-zinc-400 font-semibold block mb-1">03</span>
            <h2 className="text-base font-semibold text-zinc-950 mb-2">Zero-Auth Team Handoffs</h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Drop a link into Slack, PR comments, or incident rooms. Teammates open the link and see the logs or snippets immediately without OAuth walls or account invites.
            </p>
          </div>
        </article>

        {/* Code Sample Mockup */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-950 text-zinc-300 p-5 font-mono text-xs overflow-x-auto shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-[11px] text-zinc-500 mb-3">
            <span>mypad.vercel.app/api/v1/auth-notes</span>
            <span className="text-emerald-500">● Cloud Synced</span>
          </div>
          <p className="text-zinc-400"># Staging Authentication Endpoints</p>
          <p className="text-emerald-400 mt-2">POST https://api.staging.internal/v1/oauth/token</p>
          <p className="text-zinc-400 mt-1">Headers: Authorization: Bearer &#123;TOKEN&#125;</p>
          <p className="text-zinc-500 mt-3">{`// Notes: Refresh token expiry increased to 30d in staging.`}</p>
        </div>
      </section>

      {/* Related Resources */}
      <section className="mt-14 pt-8 border-t border-zinc-200/80">
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-4">
          Related Pages
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <Link
            href="/features"
            className="p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-zinc-950 block">Features Overview</span>
            <span className="text-zinc-500 mt-1 block">Full breakdown of autosave and low-latency storage.</span>
          </Link>
          <Link
            href="/online-notepad"
            className="p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-zinc-950 block">Free Online Notepad</span>
            <span className="text-zinc-500 mt-1 block">Cloud-saved scratchpad for quick notes.</span>
          </Link>
          <Link
            href="/use-cases"
            className="p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-zinc-950 block">All Use Cases</span>
            <span className="text-zinc-500 mt-1 block">Cross-device transfers and team collaboration.</span>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <div className="mt-14 p-8 rounded-xl bg-zinc-950 text-white text-center">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Create an instant scratchpad
        </h2>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2.5 rounded-lg bg-white text-zinc-950 font-medium text-xs sm:text-sm hover:bg-zinc-100 transition-colors"
          >
            Open Developer Pad →
          </Link>
        </div>
      </div>
    </div>
  );
}

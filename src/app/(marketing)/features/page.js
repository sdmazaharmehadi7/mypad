import Link from 'next/link';

export const metadata = {
  title: 'Features — Lightweight, Fast Online Shared Notes',
  description:
    'Explore MyPad features: instant URL workspaces, continuous cloud autosave, tree-based nested pads, and frictionless collaboration without sign-up.',
  alternates: {
    canonical: '/features',
  },
  openGraph: {
    title: 'Features — Lightweight, Fast Online Shared Notes | MyPad',
    description:
      'Explore MyPad features: instant URL workspaces, continuous cloud autosave, tree-based nested pads, and frictionless collaboration without sign-up.',
    url: '/features',
  },
};

export default function FeaturesPage() {
  const featureList = [
    {
      title: 'URL-First Workspace Architecture',
      description:
        'Every URL path is a distinct, ready-to-use pad. There are no project setup wizards, workspace invitations, or account configurations. If you visit /my-topic, your workspace exists immediately.',
      detail:
        'Supports deep nested paths like /company/backend/api, creating a natural structure for documentation and meeting notes.',
    },
    {
      title: 'Continuous Cloud Autosave',
      description:
        'Changes are saved automatically to the cloud as you type with intelligent debounce scheduling. You never need to click a save button or worry about losing drafts.',
      detail:
        'Built with race-condition guards and offline reconnection handlers that automatically retry syncing when internet access is restored.',
    },
    {
      title: 'Zero Account Requirement',
      description:
        'Start writing in less than three seconds. We do not require email addresses, passwords, phone numbers, or credit card confirmations.',
      detail:
        'Share text friction-free with classmates, colleagues, or open the URL on your mobile phone for an instant cross-device clipboard.',
    },
    {
      title: 'Hierarchical Nested Organization',
      description:
        'Organize complex topics logically without bulky folder structures. Navigating to any child route automatically links to its parent and sibling pads in the minimal sidebar.',
      detail:
        'Parent, sibling, and child navigation is query-optimized so browsing deeply nested notes stays instantaneous.',
    },
    {
      title: 'Distraction-Free Monospace Typography',
      description:
        'Engineered for maximum legibility and writing flow. Clean monospace fonts, subtle status indicators, and zero intrusive floating menus or ads.',
      detail:
        'Designed to feel like a high-performance developer tool rather than a cluttered word processor.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Breadcrumb / Top Tag */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-4">
        <Link href="/" className="hover:text-zinc-950 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-zinc-950 font-medium">Features</span>
      </div>

      {/* Primary Page Header */}
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-950 leading-tight">
          Features built for pure speed and simplicity.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
          MyPad removes the barriers between having a thought and writing it down. Here is how our minimal architecture delivers a superior shared text experience.
        </p>
      </header>

      {/* Feature Deep Dive List */}
      <section className="mt-14 space-y-12 border-t border-zinc-200/80 pt-10">
        {featureList.map((feature, idx) => (
          <article key={feature.title} className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <span className="font-mono text-xs text-zinc-400 font-semibold shrink-0 pt-1">
              0{idx + 1}
            </span>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-zinc-950 tracking-tight">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-zinc-600 leading-relaxed">
                {feature.description}
              </p>
              <p className="mt-2 text-xs sm:text-sm text-zinc-500 font-mono bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                {feature.detail}
              </p>
            </div>
          </article>
        ))}
      </section>

      {/* Contextual Internal Links Section */}
      <section className="mt-16 pt-10 border-t border-zinc-200/80">
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-4">
          Explore Related Guides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <Link
            href="/online-notepad"
            className="p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-zinc-950 block">Free Online Notepad</span>
            <span className="text-zinc-500 mt-1 block">Learn about cloud autosave and instant link sharing.</span>
          </Link>
          <Link
            href="/for-developers"
            className="p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-zinc-950 block">For Developers</span>
            <span className="text-zinc-500 mt-1 block">Share terminal logs, API configs, and code scratchpads.</span>
          </Link>
          <Link
            href="/for-students"
            className="p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-zinc-950 block">For Students</span>
            <span className="text-zinc-500 mt-1 block">Collaborative study guides and lecture note organization.</span>
          </Link>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="mt-16 p-8 rounded-xl bg-zinc-950 text-white text-center">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Ready to experience frictionless notes?
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          No sign-up or installation required. Just choose an address and start typing.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2.5 rounded-lg bg-white text-zinc-950 font-medium text-xs sm:text-sm hover:bg-zinc-100 transition-colors"
          >
            Create Your First Pad →
          </Link>
        </div>
      </div>
    </div>
  );
}

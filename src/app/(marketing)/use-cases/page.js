import Link from 'next/link';

export const metadata = {
  title: 'Use Cases — Practical Applications for Shared Notes & Text',
  description:
    'Discover how developers, students, remote teams, and individuals use MyPad for ephemeral scratchpads, cross-device clipboards, and fast collaboration.',
  alternates: {
    canonical: '/use-cases',
  },
  openGraph: {
    title: 'Use Cases — Practical Applications for Shared Notes & Text | MyPad',
    description:
      'Discover how developers, students, remote teams, and individuals use MyPad for ephemeral scratchpads, cross-device clipboards, and fast collaboration.',
    url: '/use-cases',
  },
};

export default function UseCasesPage() {
  const cases = [
    {
      title: 'For Software Developers & Engineers',
      path: '/dev/snippets',
      summary:
        'A clean terminal and code scratchpad without formatting surprises, auto-correct, or account barriers.',
      bullets: [
        'Quickly drop and share terminal stack traces, cURL requests, and JSON payloads with teammates.',
        'Store ephemeral deployment notes, SSH setup commands, and environment variable templates.',
        'Use nested paths like /project/backend and /project/frontend to organize multi-service documentation.',
      ],
      linkText: 'Explore developer use cases →',
      href: '/for-developers',
    },
    {
      title: 'For College Students & Study Groups',
      path: '/college/physics/lecture-3',
      summary:
        'Collaborative lecture notes, reading summaries, and study guides that any classmate can open instantly.',
      bullets: [
        'Share a single URL during lectures for live, collective note-taking across study groups.',
        'Compile fast revision cheat sheets without needing everyone to have Google Docs or Microsoft accounts.',
        'Organize semester coursework hierarchically with simple URLs like /term1/cs/algorithms.',
      ],
      linkText: 'Explore student use cases →',
      href: '/for-students',
    },
    {
      title: 'For Remote & Hybrid Teams',
      path: '/team/retro-q3',
      summary:
        'Fast scratchpads for agile ceremonies, temporary sprint agendas, and brainstorming sessions.',
      bullets: [
        'Post meeting agendas in your video call chat so attendees can contribute bullet points immediately.',
        'Keep a running scratchpad for weekly standups, action items, and asynchronous updates.',
        'Zero onboarding friction for external contractors, clients, or cross-functional partners.',
      ],
      linkText: 'Learn about online notepads →',
      href: '/online-notepad',
    },
    {
      title: 'Instant Cross-Device Clipboard',
      path: '/quick/transfer',
      summary:
        'Transfer text snippets, links, or draft messages between your phone, tablet, and computer in seconds.',
      bullets: [
        'Stop emailing yourself URLs or messaging your own Slack account just to transfer text.',
        'Open mypad-org.vercel.app/your-secret-code on your phone, paste text, and open it on your laptop.',
        'Completely stateless and instant with zero login barriers.',
      ],
      linkText: 'How it works →',
      href: '/how-it-works',
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
        <span className="text-zinc-950 font-medium">Use Cases</span>
      </div>

      {/* Page Header */}
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-950 leading-tight">
          Practical applications for simple shared text.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
          Whether you need a quick cross-device clipboard, a collaborative lecture notepad, or an ephemeral code scratchpad, MyPad provides instant utility without software bloat.
        </p>
      </header>

      {/* Use Cases Grid */}
      <section className="mt-14 space-y-10 border-t border-zinc-200/80 pt-10">
        {cases.map((item) => (
          <article key={item.title} className="p-6 rounded-xl border border-zinc-200 bg-white shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100">
              <h2 className="text-lg sm:text-xl font-semibold text-zinc-950">
                {item.title}
              </h2>
              <span className="font-mono text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded self-start sm:self-auto">
                {item.path}
              </span>
            </div>
            <p className="mt-3 text-sm sm:text-base text-zinc-600 leading-relaxed">
              {item.summary}
            </p>
            <ul className="mt-4 space-y-2 text-xs sm:text-sm text-zinc-700 font-mono">
              {item.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <span className="text-zinc-400 select-none">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-3 border-t border-zinc-100">
              <Link
                href={item.href}
                className="text-xs font-mono font-medium text-zinc-900 hover:underline"
              >
                {item.linkText}
              </Link>
            </div>
          </article>
        ))}
      </section>

      {/* Bottom CTA */}
      <div className="mt-16 p-8 rounded-xl bg-zinc-950 text-white text-center">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Start your workspace in seconds
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          Navigate to any URL on the homepage and begin typing immediately.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2.5 rounded-lg bg-white text-zinc-950 font-medium text-xs sm:text-sm hover:bg-zinc-100 transition-colors"
          >
            Create a Pad Now →
          </Link>
        </div>
      </div>
    </div>
  );
}

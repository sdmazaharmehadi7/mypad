import Link from 'next/link';

export const metadata = {
  title: 'How It Works — Simple Shared Text via Browser URLs',
  description:
    'Learn how MyPad turns any URL into a collaborative notepad with automatic saving, nested sub-pads, and zero configuration.',
  alternates: {
    canonical: '/how-it-works',
  },
  openGraph: {
    title: 'How It Works — Simple Shared Text via Browser URLs | MyPad',
    description:
      'Learn how MyPad turns any URL into a collaborative notepad with automatic saving, nested sub-pads, and zero configuration.',
    url: '/how-it-works',
  },
};

export default function HowItWorksPage() {
  const steps = [
    {
      number: '01',
      title: 'Choose your URL path',
      lead: 'Your address bar is your document title and your storage location.',
      description:
        'Instead of logging in, clicking "New Document", and naming a file, simply navigate to your desired path in your browser (e.g. mypad-org.vercel.app/standup or mypad-org.vercel.app/team/backend). The pad is ready for writing immediately.',
    },
    {
      number: '02',
      title: 'Write with automatic debounced saving',
      lead: 'Type freely without worrying about manual save buttons.',
      description:
        'MyPad automatically debounces your keystrokes and persists changes to the cloud when you pause. A subtle indicator in the top right confirms your document status: "Saving...", "Saved", or "Unable to save" with automatic retry.',
    },
    {
      number: '03',
      title: 'Share the link to collaborate',
      lead: 'Send the URL to anyone who needs to read or write.',
      description:
        'Anyone with the URL can view and contribute to the workspace. No permissions requests, invitation emails, or password prompts. To keep a pad private, choose an obscure, unguessable path.',
    },
    {
      number: '04',
      title: 'Organize with nested sub-pads',
      lead: 'Scale your workspace with natural path hierarchies.',
      description:
        'Create child pads by adding slashes, like /college/cs101/homework. MyPad automatically links parent and sibling documents in the minimal sidebar, allowing you to organize knowledge trees effortlessly.',
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
        <span className="text-zinc-950 font-medium">How It Works</span>
      </div>

      {/* Page Header */}
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-950 leading-tight">
          How MyPad works.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
          From concept to execution in three seconds. Understand how our URL-based architecture delivers collaborative text sharing without friction.
        </p>
      </header>

      {/* Walkthrough Steps */}
      <section className="mt-14 space-y-12 border-t border-zinc-200/80 pt-10">
        {steps.map((step) => (
          <article key={step.number} className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <span className="font-mono text-base text-zinc-950 font-semibold shrink-0 pt-0.5">
              {step.number}
            </span>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-zinc-950 tracking-tight">
                {step.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-zinc-800">
                {step.lead}
              </p>
              <p className="mt-2 text-sm sm:text-base text-zinc-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          </article>
        ))}
      </section>

      {/* Technical FAQ / Design Principles */}
      <section className="mt-16 pt-10 border-t border-zinc-200/80">
        <h2 className="text-lg font-semibold text-zinc-950 tracking-tight mb-6">
          Key Architecture Highlights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-zinc-600">
          <div className="p-5 rounded-lg border border-zinc-200 bg-white">
            <h3 className="font-semibold text-zinc-950 text-sm mb-1">
              Zero Bot Document Sprawl
            </h3>
            <p className="leading-relaxed">
              Visiting a non-existent URL does not insert empty documents into the database. Documents are created only when meaningful content is typed and saved.
            </p>
          </div>
          <div className="p-5 rounded-lg border border-zinc-200 bg-white">
            <h3 className="font-semibold text-zinc-950 text-sm mb-1">
              Query-Optimized Hierarchies
            </h3>
            <p className="leading-relaxed">
              The sidebar only queries immediate parents, siblings, and children using anchored MongoDB indexes, avoiding full-database scans.
            </p>
          </div>
        </div>
      </section>

      {/* Internal Navigation Links */}
      <section className="mt-16 pt-10 border-t border-zinc-200/80">
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-4">
          Learn More
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <Link
            href="/features"
            className="p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-zinc-950 block">Explore Features</span>
            <span className="text-zinc-500 mt-1 block">Full breakdown of autosave, typography, and speed.</span>
          </Link>
          <Link
            href="/use-cases"
            className="p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-zinc-950 block">Practical Use Cases</span>
            <span className="text-zinc-500 mt-1 block">See how developers, students, and teams use MyPad.</span>
          </Link>
          <Link
            href="/online-notepad"
            className="p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-zinc-950 block">Online Notepad</span>
            <span className="text-zinc-500 mt-1 block">Instant web notepad with zero sign-up requirements.</span>
          </Link>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="mt-16 p-8 rounded-xl bg-zinc-950 text-white text-center">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Try it out now
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          Type any pad name on the homepage and start writing in milliseconds.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2.5 rounded-lg bg-white text-zinc-950 font-medium text-xs sm:text-sm hover:bg-zinc-100 transition-colors"
          >
            Open a Pad →
          </Link>
        </div>
      </div>
    </div>
  );
}

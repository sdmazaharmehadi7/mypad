import Link from 'next/link';

export const metadata = {
  title: 'MyPad for Students — Fast, Collaborative Lecture & Study Notes',
  description:
    'A free, instant shared notepad for students. Take real-time collaborative lecture notes, build exam revision guides, and organize semester courses by URL.',
  alternates: {
    canonical: '/for-students',
  },
  openGraph: {
    title: 'MyPad for Students — Fast, Collaborative Lecture & Study Notes | MyPad',
    description:
      'A free, instant shared notepad for students. Take real-time collaborative lecture notes, build exam revision guides, and organize semester courses by URL.',
    url: '/for-students',
  },
};

export default function ForStudentsPage() {
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
        <span className="text-zinc-950 font-medium">For Students</span>
      </div>

      {/* Header */}
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-950 leading-tight">
          Collaborative lecture notes without the friction.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
          Group study sessions and fast lecture note-taking shouldn&apos;t require account sign-ups, permission requests, or bloated document processors. MyPad is designed for speed in the classroom.
        </p>
      </header>

      {/* Main Student Benefits */}
      <section className="mt-14 space-y-10 border-t border-zinc-200/80 pt-10">
        <article className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-lg border border-zinc-200 bg-white">
            <span className="font-mono text-xs text-zinc-400 font-semibold block mb-1">01</span>
            <h2 className="text-base font-semibold text-zinc-950 mb-2">Zero Account Barrier</h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              When study groups form, not everyone has the same software or accounts. With MyPad, you share a link on WhatsApp, Discord, or AirDrop, and everyone is instantly reading and editing.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-zinc-200 bg-white">
            <span className="font-mono text-xs text-zinc-400 font-semibold block mb-1">02</span>
            <h2 className="text-base font-semibold text-zinc-950 mb-2">Semester Path Hierarchy</h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Organize classes logically with URLs: <code className="text-zinc-900 bg-zinc-100 px-1 py-0.5 rounded text-[11px]">/fall2026/biology/lab1</code>. The sidebar automatically surfaces child pads and parents.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-zinc-200 bg-white">
            <span className="font-mono text-xs text-zinc-400 font-semibold block mb-1">03</span>
            <h2 className="text-base font-semibold text-zinc-950 mb-2">Instant Cloud Autosave</h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Never lose your lecture thoughts. Keystrokes are debounced and persisted continuously, so closing your laptop between lectures won&apos;t erase drafts.
            </p>
          </div>
        </article>

        {/* Real Example Walkthrough */}
        <div className="p-6 rounded-xl bg-zinc-50 border border-zinc-200 font-mono text-xs sm:text-sm">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
            Example: Organic Chemistry Study Group
          </span>
          <p className="text-zinc-800 leading-relaxed">
            1. Group leader visits <span className="text-zinc-950 font-semibold">mypad.vercel.app/chem201/exam-prep</span>.<br />
            2. Pastes discussion questions and shares the link in the group chat.<br />
            3. Everyone types bullet answers concurrently. Edits save in real time.<br />
            4. Review notes from your phone on the bus ride to campus.
          </p>
        </div>
      </section>

      {/* Related Links */}
      <section className="mt-14 pt-8 border-t border-zinc-200/80">
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-4">
          Related Resources
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <Link
            href="/online-notepad"
            className="p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-zinc-950 block">Free Online Notepad</span>
            <span className="text-zinc-500 mt-1 block">Simple notes with continuous cloud saving.</span>
          </Link>
          <Link
            href="/how-it-works"
            className="p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-zinc-950 block">How It Works</span>
            <span className="text-zinc-500 mt-1 block">Understand the URL-first notepad workflow.</span>
          </Link>
          <Link
            href="/features"
            className="p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-zinc-950 block">Core Features</span>
            <span className="text-zinc-500 mt-1 block">Learn about typography and nested navigation.</span>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <div className="mt-14 p-8 rounded-xl bg-zinc-950 text-white text-center">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Create a study pad for your next lecture
        </h2>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2.5 rounded-lg bg-white text-zinc-950 font-medium text-xs sm:text-sm hover:bg-zinc-100 transition-colors"
          >
            Start Taking Notes Now →
          </Link>
        </div>
      </div>
    </div>
  );
}

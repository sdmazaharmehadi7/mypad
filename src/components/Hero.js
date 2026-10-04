import PadInput from './PadInput';

export default function Hero() {
  return (
    <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Subtle pill indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200/80 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span>Zero login friction • Instant URL workspace</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-zinc-950 max-w-2xl mx-auto leading-[1.12]">
          Simple shared text,{' '}
          <span className="text-zinc-400 font-normal">instantly.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-zinc-600 max-w-xl mx-auto font-normal leading-relaxed">
          Create, edit, and collaborate in real-time by simply navigating to any URL.
          No accounts, no invitations, and zero complicated setup.
        </p>

        {/* Primary Pad Input */}
        <div className="mt-8 sm:mt-10">
          <PadInput />
        </div>

        {/* Trust & Guarantee indicators */}
        <div className="mt-10 pt-6 border-t border-zinc-100 max-w-lg mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            No signup required
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Automatic cloud saving
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Infinite nested paths
          </span>
        </div>
      </div>
    </section>
  );
}

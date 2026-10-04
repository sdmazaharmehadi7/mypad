export default function Features() {
  const features = [
    {
      title: 'No signup required',
      desc: 'Start writing immediately. No accounts, email verifications, passwords, or paywalls.',
      tag: 'Zero friction',
    },
    {
      title: 'Automatic saving',
      desc: 'Every keystroke is saved automatically in the cloud. Never lose a draft or thought again.',
      tag: 'Continuous sync',
    },
    {
      title: 'Share with a URL',
      desc: 'Your URL is your workspace. Share the exact link with anyone to collaborate instantly.',
      tag: 'Instant access',
    },
    {
      title: 'Nested pads',
      desc: 'Organize related work with hierarchical paths like /project/frontend and /project/backend.',
      tag: 'Tree hierarchy',
    },
    {
      title: 'Fast and lightweight',
      desc: 'Zero bloated toolbars, zero sluggish loading. Pure, unadorned text focus.',
      tag: 'Sub-millisecond',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-20 border-t border-zinc-200/60 scroll-mt-14 bg-zinc-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="max-w-xl">
          <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-500">
            Features
          </h2>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
            Essential tools. Zero clutter.
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            Everything you need for effortless text exchange without unnecessary baggage.
          </p>
        </div>

        {/* Minimal, restrained feature grid (no oversized cards) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200/80 rounded-xl overflow-hidden border border-zinc-200">
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              className={`bg-white p-6 flex flex-col justify-between ${
                idx === 4 ? 'md:col-span-2 lg:col-span-2' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-zinc-400 font-medium">
                    0{idx + 1}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-950 tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

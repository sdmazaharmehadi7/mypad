export default function UseCases() {
  const useCases = [
    {
      group: 'Developers',
      path: '/dev/logs',
      desc: 'Quickly drop terminal outputs, cURL commands, API snippets, and configuration samples to share with colleagues.',
    },
    {
      group: 'Students',
      path: '/college/cs101',
      desc: 'Live group note-taking during lectures, collaborative assignment outlines, and shared study materials without Google Docs clutter.',
    },
    {
      group: 'Teams',
      path: '/team/standup',
      desc: 'Ephemeral meeting agendas, quick daily standup points, and live brainstorming notes accessible to anyone in the call.',
    },
    {
      group: 'Quick Notes',
      path: '/quick/transfer',
      desc: 'Send a link or text snippet between your phone and laptop in three seconds without emailing yourself.',
    },
  ];

  return (
    <section id="use-cases" className="py-16 sm:py-20 border-t border-zinc-200/60 scroll-mt-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="max-w-xl">
          <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-500">
            Use Cases
          </h2>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
            Designed for anyone who works with text.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {useCases.map((item) => (
            <div
              key={item.group}
              className="p-5 rounded-lg border border-zinc-200/80 bg-white hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-950">
                  {item.group}
                </h3>
                <span className="font-mono text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                  {item.path}
                </span>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

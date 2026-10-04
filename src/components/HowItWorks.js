export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Pick your path',
      desc: 'Type any URL in your browser or enter a name on the homepage, such as /notes or /team/retro.',
    },
    {
      num: '02',
      title: 'Type without friction',
      desc: 'Jump directly into a clean, distraction-free pad. Changes are saved continuously in real time.',
    },
    {
      num: '03',
      title: 'Share the link',
      desc: 'Send the URL to a teammate, classmate, or open it on your phone. No invitations or permissions needed.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 border-t border-zinc-200/60 scroll-mt-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="max-w-xl">
          <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-500">
            How it works
          </h2>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
            Three seconds from idea to shared text.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {steps.map((step) => (
            <div key={step.num} className="relative flex flex-col">
              <span className="font-mono text-xs font-semibold text-zinc-400">
                {step.num}
              </span>
              <h3 className="mt-2 text-base font-semibold text-zinc-900 tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed font-normal">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

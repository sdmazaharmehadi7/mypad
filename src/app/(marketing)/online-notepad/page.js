import Link from 'next/link';
import PadInput from '@/components/PadInput';

export const metadata = {
  title: 'Free Online Notepad — Fast, Cloud-Saved Shared Text',
  description:
    'MyPad is a free online notepad that saves your text automatically in the cloud. Access, edit, and share notes instantly using a simple URL.',
  alternates: {
    canonical: '/online-notepad',
  },
  openGraph: {
    title: 'Free Online Notepad — Fast, Cloud-Saved Shared Text | MyPad',
    description:
      'MyPad is a free online notepad that saves your text automatically in the cloud. Access, edit, and share notes instantly using a simple URL.',
    url: '/online-notepad',
  },
};

export default function OnlineNotepadPage() {
  const benefits = [
    {
      title: 'Opens in any browser',
      desc: 'No apps to install, no desktop software updates. Works seamlessly across macOS, Windows, Linux, iOS, and Android.',
    },
    {
      title: 'Automatic cloud persistence',
      desc: 'Keystrokes save continuously in the cloud. You can shut your laptop or switch devices without manually saving.',
    },
    {
      title: 'Share text with a single link',
      desc: 'Your URL is your document. Send the link to any collaborator to read or edit concurrently.',
    },
    {
      title: 'Tree-structured sub-pads',
      desc: 'Add sub-topics with forward slashes (e.g. /meeting/q3/notes) to keep your notes organized hierarchically.',
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
        <span className="text-zinc-950 font-medium">Online Notepad</span>
      </div>

      {/* Header */}
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-950 leading-tight">
          A free, fast online notepad for everyday text.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
          Sometimes you just need a blank canvas to jot down thoughts, draft an outline, or paste a link without opening heavy document software. Type a pad name below to begin.
        </p>
      </header>

      {/* Interactive Primary Pad Input on page */}
      <div className="mt-10 p-6 rounded-xl border border-zinc-200 bg-zinc-50/50">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-3 font-semibold">
          Create or open an online notepad:
        </span>
        <PadInput />
      </div>

      {/* Core Benefits */}
      <section className="mt-16 space-y-8 border-t border-zinc-200/80 pt-10">
        <h2 className="text-xl sm:text-2xl font-semibold text-zinc-950 tracking-tight">
          Why use a URL-first online notepad?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="p-5 rounded-lg border border-zinc-200 bg-white">
              <h3 className="text-sm font-semibold text-zinc-950 mb-1">{b.title}</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison: Traditional vs Office vs MyPad */}
      <section className="mt-16 pt-10 border-t border-zinc-200/80">
        <h2 className="text-xl sm:text-2xl font-semibold text-zinc-950 tracking-tight mb-6">
          How MyPad compares
        </h2>
        <div className="overflow-x-auto border border-zinc-200 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-100/70 border-b border-zinc-200 text-zinc-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Feature</th>
                <th className="py-3 px-4 font-semibold text-zinc-500">Desktop Notepad</th>
                <th className="py-3 px-4 font-semibold text-zinc-500">Heavy Office Apps</th>
                <th className="py-3 px-4 font-semibold text-zinc-950 bg-zinc-200/50">MyPad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-600 bg-white">
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-950">Setup Time</td>
                <td className="py-3 px-4">Local app only</td>
                <td className="py-3 px-4">Sign in + create doc (30s)</td>
                <td className="py-3 px-4 font-semibold text-zinc-950 bg-zinc-50">Instant via URL (1s)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-950">Cloud Autosave</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4">Yes (with account)</td>
                <td className="py-3 px-4 font-semibold text-zinc-950 bg-zinc-50">Yes (automatic)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-950">Share with Link</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4">Permissions dialogue</td>
                <td className="py-3 px-4 font-semibold text-zinc-950 bg-zinc-50">Copy URL instantly</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-950">Distraction Level</td>
                <td className="py-3 px-4">Low</td>
                <td className="py-3 px-4">High (menus, toolbars)</td>
                <td className="py-3 px-4 font-semibold text-zinc-950 bg-zinc-50">Zero (pure text canvas)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Internal Linking Grid */}
      <section className="mt-16 pt-10 border-t border-zinc-200/80">
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-4">
          Recommended Reading
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <Link
            href="/for-developers"
            className="p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-zinc-950 block">For Developers</span>
            <span className="text-zinc-500 mt-1 block">Quick code dumps, logs, and staging notes.</span>
          </Link>
          <Link
            href="/for-students"
            className="p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-zinc-950 block">For Students</span>
            <span className="text-zinc-500 mt-1 block">Live lecture notes and collaborative study groups.</span>
          </Link>
          <Link
            href="/features"
            className="p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-zinc-950 block">Features</span>
            <span className="text-zinc-500 mt-1 block">Learn about our debounced autosave architecture.</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function PadPreview() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
      <div className="rounded-xl border border-zinc-200 bg-white shadow-xs overflow-hidden transition-all text-left">
        {/* Window Chrome Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50/80 border-b border-zinc-200 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
            </div>
            <span className="font-mono text-zinc-600 font-medium ml-2">
              mypad.vercel.app/project/backend
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Saved
            </span>
            <span className="hidden sm:inline text-zinc-400">|</span>
            <span className="hidden sm:inline text-zinc-500">2 collaborators</span>
          </div>
        </div>

        {/* Minimal Editor Content Simulation */}
        <div className="p-5 sm:p-6 font-mono text-xs sm:text-sm text-zinc-800 leading-relaxed bg-white">
          <p className="font-semibold text-zinc-950 pb-2">
            # Sprint Notes — Project Backend
          </p>
          <p className="text-zinc-600">
            Welcome to MyPad. This document exists at this exact URL.
          </p>
          <div className="mt-3 space-y-1 text-zinc-700">
            <p>• Clean URL structure: <span className="text-zinc-900 bg-zinc-100 px-1 py-0.5 rounded">/project/backend</span></p>
            <p>• Nested sub-pads: <span className="text-zinc-900 bg-zinc-100 px-1 py-0.5 rounded">/project/backend/api</span></p>
            <p>• Instant syncing: Edits reflect automatically across connected devices.</p>
            <p>• No accounts needed: Just send the URL to collaborate.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Live workspace preview</span>
            <span>Markdown supported</span>
          </div>
        </div>
      </div>
    </div>
  );
}

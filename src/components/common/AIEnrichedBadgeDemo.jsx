import { useState } from "react";
import AIEnrichedBadge from "./AIEnrichedBadge";

export default function AIEnrichedBadgeDemo() {
  const [aiEnriched, setAiEnriched] = useState(true);

  return (
    <div className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/80 p-6 text-white shadow-xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">AIEnrichedBadge Demo</h2>
        <p className="mt-1 text-sm text-slate-400">
          Static examples plus a toggleable badge state.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-300">aiEnriched = true</div>
          <AIEnrichedBadge aiEnriched={true} />
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-300">aiEnriched = false</div>
          <AIEnrichedBadge aiEnriched={false} />
        </div>
      </div>

      <div className="mt-8 border-t border-slate-800 pt-6">
        <div className="mb-3 text-sm font-medium text-slate-300">Interactive toggle</div>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <AIEnrichedBadge aiEnriched={aiEnriched} />
          <button
            type="button"
            onClick={() => setAiEnriched((prev) => !prev)}
            className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
          >
            Toggle badge state
          </button>
          <span className="text-sm text-slate-400">
            Current value: <span className="font-medium text-slate-200">{String(aiEnriched)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

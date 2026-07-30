// src/components/erp/shared/ERPLoadingSkeleton.jsx

/** Pulse-skeleton row for table loading states */
export function ERPTableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-white/[0.04]">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-3 bg-zinc-800 rounded"
              style={{ flex: j === 0 ? 2 : 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Pulse-skeleton card grid */
export function ERPCardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[#111115] border border-white/[0.06] rounded-2xl p-5">
          <div className="h-2.5 w-16 bg-zinc-800 rounded mb-4" />
          <div className="h-8 w-20 bg-zinc-800 rounded mb-3" />
          <div className="h-2 w-24 bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );
}

/** Full page centered spinner */
export function ERPSpinner({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-indigo-500 animate-spin" />
      <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">{label}</p>
    </div>
  );
}

export default ERPSpinner;

/** Fallback export for backward compatibility */
export function ERPLoadingSkeleton(props) {
  return <ERPSpinner {...props} />;
}

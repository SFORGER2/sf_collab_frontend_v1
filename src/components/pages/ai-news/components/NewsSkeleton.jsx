import React from "react";

export function NewsCardSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6 p-5 md:p-6 bg-[#18181b] border border-zinc-800/80 rounded-2xl animate-pulse w-full">
      
      {/* Thumbnail skeleton — matches md:w-[30%] aspect-[16/10] */}
      <div className="w-full md:w-[30%] aspect-[16/10] bg-zinc-800/60 rounded-xl shrink-0" />

      {/* Content skeleton */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div>
          {/* Category tag */}
          <div className="h-2.5 w-12 bg-zinc-700/60 rounded mb-3" />

          {/* Title — 2 lines */}
          <div className="space-y-2 mb-3">
            <div className="h-4 w-full bg-zinc-700/50 rounded" />
            <div className="h-4 w-3/4 bg-zinc-700/50 rounded" />
          </div>

          {/* Summary — 2 lines */}
          <div className="space-y-1.5 mb-4">
            <div className="h-3 w-full bg-zinc-800/70 rounded" />
            <div className="h-3 w-5/6 bg-zinc-800/70 rounded" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-700/40 mt-auto gap-4">
          <div className="h-2.5 w-36 bg-zinc-800/60 rounded" />
          <div className="h-2.5 w-16 bg-zinc-800/60 rounded" />
        </div>
      </div>

    </div>
  );
}

export default function NewsSkeleton({ count = 6 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, idx) => (
        <NewsCardSkeleton key={idx} />
      ))}
    </div>
  );
}

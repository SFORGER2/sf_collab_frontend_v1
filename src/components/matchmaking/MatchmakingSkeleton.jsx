import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function MatchCardSkeleton() {
  const reasonWidths = ['w-[80%]', 'w-[65%]', 'w-[90%]', 'w-[75%]'];

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-sm backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-500/5 via-zinc-500/2 to-transparent" />

      <CardHeader className="relative border-b border-white/5 px-4 py-4 sm:px-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <Skeleton className="size-14 shrink-0 rounded-xl sm:size-16 bg-slate-800" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32 bg-slate-800" />
              <Skeleton className="h-4 w-14 rounded-full bg-slate-800" />
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Skeleton className="size-4 shrink-0 rounded bg-slate-800" />
              <Skeleton className="h-4 w-28 bg-slate-800" />
            </div>

            <div className="mt-1">
              <Skeleton className="h-3 w-44 bg-slate-800" />
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-right flex flex-col items-center">
              <Skeleton className="h-2 w-16 mb-1.5 bg-slate-800" />
              <Skeleton className="h-5 w-10 bg-slate-800" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4 px-4 py-4 sm:px-6">
        <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <Skeleton className="size-4 shrink-0 rounded bg-slate-800 mt-0.5" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-2 w-20 bg-slate-800" />
            <Skeleton className="h-4 w-full bg-slate-800" />
            <Skeleton className="h-4 w-[90%] bg-slate-800" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3.5 w-32 bg-slate-800" />
            <Skeleton className="h-3 w-28 bg-slate-800" />
          </div>

          <ul className="space-y-2">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex items-center gap-2">
                <Skeleton className="size-1.5 shrink-0 rounded-full bg-slate-700" />
                <Skeleton className={`h-4 ${reasonWidths[i % reasonWidths.length]} bg-slate-800`} />
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-3.5 w-36 bg-slate-800" />
          <Skeleton className="h-8 w-24 rounded bg-slate-800" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MatchSectionSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-56 rounded bg-slate-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

MatchSectionSkeleton.propTypes = {
  count: PropTypes.number,
};

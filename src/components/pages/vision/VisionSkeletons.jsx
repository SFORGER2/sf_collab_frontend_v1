import React from 'react';
import { motion } from 'framer-motion';

/**
 * Skeleton loader for Vision / Ideation cards on feeds (/ideation & /saved-ideas).
 */
export function IdeationCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-5 space-y-4 animate-pulse">
      {/* Banner / Category header */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 bg-white/10 rounded-full" />
        <div className="h-5 w-16 bg-white/10 rounded-full" />
      </div>

      {/* Title & Description */}
      <div className="space-y-2 pt-1">
        <div className="h-6 w-3/4 bg-white/15 rounded-lg" />
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-5/6 bg-white/10 rounded" />
      </div>

      {/* Creator row */}
      <div className="flex items-center gap-3 pt-2">
        <div className="w-8 h-8 rounded-full bg-white/15 shrink-0" />
        <div className="space-y-1 flex-1">
          <div className="h-3.5 w-28 bg-white/10 rounded" />
          <div className="h-2.5 w-16 bg-white/5 rounded" />
        </div>
      </div>

      {/* Stats footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="h-4 w-10 bg-white/10 rounded" />
          <div className="h-4 w-10 bg-white/10 rounded" />
          <div className="h-4 w-10 bg-white/10 rounded" />
        </div>
        <div className="h-5 w-14 bg-white/10 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for Vision Detail Page (/ideation-details).
 */
export function VisionDetailSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-pulse"
    >
      {/* Back button */}
      <div className="h-4 w-16 bg-white/10 rounded" />

      {/* Hero card */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="space-y-4 flex-1 w-full">
            <div className="flex gap-2">
              <div className="h-5 w-20 bg-white/15 rounded-full" />
              <div className="h-5 w-16 bg-white/10 rounded-full" />
            </div>
            <div className="h-8 w-3/4 bg-white/20 rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-white/10 rounded" />
              <div className="h-4 w-5/6 bg-white/10 rounded" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-white/15" />
              <div className="h-4 w-32 bg-white/10 rounded" />
            </div>
          </div>
          <div className="w-32 h-32 rounded-full bg-white/10 shrink-0 hidden sm:block" />
        </div>

        {/* Hero CTA buttons */}
        <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
          <div className="h-9 w-28 bg-white/15 rounded-xl" />
          <div className="h-9 w-24 bg-white/10 rounded-xl" />
          <div className="h-9 w-24 bg-white/10 rounded-xl" />
        </div>
      </div>

      {/* Signals section */}
      <div className="space-y-3">
        <div className="h-16 w-full bg-slate-900/60 border border-white/[0.08] rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-16 bg-slate-900/60 border border-white/[0.08] rounded-2xl" />
          <div className="h-16 bg-slate-900/60 border border-white/[0.08] rounded-2xl" />
          <div className="h-16 bg-slate-900/60 border border-white/[0.08] rounded-2xl" />
        </div>
      </div>

      {/* Case panels grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-44 bg-slate-900/60 border border-white/[0.08] rounded-2xl p-6 space-y-3">
          <div className="h-5 w-28 bg-white/15 rounded" />
          <div className="h-4 w-full bg-white/10 rounded" />
          <div className="h-4 w-4/5 bg-white/10 rounded" />
        </div>
        <div className="h-44 bg-slate-900/60 border border-white/[0.08] rounded-2xl p-6 space-y-3">
          <div className="h-5 w-28 bg-white/15 rounded" />
          <div className="h-4 w-full bg-white/10 rounded" />
          <div className="h-4 w-4/5 bg-white/10 rounded" />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Skeleton loader for Vision Workspace Page (/vision/:id).
 */
export function VisionWorkspaceSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-pulse"
    >
      {/* Hero Header */}
      <div className="h-64 rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white/10" />
          <div className="h-5 w-20 bg-white/15 rounded-full" />
          <div className="h-5 w-16 bg-white/10 rounded-full" />
        </div>
        <div className="h-8 w-2/3 bg-white/20 rounded-xl" />
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-1/2 bg-white/10 rounded" />
      </div>

      {/* Action Bar */}
      <div className="h-16 rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4" />

      {/* Signals Grid */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 space-y-4">
        <div className="h-6 w-32 bg-white/15 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white/[0.04] border border-white/[0.06] p-4" />
          ))}
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-60 rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 space-y-3" />
        <div className="h-60 rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 space-y-3" />
      </div>
    </motion.div>
  );
}

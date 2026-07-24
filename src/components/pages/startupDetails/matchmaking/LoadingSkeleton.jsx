/**
 * LoadingSkeleton — Task 7 (Premium Rewrite)
 *
 * Skills: impeccable · tasteskill · Emil-tier
 *
 * - Gradient sweep shimmer (not flat animate-pulse)
 *   → CSS custom keyframe: a highlight band sweeps left-to-right at 1.5s
 * - Skeleton cards match EXACT MatchCard layout: same padding, radii, row heights
 * - Same card shell: bg-gray-900 border border-white/5 rounded-2xl
 * - "Loading..." text uses framer-motion opacity pulse (not CSS class)
 * - Reduced motion: static skeletons, no sweep, no pulse
 */

import { motion } from 'framer-motion';

/** Single shimmer block with the sweep gradient */
const Shimmer = ({ className = '' }) => (
  <div
    className={`relative overflow-hidden rounded-md bg-white/5 ${className}`}
    aria-hidden="true"
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
  </div>
);

/** One skeleton card matching the real MatchCard layout exactly */
const SkeletonCard = () => (
  <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 space-y-4">

    {/* Row 1: Avatar + Name/Role + Score arc */}
    <div className="flex items-start justify-between gap-3">
      {/* Left: avatar + identity */}
      <div className="flex items-center gap-3">
        <Shimmer className="w-11 h-11 rounded-full flex-shrink-0" />
        <div className="space-y-2">
          <Shimmer className="h-[15px] w-28 rounded" />
          <Shimmer className="h-3 w-20 rounded" />
        </div>
      </div>
      {/* Right: score ring + label */}
      <div className="flex flex-col items-center gap-2.5 flex-shrink-0">
        <Shimmer className="w-[72px] h-[72px] rounded-full" />
        <Shimmer className="h-4 w-[90px] rounded-full" />
      </div>
    </div>

    {/* Row 2: Skill badges */}
    <div className="flex gap-2">
      <Shimmer className="h-5 w-14 rounded-full" />
      <Shimmer className="h-5 w-20 rounded-full" />
      <Shimmer className="h-5 w-12 rounded-full" />
    </div>

    {/* Row 3: Why Matched label + 3 lines */}
    <div className="space-y-2.5">
      <Shimmer className="h-3 w-20 rounded" />
      <Shimmer className="h-3 w-full rounded" />
      <Shimmer className="h-3 w-4/5 rounded" />
      <Shimmer className="h-3 w-3/5 rounded" />
    </div>

    {/* Row 4: Button */}
    <Shimmer className="h-9 w-full rounded-lg" />
  </div>
);

export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {/* Loading label — framer-motion opacity pulse */}
      <motion.p
        className="text-[13px] text-gray-500 flex items-center gap-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
        Loading AI recommendations…
      </motion.p>

      {/* Skeleton cards — same grid as real cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

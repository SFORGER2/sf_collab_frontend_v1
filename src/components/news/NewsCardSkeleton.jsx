import { motion } from 'framer-motion';

/**
 * A single skeleton card that mimics the shape of a news article card.
 * Shows a pulsing placeholder while the real content is loading.
 */
export default function NewsCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl p-5">
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-500/5 via-zinc-500/2 to-transparent" />

      {/* Image placeholder */}
      <div className="relative w-full h-40 bg-slate-800 rounded-xl mb-4 overflow-hidden">
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]" />
      </div>

      {/* Category badge */}
      <div className="w-16 h-5 bg-slate-800 rounded-full mb-3 overflow-hidden">
        <div className="w-full h-full animate-shimmer bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]" />
      </div>

      {/* Title lines */}
      <div className="space-y-2 mb-4">
        <div className="h-5 bg-slate-800 rounded w-[90%] overflow-hidden">
          <div className="w-full h-full animate-shimmer bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]" />
        </div>
        <div className="h-5 bg-slate-800 rounded w-[65%] overflow-hidden">
          <div className="w-full h-full animate-shimmer bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]" />
        </div>
      </div>

      {/* Description lines */}
      <div className="space-y-2 mb-5">
        <div className="h-3 bg-slate-800/70 rounded w-full overflow-hidden">
          <div className="w-full h-full animate-shimmer bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]" />
        </div>
        <div className="h-3 bg-slate-800/70 rounded w-[85%] overflow-hidden">
          <div className="w-full h-full animate-shimmer bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]" />
        </div>
        <div className="h-3 bg-slate-800/70 rounded w-[60%] overflow-hidden">
          <div className="w-full h-full animate-shimmer bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]" />
        </div>
      </div>

      {/* Footer: source + date */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-full h-full animate-shimmer bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]" />
          </div>
          <div className="h-3 w-20 bg-slate-800 rounded overflow-hidden">
            <div className="w-full h-full animate-shimmer bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]" />
          </div>
        </div>
        <div className="h-3 w-24 bg-slate-800 rounded overflow-hidden">
          <div className="w-full h-full animate-shimmer bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  );
}

/**
 * Renders a grid of skeleton cards to fill the screen while loading.
 * @param {{ count?: number }} props
 */
export function NewsCardSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
        >
          <NewsCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}

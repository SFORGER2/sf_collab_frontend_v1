import React from "react";
import { motion } from "framer-motion";

/**
 * LongExplanationLoader Component
 * - Displays "Drafting detailed explanation..." status indicator
 * - Renders exactly 7 staggered skeleton lines with widths simulating natural paragraph drafting:
 *   [94%, 88%, 96%, 75%, 92%, 81%, 67%]
 * - Smooth GPU-accelerated horizontal shimmer sweep (1.8s ease-in-out infinite loop)
 * - Accessible (aria-live="polite", role="status", respects prefers-reduced-motion)
 */
const SKELETON_WIDTHS = [
  "94%",
  "88%",
  "96%",
  "75%",
  "92%",
  "81%",
  "67%",
];

export default function LongExplanationLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Drafting detailed explanation..."
      className="w-full flex flex-col gap-3.5 py-1 select-none"
    >
      {/* Stage 1: Status Indicator beside AI Avatar / Header */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#7CA6FF] animate-pulse" />
        <span className="text-[13px] font-sans font-medium text-[#7CA6FF] tracking-wide">
          Drafting detailed explanation...
        </span>
      </div>

      {/* Stage 2: 7 Staggered Text Skeleton Lines */}
      <div className="flex flex-col gap-2.5 mt-1">
        {SKELETON_WIDTHS.map((width, index) => (
          <div
            key={index}
            style={{ width }}
            className="h-3.5 rounded-md bg-[#A9B3C4]/18 relative overflow-hidden transform-gpu motion-reduce:animate-none"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: "easeInOut",
                delay: index * 0.08,
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F7F8FA]/12 to-transparent motion-reduce:hidden"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

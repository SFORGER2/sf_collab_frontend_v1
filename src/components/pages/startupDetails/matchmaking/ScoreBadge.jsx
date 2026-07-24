/**
 * ScoreBadge — Task 4 (Premium Redesign)
 *
 * Skills: impeccable · tasteskill · Emil-tier high-end-visual-design
 *
 * - SVG <circle> arc filled to exact score % (not a CSS border trick)
 * - Arc animates from 0 → score on mount via framer-motion
 * - Score rendered with tabular-nums for stable digit width
 * - Colour-coded label: violet / blue / amber / gray per score tier
 * - prefers-reduced-motion: instant arc, no animation
 * - Score displayed exactly as returned — no rounding, no modification
 */

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const SIZE = 72;        // SVG canvas px
const STROKE = 5;       // ring stroke width
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

const getConfig = (score) => {
  if (score >= 90) return { label: 'Excellent Match', color: '#8b5cf6', textClass: 'text-violet-400', labelClass: 'bg-violet-500/10 text-violet-300 ring-violet-500/20' };
  if (score >= 75) return { label: 'Strong Match',    color: '#3b82f6', textClass: 'text-blue-400',   labelClass: 'bg-blue-500/10 text-blue-300 ring-blue-500/20'   };
  if (score >= 50) return { label: 'Good Match',      color: '#f59e0b', textClass: 'text-amber-400',  labelClass: 'bg-amber-500/10 text-amber-300 ring-amber-500/20' };
  return              { label: 'Potential Match', color: '#6b7280', textClass: 'text-gray-400',   labelClass: 'bg-gray-500/10 text-gray-300 ring-gray-500/20'   };
};

export default function ScoreBadge({ score }) {
  const { label, color, textClass, labelClass } = getConfig(score);

  // Animate stroke-dashoffset from full (hidden) to score-filled position
  const progress = useMotionValue(0);
  const dashOffset = useTransform(progress, [0, 100], [CIRCUMFERENCE, 0]);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reducedMotion) {
      progress.set(score);
      return;
    }
    const controls = animate(progress, score, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1], // expo-out
      delay: 0.3,
    });
    return () => controls.stop();
  }, [score, progress, reducedMotion]);

  return (
    <div className="flex flex-col items-center gap-2.5 flex-shrink-0">
      {/* SVG arc ring */}
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Track ring */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE}
          />
          {/* Score arc */}
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>

        {/* Score number centred inside ring */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${textClass}`}
          aria-label={`Match score ${score}%`}
        >
          <span className="text-[15px] font-bold tabular-nums leading-none">
            {score}%
          </span>
        </div>
      </div>

      {/* Label pill */}
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ring-1 whitespace-nowrap ${labelClass}`}
      >
        {label}
      </span>
    </div>
  );
}

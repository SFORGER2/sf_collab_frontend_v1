/**
 * ExplanationList — Task 5 (Premium Polish)
 *
 * Skills: impeccable · tasteskill · Emil-tier
 *
 * - Staggered fade+slide entry: each item reveals 40ms after the previous
 * - Visible styled scrollbar (violet-tinted thumb, transparent track)
 * - Verbatim rendering: no rewriting, no filtering, backend order preserved
 * - prefers-reduced-motion: instant render, no stagger
 */

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function ExplanationList({ items = [] }) {
  if (!items.length) return null;

  return (
    <div className="space-y-2.5">
      {/* Section label — one instance per card, acceptable per tasteskill §4.7 */}
      <p className="text-[11px] uppercase tracking-widest font-medium text-gray-500">
        Why Matched
      </p>

      {/* Verbatim bullet list — scroll if lengthy */}
      <motion.ul
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2 max-h-44 overflow-y-auto pr-2
          scrollbar-thin scrollbar-thumb-violet-500/30 scrollbar-track-transparent
          [scrollbar-gutter:stable]"
        aria-label="Match explanations"
      >
        {items.map((item, index) => (
          <motion.li
            key={index}
            variants={itemVariants}
            className="flex items-start gap-2.5 text-[13px] leading-snug text-gray-300"
          >
            <CheckCircle2
              className="w-3.5 h-3.5 mt-[2px] flex-shrink-0 text-violet-400"
              strokeWidth={2}
            />
            {/* Verbatim — no modification */}
            <span>{item}</span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

/**
 * AIMatchmakingSection — Tasks 1+2+7 (Premium Polish)
 *
 * Skills: impeccable · tasteskill · Emil-tier
 *
 * - Hairline separator above section (distinguishes from TechStack below)
 * - Section header: "Recommended Builders" + match count pill
 * - LoadingSkeleton (Task 7) — premium shimmer sweep
 * - Stagger: delayChildren 0.15, staggerChildren 0.1
 * - whileInView with margin -50px so cards don't pop in off-screen
 * - API call on mount, JWT auto-attached via apiClient interceptor
 * - Error handling deferred to Task 9 (silently caught)
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { matchmakingAPI } from '@/services/matchmakingAPI';
import MatchCard from './MatchCard';
import LoadingSkeleton from './LoadingSkeleton';

/** Parent stagger container for the card grid */
const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.1,
    },
  },
};

export default function AIMatchmakingSection({ startup }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!startup?.id) return;
    setLoading(true);
    matchmakingAPI
      .getRecommendations(startup.id)
      .then((data) => setMatches(data))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, [startup?.id]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Separator — visually separates from TechStack section above */}
      <div className="border-t border-gray-700/50" />

      {/* Section header */}
      <div className="flex items-center gap-3">
        <Sparkles className="w-4.5 h-4.5 text-violet-400 flex-shrink-0" strokeWidth={1.75} />

        <h2 className="text-[16px] font-semibold text-white">
          Recommended Builders
        </h2>

        {/* Match count pill — shown after data loads */}
        {!loading && matches.length > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium
            bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </span>
        )}

        {/* Subtitle — right-aligned on desktop */}
        <p className="hidden sm:block ml-auto text-[12px] text-gray-500">
          AI-matched from your vision requirements
        </p>
      </div>

      {/* Task 7 — Premium skeleton while loading */}
      {loading && <LoadingSkeleton count={3} />}

      {/* Success — staggered card grid */}
      {!loading && matches.length > 0 && (
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {matches.map((match) => (
            <MatchCard key={match.builder_id} match={match} />
          ))}
        </motion.div>
      )}
    </motion.section>
  );
}

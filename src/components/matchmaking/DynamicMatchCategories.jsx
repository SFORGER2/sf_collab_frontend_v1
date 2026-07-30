import React from "react";
import { motion } from "framer-motion";
import MatchCard from "./MatchCard";
import { mapBackendMatchToCard } from '@/utils/matchMapping';

const MatchCategorySection = ({ title, matches }) => {
  if (!matches || matches.length === 0) return null;
  const cardMatches = matches.map(mapBackendMatchToCard);

  return (
    <div className="mb-10 w-full">
      {/* Scale heading on mobile — text-lg base, sm:text-xl on tablet+ */}
      <h3 className="mb-6 text-lg sm:text-xl font-bold text-white tracking-wide">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-6 pt-2">
        {cardMatches.map((cardMatch, idx) => (
          // Stagger each card entrance — 60ms apart, strong ease-out cubic-bezier
          <motion.div
            key={cardMatch.id || idx}
            className="h-full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.28,
              delay: idx * 0.06,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            <MatchCard match={cardMatch} compact={false} className="h-full" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function DynamicMatchCategories({ matchData }) {
  if (!matchData || typeof matchData !== 'object') {
    return null;
  }

  const categoryEntries = Object.entries(matchData);

  return (
    <div className="space-y-6">
      {categoryEntries.map(([categoryTitle, matches]) => (
        <MatchCategorySection
          key={categoryTitle}
          title={categoryTitle}
          matches={matches}
        />
      ))}
    </div>
  );
}
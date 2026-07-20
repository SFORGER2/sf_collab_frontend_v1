import React from "react";
import { motion } from "framer-motion";
import MatchCard from "./MatchCard";
import { mapBackendMatchToCard } from '@/utils/matchMapping';

// Fallback mock data in case no data is provided via props
const MOCK_MATCH_DATA = {
  "Talent for Your Startup": [
    {
      id: "1",
      kind: "builder",
      name: "Alice Chen",
      role: "Full Stack Developer",
      matchScore: 94,
      aiExplanation: "Alice has strong React and Node.js experience matching your stack requirements.",
      reasons: ["React expert", "Shipped 3 SaaS products"],
      meta: { skills: "React, Node.js, Tailwind" }
    },
    {
      id: "2",
      kind: "builder",
      name: "Bob Smith",
      role: "UI/UX Designer",
      matchScore: 88,
      aiExplanation: "Bob has a proven track record designing fintech dashboards.",
      reasons: ["Figma pro", "Fintech experience"],
      meta: { skills: "Figma, User Research" }
    }
  ],
  "Mentors for Your Startup": [],
  "Startups Looking for Your Skills": [
    {
      id: "3",
      kind: "startup",
      name: "TechFlow Inc.",
      role: "Looking for Lead Engineer",
      matchScore: 91,
      aiExplanation: "TechFlow is actively seeking a Lead Engineer with your exact skill set.",
      reasons: ["Needs React lead", "Seed stage"],
      meta: { stage: "Seed", company: "B2B SaaS" }
    }
  ],
  "Potential Co-founders": [],
  "Startups You Could Mentor": []
};

const MatchCategorySection = ({ title, matches }) => {
  if (!matches || matches.length === 0) return null;
  const cardMatches = matches.map(mapBackendMatchToCard);

  return (
    <div className="mb-10 w-full">
      <h3 className="mb-6 px-4 text-xl font-bold text-white tracking-wide">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 pb-6 pt-2">
        {cardMatches.map((cardMatch, idx) => (
          <div key={cardMatch.id || idx} className="h-full">
            <MatchCard match={cardMatch} compact={false} className="h-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DynamicMatchCategories({ matchData }) {
  const dataToRender = matchData || MOCK_MATCH_DATA;

  if (!dataToRender || typeof dataToRender !== 'object') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full py-6"
    >
      {Object.entries(dataToRender)
        .filter(([_, matches]) => Array.isArray(matches) && matches.length > 0)
        .map(([categoryTitle, matches]) => (
          <MatchCategorySection
            key={categoryTitle}
            title={categoryTitle}
            matches={matches}
          />
        ))}
    </motion.div>
  );
}
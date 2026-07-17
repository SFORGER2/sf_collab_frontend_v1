import React from "react";
import { motion } from "framer-motion";
import MatchCard from "./MatchCard";

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
  "Mentors for Your Startup": [], // This should be ignored
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
  // Ignore missing or empty categories
  if (!matches || matches.length === 0) return null;

  return (
    <div className="mb-10 w-full">
      <h3 className="mb-6 px-4 text-xl font-bold text-white tracking-wide">
        {title}
      </h3>

      {/* Horizontally scrollable container */}
      {/* Using snap-x for smooth carousel-like scrolling */}
      <div className="flex gap-6 overflow-x-auto px-4 pb-6 pt-2 snap-x snap-mandatory scroll-smooth scrollbar-hide">
        {matches.map((match, idx) => (
          <div key={match.id || idx} className="w-[320px] sm:w-[380px] shrink-0 snap-center sm:snap-start">
            <MatchCard match={match} compact={false} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DynamicMatchCategories({ matchData }) {
  // Use provided data or fallback to mock data
  const dataToRender = matchData || MOCK_MATCH_DATA;

  // Safety check
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
        // Filter out empty arrays
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

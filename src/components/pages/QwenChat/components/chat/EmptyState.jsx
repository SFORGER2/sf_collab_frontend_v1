import React from "react";
import { motion } from "framer-motion";

export default function EmptyState({ onSelectPrompt, renderInputArea }) {
  const promptCards = [
    {
      title: "Generate React Component",
      icon: "code",
    },
    {
      title: "Analyze & Debug Code",
      icon: "bug_report",
    },
    {
      title: "Summarize Documentation",
      icon: "description",
    },
    {
      title: "System Architecture Design",
      icon: "schema",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[75vh] w-full max-w-[768px] mx-auto px-4 md:px-6 my-auto relative z-10"
    >
      <h1 className="font-sans text-2xl md:text-3xl font-semibold text-[#F7F8FA] tracking-tight mb-8 text-center select-none">
        What can I help with today?
      </h1>

      <div className="w-full mb-6">
        {renderInputArea && renderInputArea()}
      </div>

      <div className="flex flex-col items-start gap-1 w-full max-w-[768px] px-4 md:px-6">
        {promptCards.map((card, idx) => (
          <motion.button
            key={idx}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: 0.05 + idx * 0.03 }}
            onClick={() => onSelectPrompt(card.title)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-left text-[#A9B3C4] hover:text-[#F7F8FA] hover:bg-[#131925] transition-all cursor-pointer group"
          >
            <span className="material-symbols-outlined text-[18px] text-[#7CA6FF] group-hover:scale-110 transition-transform">
              {card.icon}
            </span>
            <span className="text-[14px] font-sans font-medium text-[#D1D5DB] group-hover:text-[#F7F8FA]">
              {card.title}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

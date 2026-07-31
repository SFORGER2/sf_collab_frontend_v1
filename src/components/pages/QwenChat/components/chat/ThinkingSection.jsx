import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThinkingSection({ thinking, thinkingTime, tokens }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full bg-[#131925] border-0 radius-ai-md p-3 text-ai-subtext transition-all duration-200">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-[#A9B3C4] font-mono text-ai-subtext hover:text-[#F7F8FA] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none rounded-lg p-0.5 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <span className="w-1 h-3.5 bg-[#7CA6FF] rounded-full shrink-0" />
          <span className="font-medium text-[#F7F8FA] text-ai-subtext">Thought Process</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined icon-ai-md text-[#6F7B90] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-2 border-t border-[#1F2736] text-[#A9B3C4] font-mono text-ai-subtext leading-relaxed whitespace-pre-wrap">
              {thinking}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

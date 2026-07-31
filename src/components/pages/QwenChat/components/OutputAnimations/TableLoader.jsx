import React from "react";
import { motion } from "framer-motion";

export default function TableLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full my-4 overflow-x-auto custom-workspace-scrollbar select-none transform-gpu"
    >
      <div className="w-full border-0 pb-3 px-4 flex items-center justify-between">
        {[1, 2, 3, 4].map((col) => (
          <div key={col} className="h-3.5 w-24 rounded bg-[#7CA6FF]/35" />
        ))}
      </div>

      <div className="divide-y divide-[rgba(170,190,255,0.06)]">
        {[1, 2, 3, 4].map((row) => (
          <div key={row} className="py-3.5 px-4 flex items-center justify-between">
            <motion.div
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: row * 0.1 }}
              className="h-3.5 w-28 rounded bg-[#F7F8FA]/25"
            />
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: row * 0.15 }}
              className="h-3.5 w-20 rounded bg-[#A9B3C4]/20"
            />
            <motion.div
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: row * 0.2 }}
              className="h-3.5 w-16 rounded bg-[#3DDC97]/25"
            />
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: row * 0.25 }}
              className="h-3.5 w-24 rounded bg-[#A9B3C4]/20"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

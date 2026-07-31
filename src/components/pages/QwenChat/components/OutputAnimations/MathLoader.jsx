import React from "react";
import { motion } from "framer-motion";

export default function MathLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full my-4 py-3 flex items-center justify-center gap-4 select-none transform-gpu"
    >
      <span className="text-2xl font-serif font-bold text-[#F7F8FA]">&int;</span>
      <div className="flex flex-col items-center">
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
          className="h-3 w-14 rounded bg-[#F7F8FA]/35 mb-1"
        />
        <div className="w-18 h-0.5 bg-[#F7F8FA]/60" />
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.2 }}
          className="h-3 w-10 rounded bg-[#F7F8FA]/25 mt-1"
        />
      </div>
      <span className="text-xl text-[#F7F8FA] font-sans">=</span>
      <motion.div
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.3 }}
        className="h-3.5 w-16 rounded bg-[#F7F8FA]/35"
      />
    </motion.div>
  );
}

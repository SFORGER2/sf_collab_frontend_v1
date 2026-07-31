import React from "react";
import { motion } from "framer-motion";

export default function TerminalLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full rounded-[20px] bg-[#0D1118] border-0 p-5 shadow-2xl font-mono text-ai-subtext select-none my-3 relative overflow-hidden transform-gpu"
    >
      {/* Silky Smooth Ambient Shimmer */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: [0.4, 0, 0.2, 1] }}
        className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-[#3DDC97]/12 to-transparent pointer-events-none transform-gpu"
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-0 relative z-10">
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="material-symbols-outlined text-[18px] text-[#3DDC97]"
          >
            terminal
          </motion.span>
          <span className="text-[12px] font-mono font-medium text-[#3DDC97] tracking-wide uppercase bg-[#3DDC97]/10 px-2 py-0.5 rounded-md border-0">
            Executing Terminal Command
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-2 h-2 rounded-full bg-[#3DDC97] shadow-[0_0_8px_#3DDC97]"
          />
          <span className="text-[11px] font-mono text-[#6F7B90]">Running CLI...</span>
        </div>
      </div>

      {/* Simulated CLI Command Lines */}
      <div className="space-y-2.5 text-[13px] text-[#F7F8FA] relative z-10">
        {/* Command 1: $ npm run build */}
        <div className="flex items-center gap-2">
          <span className="text-[#3DDC97] font-bold">$</span>
          <span className="text-[#F7F8FA]">npm run build</span>
        </div>

        {/* Output Line 1: Progress Beam */}
        <div className="flex items-center gap-2 pl-3">
          <span className="text-[#A9B3C4]">building for production...</span>
          <motion.div
            animate={{ width: ["20%", "70%", "20%"] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: [0.4, 0, 0.2, 1] }}
            className="h-2 rounded bg-[#7CA6FF]/40 border border-[#7CA6FF]/50 shadow-[0_0_8px_rgba(124,166,255,0.2)]"
          />
        </div>

        {/* Output Line 2: Success Notice */}
        <div className="flex items-center gap-2 pl-3">
          <span className="text-[#3DDC97] font-bold">✓</span>
          <span className="text-[#3DDC97]">compiled successfully</span>
        </div>

        {/* Trailing Active Prompt */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[#3DDC97] font-bold">$</span>
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut" }}
            className="w-2 h-4 bg-[#3DDC97] rounded-xs shadow-[0_0_8px_#3DDC97]"
          />
        </div>
      </div>
    </motion.div>
  );
}

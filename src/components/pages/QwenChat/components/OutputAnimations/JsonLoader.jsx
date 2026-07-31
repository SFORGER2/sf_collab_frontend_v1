import React from "react";
import { motion } from "framer-motion";

export default function JsonLoader() {
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
        className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-[#7CA6FF]/12 to-transparent pointer-events-none transform-gpu"
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-0 relative z-10">
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="material-symbols-outlined text-[18px] text-[#7CA6FF]"
          >
            data_object
          </motion.span>
          <span className="text-[12px] font-mono font-medium text-[#7CA6FF] tracking-wide uppercase bg-[#7CA6FF]/10 px-2 py-0.5 rounded-md border-0">
            Parsing JSON Stream
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-2 h-2 rounded-full bg-[#3DDC97] shadow-[0_0_8px_#3DDC97]"
          />
          <span className="text-[11px] font-mono text-[#6F7B90]">Processing...</span>
        </div>
      </div>

      {/* Code Stream Lines with Silky Smooth Stagger & Pulses */}
      <div className="space-y-2.5 text-[13px] text-[#F7F8FA] relative z-10">
        <div className="text-[#7CA6FF] font-bold">&#123;</div>

        <div className="pl-4 border-0 space-y-2.5">
          {/* Key 1 */}
          <div className="flex items-center gap-2">
            <span className="text-[#7CA6FF] font-medium">"status":</span>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.99, 1.01, 0.99] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="h-3.5 w-12 rounded bg-[#FFC107]/40 border border-[#FFC107]/50 shadow-[0_0_10px_rgba(255,193,7,0.2)]"
            />
            <span className="text-[#F7F8FA]">,</span>
          </div>

          {/* Key 2 */}
          <div className="flex items-center gap-2">
            <span className="text-[#7CA6FF] font-medium">"data":</span>
            <span className="text-[#F7F8FA]">&#123;</span>
          </div>

          <div className="pl-4 border-l-2 border-[rgba(61,220,151,0.2)] space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[#7CA6FF] font-medium">"entity":</span>
              <motion.div
                animate={{ width: ["25%", "65%", "25%"] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: [0.4, 0, 0.2, 1] }}
                className="h-3.5 rounded bg-[#3DDC97]/40 border border-[#3DDC97]/50 shadow-[0_0_10px_rgba(61,220,151,0.2)]"
              />
              <span className="text-[#F7F8FA]">,</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#7CA6FF] font-medium">"valid":</span>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.3 }}
                className="h-3.5 w-14 rounded bg-[#FF6B6B]/40 border border-[#FF6B6B]/50 shadow-[0_0_10px_rgba(255,107,107,0.2)]"
              />
            </div>
          </div>

          <div className="text-[#F7F8FA]">&#125;</div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-[#7CA6FF] font-bold">&#125;</div>
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut" }}
            className="w-2 h-4 bg-[#7CA6FF] rounded-xs shadow-[0_0_8px_#7CA6FF]"
          />
        </div>
      </div>
    </motion.div>
  );
}

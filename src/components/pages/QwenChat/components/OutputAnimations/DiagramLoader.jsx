import React from "react";
import { motion } from "framer-motion";

export default function DiagramLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full min-h-[230px] rounded-[20px] bg-[#0D1118] border-0 p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between select-none my-3 transform-gpu"
    >
      {/* Cybernetic Matrix Grid Background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(124,166,255,0.25) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Silky Smooth Ambient Shimmer */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ repeat: Infinity, duration: 3, ease: [0.4, 0, 0.2, 1] }}
        className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-[#7CA6FF]/12 to-transparent pointer-events-none transform-gpu"
      />

      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-3 border-0 relative z-10">
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            className="material-symbols-outlined text-[18px] text-[#3DDC97]"
          >
            account_tree
          </motion.span>
          <span className="text-[12px] font-mono font-medium text-[#3DDC97] tracking-wide uppercase bg-[#3DDC97]/10 px-2 py-0.5 rounded-md border-0">
            Compiling Mermaid Diagram
          </span>
        </div>

        <div className="flex items-center gap-2">
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-2 h-2 rounded-full bg-[#7CA6FF] shadow-[0_0_8px_#7CA6FF]"
          />
          <span className="text-[11px] font-mono text-[#6F7B90]">Synthesizing...</span>
        </div>
      </div>

      {/* Ultra-Smooth Graph Network Animation */}
      <div className="relative z-10 flex items-center justify-between px-6 py-6 my-auto">
        {/* Node 1 */}
        <motion.div
          animate={{
            scale: [0.97, 1.03, 0.97],
            boxShadow: [
              "0 0 12px rgba(124,166,255,0.15)",
              "0 0 22px rgba(124,166,255,0.35)",
              "0 0 12px rgba(124,166,255,0.15)",
            ],
          }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="w-26 h-13 rounded-xl bg-[#131925] border-2 border-[#7CA6FF]/60 flex items-center justify-center p-2.5 transform-gpu"
        >
          <div className="w-full space-y-1.5">
            <div className="h-2 w-14 rounded bg-[#7CA6FF]/70 mx-auto" />
            <div className="h-1.5 w-10 rounded bg-[#7CA6FF]/35 mx-auto" />
          </div>
        </motion.div>

        {/* Pulsing Connecting Beam 1 */}
        <div className="flex-1 h-0.5 bg-gradient-to-r from-[#7CA6FF]/40 to-[#FFC107]/40 relative mx-3 flex items-center">
          <motion.span
            animate={{ x: ["0%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            className="w-3 h-3 rounded-full bg-[#7CA6FF] shadow-[0_0_12px_#7CA6FF] transform-gpu"
          />
        </div>

        {/* Node 2 (Rhombus) */}
        <motion.div
          animate={{
            rotate: 45,
            scale: [0.95, 1.05, 0.95],
            boxShadow: [
              "0 0 12px rgba(255,193,7,0.15)",
              "0 0 22px rgba(255,193,7,0.35)",
              "0 0 12px rgba(255,193,7,0.15)",
            ],
          }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.3 }}
          className="w-12 h-12 bg-[#171E2B] border-2 border-[#FFC107]/70 flex items-center justify-center shrink-0 rounded-lg transform-gpu"
        >
          <div className="-rotate-45 w-2.5 h-2.5 rounded-full bg-[#FFC107] shadow-[0_0_8px_#FFC107]" />
        </motion.div>

        {/* Pulsing Connecting Beam 2 */}
        <div className="flex-1 h-0.5 bg-gradient-to-r from-[#FFC107]/40 to-[#3DDC97]/40 relative mx-3 flex items-center">
          <motion.span
            animate={{ x: ["0%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.4 }}
            className="w-3 h-3 rounded-full bg-[#3DDC97] shadow-[0_0_12px_#3DDC97] transform-gpu"
          />
        </div>

        {/* Node 3 */}
        <motion.div
          animate={{
            scale: [0.97, 1.03, 0.97],
            boxShadow: [
              "0 0 12px rgba(61,220,151,0.15)",
              "0 0 22px rgba(61,220,151,0.35)",
              "0 0 12px rgba(61,220,151,0.15)",
            ],
          }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.6 }}
          className="w-26 h-13 rounded-xl bg-[#131925] border-2 border-[#3DDC97]/60 flex items-center justify-center p-2.5 transform-gpu"
        >
          <div className="w-full space-y-1.5">
            <div className="h-2 w-14 rounded bg-[#3DDC97]/70 mx-auto" />
            <div className="h-1.5 w-10 rounded bg-[#3DDC97]/35 mx-auto" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

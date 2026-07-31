import React from 'react';
import { motion } from 'framer-motion';

export default function CodeLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full rounded-xl bg-[#090C12] border-0 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] font-mono text-ai-subtext select-none my-2"
    >
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#10141D] border-0">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B]/90 shadow-[0_0_6px_rgba(255,107,107,0.4)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFC107]/90 shadow-[0_0_6px_rgba(255,193,7,0.4)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#3DDC97]/90 shadow-[0_0_6px_rgba(61,220,151,0.4)]" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-[#6F7B90]">code</span>
        </div>
      </div>

      <div className="p-4 flex gap-4 bg-[#090C12]/90 relative overflow-hidden">
        <motion.div
          animate={{ y: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
          className="absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-[#7CA6FF]/5 to-transparent pointer-events-none"
        />

        <div className="flex flex-col gap-2.5 text-[#3E4756] text-right font-mono text-[11px] select-none border-0 pr-3">
          <span>01</span>
          <span>02</span>
          <span>03</span>
        </div>

        <div className="flex-1 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
              className="h-3 w-28 rounded-md bg-[#7CA6FF]/40"
            />
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut', delay: 0.15 }}
              className="h-3 w-16 rounded-md bg-[#3DDC97]/40"
            />
          </div>

          <div className="flex items-center gap-2 pl-4">
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut', delay: 0.2 }}
              className="h-3 w-40 rounded-md bg-[#FFC107]/30"
            />
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.7 }}
              className="w-2 h-3.5 bg-[#7CA6FF] rounded-xs shadow-[0_0_6px_#7CA6FF]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

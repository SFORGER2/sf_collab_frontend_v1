import React from 'react';
import { motion } from 'framer-motion';

const SHIMMER_ROWS = [
  { w: 'w-40', delay: 0 },
  { w: 'w-24', delay: 0.08 },
];

export default function FileLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full max-w-sm rounded-xl bg-[#131925] border-0 shadow-[0_4px_20px_rgba(0,0,0,0.28)] overflow-hidden my-2 select-none"
    >
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="w-10 h-10 rounded-xl bg-[#1B2232] border-0 flex items-center justify-center shrink-0 shadow-[0_0_14px_rgba(124,166,255,0.12)]"
        >
          <span className="material-symbols-outlined text-[20px] text-[#7CA6FF]/70">
            draft
          </span>
        </motion.div>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {SHIMMER_ROWS.map(({ w, delay }, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.35, 0.7, 0.35] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', delay }}
              className={`h-2.5 ${w} rounded-md bg-[#7CA6FF]/20`}
            />
          ))}

          <div className="w-full h-1 rounded-full bg-[#0D1118] overflow-hidden mt-0.5">
            <motion.div
              animate={{ x: ['-100%', '120%'] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#7CA6FF]/60 to-transparent"
            />
          </div>
        </div>

        <div className="w-8 h-8 rounded-lg bg-[#1B2232] border-0 shrink-0" />
      </div>

      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0D1118]/60 border-0">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="h-2 w-8 rounded bg-[#7CA6FF]/20"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', delay: 0.3 }}
          className="h-2 w-14 rounded bg-[#3E4756]/50"
        />
      </div>
    </motion.div>
  );
}

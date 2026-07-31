import React from 'react';
import { motion } from 'framer-motion';

export default function MarkdownLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="w-full flex flex-col gap-3 py-2 select-none"
    >
      <div className="flex items-center gap-2">
        <span className="text-[#7CA6FF] font-bold text-ai-body-md">#</span>
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          className="h-4 w-48 rounded-md bg-[#7CA6FF]/35"
        />
      </div>

      <div className="space-y-2.5 pl-3 border-0 my-1">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7CA6FF]" />
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut', delay: item * 0.15 }}
              className={`h-3 rounded-md bg-[#A9B3C4]/25 ${
                item === 1 ? 'w-3/4' : item === 2 ? 'w-5/6' : 'w-2/3'
              }`}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

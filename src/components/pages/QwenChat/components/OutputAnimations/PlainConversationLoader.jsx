import React from 'react';
import { motion } from 'framer-motion';

export default function PlainConversationLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#131925]/90 backdrop-blur-md border-0 shadow-[0_4px_24px_rgba(124,166,255,0.08)] select-none my-1"
    >
      <div className="relative flex items-center justify-center w-3.5 h-3.5">
        <motion.span
          animate={{ scale: [0.85, 1.5, 0.85], opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-[#7CA6FF]/40 blur-[3px]"
        />
        <span className="w-2 h-2 rounded-full bg-[#7CA6FF] relative z-10 shadow-[0_0_10px_#7CA6FF]" />
      </div>

      <div className="flex items-center gap-1.5">
        {[0, 0.18, 0.36].map((delay, index) => (
          <motion.span
            key={index}
            animate={{
              scale: [0.8, 1.25, 0.8],
              opacity: [0.35, 1, 0.35],
              backgroundColor: ["#7CA6FF", "#91B6FF", "#7CA6FF"],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: "easeInOut",
              delay,
            }}
            className="w-1.5 h-1.5 rounded-full shadow-[0_0_6px_rgba(124,166,255,0.4)]"
          />
        ))}
      </div>

      <span className="text-[11px] font-mono text-[#A9B3C4] font-medium tracking-wide">
        Thinking
      </span>
    </motion.div>
  );
}

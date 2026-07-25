// src/components/assistant/TypingIndicator.jsx
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Three-dot animated typing indicator.
 * Used while the AI is generating a response.
 */
export default function TypingIndicator() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/60 border border-white/8 w-fit"
      role="status"
      aria-label="AI is thinking"
      aria-live="polite"
    >
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) =>
          shouldReduceMotion ? (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-60"
            />
          ) : (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blue-400"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.18,
                ease: 'easeOut',
              }}
            />
          )
        )}
      </div>
      <span className="text-[10px] text-zinc-500 font-roboto">
        AI is thinking…
      </span>
    </div>
  );
}

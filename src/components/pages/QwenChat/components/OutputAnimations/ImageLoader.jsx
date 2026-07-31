import React from 'react';
import { motion } from 'framer-motion';

export default function ImageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full h-44 rounded-xl bg-[#0B0F17] border-0 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] my-2 select-none"
    >
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(#7CA6FF 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      />

      <motion.div
        animate={{ y: ['-100%', '250%'] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-[#7CA6FF]/20 to-transparent border-b border-[#7CA6FF]/50 pointer-events-none"
      />

      <div className="relative z-10 flex items-center justify-center w-12 h-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-[#7CA6FF]/40"
        />
        <div className="w-10 h-10 rounded-full bg-[#131925] border border-[#7CA6FF]/40 flex items-center justify-center shadow-[0_0_20px_rgba(124,166,255,0.2)]">
          <span className="material-symbols-outlined icon-ai-md text-[#7CA6FF] animate-pulse">
            image
          </span>
        </div>
      </div>
    </motion.div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({ icon: Icon, label, value, accent, sub, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 ${className}`}
    style={{ borderTop: `3px solid ${accent}` }}
  >
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-5 h-5" style={{ color: accent }} />
      <span className="text-xs uppercase tracking-widest text-zinc-500">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
  </motion.div>
);
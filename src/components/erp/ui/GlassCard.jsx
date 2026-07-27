import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({ children, className, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-[#121215] border border-zinc-800/80 rounded-3xl p-6 ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);
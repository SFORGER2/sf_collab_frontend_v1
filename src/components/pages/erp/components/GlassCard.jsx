import React from "react";
import { motion } from "framer-motion";

export const GlassCard = ({ children, className = "", onClick }) => (
  <motion.div 
    whileHover={onClick ? { y: -2, backgroundColor: "rgba(255,255,255,0.02)" } : {}}
    onClick={onClick}
    className={`bg-[#0d0d0f] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

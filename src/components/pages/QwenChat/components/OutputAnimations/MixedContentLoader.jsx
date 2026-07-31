import React from 'react';
import { motion } from 'framer-motion';
import LongExplanationLoader from './LongExplanationLoader';
import CodeLoader from './CodeLoader';

export default function MixedContentLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full flex flex-col gap-4 py-2"
    >
      <LongExplanationLoader />
      <CodeLoader />
    </motion.div>
  );
}

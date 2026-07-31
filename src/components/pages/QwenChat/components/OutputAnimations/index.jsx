import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { detectResponseCategory } from './responseCategoryDetector';

import PlainConversationLoader  from './PlainConversationLoader';
import CodeLoader               from './CodeLoader';
import TerminalLoader           from './TerminalLoader';
import JsonLoader               from './JsonLoader';
import TableLoader              from './TableLoader';
import LongExplanationLoader    from './LongExplanationLoader';
import MathLoader               from './MathLoader';
import DiagramLoader            from './DiagramLoader';
import ImageLoader              from './ImageLoader';
import FileLoader               from './FileLoader';
import MixedContentLoader       from './MixedContentLoader';

const LOADER_MAP = {
  code:             CodeLoader,
  terminal:         TerminalLoader,
  json:             JsonLoader,
  csv:              CodeLoader,        // CSV uses CodeLoader animation until rendered
  table:            TableLoader,
  markdown:         LongExplanationLoader,
  long_explanation: LongExplanationLoader,
  mathematics:      MathLoader,
  mermaid:          DiagramLoader,
  image:            ImageLoader,
  file:             FileLoader,
  mixed:            MixedContentLoader,
  plain_text:       PlainConversationLoader,
};

export default function OutputAnimations({ content = '', isLoading = false, children }) {
  const [lockedCategory, setLockedCategory] = useState(null);

  useEffect(() => {
    if (lockedCategory) return;

    const detected = detectResponseCategory(content);
    if (detected !== 'pending') {
      setLockedCategory(detected);
    }
  }, [content, lockedCategory]);

  const hasContent = Boolean(content && content.trim());
  const ActiveLoader = (lockedCategory && LOADER_MAP[lockedCategory]) || PlainConversationLoader;

  return (
    <div className="w-full relative">
      <AnimatePresence>
        {!hasContent && isLoading ? (
          <motion.div
            key={`stage1-${lockedCategory || 'pending'}`}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="w-full my-1"
          >
            <ActiveLoader />
          </motion.div>
        ) : (
          <motion.div
            key="stage-output-container"
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="w-full relative flex flex-col gap-2"
          >
            {isLoading && hasContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131925]/90 border-0 text-[11px] font-mono text-[#7CA6FF] w-max shadow-sm mb-1 select-none"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#7CA6FF] animate-ping" />
                <span className="text-[10px] font-medium tracking-wide">Generating</span>
              </motion.div>
            )}

            <div className="w-full select-text">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { OutputAnimations as GenerationRenderer };


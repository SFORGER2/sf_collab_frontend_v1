import React from "react";
import { motion } from "framer-motion";

export default function ErrorMessage({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="flex items-start gap-3 w-full"
    >
      <div className="emblem-ai-sm bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 flex items-center justify-center shrink-0 mt-0.5">
        <span className="material-symbols-outlined icon-ai-md text-[#FF6B6B]">
          error
        </span>
      </div>

      <div className="flex flex-col gap-2.5 w-full bg-[#131925] p-4 radius-ai-md border border-[#FF6B6B]/30 text-[#F7F8FA] shadow-xs">
        <div className="flex items-center justify-between">
          <span className="font-mono text-ai-label uppercase tracking-wider text-[#FF6B6B] font-semibold">
            System Alert
          </span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 h-7 btn-ai-sm px-2.5 bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 border border-[#FF6B6B]/30 text-[#FF6B6B] radius-ai-sm text-ai-label font-semibold focus-visible:ring-1 focus-visible:ring-[#FF6B6B] outline-none transition-all active:scale-95 cursor-pointer font-sans"
            >
              <span className="material-symbols-outlined icon-ai-sm">refresh</span>
              <span>Retry</span>
            </button>
          )}
        </div>

        <p className="text-ai-body-md leading-relaxed text-[#F7F8FA] font-sans">
          {message.content}
        </p>

        {message.timestamp && (
          <span className="text-ai-caption text-[#6F7B90] block font-mono">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </motion.div>
  );
}

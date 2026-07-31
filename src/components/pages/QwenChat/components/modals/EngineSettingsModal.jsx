import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EngineSettingsModal({
  showSettingsModal,
  setShowSettingsModal,
  modelResponseType,
  setModelResponseType,
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
  systemPrompt,
  setSystemPrompt
}) {
  if (!showSettingsModal) return null;

  return (
    <AnimatePresence>
      <div
        onClick={() => setShowSettingsModal(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090D]/80 backdrop-blur-sm p-4"
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Qwen AI engine parameters"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl border-0 bg-[#141A26] text-[#F7F8FA] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.5)] space-y-5"
        >
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7CA6FF] text-[19px]">tune</span>
              <h3 className="text-[15px] font-semibold">Qwen AI engine parameters</h3>
            </div>
            <button
              onClick={() => setShowSettingsModal(false)}
              aria-label="Close settings"
              className="text-[#6F7B90] hover:text-[#F7F8FA] p-1 rounded-lg hover:bg-[#1D2636] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">close</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-[#A9B3C4] mb-1.5">Response engine mode</label>
              <select
                value={modelResponseType}
                onChange={(e) => setModelResponseType(e.target.value)}
                className="w-full rounded-xl bg-[#1B2232] p-2.5 text-[#F7F8FA] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none cursor-pointer"
              >
                <option value="general_knowledge">General reasoning & coding (Qwen 2.5 32B)</option>
                <option value="page_context">Enterprise RAG & domain knowledge (Qwen Enterprise)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="font-medium text-[#A9B3C4]">Temperature ({temperature})</label>
                <span className="text-[#64748B]">0.0 deterministic – 1.0 creative</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#7CA6FF] bg-[#1B2232] h-2 rounded-lg cursor-pointer focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="font-medium text-[#A9B3C4]">Max output tokens ({maxTokens})</label>
                <span className="text-[#64748B]">Upper bound generation limit</span>
              </div>
              <input
                type="number"
                min="256"
                max="8192"
                step="256"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
                className="w-full rounded-xl bg-[#1B2232] p-2.5 text-[#F7F8FA] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-[#A9B3C4] mb-1.5">System instructions</label>
              <textarea
                rows={3}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Enter custom persona or system constraints..."
                className="w-full rounded-xl bg-[#1B2232] p-2.5 text-[#F7F8FA] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="px-4 py-2 rounded-xl bg-[#1D2636] hover:bg-[#232B3A] text-[#A9B3C4] hover:text-[#F7F8FA] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-colors cursor-pointer text-xs font-medium"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

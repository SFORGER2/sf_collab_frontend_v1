import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchModal({
  showSearchModal,
  setShowSearchModal,
  modalSearchInput,
  setModalSearchInput,
  modalSearchResults,
  handleSelectConversation,
  searchInputRef,
}) {
  if (!showSearchModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowSearchModal(false)}
        className="fixed inset-0 z-50 bg-[#07090D]/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Search conversations"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#141A26] border-0 p-5 radius-ai-lg w-full max-w-xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] space-y-4 text-[#F7F8FA]"
        >
          {/* Modal Top Search Row */}
          <div className="flex items-center justify-between border-b border-[#1F2736] pb-3">
            <input
              ref={searchInputRef}
              type="text"
              value={modalSearchInput}
              onChange={(e) => setModalSearchInput(e.target.value)}
              placeholder="Search chats..."
              aria-label="Search conversations input"
              className="w-full bg-transparent text-ai-body-md text-[#F7F8FA] placeholder:text-[#6F7B90] outline-none font-sans focus-visible:ring-2 focus-visible:ring-[#7CA6FF]/50 radius-ai-xs px-2 py-1"
            />
            <button
              type="button"
              onClick={() => setShowSearchModal(false)}
              aria-label="Close search dialog"
              className="text-[#6F7B90] hover:text-[#F7F8FA] p-1 radius-ai-sm focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-colors cursor-pointer text-ai-subtext"
            >
              ✕
            </button>
          </div>

          {/* Subtitle Section Header */}
          <div className="text-[10px] font-mono font-semibold text-[#505D73] uppercase tracking-wider px-1">
            Recent chats
          </div>

          {/* Searchable Recent Chats List */}
          <div className="max-h-[320px] overflow-y-auto custom-workspace-scrollbar space-y-0.5 pr-1">
            {modalSearchResults.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className="flex items-center px-3 py-2 btn-ai-md radius-ai-sm hover:bg-[#232B3A] transition-all cursor-pointer select-none text-ai-body-sm text-[#F7F8FA]"
              >
                <span className="truncate font-sans tracking-wide text-ai-body-sm">
                  {conv.title}
                </span>
              </div>
            ))}

            {modalSearchResults.length === 0 && (
              <div className="py-8 text-center text-[#6F7B90] text-ai-subtext font-mono">
                No matching conversations found
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

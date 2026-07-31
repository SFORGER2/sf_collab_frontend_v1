import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export default function ContextMenu({
  contextMenuData,
  activeContextConv,
  handleShare,
  handleStartRename,
  togglePin,
  handleArchiveConv,
  deleteConv,
  setContextMenuData,
}) {
  if (!contextMenuData || !activeContextConv) return null;

  // Clamp left position dynamically to prevent off-screen rendering on mobile viewports (< 768px)
  const menuWidth = 210;
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const maxLeft = Math.max(12, viewportWidth - menuWidth - 16);
  const clampedLeft = Math.min(contextMenuData.left, maxLeft);

  return (
    <AnimatePresence>
      <motion.div
        role="menu"
        aria-label="Conversation Options"
        initial={{ opacity: 0, scale: 0.94, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: -4 }}
        transition={{ duration: 0.14, ease: "easeOut" }}
        style={{
          top: `${contextMenuData.top}px`,
          left: `${clampedLeft}px`,
        }}
        onClick={(e) => e.stopPropagation()}
        className="fixed bg-[#141A26] border-0 radius-ai-md p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.48)] backdrop-blur-xl z-50 min-w-[210px] flex flex-col gap-0.5 text-ai-body-sm font-sans text-[#F7F8FA]"
      >
        {/* Share */}
        <button
          role="menuitem"
          type="button"
          onClick={(e) => handleShare(activeContextConv.id, e)}
          className="w-full flex items-center gap-2.5 px-3 py-2 btn-ai-md radius-ai-sm hover:bg-[#232B3A] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-all text-left cursor-pointer font-medium text-ai-body-sm"
        >
          <span className="material-symbols-outlined icon-ai-md text-[#A9B3C4]">ios_share</span>
          <span>Share</span>
        </button>

        {/* Rename */}
        <button
          role="menuitem"
          type="button"
          onClick={(e) => handleStartRename(activeContextConv, e)}
          className="w-full flex items-center gap-2.5 px-3 py-2 btn-ai-md radius-ai-sm hover:bg-[#232B3A] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-all text-left cursor-pointer font-medium text-ai-body-sm"
        >
          <span className="material-symbols-outlined icon-ai-md text-[#A9B3C4]">edit</span>
          <span>Rename</span>
        </button>

        {/* Move to project */}
        <button
          role="menuitem"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toast.info("Move to project coming soon", { position: "bottom-right", autoClose: 1500, theme: "dark" });
            setContextMenuData(null);
          }}
          className="w-full flex items-center justify-between px-3 py-2 btn-ai-md radius-ai-sm hover:bg-[#232B3A] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-all text-left cursor-pointer font-medium text-ai-body-sm"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined icon-ai-md text-[#A9B3C4]">folder</span>
            <span>Move to project</span>
          </div>
          <span className="material-symbols-outlined icon-ai-md text-[#6F7B90]">chevron_right</span>
        </button>

        {/* Pin Chat */}
        <button
          role="menuitem"
          type="button"
          onClick={(e) => {
            togglePin(activeContextConv.id, e);
            setContextMenuData(null);
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 btn-ai-md radius-ai-sm hover:bg-[#232B3A] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-all text-left cursor-pointer font-medium text-ai-body-sm"
        >
          <span className="material-symbols-outlined icon-ai-md text-[#A9B3C4]">push_pin</span>
          <span>{activeContextConv.isPinned ? 'Unpin chat' : 'Pin chat'}</span>
        </button>

        {/* Archive */}
        <button
          role="menuitem"
          type="button"
          onClick={(e) => handleArchiveConv(activeContextConv.id, e)}
          className="w-full flex items-center gap-2.5 px-3 py-2 btn-ai-md radius-ai-sm hover:bg-[#232B3A] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-all text-left cursor-pointer font-medium text-ai-body-sm"
        >
          <span className="material-symbols-outlined icon-ai-md text-[#A9B3C4]">archive</span>
          <span>Archive</span>
        </button>

        {/* Delete */}
        <button
          role="menuitem"
          type="button"
          onClick={(e) => deleteConv(activeContextConv.id, e)}
          className="w-full flex items-center gap-2.5 px-3 py-2 btn-ai-md radius-ai-sm hover:bg-[#FF6B6B]/15 focus-visible:ring-1 focus-visible:ring-[#FF6B6B] outline-none transition-all text-left cursor-pointer font-medium text-ai-body-sm text-[#F87171]"
        >
          <span className="material-symbols-outlined icon-ai-md text-[#F87171]">delete</span>
          <span>Delete</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

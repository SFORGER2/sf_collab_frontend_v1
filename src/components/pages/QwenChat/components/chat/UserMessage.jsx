import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

function UserMessage({ message, onRewrite }) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      autoResize();
    }
  }, [editing]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleCopy = () => {
    if (message?.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success("Prompt copied to clipboard", {
        position: "bottom-right",
        autoClose: 1500,
        theme: "dark",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEditOpen = () => {
    setDraft(message.content);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setDraft(message.content);
  };

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setEditing(false);
    if (onRewrite) onRewrite(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="flex flex-col items-end gap-1.5 w-full group relative select-text"
    >
      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="w-full max-w-[85%] sm:max-w-[80%] bg-[#131925] rounded-2xl px-4 pt-3 pb-3 flex flex-col gap-3"
          >
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => { setDraft(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              rows={1}
              className="w-full bg-transparent text-[14px] md:text-[15px] leading-relaxed text-[#F7F8FA] font-sans tracking-normal resize-none outline-none placeholder-[#4B5568] overflow-hidden"
              placeholder="Edit your message…"
              style={{ minHeight: '24px' }}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-[#8592A6] hover:text-[#F7F8FA] bg-[#1D2636] hover:bg-[#253044] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!draft.trim()}
                className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-[#0D111A] bg-[#7CA6FF] hover:bg-[#91B6FF] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Send
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="bg-[#131925] border-0 rounded-full px-5 py-2.5 max-w-[85%] sm:max-w-[80%] text-[#F7F8FA] shadow-xs"
          >
            <p className="text-[14px] md:text-[15px] leading-relaxed whitespace-pre-wrap font-sans text-[#F7F8FA] tracking-normal">
              {message.content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!editing && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 pr-1">
          <button
            type="button"
            onClick={handleCopy}
            className="p-0.5 rounded flex items-center justify-center text-[#8592A6] hover:text-[#F7F8FA] hover:bg-[#1D2636] transition-colors cursor-pointer"
            title="Copy prompt"
            aria-label="Copy prompt"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', lineHeight: 1 }}>
              {copied ? "check" : "content_copy"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleEditOpen}
            className="p-0.5 rounded flex items-center justify-center text-[#8592A6] hover:text-[#F7F8FA] hover:bg-[#1D2636] transition-colors cursor-pointer"
            title="Rewrite / Edit prompt"
            aria-label="Rewrite / Edit prompt"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', lineHeight: 1 }}>
              edit
            </span>
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default React.memo(UserMessage);

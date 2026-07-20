/**
 * ChatNotification — Redesigned popup notification
 * Shows when a new message arrives while user is not in that chat
 * Features: sender avatar, message preview, slide-in animation, auto-dismiss
 */
import { X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationAvatar from "../pages/chat/NotificationAvatar";

export default function ChatNotification({
  isOpen,
  setIsOpen,
  title,
  url,
  message,
  conversationType = "direct",
  onClick,
}) {
  if (!message) return null;

  const isMobile =
    typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
  };

  const handleClick = () => {
    if (isMobile) {
      window.location.href = url;
    } else {
      onClick?.();
      setIsOpen(false);
    }
  };

  // Extract clean sender name (title can be "Name: preview text")
  const senderName = title?.includes(": ") ? title.split(": ")[0] : (title || "Someone");

  // Clean message preview
  const preview =
    typeof message === "string"
      ? message.length > 70 ? message.slice(0, 70) + "…" : message
      : message?.content
        ? message.content.length > 70 ? message.content.slice(0, 70) + "…" : message.content
        : "Sent a message";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 80, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.92 }}
          transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
          className="fixed bottom-20 right-4 z-[9999] w-[320px] pointer-events-auto"
          onClick={handleClick}
        >
          <div className="relative cursor-pointer rounded-2xl overflow-hidden shadow-2xl border border-white/[0.06] bg-zinc-900/95 backdrop-blur-xl hover:bg-zinc-800/95 transition-colors duration-150">

            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-indigo-500 to-violet-600 rounded-l-2xl" />

            {/* Dismiss button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-2.5 right-2.5 z-10 p-1 rounded-full bg-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-700 transition-all"
              aria-label="Dismiss"
            >
              <X size={11} />
            </button>

            {/* Content row */}
            <div className="flex items-start gap-3 pl-4 pr-3 pt-3.5 pb-3.5">
              {/* Avatar */}
              <div className="shrink-0 mt-0.5">
                <NotificationAvatar
                  src={null}
                  name={senderName}
                  type={conversationType}
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pr-5">
                {/* Header row */}
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                  <p className="text-[13px] font-semibold text-white truncate leading-tight">
                    {senderName}
                  </p>
                </div>

                {/* Subtitle */}
                <p className="text-[10px] text-zinc-500 mb-1.5 uppercase tracking-wide">
                  New message
                </p>

                {/* Message preview */}
                <p className="text-[12px] text-zinc-300 line-clamp-2 leading-relaxed">
                  {preview}
                </p>

                {/* CTA */}
                <p className="mt-2 text-[10px] font-semibold text-indigo-400 tracking-wider uppercase">
                  Tap to reply →
                </p>
              </div>
            </div>

            {/* Bottom progress bar (auto-dismiss indicator) */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-violet-600 origin-left"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 4, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
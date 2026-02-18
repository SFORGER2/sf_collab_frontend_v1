import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/chat (previous)/Avatar";

export default function ChatNotification({
  isOpen,
  setIsOpen,
  title,
  url,
  message,
  onClick
}) {
  if (!message) return null;
  const isMobile = window.matchMedia("(max-width: 640px)").matches;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="
            fixed bottom-24 right-4 z-[9999] w-80
            rounded-2xl border border-zinc-800
            bg-zinc-900 shadow-2xl
            cursor-pointer
            hover:bg-zinc-800 transition-colors
          "
          onClick={() => {
            if (isMobile) {
              window.location.href = url;
            } else {
              onClick();
              setIsOpen(false);
            }
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 pt-4">
            <Avatar src={url} name={title} size="sm" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm font-semibold text-white truncate">
                  {title}
                </span>
              </div>

              <span className="text-[11px] text-zinc-400">
                New message
              </span>
            </div>
          </div>

          {/* Message preview */}
          <div className="px-4 py-3">
            <p className="text-sm text-zinc-300 line-clamp-2">
              {message}
            </p>

            <p className="mt-2 text-xs text-amber-400 font-medium">
              Click to reply →
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

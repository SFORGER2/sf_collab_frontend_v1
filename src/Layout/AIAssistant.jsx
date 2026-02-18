import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Minus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import MessageBubble from "@/components/chat (previous)/MessageBubble";
import ChatInput from "@/components/chat (previous)/ChatInput";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { aiAPI } from "@/utils/APIs/aiAPI";

function normalizeMessage(m) {
  if (!m) return m;
  return {
    ...m,
    created_at: m.created_at || m.timestamp || new Date().toISOString(),
    sender: m.sender || { id: "ai", firstName: "AI Assistant" },
    sender_id: m.sender_id || "ai",
    content: m.content || m.message || "",
  };
}

export default function AIAssistant({ callback = () => {}, isMobile = false }) {
  const { user: currentUser, access_token: token } = useSelector(
    (state) => state.auth
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (content) => {
      if (!content?.trim() || !token) return;

      const userMessage = normalizeMessage({
        id: `user-${Date.now()}`,
        content: content.trim(),
        sender_id: currentUser?.id,
        sender: { id: currentUser?.id, firstName: currentUser?.firstName },
      });

      setMessages((prev) => [...prev, userMessage]);
      setDraft("");
      setIsLoading(true);

      try {
        const res = await aiAPI.queryAssistant(content.trim(), token);

        if (!res?.success) throw new Error(res?.message);

        const aiMessage = normalizeMessage({
          id: `ai-${Date.now()}`,
          content: res.data?.answer || "No response",
        });

        setMessages((prev) => [...prev, aiMessage]);
      } catch (e) {
        console.error(e);
        setMessages((prev) => [
          ...prev,
          normalizeMessage({
            id: `err-${Date.now()}`,
            content: "Something went wrong. Please try again.",
          }),
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [token, currentUser]
  );

  const handleAdminFileUpload = async (file) => {
    if (!token) return null;
    try {
      const res = await aiAPI.uploadDocument(file, token);
      if (res?.success) {
        toast.success("File uploaded");
        return res.data.filename;
      }
      throw new Error();
    } catch {
      toast.error("Upload failed");
      return null;
    }
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Floating button */}
      {(!isOpen && !isMobile )&& (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(true);
            isMobile ? callback() : null
          }}
          className="fixed bottom-4 right-4 z-10 w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg flex items-center justify-center"
        >
          <Sparkles size={20} />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className={cn(
              "fixed z-[1000000] flex flex-col bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden",
              // Mobile fullscreen
              "inset-0 rounded-none",
              // Desktop floating
              "md:inset-auto md:bottom-20 md:right-4 md:w-80 md:h-[70vh] md:rounded-2xl"
            )}
          >
            {/* Header */}
            <div className="shrink-0 h-14 flex items-center justify-between px-3 bg-zinc-950 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400" />
                <span className="text-sm font-semibold text-white">
                  AI Assistant
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* <button
                  onClick={() => setIsMinimized((v) => !v)}
                  className="hidden md:flex p-2 rounded-lg text-zinc-400 hover:bg-zinc-800"
                >
                  <Minus size={16} />
                </button> */}
                <button
                  onClick={() => {
                    setIsOpen(false)
                    isMobile ? callback() : null
                  }
                  }
                  className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto overscroll-contain py-2 bg-zinc-950 space-y-2">
                  {messages.length === 0 ? (
                    <div className="text-sm text-zinc-500 text-center py-8">
                      Ask me anything…
                    </div>
                  ) : (
                    messages.map((m) => (
                      <MessageBubble
                        key={m.id}
                        message={m}
                        isOwn={String(m.sender_id) === String(currentUser.id)}
                        currentUserId={currentUser.id}
                      />
                    ))
                  )}

                  {isLoading && (
                    <div className="text-xs text-zinc-500 italic">
                      AI is thinking…
                    </div>
                  )}

                  <div ref={messageEndRef} />
                </div>

                {/* Input */}
                <div className="shrink-0 border-t border-zinc-800 bg-zinc-900">
                  {currentUser.role === "admin" && (
                    <div className="text-xs text-zinc-500 px-3 pt-1 italic">
                      Admins can upload documents for context.
                    </div>
                  )}
                  <ChatInput
                    value={draft}
                    onChange={setDraft}
                    onSend={sendMessage}
                    onFileUpload={handleAdminFileUpload}
                    disabled={isLoading}
                    allowFiles={currentUser.role === "admin"}
                    acceptMultipleFiles={currentUser.role === "admin"}
                    allowImages={false}
                    allowEmojis={false}
                  />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Link } from "react-router-dom";

/* ---------------- MOCK BOT ---------------- */
const mockBotReply = (msg) =>
  new Promise((res) =>
    setTimeout(
      () =>
        res(
          "Thanks for your message! A member of our team will get back to you shortly."
        ),
      1200
    )
  );

/* ---------------- MESSAGE BUBBLE ---------------- */
const Bubble = ({ message }) => {
  const isUser = message.role === "user";

  const renderMessageWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) =>
      urlRegex.test(part) ? (
        <Link
          key={i}
          to={part}
          rel="noopener noreferrer"
          className="underline hover:opacity-80"
        >
          {part}
        </Link>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-zinc-800 text-zinc-200"
        }`}
      >
        {renderMessageWithLinks(message.text)}
      </div>
    </div>
  );
};

/* ---------------- CHAT PANEL ---------------- */
const ChatPanel = ({ onClose, messages, onSend, isTyping }) => {
  const endRef = useRef(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 w-[360px] max-w-[calc(100vw-3rem)] h-[520px] bg-zinc-950 border border-indigo-500 rounded-2xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-indigo-500 bg-zinc-900 rounded-t-2xl">
        <div className="flex items-center gap-2 text-white font-semibold">
          <MessageCircle className="text-indigo-500" size={20} />
          Support Chat
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m) => (
          <Bubble key={m.id} message={m} />
        ))}

        {isTyping && (
          <div className="text-xs text-zinc-500">Support is typing…</div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900 rounded-b-2xl">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button
            onClick={handleSend}
            className="p-3 bg-indigo-600 hover:bg-indigo-400 rounded-xl text-white transition"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- FLOATING BUTTON ---------------- */
const ChatButton = ({ onClick, unread }) => (
  <button
    onClick={onClick}
    className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-400 text-white shadow-2xl flex items-center justify-center z-40"
  >
    <MessageCircle size={24} />
    {unread && (
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
        !
      </span>
    )}
  </button>
);

/* ---------------- MAIN ---------------- */
const FloatingChatbox = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "bot",
      text: "Hello! How can we assist you today?",
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(false);

  const sendMessage = async (text) => {
    
    const userMsg = { id: Date.now(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setMessages((m) => [
      ...m,
      {
      id: Date.now(),
      role: "bot",
      text: `We are currently working on this feature. Check out ${window.location.origin}/help for more info.`,
      },
    ]);
    return
    setIsTyping(true);
    const reply = await mockBotReply(text);
    setIsTyping(false);

    setMessages((m) => [
      ...m,
      { id: Date.now() + 1, role: "bot", text: reply },
    ]);

    if (!open) setUnread(true);
  };

  const toggle = () => {
    setOpen((o) => !o);
    setUnread(false);
  };

  return (
    <>
      {open && (
        <ChatPanel
          onClose={toggle}
          messages={messages}
          onSend={sendMessage}
          isTyping={isTyping}
        />
      )}
      {!open && <ChatButton onClick={toggle} unread={unread} />}
    </>
  );
};

export default FloatingChatbox;

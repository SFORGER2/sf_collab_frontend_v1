import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Clock,
  Send,
  Bot,
  User,
  Menu,
  Search,
  Sparkles,
} from "lucide-react";

// --- MOCK DATA ---
const initialChats = [
  {
    id: "1",
    title: "React Component Setup",
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Can you help me set up a responsive React component?",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Of course! What kind of component are you looking to build? A sidebar, a navigation menu, or something else?",
      },
      { id: "m3", role: "user", content: "A conversation history sidebar." },
      {
        id: "m4",
        role: "assistant",
        content:
          "Great choice. We can use a flex layout with a fixed width for desktop and a slide-out drawer for mobile. Let me draft the initial structure.",
      },
    ],
  },
  {
    id: "2",
    title: "Database Schema Design",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    messages: [
      {
        id: "m1",
        role: "user",
        content: "I need to design a schema for a chat application.",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "For a chat application, you typically need tables for Users, Conversations, Messages, and potentially Participants if it supports group chats. Should we start with the Messages table?",
      },
    ],
  },
  {
    id: "3",
    title: "Fixing Authentication Bug",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    messages: [
      {
        id: "m1",
        role: "user",
        content: "My JWT token is expiring too quickly.",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Let's check your token generation logic. What expiration time (exp claim) are you currently setting?",
      },
      { id: "m3", role: "user", content: 'I set it to "1h".' },
      {
        id: "m4",
        role: "assistant",
        content:
          "1 hour is a standard secure default. If you need it to last longer, you might want to implement a refresh token rotation strategy rather than extending the access token lifespan.",
      },
    ],
  },
];

// --- HELPER FUNCTION ---
const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return "Yesterday";
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export default function App() {
  const [chats, setChats] = useState(initialChats);
  const [activeChatId, setActiveChatId] = useState(initialChats[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  const activeChat = chats.find((c) => c.id === activeChatId);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  // Handle mobile resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: "New Conversation",
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteChat = (e, id) => {
    e.stopPropagation(); // Prevent selecting the chat when clicking delete
    const updatedChats = chats.filter((c) => c.id !== id);
    setChats(updatedChats);
    if (activeChatId === id) {
      setActiveChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const newMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
    };

    setChats(
      chats
        .map((chat) => {
          if (chat.id === activeChatId) {
            // Auto-generate title for first message
            const updatedTitle =
              chat.messages.length === 0
                ? inputText.slice(0, 25) + (inputText.length > 25 ? "..." : "")
                : chat.title;

            return {
              ...chat,
              title: updatedTitle,
              updatedAt: new Date().toISOString(),
              messages: [...chat.messages, newMessage],
            };
          }
          return chat;
        })
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    ); // Re-sort by latest

    setInputText("");
  };

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-screen bg-[#0d0f17] text-slate-200 font-sans overflow-hidden selection:bg-cyan-500/30">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR (Conversation History) --- */}
      <div
        className={`fixed md:relative z-30 flex flex-col w-72 h-full bg-[#050505] border-r border-slate-800 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>

        {/* Search History */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#11131a] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar">
          {filteredChats.length === 0 ? (
            <div className="text-center text-slate-500 text-sm mt-8">
              No conversations found.
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  activeChatId === chat.id
                    ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                    : "hover:bg-slate-800/50 border border-transparent text-slate-300"
                }`}
              >
                <MessageSquare
                  className={`w-4 h-4 mt-1 shrink-0 ${activeChatId === chat.id ? "text-cyan-400" : "text-slate-500"}`}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate leading-tight mb-1">
                    {chat.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <Clock className="w-3 h-3" />{" "}
                    {getRelativeTime(chat.updatedAt)}
                  </div>
                </div>

                {/* Delete Button (Visible on hover or active) */}
                <button
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className={`p-1.5 rounded-md hover:bg-red-500/20 hover:text-red-400 transition-colors ${activeChatId === chat.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"} md:opacity-0 md:group-hover:opacity-100`}
                  title="Delete chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className="flex-1 flex flex-col h-full relative w-full min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-[#0a0b10]/95 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-800 text-slate-400 md:hidden shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-slate-100 truncate">
              {activeChat ? activeChat.title : "No Chat Selected"}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-800/50 text-slate-400 rounded-full border border-slate-700 shrink-0 ml-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />{" "}
            <span className="hidden sm:inline">AI Assistant</span>
          </div>
        </header>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-[#0d0f17]">
          {!activeChat || activeChat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                <Sparkles className="w-8 h-8 text-cyan-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-2">
                How can I help you today?
              </h3>
              <p className="text-sm text-slate-500 max-w-sm px-4">
                Type a message below to start a new conversation. Your history
                will be saved on the left.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 pb-4">
              {activeChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                      msg.role === "user"
                        ? "bg-slate-700 text-slate-300"
                        : "bg-gradient-to-br from-cyan-400 to-blue-600 text-white"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] md:max-w-[75%] px-4 sm:px-5 py-3 sm:py-3.5 text-sm leading-relaxed rounded-2xl ${
                      msg.role === "user"
                        ? "bg-cyan-600 text-white rounded-tr-sm shadow-[0_4px_15px_rgba(6,182,212,0.15)]"
                        : "bg-[#11131a] border border-slate-800 text-slate-200 rounded-tl-sm shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#0a0b10] border-t border-slate-800 relative z-10 shrink-0">
          <form
            onSubmit={handleSendMessage}
            className="max-w-3xl mx-auto relative flex items-end gap-2"
          >
            <div className="relative w-full bg-[#11131a] border border-slate-700 rounded-xl focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all shadow-sm overflow-hidden">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={
                  activeChat
                    ? "Type your message..."
                    : "Select or create a chat to begin"
                }
                disabled={!activeChat}
                className="w-full max-h-32 min-h-[52px] bg-transparent border-none px-4 py-3.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none custom-scrollbar"
                rows={1}
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || !activeChat}
              className="p-3.5 h-[52px] w-[52px] bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#0a0b10]"
            >
              <Send className="w-5 h-5 shrink-0" />
            </button>
          </form>
          <div className="text-center mt-2 text-[10px] text-slate-600 font-medium">
            AI can make mistakes. Verify important information.
          </div>
        </div>
      </div>

      {/* Global Scrollbar Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 0.4);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.8);
        }
      `,
        }}
      />
    </div>
  );
}

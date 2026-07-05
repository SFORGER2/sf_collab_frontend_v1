/**
 * ChatNotificationProvider - Fixed Version
 * 
 * FIXES:
 * 1. Fetch initial unread count from the server via chatAPI.getTotalUnreadCount()
 * 2. Expose refreshUnreadCount() to sync badge with backend
 * 3. After receiving a new message, increment optimistically and then refresh from server
 * 4. Better profile picture handling in notifications
 * 5. Muted notification sound for 'general' chats
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, MessageCircle, Users, Globe, Shield } from "lucide-react";
import { useAppSocket } from "@/context/SocketProvider";
import Avatar from "@/components/chat (previous)/Avatar";
import { chatAPI } from "@/utils/APIs/chatApi";

// ============================================
// CONFIGURATION
// ============================================
const NOTIFICATION_DURATION = 60000;
const MAX_NOTIFICATIONS = 2;
const AUTO_POPUP_ENABLED = true;
const FLASH_DURATION = 60000;

// Muted conversation types (no notification sound)
const MUTED_CONVERSATION_TYPES = ["general"];

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const resolveAvatarUrl = (src) => {
  if (!src) return null;
  if (typeof src !== "string") return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  const origin = API_BASE.replace(/\/api\/?$/, "");
  return `${origin}${src.startsWith("/") ? "" : "/"}${src}`;
};

const getSenderAvatar = (sender) => {
  const raw =
    sender?.profilePicture ||
    sender?.profile_picture ||
    sender?.avatar ||
    sender?.picture ||
    sender?.profile?.picture ||
    sender?.profile?.avatar ||
    null;
  return resolveAvatarUrl(raw);
};

// ============================================
// CONTEXT
// ============================================
const ChatNotificationContext = createContext(null);

// ============================================
// AVATAR COMPONENT FOR NOTIFICATIONS
// ============================================
const NotificationAvatar = ({ src, name, type }) => {
  const initials = name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const typeStyles = {
    general: "from-emerald-500 to-teal-600",
    team: "from-violet-500 to-purple-600",
    group: "from-blue-500 to-indigo-600",
    direct: "from-amber-500 to-orange-600",
  };

  const TypeIcon = {
    general: Globe,
    team: Shield,
    group: Users,
    direct: null,
  }[type];

  if (TypeIcon && (type === "general" || type === "team")) {
    return (
      <div
        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${typeStyles[type]} flex items-center justify-center shadow-lg`}
      >
        <TypeIcon size={22} className="text-white" />
      </div>
    );
  }

  return src ? (
    <img
      loading="lazy"
      src={src}
      alt={name}
      className="w-12 h-12 rounded-2xl object-cover shadow-lg ring-2 ring-white/10"
    />
  ) : (
    <div
      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${typeStyles[type] || typeStyles.direct} flex items-center justify-center shadow-lg font-semibold text-white`}
    >
      {initials}
    </div>
  );
};

// ============================================
// SINGLE TOAST NOTIFICATION (ENHANCED)
// ============================================
const ChatToast = ({ notification, onClose, onNavigate, index }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);

  const { message, conversation, sender } = notification;

  useEffect(() => {
    const pulseTimer = setTimeout(() => {
      setIsPulsing(false);
    }, FLASH_DURATION);

    const timer = setTimeout(() => {
      handleClose();
    }, NOTIFICATION_DURATION);

    return () => {
      clearTimeout(timer);
      clearTimeout(pulseTimer);
    };
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(notification.id), 300);
  };

  const handleNavigate = () => {
    handleClose();
    onNavigate(conversation.id);
  };

  const conversationType = conversation?.conversation_type || "direct";
  const conversationName =
    conversation?.name ||
    `${sender?.firstName || ""} ${sender?.lastName || ""}`.trim() ||
    "Unknown";

  const senderProfilePic = getSenderAvatar(sender);

  return (
    <div
      className={`
        relative overflow-hidden
        w-96 max-w-[calc(100vw-2rem)]
        bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800
        border border-zinc-700/50
        rounded-2xl shadow-2xl shadow-black/50
        transform transition-all duration-300 ease-out
        cursor-pointer
        ${isExiting
          ? "translate-x-[120%] opacity-0 scale-95"
          : "translate-x-0 opacity-100 scale-100"
        }
        ${isPulsing ? "animate-pulse-border" : ""}
        hover:border-amber-500/30 hover:shadow-amber-500/10
        group
      `}
      style={{
        animation: !isExiting
          ? `slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s both`
          : undefined,
      }}
      onClick={handleNavigate}
    >
      {isPulsing && (
        <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-md animate-glow" />
      )}

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClose();
        }}
        className="absolute top-3 left-3 p-1.5 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-100 z-10"
      >
        <X size={14} />
      </button>

      <div className="p-4 relative z-10">
        <div className="flex items-start gap-3">
          <NotificationAvatar
            src={senderProfilePic}
            name={conversationName}
            type={conversationType}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {conversationType !== "direct" && (
                <span
                  className={`
                    text-[10px] font-medium px-2 py-0.5 rounded-full
                    ${conversationType === "general" ? "bg-emerald-500/20 text-emerald-400" : ""}
                    ${conversationType === "team" ? "bg-violet-500/20 text-violet-400" : ""}
                    ${conversationType === "group" ? "bg-blue-500/20 text-blue-400" : ""}
                  `}
                >
                  {conversationType === "general"
                    ? "Community"
                    : conversationType === "team"
                    ? "Team"
                    : "Group"}
                </span>
              )}
              <span className="text-[10px] text-zinc-500">just now</span>
            </div>

            <h4 className="font-semibold text-white text-sm truncate">
              {sender?.firstName} {sender?.lastName}
              {conversationType !== "direct" && (
                <span className="font-normal text-zinc-500 ml-1">
                  in {conversation?.name}
                </span>
              )}
            </h4>

            <p className="text-zinc-400 text-sm mt-1 line-clamp-2 leading-relaxed">
              {message?.content || message?.original_content}
            </p>

            <div className="flex items-center gap-1 mt-2">
              <MessageCircle className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-400">Click to view conversation</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-2xl"
        style={{
          animation: "progress 5s linear",
        }}
      />
    </div>
  );
};

// ============================================
// NOTIFICATION CONTAINER
// ============================================
const NotificationContainer = ({ notifications, onClose, onNavigate }) => {
  const visibleNotifications = notifications.slice(0, MAX_NOTIFICATIONS);

  return (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col-reverse gap-3 pointer-events-none">
      {visibleNotifications.map((notification, index) => (
        <div key={notification.id} className="pointer-events-auto">
          <ChatToast
            notification={notification}
            onClose={onClose}
            onNavigate={onNavigate}
            index={index}
          />
        </div>
      ))}

      {notifications.length > MAX_NOTIFICATIONS && (
        <div className="text-xs text-zinc-500 text-center pointer-events-auto">
          +{notifications.length - MAX_NOTIFICATIONS} more notifications
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(120%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
        @keyframes pulse-border {
          0%, 100% { 
            border-color: rgba(113, 113, 122, 0.5);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
          50% { 
            border-color: rgba(59, 130, 246, 0.5);
            box-shadow: 0 0 20px 0 rgba(59, 130, 246, 0.3);
          }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// ============================================
// PROVIDER
// ============================================
export const ChatNotificationProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, isConnected } = useAppSocket();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [flashingTabs, setFlashingTabs] = useState({});

  // ─── Feature 4: Bell sync — chat unread count exposed to NotificationBell ─
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  const flashingIntervalsRef = useRef({});
  const isOnChatPageRef = useRef(false);

  // Get current user ID
  const currentUserId = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user?.id;
    } catch {
      return null;
    }
  }, []);

  // ─── NEW: Fetch initial unread count from server ──────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await chatAPI.getTotalUnreadCount();
      setUnreadCount(count);
      setChatUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, []);

  // ─── NEW: Expose refresh function ─────────────────────────────────────────
  const refreshUnreadCount = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Fetch on mount
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Track if user is on chat page
  useEffect(() => {
    isOnChatPageRef.current = location.pathname.startsWith("/chat");
    // Reset badge when user opens chat
    if (location.pathname.startsWith("/chat")) {
      setUnreadCount(0);
      setChatUnreadCount(0);
    }
  }, [location.pathname]);

  // NEW: Start flashing a conversation tab
  const startFlashing = useCallback((conversationId) => {
    const cid = String(conversationId);

    setFlashingTabs((prev) => ({
      ...prev,
      [cid]: true,
    }));

    if (flashingIntervalsRef.current[cid]) {
      clearTimeout(flashingIntervalsRef.current[cid]);
    }

    flashingIntervalsRef.current[cid] = setTimeout(() => {
      stopFlashing(cid);
    }, FLASH_DURATION);
  }, []);

  // NEW: Stop flashing a conversation tab
  const stopFlashing = useCallback((conversationId) => {
    const cid = String(conversationId);

    setFlashingTabs((prev) => {
      const updated = { ...prev };
      delete updated[cid];
      return updated;
    });

    if (flashingIntervalsRef.current[cid]) {
      clearTimeout(flashingIntervalsRef.current[cid]);
      delete flashingIntervalsRef.current[cid];
    }
  }, []);

  // Cleanup flashing intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(flashingIntervalsRef.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    window.dispatchEvent(
      new CustomEvent("notifications:new", { detail: notification })
    );
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const navigateToConversation = useCallback(
    (conversationId) => {
      stopFlashing(conversationId);
      navigate(`/chat?conversation=${conversationId}`);
    },
    [navigate, stopFlashing]
  );

  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch {
      // blocked / unsupported
    }
  }, []);

  // Auto-popup ChatDock when new message arrives
  const autoPopupChatDock = useCallback(
    (data) => {
      if (!AUTO_POPUP_ENABLED) return;

      const { message, conversation } = data;
      const conversationId = data.conversation_id || conversation?.id;

      if (!conversationId) return;

      const title =
        conversation?.name ||
        `${message?.sender?.firstName || ""} ${message?.sender?.lastName || ""}`.trim() ||
        "Chat";

      window.dispatchEvent(
        new CustomEvent("chatDock:autoPopup", {
          detail: {
            conversationId,
            title,
            message,
          },
        })
      );

      startFlashing(conversationId);
    },
    [startFlashing]
  );

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (data) => {
      const { message, conversation_id } = data || {};
      if (!message) return;

      const sId = message?.sender_id;
      const isOwnMessage =
        sId != null && currentUserId != null && String(sId) === String(currentUserId);
      if (isOwnMessage) return;

      const conversationType = data.conversation?.conversation_type || "direct";
      const isMuted = MUTED_CONVERSATION_TYPES.includes(conversationType);

      // Skip toast/popup for muted conversations (general chat)
      if (isMuted) return;

      if (!isOnChatPageRef.current) {
        // Increment local counts optimistically
        setUnreadCount((prev) => prev + 1);
        setChatUnreadCount((prev) => prev + 1);

        // Sync with server after a short delay to ensure accuracy
        setTimeout(() => refreshUnreadCount(), 500);

        playNotificationSound();
        autoPopupChatDock(data);
      }
    };

    const onAddedToTeamChat = (data) => {
      addNotification({
        id: `team-${Date.now()}`,
        type: "system",
        title: "Added to Team",
        message: { content: `You've been added to ${data.conversation?.name}` },
        conversation: data.conversation,
        sender: { firstName: "System", lastName: "" },
        timestamp: new Date(),
      });
      playNotificationSound();
    };

    socket.on("new_message", onNewMessage);
    socket.on("added_to_team_chat", onAddedToTeamChat);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("added_to_team_chat", onAddedToTeamChat);
    };
  }, [
    socket,
    currentUserId,
    addNotification,
    playNotificationSound,
    autoPopupChatDock,
    refreshUnreadCount,
  ]);

  const sendQuickReply = useCallback(
    async (conversationId, content) => {
      if (!socket || !content?.trim()) return;
      socket.emit("send_message", {
        conversation_id: conversationId,
        content: content.trim(),
      });
    },
    [socket]
  );

  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
    setChatUnreadCount(0);
    // Optionally refresh from server after resetting locally
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  // ─── Feature 4: called by NotificationBell when opened ───────────────────
  const resetChatUnreadCount = useCallback(() => {
    setChatUnreadCount(0);
    // Also refresh from server to be safe
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  const joinConversation = useCallback(
    (conversationId) => {
      if (socket) socket.emit("join_conversation", { conversation_id: conversationId });
    },
    [socket]
  );

  const leaveConversation = useCallback(
    (conversationId) => {
      if (socket) socket.emit("leave_conversation", { conversation_id: conversationId });
    },
    [socket]
  );

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    chatUnreadCount,
    flashingTabs,
    addNotification,
    removeNotification,
    clearNotifications,
    navigateToConversation,
    sendQuickReply,
    resetUnreadCount,
    resetChatUnreadCount,
    joinConversation,
    leaveConversation,
    startFlashing,
    stopFlashing,
    refreshUnreadCount, // <── NEW
  };

  return (
    <ChatNotificationContext.Provider value={value}>
      {children}
      {/* Popup toasts removed — unread badge on chat icon is used instead */}
    </ChatNotificationContext.Provider>
  );
};

// ============================================
// HOOKS
// ============================================
export const useChatNotifications = () => {
  const context = useContext(ChatNotificationContext);
  if (!context) {
    throw new Error(
      "useChatNotifications must be used within ChatNotificationProvider"
    );
  }
  return context;
};

export const ChatNotificationBadge = ({ className = "" }) => {
  const { unreadCount } = useChatNotifications();

  if (!unreadCount) return null;

  return (
    <span
      className={`
        absolute -top-1 -right-1
        min-w-[18px] h-[18px]
        flex items-center justify-center
        bg-gradient-to-r from-amber-500 to-orange-500
        text-zinc-900 text-[10px] font-bold
        rounded-full
        animate-pulse
        ${className}
      `}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
};

export default ChatNotificationProvider;
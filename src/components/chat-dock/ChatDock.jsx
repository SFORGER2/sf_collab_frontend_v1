import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, Minus, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/chat (previous)/Avatar";
import MessageBubble from "@/components/chat (previous)/MessageBubble";
import ChatInput from "@/components/chat (previous)/ChatInput";
import { useAppSocket } from "@/context/SocketProvider";
import { getProfilePicture } from "@/utils/getProfilePicture";
import ChatNotification from "./ChatNotification";
import { chatAPI } from "@/utils/APIs/chatApi";



// show name only on first message in a run (group/general/startup)
function shouldShowSenderName(messages, index) {
  if (index === 0) return true;

  const prev = messages[index - 1];
  const curr = messages[index];

  const prevId = String(prev?.sender_id ?? prev?.sender?.id ?? "");
  const currId = String(curr?.sender_id ?? curr?.sender?.id ?? "");

  return prevId !== currId;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const LS_WINDOWS_KEY = "chatDock:windows";
const LS_UNREAD_KEY = "chatDock:unread";
const LS_PRESENCE_KEY = "chatDock:presence:lastSeen";
const LS_UNREAD_USERS_KEY = "chatDock:unreadUsers";

const toMs = (ts) => {
  if (!ts) return null;
  if (typeof ts === "number") return ts;
  const n = Number(ts);
  if (!Number.isNaN(n)) return n;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
};

const formatLastSeen = (ts, nowTs) => {
  const ms = toMs(ts);
  if (!ms) return "offline";

  const now = new Date(nowTs || Date.now());
  const d = new Date(ms);

  const diffMs = Math.max(0, now.getTime() - d.getTime());
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "last seen just now";
  if (mins < 60) return mins === 1 ? "last seen 1 min ago" : `last seen ${mins} mins ago`;

  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const yesterday = (() => {
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    return (
      d.getFullYear() === y.getFullYear() &&
      d.getMonth() === y.getMonth() &&
      d.getDate() === y.getDate()
    );
  })();

  const timeStr = d
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    .replace("AM", "am")
    .replace("PM", "pm");

  if (sameDay) return `last seen ${timeStr}`;
  if (yesterday) return `last seen yesterday, ${timeStr}`;

  const day = d.getDate();
  const month = d.getMonth() + 1;
  const yy = String(d.getFullYear()).slice(-2);
  return `last seen ${day}/${month}/${yy} ${timeStr}`;
};

const getPresenceForDirect = ({ conv, currentUserId, onlineUsers, lastActiveAt, lastSeenAt, nowTs }) => {
  const other = conv?.participants?.find((p) => String(p.id) !== String(currentUserId));
  const otherId = other?.id ? String(other.id) : null;
  if (!otherId) return { presenceStatus: "offline", statusText: "" };

  const connected = (onlineUsers || []).map(String).includes(otherId);
  const lastActiveTs = toMs(lastActiveAt?.[otherId]);
  const lastSeenTs = toMs(
    lastSeenAt?.[otherId] ??
      other?.last_seen ??
      other?.lastSeen ??
      other?.last_login ??
      other?.lastLogin
  );

  const diff = lastActiveTs ? Math.max(0, nowTs - lastActiveTs) : null;

  if (connected) {
    if (diff == null || diff < 5 * 60 * 1000) return { presenceStatus: "online", statusText: "online" };
    if (diff < 6 * 60 * 1000) return { presenceStatus: "idle", statusText: "idle" };
    return { presenceStatus: "offline", statusText: formatLastSeen(lastActiveTs, nowTs) };
  }

  return { presenceStatus: "offline", statusText: formatLastSeen(lastSeenTs || lastActiveTs, nowTs) };
};

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value ?? "");
  } catch {
    return fallback;
  }
}

const handleFileUpload = async ({ file, conversationId, token }) => {
  if (!token || !file || !conversationId) return null;

  try {
    // ✅ USING CENTRALIZED API
    const data = await chatAPI.uploadFile(conversationId, file, file.name);
    
    if (data?.success && data?.data?.message) {
      return data.data.message.file_url;
    }
    if (data?.message?.file_url) {
      return data.message.file_url;
    }
    return null;
  } catch (e) {
    console.error("ChatDock: file upload failed:", e);
    return null;
  }
};

function normalizeMessage(m) {
  if (!m) return m;

  const created =
    m.created_at ||
    m.createdAt ||
    m.timestamp ||
    m.sent_at ||
    m.sentAt ||
    m.time ||
    null;

  const sender =
    m.sender ||
    m.user ||
    m.from ||
    (m.sender_id
      ? { 
          id: m.sender_id, 
          firstName: m.sender_name || m.firstName || m.senderFirstName || "",
          lastName: m.sender_last_name || m.senderLastName || m.lastName || "",
          profilePicture: m.sender_profile_picture || m.profilePicture || null,
        }
      : null);

  return {
    ...m,
    created_at: created,
    sender,
    sender_id: m.sender_id || sender?.id,
    content: m.content ?? m.original_content ?? m.message ?? "",
    file_url: m.file_url || m.fileUrl || m.url || null,
    file_name: m.file_name || m.fileName || m.filename || null,
    file_type: m.file_type || m.fileType || null,
    is_image:
      typeof m.is_image === "boolean"
        ? m.is_image
        : typeof m.isImage === "boolean"
          ? m.isImage
          : null,
    message_type: m.message_type || m.messageType || null,
  };
}

function shouldShowAvatar(messages, message, index, currentUserId) {
  if (index === 0) return true;

  const prevMessage = messages[index - 1];
  if (!prevMessage) return true;

  return String(prevMessage.sender_id) !== String(message.sender_id);
}


export default function ChatDock({ maxWindows = 2, isMobile = false, callback = () => {} }) {
  const { socket, isConnected, onlineUsers } = useAppSocket();
  const token = useMemo(() => localStorage.getItem("access_token"), []);
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const buildProfileUrl = (userId) =>
    userId ? `/user-profile?userId=${userId}` : "/user-profile";
  const goToProfile = (userId) => {
    if (!userId) return;
    window.location.assign(`/user-profile?userId=${userId}`);
  };

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [consideredActive, setConsideredActive] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);

  const [conversations, setConversations] = useState([]);
  const [isLoadingConvos, setIsLoadingConvos] = useState(false);

  const [lastActiveAt, setLastActiveAt] = useState({});
  const [lastSeenAt, setLastSeenAt] = useState(() => safeJsonParse(localStorage.getItem(LS_PRESENCE_KEY), {}));
  const [nowTs, setNowTs] = useState(Date.now());

  const getUserPresenceStatus = (userId, onlineUsers, lastActiveAt) => {
    const id = String(userId);
    const onlineSet = new Set((onlineUsers || []).map(String));
    const isConnected = onlineSet.has(id);

    if (!isConnected) return 'offline';

    const lastActive = lastActiveAt?.[id];
    if (lastActive) {
      const diffMs = Date.now() - Number(lastActive);
      const IDLE_THRESHOLD = 5 * 60 * 1000;
      if (diffMs > IDLE_THRESHOLD) return 'idle';
    }

    return 'online';
  };

  const [windows, setWindows] = useState(() => {
    const saved = safeJsonParse(localStorage.getItem(LS_WINDOWS_KEY), []);
    return Array.isArray(saved)
      ? saved.map((w) => ({
          conversationId: w.conversationId,
          title: w.title || "Chat",
          minimized: !!w.minimized,
          messages: [],
          loading: false,
          draft: "",
        }))
      : [];
  });
  const isWindowsOpen = useMemo(() => windows.length > 0, [windows]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_PRESENCE_KEY, JSON.stringify(lastSeenAt || {}));
    } catch {}
  }, [lastSeenAt]);

  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const [unread, setUnread] = useState(() => {
    const saved = safeJsonParse(localStorage.getItem(LS_UNREAD_KEY), {});
    return saved && typeof saved === "object" ? saved : {};
  });

  const [unreadUsers, setUnreadUsers] = useState(() => {
    const saved = safeJsonParse(localStorage.getItem(LS_UNREAD_USERS_KEY), {});
    return saved && typeof saved === "object" ? saved : {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_UNREAD_USERS_KEY, JSON.stringify(unreadUsers || {}));
    } catch {}
  }, [unreadUsers]);

  const [typingByConversation, setTypingByConversation] = useState({});
  const typingTimeoutsRef = useRef({});
  const messageEndRefs = useRef({});

  const windowsRef = useRef(windows);

  const seenMessageKeysRef = useRef(new Set());
  const isTabVisibleRef = useRef(isTabVisible);
  const conversationsRef = useRef(conversations);
  const consideredActiveRef = useRef(consideredActive);

  useEffect(() => { windowsRef.current = windows; }, [windows]);
  useEffect(() => { isTabVisibleRef.current = isTabVisible; }, [isTabVisible]);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);
  useEffect(() => { consideredActiveRef.current = consideredActive; }, [consideredActive]);

  const persistWindows = useCallback((nextWindows) => {
    const minimal = nextWindows.map((w) => ({
      conversationId: w.conversationId,
      title: w.title,
      minimized: !!w.minimized,
    }));
    localStorage.setItem(LS_WINDOWS_KEY, JSON.stringify(minimal));
  }, []);

  const scrollToBottom = useCallback((conversationId) => {
    const el = messageEndRefs.current[conversationId];
    el?.scrollIntoView?.({ behavior: "smooth" });
  }, []);

  const isConvOpen = useCallback(
    (conversationId) => windows.some((w) => String(w.conversationId) === String(conversationId)),
    [windows]
  );

  const isConvMinimized = useCallback(
    (conversationId) =>
      windows.some(
        (w) => String(w.conversationId) === String(conversationId) && w.minimized
      ),
    [windows]
  );

  const bumpUnread = useCallback((conversationId, senderInfo = null) => {
    const key = String(conversationId);
    setUnread((prev) => {
      const next = { ...prev, [key]: (prev[key] || 0) + 1 };
      localStorage.setItem(LS_UNREAD_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("chat:unread", { detail: { conversationId: key, unread: next } }));
      return next;
    });

    if (senderInfo?.id) {
      const senderId = String(senderInfo.id);
      setUnreadUsers((prev) => {
        const convUsers = prev[key] || {};
        const existingUser = convUsers[senderId] || { count: 0 };
        return {
          ...prev,
          [key]: {
            ...convUsers,
            [senderId]: {
              id: senderId,
              name: senderInfo.name || senderInfo.firstName || "",
              avatar: senderInfo.avatar || senderInfo.profilePicture || null,
              count: existingUser.count + 1,
            },
          },
        };
      });
    }
  }, []);

  const clearUnread = useCallback((conversationId) => {
    const key = String(conversationId);
    setUnread((prev) => {
      const next = { ...prev, [key]: 0 };
      localStorage.setItem(LS_UNREAD_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("chat:unread", { detail: { conversationId: key, unread: next } }));
      return next;
    });

    setUnreadUsers((prev) => {
      const next = { ...prev };
      delete next[key];
      localStorage.setItem(LS_UNREAD_USERS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const onFocus = () => {
      setConsideredActive(true);
      setIsTabVisible(true);
    };
    const onBlur = () => setConsideredActive(false);
    const onVis = () => {
      const visible = !document.hidden;
      setConsideredActive(visible);
      setIsTabVisible(visible);
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    setIsLoadingConvos(true);
    try {
      const response = await chatAPI.getAllChats();
      if (response?.success) {
        const convos = response.data.conversations || [];
        setConversations(convos);

        setLastSeenAt((prev) => {
          const next = { ...prev };
          for (const c of convos) {
            if (c?.conversation_type !== "direct") continue;
            const other = c.participants?.find((p) => String(p.id) !== String(currentUser?.id));
            if (!other?.id) continue;

            const ts =
              other.last_seen ??
              other.lastSeen ??
              other.last_login ??
              other.lastLogin ??
              null;

            const ms = toMs(ts);
            if (ms) next[String(other.id)] = ms;
          }
          return next;
        });
      }
    } catch (e) {
      console.error("ChatDock: fetch conversations failed:", e);
    } finally {
      setIsLoadingConvos(false);
    }
  }, [token, currentUser?.id]);

  const fetchMessages = useCallback(
    async (conversationId) => {
      if (!token || !conversationId) return;
      const cid = String(conversationId);

      setWindows((prev) =>
        prev.map((w) => (String(w.conversationId) === cid ? { ...w, loading: true } : w))
      );

      try {
        const response = await chatAPI.getMessages(cid, 100, 0);

        if (response?.success) {
          const msgs = (response.data.messages || []).map(normalizeMessage);

          setWindows((prev) =>
            prev.map((w) =>
              String(w.conversationId) === cid
                ? { ...w, messages: msgs, loading: false }
                : w
            )
          );

          setTimeout(() => scrollToBottom(cid), 30);

          if (consideredActive && !isConvMinimized(cid)) {
            clearUnread(cid);
            socket?.emit?.("mark_read", { conversation_id: cid });
          }
        } else {
          setWindows((prev) =>
            prev.map((w) => (String(w.conversationId) === cid ? { ...w, loading: false } : w))
          );
        }
      } catch (e) {
        console.error("ChatDock: fetch messages failed:", e);
        setWindows((prev) =>
          prev.map((w) => (String(w.conversationId) === cid ? { ...w, loading: false } : w))
        );
      }
    },
    [token, scrollToBottom, socket, consideredActive, isConvMinimized, clearUnread]
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const joinedRef = useRef(new Set());

  useEffect(() => {
    if (!socket) return;

    const currentIds = new Set(windows.map((w) => String(w.conversationId)));

    for (const id of currentIds) {
      if (!joinedRef.current.has(id)) {
        socket.emit("join_conversation", { conversation_id: id });
        joinedRef.current.add(id);
      }
    }

    for (const id of Array.from(joinedRef.current)) {
      if (!currentIds.has(id)) {
        socket.emit("leave_conversation", { conversation_id: id });
        joinedRef.current.delete(id);
      }
    }
  }, [socket, windows]);

  const openWindow = useCallback(
    async ({ conversationId, title }) => {
      
      if (!conversationId) return;
      const cid = String(conversationId);

      setWindows((prev) => {
        const exists = prev.find((w) => String(w.conversationId) === cid);
        if (exists) {
          const without = prev.filter((w) => String(w.conversationId) !== cid);
          const next = [...without, { ...exists, minimized: false }];
          persistWindows(next);
          return next;
        }

        const next = [
          ...prev,
          { conversationId: cid, title: title || "Chat", minimized: false, messages: [], loading: false, draft: "" },
        ];
        if (next.length > maxWindows) next.shift();

        persistWindows(next);
        return next;
      });

      clearUnread(cid);
      socket?.emit?.("join_conversation", { conversation_id: cid });
      await fetchMessages(cid);
    },
    [fetchMessages, maxWindows, persistWindows, clearUnread, socket]
  );

  const closeWindow = useCallback(
    (conversationId) => {
      const cid = String(conversationId);
      socket?.emit?.("leave_conversation", { conversation_id: cid });

      setWindows((prev) => {
        const next = prev.filter((w) => String(w.conversationId) !== cid);
        persistWindows(next);
        return next;
      });

      setTypingByConversation((prev) => {
        const next = { ...prev };
        delete next[cid];
        return next;
      });
    },
    [persistWindows, socket]
  );

  const toggleMinimize = useCallback(
    (conversationId) => {
      const cid = String(conversationId);
      setWindows((prev) => {
        const next = prev.map((w) =>
          String(w.conversationId) === cid ? { ...w, minimized: !w.minimized } : w
        );
        persistWindows(next);
        return next;
      });
    },
    [persistWindows]
  );

  useEffect(() => {
    if (!consideredActive) return;
    windows.forEach((w) => {
      if (!w.minimized) {
        clearUnread(w.conversationId);
        socket?.emit?.("mark_read", { conversation_id: String(w.conversationId) });
      }
    });
  }, [consideredActive, windows, clearUnread, socket]);

  useEffect(() => {
    const handleOpenFromNavbar = (e) => {
      const { conversationId, title } = e?.detail || {};
      if (!conversationId) return;

      setIsPanelOpen(true);
      openWindow({ conversationId, title });
    };

    window.addEventListener("chatDock:open", handleOpenFromNavbar);
    return () => window.removeEventListener("chatDock:open", handleOpenFromNavbar);
  }, [openWindow]);

  useEffect(() => {
    if (!socket) return;

    const now = () => Date.now();

    const onUserStatus = (data) => {
      const id = String(data?.user_id ?? "");
      if (!id) return;

      if (data.status === "online") {
        setLastActiveAt((prev) => ({ ...prev, [id]: now() }));
      }
      if (data.status === "offline") {
        setLastSeenAt((prev) => ({ ...prev, [id]: now() }));
      }
    };

    const onUserActivity = (data) => {
      const id = String(data?.user_id ?? "");
      if (!id) return;
      const ts = toMs(data?.ts) || now();
      setLastActiveAt((prev) => ({ ...prev, [id]: ts }));
    };

    socket.on("user_status", onUserStatus);
    socket.on("user_activity", onUserActivity);

    const ping = () => socket.emit("user_activity", { ts: now() });
    window.addEventListener("keydown", ping);
    const interval = setInterval(ping, 20000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", ping);
      socket.off("user_status", onUserStatus);
      socket.off("user_activity", onUserActivity);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const onUserTyping = (data) => {
      const conversationId = data?.conversation_id;
      const userId = data?.user_id;
      const isTyping = !!data?.is_typing;
      const userName =
        data?.user_name ||
        data?.name ||
        data?.firstName ||
        data?.username ||
        "";

      if (!conversationId || !userId) return;

      const cid = String(conversationId);
      const uid = String(userId);

      if (currentUser?.id && String(currentUser.id) === uid) return;

      setTypingByConversation((prev) => {
        const current = prev[cid] || {};
        const next = { ...prev };

        if (isTyping) {
          next[cid] = { ...current, [uid]: { name: (userName || "").trim(), timestamp: Date.now() } };
        } else {
          const copy = { ...current };
          delete copy[uid];
          next[cid] = copy;
        }
        return next;
      });
    };

    socket.on("user_typing", onUserTyping);
    return () => socket.off("user_typing", onUserTyping);
  }, [socket, currentUser?.id]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [userMessageSent, setUserMessageSent] = useState({ title: "", url: "", message: "" });
  useEffect(() => {
    if (!socket) {
      return;
    }
    
    const handleIncomingMessage = (payload) => {
      
      const messageData = payload?.message || payload;
      const cid = String(payload?.conversation_id || messageData?.conversation_id);

      const messageNorm = normalizeMessage(messageData);

      if (!cid || !messageNorm) {
        return;
      }

      // DEDUPE: backend may emit the same message on multiple events (e.g. new_message + conversation_message)
      const key = String(messageNorm.id || `${cid}:${messageNorm.sender_id || "?"}:${messageNorm.created_at || messageNorm.timestamp || ""}:${(messageNorm.content || "").slice(0, 64)}`);
      if (seenMessageKeysRef.current.has(key)) {
        return;
      }
      seenMessageKeysRef.current.add(key);
      // prevent unbounded growth
      if (seenMessageKeysRef.current.size > 2000) {
        const keep = Array.from(seenMessageKeysRef.current).slice(-1000);
        seenMessageKeysRef.current = new Set(keep);
      }


      // Update messages for open window
      setWindows((prev) => {
        return prev.map((w) => {
          if (String(w.conversationId) === cid) {
            const exists = w.messages.some((m) => String(m.id) === String(messageNorm.id));
            if (exists) return w;
            return { ...w, messages: [...(w.messages || []), messageNorm] };
          }
          return w;
        });
      });

      const isOwnMessage = String(messageNorm.sender_id) === String(currentUser?.id);

      if (!isOwnMessage) {
        const currentWindows = windowsRef.current;
        const currentIsTabVisible = isTabVisibleRef.current;
        const currentConversations = conversationsRef.current;
        const currentConsideredActive = consideredActiveRef.current;

        const isOpen = currentWindows.some((w) => String(w.conversationId) === cid);
        const isMin = currentWindows.some((w) => String(w.conversationId) === cid && w.minimized);

        const senderInfo = {
          id: messageNorm.sender_id,
          name: messageNorm.sender?.firstName || messageNorm.sender?.name || "",
          avatar: messageNorm.sender?.profilePicture || messageNorm.sender?.profile_picture || null,
        };

        if (!isOpen || isMin || !currentConsideredActive) {
          bumpUnread(cid, senderInfo);

          // AUTO-OPEN: Only if chat window does NOT exist at all
          // - If window is minimized → do NOT unminimize, just show unread badge
          // - If browser tab is hidden/minimized → do NOT pop open
          // - If window doesn't exist + tab is visible → OPEN the window

          
          if (currentIsTabVisible && !isOpen) {

            setIsNotificationOpen(true);
            const message = messageNorm.content || (messageNorm.file_type ? `sent a ${messageNorm.file_type.startsWith("image/") ? "photo" : "file"}` : "sent a message");
            const title = `${senderInfo.name || "Someone"}: ${message.length > 30 ? message.slice(0, 30) + "..." : message}`;

            const url = getProfilePicture(senderInfo.avatar, senderInfo.id);
            setTimeout(() => {
              setIsNotificationOpen(false)
            }, 4000);
            setUserMessageSent({ title, url, message});

          }
        } else {
          clearUnread(cid);
          socket.emit("mark_read", { conversation_id: cid });
        }
      }

      setTimeout(() => scrollToBottom(cid), 50);
    };

    socket.on("new_message", handleIncomingMessage);
    socket.on("conversation_message", handleIncomingMessage);

    return () => {
      socket.off("new_message", handleIncomingMessage);
      socket.off("conversation_message", handleIncomingMessage);
    };
  }, [
    socket,
    currentUser?.id,
    bumpUnread,
    clearUnread,
    scrollToBottom,
    openWindow,
  ]);

  const sendMessage = useCallback(
    (conversationId, content) => {
      if (!socket) return;
      const cid = String(conversationId);

      if (typeof content === "object" && content !== null) {
        const text = content.content?.trim();
        if (text) {
          socket.emit("send_message", { conversation_id: cid, content: text });
        }
        return;
      }

      const text = content?.trim();
      if (!cid || !text) return;

      socket.emit("send_message", { conversation_id: cid, content: text });

      setWindows((prev) =>
        prev.map((w) => (String(w.conversationId) === cid ? { ...w, draft: "" } : w))
      );

      if (consideredActive && !isConvMinimized(cid)) {
        clearUnread(cid);
        socket.emit("mark_read", { conversation_id: cid });
      }
    },
    [socket, consideredActive, isConvMinimized, clearUnread]
  );

  const filteredConversations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const isDirectOnline = (conv) => {
      if (conv.conversation_type !== "direct") return false;
      const other = conv.participants?.find((p) => String(p.id) !== String(currentUser?.id));
      if (!other?.id) return false;
      return (onlineUsers || []).some((id) => String(id) === String(other.id));
    };

    return (conversations || []).filter((c) => {
      if (term) {
        const display =
          c.name ||
          c.participants?.find((p) => String(p.id) !== String(currentUser?.id))?.firstName ||
          "";
        if (!String(display).toLowerCase().includes(term)) return false;
      }

      if (activeTab === "online") {
        return isDirectOnline(c);
      }
      return true;
    });
  }, [conversations, searchTerm, activeTab, onlineUsers, currentUser?.id]);

  const totalUnread = useMemo(() => {
    return Object.values(unread || {}).reduce((sum, v) => sum + (Number(v) || 0), 0);
  }, [unread]);

  const unreadUsersList = useMemo(() => {
    const usersMap = new Map();
    Object.values(unreadUsers || {}).forEach((convUsers) => {
      Object.values(convUsers || {}).forEach((user) => {
        if (user?.id && !usersMap.has(user.id)) {
          usersMap.set(user.id, user);
        }
      });
    });
    return Array.from(usersMap.values()).slice(0, 3);
  }, [unreadUsers]);

  const getTypingNames = (conversationId) => {
    const typing = typingByConversation[String(conversationId)] || {};
    const users = Object.values(typing);
    if (users.length === 0) return null;

    const names = users.map((u) => (u?.name || "").trim()).filter(Boolean);
    if (names.length === 0) {
      return null;
    }
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    return `${names[0]} and ${names.length - 1} others are typing...`;
  };
  useEffect(() => {
    if (isMobile && (isPanelOpen || isWindowsOpen)) {
      // Disable background scrolling
      document.body.style.overflow = "hidden";
    }
    else {
      document.body.style.overflow = "";
    }
  }, [isMobile, isPanelOpen, isWindowsOpen]);
  
  const names = useMemo(() => unreadUsersList.map((u) => u.name || "Unknown"), [unreadUsersList]);
  const visibleNames = useMemo(() => names.slice(0, 2), [names]);
  const remaining = useMemo(() => names.length - visibleNames.length, [names, visibleNames]);
  if (!currentUser) return null;
  return (
    <>
      
      <ChatNotification isOpen={isNotificationOpen} setIsOpen={setIsNotificationOpen} title={userMessageSent.title} url={userMessageSent.url} message={userMessageSent.message} />

      {/* Launcher Button */}
      {(!isPanelOpen && !isWindowsOpen) && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsPanelOpen((v) => !v);
            if (isMobile) callback();
          }}
          className="fixed w-12 h-12 bottom-4 right-20 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 shadow-lg flex items-center justify-center z-[9998] hover:shadow-xl transition-shadow"
        >
          <MessageCircle size={20} />
          {totalUnread > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2">
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-zinc-900 text-[10px] font-bold flex items-center justify-center border border-zinc-900 shadow-md">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            </motion.div>
          )}
        </motion.button>
      )}

      <div className={`fixed ${isMobile ? "inset-0" : "bottom-4 right-4"} z-[9999] flex items-end pointer-events-none`}>
        {/* Panel */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto w-full">
          <AnimatePresence>
            {isPanelOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className={`${isMobile ? "fixed inset-0 rounded-none" : "w-80 rounded-2xl"} bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col`}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 bg-zinc-950 border-b border-zinc-800 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-white">Chats</div>
                    <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"}`} />
                  </div>
                  <button
                    onClick={() => {
                      setIsPanelOpen(false);
                      if (isMobile) callback();
                    }}
                    className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Search */}
                <div className="p-3 border-b border-zinc-800 flex-shrink-0">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search chats..."
                    className="w-full px-3 py-2 bg-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                  <div className="flex gap-2 mt-2">
                    {["all", "online"].map((id) => (
                      <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          activeTab === id ? "bg-amber-500 text-zinc-900 shadow-md" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {id.charAt(0).toUpperCase() + id.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversations List */}
                <div className="overflow-y-auto p-2 flex-1">
                  {isLoadingConvos ? (
                    <div className="p-4 text-zinc-500 text-sm">Loading…</div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-4 text-zinc-500 text-sm text-center">No conversations</div>
                  ) : (
                    filteredConversations.map((conv) => {
                      const otherParticipant = conv.participants?.find(
                        (p) => String(p.id) !== String(currentUser?.id)
                      );
                      const isDirect = conv.conversation_type === "direct";
                      const title = conv.name || otherParticipant?.firstName || "Chat";
                      const unreadCount = unread?.[String(conv.id)] || conv.unread_count || 0;
                      let lastMsg = conv.last_message || conv.lastMessage;

                      let lastMessagePreview = "No messages yet";
                      if (lastMsg) {
                        let content = lastMsg.content || lastMsg.original_content || "";
                        if (lastMsg.is_deleted) content = "This message was deleted.";
                        const senderId = lastMsg.sender_id || lastMsg.sender?.id;
                        const senderName = lastMsg.sender?.firstName || lastMsg.senderFirstName || "";
                        const isOwn = String(senderId) === String(currentUser?.id);
                        const displayName = isOwn ? "You" : senderName;
                        if (displayName) {
                          const preview = `${displayName}: ${content}`;
                          lastMessagePreview = preview.length > 30 ? preview.slice(0, 30) + "..." : preview;
                        } else {
                          lastMessagePreview = content.length > 35 ? content.slice(0, 35) + "..." : content;
                        }
                      }

                      const { presenceStatus, statusText } = isDirect
                        ? getPresenceForDirect({
                            conv,
                            currentUserId: currentUser?.id,
                            onlineUsers,
                            lastActiveAt,
                            lastSeenAt,
                            nowTs,
                          })
                        : { presenceStatus: "offline", statusText: "" };

                      return (
                        <motion.button
                          key={conv.id}
                          whileHover={{ x: 4 }}
                          onClick={() => {
                            openWindow({ conversationId: conv.id, title });
                            if (isMobile) setIsPanelOpen(false);
                          }}
                          className={`w-full text-left px-3 py-3 rounded-xl transition-all hover:bg-zinc-800 flex items-center gap-3 ${
                            unreadCount > 0 ? "bg-zinc-800/70 border-l-2 border-amber-500" : "hover:border-l-2 hover:border-zinc-700"
                          }`}
                        >
                          <div className="flex-shrink-0">
                            <Avatar
                              src={isDirect ? getProfilePicture(otherParticipant) : null}
                              name={title}
                              size="sm"
                              presenceStatus={presenceStatus}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm truncate transition-colors ${unreadCount > 0 ? "text-white font-semibold" : "text-white font-medium"}`}>
                              {title}
                            </div>
                            <div className={`text-xs truncate transition-colors ${unreadCount > 0 ? "text-zinc-300" : "text-zinc-500"}`}>
                              {lastMessagePreview}
                            </div>
                          </div>
                          {unreadCount > 0 && (
                            <motion.div 
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              className="min-w-[20px] h-[20px] ml-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 text-[11px] font-bold flex items-center justify-center shadow-md flex-shrink-0"
                            >
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Windows */}
        <div className="flex flex-row-reverse items-end gap-3 pointer-events-none w-full h-full">
          <AnimatePresence>
            {windows.map((w) => {
              const cid = String(w.conversationId);
              const unreadCount = unread?.[cid] || 0;
              const typingText = getTypingNames(cid);
              const conv = (conversations || []).find((c) => String(c.id) === cid);
              const isDirect = conv?.conversation_type === "direct";

              const { presenceStatus, statusText } = isDirect
                ? getPresenceForDirect({
                    conv,
                    currentUserId: currentUser?.id,
                    onlineUsers,
                    lastActiveAt,
                    lastSeenAt,
                    nowTs,
                  })
                : { presenceStatus: "offline", statusText: "" };

              return (
                <motion.div
                  key={cid}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.9 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className={`${isMobile ? "fixed inset-0 rounded-none" : "w-[380px] border border-zinc-800 rounded-2xl"} flex flex-col bg-zinc-900 shadow-2xl overflow-hidden pointer-events-auto`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-zinc-950 to-zinc-900 border-b border-zinc-800 flex-shrink-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {isDirect && (() => {
                        const other = conv?.participants?.find((p) => String(p.id) !== String(currentUser?.id));
                        return (
                          <button
                            type="button"
                            onClick={() => goToProfile(other?.id)}
                            className="flex-shrink-0 hover:opacity-80 transition-opacity"
                          >
                            <Avatar
                              src={getProfilePicture(other)}
                              name={w.title}
                              size="sm"
                              presenceStatus={presenceStatus}
                              showStatus={false}
                            />
                          </button>
                        );
                      })()}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${
                              presenceStatus === "online"
                                ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                                : presenceStatus === "idle"
                                  ? "bg-yellow-400"
                                  : "bg-zinc-500"
                            }`}
                          />
                          <span className="text-sm font-semibold text-white truncate">{w.title}</span>
                          {w.minimized && unreadCount > 0 && (
                            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-md">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </div>
                        {isDirect && !w.minimized && (
                          <div className="text-[11px] text-zinc-400 truncate">{statusText}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!isMobile && (
                        <button
                          onClick={() => toggleMinimize(cid)}
                          className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 transition-colors"
                          title="Minimize"
                        >
                          <Minus size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (isMobile) {
                            setIsPanelOpen(false);
                            callback();
                          }
                          closeWindow(cid);
                        }}
                        className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 transition-colors"
                        title="Close"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {!w.minimized && (
                    <>
                      {/* Messages */}
                      <div className={`${isMobile ? "flex-1" : "h-[60vh]"} overflow-y-auto p-3 bg-zinc-950 space-y-0`}>
                        {w.loading ? (
                          <div className="text-sm text-zinc-500">Loading…</div>
                        ) : (
                          (w.messages || []).map((m, i) => {
                            const isOwn = String(m.sender_id) === String(currentUser?.id);
                            const showAvatar = shouldShowAvatar(w.messages, m, i, currentUser?.id);
                            return (
                              <MessageBubble
                                key={m.id || `${cid}-${i}`}
                                message={m}
                                isOwn={isOwn}
                                showAvatar={showAvatar}
                                showSenderName={conv?.conversation_type !== "direct" && shouldShowSenderName(w.messages, i)}
                                conversationType={conv?.conversation_type}
                                variant="dock"
                              />
                            );
                          })
                        )}
                        {typingText && (
                          <div className="flex items-center gap-2 px-2 py-1 animate-fade-in">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            <span className="text-xs text-zinc-500 italic">{typingText}</span>
                          </div>
                        )}
                        <div ref={(el) => (messageEndRefs.current[cid] = el)} />
                      </div>

                      {/* Input */}
                      <div className="bg-zinc-900 border-t border-zinc-800 p-2 flex-shrink-0">
                        <ChatInput
                          value={w.draft || ""}
                          onChange={(val) => {
                            setWindows((prev) =>
                              prev.map((x) => (String(x.conversationId) === cid ? { ...x, draft: val } : x))
                            );
                            if (socket) {
                              socket.emit("typing_start", { conversation_id: cid });
                              if (typingTimeoutsRef.current[cid]) clearTimeout(typingTimeoutsRef.current[cid]);
                              typingTimeoutsRef.current[cid] = setTimeout(
                                () => socket.emit("typing_stop", { conversation_id: cid }),
                                1200
                              );
                            }
                          }}
                          onSend={(payload) => {
                            if (socket) socket.emit("typing_stop", { conversation_id: cid });
                            sendMessage(cid, payload);
                          }}
                          socket={socket}
                          conversationId={cid}
                          onFileUpload={(file) => handleFileUpload({ file, conversationId: cid, token })}
                        />
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
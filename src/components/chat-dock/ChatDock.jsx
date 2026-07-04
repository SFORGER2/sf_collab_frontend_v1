import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, Minus, MessageCircle, Trash2, Archive, ArchiveRestore, Pin, PinOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/chat (previous)/Avatar";
import MessageBubble from "@/components/chat (previous)/MessageBubble";
import ChatInput from "@/components/chat (previous)/ChatInput";
import { useAppSocket } from "@/context/SocketProvider";
import { getProfilePicture } from "@/utils/getProfilePicture";
import ChatNotification from "./ChatNotification";
import { chatAPI } from "@/utils/APIs/chatApi";
import { plotCount } from "@/utils/plotCount";
import { formatFriendlyDate } from "@/utils/formatFriendlyDate";



// show name only on first message in a run (group/general/startup)
function shouldShowSenderName(messages, index) {
  if (index === 0) return true;

  const prev = messages[index - 1];
  const curr = messages[index];

  const prevId = String(prev?.sender_id ?? prev?.sender?.id ?? "");
  const currId = String(curr?.sender_id ?? curr?.sender?.id ?? "");

  return prevId !== currId;
}


const LS_WINDOWS_KEY = "chatDock:windows";
const LS_UNREAD_KEY = "chatDock:unread";

// ─── Feature 2: conversation_type → dock tab mapping ─────────────────────
const TYPE_TO_DOCK_TAB = {
  direct: 'friends',
  group: 'groups',
  team: 'startups',
  startup: 'startups',  // backend may use 'startup' or 'team' — accept both
  general: 'general',
};

function useDockTabUnreadCounts(unread, conversations) {
  return useMemo(() => {
    const counts = { all: 0, friends: 0, groups: 0, startups: 0, general: 0 };
    for (const [cid, count] of Object.entries(unread || {})) {
      const n = Number(count) || 0;
      if (n <= 0) continue;
      counts.all += n;
      const conv = conversations.find(c => String(c.id) === cid);
      const tab = TYPE_TO_DOCK_TAB[conv?.conversation_type];
      if (tab) counts[tab] += n;
    }
    return counts;
  }, [unread, conversations]);
}
// ✅ FIX: Use same key as ChatPage so last_seen is shared between both components.
// Previously ChatDock used "chatDock:presence:lastSeen" and ChatPage used
// "presence:lastSeenAt" — they never shared data, causing different timestamps.
const LS_PRESENCE_KEY = "presence:lastSeenAt";
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
  // Only use real socket-derived last_seen, never stale last_login from DB
  const lastSeenTs = toMs(lastSeenAt?.[otherId] ?? other?.last_seen ?? other?.lastSeen);

  if (connected) {
    // Connected = NEVER offline. Only Online or Away.
    const diff = lastActiveTs ? Math.max(0, nowTs - lastActiveTs) : null;
    if (diff == null || diff < 5 * 60 * 1000) return { presenceStatus: "online", statusText: "Online" };
    return { presenceStatus: "idle", statusText: "Away" };
  }

  // Disconnected - show last seen
  const seenTs = lastSeenTs || lastActiveTs;
  return { presenceStatus: "offline", statusText: seenTs ? formatLastSeen(seenTs, nowTs) : "Offline" };
};

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value ?? "");
  } catch {
    return fallback;
  }
}

const handleFileUpload = async ({ file, conversationId, token, caption = "" }) => {
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
    // Some backends return differently shaped response
    if (response?.data?.file_url) return response.data.file_url;
    if (response?.file_url) return response.file_url;
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
    // Preserve read receipt fields so ticks survive page reload
    status: m.status || m.delivery_status || m.deliveryStatus || null,
    delivery_status: m.status || m.delivery_status || m.deliveryStatus || null,
    read_at: m.read_at || m.readAt || null,
    delivered_at: m.delivered_at || m.deliveredAt || null,
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
  // ─── Feature 5: archive panel state ──────────────────────────────────────
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [consideredActive, setConsideredActive] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);

  const [conversations, setConversations] = useState([]);
  // ─── Feature 5: archived conversations ───────────────────────────────────
  const [archivedConversations, setArchivedConversations] = useState([]);
  const [pinnedConversations, setPinnedConversations] = useState(new Set());
  const [conversationToDelete, setConversationToDelete] = useState(null);

  const [isLoadingConvos, setIsLoadingConvos] = useState(false);

  const [lastActiveAt, setLastActiveAt] = useState(() =>
    safeJsonParse(localStorage.getItem("presence:lastActiveAt"), {})
  );
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
      ? saved.map((w) => {
          // ─── Feature 3: restore draft from localStorage ────────────────
          let savedDraft = "";
          try { savedDraft = localStorage.getItem("chatDock:draft:" + w.conversationId) || ""; } catch {}
          return {
            conversationId: w.conversationId,
            title: w.title || "Chat",
            minimized: !!w.minimized,
            messages: [],
            loading: false,
            draft: savedDraft,
          };
        })
      : [];
  });
  const isWindowsOpen = useMemo(() => windows.length > 0, [windows]);

  useEffect(() => {
    try { localStorage.setItem(LS_PRESENCE_KEY, JSON.stringify(lastSeenAt || {})); } catch {}
  }, [lastSeenAt]);

  useEffect(() => {
    try { localStorage.setItem("presence:lastActiveAt", JSON.stringify(lastActiveAt || {})); } catch {}
  }, [lastActiveAt]);

  // Sync presence maps from other tabs (ChatPage <-> ChatDock)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "presence:lastSeenAt") {
        setLastSeenAt(safeJsonParse(e.newValue, {}));
      }
      if (e.key === "presence:lastActiveAt") {
        setLastActiveAt(safeJsonParse(e.newValue, {}));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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

  // ─── Feature 2: per-tab unread badge counts ───────────────────────────────
  const dockTabUnreadCounts = useDockTabUnreadCounts(unread, conversations);

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

    // Also zero out the server-provided unread_count on the conversation object
    // so the badge doesn't re-appear from stale server data
    setConversations((prev) =>
      prev.map((c) => String(c.id) === key ? { ...c, unread_count: 0 } : c)
    );
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
        // ─── Feature 5: split active vs archived ─────────────────────────
        setConversations(convos.filter(c => !c.is_archived));
        setArchivedConversations(convos.filter(c => c.is_archived));
        setPinnedConversations(new Set(convos.filter(c => c.is_pinned).map(c => String(c.id))));

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

          // Always clear unread when messages load. isConvMinimized() reads stale state
          // due to React batching — openWindow() already zeroed the badge optimistically,
          // but we still emit mark_read so the backend DB and other participants sync.
          if (consideredActive) {
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
    [token, scrollToBottom, socket, consideredActive, clearUnread]
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

        // ─── Feature 3: restore saved draft ───────────────────────────
        let savedDraft = "";
        try { savedDraft = localStorage.getItem("chatDock:draft:" + cid) || ""; } catch {}

        const next = [
          ...prev,
          { conversationId: cid, title: title || "Chat", minimized: false, messages: [], loading: false, draft: savedDraft },
        ];
        if (next.length > maxWindows) next.shift();

        persistWindows(next);
        return next;
      });

      // FIX #3: Optimistically zero out unread locally and tell backend to mark as read
      // Backend will emit unread_count_update back via socket confirming the reset
      clearUnread(cid);
      socket?.emit?.("join_conversation", { conversation_id: cid });
      socket?.emit?.("mark_read", { conversation_id: cid });
      // Also call REST endpoint so DB is updated and socket event fires
      try {
        if (token) {
          await chatAPI.markConversationRead(cid);
        }
      } catch (e) {
        // non-critical — local state already cleared above
      }
      await fetchMessages(cid);
    },
    [fetchMessages, maxWindows, persistWindows, clearUnread, socket, token]
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
      // ─── Feature 3: clear draft on close ──────────────────────────────
      try { localStorage.removeItem("chatDock:draft:" + cid); } catch {}
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

  // ─── Feature 5: Archive / Unarchive ────────────────────────────────────
  const handleArchiveConv = useCallback(async (conversationId) => {
    try {
      await chatAPI.archiveConversation(conversationId);
      setConversations(prev => {
        const conv = prev.find(c => String(c.id) === String(conversationId));
        if (conv) setArchivedConversations(a => [{ ...conv, is_archived: true }, ...a]);
        return prev.filter(c => String(c.id) !== String(conversationId));
      });
      closeWindow(conversationId);
    } catch (e) { console.error('Archive failed:', e); }
  }, [closeWindow]);

  const handleUnarchiveConv = useCallback(async (conversationId) => {
    try {
      await chatAPI.unarchiveConversation(conversationId);
      setArchivedConversations(prev => {
        const conv = prev.find(c => String(c.id) === String(conversationId));
        if (conv) setConversations(a => [{ ...conv, is_archived: false }, ...a]);
        return prev.filter(c => String(c.id) !== String(conversationId));
      });
    } catch (e) { console.error('Unarchive failed:', e); }
  }, []);

  const handlePinConv = useCallback(async (conversationId) => {
    try {
      await chatAPI.pinConversation(conversationId);
      setPinnedConversations(prev => new Set([...prev, String(conversationId)]));
      setConversations(prev => prev.map(c =>
        String(c.id) === String(conversationId) ? { ...c, is_pinned: true } : c
      ));
    } catch (e) { console.error('Pin failed:', e); }
  }, []);

  const handleUnpinConv = useCallback(async (conversationId) => {
    try {
      await chatAPI.unpinConversation(conversationId);
      setPinnedConversations(prev => { const s = new Set(prev); s.delete(String(conversationId)); return s; });
      setConversations(prev => prev.map(c =>
        String(c.id) === String(conversationId) ? { ...c, is_pinned: false } : c
      ));
    } catch (e) { console.error('Unpin failed:', e); }
  }, []);

useEffect(() => {
  const handleLeaveGroup = async (e) => {
    const { conversationId } = e.detail || {};
    if (!conversationId) return;

    try {
      await chatAPI.leaveConversation(conversationId);

      setConversations((prev) =>
        prev.filter((c) => String(c.id) !== String(conversationId))
      );

      closeWindow(conversationId);

      window.dispatchEvent(
        new CustomEvent("chat:conversationLeft", {
          detail: { conversationId },
        })
      );
    } catch (error) {
      console.error("Failed to leave conversation:", error);
      alert("Failed to leave conversation.");
    }
  };

  window.addEventListener("chat:leaveGroup", handleLeaveGroup);
  return () =>
    window.removeEventListener("chat:leaveGroup", handleLeaveGroup);
}, [closeWindow]);


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
      if (data.status === "away") {
        // Server confirms user is Away — backdate lastActiveAt so idle shows immediately
        const awayTs = now() - (5 * 60 * 1000 + 1000);
        setLastActiveAt((prev) => ({ ...prev, [id]: awayTs }));
      }
      if (data.status === "offline") {
        // Prefer the authoritative timestamp from the backend (added in disconnect handler)
        // over local Date.now() which can differ by network latency
        const ts = toMs(data?.last_seen) || now();
        setLastSeenAt((prev) => {
          const next = { ...prev, [id]: ts };
          // Also write to the shared localStorage key so ChatPage picks it up
          try { localStorage.setItem(LS_PRESENCE_KEY, JSON.stringify(next)); } catch {}
          return next;
        });
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
    window.addEventListener("click", ping);
    window.addEventListener("scroll", ping, { passive: true });
    const interval = setInterval(ping, 20000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", ping);
      window.removeEventListener("click", ping);
      window.removeEventListener("scroll", ping);
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

      // Bump conversation to top of list by updating last_message_at
      const msgTime = messageNorm.created_at || new Date().toISOString();
      setConversations((prev) => {
        const exists = prev.some((c) => String(c.id) === cid);
        if (!exists) {
          // ─── Feature 5: auto-unarchive if message for archived chat ────
          setArchivedConversations(arPrev => {
            const archConv = arPrev.find(c => String(c.id) === cid);
            if (archConv) {
              setConversations(a => [{ ...archConv, is_archived: false, last_message_at: msgTime, updated_at: msgTime }, ...a]);
              return arPrev.filter(c => String(c.id) !== cid);
            }
            return arPrev;
          });
          return prev;
        }
        return prev.map((c) =>
          String(c.id) === cid ? { ...c, last_message_at: msgTime, updated_at: msgTime } : c
        );
      });

      // ── Fix: guard against own file-upload messages (sender_id may be int vs str) ──
      const isOwnMessage = !!messageNorm.sender_id && !!currentUser?.id &&
        String(messageNorm.sender_id) === String(currentUser?.id);

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

            const url = `/chat?user=${messageNorm.id}`
            setTimeout(() => {
              setIsNotificationOpen(false)
            }, 4000);
            setUserMessageSent({
              title,
              url,
              message,
              id: messageNorm.conversation_id,
              conversationType: data?.conversation?.conversation_type || 'direct',
            });

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

    // ─── Feature 6: real-time pin sync ────────────────────────────────────
    const onConvPinned = (data) => {
      const cid = String(data.conversation_id);
      const ip = !!data.is_pinned;
      setPinnedConversations(prev => { const s = new Set(prev); ip ? s.add(cid) : s.delete(cid); return s; });
      setConversations(prev => prev.map(c => String(c.id) === cid ? { ...c, is_pinned: ip } : c));
    };
    socket.on("conversation_pinned", onConvPinned);

    // ── Startup membership: added to a conversation ────────────────────────
    const onConversationAdded = (data) => {
      const conv = data?.conversation;
      if (!conv) return;
      setConversations((prev) => {
        if (prev.some((c) => String(c.id) === String(conv.id))) return prev;
        return [conv, ...prev];
      });
    };
    socket.on("conversation_added", onConversationAdded);

    // ── Startup membership: removed from a conversation ────────────────────
    const onConversationRemoved = (data) => {
      const cid = String(data?.conversation_id ?? '');
      if (!cid) return;
      setConversations((prev) => prev.filter((c) => String(c.id) !== cid));
      // Close the dock window if it was open
      setWindows((prev) => {
        const hadIt = prev.some((w) => String(w.conversationId) === cid);
        if (!hadIt) return prev;
        return prev.filter((w) => String(w.conversationId) !== cid);
      });
    };
    socket.on("conversation_removed", onConversationRemoved);

    // Read receipt status updates - update message status in the correct window
    const handleStatusUpdate = (data) => {
      const { message_id, conversation_id, status } = data || {};
      if (!message_id || !conversation_id) return;
      const cid = String(conversation_id);

      setWindows((prev) =>
        prev.map((w) => {
          if (String(w.conversationId) !== cid) return w;
          const updatedMessages = (w.messages || []).map((m) =>
            String(m.id) === String(message_id)
              ? {
                  ...m,
                  status,
                  delivery_status: status,
                  ...(status === "read" ? { read_at: data.read_at || new Date().toISOString() } : {}),
                  ...(status === "delivered" ? { delivered_at: data.delivered_at || new Date().toISOString() } : {}),
                }
              : m
          );
          return { ...w, messages: updatedMessages };
        })
      );
    };

    socket.on("message_status_update", handleStatusUpdate);
    socket.on("message_read", handleStatusUpdate);
    socket.on("message_delivered", handleStatusUpdate);

    // Handle bulk read confirmation from backend (emitted on mark_read socket event)
    const handleMessagesRead = (data) => {
      const cid = String(data?.conversation_id || "");
      const readAt = data?.timestamp || new Date().toISOString();
      if (!cid) return;
      // Mark all messages in this conversation as read
      setWindows((prev) =>
        prev.map((w) => {
          if (String(w.conversationId) !== cid) return w;
          return {
            ...w,
            messages: (w.messages || []).map((m) => {
              const isOwn = String(m.sender_id) === String(currentUser?.id);
              if (!isOwn) return m; // only update our own messages
              return { ...m, status: "read", delivery_status: "read", read_at: readAt };
            }),
          };
        })
      );
    };
    socket.on("messages_read", handleMessagesRead);

    // FIX #3b: Listen for backend confirmation that unread count was reset
    const onUnreadCountUpdate = (data) => {
      const cid = String(data?.conversation_id);
      if (!cid) return;
      // Confirm the zero out from backend
      setUnread((prev) => {
        const next = { ...prev, [cid]: 0 };
        localStorage.setItem(LS_UNREAD_KEY, JSON.stringify(next));
        return next;
      });
    };
    socket.on("unread_count_update", onUnreadCountUpdate);

    return () => {
      socket.off("new_message", handleIncomingMessage);
      socket.off("conversation_message", handleIncomingMessage);
      socket.off("conversation_pinned", onConvPinned);
      socket.off("conversation_added", onConversationAdded);
      socket.off("conversation_removed", onConversationRemoved);
      socket.off("message_status_update", handleStatusUpdate);
      socket.off("message_read", handleStatusUpdate);
      socket.off("message_delivered", handleStatusUpdate);
      socket.off("messages_read", handleMessagesRead);
      socket.off("unread_count_update", onUnreadCountUpdate);
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
    (conversationId, payload) => {
      if (!socket) return;

      const cid = String(conversationId);
      if (!cid || !payload) return;

      // TEXT MESSAGE
      if (typeof payload === "string") {
        const text = payload.trim();
        if (!text) return;

        socket.emit("send_message", {
          conversation_id: cid,
          content: text || " ",
        });
      }

      // FILE OR MIXED MESSAGE
      if (typeof payload === "object") {
        const text = payload.content?.trim() || "";

        socket.emit("send_message", {
          conversation_id: cid,
          content: text,
          file_url: payload.file_url || null,
          file_name: payload.file_name || null,
          file_type: payload.file_type || null,
          is_image: payload.is_image || false,
        });
      }

      // clear draft
      setWindows((prev) =>
        prev.map((w) =>
          String(w.conversationId) === cid ? { ...w, draft: "" } : w
        )
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

    // ─── Feature 5: switch source based on showArchived ─────────────────
    const source = showArchived ? archivedConversations : (conversations || []);

    return source.filter((c) => {
      if (term) {
        const display =
          c.name ||
          c.participants?.find((p) => String(p.id) !== String(currentUser?.id))?.firstName ||
          "";
        if (!String(display).toLowerCase().includes(term)) return false;
      }

      // ─── Feature 2: per-tab filtering ─────────────────────────────────
      if (!showArchived) {
        if (activeTab === "online") return isDirectOnline(c);
        if (activeTab === "friends") return c.conversation_type === "direct";
        if (activeTab === "groups") return c.conversation_type === "group";
        if (activeTab === "startups") return c.conversation_type === "team" || c.conversation_type === "startup";
        if (activeTab === "general") return c.conversation_type === "general";
      }
      return true;
    }).sort((a, b) => {
      // Feature 6: pinned first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      const aLast = a.last_message_at || a.updated_at || a.created_at || 0;
      const bLast = b.last_message_at || b.updated_at || b.created_at || 0;
      return new Date(bLast).getTime() - new Date(aLast).getTime();
    })
  }, [conversations, archivedConversations, searchTerm, activeTab, showArchived, onlineUsers, currentUser?.id, pinnedConversations]);

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
      
      <ChatNotification
        onClick={() => {
          openWindow({ conversationId: userMessageSent?.id, title: userMessageSent?.title});
        }}
        isOpen={isNotificationOpen}
        setIsOpen={setIsNotificationOpen}
        title={userMessageSent.title}
        url={userMessageSent.url}
        message={userMessageSent.message}
        conversationType={userMessageSent.conversationType || "direct"}
      />

      {/* Launcher Button */}
      {(!isPanelOpen && !isWindowsOpen && !isMobile) && (
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
                {plotCount(totalUnread)}
              </span>
            </motion.div>
          )}
        </motion.button>
      )}

      <div className={`fixed ${isMobile ? "inset-0" : "bottom-4 right-20"} z-[9999] flex items-end pointer-events-none`}>
        {/* Panel */}
        <div className="flex flex-row items-end gap-4 pointer-events-auto">
          <div style={{order: 2}}>
          <AnimatePresence>
            {isPanelOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className={`${isMobile ? "fixed inset-0 rounded-none" : "w-[min(320px,calc(100vw-16px))] rounded-2xl"} bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col`}
                style={isMobile ? {} : {maxHeight: "min(85vh, 640px)"}}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 bg-zinc-950 border-b border-zinc-800 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-white">
                      {showArchived ? "Archived Chats" : "Chats"}
                    </div>
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
                  {/* ─── Feature 1+2: Tabs with unread badges ─────────── */}
                  {!showArchived && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {[
                        { id: "all", label: "All" },
                        { id: "friends", label: "Friends" },
                        { id: "groups", label: "Groups" },
                        { id: "startups", label: "Startups" },
                        { id: "general", label: "General" },
                        { id: "online", label: "Online" },
                      ].map(({ id, label }) => {
                        const count = dockTabUnreadCounts[id] || 0;
                        return (
                          <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`relative px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                              activeTab === id ? "bg-amber-500 text-zinc-900 shadow-md" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                            }`}
                          >
                            {label}
                            {count > 0 && (
                              <span className="absolute -top-1.5 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                                {count > 99 ? '99+' : count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Conversations List */}
                <div className="overflow-y-auto p-2" style={{maxHeight:"min(60vh,420px)",scrollbarWidth:"thin",scrollbarColor:"#3f3f46 transparent"}}>
                  {isLoadingConvos ? (
                    <div className="p-4 text-zinc-500 text-sm">Loading…</div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-4 text-zinc-500 text-sm text-center">
                      {showArchived ? "No archived chats" : "No conversations"}
                    </div>
                  ) : (
                    filteredConversations.map((conv) => {
                      const otherParticipant = conv.participants?.find(
                        (p) => String(p.id) !== String(currentUser?.id)
                      );
                      const isDirect = conv.conversation_type === "direct";
                      const title = conv.name || otherParticipant?.firstName || "Chat";
                      // Use local unread state as source of truth; fallback to server count only if not yet tracked
                      const localUnread = unread?.[String(conv.id)];
                      const unreadCount = localUnread != null ? Number(localUnread) : (Number(conv.unread_count) || 0);
                      let lastMsg = conv.last_message || conv.lastMessage;

                      // ─── Feature 3: draft preview ──────────────────────
                      let dockDraftText = "";
                      try { dockDraftText = localStorage.getItem("chatDock:draft:" + String(conv.id)) || ""; } catch {}

                      let lastMessagePreview = "No messages yet";
                      if (dockDraftText.trim()) {
                        lastMessagePreview = dockDraftText.trim();
                      } else if (lastMsg) {
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
                        <div key={conv.id} className="relative group">

                        <motion.button
                          whileHover={{ x: 4 }}
                          onClick={() => {
                            
                            openWindow({ conversationId: conv.id, title });
                            if (isMobile) setIsPanelOpen(false);
                          }}
                          className={`w-full text-left my-1 px-3 py-3 rounded-xl transition-all hover:bg-zinc-800 flex items-center gap-3 ${
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
                              {dockDraftText.trim() ? (
                                <><span className="text-amber-400 font-medium">Draft: </span><span>{lastMessagePreview.length > 25 ? lastMessagePreview.slice(0, 25) + "..." : lastMessagePreview}</span></>
                              ) : lastMessagePreview}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                          <span className="text-[0.6rem] text-gray-600 group-hover:opacity-0 transition-opacity">{formatFriendlyDate(lastMsg?.created_at)}</span>
                          {unreadCount > 0 && (
                            <motion.div 
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              className="min-w-[20px] h-[20px] ml-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 text-[11px] font-bold flex items-center justify-center shadow-md flex-shrink-0"
                            >
                              {plotCount(unreadCount)}
                            </motion.div>
                            )}
                          </div>
                        </motion.button>
                        {/* ─── Feature 5: Archive/Unarchive + Delete buttons ─── */}
                        <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto">
                          {showArchived ? (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleUnarchiveConv(conv.id); }}
                              className="p-1.5 rounded-lg hover:bg-blue-500/20 text-zinc-600 hover:text-blue-400 transition-all"
                              title="Unarchive"
                            >
                              <ArchiveRestore size={14} />
                            </button>
                          ) : (
                            <>
                              {/* Pin / Unpin */}
                              {conv.is_pinned ? (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleUnpinConv(conv.id); }}
                                  className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-all"
                                  title="Unpin"
                                >
                                  <PinOff size={14} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handlePinConv(conv.id); }}
                                  className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-zinc-600 hover:text-indigo-400 transition-all"
                                  title="Pin"
                                >
                                  <Pin size={14} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleArchiveConv(conv.id); }}
                                className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-600 hover:text-zinc-300 transition-all"
                                title="Archive"
                              >
                                <Archive size={14} />
                              </button>
                              {isDirect && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setConversationToDelete({ id: conv.id, title }); }}
                                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-600 hover:text-red-400 transition-all"
                                  title="Delete conversation"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>

                        </div>
                      );
                    })
                  )}

                  {/* ─── Feature 5: Archive toggle at bottom of list ───── */}
                  {!showArchived && archivedConversations.length > 0 && (
                    <button
                      onClick={() => setShowArchived(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 text-xs transition-colors"
                    >
                      <Archive size={13} />
                      <span>Archived ({archivedConversations.length})</span>
                    </button>
                  )}
                  {showArchived && (
                    <button
                      onClick={() => setShowArchived(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 text-xs transition-colors"
                    >
                      <span>← Back to Chats</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>

        {/* Chat Windows */}
        <div className="flex flex-row-reverse items-end gap-2 pointer-events-none" style={{order: 1}}>
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
                  className={`${isMobile ? "fixed inset-0 rounded-none" : "w-[min(340px,calc(100vw-24px))] border border-zinc-800 rounded-2xl"} flex flex-col bg-zinc-900 shadow-2xl pointer-events-auto`}
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
                              {plotCount(unreadCount)}
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
                      <div className={`${isMobile ? "flex-1" : "h-[440px]"} overflow-y-auto p-3 bg-zinc-950 space-y-0 scrollbar-none`} style={{scrollbarWidth:"none",msOverflowStyle:"none"}}>
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
                                currentUserId={currentUser?.id}
                                variant="dock"
                                showSenderName={
                                  conv?.conversation_type !== "direct" &&
                                  shouldShowSenderName(w.messages, i)
                                }
                                conversationType={conv?.conversation_type}
                                conversationId={cid}
                                setMessages={(updater) => {
                                  setWindows((prev) =>
                                    prev.map((win) => {
                                      if (String(win.conversationId) === cid) {
                                        const newMessages =
                                          typeof updater === "function"
                                            ? updater(win.messages)
                                            : updater;

                                        return { ...win, messages: newMessages };
                                      }
                                      return win;
                                    })
                                  );
                                }}
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
                            // ─── Feature 3: persist draft ────────────────
                            try {
                              if (val && val.trim()) localStorage.setItem("chatDock:draft:" + cid, val);
                              else localStorage.removeItem("chatDock:draft:" + cid);
                            } catch {}
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
                            // ─── Feature 3: clear draft on send ──────────
                            try { localStorage.removeItem("chatDock:draft:" + cid); } catch {}
                          }}
                          socket={socket}
                          conversationId={cid}
                          onFileUpload={(file, caption) => handleFileUpload({ file, conversationId: cid, token, caption })}
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
      </div>
      {conversationToDelete && (
      <div
        className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4"
        onClick={() => setConversationToDelete(null)}
      >
        <div
          className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5">
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete Conversation
            </h3>

            <p className="text-zinc-400 text-sm mb-5">
              Are you sure you want to delete "{conversationToDelete.title}"?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConversationToDelete(null)}
                className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-200"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    await chatAPI.deleteConversation(conversationToDelete.id);

                    setConversations((prev) =>
                      prev.filter(
                        (c) =>
                          String(c.id) !==
                          String(conversationToDelete.id)
                      )
                    );

                    closeWindow(conversationToDelete.id);
                    setConversationToDelete(null);
                  } catch (error) {
                    console.error("Delete failed:", error);
                    alert("Delete failed.");
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    </>
  );
}
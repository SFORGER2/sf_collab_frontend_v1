import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit3, MessageCircle, HamburgerIcon, Menu, Archive, ChevronRight, ChevronDown } from 'lucide-react';
import MobileChatPage from "./MobileChatPage";

// Import chat components
import Avatar from '@/components/chat (previous)/Avatar';
import TypingIndicator from '@/components/chat (previous)/TypingIndicator';
import MessageBubble from '@/components/chat (previous)/MessageBubble';
import ConversationItem from '@/components/chat (previous)/ConversationItem';
import OnlineContactsSidebar from '@/components/chat (previous)/OnlineContactsSidebar';
import NewMessageModal from '@/components/chat (previous)/NewMessageModal';
import ChatHeader from '@/components/chat (previous)/ChatHeader';
import ChatInput from '@/components/chat (previous)/ChatInput';
import DateSeparator, { shouldShowDateSeparator } from '@/components/chat (previous)/DateSeparator';
import { useAppSocket } from "@/context/SocketProvider";
import { useChatContacts } from "@/context/ChatContactsProvider";
import { useSearchParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import { getProfilePicture } from '@/utils/getProfilePicture';
import { chatAPI } from '@/utils/APIs/chatApi';
import { resolveUserId } from '@/utils/resolveUserId';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ─── Feature 1: Tab persistence helpers ──────────────────────────────────
const getTabKey = (userId) => `sfcollab:chat_tab:${userId}`;
const VALID_TABS = ['all', 'friends', 'groups', 'startups', 'general', 'archived'];

// ─── Feature 2: conversation_type → tab mapping for unread badge counts ──
const TYPE_TO_TAB = {
  direct: 'friends',
  group: 'groups',
  team: 'startups',
  startup: 'startups',  // backend may use 'startup' or 'team' — accept both
  general: 'general',
};

const toMs = (ts) => {
  if (!ts) return null;
  if (typeof ts === "number") return ts;
  const n = Number(ts);
  if (!Number.isNaN(n)) return n;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
};

const isArchivedFlag = (value) => value === true || value === 1 || value === "1";

const formatLastSeen = (ts, nowTs) => {
  const ms = toMs(ts);
  if (!ms) return "offline";

  const now = new Date(nowTs || Date.now());
  const d = new Date(ms);

  // minutes ago (0–59)
  const diffMs = Math.max(0, now.getTime() - d.getTime());
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "last seen just now";
  if (mins < 60) return mins === 1 ? "last seen 1 min ago" : `last seen ${mins} mins ago`;

  // helpers
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

  // 60+ mins but still today
  if (sameDay) return `last seen ${timeStr}`;

  // crossed midnight -> yesterday
  if (yesterday) return `last seen yesterday, ${timeStr}`;

  // 2+ days ago -> d/m/yy time (matches your example)
  const day = d.getDate(); // no leading zero
  const month = d.getMonth() + 1; // no leading zero
  const yy = String(d.getFullYear()).slice(-2);
  return `last seen ${day}/${month}/${yy} ${timeStr}`;
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
          firstName: m.sender_first_name || m.senderFirstName || m.sender_name || m.firstName || "",
          lastName: m.sender_last_name || m.senderLastName || m.lastName || "",
          first_name: m.sender_first_name || m.senderFirstName || m.sender_name || m.firstName || "",
          last_name: m.sender_last_name || m.senderLastName || m.lastName || "",
          profilePicture: m.sender_profile_picture || m.profilePicture || null,
          profile_picture: m.sender_profile_picture || m.profilePicture || null,
        }
      : null);

  // Derive status from multiple possible field names
  const status = m.status || m.delivery_status || m.deliveryStatus || null;
  const read_at = m.read_at || m.readAt || null;
  const delivered_at = m.delivered_at || m.deliveredAt || null;

  return {
    ...m,
    created_at: created,
    sender,
    sender_id: m.sender_id || sender?.id,
    content: m.content ?? m.original_content ?? m.message ?? "",
    // Preserve read receipt fields so ticks survive page reload
    status: status,
    delivery_status: status,
    read_at: read_at,
    delivered_at: delivered_at,
  };
}

  const LS_LAST_ACTIVE_KEY = "presence:lastActiveAt";
  const LS_LAST_SEEN_KEY = "presence:lastSeenAt";

  function readPresenceMap(key) {
    try {
      const raw = localStorage.getItem(key);
      const obj = raw ? JSON.parse(raw) : {};
      return obj && typeof obj === "object" ? obj : {};
    } catch {
      return {};
    }
  }

  function writePresenceMap(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value || {}));
    } catch {
      // ignore
    }
  }


// ─── Feature 2: Per-tab unread badge counts (derived from conversations) ─
function useTabUnreadCounts(conversations) {
  return useMemo(() => {
    const counts = { all: 0, friends: 0, groups: 0, startups: 0, general: 0 };
    for (const c of conversations) {
      if (c.is_archived) continue;
      const unread = Number(c.unread_count) || 0;
      if (unread <= 0) continue;
      counts.all += unread;
      const tab = TYPE_TO_TAB[c.conversation_type];
      if (tab) counts[tab] += unread;
    }
    return counts;
  }, [conversations]);
}

const MobileChatPageSwitcher = () => {
  
  const navigate = useNavigate();
// ============================================
  // AUTH
  // ============================================
  const { user :currentUser, access_token: token } = useSelector((state) => state.auth);

  // ============================================
  // SOCKET CONNECTION
  // ============================================
  
  const { socket, isConnected, onlineUsers } = useAppSocket();
  const { friends } = useChatContacts();


  // ============================================
  // STATE
  // ============================================
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [lastActiveAt, setLastActiveAt] = useState(() => readPresenceMap(LS_LAST_ACTIVE_KEY));
  const [lastSeenAt, setLastSeenAt] = useState(() => readPresenceMap(LS_LAST_SEEN_KEY));
  const [nowTs, setNowTs] = useState(Date.now());

  const [messageInput, setMessageInput] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showContactsSidebar, setShowContactsSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchParams] = useSearchParams();
  const currentUserId = useMemo(() => String(resolveUserId(currentUser) ?? ""), [currentUser]);

  // ─── Feature 1: Persisted tab (per-user, survives refresh + multi-tab) ──
  const tabKey = currentUserId ? getTabKey(currentUserId) : null;
  const [activeTab, setActiveTab] = useState(() => {
    if (!tabKey) return 'all';
    try { const s = localStorage.getItem(tabKey); return VALID_TABS.includes(s) ? s : 'all'; }
    catch { return 'all'; }
  });

  const handleSetActiveTab = useCallback((tab) => {
    setActiveTab(tab);
    if (tabKey) { try { localStorage.setItem(tabKey, tab); } catch {} }
    // BroadcastChannel: sync to other browser tabs
    try {
      const bc = new BroadcastChannel('sfcollab:chat_tab');
      if (currentUserId && bc) {
        bc.postMessage({ userId: currentUserId, tab });
        bc.close();
      }
      
    } catch {}
  }, [tabKey, currentUserId]);

  // Listen for tab changes from other browser tabs
  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel('sfcollab:chat_tab');
      bc.onmessage = (e) => {
        if (e.data?.userId === currentUserId && VALID_TABS.includes(e.data?.tab)) setActiveTab(e.data.tab);
      };
    } catch {}
    return () => { try { bc?.close(); } catch {} };
  }, [currentUserId]);

  // storage event fallback (older browsers)
  useEffect(() => {
    if (!tabKey) return;
    const handler = (e) => { if (e.key === tabKey && VALID_TABS.includes(e.newValue)) setActiveTab(e.newValue); };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [tabKey]);

  // ─── Feature 5: Archive state ───────────────────────────────────────────
  const [archivedConversations, setArchivedConversations] = useState([]);
  const [pinnedConversations, setPinnedConversations] = useState(new Set()); // Feature 6: Set of pinned IDs


  // ============================================
  // REFS
  // ============================================
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ─── Feature 2: Per-tab unread badge counts ──────────────────────────────
  const tabUnreadCounts = useTabUnreadCounts(conversations);

  // ============================================
  // API CALLS
  // ============================================
  
  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    
    try {
      const data = await chatAPI.getAllChats();
      console.log("data:", data);

      const convos = Array.isArray(data?.conversations)
        ? data.conversations
        : Array.isArray(data?.data?.conversations)
          ? data.data.conversations
          : [];
      console.log(data);
      // ─── Feature 5: split active vs archived ─────────────────────────────
      setConversations(convos.filter((c) => !isArchivedFlag(c?.is_archived)));
      setArchivedConversations(convos.filter((c) => isArchivedFlag(c?.is_archived)));
      setPinnedConversations(new Set(convos.filter((c) => !!c?.is_pinned).map((c) => String(c.id))));

      // Seed last-seen from backend fields so it still shows after you leave/re-enter chat
      // (works even if you didn't witness the user go offline in this session)
      setLastSeenAt((prev) => {
        const next = { ...prev };
        for (const c of convos) {
          if (c?.conversation_type !== "direct") continue;
          const other = c.participants?.find((p) => {
            const participantId = String(resolveUserId(p) ?? "");
            return participantId && participantId !== currentUserId;
          });
          const otherId = resolveUserId(other);
          if (!otherId) continue;

          // Only seed from last_seen (real disconnect time), NOT last_login
          const ts =
            other.last_seen ??
            other.lastSeen ??
            null;

          const ms = toMs(ts);
          if (ms) next[String(otherId)] = ms;
        }
        return next;
      });

    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentUserId]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId) => {
    if (!token) return;
    
    try {
      const data = await chatAPI.getMessages(conversationId, 100, 0);
      const messagesPayload = Array.isArray(data?.messages)
        ? data.messages
        : Array.isArray(data?.data?.messages)
          ? data.data.messages
          : [];
      setMessages(messagesPayload.map(normalizeMessage));
      socket?.emit('mark_read', { conversation_id: conversationId });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, [token, socket]);

  // Sync with ChatDock events
useEffect(() => {
  const handleConversationDeleted = (e) => {
    const { conversationId } = e.detail || {};
    if (!conversationId) return;
    
    setConversations((prev) => prev.filter((c) => String(c.id) !== String(conversationId)));
    
    // If this was the active conversation, clear it
    if (activeConversation && String(activeConversation.id) === String(conversationId)) {
      setActiveConversation(null);
      setMessages([]);
    }
  };
  
  const handleConversationLeft = (e) => {
    const { conversationId } = e.detail || {};
    if (!conversationId) return;
    
    setConversations((prev) => prev.filter((c) => String(c.id) !== String(conversationId)));
    
    if (activeConversation && String(activeConversation.id) === String(conversationId)) {
      setActiveConversation(null);
      setMessages([]);
    }
  };
  
  const handleNewMessage = (e) => {
    const { conversationId, message } = e.detail || {};
    if (!conversationId || !message) return;
    
    // Update conversations list with new last_message
    setConversations((prev) => 
      prev.map((c) => {
        if (String(c.id) === String(conversationId)) {
          return { ...c, last_message: message, updated_at: new Date().toISOString() };
        }
        return c;
      })
    );
  };
  
  window.addEventListener("chat:conversationDeleted", handleConversationDeleted);
  window.addEventListener("chat:conversationLeft", handleConversationLeft);
  window.addEventListener("chat:newMessage", handleNewMessage);
  
  return () => {
    window.removeEventListener("chat:conversationDeleted", handleConversationDeleted);
    window.removeEventListener("chat:conversationLeft", handleConversationLeft);
    window.removeEventListener("chat:newMessage", handleNewMessage);
  };
}, [activeConversation]);

  // ============================================
  // FILE UPLOAD HANDLER
  // ============================================
  const handleFileUpload = useCallback(async (file, caption = '') => {
    if (!token || !file) return null;
    try {
      // REST upload - backend persists + broadcasts via socket (new_message)
      // No additional socket.emit needed after this call
      const response = await chatAPI.uploadFile(activeConversation?.id, file, caption || ' ');
      const data = response?.data || response;
      return data?.message?.file_url || data?.file_url || null;
    } catch (error) {
      console.error('File upload failed:', error);
      return null;
    }
  }, [token, activeConversation?.id]);

  // ─── Feature 5: Archive / Unarchive ─────────────────────────────────────
  const handleArchive = useCallback(async (conversationId) => {
    try {
      await chatAPI.archiveConversation(conversationId);
      setConversations(prev => {
        const conv = prev.find(c => String(c.id) === String(conversationId));
        if (conv) setArchivedConversations(a => [{ ...conv, is_archived: true }, ...a]);
        return prev.filter(c => String(c.id) !== String(conversationId));
      });
      if (activeConversation && String(activeConversation.id) === String(conversationId)) {
        setActiveConversation(null); setMessages([]);
      }
    } catch (e) { console.error('Archive failed:', e); }
  }, [activeConversation]);

  const handleUnarchive = useCallback(async (conversationId) => {
    try {
      await chatAPI.unarchiveConversation(conversationId);
      setArchivedConversations(prev => {
        const conv = prev.find(c => String(c.id) === String(conversationId));
        if (conv) setConversations(a => [{ ...conv, is_archived: false }, ...a]);
        return prev.filter(c => String(c.id) !== String(conversationId));
      });
    } catch (e) { console.error('Unarchive failed:', e); }
  }, []);

  // ─── Feature 6: Pin / Unpin ─────────────────────────────────────────────
  const handlePin = useCallback(async (conversationId) => {
    try {
      await chatAPI.pinConversation(conversationId);
      setPinnedConversations(prev => new Set([...prev, String(conversationId)]));
      setConversations(prev => prev.map(c =>
        String(c.id) === String(conversationId) ? { ...c, is_pinned: true } : c
      ));
    } catch (e) { console.error('Pin failed:', e); }
  }, []);

  const handleUnpin = useCallback(async (conversationId) => {
    try {
      await chatAPI.unpinConversation(conversationId);
      setPinnedConversations(prev => { const s = new Set(prev); s.delete(String(conversationId)); return s; });
      setConversations(prev => prev.map(c =>
        String(c.id) === String(conversationId) ? { ...c, is_pinned: false } : c
      ));
    } catch (e) { console.error('Unpin failed:', e); }
  }, []);

  // ============================================
  // EFFECTS
  // ============================================

  // Initial data load
  useEffect(() => {
    if (!token) return;
    fetchConversations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);


  // Open DM if URL has ?user=<id>
  useEffect(() => {
    if (activeConversation) return;

    const userId = searchParams.get("user");
    if (!userId) return;
    if (!friends?.length) return;

    const friend = friends.find((f) => String(resolveUserId(f) ?? "") === String(userId));
    if (!friend) return;

    handleOpenChatWithFriend(friend);
  }, [searchParams, friends]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Join active conversation room
    if (activeConversation) {
      socket.emit("join_conversation", { conversation_id: activeConversation.id });
    }

    const onNewMessage = (data) => {
      const cid = String(data.conversation_id);
      const isActive = String(activeConversation?.id) === cid;

      // ── Fix: skip own messages (avoids duplicate when socket echoes back) ──
      const senderId = String(data.message?.sender_id ?? '');
      const myId = currentUserId;
      const isOwn = senderId && myId && senderId === myId;

      if (isActive && !isOwn) {
        setMessages((prev) => [...prev, normalizeMessage(data.message)]);
        socket.emit("mark_read", { conversation_id: activeConversation.id });
      } else if (isActive && isOwn) {
        // FIX #1b: Replace the optimistic message with the real server message
        // (which has a proper ID, status, etc.). If no optimistic exists, add it
        // only if not already present (handles file-upload echo from backend).
        const realMsg = normalizeMessage(data.message);
        setMessages((prev) => {
          const hasOptimistic = prev.some((m) => String(m.id).startsWith('optimistic-'));
          const alreadyPresent = prev.some((m) => String(m.id) === String(realMsg.id));
          if (alreadyPresent) return prev; // already added, skip
          if (hasOptimistic) {
            // Swap the first optimistic with the real message
            let swapped = false;
            return prev.map((m) => {
              if (!swapped && String(m.id).startsWith('optimistic-')) {
                swapped = true;
                return realMsg;
              }
              return m;
            });
          }
          // No optimistic found (e.g. file-upload) — append real message
          return [...prev, realMsg];
        });
      }
      // ─── Feature 2: update unread_count in conversation list ─────────────
      setConversations(prev =>
        prev.map(c => String(c.id) === cid ? {
          ...c,
          last_message: data.message,
          updated_at: new Date().toISOString(),
          unread_count: isActive ? 0 : (Number(c.unread_count) || 0) + 1,
        } : c)
      );
      // ─── Feature 5: auto-unarchive if message arrives for archived chat ──
      setArchivedConversations(prev => {
        const conv = prev.find(c => String(c.id) === cid);
        if (conv) {
          setConversations(a => [{ ...conv, is_archived: false, unread_count: (Number(conv.unread_count) || 0) + 1 }, ...a]);
          return prev.filter(c => String(c.id) !== cid);
        }
        return prev;
      });
    };

    const onUserTyping = (data) => {
      if (String(data?.conversation_id) !== String(activeConversation?.id)) return;

      if (data?.is_typing) {
        setTypingUsers((prev) => {
          if (prev.some((u) => String(u.id) === String(data.user_id))) return prev;

          // Guard: activeConversation or participants may be missing for some DMs
          const participants = activeConversation?.participants || [];
          const user =
            participants.find((p) => String(resolveUserId(p) ?? "") === String(data.user_id)) ||
            { id: data.user_id, firstName: "", lastName: "" }; // fallback so UI won't crash

          return [...prev, user];
        });
      } else {
        setTypingUsers((prev) => prev.filter((u) => String(u.id) !== String(data.user_id)));
      }
    };


    socket.on("new_message", onNewMessage);
    socket.on("user_typing", onUserTyping);

    // Read receipt status updates
    const onMessageStatusUpdate = (data) => {
      // data = { message_id, conversation_id, status, read_at?, delivered_at? }
      const { message_id, conversation_id, status } = data || {};
      if (!message_id || String(conversation_id) !== String(activeConversation?.id)) return;

      setMessages((prev) =>
        prev.map((m) =>
          String(m.id) === String(message_id)
            ? {
                ...m,
                status,
                delivery_status: status,
                ...(status === "read" ? { read_at: data.read_at || new Date().toISOString() } : {}),
                ...(status === "delivered" ? { delivered_at: data.delivered_at || new Date().toISOString() } : {}),
              }
            : m
        )
      );
    };

    socket.on("message_status_update", onMessageStatusUpdate);
    // Some backends emit this event name instead
    socket.on("message_read", onMessageStatusUpdate);
    socket.on("message_delivered", onMessageStatusUpdate);

    // conversation_message fires for ALL conversations the user is part of (including hidden ones)
    // When a new message arrives for a conversation not in the list (was deleted/hidden),
    // the backend already unhides it — we just need to refetch so it reappears
    const onConversationMessage = (data) => {
      const cid = String(data?.conversation_id || data?.message?.conversation_id);
      const isCurrentConv = String(activeConversation?.id) === cid;

      if (!isCurrentConv) {
        // Always refetch to re-show any unhidden conversations
        fetchConversations();
      }
    };

    socket.on("conversation_message", onConversationMessage);

    // ─── Feature 6: real-time pin sync ───────────────────────────────────
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
      setActiveConversation((prev) =>
        prev && String(prev.id) === cid ? null : prev
      );
    };
    socket.on("conversation_removed", onConversationRemoved);

    return () => {
      if (activeConversation) {
        socket.emit("leave_conversation", { conversation_id: activeConversation.id });
      }
      socket.off("new_message", onNewMessage);
      socket.off("user_typing", onUserTyping);
      socket.off("message_status_update", onMessageStatusUpdate);
      socket.off("message_read", onMessageStatusUpdate);
      socket.off("message_delivered", onMessageStatusUpdate);
      socket.off("conversation_message", onConversationMessage);
      socket.off("conversation_pinned", onConvPinned);
      socket.off("conversation_added", onConversationAdded);
      socket.off("conversation_removed", onConversationRemoved);
    };
  }, [socket, activeConversation, fetchConversations, currentUserId]);

  // ============================================
  // PRESENCE TRACKING (IDLE SUPPORT)
  // ============================================
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
        // Backdate by 5min+1s so idle threshold (5min) triggers immediately
        const awayTs = now() - (5 * 60 * 1000 + 1000);
        setLastActiveAt((prev) => ({ ...prev, [id]: awayTs }));
      }

      if (data.status === "offline") {
        // Use backend-provided last_seen if available (more accurate than local clock)
        const ts = toMs(data?.last_seen) || now();
        setLastSeenAt((prev) => {
          const next = { ...prev, [id]: ts };
          // Write to shared localStorage key so ChatDock stays in sync
          writePresenceMap(LS_LAST_SEEN_KEY, next);
          return next;
        });
      }
    };

    const onUserActivity = (data) => {
      const id = String(data?.user_id ?? "");
      if (!id) return;
      setLastActiveAt((prev) => ({ ...prev, [id]: data?.ts || now() }));
    };

    socket.on("user_status", onUserStatus);
    socket.on("user_activity", onUserActivity);

    // 🔹 THROTTLED ACTIVITY PING (THIS IS THE PART YOU ASKED ABOUT)
    const ping = () => socket.emit("user_activity", { ts: now() });

    // Track keydown, click, scroll to reset Away timer
    window.addEventListener("keydown", ping);
    window.addEventListener("click", ping);
    window.addEventListener("scroll", ping, { passive: true });
    const interval = setInterval(ping, 20000); // heartbeat every 20s

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
    const t = setInterval(() => {
      setNowTs(Date.now());
    }, 30000); // every 30s

    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    writePresenceMap(LS_LAST_ACTIVE_KEY, lastActiveAt);
  }, [lastActiveAt]);

  useEffect(() => {
    writePresenceMap(LS_LAST_SEEN_KEY, lastSeenAt);
  }, [lastSeenAt]);


// --------------------------------------------
// Sync presence when localStorage changes
// (keeps ChatDock and ChatPage aligned)
// --------------------------------------------
useEffect(() => {
  const onStorage = (e) => {
    if (e.key === "presence:lastActiveAt") {
      try {
        setLastActiveAt(JSON.parse(e.newValue || "{}"));
      } catch {}
    }
    if (e.key === "presence:lastSeenAt") {
      try {
        setLastSeenAt(JSON.parse(e.newValue || "{}"));
      } catch {}
    }
  };

  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}, []);


  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // ============================================
  // HANDLERS
  // ============================================

  // Select a conversation
  const handleSelectConversation = (conversation) => {
    if (activeConversation?.id !== conversation.id) {
      // ─── Feature 3: save draft for the conversation we're leaving ────────
      if (activeConversation) {
        try {
          if (messageInput && messageInput.trim()) localStorage.setItem('chatPage:draft:' + String(activeConversation.id), messageInput);
          else localStorage.removeItem('chatPage:draft:' + String(activeConversation.id));
        } catch {}
      }
      // Leave previous room
      if (socket && activeConversation) {
        socket.emit('leave_conversation', { conversation_id: activeConversation.id });
      }
      
      setActiveConversation(conversation);
      setMessages([]);
      setTypingUsers([]);
      fetchMessages(conversation.id);

      // ─── Feature 3: restore draft for the conversation we're entering ────
      let restoredDraft = '';
      try { restoredDraft = localStorage.getItem('chatPage:draft:' + String(conversation.id)) || ''; } catch {}
      setMessageInput(restoredDraft);

      // ─── Feature 2: clear unread count for this conversation ─────────────
      socket?.emit('mark_read', { conversation_id: conversation.id });
      setConversations(prev => prev.map(c => String(c.id) === String(conversation.id) ? { ...c, unread_count: 0 } : c));
    }
  };

  // Open chat with a friend (from sidebar)
  const handleOpenChatWithFriend = async (friend) => {
    console.log('handleOpenChatWithFriend called with friend:', friend);
    const friendId = resolveUserId(friend);
    if (!friendId) return;
    
    // Check if conversation already exists
    const existing = conversations.find(c => {
      console.log('Checking conversation:', c);
      const isDirectType = c.conversation_type === 'direct';
      console.log('  - Is direct type:', isDirectType);
      const hasParticipant = c.participants?.some(p => {
        const participantId = resolveUserId(p);
        const matches = String(participantId ?? "") === String(friendId);
        console.log(`    - Participant ${participantId} matches friend ${friendId}:`, matches);
        return matches;
      });
      console.log('  - Has friend participant:', hasParticipant);
      return isDirectType && hasParticipant;
    });
    
    console.log('Existing conversation found:', existing);
    
    if (existing) {
      console.log('Using existing conversation, selecting it...');
      handleSelectConversation(existing);
    } else {
      console.log('No existing conversation, creating new one...');
      // Create new conversation
      try {
        console.log('Creating direct conversation for friend ID:', friendId);
        const data = await chatAPI.createDirectConversation(friendId);
        console.log('API response:', data);
        console.log('Response data:', data);
        
        console.log('Conversation created successfully');
          
        console.log('Fetching updated conversations...');
        await fetchConversations();
          
        const createdId = data?.conversation?.id;
        console.log('Created conversation ID:', createdId);
        console.log('Current conversations:', conversations);
          
        const updated = (conversations || []).find((c) => {
          console.log(`  - Checking conversation ${c.id} against created ID ${createdId}`);
          return String(c.id) === String(createdId);
        });
          
        console.log('Found updated conversation:', updated);
        const convoToSelect = updated || data.conversation;
        console.log('Selecting conversation:', convoToSelect);
          
        handleSelectConversation(convoToSelect);

      } catch (error) {
        console.error('Failed to create conversation:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data,
        });
      }
    }
  };

  // Create a group conversation
  const handleCreateGroup = async (userIds, name) => {
    try {
      const data = await chatAPI.createGroupConversation(name, userIds);
      if (data?.success === false) {
        return {
          success: false,
          message: data?.error || data?.message || 'Failed to create group chat.',
        };
      }

      await fetchConversations();              
      handleSelectConversation(data.conversation);

      return { success: true, data };
    } catch (error) {
      console.error('Failed to create group:', error);
      return { success: false, message: error?.error || error?.message || 'Failed to create group chat.' };
    }
  };

  // Handle input change (with typing indicator)
  const handleInputChange = (value) => {
    setMessageInput(value);

    // ─── Feature 3: persist draft to localStorage ─────────────────────────
    if (activeConversation) {
      try {
        if (value && value.trim()) localStorage.setItem('chatPage:draft:' + String(activeConversation.id), value);
        else localStorage.removeItem('chatPage:draft:' + String(activeConversation.id));
      } catch {}
    }
    
    if (socket && activeConversation) {
      socket.emit('typing_start', { conversation_id: activeConversation.id });
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { conversation_id: activeConversation.id });
      }, 2000);
    }
  };

  // Send a message - FIX #1: Optimistic update so message appears instantly
  const handleSendMessage = async (content) => {
    if (!content || !activeConversation) return;

    // Build an optimistic message shown immediately, before socket echo
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMsg = normalizeMessage({
      id: optimisticId,
      content,
      sender_id: currentUserId,
      sender: {
        id: currentUserId,
        firstName: currentUser?.first_name || currentUser?.firstName || '',
        lastName: currentUser?.last_name || currentUser?.lastName || '',
        profilePicture: currentUser?.profile_picture || currentUser?.profilePicture || null,
      },
      created_at: new Date().toISOString(),
      conversation_id: activeConversation.id,
      status: 'sending',
    });

    // Show it immediately
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // Persist first through REST so the message survives refresh.
      const response = await chatAPI.sendMessage(activeConversation.id, content);
      const serverMessage = response?.data?.message || response?.message || null;

      if (serverMessage) {
        const normalizedServerMessage = normalizeMessage(serverMessage);
        setMessages((prev) => {
          let replaced = false;
          const next = prev.map((m) => {
            if (!replaced && String(m.id) === String(optimisticId)) {
              replaced = true;
              return normalizedServerMessage;
            }
            return m;
          });
          return replaced ? next : [...next, normalizedServerMessage];
        });

        // Trigger server-side real-time fanout to user rooms without re-persisting.
        if (socket && serverMessage?.id) {
          socket.emit('send_message', {
            conversation_id: activeConversation.id,
            skip_persist: true,
            persisted_message_id: serverMessage.id,
          });
        }
      }

      if (socket) {
        socket.emit('typing_stop', { conversation_id: activeConversation.id });
      }
    } catch (error) {
      // Roll back optimistic message when persistence fails.
      setMessages((prev) => prev.filter((m) => String(m.id) !== String(optimisticId)));
      console.error('Failed to persist message:', error);
    }
    
    setMessageInput('');
    // ─── Feature 3: clear draft on send ──────────────────────────────────
    try { localStorage.removeItem('chatPage:draft:' + String(activeConversation.id)); } catch {}
  };

  const shouldShowAvatar = (message, index) => {
  if (index === 0) return true;

  const prevMessage = messages[index - 1];


  if (shouldShowDateSeparator(message, prevMessage)) return true;


  return String(prevMessage?.sender_id) !== String(message?.sender_id);
};



  function shouldShowSenderName(messages, index) {
    if (index === 0) return true;

    const prev = messages[index - 1];
    const curr = messages[index];

    const prevId = String(prev?.sender_id ?? prev?.sender?.id ?? "");
    const currId = String(curr?.sender_id ?? curr?.sender?.id ?? "");

    return prevId !== currId;
  }


  // Filter conversations by search and tab
  const filteredConversations = useMemo(() => {
    // ─── Feature 5: use archived list when on archived tab ───────────────
    const source = activeTab === 'archived' ? archivedConversations : conversations;
    return source.filter(c => {
      // Filter by search
      if (searchTerm) {
        const name = c.name || c.participants?.find((p) => String(resolveUserId(p) ?? "") !== currentUserId)?.firstName || '';
        if (!name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      }
      
      // Filter by tab
      if (activeTab === 'all' || activeTab === 'archived') return true;
      if (activeTab === 'friends') return c.conversation_type === 'direct';
      if (activeTab === 'groups') return c.conversation_type === 'group';
      if (activeTab === 'startups') return c.conversation_type === 'team' || c.conversation_type === 'startup';
      if (activeTab === 'general') return c.conversation_type === 'general';
      
      return true;
    }).sort(
      (a, b) => {
        // Feature 6: pinned chats float to top; within pinned, most recent first
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        const aLast = toMs(a.last_message_at || a.updated_at || a.created_at) || 0;
        const bLast = toMs(b.last_message_at || b.updated_at || b.created_at) || 0;
        return bLast - aLast;
      }
    );
  }, [conversations, archivedConversations, searchTerm, activeTab, currentUserId, pinnedConversations]);

  

  
  // ============================================
  // PRESENCE (ONLINE / IDLE / LAST SEEN)
  // Rules you requested:
  // - online: < 5 mins inactivity
  // - idle:  5:00 to 5:59 mins inactivity (still connected)
  // - last seen: 6+ mins inactivity OR disconnected
  // ============================================
  const otherParticipant =
    activeConversation?.conversation_type === "direct"
      ? activeConversation?.participants?.find((p) => {
          const participantId = String(resolveUserId(p) ?? "");
          return participantId && participantId !== currentUserId;
        })
      : null;

  const otherId = resolveUserId(otherParticipant)
    ? String(resolveUserId(otherParticipant))
    : null;
  const buildProfileUrl = (userId) =>
  userId ? `/user-profile?userId=${userId}` : "/user-profile";
  


  const handleOpenProfile = useCallback(() => {
    if (!otherId) return;
    navigate(buildProfileUrl(otherId));
  }, [navigate, otherId]);

  const connected = otherId
    ? (onlineUsers || []).map(String).includes(otherId)
    : false;

  const lastActiveTs = otherId ? toMs(lastActiveAt?.[otherId]) : null;
  // lastSeenTs: ONLY trust the real-time socket event value (lastSeenAt map).
  // DB fields (last_seen/last_login) are stale login times, not disconnect times.
  // Exception: on first page load before any socket event, seed from DB as fallback.
  const lastSeenTs = otherId
    ? toMs(lastSeenAt?.[otherId]) ??
      // Seed fallback - only used until first socket offline event arrives
      toMs(otherParticipant?.last_seen ?? otherParticipant?.lastSeen)
    : null;

  const diffMs = (ts) => (ts ? Math.max(0, nowTs - ts) : null);

  // ============================================================
  // PRESENCE LOGIC (WhatsApp / Firebase model):
  //   connected + active < 5min  => "online"   => "Online"
  //   connected + inactive 5min+ => "idle"     => "Away"
  //   disconnected               => "offline"  => "Last seen X" or "Offline"
  // NEVER show "last seen" while the socket says user is connected.
  // ============================================================
  let presenceStatus = "offline";
  let statusText = "Offline";

  if (activeConversation?.conversation_type === "direct" && otherId) {
    if (connected) {
      // User is connected right now - show online or away only
      const d = diffMs(lastActiveTs);
      if (d == null || d < 5 * 60 * 1000) {
        presenceStatus = "online";
        statusText = "Online";
      } else {
        presenceStatus = "idle";
        statusText = "Away";
      }
    } else {
      // User is offline - show last seen from disconnect timestamp
      presenceStatus = "offline";
      const seenTs = lastSeenTs || lastActiveTs;
      statusText = seenTs ? formatLastSeen(seenTs, nowTs) : "Offline";
    }
  }

  const isOnline = presenceStatus === "online";

  // Typing overrides status text in header
  const typingNames = (typingUsers || [])
    .filter((u) => String(resolveUserId(u) ?? "") !== currentUserId)
    .map((u) => u.firstName || u.first_name || "Someone");
  const typingStatusText = typingNames.length
    ? `${typingNames[0]} is typing...`
    : null;
  const headerStatusText = typingStatusText || statusText;
  const headerPresenceStatus = typingStatusText ? "typing" : presenceStatus;

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
// ============================================
  // RENDER: Not logged in
  // ============================================
  if (!token || !currentUser) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to access chat</h2>
          <a href="/login" className="text-indigo-500 hover:text-indigo-400">Go to Login</a>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: Main chat page
  // ============================================
  return (
    <MobileChatPage 
      conversations={conversations}
      activeConversation={activeConversation}
      setActiveConversation={setActiveConversation}
      messages={messages}
      isLoading={isLoading}
      typingUsers={typingUsers}
      onlineUsers={onlineUsers}
      currentUserId={currentUserId}
      activeTab={activeTab}
      handleSetActiveTab={handleSetActiveTab}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      handleSendMessage={handleSendMessage}
      handleFileUpload={handleFileUpload}
      handleInputChange={handleInputChange}
      messageInput={messageInput}
      socket={socket}
      archivedConversations={archivedConversations}
      handleArchive={handleArchive}
      handleUnarchive={handleUnarchive}
      handlePin={handlePin}
      handleUnpin={handleUnpin}
      lastActiveAt={lastActiveAt}
      lastSeenAt={lastSeenAt}
      nowTs={nowTs}
      headerStatusText={headerStatusText}
      headerPresenceStatus={headerPresenceStatus}
      handleOpenProfile={handleOpenProfile}
      setShowNewMessage={setShowNewMessage}
      filteredConversations={filteredConversations}
      shouldShowAvatar={shouldShowAvatar}
      shouldShowSenderName={shouldShowSenderName}
      otherParticipant={otherParticipant}
    />
  );
};

export default MobileChatPageSwitcher;
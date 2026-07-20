/* eslint-disable no-unused-vars, no-empty, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, Edit3, MessageCircle, Menu, Archive, ChevronRight, ChevronDown, Megaphone, X, Send, SmilePlus, CornerUpLeft, Star, Pin, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import chat components
import Avatar from '@/components/chat/Avatar';
import TypingIndicator from '@/components/chat/TypingIndicator';
import MessageBubble from '@/components/chat/MessageBubble';
import ConversationItem from '@/components/chat/ConversationItem';
import OnlineContactsSidebar from '@/components/chat/OnlineContactsSidebar';
import NewMessageModal from '@/components/chat/NewMessageModal';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatInput from '@/components/chat/ChatInput';
import DateSeparator, { shouldShowDateSeparator } from '@/components/chat/DateSeparator';
import { ConversationsCardSkeleton, MessagesSkeleton } from '@/components/chat/Skeletons';
import { useAppSocket } from "@/context/SocketProvider";
import { useChatContacts } from "@/context/ChatContactsProvider";
import { useSelector } from 'react-redux';
import { getProfilePicture } from '@/utils/getProfilePicture';
import { chatAPI } from '@/utils/APIs/chatApi';
import { resolveUserId } from '@/utils/resolveUserId';
import { useIsMobile } from "@/utils/hooks/use-mobile";

// Helper presence keys
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
  } catch {}
}

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

  const status = m.status || m.delivery_status || m.deliveryStatus || null;
  const read_at = m.read_at || m.readAt || null;
  const delivered_at = m.delivered_at || m.deliveredAt || null;

  return {
    ...m,
    created_at: created,
    sender,
    sender_id: m.sender_id || sender?.id,
    content: m.content ?? m.original_content ?? m.message ?? "",
    status: status,
    delivery_status: status,
    read_at: read_at,
    delivered_at: delivered_at,
  };
}

const TYPE_TO_TAB = {
  direct: 'friends',
  group: 'groups',
  team: 'startups',
  startup: 'startups',
  general: 'general',
};

const BaseChatLayout = ({
  category,
  conversations,
  setConversations,
  isLoading,
  onBroadcast,
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser, access_token: token } = useSelector((state) => state.auth);
  const { socket, isConnected, onlineUsers } = useAppSocket();
  const { friends } = useChatContacts();

  // Active Category State
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  
  // Presence Maps
  const [lastActiveAt, setLastActiveAt] = useState(() => readPresenceMap(LS_LAST_ACTIVE_KEY));
  const [lastSeenAt, setLastSeenAt] = useState(() => readPresenceMap(LS_LAST_SEEN_KEY));
  const [nowTs, setNowTs] = useState(Date.now());

  // Input, Edit, Reply, Select, and Modals
  const [messageInput, setMessageInput] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
  const [showContactsSidebar, setShowContactsSidebar] = useState(false);
  
  // Multi-select state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState(new Set());

  // Broadcast Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Background state for unread badge counts across all tabs
  const [allConversationsForBadges, setAllConversationsForBadges] = useState([]);

  // Pinned States
  const [pinnedConversations, setPinnedConversations] = useState(new Set());

  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastRequestedConversationIdRef = useRef(null);

  const currentUserId = useMemo(() => String(resolveUserId(currentUser) ?? ""), [currentUser]);

  // Keep nowTs ticking
  useEffect(() => {
    const timer = setInterval(() => setNowTs(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  // Sync presence maps to localStorage
  useEffect(() => {
    writePresenceMap(LS_LAST_ACTIVE_KEY, lastActiveAt);
  }, [lastActiveAt]);

  useEffect(() => {
    writePresenceMap(LS_LAST_SEEN_KEY, lastSeenAt);
  }, [lastSeenAt]);

  // Fetch all conversations for category tab unread count badges
  useEffect(() => {
    if (!token) return;
    const fetchAllForBadges = async () => {
      try {
        const data = await chatAPI.getAllChats();
        const convos = Array.isArray(data?.conversations)
          ? data.conversations
          : Array.isArray(data?.data?.conversations)
            ? data.data.conversations
            : [];
        setAllConversationsForBadges(convos);
      } catch (err) {
        console.error("Failed to load badges:", err);
      }
    };
    fetchAllForBadges();
  }, [token]);

  // Derive tab unread counts
  const tabUnreadCounts = useMemo(() => {
    const counts = { all: 0, friends: 0, groups: 0, startups: 0, general: 0 };
    for (const c of allConversationsForBadges) {
      if (c.is_archived) continue;
      const unread = Number(c.unread_count) || 0;
      if (unread <= 0) continue;
      counts.all += unread;
      const tab = TYPE_TO_TAB[c.conversation_type];
      if (tab) counts[tab] += unread;
    }
    return counts;
  }, [allConversationsForBadges]);

  // Fetch messages when active conversation changes
  const fetchMessages = useCallback(async (conversationId) => {
    if (!token) return;
    setMessagesLoading(true);
    try {
      const data = await chatAPI.getMessages(conversationId, 100, 0);
      
      // Guard against stale asynchronous responses
      if (lastRequestedConversationIdRef.current !== conversationId) {
        return;
      }

      const messagesPayload = Array.isArray(data?.messages)
        ? data.messages
        : Array.isArray(data?.data?.messages)
          ? data.data.messages
          : [];
      setMessages(messagesPayload.map(normalizeMessage));
      socket?.emit('mark_read', { conversation_id: conversationId });
      setConversations((prev) =>
        prev.map((c) => (String(c.id) === String(conversationId) ? { ...c, unread_count: 0 } : c))
      );
      setAllConversationsForBadges((prev) =>
        prev.map((c) => (String(c.id) === String(conversationId) ? { ...c, unread_count: 0 } : c))
      );
    } catch (error) {
      if (lastRequestedConversationIdRef.current === conversationId) {
        console.error('Failed to fetch messages:', error);
      }
    } finally {
      if (lastRequestedConversationIdRef.current === conversationId) {
        setMessagesLoading(false);
      }
    }
  }, [token, socket]);

  useEffect(() => {
    if (activeConversation?.id) {
      lastRequestedConversationIdRef.current = activeConversation.id;
      fetchMessages(activeConversation.id);
      // Clean up inputs
      setMessageInput('');
      setEditingMessage(null);
      setReplyingTo(null);
      setIsSelectMode(false);
      setSelectedMessageIds(new Set());
    } else {
      lastRequestedConversationIdRef.current = null;
      setMessages([]);
    }
  }, [activeConversation?.id, fetchMessages]);

  const activeConversationRef = useRef(activeConversation);
  activeConversationRef.current = activeConversation;

  const currentUserIdRef = useRef(currentUserId);
  currentUserIdRef.current = currentUserId;

  // Setup Real-time Socket Event Listeners
  useEffect(() => {
    if (!socket || !token) return;

    const onNewMessage = (data) => {
      if (!data?.message) return;
      const msg = normalizeMessage(data.message);
      const activeConvo = activeConversationRef.current;
      const uid = currentUserIdRef.current;

      // If for the active conversation, append to current messages list
      if (activeConvo && String(msg.conversation_id) === String(activeConvo.id)) {
        setMessages((prev) => {
          if (prev.some((m) => String(m.id) === String(msg.id))) return prev;
          
          // Deduplicate if sent by current user: check if we have a matching optimistic message
          if (String(msg.sender_id) === String(uid)) {
            const optIndex = prev.findIndex(
              (m) =>
                String(m.id).startsWith("optimistic-") &&
                m.content === msg.content &&
                String(m.conversation_id) === String(msg.conversation_id)
            );
            if (optIndex !== -1) {
              const next = [...prev];
              next[optIndex] = msg;
              return next;
            }
          }
          
          return [...prev, msg];
        });
        socket.emit('mark_read', { conversation_id: activeConvo.id });
      }

      // Update conversations list (last message)
      setConversations((prev) =>
        prev.map((c) => {
          if (String(c.id) === String(msg.conversation_id)) {
            return {
              ...c,
              last_message: msg,
              last_message_at: msg.created_at,
              unread_count:
                activeConvo && String(activeConvo.id) === String(c.id)
                  ? 0
                  : (Number(c.unread_count) || 0) + 1,
            };
          }
          return c;
        })
      );

      // Sync the badges list too!
      setAllConversationsForBadges((prev) => {
        const exists = prev.some((c) => String(c.id) === String(msg.conversation_id));
        if (exists) {
          return prev.map((c) => {
            if (String(c.id) === String(msg.conversation_id)) {
              return {
                ...c,
                last_message: msg,
                last_message_at: msg.created_at,
                unread_count:
                  activeConvo && String(activeConvo.id) === String(c.id)
                    ? 0
                    : (Number(c.unread_count) || 0) + 1,
              };
            }
            return c;
          });
        }
        // One-off refresh for completely new conversations (e.g. first DM message)
        const refetch = async () => {
          try {
            const data = await chatAPI.getAllChats();
            const convos = Array.isArray(data?.conversations)
              ? data.conversations
              : Array.isArray(data?.data?.conversations)
                ? data.data.conversations
                : [];
            setAllConversationsForBadges(convos);
          } catch (err) {
            console.error("Failed to refetch badges on new convo:", err);
          }
        };
        refetch();
        return prev;
      });
    };

    const onUserTyping = (data) => {
      const activeConvo = activeConversationRef.current;
      if (!activeConvo || String(data?.conversation_id) !== String(activeConvo.id)) return;
      const userId = String(data?.user_id ?? "");
      if (!userId || userId === currentUserIdRef.current) return;

      if (data.status === "typing") {
        setTypingUsers((prev) => {
          if (prev.some((u) => String(resolveUserId(u)) === userId)) return prev;
          const participantObj = (activeConvo.participants || [])?.find(
            (p) => String(resolveUserId(p)) === userId
          );
          return [...prev, participantObj || { id: userId, firstName: "Someone" }];
        });
      } else {
        setTypingUsers((prev) => prev.filter((u) => String(resolveUserId(u)) !== userId));
      }
    };

    const onMessageStatusUpdate = (data) => {
      const activeConvo = activeConversationRef.current;
      if (!activeConvo || String(data?.conversation_id) !== String(activeConvo.id)) return;
      setMessages((prev) =>
        prev.map((m) => {
          if (String(m.id) === String(data.message_id)) {
            const updated = { ...m };
            if (data.status !== undefined) {
              updated.status = data.status;
            }
            if (data.is_deleted) {
              updated.is_deleted = true;
              updated.content = "This message was deleted";
              updated.file_url = null;
              updated.file_name = null;
              updated.file_type = null;
              updated.message_type = 'text';
            }
            if (data.is_edited) {
              updated.is_edited = true;
              updated.content = data.content;
            }
            if (data.reactions) {
              updated.reactions = data.reactions;
            }
            return updated;
          }
          return m;
        })
      );
    };

    socket.on("new_message", onNewMessage);
    socket.on("user_typing", onUserTyping);
    socket.on("message_status_update", onMessageStatusUpdate);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("user_typing", onUserTyping);
      socket.off("message_status_update", onMessageStatusUpdate);
    };
  }, [socket, token]);

  // Send Message Logic
  const handleSendMessage = useCallback(async (content) => {
    if (!content || !activeConversation) return;

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
      reply_to_id: replyingTo?.id || null,
      reply_to: replyingTo ? {
        id: replyingTo.id,
        content: replyingTo.content || replyingTo.original_content || 'Attachment',
        sender_name: replyingTo.sender?.firstName || replyingTo.sender_name || 'Message',
        sender: replyingTo.sender
      } : null,
    });

    const currentReplyId = replyingTo?.id || null;
    setReplyingTo(null);

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const response = await chatAPI.sendMessage(activeConversation.id, content, currentReplyId);
      const serverMessage = response?.data?.message || response?.message || null;

      if (serverMessage) {
        const normalizedServerMessage = normalizeMessage(serverMessage);
        
        // Guard against cross-talk: only update messages state if it still matches the active conversation
        if (activeConversation && String(normalizedServerMessage.conversation_id) === String(activeConversation.id)) {
          setMessages((prev) => {
            if (prev.some((m) => String(m.id) === String(normalizedServerMessage.id))) {
              return prev.filter((m) => String(m.id) !== String(optimisticId));
            }
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
        }

        if (socket && serverMessage?.id) {
          socket.emit('send_message', {
            conversation_id: activeConversation.id,
            skip_persist: true,
            persisted_message_id: serverMessage.id,
          });
        }
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) => (String(m.id) === String(optimisticId) ? { ...m, status: 'error' } : m))
      );
      console.error('Failed to persist message:', error);
    }

    setMessageInput('');
  }, [activeConversation, replyingTo, currentUserId, currentUser, socket]);

  // File upload handler
  const handleFileUpload = useCallback(async (file, caption = '') => {
    if (!token || !file || !activeConversation) return null;
    
    const optimisticId = `optimistic-${Date.now()}`;
    const localUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    
    const optimisticMsg = normalizeMessage({
      id: optimisticId,
      content: caption || `[file: ${file.name}]`,
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
      file_name: file.name,
      file_type: file.type,
      file_url: localUrl,
      _rawFile: file,
    });

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const response = await chatAPI.sendFileMessage(activeConversation.id, file, caption, file.type);
      const serverMessage = response?.data?.message || response?.message || null;
      if (serverMessage) {
        const norm = normalizeMessage(serverMessage);
        
        // Guard against cross-talk: only update messages state if it still matches the active conversation
        if (activeConversation && String(norm.conversation_id) === String(activeConversation.id)) {
          setMessages((prev) => {
            if (prev.some((m) => String(m.id) === String(norm.id))) {
              return prev.filter((m) => String(m.id) !== String(optimisticId));
            }
            let replaced = false;
            const next = prev.map((m) => {
              if (!replaced && String(m.id) === String(optimisticId)) {
                replaced = true;
                return norm;
              }
              return m;
            });
            return replaced ? next : [...next, norm];
          });
        }
        if (socket && serverMessage.id) {
          socket.emit('send_message', {
            conversation_id: activeConversation.id,
            skip_persist: true,
            persisted_message_id: serverMessage.id,
          });
        }
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) => (String(m.id) === String(optimisticId) ? { ...m, status: 'error' } : m))
      );
      console.error('File upload failed:', error);
    }
  }, [token, activeConversation, socket, currentUserId, currentUser]);

  // Edit Submit Logic
  const handleEditSubmit = useCallback(async (content, message) => {
    if (!content.trim() || !activeConversation) return;

    const updatedMessage = {
      ...message,
      original_content: content.trim(),
      content: content.trim(),
      is_edited: true,
    };

    setMessages((prev) =>
      prev.map((m) => (String(m.id) === String(message.id) ? updatedMessage : m))
    );
    setEditingMessage(null);
    setMessageInput('');

    try {
      await chatAPI.editMessage(activeConversation.id, message.id, content.trim());
    } catch (error) {
      console.error("Edit failed:", error);
    }
  }, [activeConversation]);

  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
    setMessageInput('');
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleDeleteFailedMessage = useCallback((optimisticId) => {
    setMessages((prev) => prev.filter((m) => String(m.id) !== String(optimisticId)));
  }, []);

  const handleRetrySendMessage = useCallback(async (failedMessage) => {
    const optimisticId = failedMessage.id;
    
    // Set status back to 'sending'
    setMessages((prev) =>
      prev.map((m) => (String(m.id) === String(optimisticId) ? { ...m, status: 'sending' } : m))
    );

    const isAttachment = !!failedMessage._rawFile;

    try {
      let response;
      if (isAttachment) {
        // Retry attachment upload
        const caption = failedMessage.content !== `[file: ${failedMessage.file_name}]` ? failedMessage.content : '';
        response = await chatAPI.sendFileMessage(
          failedMessage.conversation_id,
          failedMessage._rawFile,
          caption,
          failedMessage.file_type
        );
      } else {
        // Retry text message
        response = await chatAPI.sendMessage(
          failedMessage.conversation_id,
          failedMessage.content,
          failedMessage.reply_to_id
        );
      }

      const serverMessage = response?.data?.message || response?.message || null;
      if (serverMessage) {
        const norm = normalizeMessage(serverMessage);
        
        // Guard against cross-talk: only update messages state if it still matches the active conversation
        if (activeConversation && String(norm.conversation_id) === String(activeConversation.id)) {
          setMessages((prev) => {
            if (prev.some((m) => String(m.id) === String(norm.id))) {
              return prev.filter((m) => String(m.id) !== String(optimisticId));
            }
            let replaced = false;
            const next = prev.map((m) => {
              if (!replaced && String(m.id) === String(optimisticId)) {
                replaced = true;
                return norm;
              }
              return m;
            });
            return replaced ? next : [...next, norm];
          });
        }

        if (socket && serverMessage.id) {
          socket.emit('send_message', {
            conversation_id: failedMessage.conversation_id,
            skip_persist: true,
            persisted_message_id: serverMessage.id,
          });
        }
      }
    } catch (error) {
      console.error('Failed to retry message:', error);
      // Mark it back as error
      setMessages((prev) =>
        prev.map((m) => (String(m.id) === String(optimisticId) ? { ...m, status: 'error' } : m))
      );
    }
  }, [activeConversation, socket]);

  const handleEditRequest = useCallback((message) => {
    setEditingMessage(message);
    setMessageInput(message.content || message.original_content || "");
  }, []);

  // Multi-select handlers
  const handleStartSelectMode = useCallback(() => {
    setIsSelectMode(true);
    setSelectedMessageIds(new Set());
  }, []);

  const handleToggleSelect = useCallback((id) => {
    setSelectedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCancelSelectMode = useCallback(() => {
    setIsSelectMode(false);
    setSelectedMessageIds(new Set());
  }, []);

  const handleBulkStar = useCallback(async () => {
    const ids = Array.from(selectedMessageIds);
    try {
      await Promise.all(ids.map(id => chatAPI.starMessage(activeConversation.id, id)));
      setMessages(prev => prev.map(m => ids.includes(m.id) ? { ...m, is_starred: true } : m));
    } catch (err) {
      console.error("Bulk star failed:", err);
    }
    handleCancelSelectMode();
  }, [selectedMessageIds, activeConversation, handleCancelSelectMode]);

  const handleBulkPin = useCallback(async () => {
    const ids = Array.from(selectedMessageIds);
    try {
      await Promise.all(ids.map(id => chatAPI.pinMessage(activeConversation.id, id)));
      setMessages(prev => prev.map(m => ids.includes(m.id) ? { ...m, is_pinned: true } : m));
    } catch (err) {
      console.error("Bulk pin failed:", err);
    }
    handleCancelSelectMode();
  }, [selectedMessageIds, activeConversation, handleCancelSelectMode]);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedMessageIds);
    try {
      await Promise.all(ids.map(id => chatAPI.deleteMessage(activeConversation.id, id, 'me')));
      setMessages(prev => prev.filter(m => !ids.includes(m.id)));
    } catch (err) {
      console.error("Bulk delete failed:", err);
    }
    handleCancelSelectMode();
  }, [selectedMessageIds, activeConversation, handleCancelSelectMode]);

  // Typing Overs status text
  const otherParticipant = useMemo(() => {
    return activeConversation?.conversation_type === "direct"
      ? (activeConversation.participants || [])?.find((p) => String(resolveUserId(p)) !== currentUserId)
      : null;
  }, [activeConversation, currentUserId]);

  const otherId = otherParticipant ? String(resolveUserId(otherParticipant)) : null;
  
  const presenceStatus = useMemo(() => {
    if (!otherId) return 'offline';
    const connected = (onlineUsers || []).map(String).includes(otherId);
    if (!connected) return 'offline';
    
    const lastActiveTs = toMs(lastActiveAt?.[otherId]);
    const d = lastActiveTs ? Math.max(0, nowTs - lastActiveTs) : null;
    return (d == null || d < 5 * 60 * 1000) ? 'online' : 'idle';
  }, [otherId, onlineUsers, lastActiveAt, nowTs]);

  const statusText = useMemo(() => {
    if (!otherId) return 'Offline';
    if (presenceStatus === 'online') return 'Online';
    if (presenceStatus === 'idle') return 'Away';
    
    const seenTs = toMs(lastSeenAt?.[otherId]) || toMs(lastActiveAt?.[otherId]) || toMs(otherParticipant?.last_seen);
    return seenTs ? formatLastSeen(seenTs, nowTs) : 'Offline';
  }, [otherId, presenceStatus, lastSeenAt, lastActiveAt, otherParticipant, nowTs]);

  const typingNames = (typingUsers || [])
    .filter((u) => String(resolveUserId(u) ?? "") !== currentUserId)
    .map((u) => u.firstName || u.first_name || "Someone");
  
  const headerStatusText = typingNames.length ? `${typingNames[0]} is typing...` : statusText;
  const headerPresenceStatus = typingNames.length ? "typing" : presenceStatus;

  // Search and Filter logic inside category
  const filteredConversations = useMemo(() => {
    return conversations
      .filter((c) => {
        if (searchTerm) {
          const name = c.name || (c.participants || [])?.find((p) => String(resolveUserId(p) ?? "") !== currentUserId)?.firstName || '';
          if (!name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        const aLast = toMs(a.last_message_at || a.updated_at || a.created_at) || 0;
        const bLast = toMs(b.last_message_at || b.updated_at || b.created_at) || 0;
        return bLast - aLast;
      });
  }, [conversations, searchTerm, currentUserId]);

  const pinnedConversationsList = useMemo(() => filteredConversations.filter(c => c.is_pinned), [filteredConversations]);
  const recentConversationsList = useMemo(() => filteredConversations.filter(c => !c.is_pinned), [filteredConversations]);

  // Open Chat with a friend or group (from OnlineContactsSidebar or NewMessageModal)
  const handleOpenChatWithFriend = useCallback(async (friendOrGroup) => {
    if (!friendOrGroup) return;
    
    // If a group was passed from the search fallback
    if (friendOrGroup.conversation_type && friendOrGroup.conversation_type !== 'direct') {
      setActiveConversation(friendOrGroup);
      if (window.innerWidth < 768) setSidebarOpen(false);
      return;
    }

    const friendId = resolveUserId(friendOrGroup);
    if (!friendId) return;

    if (category !== 'friends' && category !== 'all') {
      navigate(`/chat/friends?user=${friendId}`);
      return;
    }

    const existing = conversations.find(c => {
      const isDirectType = c.conversation_type === 'direct';
      const hasParticipant = (c.participants || [])?.some(p => {
        const participantId = resolveUserId(p);
        return String(participantId ?? "") === String(friendId);
      });
      return isDirectType && hasParticipant;
    });

    if (existing) {
      setActiveConversation(existing);
      if (window.innerWidth < 768) setSidebarOpen(false);
    } else {
      try {
        const data = await chatAPI.createDirectConversation(friendId);
        if (data?.conversation) {
          setConversations(prev => {
            if (prev.some(c => String(c.id) === String(data.conversation.id))) return prev;
            return [data.conversation, ...prev];
          });
          setAllConversationsForBadges(prev => {
            if (prev.some(c => String(c.id) === String(data.conversation.id))) return prev;
            return [data.conversation, ...prev];
          });
          setActiveConversation(data.conversation);
          if (window.innerWidth < 768) setSidebarOpen(false);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [category, conversations, navigate, setConversations]);

  // Create group chat (from NewMessageModal)
  const handleCreateGroup = useCallback(async (userIds, name) => {
    try {
      const data = await chatAPI.createGroupConversation(name, userIds);
      if (data?.success === false) {
        return {
          success: false,
          message: data?.error || data?.message || 'Failed to create group chat.',
        };
      }
      if (data?.conversation) {
        setConversations(prev => {
          if (prev.some(c => String(c.id) === String(data.conversation.id))) return prev;
          return [data.conversation, ...prev];
        });
        setAllConversationsForBadges(prev => {
          if (prev.some(c => String(c.id) === String(data.conversation.id))) return prev;
          return [data.conversation, ...prev];
        });
        setActiveConversation(data.conversation);
        if (window.innerWidth < 768) setSidebarOpen(false);
      }
      return { success: true, data };
    } catch (error) {
      console.error('Failed to create group:', error);
      return { success: false, message: error?.error || error?.message || 'Failed to create group chat.' };
    }
  }, [setConversations]);

  // Handle leaving group chat
  const handleLeaveGroupSuccess = useCallback((conversationId) => {
    setConversations(prev => prev.filter(c => String(c.id) !== String(conversationId)));
    setAllConversationsForBadges(prev => prev.filter(c => String(c.id) !== String(conversationId)));
    setActiveConversation(null);
  }, [setConversations]);

  // Clear chat messages (locally and mock persistently)
  const handleClearChat = useCallback(async (conversationId) => {
    try {
      await chatAPI.clearMessages(conversationId);
      setMessages([]);
      // Update sidebar to reflect cleared messages
      setConversations((prev) =>
        prev.map((c) =>
          String(c.id) === String(conversationId)
            ? { ...c, last_message: null, last_message_content: null, last_message_at: null }
            : c
        )
      );
      setAllConversationsForBadges((prev) =>
        prev.map((c) =>
          String(c.id) === String(conversationId)
            ? { ...c, last_message: null, last_message_content: null, last_message_at: null }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  }, [setConversations]);

  // Delete chat conversation
  const handleDeleteChat = useCallback(async (conversationId) => {
    try {
      await chatAPI.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => String(c.id) !== String(conversationId)));
      setAllConversationsForBadges(prev => prev.filter(c => String(c.id) !== String(conversationId)));
      setActiveConversation(null);
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  }, [setConversations]);

  // URL sync handler (?user=<userId>)
  useEffect(() => {
    const userId = searchParams.get("user");
    if (!userId) return;

    const existing = conversations.find(c => {
      const isDirectType = c.conversation_type === 'direct';
      const hasParticipant = (c.participants || [])?.some(p => {
        const participantId = resolveUserId(p);
        return String(participantId ?? "") === String(userId);
      });
      return isDirectType && hasParticipant;
    });

    if (existing) {
      setActiveConversation(existing);
      setSearchParams({});
    } else {
      const createDM = async () => {
        try {
          const data = await chatAPI.createDirectConversation(userId);
          if (data?.conversation) {
            setConversations(prev => {
              if (prev.some(c => String(c.id) === String(data.conversation.id))) return prev;
              return [data.conversation, ...prev];
            });
            setAllConversationsForBadges(prev => {
              if (prev.some(c => String(c.id) === String(data.conversation.id))) return prev;
              return [data.conversation, ...prev];
            });
            setActiveConversation(data.conversation);
          }
          setSearchParams({});
        } catch (err) {
          console.error("Failed to create DM via query param:", err);
          setSearchParams({});
        }
      };
      createDM();
    }
  }, [searchParams, conversations, setSearchParams, setConversations]);

  // Broadcast function
  const triggerBroadcast = async () => {
    if (!broadcastText.trim()) return;
    setBroadcasting(true);
    try {
      await onBroadcast(broadcastText.trim());
      setBroadcastSuccess(true);
      setBroadcastText('');
      setTimeout(() => {
        setShowBroadcastModal(false);
        setBroadcastSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setBroadcasting(false);
    }
  };

  // Scroll Helpers
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 150;
    setShowNewMessageIndicator(!isNearBottom);
  };

  const shouldShowAvatar = (message, index) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    if (shouldShowDateSeparator(message, prevMessage)) return true;
    return String(prevMessage?.sender_id) !== String(message?.sender_id);
  };

  const shouldShowSenderName = (messages, index) => {
    if (index === 0) return true;
    const prev = messages[index - 1];
    const curr = messages[index];
    return String(prev?.sender_id) !== String(curr?.sender_id);
  };

  // Route Link tab switcher helper
  const handleTabClick = (tabId) => {
    navigate(`/chat/${tabId}`);
  };

  // RENDER HELPERS
  const renderSidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-3 md:p-4 text-left">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-white truncate">Chats</h1>
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}
              title={isConnected ? 'Connected' : 'Disconnected'}
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onBroadcast && conversations.length > 0 && (
              <button
                type="button"
                onClick={() => setShowBroadcastModal(true)}
                className="p-1.5 md:p-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-300 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
                title={`Broadcast message to all ${category}`}
              >
                <Megaphone size={14} />
                <span>Broadcast</span>
              </button>
            )}
            <button
              onClick={() => setShowNewMessage(true)}
              className="p-1.5 md:p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors shrink-0"
              title="New message"
            >
              <Edit3 size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 focus:bg-zinc-900/80 hover:bg-zinc-900/70 hover:border-white/10 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
          />
        </div>
        
        {/* Category Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide gap-1 relative bg-zinc-950/60 p-1 rounded-[14px] border border-white/5 mt-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'friends', label: 'Friends' },
            { id: 'groups', label: 'Groups' },
            { id: 'startups', label: 'Startups' },
            { id: 'general', label: 'General' },
          ].map((tab) => {
            const isTabActive = category === tab.id;
            const count = tabUnreadCounts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex-1 shrink-0 py-1.5 px-2.5 rounded-[10px] text-[11px] font-medium transition-colors duration-500 ease-in-out relative outline-none ${
                  isTabActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isTabActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-zinc-800/80 rounded-[10px] border border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                    transition={{ type: "spring", stiffness: 250, damping: 25, mass: 0.8 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {tab.label}
                  {count > 0 && (
                    <span className={`min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center leading-none transition-colors duration-500 ease-in-out ${isTabActive ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'} border-transparent`}>
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-1 md:px-2 custom-chat-scrollbar text-left">
        {isLoading ? (
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <ConversationsCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p>No conversations in {category}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="space-y-4 pt-2"
            >
            {/* Pinned Section */}
            {pinnedConversationsList.length > 0 && (
              <div>
                <div className="px-3 mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-400">
                  <span>📌 Pinned Chats</span>
                </div>
                <div className="space-y-1">
                  {pinnedConversationsList.map((conv, idx) => (
                    <ConversationItem
                      key={`pinned-${idx}`}
                      conversation={conv}
                      isActive={activeConversation?.id === conv.id}
                      onClick={() => {
                        setActiveConversation(conv);
                        if (window.innerWidth < 768) setSidebarOpen(false);
                      }}
                      onlineUsers={onlineUsers}
                      onBroadcastClick={onBroadcast ? () => setShowBroadcastModal(true) : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Recent Section */}
            {recentConversationsList.length > 0 && (
              <div>
                <div className="px-3 mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  <span>💬 All Messages</span>
                </div>
                <div className="space-y-1">
                  {recentConversationsList.map((conv, idx) => (
                    <ConversationItem
                      key={`recent-${idx}`}
                      conversation={conv}
                      isActive={activeConversation?.id === conv.id}
                      onClick={() => {
                        setActiveConversation(conv);
                        if (window.innerWidth < 768) setSidebarOpen(false);
                      }}
                      onlineUsers={onlineUsers}
                      onBroadcastClick={onBroadcast ? () => setShowBroadcastModal(true) : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        )}
      </div>
    </>
  );

  if (isMobile) {
    /* ========================================================================= */
    /* MOBILE VIEWPORT RENDERING (Switcher pattern)                             */
    /* ========================================================================= */
    return (
      <div className="h-[calc(100dvh-64px)] bg-zinc-950 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!activeConversation ? (
            /* MOBILE: Sidebar conversation list screen */
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col animate-fade-in-up animate-message-appear"
            >
              {renderSidebarContent()}
            </motion.div>
          ) : (
            /* MOBILE: Chat message screen */
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col bg-zinc-950 relative"
            >
              {/* WhatsApp-style Bulk Action Top Bar Overlay */}
              <AnimatePresence>
                {isSelectMode && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute inset-x-0 top-0 h-[64px] bg-indigo-950 z-[100] flex items-center justify-between px-4 select-none shadow-xl border-b border-indigo-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCancelSelectMode}
                        className="p-1 rounded-lg hover:bg-indigo-900/50 text-indigo-300 text-left"
                      >
                        <X size={18} />
                      </button>
                      <span className="text-white font-medium text-sm">
                        {selectedMessageIds.size} selected
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleBulkStar}
                        disabled={selectedMessageIds.size === 0}
                        className="p-1.5 rounded-lg bg-indigo-900/40 border border-indigo-500/20 text-indigo-300 active:scale-95 disabled:opacity-50"
                      >
                        <Star size={16} />
                      </button>
                      <button
                        onClick={handleBulkPin}
                        disabled={selectedMessageIds.size === 0}
                        className="p-1.5 rounded-lg bg-indigo-900/40 border border-indigo-500/20 text-indigo-300 active:scale-95 disabled:opacity-50"
                      >
                        <Pin size={16} />
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        disabled={selectedMessageIds.size === 0}
                        className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/20 text-red-400 active:scale-95 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <ChatHeader
                conversation={activeConversation}
                currentUserId={currentUserId}
                presenceStatus={headerPresenceStatus}
                statusText={headerStatusText}
                onAvatarClick={activeConversation?.conversation_type === "direct" ? handleOpenChatWithFriend : undefined}
                onBack={() => setActiveConversation(null)}
                isMobile={true}
                onOpenDM={handleOpenChatWithFriend}
                onLeaveGroup={handleLeaveGroupSuccess}
                onClearChat={handleClearChat}
                onDeleteChat={handleDeleteChat}
              />

              <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide relative text-left"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {messagesLoading ? (
                  <MessagesSkeleton />
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                    <MessageCircle size={48} className="opacity-30 mb-2" />
                    <p>No messages in this chat. Say hello!</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const prevMessage = index > 0 ? messages[index - 1] : null;
                    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
                    const isOwn = String(message.sender_id) === String(currentUserId);
                    const isLastInGroup = !nextMessage || String(nextMessage.sender_id) !== String(message.sender_id) || shouldShowDateSeparator(nextMessage, message);
                    return (
                      <React.Fragment key={message.id || index}>
                        {shouldShowDateSeparator(message, prevMessage) && (
                          <DateSeparator date={message.created_at} />
                        )}
                        <MessageBubble
                          message={message}
                          isOwn={isOwn}
                          isLastInGroup={isLastInGroup}
                          showAvatar={shouldShowAvatar(message, index)}
                          currentUserId={currentUserId}
                          conversationId={activeConversation?.id}
                          conversationType={activeConversation?.conversation_type}
                          setMessages={setMessages}
                          showSenderName={shouldShowSenderName(messages, index)}
                          onEditRequest={handleEditRequest}
                          onReplyRequest={setReplyingTo}
                          isSelectMode={isSelectMode}
                          isSelected={selectedMessageIds.has(message.id)}
                          onToggleSelect={handleToggleSelect}
                          onStartSelectMode={handleStartSelectMode}
                          onRetrySendMessage={handleRetrySendMessage}
                          onDeleteFailedMessage={handleDeleteFailedMessage}
                        />
                      </React.Fragment>
                    );
                  })
                )}
                <TypingIndicator users={typingUsers} />
                <div ref={messagesEndRef} />
              </div>

              {/* Floating New Messages Pill */}
              <AnimatePresence>
                {showNewMessageIndicator && (
                  <motion.button
                    initial={{ opacity: 0, y: 16, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    type="button"
                    onClick={() => {
                      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                      setShowNewMessageIndicator(false);
                    }}
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-full shadow-lg transition-colors flex items-center gap-1.5 z-30 animate-pulse"
                  >
                    <span>↓ New messages below</span>
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="p-2 border-t border-white/5 bg-zinc-950/80 backdrop-blur-xl pb-6">
                <ChatInput
                  value={messageInput}
                  onChange={setMessageInput}
                  onSend={handleSendMessage}
                  onFileUpload={handleFileUpload}
                  disabled={!activeConversation}
                  isMobile={true}
                  editingMessage={editingMessage}
                  onCancelEdit={handleCancelEdit}
                  onEditSubmit={handleEditSubmit}
                  replyingTo={replyingTo}
                  onCancelReply={handleCancelReply}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating broadcast modal */}
        {renderBroadcastModal()}

        {/* Online Contacts Sidebar (Mobile Drawer) */}
        <OnlineContactsSidebar
          friends={friends}
          onlineUsers={onlineUsers}
          lastActiveAt={lastActiveAt}
          lastSeenAt={lastSeenAt}
          nowTs={nowTs}
          onOpenChat={handleOpenChatWithFriend}
          onNewMessage={() => setShowNewMessage(true)}
          token={token}
          currentUserId={currentUserId}
          isOpen={showContactsSidebar}
          onClose={() => setShowContactsSidebar(false)}
        />

        {/* Mobile floating button to open contacts sidebar */}
        <button
          type="button"
          onClick={() => setShowContactsSidebar(true)}
          className="fixed bottom-20 right-4 z-[9980] w-11 h-11 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-300 shadow-lg flex items-center justify-center hover:bg-zinc-700 transition-colors"
          title="Online contacts"
        >
          <span className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {onlineUsers && onlineUsers.length > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] px-0.5 rounded-full bg-emerald-500 text-zinc-900 text-[9px] font-bold flex items-center justify-center">
                {onlineUsers.length > 9 ? '9+' : onlineUsers.length}
              </span>
            )}
          </span>
        </button>
        
        {/* New message Modal */}
        <NewMessageModal
          isOpen={showNewMessage}
          onClose={() => setShowNewMessage(false)}
          friends={friends}
          onlineUsers={onlineUsers}
          lastActiveAt={lastActiveAt}
          onSelectUser={handleOpenChatWithFriend}
          onCreateGroup={handleCreateGroup}
          token={token}
          currentUserId={currentUserId}
        />
      </div>
    );
  }

  /* ========================================================================= */
  /* DESKTOP VIEWPORT RENDERING (Full split panels)                            */
  /* ========================================================================= */
  return (
    <div className="h-[calc(100dvh-64px)] bg-zinc-950 flex flex-col md:flex-row relative overflow-hidden">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed top-16 inset-x-0 bottom-0 bg-black bg-opacity-50 z-30 md:hidden animate-fade-in-up animate-message-appear"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Conversations Sidebar */}
      <div className={`fixed md:static top-16 left-0 z-40 bg-zinc-900 flex flex-col h-[calc(100dvh-64px)] transform transition-all duration-300 ease-in-out ${
        sidebarOpen 
          ? 'translate-x-0 w-full sm:w-80 md:w-80 md:border-r md:border-zinc-800 opacity-100' 
          : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 overflow-hidden md:border-r-0'
      }`}>
        <div className="w-full sm:w-80 md:w-80 h-full flex flex-col shrink-0">
          {renderSidebarContent()}
        </div>
      </div>

      {/* Main Chat Pane */}
      <div className="flex-1 flex flex-col bg-zinc-950 w-full md:w-auto min-w-0 h-full">
        {activeConversation ? (
          <motion.div
            key={activeConversation.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-full w-full overflow-hidden"
          >
            {/* Thread Pane */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">
              {/* WhatsApp-style Bulk Action Top Bar */}
              <AnimatePresence>
                {isSelectMode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: '64px', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-indigo-950/90 border-b border-indigo-500/30 flex items-center justify-between px-6 z-50 shrink-0 select-none backdrop-blur-md"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleCancelSelectMode}
                        className="p-1.5 rounded-lg hover:bg-indigo-900/50 text-indigo-300 hover:text-white transition-colors text-left"
                        title="Cancel selection"
                      >
                        <X size={20} />
                      </button>
                      <span className="text-white font-medium text-sm">
                        {selectedMessageIds.size} selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBulkStar}
                        disabled={selectedMessageIds.size === 0}
                        className="p-2 rounded-xl bg-indigo-900/40 hover:bg-indigo-805/60 border border-indigo-500/20 text-indigo-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
                        title="Star selected"
                      >
                        <Star size={16} /> Star
                      </button>
                      <button
                        onClick={handleBulkPin}
                        disabled={selectedMessageIds.size === 0}
                        className="p-2 rounded-xl bg-indigo-900/40 hover:bg-indigo-805/60 border border-indigo-500/20 text-indigo-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
                        title="Pin selected"
                      >
                        <Pin size={16} /> Pin
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        disabled={selectedMessageIds.size === 0}
                        className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/20 text-red-400 hover:text-red-300 transition-all flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
                        title="Delete selected"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <ChatHeader
                conversation={activeConversation}
                currentUserId={currentUserId}
                presenceStatus={headerPresenceStatus}
                statusText={headerStatusText}
                onAvatarClick={activeConversation?.conversation_type === "direct" ? handleOpenChatWithFriend : undefined}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                isMobile={false}
                onOpenDM={handleOpenChatWithFriend}
                onLeaveGroup={handleLeaveGroupSuccess}
                onClearChat={handleClearChat}
                onDeleteChat={handleDeleteChat}
              />

              <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 min-h-0 overflow-y-auto py-4 px-4 relative text-left custom-chat-scrollbar"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {messagesLoading ? (
                  <MessagesSkeleton />
                ) : (
                  messages.map((message, index) => {
                    const prevMessage = index > 0 ? messages[index - 1] : null;
                    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
                    const isOwn = String(message.sender_id) === String(currentUserId);
                    const isLastInGroup = !nextMessage || String(nextMessage.sender_id) !== String(message.sender_id) || shouldShowDateSeparator(nextMessage, message);
                    return (
                      <React.Fragment key={message.id || index}>
                        {shouldShowDateSeparator(message, prevMessage) && (
                          <DateSeparator date={message.created_at} />
                        )}
                        <MessageBubble
                          message={message}
                          isOwn={isOwn}
                          isLastInGroup={isLastInGroup}
                          showAvatar={shouldShowAvatar(message, index)}
                          currentUserId={currentUserId}
                          conversationId={activeConversation?.id}
                          conversationType={activeConversation?.conversation_type}
                          setMessages={setMessages}
                          showSenderName={activeConversation?.conversation_type !== "direct" && shouldShowSenderName(messages, index)}
                          onEditRequest={handleEditRequest}
                          onReplyRequest={setReplyingTo}
                          isSelectMode={isSelectMode}
                          isSelected={selectedMessageIds.has(message.id)}
                          onToggleSelect={handleToggleSelect}
                          onStartSelectMode={handleStartSelectMode}
                          onRetrySendMessage={handleRetrySendMessage}
                          onDeleteFailedMessage={handleDeleteFailedMessage}
                        />
                      </React.Fragment>
                    );
                  })
                )}
                <TypingIndicator users={typingUsers} />
                <div ref={messagesEndRef} />
              </div>

              {/* Floating New Messages Pill */}
              <AnimatePresence>
                {showNewMessageIndicator && (
                  <motion.button
                    initial={{ opacity: 0, y: 16, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    type="button"
                    onClick={() => {
                      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                      setShowNewMessageIndicator(false);
                    }}
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-full shadow-lg transition-colors flex items-center gap-1.5 z-30 animate-pulse"
                  >
                    <span>↓ New messages below</span>
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="shrink-0 border-t border-white/5">
                <ChatInput
                  value={messageInput}
                  onChange={setMessageInput}
                  onSend={handleSendMessage}
                  onFileUpload={handleFileUpload}
                  socket={socket}
                  conversationId={activeConversation?.id}
                  disabled={!activeConversation}
                  editingMessage={editingMessage}
                  onCancelEdit={handleCancelEdit}
                  onEditSubmit={handleEditSubmit}
                  replyingTo={replyingTo}
                  onCancelReply={handleCancelReply}
                />
            </div>
          </div>
        </motion.div>
      ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8">
            <MessageCircle size={64} className="opacity-20 mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-zinc-300 mb-1">Welcome to SFCollab Chat</h2>
            <p className="text-sm text-zinc-500 max-w-sm text-center">Select a conversation from the sidebar or start a new direct message to connect.</p>
          </div>
        )}
      </div>

      {/* Online Contacts Sidebar (Desktop Only) */}
      <div className="hidden lg:block w-60 bg-zinc-900 border-l border-zinc-800 shrink-0">
        <OnlineContactsSidebar 
          friends={friends}
          onlineUsers={onlineUsers}
          lastActiveAt={lastActiveAt}
          lastSeenAt={lastSeenAt}
          nowTs={nowTs}
          onOpenChat={handleOpenChatWithFriend}
          onNewMessage={() => setShowNewMessage(true)}
          token={token}
          currentUserId={currentUserId}
          isOpen={showContactsSidebar}
          onClose={() => setShowContactsSidebar(false)}
        />
      </div>

      {/* Modals */}
      {renderBroadcastModal()}

      <NewMessageModal
        isOpen={showNewMessage}
        onClose={() => setShowNewMessage(false)}
        friends={friends}
        onlineUsers={onlineUsers}
        lastActiveAt={lastActiveAt}
        onSelectUser={handleOpenChatWithFriend}
        onCreateGroup={handleCreateGroup}
        token={token}
        currentUserId={currentUserId}
      />
    </div>
  );

  // RENDER BROADCAST MODAL
  function renderBroadcastModal() {
    return (
      <AnimatePresence>
        {showBroadcastModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative text-left"
            >
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400">
                  <Megaphone size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white capitalize">Broadcast to {category}</h3>
                  <p className="text-xs text-zinc-400">Send to all {conversations.length} chats in this category.</p>
                </div>
              </div>

              {broadcastSuccess ? (
                <div className="py-6 text-center text-emerald-400 font-bold text-sm flex flex-col items-center gap-2">
                  <span className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Check size={20} />
                  </span>
                  <span>Broadcast successfully sent!</span>
                </div>
              ) : (
                <>
                  <textarea
                    rows={4}
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                    placeholder={`Type a message to broadcast to all ${category}...`}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none mb-4"
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowBroadcastModal(false)}
                      className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={broadcasting || !broadcastText.trim()}
                      onClick={triggerBroadcast}
                      className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      {broadcasting ? 'Sending...' : 'Send Broadcast'}
                      <Send size={14} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }
};

export default BaseChatLayout;

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit3, MessageCircle, HamburgerIcon, Menu } from 'lucide-react';

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

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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

  return {
    ...m,
    created_at: created,
    sender,
    sender_id: m.sender_id || sender?.id,
    content: m.content ?? m.original_content ?? m.message ?? "",
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


const ChatPage = () => {
  
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchParams] = useSearchParams();


  // ============================================
  // REFS
  // ============================================
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ============================================
  // API CALLS
  // ============================================
  
  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await chatAPI.getAllChats();
      const data = response.data;
      console.log("data:", data);

      const convos = data.conversations || [];
      console.log(response);
      setConversations(convos);

      // Seed last-seen from backend fields so it still shows after you leave/re-enter chat
      // (works even if you didn't witness the user go offline in this session)
      setLastSeenAt((prev) => {
        const next = { ...prev };
        for (const c of convos) {
          if (c?.conversation_type !== "direct") continue;
          const other = c.participants?.find(
            (p) => String(p.id) !== String(currentUser?.id)
          );
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

    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentUser?.id]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId) => {
    if (!token) return;
    
    try {
      const response = await chatAPI.getMessages(conversationId, 100, 0);
      const data = response.data;
      setMessages((data.messages || []).map(normalizeMessage));
      socket?.emit('mark_read', { conversation_id: conversationId });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, [token, socket]);

  // ============================================
  // FILE UPLOAD HANDLER
  // ============================================
  const handleFileUpload = useCallback(async (file) => {
    if (!token || !file) return null;
    try {
      const response = await chatAPI.uploadFile(activeConversation?.id, file, file.name);
      const data = response.data;
      
      return data.message.file_url;
    } catch (error) {
      console.error('File upload failed:', error);
      return null;
    }
  }, [token, activeConversation?.id]);

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

    const friend = friends.find((f) => String(f.id) === String(userId));
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
      if (String(data.conversation_id) === String(activeConversation?.id)) {
        setMessages((prev) => [...prev, normalizeMessage(data.message)]);
        socket.emit("mark_read", { conversation_id: activeConversation.id });
      }
      fetchConversations();
    };

    const onUserTyping = (data) => {
      if (String(data?.conversation_id) !== String(activeConversation?.id)) return;

      if (data?.is_typing) {
        setTypingUsers((prev) => {
          if (prev.some((u) => String(u.id) === String(data.user_id))) return prev;

          // Guard: activeConversation or participants may be missing for some DMs
          const participants = activeConversation?.participants || [];
          const user =
            participants.find((p) => String(p.id) === String(data.user_id)) ||
            { id: data.user_id, firstName: "", lastName: "" }; // fallback so UI won't crash

          return [...prev, user];
        });
      } else {
        setTypingUsers((prev) => prev.filter((u) => String(u.id) !== String(data.user_id)));
      }
    };


    socket.on("new_message", onNewMessage);
    socket.on("user_typing", onUserTyping);

    return () => {
      if (activeConversation) {
        socket.emit("leave_conversation", { conversation_id: activeConversation.id });
      }
      socket.off("new_message", onNewMessage);
      socket.off("user_typing", onUserTyping);
    };
  }, [socket, activeConversation, fetchConversations]);

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

      if (data.status === "offline") {
        setLastSeenAt((prev) => ({ ...prev, [id]: now() }));
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

    // only keypress + interval (NO mousemove spam)
    window.addEventListener("keydown", ping);
    const interval = setInterval(ping, 20000); // every 20s

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", ping);
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
      // Leave previous room
      if (socket && activeConversation) {
        socket.emit('leave_conversation', { conversation_id: activeConversation.id });
      }
      
      setActiveConversation(conversation);
      setMessages([]);
      setTypingUsers([]);
      fetchMessages(conversation.id);
    }
  };

  // Open chat with a friend (from sidebar)
  const handleOpenChatWithFriend = async (friend) => {
    console.log('handleOpenChatWithFriend called with friend:', friend);
    
    // Check if conversation already exists
    const existing = conversations.find(c => {
      console.log('Checking conversation:', c);
      const isDirectType = c.conversation_type === 'direct';
      console.log('  - Is direct type:', isDirectType);
      const hasParticipant = c.participants?.some(p => {
        const matches = String(p.id) === String(friend.id);
        console.log(`    - Participant ${p.id} matches friend ${friend.id}:`, matches);
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
        console.log('Creating direct conversation for friend ID:', friend.id);
        const response = await chatAPI.createDirectConversation(friend.id);
        console.log('API response:', response);
        
        const data = response.data;
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
      const response = await chatAPI.createGroupConversation(name, userIds);
      const data = response.data;
      if (!response.ok || !data?.success) {
        return {
          success: false,
          message: data?.error || data?.message || `Failed to create group chat (HTTP ${response.status})`,
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

  // Send a message
  const handleSendMessage = (content) => {
    if (!content || !activeConversation || !socket) return;

    socket.emit('typing_stop', { conversation_id: activeConversation.id });
    socket.emit('send_message', {
      conversation_id: activeConversation.id,
      content,
    });
    
    setMessageInput('');
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
  const filteredConversations = useMemo(() => conversations.filter(c => {
    // Filter by search
    if (searchTerm) {
      const name = c.name || c.participants?.find(p => String(p.id) !== String(currentUser?.id))?.firstName || '';
      if (!name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    }
    
    // Filter by tab
    if (activeTab === 'all') return true;
    if (activeTab === 'friends') return c.conversation_type === 'direct';
    if (activeTab === 'groups') return c.conversation_type === 'group';
    if (activeTab === 'startups') return c.conversation_type === 'team';
    if (activeTab === 'general') return c.conversation_type === 'general';
    
    return true;
  }).sort(
    (a, b) => {
      const aLast = toMs(a.last_message_at || a.updated_at || a.created_at) || 0;
      const bLast = toMs(b.last_message_at || b.updated_at || b.created_at) || 0;
      return bLast - aLast;
    }
  ), [conversations, searchTerm, activeTab, currentUser?.id]);

  

  
  // ============================================
  // PRESENCE (ONLINE / IDLE / LAST SEEN)
  // Rules you requested:
  // - online: < 5 mins inactivity
  // - idle:  5:00 to 5:59 mins inactivity (still connected)
  // - last seen: 6+ mins inactivity OR disconnected
  // ============================================
  const otherParticipant =
    activeConversation?.conversation_type === "direct"
      ? activeConversation?.participants?.find(
          (p) => String(p.id) !== String(currentUser?.id)
        )
      : null;

  const otherId = otherParticipant?.id ? String(otherParticipant.id) : null;
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
  const lastSeenTs =
    otherId
      ? toMs(
          lastSeenAt?.[otherId] ??
            otherParticipant?.last_seen ??
            otherParticipant?.lastSeen ??
            otherParticipant?.last_login ??
            otherParticipant?.lastLogin
        )
      : null;

  const diffMs = (ts) => (ts ? Math.max(0, nowTs - ts) : null);

  let presenceStatus = "offline"; // "online" | "idle" | "offline"
  let statusText = "";

  if (activeConversation?.conversation_type === "direct" && otherId) {
    if (connected) {
      const d = diffMs(lastActiveTs);

      // If we haven't received activity yet, assume online while connected
      if (d == null || d < 5 * 60 * 1000) {
        presenceStatus = "online";
        statusText = "online";
      } else if (d < 6 * 60 * 1000) {
        presenceStatus = "idle";
        statusText = "idle";
      } else {
        presenceStatus = "offline";
        statusText = formatLastSeen(lastActiveTs, nowTs);
      }
    } else {
      presenceStatus = "offline";
      statusText = formatLastSeen(lastSeenTs || lastActiveTs, nowTs);
    }
  }

  const isOnline = presenceStatus === "online";
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
    <div className="h-[calc(100vh-64px)] bg-zinc-950 flex flex-col md:flex-row relative">
      {/* Mobile overlay for sidebar */}
      {sidebarOpen && (
        <div
          className="fixed top-16 inset-x-0 bottom-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============================================ */}
      {/* LEFT SIDEBAR: Conversations List */}
      {/* ============================================ */}
      <div className={`fixed md:static top-16 left-0 z-40 w-full sm:w-80 md:w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col h-[calc(100vh-80px)] md:h-auto transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
        {/* Header */}
        <div className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-white truncate">Chats</h1>
              {/* Connection status */}
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}
                title={isConnected ? 'Connected' : 'Disconnected'}
              />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {/* New message button */}
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
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-zinc-800 rounded-full text-xs md:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          
          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'friends', label: 'Friends', type: 'direct' },
              { id: 'groups', label: 'Groups', type: 'group' },
              { id: 'startups', label: 'Startups', type: 'team' },
              { id: 'general', label: 'General', type: 'general' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[11px] md:text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${activeTab === tab.id
                    ? 'bg-indigo-500 text-zinc-900'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-1 md:px-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conv, idx) => (
              <ConversationItem
                key={idx}
                conversation={conv}
                
                isActive={activeConversation?.id === conv.id}
                onClick={() => {
                  handleSelectConversation(conv)
                  setSidebarOpen(false);
                }
                }
                onlineUsers={onlineUsers}
                currentUserId={currentUser.id}
                lastActiveAt={lastActiveAt}
                lastSeenAt={lastSeenAt}
                nowTs={nowTs}
              />
            ))
          )}
        </div>
      </div>



      {/* ============================================ */}
      {/* CENTER: Chat Area */}
      {/* ============================================ */}
      <div className="flex-1 flex flex-col bg-zinc-950 w-full md:w-auto min-w-0">
        
        {activeConversation ? (
          <>
            
            
            {/* Chat Header - Hidden on mobile (shown in mobile header above) */}
            <div className="hidden md:block">
              <ChatHeader
                conversation={activeConversation}
                currentUserId={currentUser.id}
                presenceStatus={presenceStatus}
                statusText={statusText}
                onAvatarClick={activeConversation?.conversation_type === "direct" ? handleOpenProfile : undefined}
                setSidebarOpen={() => setSidebarOpen(true)}
                isMobile={isMobile}
              />
            </div>
            
            {/* Chat Header - Mobile Version (compact) */}
            <div className="md:hidden border-b border-zinc-800">
              <ChatHeader
                conversation={activeConversation}
                currentUserId={currentUser.id}
                presenceStatus={presenceStatus}
                statusText={statusText}
                onAvatarClick={activeConversation?.conversation_type === "direct" ? handleOpenProfile : undefined}
                setSidebarOpen={() => setSidebarOpen(true)}
                isMobile={isMobile}
              />
            </div>


            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] py-2 md:py-4 px-2 md:px-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                  <Avatar
                    src={
                      getProfilePicture(otherParticipant)
                    }
                    name={`${otherParticipant?.firstName || otherParticipant?.first_name || ""}`}
                    size="xl"
                    showStatus={false}
                  />

                  <p className="mt-4 font-medium text-white">
                    {otherParticipant?.firstName} {otherParticipant?.lastName}
                  </p>
                  <p className="text-sm text-zinc-500">Start a conversation</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const prevMessage = index > 0 ? messages[index - 1] : null;
                  // Use String() comparison to avoid type mismatch
                  const isOwn = String(message.sender_id) === String(currentUser.id);
                  
                  return (
                    <React.Fragment key={index}>
                      {/* Date separator (Today, Yesterday, etc.) */}
                      {shouldShowDateSeparator(message, prevMessage) && (
                        <DateSeparator date={message.created_at} />
                      )}
                      
                      {/* Message bubble */}
                      <MessageBubble
                        message={message}
                        isOwn={isOwn}
                        showAvatar={shouldShowAvatar(message, index)}
                        currentUserId={currentUser?.id}
                        conversationId={activeConversation?.id}
                        conversationType={activeConversation?.conversation_type}
                        setMessages={setMessages}
                        showSenderName={
                          activeConversation?.conversation_type !== "direct" &&
                          shouldShowSenderName(messages, index)
                        }
                      />

                    </React.Fragment>
                  );
                })
              )}
              
              {/* Typing indicator */}
              <TypingIndicator users={typingUsers} />
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input - with file upload support */}
            <div className="border-t border-zinc-800">
              <ChatInput
                value={messageInput}
                onChange={handleInputChange}
                onSend={handleSendMessage}
                onFileUpload={handleFileUpload}
                socket={socket}
                conversationId={activeConversation?.id}
                disabled={!activeConversation}
              />
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="w-16 md:w-20 h-16 md:h-20 bg-linear-to-br from-indigo-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <MessageCircle size={32} className="text-indigo-500 md:w-10 md:h-10" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-1 md:mb-2 text-center">Your Messages</h2>
            <p className="text-zinc-500 text-xs md:text-sm mb-3 md:mb-4 text-center">Send private messages to a friend or group</p>
            <button
              onClick={() => setShowNewMessage(true)}
              className="px-4 md:px-6 py-2 md:py-2.5 bg-indigo-500 hover:bg-indigo-400 text-zinc-900 font-medium text-sm md:text-base rounded-full transition-colors"
            >
              Send message
            </button>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* RIGHT SIDEBAR: Online Contacts */}
      {/* ============================================ */}
      <div className="hidden lg:block w-60 bg-zinc-900 border-l border-zinc-800 shrink-0">
        <OnlineContactsSidebar
          friends={friends}
          onlineUsers={onlineUsers}
          lastActiveAt={lastActiveAt}
          onOpenChat={handleOpenChatWithFriend}
          onNewMessage={() => setShowNewMessage(true)}
          token={token}
          currentUserId={currentUser?.id}
        />
      </div>

      {/* ============================================ */}
      {/* NEW MESSAGE MODAL */}
      {/* ============================================ */}
      <NewMessageModal
        isOpen={showNewMessage}
        onClose={() => setShowNewMessage(false)}
        friends={friends}
        onlineUsers={onlineUsers}
        lastActiveAt={lastActiveAt}
        onSelectUser={handleOpenChatWithFriend}
        onCreateGroup={handleCreateGroup}
        token={token}
        currentUserId={currentUser?.id}
      />
    </div>
  );
};

export default ChatPage;
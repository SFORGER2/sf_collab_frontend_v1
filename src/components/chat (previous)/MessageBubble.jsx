/**
 * MessageBubble Component - Fixed Version
 * 
 * FEATURES:
 * 1. Profile pictures display correctly
 * 2. Timestamps always visible
 * 3. Delete for everyone (within 1 hour) / Delete for me (anytime)
 * 4. No browser alerts - styled modals only
 * 5. Edit message functionality
 */

import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { X, Download, FileText, ExternalLink, Check, CheckCheck, MoreVertical, Edit2, Trash2, Star, Pin, ListTodo, BookmarkCheck } from "lucide-react";
import Avatar from "./Avatar";
import { getProfilePicture } from "@/utils/getProfilePicture";
import { chatAPI } from "@/utils/APIs/chatApi";
import { resolveUserId } from "@/utils/resolveUserId";

// At the top of MessageBubble.jsx, after other imports
const DELETE_TIMEOUT_HOURS = 2;

// Helper to reduce text length
const reduceText = (text, maxLength = 20) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Files are typically served from the backend host
const FILE_BASE_URL =
  import.meta.env.VITE_SOCKET_API_URL ||
  (import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, "")
    : "");

const resolveUrl = (url) => {
  if (!url) return null;
  const s = String(url);
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("blob:") || s.startsWith("data:")) return s;
  const slash = s.startsWith("/") ? "" : "/";
  return `${FILE_BASE_URL}${slash}${s}`;
};

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function fetchBlobWithAuth(url, token) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Download failed (${res.status})`);
  }

  return await res.blob();
}

async function forceDownload(url, filename, token) {
  try {
    const blob = await fetchBlobWithAuth(url, token);
    const a = document.createElement("a");
    const href = URL.createObjectURL(blob);
    a.href = href;
    a.download = filename || "download";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

async function openInNewTab(url, token) {
  try {
    const blob = await fetchBlobWithAuth(url, token);
    const href = URL.createObjectURL(blob);
    window.open(href, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(href), 60_000);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function hideAutoFileText({ fileUrl, isImage, content, fileName }) {
  if (!fileUrl || !isImage) return false;
  const c = String(content || "").trim();
  if (!c) return false;
  if (/^\[\s*file\s*:/i.test(c)) return true;
  if (fileName && c === fileName) return true;
  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(c)) return true;
  if (c === fileUrl) return true;
  return false;
}

function getMsgStatus(msg) {
  const s = String(msg?.status || msg?.delivery_status || "").toLowerCase();
  if (s === "read" || s === "seen" || msg?.read_at || msg?.seen_at) return "read";
  if (s === "delivered" || msg?.delivered_at) return "delivered";
  return "sent";
}

// Read receipt tick icon component
function ReadReceipt({ status, size = 14 }) {
  if (status === "read") {
    // Double green tick = read
    return <CheckCheck size={size} className="text-emerald-400" />;
  }
  if (status === "delivered") {
    // Double grey tick = delivered
    return <CheckCheck size={size} className="text-zinc-400 opacity-80" />;
  }
  // Single grey tick = sent
  return <Check size={size} className="text-zinc-400 opacity-80" />;
}

// ─── Feature 3: Task due-date modal ──────────────────────────────────────────
const TaskModal = ({ isOpen, onClose, onSave }) => {
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[10001] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-800 p-5" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-semibold text-white mb-3">Save to Task Box</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Due date (optional)</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Note (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder="Add a note..."
              className="w-full px-3 py-2 bg-zinc-800 rounded-xl text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-sm text-zinc-300 transition-colors">Cancel</button>
            <button onClick={() => onSave(dueDate || null, note || null)} className="flex-1 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-sm text-white transition-colors">Save Task</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MessageBubble({
  message,
  isOwn,
  showAvatar,
  showSenderName = false,
  setMessages = null,
  onMessageUpdated = null,
  conversationId = null,
  conversationType = "direct",
  currentUserId = null,
  variant = "page" // "page" or "dock"
}) {
  const navigate = useNavigate();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingEditing, setIsLoadingEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [menuAbove,    setMenuAbove]    = useState(true);   // smart: above or below
  const menuBtnRef = useRef(null);

  const handleMenuToggle = (e) => {
  e?.preventDefault();
  e?.stopPropagation();

  if (!menuOpen && menuBtnRef.current) {
    const rect = menuBtnRef.current.getBoundingClientRect();
    setMenuAbove(rect.top > 220);
  }

  setMenuOpen((prev) => !prev);
};
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const menuRef = useRef(null);
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
  const pickerBtnRef = useRef(null);

  const handlePickerToggle = () => {
    setReactionPickerOpen(v => !v);
  };
  const [reactionLoading, setReactionLoading] = useState(false);
  const [showReactionBar, setShowReactionBar] = useState(false);

  // Quick reaction emojis shown in the hover bar
  const QUICK_REACTIONS = ["❤️", "😂", "😮", "😢", "😡", "👍", "👎", "🔥", "🎉", "💯"];
  // Full picker for "more" button
  const FULL_REACTIONS = [
    "❤️","😂","😮","😢","😡","👍","👎","🔥","🎉","💯",
    "😀","😍","🥰","🤩","😎","🙂","😊","🥹","😤","🤔",
    "👏","🙌","🤝","✌️","💪","🙏","👋","✋","🤞","👌",
    "💕","💔","🧡","💛","💚","💙","💜","⭐","✨","🎁",
  ];

  // Derive reaction counts from message.reactions array
  const reactionCounts = useMemo(() => {
    const reactions = message?.reactions || [];
    const map = {};
    reactions.forEach(r => {
      const emoji = r.emoji || r.reaction;
      if (!emoji) return;
      if (!map[emoji]) map[emoji] = { count: 0, users: [], hasReacted: false };
      map[emoji].count++;
      map[emoji].users.push(r.user_id || r.userId);
      if (String(r.user_id || r.userId) === String(currentUserId)) {
        map[emoji].hasReacted = true;
      }
    });
    return map;
  }, [message?.reactions, currentUserId]);

  const handleReact = useCallback(async (emoji) => {
    // Cannot react to your own messages
    if (isOwn) return;
    if (!conversationId || !message?.id || reactionLoading) return;
    setReactionPickerOpen(false);
    setShowReactionBar(false);
    setReactionLoading(true);
    const uid = String(currentUserId);

    // Find if user already reacted with ANY emoji (one reaction per user)
    const allReactions = message?.reactions || [];
    const existingReaction = allReactions.find(
      r => String(r.user_id || r.userId) === uid
    );
    const clickedSameEmoji = existingReaction && (existingReaction.emoji || existingReaction.reaction) === emoji;

    // Optimistic update
    setMessages && setMessages(prev => prev.map(m => {
      if (String(m.id) !== String(message.id)) return m;
      const existing = m.reactions || [];
      let updated;
      if (clickedSameEmoji) {
        // Toggle off — remove their reaction
        updated = existing.filter(r => String(r.user_id || r.userId) !== uid);
      } else {
        // Replace existing reaction (or add first one) — only one allowed
        updated = [
          ...existing.filter(r => String(r.user_id || r.userId) !== uid),
          { emoji, user_id: uid, userId: uid },
        ];
      }
      return { ...m, reactions: updated };
    }));
    try {
      await chatAPI.reactToMessage(conversationId, message.id, emoji);
    } catch (e) {
      console.error("Reaction failed:", e);
    } finally {
      setReactionLoading(false);
    }
  }, [isOwn, conversationId, message?.id, message?.reactions, currentUserId, reactionLoading, setMessages]);

  // ─── Feature 3: Star / Pin / Task state ──────────────────────────────────
  const [isStarred, setIsStarred] = useState(!!message?.is_starred);
  const [isPinned, setIsPinned] = useState(!!message?.is_pinned);
  const [isTask, setIsTask] = useState(!!message?.is_task);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [starLoading, setStarLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  // Keep in sync if message prop changes
  useEffect(() => {
    setIsStarred(!!message?.is_starred);
    setIsPinned(!!message?.is_pinned);
    setIsTask(!!message?.is_task);
  }, [message?.is_starred, message?.is_pinned, message?.is_task]);

  const { access_token: token } = useSelector((state) => state.auth || {});

  const ts =
    message?.created_at ??
    message?.createdAt ??
    message?.timestamp ??
    message?.sent_at ??
    message?.sentAt ??
    null;

  const senderName = useMemo(() => {
    if (message?.sender) {
      const firstName = message.sender.firstName || message.sender.first_name || "";
      const lastName = message.sender.lastName || message.sender.last_name || "";
      return `${firstName} ${lastName}`.trim();
    }
    return message?.sender_name || message?.senderName || "";
  }, [message]);

  const senderAvatar = useMemo(() => {
    return getProfilePicture(message?.sender);
  }, [message?.sender]);

  const fileUrl = message?.file_url ? resolveUrl(message.file_url) : null;

  const isImage =
    Boolean(message?.is_image) ||
    (message?.file_type && (String(message.file_type) === "image" || String(message.file_type).startsWith("image/"))) ||
    message?.message_type === "image";

  // Check if message can be deleted for everyone (within 1 hour)
  // Inside MessageBubble component
  const canDelete = useMemo(() => {
  // Only the sender can delete the message.
  if (!isOwn) return false;

  // Newly sent message may temporarily have no timestamp.
  // Backend still enforces the real timeout.
  if (!ts) return true;

  const timestamp = String(ts);

  const hasTimezone =
    timestamp.endsWith("Z") ||
    /[+-]\d{2}:\d{2}$/.test(timestamp);

  const normalizedTimestamp = hasTimezone
    ? timestamp
    : `${timestamp}Z`;

  const messageTime = new Date(normalizedTimestamp);

  if (Number.isNaN(messageTime.getTime())) {
    console.error("Invalid message timestamp:", ts);
    return true;
  }

  const diffMilliseconds =
    Date.now() - messageTime.getTime();

  const deleteWindowMilliseconds =
    DELETE_TIMEOUT_HOURS * 60 * 60 * 1000;

  return (
    diffMilliseconds >= 0 &&
    diffMilliseconds <= deleteWindowMilliseconds
  );
}, [ts, isOwn]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle edit
  const handleEditClick = useCallback(() => {
    const contentToEdit = message.content || message.original_content || "";
    setEditContent(contentToEdit);
    setIsEditing(true);
    setMenuOpen(false);
  }, [message.content, message.original_content]);

  const handleSaveEdit = useCallback(async () => {
  const trimmedContent = editContent.trim();

  if (!trimmedContent || !conversationId || !message?.id) {
    return;
  }

  try {
    setIsLoadingEditing(true);
    setDeleteError(null);

    const data = await chatAPI.editMessage(
      conversationId,
      message.id,
      trimmedContent
    );

    const updatedMessage = data?.data?.message;

    if (!data?.success || !updatedMessage?.id) {
      throw new Error(data?.message || "Backend did not return updated message");
    }

    if (setMessages) {
      setMessages((prev) =>
        prev.map((item) =>
          String(item.id) === String(updatedMessage.id)
            ? updatedMessage
            : item
        )
      );
    }

    if (onMessageUpdated) {
      onMessageUpdated(updatedMessage);
    }

    setIsEditing(false);
    setEditContent("");
  } catch (error) {
    console.error("Edit failed:", error);

    setDeleteError(
      error?.response?.data?.message ||
      error?.message ||
      "Failed to edit message"
    );
  } finally {
    setIsLoadingEditing(false);
  }
}, [
  editContent,
  conversationId,
  message?.id,
  setMessages,
  onMessageUpdated,
]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent("");
  }, []);

  // Delete handler - supports delete for everyone or just me
  const handleDelete = useCallback(async (deleteType = "everyone") => {
  if (!conversationId || !message?.id) {
    return;
  }

  try {
    setDeleting(true);
    setDeleteError(null);

    const data = await chatAPI.deleteMessage(
      conversationId,
      message.id,
      deleteType
    );

    if (!data?.success) {
      throw new Error(data?.message || "Failed to delete message");
    }

    if (setMessages) {
      if (deleteType === "everyone") {
        setMessages((prev) =>
          prev.map((item) =>
            String(item.id) === String(message.id)
              ? {
                  ...item,
                  is_deleted: true,
                  original_content: "This message was deleted",
                  content: "This message was deleted",
                }
              : item
          )
        );
      } else {
        setMessages((prev) =>
          prev.filter(
            (item) => String(item.id) !== String(message.id)
          )
        );
      }
    }

    setDeleteModalOpen(false);
    setMenuOpen(false);
  } catch (error) {
    console.error("Delete failed:", error);

    setDeleteError(
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete message"
    );
  } finally {
    setDeleting(false);
  }
}, [
  conversationId,
  message?.id,
  setMessages,
]);

  // ─── Feature 3: Star handler ───────────────────────────────────────────────
  const handleStar = useCallback(async () => {
    if (!conversationId || starLoading) return;
    setMenuOpen(false);
    setStarLoading(true);
    try {
      if (isStarred) {
        await chatAPI.unstarMessage(conversationId, message.id);
        setIsStarred(false);
        if (setMessages) setMessages(prev => prev.map(m => String(m.id) === String(message.id) ? { ...m, is_starred: false } : m));
      } else {
        await chatAPI.starMessage(conversationId, message.id);
        setIsStarred(true);
        if (setMessages) setMessages(prev => prev.map(m => String(m.id) === String(message.id) ? { ...m, is_starred: true } : m));
      }
    } catch (e) { console.error('Star failed:', e); }
    finally { setStarLoading(false); }
  }, [conversationId, message.id, isStarred, starLoading, setMessages]);

  // ─── Feature 3: Pin handler ────────────────────────────────────────────────
  const handlePin = useCallback(async () => {
    if (!conversationId || pinLoading) return;
    setMenuOpen(false);
    setPinLoading(true);
    try {
      if (isPinned) {
        await chatAPI.unpinMessage(conversationId, message.id);
        setIsPinned(false);
        if (setMessages) setMessages(prev => prev.map(m => String(m.id) === String(message.id) ? { ...m, is_pinned: false } : m));
      } else {
        await chatAPI.pinMessage(conversationId, message.id);
        setIsPinned(true);
        if (setMessages) setMessages(prev => prev.map(m => String(m.id) === String(message.id) ? { ...m, is_pinned: true } : m));
      }
    } catch (e) { console.error('Pin failed:', e); }
    finally { setPinLoading(false); }
  }, [conversationId, message.id, isPinned, pinLoading, setMessages]);

  // ─── Feature 3: Task handler ───────────────────────────────────────────────
  const handleSaveTask = useCallback(async (dueDate, note) => {
    if (!conversationId) return;
    setTaskModalOpen(false);
    try {
      if (isTask) {
        await chatAPI.removeMessageTask(conversationId, message.id);
        setIsTask(false);
        if (setMessages) setMessages(prev => prev.map(m => String(m.id) === String(message.id) ? { ...m, is_task: false } : m));
      } else {
        await chatAPI.saveMessageAsTask(conversationId, message.id, dueDate, note);
        setIsTask(true);
        if (setMessages) setMessages(prev => prev.map(m => String(m.id) === String(message.id) ? { ...m, is_task: true } : m));
      }
    } catch (e) { console.error('Task failed:', e); }
  }, [conversationId, message.id, isTask, setMessages]);

  const onDownload = useCallback(() => {
    if (!fileUrl) return;
    forceDownload(fileUrl, message?.file_name || "download", token);
  }, [fileUrl, message?.file_name, token]);

  const onOpen = useCallback(() => {
    if (!fileUrl) return;
    openInNewTab(fileUrl, token);
  }, [fileUrl, token]);

  // If message is deleted, show deleted placeholder
  if (message?.is_deleted) {
    return (
      <div
        className={`group flex gap-1 px-1 py-0.5 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}
        onMouseEnter={() => !isOwn && setShowReactionBar(true)}
        onMouseLeave={() => { if (!reactionPickerOpen) setShowReactionBar(false); }}
        onTouchStart={() => !isOwn && setShowReactionBar(true)}
      >
        <div className="w-8 shrink-0" />
        <div className={`flex flex-col max-w-[65%] ${isOwn ? "items-end" : "items-start"}`}>
          <div className={`px-3 py-2 rounded-2xl text-sm italic ${isOwn ? "bg-zinc-700/50 text-zinc-400" : "bg-zinc-800/50 text-zinc-500"
            }`}>
            This message was deleted
          </div>
          <span className="text-[10px] text-zinc-600 mt-1">{formatTime(ts)}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Image Viewer Overlay */}
      {viewerOpen && fileUrl && isImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
          onClick={() => setViewerOpen(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button
              className="absolute top-4 left-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white"
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
              title="Download"
            >
              <Download size={18} />
            </button>

            <button
              className="absolute top-4 left-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white"
              onClick={(e) => {
                e.stopPropagation();
                setViewerOpen(false);
              }}
              title="Close"
            >
              <X size={18} />
            </button>

            <div className="p-4 max-w-[90vw] max-h-[90vh]">
              <img
                src={fileUrl}
                alt={message?.file_name || "image"}
                className="max-w-full max-h-full object-contain rounded-xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}

      <div
        className={`group flex gap-1 px-1 py-0.5 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}
        onMouseEnter={() => !isOwn && setShowReactionBar(true)}
        onMouseLeave={() => { if (!reactionPickerOpen) setShowReactionBar(false); }}
        onTouchStart={() => !isOwn && setShowReactionBar(true)}
      >
        {/* Avatar column */}
        <div
          onClick={() => {
            const targetId = resolveUserId(message?.sender);
            if (!targetId) return;
            navigate(`/user-profile?userId=${targetId}`);
          }}
          className="w-8 shrink-0 cursor-pointer">
          {showAvatar && (
            <Avatar
              src={senderAvatar}

              name={senderName || " "}
              size="sm"
              showStatus={false}
            />
          )}
        </div>

        <div className={`flex flex-col max-w-[65%] ${isOwn ? "items-end" : "items-start"}`}>
          {/* Sender name for group chats */}
          {!isOwn && showSenderName && senderName && (
            <span className="text-[11px] text-zinc-400 mb-0.5">{senderName}</span>
          )}

          <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
            {/* Message bubble */}
            <div
              className={`px-3 py-2 rounded-2xl text-sm relative ${isOwn
                  ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
                  : "bg-zinc-800 text-zinc-100"
                }`}
            >
              {/* ─── Feature 3: Pinned / Starred / Task indicators ─────── */}
              {(isPinned || isStarred || isTask) && (
                <div className="flex gap-1 mb-1">
                  {isPinned && <Pin size={10} className="text-amber-400" />}
                  {isStarred && <Star size={10} className="text-yellow-400 fill-yellow-400" />}
                  {isTask && <ListTodo size={10} className="text-emerald-400" />}
                </div>
              )}
              {/* File/Image attachment */}
              {fileUrl && (
                <div className="mb-2">
                  {isImage ? (
                    <button
                      type="button"
                      className="block"
                      onClick={() => setViewerOpen(true)}
                      title="View"
                    >
                      <img
                        src={fileUrl}
                        alt={message?.file_name || "image"}
                        className={`rounded-xl object-cover hover:opacity-90 block ${variant === "dock" ? "max-w-[180px] max-h-[160px]" : "max-w-[280px] max-h-[320px]"}`}
                        loading="lazy"
                      />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                      <FileText size={18} className="opacity-80" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm truncate">
                          {reduceText(message?.file_name || "Document", 20)}
                        </div>
                        <div className="text-[11px] opacity-70 truncate">
                          {message?.file_type || "file"}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-black/20"
                        title="Open"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen();
                        }}
                      >
                        <ExternalLink size={16} />
                      </button>

                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-black/20"
                        title="Download"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload();
                        }}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Edit mode */}
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-2 py-1 bg-black/20 rounded text-white text-sm resize-none"
                    rows="3"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-2 py-1 text-xs bg-black/30 hover:bg-black/50 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded"
                    >
                      {isLoadingEditing ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Message content */}
                  <div className="flex gap-1 items-end">
                    <div className="break-words [overflow-wrap:anywhere] min-w-0">
                      {!hideAutoFileText({
                        fileUrl,
                        isImage,
                        content: message.content || message.original_content,
                        fileName: message?.file_name,
                      }) && (message.content || message.original_content)}

                      {message.is_edited && <span className="text-xs opacity-60 ml-1">(edited)</span>}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Actions menu — star/pin/task for ALL, edit/delete for own only */}
            {conversationId && !isEditing && (
              <div className="relative" ref={menuRef}>
                <button
                  ref={menuBtnRef}
                  type="button"
                  onClick={handleMenuToggle}
                  className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="More"
                >
                  <MoreVertical size={16} />
                </button>

                {menuOpen && createPortal(
                  <div
                    ref={menuRef}
                    className="fixed w-44 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 z-[9999]"
                    style={(() => {
                      if (!menuBtnRef.current) return {};
                      const r = menuBtnRef.current.getBoundingClientRect();
                      const above = r.top > window.innerHeight / 2;
                      return {
                        ...(above ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
                        ...(isOwn ? { right: window.innerWidth - r.right } : { left: r.left }),
                      };
                    })()}
                  >
                    {/* Star */}
                    <button
                      type="button"
                      onClick={handleStar}
                      disabled={starLoading}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-zinc-700 disabled:opacity-50"
                    >
                      <Star size={14} className={isStarred ? 'text-yellow-400 fill-yellow-400' : ''} />
                      {isStarred ? 'Unstar' : 'Star'}
                    </button>

                    {/* Pin */}
                    <button
                      type="button"
                      onClick={handlePin}
                      disabled={pinLoading}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-zinc-700 disabled:opacity-50"
                    >
                      <Pin size={14} className={isPinned ? 'text-amber-400' : ''} />
                      {isPinned ? 'Unpin' : 'Pin'}
                    </button>

                    {/* Task */}
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); isTask ? handleSaveTask(null, null) : setTaskModalOpen(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-zinc-700"
                    >
                      {isTask ? <BookmarkCheck size={14} className="text-emerald-400" /> : <ListTodo size={14} />}
                      {isTask ? 'Remove Task' : 'Add to Tasks'}
                    </button>

                    {/* Edit / Delete — own messages only */}
                    {isOwn && (
                      <>
                        <div className="border-t border-zinc-700 my-1" />
                        <button
                          type="button"
                          onClick={handleEditClick}
                          disabled={deleting}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-zinc-700 disabled:opacity-50"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        {canDelete && (
      <button
        type="button"
        onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();

  console.log("DELETE MENU CLICKED");

  setMenuOpen(false);
  setDeleteError(null);
  setDeleteModalOpen(true);
}}
        disabled={deleting}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-red-400 hover:bg-red-500/20 disabled:opacity-50"
      >
        <Trash2 size={14} />
        Delete
      </button>
                        )}
                      </>
                    )}
                  </div>
                , document.body)}
              </div>
            )}
          </div>

          {/* Timestamp and status - ALWAYS VISIBLE */}
          <span className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
            <span>{formatTime(ts)}</span>
            {isOwn && <ReadReceipt status={getMsgStatus(message)} size={12} />}
          </span>

          {/* Reactions row — pills always visible, + button on hover/tap */}
          {(Object.keys(reactionCounts).length > 0 || (!isOwn && showReactionBar)) && (
            <div className={`flex flex-wrap items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
              {/* Existing reaction pills */}
              {Object.entries(reactionCounts).map(([emoji, data]) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => !isOwn && handleReact(emoji)}
                  title={isOwn ? undefined : (data.hasReacted ? "Remove reaction" : `React with ${emoji}`)}
                  className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-all ${
                    data.hasReacted
                      ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                      : "bg-zinc-800 border-zinc-700 text-zinc-300"
                  } ${!isOwn ? "hover:border-zinc-500 cursor-pointer" : "cursor-default"}`}
                >
                  <span>{emoji}</span>
                  {data.count > 1 && <span className="font-medium ml-0.5">{data.count}</span>}
                </button>
              ))}

              {/* Add reaction button — only for OTHER users' messages */}
              {!isOwn && (
                <div className="relative">
                  <button
                    type="button"
                    ref={pickerBtnRef}
                    onClick={handlePickerToggle}
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white transition-all text-sm"
                    title="Add reaction"
                  >
                    +
                  </button>
                  {reactionPickerOpen && createPortal(
                    <>
                      <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => { setReactionPickerOpen(false); setShowReactionBar(false); }}
                      />
                      <div
                        className="fixed z-[9999] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-3 w-64"
                        style={(() => {
                          if (!pickerBtnRef.current) return { bottom: 80, right: 16 };
                          const r = pickerBtnRef.current.getBoundingClientRect();
                          const above = r.top > window.innerHeight / 2;
                          return {
                            ...(above ? { bottom: window.innerHeight - r.top + 8 } : { top: r.bottom + 8 }),
                            ...(r.left > window.innerWidth / 2 ? { right: window.innerWidth - r.right } : { left: r.left }),
                          };
                        })()}
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="grid grid-cols-6 gap-1">
                          {FULL_REACTIONS.map(emoji => {
                            const isSelected = reactionCounts[emoji]?.hasReacted;
                            return (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleReact(emoji)}
                                className={`p-1.5 rounded-lg text-lg text-center transition-all hover:scale-110 ${
                                  isSelected
                                    ? "bg-indigo-500/30 ring-1 ring-indigo-500/60 hover:bg-indigo-500/40"
                                    : "hover:bg-zinc-700"
                                }`}
                                title={emoji}
                              >
                                {emoji}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>,
                    document.body
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal - WhatsApp Style */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4"
          onClick={() => !deleting && setDeleteModalOpen(false)}
        >
          <div
            className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Delete message?</h3>

              {deleteError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {deleteError}
                </div>
              )}

              <div className="space-y-2">
                {/* Delete for Everyone - only if within 1 hour */}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete('everyone')}
                    disabled={deleting}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                )}

                {/* Info text if can't delete for everyone */}
                {!canDelete && (
                  <p className="text-xs text-zinc-500 text-center mt-2">
                  </p>
                )}
              </div>
            </div>

            {/* Cancel button */}
            <div className="border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="w-full px-4 py-3 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── Feature 3: Task modal ───────────────────────────────────── */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
      />
    </>
  );
}
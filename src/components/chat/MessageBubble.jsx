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
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { X, Download, FileText, ExternalLink, Check, CheckCheck, MoreVertical, Edit2, Trash2, Star, Pin, ListTodo, BookmarkCheck, SmilePlus, Copy, CornerUpLeft, CheckSquare } from "lucide-react";
import Avatar from "./Avatar";
import { getProfilePicture } from "@/utils/getProfilePicture";
import { chatAPI } from "@/utils/APIs/chatApi";
import { resolveUserId } from "@/utils/resolveUserId";

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

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  showSenderName = false,
  setMessages = null,
  onMessageUpdated = null,
  onEditRequest = null,
  onReplyRequest = null,
  conversationId = null,
  conversationType = "direct",
  currentUserId = null,
  variant = "page", // "page" or "dock"
  isSelectMode = false,
  isSelected = false,
  onToggleSelect = null,
  onStartSelectMode = null,
  onRetrySendMessage = null,
  onDeleteFailedMessage = null
}) {
  const navigate = useNavigate();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const menuRef = useRef(null);
  const reactionPickerRef = useRef(null);
  const [activePicker, setActivePicker] = useState(null); // 'edge' | 'bar' | null
  const [reactionLoading, setReactionLoading] = useState(false);
  const [showReactionBar, setShowReactionBar] = useState(false);
  // Context menu (desktop right-click)
  const [contextMenuPos, setContextMenuPos] = useState(null); // { x, y } | null
  const contextMenuRef = useRef(null);
  // Copy text feedback toast
  const [copyFeedback, setCopyFeedback] = useState(false);
  // Mobile long-press states & refs
  const [showQuickReaction, setShowQuickReaction] = useState(false);
  const touchStartRef = useRef(null);
  const longPressTimerRef = useRef(null);

  // Quick reaction emojis shown in the hover bar
  const QUICK_REACTIONS = ["❤️", "😂", "😮", "😢", "😡", "👍", "👎", "🔥", "🎉", "💯"];
  // Full picker for "more" button
  const FULL_REACTIONS = [
    "❤️","😂","😮","😢","😡","👍","👎","🔥","🎉","💯",
    "😀","😃","😄","😁","😆","😅","🤣","😊","😇","🙂",
    "🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋",
    "😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥸","🤩",
    "🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣",
    "😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬",
    "🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗",
    "🤔","🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯",
    "👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪",
    "👀","🧠","🫀","🫁","🦷","🦴","👽","👻","💀","☠️",
    "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
    "🍎","🍉","🍇","🍓","🍕","🍔","🍟","🌭","🍿","🍩",
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
    if (!conversationId || !message?.id || reactionLoading) return;
    setActivePicker(null);
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
  const canDeleteForEveryone = useMemo(() => {
    if (!ts) return true; // If no timestamp, allow it
    const messageTime = new Date(ts);
    const now = new Date();
    const diffHours = (now - messageTime) / (1000 * 60 * 60);
    return diffHours <= 1;
  }, [ts]);

  // Check if message can be deleted at all (within 2 hours)
  const canDelete = useMemo(() => {
    if (!ts) return true;
    const messageTime = new Date(ts);
    const now = new Date();
    const diffHours = (now - messageTime) / (1000 * 60 * 60);
    return diffHours <= 2;
  }, [ts]);

  // Check for mobile layout to trigger Action Bottom Sheet instead of dropdown
  const [isMobileMenu, setIsMobileMenu] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    setIsMobileMenu(media.matches);
    const handler = (e) => setIsMobileMenu(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // Close menu and reaction picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (activePicker === 'edge' && reactionPickerRef.current && !reactionPickerRef.current.contains(e.target)) {
        setActivePicker(null);
      }
      if (activePicker === 'bar' && menuRef.current && !menuRef.current.contains(e.target)) {
        setActivePicker(null);
      }
      // Close right-click context menu
      if (contextMenuPos && contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenuPos(null);
      }
      // Close mobile quick reaction
      if (showQuickReaction) {
        setShowQuickReaction(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenuPos, showQuickReaction, activePicker]);

  // Touch event handlers for mobile long press
  const handleTouchStart = useCallback((e) => {
    if (!isMobileMenu || isSelectMode) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };

    if (!isOwn) setShowReactionBar(true);

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = setTimeout(() => {
      if (navigator.vibrate) {
        navigator.vibrate(50); // Haptic feedback (50ms)
      }
      setShowQuickReaction(true);
      longPressTimerRef.current = null;
    }, 500);
  }, [isMobileMenu, isOwn]);

  const handleTouchMove = useCallback((e) => {
    if (!longPressTimerRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Clean up long press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Right-click handler (desktop only)
  const handleContextMenu = useCallback((e) => {
    if (isMobileMenu) return; // mobile uses long-press bottom sheet
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 196);
    const y = Math.min(e.clientY, window.innerHeight - 320);
    setContextMenuPos({ x, y });
    setMenuOpen(false); // close any open dropdown
  }, [isMobileMenu]);

  // Copy text handler
  const handleCopyText = useCallback(async () => {
    const text = message?.content || message?.original_content || '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    } catch {
      // fallback
    }
    setContextMenuPos(null);
    setMenuOpen(false);
  }, [message]);

  // Handle edit — delegates to parent input area, no inline editing
  const handleEditClick = useCallback(() => {
    setMenuOpen(false);
    if (onEditRequest) onEditRequest(message);
  }, [message, onEditRequest]);

  // Delete handler - supports delete for everyone or just me
  const handleDelete = useCallback(async (deleteType) => {
    if (!conversationId || !message.id) return;

    try {
      setDeleting(true);
      setDeleteError(null);

      await chatAPI.deleteMessage(conversationId, message.id, deleteType);

      if (setMessages) {
        if (deleteType === 'everyone') {
          // Mark as deleted for everyone - show "This message was deleted"
          setMessages((prev) =>
            prev.map((m) =>
              String(m.id) === String(message.id)
                ? { ...m, is_deleted: true, content: "This message was deleted" }
                : m
            )
          );
        } else {
          // Remove from local view only (delete for me)
          setMessages((prev) => prev.filter((m) => String(m.id) !== String(message.id)));
        }
      }

      setDeleteModalOpen(false);
      setMenuOpen(false);
    } catch (error) {
      console.error('Delete failed:', error);
      const errorMsg = error?.response?.data?.error || "Failed to delete message";
      setDeleteError(errorMsg);
    } finally {
      setDeleting(false);
    }
  }, [conversationId, message.id, setMessages]);

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
        onClick={(e) => {
          if (isSelectMode) {
            e.stopPropagation();
            onToggleSelect?.(message.id);
          }
        }}
        className={`group flex gap-1 px-1 py-0.5 relative ${Object.keys(reactionCounts).length > 0 ? 'mb-5' : 'mb-1'} ${isOwn ? "flex-row-reverse" : ""} ${isSelectMode ? "cursor-pointer select-none" : ""}`}
        onMouseEnter={() => !isOwn && setShowReactionBar(true)}
        onMouseLeave={() => { if (!reactionPickerOpen) setShowReactionBar(false); }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onContextMenu={handleContextMenu}
      >
        {/* Copy feedback toast */}
        {copyFeedback && (
          <div className={`absolute ${isOwn ? 'right-0' : 'left-0'} -top-8 z-[300] px-2.5 py-1 bg-zinc-700 text-white text-xs rounded-lg shadow-lg pointer-events-none animate-fade-in-up`}>
            ✓ Copied!
          </div>
        )}

        {/* Quick Reaction Bar (Mobile only) */}
        {isMobileMenu && showQuickReaction && (
          <div className={`absolute -top-12 ${isOwn ? 'right-2' : 'left-2'} z-[350] bg-zinc-900 border border-zinc-700/80 rounded-full px-2 py-1 flex items-center gap-1 shadow-2xl animate-fade-in-up`}>
            {["❤️", "😂", "😮", "😢", "😡", "👍"].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReact(emoji);
                  setShowQuickReaction(false);
                }}
                className="w-7 h-7 flex items-center justify-center text-base active:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickReaction(false);
                setMenuOpen(true);
              }}
              className="w-7 h-7 flex items-center justify-center text-zinc-400 font-bold active:scale-125 transition-transform border-l border-zinc-800 ml-0.5 pl-0.5"
            >
              ···
            </button>
          </div>
        )}
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

        <div className={`flex flex-col max-w-[85%] md:max-w-[65%] ${isOwn ? "items-end" : "items-start"}`}>
          {/* Sender name for group chats */}
          {!isOwn && showSenderName && senderName && (
            <span className="text-[11px] text-zinc-400 mb-0.5">{senderName}</span>
          )}

          <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
            {/* Checkbox for Multi-Select */}
            {(isSelectMode || (!isMobileMenu && variant !== "dock")) && (
              <button
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                aria-label={isSelected ? "Deselect message" : "Select message"}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect?.(message.id);
                }}
                className={`message-checkbox shrink-0 mb-2 flex items-center justify-center text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:outline-none ${
                  isSelectMode ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-90"
                } ${isSelected ? "selected" : ""}`}
                title={isSelected ? "Deselect message" : "Select message"}
              >
                {isSelected && <Check size={12} />}
              </button>
            )}
            {/* Message bubble */}
            <div
              className={`px-3 py-2 rounded-2xl text-sm relative ${isOwn
                  ? message.status === 'error'
                    ? "bg-red-950/60 border border-red-500/30 text-zinc-100"
                    : "bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
                  : "bg-zinc-800 text-zinc-100"
                }`}
            >
              {/* ── Reply Quote Preview ── */}
              {message?.reply_to && (
                <div className="reply-quote-bar mb-2">
                  <p className="text-[10px] font-semibold text-indigo-400 mb-0.5">
                    ↩ {message.reply_to?.sender?.firstName || message.reply_to?.sender_name || 'Message'}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {message.reply_to?.content || message.reply_to?.original_content || 'Attachment'}
                  </p>
                </div>
              )}

              {/* File/Image attachment */}
              {fileUrl && (
                <div className="mb-2">
                  {isImage ? (
                    <button
                      type="button"
                      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                      onClick={(e) => {
                        if (isSelectMode) {
                          e.stopPropagation();
                          onToggleSelect?.(message.id);
                        } else {
                          setViewerOpen(true);
                        }
                      }}
                      title={isSelectMode ? (isSelected ? "Deselect message" : "Select message") : "View"}
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
                        className="p-1.5 rounded-lg hover:bg-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        title={isSelectMode ? (isSelected ? "Deselect message" : "Select message") : "Open"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSelectMode) {
                            onToggleSelect?.(message.id);
                          } else {
                            onOpen();
                          }
                        }}
                      >
                        <ExternalLink size={16} />
                      </button>

                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        title={isSelectMode ? (isSelected ? "Deselect message" : "Select message") : "Download"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSelectMode) {
                            onToggleSelect?.(message.id);
                          } else {
                            onDownload();
                          }
                        }}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="relative min-w-[50px]">
                <div className="relative">
                  {!hideAutoFileText({
                    fileUrl,
                    isImage,
                    content: message.content || message.original_content,
                    fileName: message?.file_name,
                  }) && (
                    <span className="whitespace-pre-wrap break-words leading-relaxed">
                      {message.content || message.original_content}
                    </span>
                  )}

                  {/* ─── Dynamic Invisible Spacer ─── */}
                  <span className="inline-flex items-center gap-1.5 text-[9.5px] ml-3 opacity-0 select-none pointer-events-none">
                    {isPinned && <Pin size={9} />}
                    {isStarred && <Star size={9} />}
                    {message.is_edited && <span className="text-[9px] italic">edited</span>}
                    <span>{formatTime(ts)}</span>
                    {isOwn && (message.status === 'error' ? <span className="text-red-400 font-bold">!</span> : <ReadReceipt status={getMsgStatus(message)} size={11} />)}
                  </span>

                  {/* ─── Real Visible Metadata positioned absolute at bottom-right ─── */}
                  <span className={`absolute bottom-0 right-0 inline-flex items-center gap-1.5 text-[9.5px] select-none ${
                    isOwn ? (message.status === 'error' ? 'text-red-400' : 'text-indigo-200') : 'text-zinc-400'
                  }`}>
                    {isPinned && (
                      <span title="Pinned">
                        <Pin size={9} className="text-amber-400" />
                      </span>
                    )}
                    {isStarred && (
                      <span title="Starred">
                        <Star size={9} className="text-yellow-400 fill-yellow-400" />
                      </span>
                    )}
                    {message.is_edited && (
                      <span className="text-[9px] opacity-50 italic">edited</span>
                    )}
                    <span>{formatTime(ts)}</span>
                    {isOwn && (
                      message.status === 'error' ? (
                        <span className="text-red-400 font-bold font-sans" title="Failed to send">!</span>
                      ) : (
                        <ReadReceipt status={getMsgStatus(message)} size={11} />
                      )
                    )}
                  </span>
                </div>

                {/* Failed message retry banner */}
                {message.status === 'error' && onRetrySendMessage && (
                  <div className="mt-2 pt-1.5 border-t border-red-500/20 flex items-center justify-between gap-4 text-xs text-red-200 relative z-10">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      Failed to send
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRetrySendMessage?.(message);
                        }}
                        className="underline hover:text-white font-medium cursor-pointer"
                      >
                        Retry
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFailedMessage?.(message.id);
                        }}
                        className="hover:text-white opacity-80 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── Task pill card ─── */}
                {isTask && (
                  <div className={`mt-2 flex items-start gap-2 px-2.5 py-2 rounded-xl border ${
                    isOwn
                      ? 'bg-indigo-900/40 border-indigo-400/30'
                      : 'bg-emerald-900/30 border-emerald-500/30'
                  }`}>
                    <BookmarkCheck size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-emerald-400 leading-none mb-0.5">Saved as Task</p>
                      {message?.task_due_date && (
                        <p className="text-[10px] text-zinc-400 truncate">
                          Due: {new Date(message.task_due_date).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                        </p>
                      )}
                      {message?.task_note && (
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">{message.task_note}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ─── REACTION PILLS & TRIGGER (on bubble edge) ─── */}
              {(Object.keys(reactionCounts).length > 0 || conversationId) && (
                <div className={`absolute -bottom-3.5 ${isOwn ? 'right-4' : 'left-4'} flex flex-wrap items-center gap-1 z-20`}>
                  
                  {/* Reaction Pills */}
                  {Object.entries(reactionCounts).map(([emoji, data]) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleReact(emoji)}
                      title={data.hasReacted ? "Remove reaction" : `React with ${emoji}`}
                      className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border shadow-sm transition-all cursor-pointer ${
                        data.hasReacted
                          ? "bg-indigo-500 border-indigo-400 text-white"
                              : "bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                          }`}
                        >
                          <span>{emoji}</span>
                          {data.count > 1 && <span className="font-semibold ml-0.5">{data.count}</span>}
                        </button>
                      ))}

                      {/* Reaction Trigger Button — only shown on hover or when picker is open */}
                      {conversationId && (
                        <div className="relative" ref={reactionPickerRef}>
                          <button
                            type="button"
                            onClick={() => setActivePicker(activePicker === 'edge' ? null : 'edge')}
                            className={`flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 border border-zinc-600 hover:border-indigo-400 hover:bg-zinc-700 text-zinc-400 hover:text-indigo-300 transition-all shadow-sm ${activePicker === 'edge' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                            title="Add reaction"
                          >
                            <SmilePlus size={13} />
                          </button>
                          
                          {activePicker === 'edge' && (
                            <div className="absolute top-full left-0 mt-2 p-2 bg-zinc-800 rounded-xl shadow-2xl border border-zinc-700 z-[200] w-64 max-h-72 overflow-y-auto custom-workspace-scrollbar">
                              <div className="grid grid-cols-5 gap-2">
                                {FULL_REACTIONS.map(emoji => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => handleReact(emoji)}
                                    className="w-8 h-8 flex items-center justify-center text-xl hover:bg-zinc-700 rounded-full transition-transform hover:scale-110 active:scale-95"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
            </div>

            {/* Actions — hover quick bar (desktop) or 3-dot fallback (mobile) */}
            {conversationId && !isSelectMode && (
              <div className="relative" ref={menuRef}>
                {/* Desktop: Reply + Emoji quick buttons (replace 3-dot) */}
                {!isMobileMenu && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Reply button */}
                    <button
                      type="button"
                      onClick={() => { onReplyRequest?.(message); }}
                      className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-indigo-300 transition-colors"
                      title="Reply"
                    >
                      <CornerUpLeft size={15} />
                    </button>
                    {/* Emoji reaction button */}
                    <button
                      type="button"
                      onClick={() => setActivePicker(activePicker === 'bar' ? null : 'bar')}
                      className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-indigo-300 transition-colors"
                      title="React"
                    >
                      <SmilePlus size={15} />
                    </button>
                  </div>
                )}

                {/* Mobile: keep 3-dot button as fallback */}
                {isMobileMenu && (
                  <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="More"
                  >
                    <MoreVertical size={16} />
                  </button>
                )}

                {/* Desktop emoji picker (now triggered from hover bar) */}
                {!isMobileMenu && activePicker === 'bar' && (
                  <div className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-2 p-2 bg-zinc-800 rounded-xl shadow-2xl border border-zinc-700 z-[200] w-64 max-h-72 overflow-y-auto custom-workspace-scrollbar`}>
                    <div className="grid grid-cols-5 gap-2">
                      {FULL_REACTIONS.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleReact(emoji)}
                          className="w-8 h-8 flex items-center justify-center text-xl hover:bg-zinc-700 rounded-full transition-transform hover:scale-110 active:scale-95"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legacy desktop dropdown — now never shown (replaced by right-click) */}
                {false && !isMobileMenu && menuOpen && (
                  <div className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-1 w-44 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 z-50`}>
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
                            onClick={() => { setDeleteModalOpen(true); setMenuOpen(false); }}
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
                )}

                {/* Mobile Actions Bottom Sheet Drawer */}
                {isMobileMenu && menuOpen && (
                  <div 
                    className="fixed inset-0 bg-black/60 z-[9990] backdrop-blur-[2px] flex items-end justify-center" 
                    onClick={() => setMenuOpen(false)}
                  >
                    <div 
                      className="w-full bg-zinc-900 border-t border-zinc-800 rounded-t-[28px] z-[9991] px-4 pt-3 pb-8 flex flex-col gap-1 text-zinc-100 shadow-2xl max-w-md mx-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Drag handle */}
                      <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-4" />
                      
                      {/* Snippet Header */}
                      <div className="px-3 pb-3 border-b border-zinc-800/80 mb-2 text-xs text-zinc-400 truncate font-semibold">
                        {message.content || message.original_content || "Attachment"}
                      </div>

                      {/* Reply — mobile bottom sheet */}
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); onReplyRequest?.(message); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-base text-left hover:bg-zinc-800 active:bg-zinc-800 rounded-xl transition-all font-medium"
                      >
                        <CornerUpLeft size={16} className="text-zinc-400" />
                        <span>Reply</span>
                      </button>

                      {/* Copy Text — mobile bottom sheet */}
                      {(message.content || message.original_content) && (
                        <button
                          type="button"
                          onClick={handleCopyText}
                          className="w-full flex items-center gap-3 px-4 py-3.5 text-base text-left hover:bg-zinc-800 active:bg-zinc-800 rounded-xl transition-all font-medium"
                        >
                          <Copy size={16} className="text-zinc-400" />
                          <span>{copyFeedback ? '✓ Copied!' : 'Copy Text'}</span>
                        </button>
                      )}

                      {/* Select Message — mobile bottom sheet */}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onStartSelectMode?.();
                          onToggleSelect?.(message.id);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-base text-left hover:bg-zinc-800 active:bg-zinc-800 rounded-xl transition-all font-medium"
                      >
                        <CheckSquare size={16} className="text-zinc-400" />
                        <span>Select Message</span>
                      </button>

                      {/* Star */}
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); handleStar(); }}
                        disabled={starLoading}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-base text-left hover:bg-zinc-800 active:bg-zinc-800 rounded-xl transition-all disabled:opacity-50 font-medium"
                      >
                        <Star size={16} className={isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-400'} />
                        <span>{isStarred ? 'Unstar Message' : 'Star Message'}</span>
                      </button>

                      {/* Pin */}
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); handlePin(); }}
                        disabled={pinLoading}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-base text-left hover:bg-zinc-800 active:bg-zinc-800 rounded-xl transition-all disabled:opacity-50 font-medium"
                      >
                        <Pin size={16} className={isPinned ? 'text-amber-400' : 'text-zinc-400'} />
                        <span>{isPinned ? 'Unpin Message' : 'Pin Message'}</span>
                      </button>

                      {/* Task */}
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); isTask ? handleSaveTask(null, null) : setTaskModalOpen(true); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-base text-left hover:bg-zinc-800 active:bg-zinc-800 rounded-xl transition-all font-medium"
                      >
                        {isTask ? <BookmarkCheck size={16} className="text-emerald-400" /> : <ListTodo size={16} className="text-zinc-400" />}
                        <span>{isTask ? 'Remove Task' : 'Add to Tasks'}</span>
                      </button>

                      {/* Edit / Delete — own messages only */}
                      {isOwn && (
                        <>
                          <div className="border-t border-zinc-800 my-1.5" />
                          <button
                            type="button"
                            onClick={handleEditClick}
                            disabled={deleting}
                            className="w-full flex items-center gap-3 px-4 py-3.5 text-base text-left hover:bg-zinc-800 active:bg-zinc-800 rounded-xl transition-all disabled:opacity-50 font-medium"
                          >
                            <Edit2 size={16} className="text-zinc-400" />
                            <span>Edit Message</span>
                          </button>
                          
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => { setDeleteModalOpen(true); setMenuOpen(false); }}
                              disabled={deleting}
                              className="w-full flex items-center gap-3 px-4 py-3.5 text-base text-left text-red-400 hover:bg-red-500/10 active:bg-red-500/10 rounded-xl transition-all disabled:opacity-50 font-medium"
                            >
                              <Trash2 size={16} />
                              <span>Delete Message</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>




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
                {canDeleteForEveryone && (
                  <button
                    type="button"
                    onClick={() => handleDelete('everyone')}
                    disabled={deleting}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? "Deleting..." : "Delete for everyone"}
                  </button>
                )}

                {/* Delete Message - always available */}
                <button
                  type="button"
                  onClick={() => handleDelete('me')}
                  disabled={deleting}
                  className="w-full px-4 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-zinc-200 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? "Deleting..." : "Delete Message"}
                </button>

                {/* Info text if can't delete for everyone */}
                {!canDeleteForEveryone && (
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

      {/* ─── Right-click Context Menu (Desktop only, fixed-position) ─── */}
      {contextMenuPos && (
        <div
          ref={contextMenuRef}
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
          className="fixed z-[9999] w-48 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1 chat-context-menu"
        >
          {/* Reply */}
          <button
            type="button"
            onClick={() => { setContextMenuPos(null); onReplyRequest?.(message); }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-zinc-800 rounded-lg transition-colors text-zinc-200"
          >
            <CornerUpLeft size={14} className="text-zinc-400" /> Reply
          </button>

          {/* Copy Text */}
          {(message.content || message.original_content) && (
            <button
              type="button"
              onClick={handleCopyText}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-zinc-800 rounded-lg transition-colors text-zinc-200"
            >
              <Copy size={14} className="text-zinc-400" /> Copy Text
            </button>
          )}

          {/* Emoji Reaction */}
          <button
            type="button"
            onClick={() => { setContextMenuPos(null); setActivePicker('edge'); }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-zinc-800 rounded-lg transition-colors text-zinc-200"
          >
            <SmilePlus size={14} className="text-zinc-400" /> Add Reaction
          </button>

          {/* Select Message */}
          <button
            type="button"
            onClick={() => {
              setContextMenuPos(null);
              onStartSelectMode?.();
              onToggleSelect?.(message.id);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-zinc-800 rounded-lg transition-colors text-zinc-200"
          >
            <CheckSquare size={14} className="text-zinc-400" /> Select Message
          </button>

          <div className="border-t border-zinc-700/60 my-1" />

          {/* Star */}
          <button
            type="button"
            onClick={() => { setContextMenuPos(null); handleStar(); }}
            disabled={starLoading}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-zinc-800 rounded-lg transition-colors text-zinc-200 disabled:opacity-50"
          >
            <Star size={14} className={isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-400'} />
            {isStarred ? 'Unstar' : 'Star'}
          </button>

          {/* Pin */}
          <button
            type="button"
            onClick={() => { setContextMenuPos(null); handlePin(); }}
            disabled={pinLoading}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-zinc-800 rounded-lg transition-colors text-zinc-200 disabled:opacity-50"
          >
            <Pin size={14} className={isPinned ? 'text-amber-400' : 'text-zinc-400'} />
            {isPinned ? 'Unpin' : 'Pin'}
          </button>

          {/* Add to Task */}
          <button
            type="button"
            onClick={() => { setContextMenuPos(null); isTask ? handleSaveTask(null, null) : setTaskModalOpen(true); }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-zinc-800 rounded-lg transition-colors text-zinc-200"
          >
            {isTask ? <BookmarkCheck size={14} className="text-emerald-400" /> : <ListTodo size={14} className="text-zinc-400" />}
            {isTask ? 'Remove Task' : 'Add to Tasks'}
          </button>

          {/* Edit / Delete — own only */}
          {isOwn && (
            <>
              <div className="border-t border-zinc-700/60 my-1" />
              <button
                type="button"
                onClick={() => { setContextMenuPos(null); handleEditClick(); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-zinc-800 rounded-lg transition-colors text-zinc-200"
              >
                <Edit2 size={14} className="text-zinc-400" /> Edit
              </button>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => { setContextMenuPos(null); setDeleteModalOpen(true); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

const areReactionsEqual = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ra = a[i];
    const rb = b[i];
    if (
      (ra.emoji || ra.reaction) !== (rb.emoji || rb.reaction) ||
      String(ra.user_id || ra.userId) !== String(rb.user_id || rb.userId)
    ) {
      return false;
    }
  }
  return true;
};

const MemoizedMessageBubble = React.memo(MessageBubble, (prevProps, nextProps) => {
  return (
    prevProps.isOwn === nextProps.isOwn &&
    prevProps.showAvatar === nextProps.showAvatar &&
    prevProps.showSenderName === nextProps.showSenderName &&
    prevProps.conversationId === nextProps.conversationId &&
    prevProps.conversationType === nextProps.conversationType &&
    prevProps.currentUserId === nextProps.currentUserId &&
    prevProps.variant === nextProps.variant &&
    prevProps.isSelectMode === nextProps.isSelectMode &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.is_deleted === nextProps.message.is_deleted &&
    prevProps.message.is_edited === nextProps.message.is_edited &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.message.delivery_status === nextProps.message.delivery_status &&
    prevProps.message.read_at === nextProps.message.read_at &&
    prevProps.message.is_starred === nextProps.message.is_starred &&
    prevProps.message.is_pinned === nextProps.message.is_pinned &&
    prevProps.message.is_task === nextProps.message.is_task &&
    areReactionsEqual(prevProps.message.reactions, nextProps.message.reactions)
  );
});

export default MemoizedMessageBubble;
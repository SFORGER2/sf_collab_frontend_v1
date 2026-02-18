/**
 * MessageBubble Component - Fixed Version
 * 
 * FIXES:
 * 1. Profile pictures now display correctly using getProfilePicture utility
 * 2. Better sender name extraction
 * 3. Consistent avatar display
 */

import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { X, Download, FileText, ExternalLink, Check, CheckCheck, Eye, MoreVertical, Edit2, Trash2 } from "lucide-react";
import Avatar from "./Avatar";
import { getProfilePicture } from "@/utils/getProfilePicture";
import { chatAPI } from "@/utils/APIs/chatApi";

// Helper to reduce text length
const reduceText = (text, maxLength = 20) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Files are typically served from the backend host (often NOT /api)
const FILE_BASE_URL =
  import.meta.env.VITE_SOCKET_API_URL ||
  (import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, "")
    : "http://localhost:5001");

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
    let hint = "";
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const j = await res.json();
        hint = j?.message ? ` (${j.message})` : "";
      }
    } catch {
      // ignore
    }
    throw new Error(`Download failed (${res.status})${hint}`);
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

  // opened/read
  if (s === "read" || s === "seen" || msg?.read_at || msg?.seen_at) return "opened";

  // delivered
  if (s === "delivered" || msg?.delivered_at) return "delivered";

  // default: sent (exists on server)
  return "sent";
}

export default function MessageBubble({ 
  message, 
  isOwn, 
  showAvatar, 
  showSenderName = false,
  setMessages = null,
  onMessageUpdated = null,
  conversationId = null 
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingEditing, setIsLoadingEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);

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

  // Handle edit
  const handleEditClick = useCallback(() => {
    console.log("[MessageBubble] handleEditClick triggered");
    console.log("[MessageBubble] message.content:", message.content);
    console.log("[MessageBubble] message.original_content:", message.original_content);
    
    const contentToEdit = message.content || message.original_content || "";
    console.log("[MessageBubble] contentToEdit:", contentToEdit);
    
    setEditContent(contentToEdit);
    setIsEditing(true);
    setMenuOpen(false);
    console.log("[MessageBubble] Edit mode enabled");
  }, [message.content, message.original_content]);

  const handleSaveEdit = useCallback(async () => {
    console.log("[MessageBubble] handleSaveEdit triggered");
    console.log("[MessageBubble] editContent:", editContent);
    console.log("[MessageBubble] editContent.trim():", editContent.trim());
    console.log("[MessageBubble] conversationId:", conversationId);
    console.log("[MessageBubble] message.id:", message.id);
    
    if (!editContent.trim() || !conversationId) {
      console.warn("[MessageBubble] Validation failed - empty content or missing conversationId");
      return;
    }

    try {
      console.log("[MessageBubble] Calling chatAPI.editMessage");
      setIsLoadingEditing(true);
      await chatAPI.editMessage(conversationId, message.id, editContent.trim());
      console.log("[MessageBubble] Edit API call successful");
      if (setMessages) {

        const updatedMessage = {
          ...message,
          original_content: editContent.trim(),
          content: editContent.trim(),
          is_edited: true,
          edited_at: new Date().toISOString()
        };
        console.log("[MessageBubble] Calling onMessageUpdated with:", updatedMessage);
        setMessages((msgs) => msgs.map((m) => (m.id === message.id ? updatedMessage : m)));
      }
      
      setIsEditing(false);
      console.log("[MessageBubble] Edit mode disabled");
    } catch (error) {
      console.error("[MessageBubble] Failed to edit message:", error);
    } finally {
      setIsLoadingEditing(false);
    }
  }, [editContent, conversationId, message, onMessageUpdated]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent("");
  }, []);

  // Handle delete
  const handleDeleteClick = useCallback(async () => {
    
    if (!conversationId) return;

    setDeleting(true);
    try {
      await chatAPI.deleteMessage(conversationId, message.id);
      
      if (setMessages) {
        setMessages((msgs) => msgs.map((m) => 
          m.id === message.id ? { ...m, is_deleted: true } : m
        ));
      }
      
      setMenuOpen(false);
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setDeleting(false);
    }
  }, [conversationId, message, onMessageUpdated]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  const onDownload = useCallback(async () => {
    if (!fileUrl) return;
    await forceDownload(fileUrl, message?.file_name || "file", token);
  }, [fileUrl, message?.file_name, token]);

  const onOpen = useCallback(async () => {
    if (!fileUrl) return;
    await openInNewTab(fileUrl, token);
  }, [fileUrl, token]);

  // System message
  if (message.message_type === "system") {
    return (
      <div className="flex justify-center my-3">
        <div className="px-3 py-1.5 bg-zinc-800/50 rounded-full text-zinc-500 text-xs">
          {message.content || message.original_content}
        </div>
      </div>
    );
  }
    // Early return for deleted messages
  if (message?.is_deleted) {
    return (
      <div className={`group flex gap-1 px-1 py-0.5 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
        <div className="w-8 shrink-0" />
        <div className={`flex flex-col max-w-[65%] ${isOwn ? "items-end" : "items-start"}`}>
          <div className={`px-3 py-2 rounded-2xl text-sm italic ${
            isOwn 
              ? "bg-gradient-to-r from-indigo-500/30 to-blue-500/30 text-white/50" 
              : "bg-zinc-800/50 text-zinc-500"
          }`}>
            This message was deleted
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      {/* Image Viewer Modal */}
      {viewerOpen && isImage && (
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

            <img
              src={fileUrl}
              alt={message?.file_name || "image"}
              className="max-w-full max-h-full object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <div className={`group flex gap-1 px-1 py-0.5 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
        {/* Avatar column */}
        <div
          onClick={() => {
                if (!message?.sender?.id) return;
                navigate(`/user-profile?id=${message.sender.id}`);
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
              className={`px-3 py-2 rounded-2xl text-sm relative ${
                isOwn 
                  ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white" 
                  : "bg-zinc-800 text-zinc-100"
              }`}
            >
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
                        className="max-w-full rounded-lg max-h-48 object-cover hover:opacity-90"
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
                            <div className="flex gap-1 justify-center align-bottom">
                            <div>
                              {!hideAutoFileText({
                              fileUrl,
                              isImage,
                              content: message.content || message.original_content,
                              fileName: message?.file_name,
                              }) && (message.content || message.original_content)}
                              
                              {message.is_edited && <span className="text-xs opacity-60 ml-1">(edited)</span>}
                            </div>
                            
                            <span className="text-[0.6rem] text-gray-300 transition-opacity flex justify-end items-end-safe gap-1">
                              {formatTime(ts)}

                              {isOwn && (() => {
                              const st = getMsgStatus(message);
                              if (st === "opened") return <Eye size={14} className="opacity-80" />;
                              if (st === "delivered") return <CheckCheck size={14} className="opacity-80" />;
                              return <Check size={14} className="opacity-80" />;
                              })()}
                            </span>
                            </div>
                          </>
                          )}
                        </div>

                        {/* Actions menu */}
            {isOwn && conversationId && !isEditing && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 opacity-0 md:group-hover:opacity-100 transition-opacity"
                  title="More"
                >
                  <MoreVertical size={16} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 -top-20 mt-1 w-32 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 z-50">
                    <button
                      type="button"
                      onClick={handleEditClick}
                      disabled={deleting}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-zinc-700 rounded-t-lg disabled:opacity-50"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletePopupOpen(true)}
                      disabled={deleting}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-red-400 hover:bg-red-500/20 rounded-b-lg disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
      {/* Delete Confirmation Popup */}
      {deletePopupOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
          <div className="bg-zinc-900 p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4 text-white">Confirm Deletion</h3>
            <p className="mb-6 text-zinc-300">Are you sure you want to delete this message?</p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setDeletePopupOpen(false)}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-200"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
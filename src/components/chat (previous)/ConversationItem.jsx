import React, { useMemo, useState } from "react";
import { Trash2, Archive, ArchiveRestore, Pin, PinOff } from "lucide-react";
import Avatar from "./Avatar";
import { getProfilePicture } from "@/utils/getProfilePicture";
import { chatAPI } from "@/utils/APIs/chatApi";
import { plotCount } from "@/utils/plotCount";
import { resolveUserId } from "@/utils/resolveUserId";

const toMs = (ts) => {
  if (!ts) return null;
  if (typeof ts === "number") return ts;
  const n = Number(ts);
  if (!Number.isNaN(n)) return n;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
};

const ConversationItem = ({
  conversation,
  isActive,
  onClick,
  onlineUsers,
  currentUserId,
  lastActiveAt = {},
  lastSeenAt = {},
  nowTs = Date.now(),
  onDelete,
  draftText = "", // NEW: draft preview shown in conversation list
  onArchive,    // archive callback (undefined on archived tab)
  onUnarchive,  // unarchive callback (undefined on non-archived tab)
  onPin,        // pin callback
  onUnpin,      // unpin callback
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isDirect = conversation.conversation_type === "direct";

  const otherParticipant = isDirect
    ? conversation.participants?.find((p) => {
        const participantId = String(resolveUserId(p) ?? "");
        const meId = String(currentUserId ?? "");
        return participantId && participantId !== meId;
      })
    : null;

  const otherId = resolveUserId(otherParticipant)
    ? String(resolveUserId(otherParticipant))
    : null;

  const connected = otherId 
    ? (onlineUsers || []).map(String).includes(otherId) 
    : false;

  const lastActiveTs = useMemo(() => (otherId ? toMs(lastActiveAt?.[otherId]) : null), [otherId, lastActiveAt]);
  
  const lastSeenTs = useMemo(() => {
    return otherId
      ? toMs(
          lastSeenAt?.[otherId] ??
          otherParticipant?.last_seen ??
          otherParticipant?.lastSeen ??
          otherParticipant?.last_login ??
          otherParticipant?.lastLogin
        )
      : null;
  }, [otherId, lastSeenAt, otherParticipant]);

  const diffMs = (ts) => (ts ? Math.max(0, nowTs - ts) : null);

  const presenceStatus = useMemo(() => {
    if (isDirect && otherId) {
      if (connected) {
        // Connected = NEVER offline. Only Online or Away.
        const d = diffMs(lastActiveTs);
        if (d == null || d < 5 * 60 * 1000) return "online";
        return "idle"; // connected but inactive 5+ min = Away
      }
      // Disconnected = offline
    }
    return "offline";
  }, [isDirect, otherId, connected, lastActiveTs, nowTs]);

  const conversationName = useMemo(() => {
    return isDirect
      ? `${otherParticipant?.firstName || otherParticipant?.first_name || ""} ${
          otherParticipant?.lastName || otherParticipant?.last_name || ""
        }`.trim() || "User"
      : conversation.name || "Group Chat";
  }, [isDirect, otherParticipant, conversation]);

  const avatarUrl = useMemo(() => {
    return getProfilePicture(isDirect ? otherParticipant : conversation);
  }, [isDirect, otherParticipant, conversation]);

  const lastMessage = useMemo(() => {
    // Show draft preview if user has a saved draft for this conversation
    if (draftText && draftText.trim()) {
      return null; // handled in JSX to allow styled "Draft:" prefix
    }
    if (conversation.last_message?.is_deleted) {
      return "This message was deleted";
    }
    return conversation.last_message?.content || "No messages yet";
  }, [conversation, draftText]);

  const lastTime = useMemo(() => {
    return conversation.last_message?.created_at
      ? new Date(conversation.last_message.created_at).toLocaleTimeString([], { 
          hour: "2-digit", 
          minute: "2-digit" 
        })
      : "";
  }, [conversation]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await chatAPI.deleteConversation(conversation.id);
      
      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete(conversation.id);
      }
      
      // Emit event for ChatDock to sync
      window.dispatchEvent(new CustomEvent("chat:conversationDeleted", { 
        detail: { conversationId: conversation.id } 
      }));
      
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      alert("Failed to delete conversation");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="relative group">
        <button
          type="button"
          onClick={onClick}
          className={`w-full flex items-center gap-3 p-3 pr-10 rounded-xl transition-colors ${
            isActive ? "bg-zinc-800/70" : "hover:bg-zinc-800/40"
          }`}
        >
          <Avatar
            isOnline={connected}
            src={avatarUrl}
            name={conversationName}
            size="md"
            presenceStatus={presenceStatus}
            showStatus={isDirect}
          />
          
          <div className="flex-1 min-w-0 text-left overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center justify-between gap-1.5 min-w-0 w-full">
                <p className="text-sm font-semibold text-white truncate flex-1 min-w-0">{conversationName}</p>
                {conversation.is_pinned && (
                  <Pin size={10} className="text-indigo-400 shrink-0 rotate-45" title="Pinned" />
                )}
              </div>
              <span className="text-xs text-zinc-500 shrink-0 group-hover:opacity-0 transition-opacity">{lastTime}</span>
            </div>

            <div className="flex items-center justify-between gap-2 mt-0.5">
              {draftText && draftText.trim() ? (
                <p className="text-xs truncate">
                  <span className="text-amber-400 font-medium">Draft: </span>
                  <span className="text-zinc-500">{draftText.trim().slice(0, 35)}{draftText.trim().length > 35 ? "..." : ""}</span>
                </p>
              ) : (
                <p className="text-xs text-zinc-500 truncate">{lastMessage}</p>
              )}

              {conversation.unread_count > 0 && (
                <span className="ml-2 w-5 h-5 flex items-center justify-center bg-indigo-500 text-zinc-900 text-[10px] font-bold rounded-full shrink-0">
                  {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Action buttons: appear on hover, sit where the time text is */}
        <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto">
          {/* Unarchive button — shown only on archived tab */}
          {onUnarchive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUnarchive(conversation.id);
              }}
              className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-zinc-600 hover:text-indigo-400 transition-all"
              title="Unarchive conversation"
            >
              <ArchiveRestore size={14} />
            </button>
          )}

          {/* Pin / Unpin button */}
          {onPin && !conversation.is_pinned && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onPin(conversation.id); }}
              className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-zinc-600 hover:text-indigo-400 transition-all"
              title="Pin conversation"
            >
              <Pin size={14} />
            </button>
          )}
          {onUnpin && conversation.is_pinned && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onUnpin(conversation.id); }}
              className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-all"
              title="Unpin conversation"
            >
              <PinOff size={14} />
            </button>
          )}

          {/* Archive button — shown on all non-archived tabs */}
          {onArchive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(conversation.id);
              }}
              className="p-1.5 rounded-lg hover:bg-amber-500/20 text-zinc-600 hover:text-amber-400 transition-all"
              title="Archive conversation"
            >
              <Archive size={14} />
            </button>
          )}

          {/* Delete button — only for direct chats, only when not on archived tab */}
          {isDirect && !onUnarchive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-600 hover:text-red-400 transition-all"
              title="Delete conversation"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4" 
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-800" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <h3 className="text-lg font-semibold text-white mb-2">Delete Conversation</h3>
              <p className="text-zinc-400 text-sm mb-5">
                Are you sure you want to delete your conversation with "{conversationName}"? 
                This will remove it from your chat list.
              </p>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-200 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConversationItem;
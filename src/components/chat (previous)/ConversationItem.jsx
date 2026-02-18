import React, { useMemo } from "react";
import Avatar from "./Avatar";
import { getProfilePicture } from "@/utils/getProfilePicture";
import { plotCount } from "@/utils/plotCount";

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
}) => {
  const isDirect = conversation.conversation_type === "direct";

  const otherParticipant = isDirect
    ? conversation.participants?.find((p) => String(p.id) !== String(currentUserId))
    : null;

  const otherId = otherParticipant?.id ? String(otherParticipant.id) : null;

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
        const d = diffMs(lastActiveTs);
        if (d == null || d < 5 * 60 * 1000) return "online";
        else if (d < 6 * 60 * 1000) return "idle";
      }
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
    if (conversation.last_message?.is_deleted) {
      return "This message was deleted";
    }
    return conversation.last_message?.content || "No messages yet";
  }, [conversation]);

  const lastTime = useMemo(() => {
    return conversation.last_message?.created_at
      ? new Date(conversation.last_message.created_at).toLocaleTimeString([], { 
          hour: "2-digit", 
          minute: "2-digit" 
        })
      : "";
  }, [conversation]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
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
      
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-white truncate">{conversationName}</p>
          <span className="text-xs text-zinc-500 shrink-0">{lastTime}</span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-zinc-500 truncate">{lastMessage}</p>

          {conversation.unread_count > 0 && (
            <span className="ml-2 w-5 h-5 flex items-center justify-center bg-indigo-500 text-zinc-900 text-[10px] font-bold rounded-full shrink-0">
              {plotCount(conversation.unread_count)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ConversationItem;

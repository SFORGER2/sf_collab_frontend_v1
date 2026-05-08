/**
 * ChatHeader.jsx
 * Presence now comes from useUserPresence() in SocketProvider —
 * the single source of truth. No prop drilling needed.
 */

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { getProfilePicture } from "@/utils/getProfilePicture";
import { ArrowLeft, LogOut, MoreVertical, Users, X as XIcon } from "lucide-react";
import { chatAPI } from "@/utils/APIs/chatApi";
import { resolveUserId } from "@/utils/resolveUserId";
import { useUserPresence } from "@/context/SocketProvider";

const ChatHeader = ({
  conversation,
  currentUserId,
  onAvatarClick,
  setSidebarOpen = () => {},
  isMobile,
  onLeaveGroup = null,
}) => {
  const [menuOpen,        setMenuOpen]        = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [leaveModalOpen,  setLeaveModalOpen]  = useState(false);
  const [isLeaving,       setIsLeaving]       = useState(false);
  const [leaveError,      setLeaveError]      = useState(null);
  const [membersOpen,     setMembersOpen]     = useState(false);
  const navigate   = useNavigate();
  const menuRef    = useRef(null);
  const optionsRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current    && !menuRef.current.contains(e.target))    setMenuOpen(false);
      if (optionsRef.current && !optionsRef.current.contains(e.target)) setOptionsMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!conversation) return null;

  const otherParticipant =
    conversation.conversation_type === "direct"
      ? conversation.participants?.find((p) => {
          const participantId = String(resolveUserId(p) ?? "");
          const meId = String(currentUserId ?? "");
          return participantId && participantId !== meId;
        })
      : null;

  const { status: presenceStatus, statusText } = useUserPresence(
    otherParticipant?.id ?? 0
  );

  const displayName =
    conversation.name ||
    (otherParticipant
      ? `${otherParticipant.firstName || otherParticipant.first_name || ""} ${otherParticipant.lastName || otherParticipant.last_name || ""}`.trim()
      : "Chat");

  const statusColor =
    presenceStatus === "typing"  ? "text-indigo-400"  :
    presenceStatus === "online"  ? "text-emerald-500" :
    presenceStatus === "idle"    ? "text-yellow-400"  : "text-zinc-500";

  const handleMenuToggle  = () => { if (!onAvatarClick) return; setMenuOpen(v => !v); };
  const handleViewProfile = () => { setMenuOpen(false); onAvatarClick?.(); };

  const handleLeaveGroup = async () => {
    if (!conversation?.id) return;
    try {
      setIsLeaving(true);
      setLeaveError(null);
      await chatAPI.leaveConversation(conversation.id);
      setLeaveModalOpen(false);
      onLeaveGroup?.(conversation.id);
      window.dispatchEvent(new CustomEvent("chat:conversationLeft", {
        detail: { conversationId: conversation.id },
      }));
      window.location.href = "/chat";
    } catch (error) {
      console.error("Failed to leave group:", error);
      setLeaveError(error?.response?.data?.error || "Failed to leave group. Please try again.");
    } finally {
      setIsLeaving(false);
    }
  };

  const isGroupChat   = conversation.conversation_type === "group";
  const isGeneralChat = conversation.conversation_type === "general";

  return (
    <>
      <div className="h-16 px-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center" ref={menuRef}>
            {isMobile && (
              <button type="button" onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                title="Toggle sidebar">
                <ArrowLeft size={30} />
              </button>
            )}

            <button type="button" onClick={handleMenuToggle} disabled={!onAvatarClick}
              className={`rounded-full ${onAvatarClick ? "cursor-pointer" : "cursor-default"}`}
              aria-label="Open profile menu">
              <Avatar
                src={getProfilePicture(otherParticipant)}
                name={displayName}
                size="md"
                presenceStatus={presenceStatus}
                showStatus={conversation.conversation_type === "direct"}
              />
            </button>

            {menuOpen && (
              <div className="absolute left-0 top-12 z-50 w-44 rounded-xl border border-zinc-700/60 bg-zinc-900/95 shadow-xl backdrop-blur">
                <button type="button"
                  className="w-full text-left px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-800/70 rounded-xl"
                  onClick={handleViewProfile}>
                  View profile
                </button>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold text-white text-sm truncate">{displayName}</h2>

            {conversation.conversation_type === "direct" && (
              <p className={`text-xs ${statusColor}`}>{statusText}</p>
            )}

            {(isGroupChat || isGeneralChat) && (() => {
              const parts  = conversation.participants || [];
              const others = parts.filter(p => String(p.id) !== String(currentUserId));
              const MAX    = 3;
              const shown  = others.slice(0, MAX).map(p => p.firstName || p.first_name || "").filter(Boolean).join(", ");
              const extra  = others.length - MAX;
              const label  = shown
                ? (extra > 0 ? `${shown} +${extra} others` : shown)
                : `${parts.length} members`;
              return (
                <button type="button" onClick={() => setMembersOpen(v => !v)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-left truncate max-w-[200px] block">
                  {label}
                </button>
              );
            })()}
          </div>
        </div>

        {isGroupChat && !isGeneralChat && (
          <div className="relative" ref={optionsRef}>
            <button type="button" onClick={() => setOptionsMenuOpen(!optionsMenuOpen)}
              className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
              title="Options">
              <MoreVertical size={20} />
            </button>
            {optionsMenuOpen && (
              <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-zinc-700/60 bg-zinc-900/95 shadow-xl backdrop-blur overflow-hidden">
                <button type="button"
                  onClick={() => { setOptionsMenuOpen(false); setMembersOpen(v => !v); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800/70 transition-colors">
                  <Users size={16} />
                  Members ({conversation.participants?.length || 0})
                </button>
                <button type="button"
                  onClick={() => { setOptionsMenuOpen(false); setLeaveModalOpen(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/20 transition-colors">
                  <LogOut size={16} />
                  Leave Group
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {membersOpen && (isGroupChat || isGeneralChat) && (
        <div className="border-b border-zinc-800 bg-zinc-900/98 px-4 py-3 max-h-64 overflow-y-auto shadow-lg">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Members · {conversation.participants?.length || 0}
            </span>
            <button type="button" onClick={() => setMembersOpen(false)}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors">
              <XIcon size={14} />
            </button>
          </div>
          <div className="space-y-0.5">
            {(conversation.participants || []).map((p) => {
              const name      = `${p.firstName || p.first_name || ""} ${p.lastName || p.last_name || ""}`.trim() || "Unknown";
              const initials  = name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2);
              const isCreator = conversation.creator_id && String(p.id) === String(conversation.creator_id);
              const isMe      = String(p.id) === String(currentUserId);
              const pic       = getProfilePicture(p);
              return (
                <button
                  key={resolveUserId(p) ?? p.id}
                  type="button"
                  onClick={() => {
                    const targetId = resolveUserId(p);
                    if (!isMe && targetId) navigate(`/user-profile?userId=${targetId}`);
                  }}
                  className={`w-full flex items-center gap-2.5 px-1 py-1.5 rounded-lg transition-colors text-left ${
                    isMe ? "cursor-default hover:bg-zinc-800/30" : "hover:bg-zinc-800/60 cursor-pointer"
                  }`}>
                  {pic ? (
                    <img src={pic} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-zinc-700" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {initials}
                    </div>
                  )}
                  <span className="text-sm text-zinc-200 truncate flex-1">{name}{isMe ? " (You)" : ""}</span>
                  {isCreator && <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full shrink-0">Admin</span>}
                  {!isMe && <span className="text-[10px] text-zinc-600 shrink-0">→</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {leaveModalOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4"
          onClick={() => !isLeaving && setLeaveModalOpen(false)}>
          <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-800 overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <h3 className="text-lg font-semibold text-white mb-2">Leave Group</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Are you sure you want to leave "{displayName}"? You won't be able to see messages or participate anymore.
              </p>
              {leaveError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {leaveError}
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setLeaveModalOpen(false)} disabled={isLeaving}
                  className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-200 font-medium transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="button" onClick={handleLeaveGroup} disabled={isLeaving}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium transition-colors disabled:opacity-50">
                  {isLeaving ? "Leaving..." : "Leave"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatHeader;
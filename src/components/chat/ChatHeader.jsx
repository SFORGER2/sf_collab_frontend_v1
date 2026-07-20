/**
 * ChatHeader.jsx
 * Presence now comes from useUserPresence() in SocketProvider —
 * the single source of truth. No prop drilling needed.
 */

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { getProfilePicture } from "@/utils/getProfilePicture";
import { ArrowLeft, LogOut, Users, X as XIcon, MessageCircle, ExternalLink, Eraser, Trash2 } from "lucide-react";
import { chatAPI } from "@/utils/APIs/chatApi";
import { resolveUserId } from "@/utils/resolveUserId";
import { useUserPresence } from "@/context/SocketProvider";

const ChatHeader = ({
  conversation,
  currentUserId,
  onAvatarClick,
  sidebarOpen = true,
  setSidebarOpen = () => {},
  isMobile,
  onLeaveGroup = null,
  onBack = null,
  onOpenDM = null,
  onClearChat = null,
  onDeleteChat = null,
}) => {
  const [menuOpen,        setMenuOpen]        = useState(false);
  const [leaveModalOpen,  setLeaveModalOpen]  = useState(false);
  const [isLeaving,       setIsLeaving]       = useState(false);
  const [leaveError,      setLeaveError]      = useState(null);
  const [membersOpen,     setMembersOpen]     = useState(false);
  const [selectedMember,  setSelectedMember]  = useState(null);
  const navigate   = useNavigate();
  const menuRef    = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const otherParticipant =
    conversation?.conversation_type === "direct"
      ? conversation?.participants?.find((p) => {
          const participantId = String(resolveUserId(p) ?? "");
          const meId = String(currentUserId ?? "");
          return participantId && participantId !== meId;
        })
      : null;

  const { status: presenceStatus, statusText } = useUserPresence(
    otherParticipant?.id ?? 0
  );

  if (!conversation) return null;

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

  const isGroupChat   = conversation.conversation_type === "group" || conversation.conversation_type === "startup" || conversation.conversation_type === "team";
  const isGeneralChat = conversation.conversation_type === "general";

  return (
    <>
      <div className="h-16 px-4 border-b border-white/5 bg-zinc-900/60 backdrop-blur-xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center" ref={menuRef}>
            {isMobile ? (
              <button type="button" onClick={onBack || (() => setSidebarOpen(true))}
                className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors mr-1"
                title="Back">
                <ArrowLeft size={20} />
              </button>
            ) : (
              <button type="button" onClick={() => setSidebarOpen(prev => !prev)}
                className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors mr-2 flex items-center justify-center shrink-0 cursor-pointer"
                title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </button>
            )}

            <button type="button" onClick={handleMenuToggle} disabled={!onAvatarClick}
              className={`rounded-full transition-transform active:scale-95 ${onAvatarClick ? "cursor-pointer" : "cursor-default"}`}
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
              <div className="absolute left-0 top-12 z-50 w-44 rounded-xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur p-1">
                <button type="button"
                  className="w-full text-left px-3 py-2 text-sm text-zinc-100 hover:bg-white/5 rounded-lg transition-colors"
                  onClick={handleViewProfile}>
                  View profile
                </button>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold text-white text-sm truncate">{displayName}</h2>

            {conversation.conversation_type === "direct" && (
              <p className={`text-xs font-medium ${statusColor}`}>{statusText}</p>
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
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors text-left truncate max-w-[200px] block">
                  {label}
                </button>
              );
            })()}
          </div>
        </div>
      </div>

      {membersOpen && (isGroupChat || isGeneralChat) && (
        <div className="absolute top-16 left-4 right-4 z-50 border border-white/10 bg-zinc-950/95 backdrop-blur-xl px-4 py-3.5 max-h-64 overflow-y-auto shadow-2xl rounded-2xl animate-fade-in custom-chat-scrollbar">
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
                    if (!isMe && targetId) setSelectedMember(p);
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
      {selectedMember && (
        <div className="fixed inset-0 z-[11000] bg-black/60 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedMember(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-xs shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center mb-5">
              <Avatar
                src={getProfilePicture(selectedMember)}
                name={`${selectedMember.firstName || selectedMember.first_name || ""} ${selectedMember.lastName || selectedMember.last_name || ""}`.trim()}
                size="lg"
                showStatus={false}
              />
              <h4 className="text-sm font-bold text-white mt-3 truncate max-w-full">
                {`${selectedMember.firstName || selectedMember.first_name || ""} ${selectedMember.lastName || selectedMember.last_name || ""}`.trim()}
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-full">{selectedMember.email || "Group Member"}</p>
            </div>
            
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  onOpenDM?.(selectedMember);
                  setSelectedMember(null);
                  setMembersOpen(false);
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={14} />
                Message Individually
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = resolveUserId(selectedMember);
                  if (targetId) navigate(`/user-profile?userId=${targetId}`);
                  setSelectedMember(null);
                  setMembersOpen(false);
                }}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink size={14} />
                View Profile
              </button>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="w-full py-2 hover:bg-white/5 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const MemoizedChatHeader = React.memo(ChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.isMobile === nextProps.isMobile &&
    prevProps.sidebarOpen === nextProps.sidebarOpen &&
    prevProps.currentUserId === nextProps.currentUserId &&
    prevProps.conversation?.id === nextProps.conversation?.id &&
    prevProps.conversation?.conversation_name === nextProps.conversation?.conversation_name &&
    (prevProps.conversation?.participants || []).length === (nextProps.conversation?.participants || []).length
  );
});

export default MemoizedChatHeader;
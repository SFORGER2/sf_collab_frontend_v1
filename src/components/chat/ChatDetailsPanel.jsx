import React, { useMemo, useState } from 'react';
import { X, Pin, FileText, Image as ImageIcon, Paperclip, ChevronRight, ChevronDown, ExternalLink, Users, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { getProfilePicture } from '@/utils/getProfilePicture';
import { resolveUserId } from '@/utils/resolveUserId';

export default function ChatDetailsPanel({
  conversation,
  messages = [],
  currentUserId,
  isOpen,
  onClose,
  onOpenDM = null,
}) {
  const navigate = useNavigate();
  const [pinnedOpen, setPinnedOpen] = useState(true);
  const [mediaOpen, setMediaOpen] = useState(true);
  const [membersOpen, setMembersOpen] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

  // Resolve other participant details for direct chats
  const otherParticipant = useMemo(() => {
    if (conversation?.conversation_type !== 'direct') return null;
    return conversation?.participants?.find(
      (p) => String(resolveUserId(p)) !== String(currentUserId)
    );
  }, [conversation, currentUserId]);

  const displayName = useMemo(() => {
    if (!conversation) return 'Chat Details';
    return conversation.name ||
      (otherParticipant
        ? `${otherParticipant.firstName || otherParticipant.first_name || ''} ${otherParticipant.lastName || otherParticipant.last_name || ''}`.trim()
        : 'Chat Details');
  }, [conversation, otherParticipant]);

  const avatarUrl = useMemo(() => {
    if (!conversation) return null;
    return getProfilePicture(conversation.conversation_type === 'direct' ? otherParticipant : conversation);
  }, [conversation, otherParticipant]);

  // Extract pinned messages from thread
  const pinnedMessages = useMemo(() => {
    return (messages || []).filter((m) => m.is_pinned || m.isPinned);
  }, [messages]);

  // Extract shared files/media
  const sharedMedia = useMemo(() => {
    return (messages || []).filter((m) => m.file_url || m.fileUrl);
  }, [messages]);

  const handleOpenLink = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen || !conversation) return null;

  return (
    <div className="w-full h-full flex flex-col text-zinc-100">
      {/* Header */}
      <div className="h-16 px-4 border-b border-white/5 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Details</span>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
          title="Close details"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-chat-scrollbar p-4 space-y-6">
        {/* Profile Card */}
        <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <Avatar
            src={avatarUrl}
            name={displayName}
            size="xl"
            showStatus={false}
          />
          <h3 className="mt-3 text-base font-bold text-white truncate max-w-full">{displayName}</h3>
          <p className="text-xs text-zinc-400 mt-1 capitalize">{conversation.conversation_type} Chat</p>
          
          {otherParticipant?.email && (
            <p className="text-xs text-zinc-500 mt-2 hover:text-zinc-300 break-all select-all">
              {otherParticipant.email}
            </p>
          )}
        </div>

        {/* Group Members Section (if not direct chat) */}
        {conversation.conversation_type !== 'direct' && (
          <div className="space-y-2">
            <button
              onClick={() => setMembersOpen(!membersOpen)}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors py-1"
            >
              <div className="flex items-center gap-1.5">
                <Users size={12} className="text-indigo-400" />
                <span>Group Members ({conversation.participants?.length || 0})</span>
              </div>
              {membersOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {membersOpen && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-chat-scrollbar pr-1">
                {(conversation.participants || []).map((p) => {
                  const name = `${p.firstName || p.first_name || ""} ${p.lastName || p.last_name || ""}`.trim() || "Unknown";
                  const initials = name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2);
                  const isCreator = conversation.creator_id && String(p.id) === String(conversation.creator_id);
                  const isMe = String(p.id) === String(currentUserId);
                  const pic = getProfilePicture(p);
                  
                  return (
                    <button
                      key={resolveUserId(p) ?? p.id}
                      type="button"
                      onClick={() => {
                        const targetId = resolveUserId(p);
                        if (!isMe && targetId) setSelectedMember(p);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all text-left text-xs ${
                        isMe ? "cursor-default hover:bg-zinc-800/30" : "cursor-pointer"
                      }`}
                    >
                      {pic ? (
                        <img src={pic} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-zinc-700" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                          {initials}
                        </div>
                      )}
                      <span className="flex-1 text-zinc-200 truncate">{name}{isMe ? " (You)" : ""}</span>
                      {isCreator && <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full shrink-0">Admin</span>}
                      {!isMe && <span className="text-[10px] text-zinc-650 shrink-0">→</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Pinned Messages Section */}
        <div className="space-y-2">
          <button
            onClick={() => setPinnedOpen(!pinnedOpen)}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors py-1"
          >
            <div className="flex items-center gap-1.5">
              <Pin size={12} className="rotate-45 text-indigo-400" />
              <span>Pinned Messages ({pinnedMessages.length})</span>
            </div>
            {pinnedOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {pinnedOpen && (
            <div className="space-y-2 max-h-48 overflow-y-auto custom-chat-scrollbar pr-1">
              {pinnedMessages.length === 0 ? (
                <p className="text-xs text-zinc-500 italic px-2 py-1">No pinned messages</p>
              ) : (
                pinnedMessages.map((msg) => (
                  <div key={msg.id} className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5 text-xs text-zinc-300 leading-relaxed shadow-sm">
                    <div className="font-semibold text-zinc-400 mb-1">
                      {String(msg.sender_id) === String(currentUserId) ? 'You' : (msg.sender_name || 'Sender')}
                    </div>
                    <div className="truncate">{msg.content || 'Attachment'}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Shared Files & Media Section */}
        <div className="space-y-2">
          <button
            onClick={() => setMediaOpen(!mediaOpen)}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors py-1"
          >
            <div className="flex items-center gap-1.5">
              <Paperclip size={12} className="text-indigo-400" />
              <span>Shared Media & Files ({sharedMedia.length})</span>
            </div>
            {mediaOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {mediaOpen && (
            <div className="space-y-2 max-h-64 overflow-y-auto custom-chat-scrollbar pr-1">
              {sharedMedia.length === 0 ? (
                <p className="text-xs text-zinc-500 italic px-2 py-1">No shared files</p>
              ) : (
                <div className="space-y-1.5">
                  {sharedMedia.map((msg) => {
                    const fileUrl = msg.file_url || msg.fileUrl;
                    const fileName = msg.file_name || msg.fileName || 'Shared file';
                    const fileType = msg.file_type || msg.fileType || '';
                    const isImg = fileType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
                    
                    return (
                      <button
                        key={msg.id}
                        type="button"
                        onClick={() => handleOpenLink(fileUrl)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all text-left text-xs group"
                      >
                        {isImg ? (
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-white/5">
                            <img src={fileUrl} alt={fileName} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                            <FileText size={16} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-zinc-200 truncate group-hover:text-indigo-400 transition-colors">{fileName}</div>
                          <div className="text-[10px] text-zinc-500 truncate mt-0.5">Click to open</div>
                        </div>
                        <ExternalLink size={12} className="text-zinc-600 group-hover:text-zinc-400 shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
}

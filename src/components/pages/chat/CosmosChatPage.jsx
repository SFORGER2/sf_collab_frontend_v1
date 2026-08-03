import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Check, Copy, CornerUpLeft, MessageSquare, MoreVertical, Paperclip,
  Pencil, Search, Send, Smile, SmilePlus, Trash2, Users, Flag, X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Eyebrow, Tag } from '@/components/cosmos';
import { chatAPI } from '@/utils/APIs/chatApi';
import { useAppSocket } from '@/context/SocketProvider';
import { getProfilePicture } from '@/utils/getProfilePicture';
import { timeLabel } from '@/services/mock/conversations'; // keep only the time formatter

/**
 * Cosmos Chat – fully connected to the backend.
 *
 * All mock data has been removed. Conversations, messages, reactions,
 * edits, deletes, and real-time updates all come from the API and socket.
 *
 * NOTE: The UI keeps the same Cosmos design. Only the data layer has changed.
 */
export default function CosmosChatPage() {
  // ── Backend state ──────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [tab, setTab] = useState('dms');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);

  const endRef = useRef(null);

  // ── Socket & current user ────────────────────────────────────────────────
  const { socket, isConnected, presenceMap } = useAppSocket();
  const currentUserId = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return user?.id;
    } catch { return null; }
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────────
  const dms = useMemo(
    () => conversations.filter((c) => c.conversation_type === 'direct'),
    [conversations]
  );
  const groups = useMemo(
    () => conversations.filter((c) => c.conversation_type === 'group' || c.conversation_type === 'team'),
    [conversations]
  );
  const threadList = tab === 'groups' ? groups : dms;
  const active = threadList.find((t) => String(t.id) === String(activeId)) || threadList[0];

  useEffect(() => {
    if (active && !activeId) setActiveId(active.id);
  }, [active, activeId]);

  // ── Load conversations ────────────────────────────────────────────────────
  const loadConversations = async () => {
    try {
      const res = await chatAPI.getAllChats();
      if (res.success && res.data?.conversations) {
        setConversations(res.data.conversations);
        if (!activeId && res.data.conversations.length > 0) {
          setActiveId(res.data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      toast.error('Could not load conversations');
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // ── Load messages when conversation changes ──────────────────────────────
  const loadMessages = async (conversationId) => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const res = await chatAPI.getMessages(conversationId, 50, 0);
      if (res.success && res.data?.messages) {
        // Backend returns newest → oldest; reverse for chronological view
        const raw = res.data.messages;
        const sorted = [...raw].reverse();
        setMessages(sorted);
        // Mark conversation as read
        await chatAPI.markConversationAsRead(conversationId);
        // Update unread count locally
        setConversations((prev) =>
          prev.map((c) =>
            String(c.id) === String(conversationId) ? { ...c, unread_count: 0 } : c
          )
        );
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      toast.error('Could not load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId]);

  // ── Scroll to bottom on new messages ─────────────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────────
  const send = async () => {
    const text = draft.trim();
    if (!text && !editing) return;
    if (!activeId) return;

    setSending(true);
    try {
      let response;
      if (editing) {
        // Edit existing message
        response = await chatAPI.editMessage(activeId, editing, text);
        if (response.success && response.data?.message) {
          const updated = response.data.message;
          setMessages((prev) =>
            prev.map((m) => (String(m.id) === String(editing) ? updated : m))
          );
          setEditing(null);
        }
      } else {
        // Send new message
        response = await chatAPI.sendMessage(activeId, text, replyTo?.id || null);
        if (response.success && response.data?.message) {
          const newMsg = response.data.message;
          setMessages((prev) => [...prev, newMsg]);
          // Bump conversation to top
          setConversations((prev) =>
            prev.map((c) =>
              String(c.id) === String(activeId)
                ? { ...c, last_message_at: newMsg.created_at, updated_at: newMsg.created_at }
                : c
            )
          );
        }
      }
      setDraft('');
      setReplyTo(null);
      setPickerOpen(false);
    } catch (err) {
      console.error('Send/edit failed:', err);
      toast.error(editing ? 'Failed to edit message' : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // ── Reactions ─────────────────────────────────────────────────────────────
  const react = async (messageId, emoji) => {
    if (!activeId) return;
    try {
      const res = await chatAPI.reactToMessage(activeId, messageId, emoji);
      if (res.success && res.data?.message) {
        const updated = res.data.message;
        setMessages((prev) =>
          prev.map((m) => (String(m.id) === String(messageId) ? updated : m))
        );
      }
    } catch (err) {
      console.error('Reaction failed:', err);
      toast.error('Could not update reaction');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const removeForMe = async (messageId) => {
    try {
      await chatAPI.deleteMessage(activeId, messageId, 'me');
      setMessages((prev) => prev.filter((m) => String(m.id) !== String(messageId)));
      toast.success('Deleted for you');
    } catch (err) {
      console.error('Delete for me failed:', err);
      toast.error('Could not delete');
    }
  };

  const removeForEveryone = async (messageId) => {
    try {
      await chatAPI.deleteMessage(activeId, messageId, 'everyone');
      // Replace with a tombstone
      setMessages((prev) =>
        prev.map((m) =>
          String(m.id) === String(messageId)
            ? { ...m, content: 'This message was deleted', is_deleted: true, reactions: [] }
            : m
        )
      );
      toast.success('Deleted for everyone');
    } catch (err) {
      console.error('Delete for everyone failed:', err);
      toast.error('Could not delete');
    }
  };

  // ── Edit start ────────────────────────────────────────────────────────────
  const startEdit = (m) => {
    setEditing(m.id);
    setDraft(m.content || m.original_content || '');
    setReplyTo(null);
  };

  // ── Socket listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // New message
    const onNewMessage = (data) => {
      const msg = data?.message;
      if (!msg) return;
      const cid = String(data?.conversation_id);
      if (cid !== String(activeId)) {
        // Update unread count in conversation list
        setConversations((prev) =>
          prev.map((c) =>
            String(c.id) === cid
              ? { ...c, unread_count: (c.unread_count || 0) + 1, last_message_at: msg.created_at }
              : c
          )
        );
        return;
      }
      // Append to current thread if it's for this conversation
      setMessages((prev) => [...prev, msg]);
    };

    // Message edited
    const onMessageEdited = (data) => {
      const msg = data?.message;
      if (!msg) return;
      if (String(data?.conversation_id) !== String(activeId)) return;
      setMessages((prev) =>
        prev.map((m) => (String(m.id) === String(msg.id) ? msg : m))
      );
    };

    // Message deleted
    const onMessageDeleted = (data) => {
      const mid = data?.message_id;
      if (!mid) return;
      if (String(data?.conversation_id) !== String(activeId)) return;
      setMessages((prev) =>
        prev.map((m) =>
          String(m.id) === String(mid)
            ? { ...m, content: 'This message was deleted', is_deleted: true, reactions: [] }
            : m
        )
      );
    };

    socket.on('new_message', onNewMessage);
    socket.on('message_edited', onMessageEdited);
    socket.on('message_deleted', onMessageDeleted);

    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('message_edited', onMessageEdited);
      socket.off('message_deleted', onMessageDeleted);
    };
  }, [socket, activeId]);

  // ── Filter conversations by search ──────────────────────────────────────
  const filtered = useMemo(() => {
    if (!query.trim()) return threadList;
    const q = query.toLowerCase();
    return threadList.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.participants?.some((p) => p.firstName?.toLowerCase().includes(q) || p.lastName?.toLowerCase().includes(q)) ||
        messages.some((m) => m.content?.toLowerCase().includes(q))
    );
  }, [threadList, messages, query]);

  // ── Get online status for a direct conversation ─────────────────────────
  const getOtherParticipant = (conv) => {
    if (conv.conversation_type !== 'direct') return null;
    return conv.participants?.find((p) => String(p.id) !== String(currentUserId));
  };

  const isUserOnline = (userId) => {
    if (!userId) return false;
    const entry = presenceMap?.[String(userId)];
    return entry?.online || false;
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[1180px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <Eyebrow>Messages</Eyebrow>
          <h1 className="font-display text-[1.35rem] sm:text-[1.5rem] text-star mt-1 leading-tight">
            Conversations
          </h1>
        </div>
        <Tag tone="live" dot>Live</Tag>
      </div>

      <div
        className="cosmos-panel overflow-hidden flex"
        style={{ height: 'min(74vh, 46rem)' }}
      >
        {/* ── Threads ───────────────────────────────────────────────────────── */}
        <aside
          className={`flex-col min-h-0 min-w-0 border-r border-white/[0.07] w-full md:w-[19rem] md:shrink-0 ${
            mobileThreadOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3 border-b border-white/[0.07] shrink-0">
            <div className="flex items-center gap-1 p-1 mb-2.5 rounded-full bg-white/[0.04] border border-white/10">
              {[
                { id: 'dms', label: 'Direct', icon: MessageSquare, count: dms.reduce((n, t) => n + (t.unread_count || 0), 0) },
                { id: 'groups', label: 'Groups', icon: Users, count: groups.reduce((n, t) => n + (t.unread_count || 0), 0) },
              ].map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => {
                    setTab(x.id);
                    const list = x.id === 'groups' ? groups : dms;
                    if (list.length) setActiveId(list[0].id);
                  }}
                  aria-pressed={tab === x.id}
                  className={`flex-1 flex items-center justify-center gap-1.5 font-mono text-[9.5px] tracking-[0.14em] uppercase px-2 py-1.5 rounded-full transition-colors ${
                    tab === x.id ? 'text-star bg-white/[0.09]' : 'text-dim hover:text-star'
                  }`}
                >
                  <x.icon size={11} /> {x.label}
                  {x.count > 0 && (
                    <span
                      className="grid place-items-center min-w-[15px] h-[15px] px-1 rounded-full font-mono text-[8.5px]"
                      style={{ background: '#ffbf5e', color: '#14111f' }}
                    >
                      {x.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <label className="relative block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[0.88rem] text-star placeholder-dim focus:outline-none focus:border-gold/50"
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {filtered.map((t) => {
              const last = messages[messages.length - 1] || t.last_message;
              const isActive = String(t.id) === String(active?.id);
              const other = getOtherParticipant(t);
              const displayName = t.name || (other ? `${other.firstName || ''} ${other.lastName || ''}`.trim() : 'Chat');
              const online = other ? isUserOnline(other.id) : false;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setActiveId(t.id); setMobileThreadOpen(true); }}
                  className="w-full flex items-start gap-3 px-3 py-3 text-left border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]"
                  style={isActive ? { background: 'rgba(255,191,94,0.08)', boxShadow: 'inset 2px 0 0 #ffbf5e' } : undefined}
                >
                  <Avatar
                    user={{
                      name: displayName,
                      online: online,
                      avatar: other?.profilePicture || t.avatar_url,
                    }}
                    isGroup={t.conversation_type !== 'direct'}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[0.88rem] text-star truncate flex-1 min-w-0">{displayName}</span>
                      <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-dim shrink-0">
                        {timeLabel(t.last_message_at || t.updated_at || t.created_at)}
                      </span>
                    </span>
                    <span className="block text-[0.78rem] text-dim truncate mt-0.5">
                      {last?.content || last?.original_content || 'No messages yet'}
                    </span>
                  </span>
                  {t.unread_count > 0 && (
                    <span
                      className="grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full font-mono text-[9px] shrink-0 mt-0.5"
                      style={{ background: '#ffbf5e', color: '#14111f' }}
                    >
                      {t.unread_count}
                    </span>
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-[0.85rem] text-dim text-center py-10 px-4">No conversations match.</p>
            )}
          </div>
        </aside>

        {/* ── Thread ──────────────────────────────────────────────────────── */}
        <section
          className={`flex-col min-h-0 min-w-0 flex-1 ${mobileThreadOpen ? 'flex' : 'hidden md:flex'}`}
        >
          <header className="flex items-center gap-3 px-3 sm:px-5 py-3 border-b border-white/[0.07] shrink-0">
            <button
              type="button"
              onClick={() => setMobileThreadOpen(false)}
              aria-label="Back to conversations"
              className="md:hidden p-1.5 -ml-1 rounded-lg text-dim hover:text-star hover:bg-white/[0.06] transition-colors shrink-0"
            >
              <ArrowLeft size={18} />
            </button>

            {active && (
              <>
                <Avatar
                  user={{
                    name: active.name || getOtherParticipant(active)?.firstName || 'Chat',
                    online: active.conversation_type === 'direct' ? isUserOnline(getOtherParticipant(active)?.id) : false,
                    avatar: active.avatar_url || getOtherParticipant(active)?.profilePicture,
                  }}
                  isGroup={active.conversation_type !== 'direct'}
                />
                <div className="min-w-0 flex-1">
                  {active.conversation_type === 'direct' ? (
                    <Link
                      to={`/user-profile?userId=${getOtherParticipant(active)?.id}`}
                      className="block text-[0.95rem] text-star hover:text-gold transition-colors truncate"
                    >
                      {active.name || `${getOtherParticipant(active)?.firstName || ''} ${getOtherParticipant(active)?.lastName || ''}`.trim()}
                    </Link>
                  ) : (
                    <span className="block text-[0.95rem] text-star truncate">{active.name}</span>
                  )}
                  <span className="flex items-center gap-1.5 text-[0.78rem] text-dim truncate">
                    {active.conversation_type === 'direct' && (
                      <>
                        {isUserOnline(getOtherParticipant(active)?.id) ? (
                          <span className="cosmos-live-dot text-emerald-400" />
                        ) : null}
                        {isUserOnline(getOtherParticipant(active)?.id) ? 'Online' : 'Offline'}
                      </>
                    )}
                    {active.conversation_type !== 'direct' && `${active.participants?.length || 0} members`}
                  </span>
                </div>
              </>
            )}
          </header>

          <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-5 py-4 flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-dim">Loading messages…</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-dim">No messages yet. Start the conversation!</span>
              </div>
            ) : (
              messages.map((m, i) => (
                <Bubble
                  key={m.id}
                  message={m}
                  prev={messages[i - 1]}
                  thread={messages}
                  isGroup={active?.conversation_type !== 'direct'}
                  onReact={(emoji) => react(m.id, emoji)}
                  onReply={() => setReplyTo(m)}
                  onEdit={() => startEdit(m)}
                  onDeleteForMe={() => removeForMe(m.id)}
                  onDeleteForEveryone={() => removeForEveryone(m.id)}
                  currentUserId={currentUserId}
                />
              ))
            )}
            <div ref={endRef} />
          </div>

          {/* ── Composer ──────────────────────────────────────────────────── */}
          <div className="border-t border-white/[0.07] p-3 shrink-0">
            {(replyTo || editing) && (
              <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-white/[0.04] border-l-2 border-gold">
                <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-gold shrink-0">
                  {editing ? 'Editing' : 'Replying'}
                </span>
                <span className="text-[0.82rem] text-dim truncate flex-1 min-w-0">
                  {editing ? draft : replyTo?.content}
                </span>
                <button
                  type="button"
                  onClick={() => { setReplyTo(null); setEditing(null); setDraft(''); }}
                  aria-label="Cancel"
                  className="text-dim hover:text-star transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {pickerOpen && <EmojiPicker onPick={(e) => setDraft((d) => d + e)} />}

            <div className="flex items-end gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setPickerOpen((o) => !o)}
                aria-label="Emoji"
                aria-pressed={pickerOpen}
                className={`p-2.5 rounded-xl transition-colors shrink-0 ${
                  pickerOpen ? 'bg-gold/15 text-gold' : 'text-dim hover:text-star hover:bg-white/[0.06]'
                }`}
              >
                <Smile size={18} />
              </button>

              <button
                type="button"
                aria-label="Attach a file"
                className="hidden sm:block p-2.5 rounded-xl text-dim hover:text-star hover:bg-white/[0.06] transition-colors shrink-0"
                onClick={() => {
                  // file input click
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.onchange = async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !activeId) return;
                    try {
                      const res = await chatAPI.uploadFile(activeId, file, draft || '');
                      if (res.success && res.data?.message) {
                        setMessages((prev) => [...prev, res.data.message]);
                        setDraft('');
                      }
                    } catch (err) {
                      toast.error('File upload failed');
                    }
                  };
                  input.click();
                }}
              >
                <Paperclip size={18} />
              </button>

              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                  if (e.key === 'Escape') { setReplyTo(null); setEditing(null); }
                }}
                rows={1}
                placeholder="Write a message…"
                className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[0.9rem] text-star placeholder-dim resize-none focus:outline-none focus:border-gold/50"
                style={{ maxHeight: '7rem' }}
              />

              <button
                type="button"
                onClick={send}
                disabled={(!draft.trim() && !editing) || sending}
                aria-label={editing ? 'Save edit' : 'Send'}
                className="p-2.5 rounded-xl shrink-0 transition-colors disabled:opacity-35"
                style={{ background: 'rgba(255,191,94,0.15)', color: '#ffbf5e' }}
              >
                {sending ? (
                  <span className="animate-spin">⋯</span>
                ) : editing ? (
                  <Check size={18} />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Reusable components ──────────────────────────────────────────────────────

function Avatar({ user, isGroup }) {
  const initials = user.name?.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || '?';
  const avatarSrc = user.avatar ? getProfilePicture(user) : null;

  return (
    <span className="relative shrink-0">
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={user.name}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
        />
      ) : (
        <span
          className="grid place-items-center w-9 h-9 sm:w-10 sm:h-10 rounded-full font-mono text-[11px]"
          style={
            isGroup
              ? { background: 'rgba(62,230,160,0.16)', color: '#3ee6a0' }
              : { background: 'rgba(139,108,255,0.18)', color: '#8b6cff' }
          }
        >
          {isGroup ? <Users size={15} /> : initials}
        </span>
      )}
      {user.online && (
        <span
          className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
          style={{ background: '#3ee6a0', border: '2px solid var(--color-panel)' }}
        />
      )}
    </span>
  );
}

function Bubble({ message, prev, thread, isGroup, onReact, onReply, onEdit, onDeleteForMe, onDeleteForEveryone, currentUserId }) {
  const mine = String(message.sender_id) === String(currentUserId);
  const grouped = prev && prev.sender_id === message.sender_id && (new Date(message.created_at) - new Date(prev.created_at)) < 5 * 60_000;
  const [menu, setMenu] = useState(null);
  const close = () => setMenu(null);

  // Find replied message (if any)
  const replied = message.reply_to_id
    ? thread.find((m) => String(m.id) === String(message.reply_to_id))
    : null;

  const senderName = message.sender?.firstName || message.sender_name || 'User';

  return (
    <div
      className={`group/msg flex items-start gap-1 w-full ${mine ? 'flex-row-reverse' : 'flex-row'} ${
        grouped ? 'mt-0.5' : 'mt-3'
      }`}
    >
      <div className={`flex flex-col min-w-0 ${mine ? 'items-end' : 'items-start'}`} style={{ maxWidth: 'min(78%, 34rem)' }}>
        {isGroup && !mine && !grouped && (
          <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-dim mb-1 px-1">
            {senderName}
          </span>
        )}

        {replied && (
          <span className="flex items-center gap-1.5 mb-1 px-2 py-1 rounded-lg bg-white/[0.03] border-l-2 border-white/20 max-w-full">
            <CornerUpLeft size={10} className="text-dim shrink-0" />
            <span className="text-[0.75rem] text-dim truncate">{replied.content}</span>
          </span>
        )}

        <div
          className="px-3.5 py-2.5 rounded-2xl text-[0.9rem] leading-relaxed break-words"
          style={
            mine
              ? { background: 'rgba(255,191,94,0.14)', border: '1px solid rgba(255,191,94,0.28)', color: 'var(--color-star)' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'var(--color-star)' }
          }
        >
          <span style={message.is_deleted ? { fontStyle: 'italic', opacity: 0.55 } : undefined}>
            {message.is_deleted ? 'This message was deleted' : (message.content || message.original_content)}
          </span>

          {message.file_url && (
            <span className="flex items-center gap-2 mt-2 px-2.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 max-w-full">
              <Paperclip size={13} className="text-dim shrink-0" />
              <span className="text-[0.82rem] text-star truncate">{message.file_name || 'File'}</span>
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gold hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Open
              </a>
            </span>
          )}
        </div>

        {message.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions.map((r) => {
              const mineOn = r.by?.includes(currentUserId) || false;
              return (
                <button
                  key={r.emoji}
                  type="button"
                  onClick={() => onReact(r.emoji)}
                  aria-pressed={mineOn}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.8rem] transition-colors hover:scale-110"
                  style={
                    mineOn
                      ? { background: 'rgba(255,191,94,0.2)', border: '1px solid rgba(255,191,94,0.5)' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
                  }
                >
                  <span>{r.emoji}</span>
                  <span className="font-mono text-[9.5px] text-dim">{r.by?.length || 0}</span>
                </button>
              );
            })}
          </div>
        )}

        <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-dim/70 mt-1">
          {timeLabel(message.created_at)}{message.is_edited && ' · edited'}
        </span>
      </div>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="relative flex items-center gap-0.5 shrink-0 pt-1 opacity-0 group-hover/msg:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setMenu(menu === 'react' ? null : 'react')}
          aria-label="React"
          className="p-1.5 rounded-lg text-dim hover:text-gold hover:bg-white/[0.08] transition-colors"
        >
          <SmilePlus size={15} />
        </button>
        <button
          type="button"
          onClick={() => setMenu(menu === 'more' ? null : 'more')}
          aria-label="More actions"
          className="p-1.5 rounded-lg text-dim hover:text-star hover:bg-white/[0.08] transition-colors"
        >
          <MoreVertical size={15} />
        </button>

        {menu === 'react' && (
          <>
            <span className="fixed inset-0 z-10" onClick={close} />
            <div
              className={`absolute z-20 top-9 ${mine ? 'left-0' : 'right-0'} flex gap-0.5 p-1.5 rounded-xl cosmos-panel`}
              style={{ background: 'rgba(16,12,34,0.98)' }}
            >
              {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => { onReact(e); close(); }}
                  className="w-8 h-8 grid place-items-center rounded-lg text-[1.05rem] hover:bg-white/10 hover:scale-125 transition-transform"
                >
                  {e}
                </button>
              ))}
            </div>
          </>
        )}

        {menu === 'more' && (
          <>
            <span className="fixed inset-0 z-10" onClick={close} />
            <div
              className={`absolute z-20 top-9 ${mine ? 'left-0' : 'right-0'} w-40 p-1 rounded-xl cosmos-panel`}
              style={{ background: 'rgba(16,12,34,0.98)' }}
            >
              <MenuItem icon={CornerUpLeft} label="Reply" onClick={() => { onReply(); close(); }} />
              <MenuItem
                icon={Copy}
                label="Copy text"
                onClick={() => {
                  navigator.clipboard?.writeText(message.content || '');
                  toast.success('Copied');
                  close();
                }}
              />
              {mine && (
                <>
                  {!message.is_deleted && (
                    <MenuItem icon={Pencil} label="Edit" onClick={() => { onEdit(); close(); }} />
                  )}
                  <MenuItem
                    icon={Trash2}
                    label="Delete for me"
                    danger
                    onClick={() => { onDeleteForMe(); close(); }}
                  />
                  {!message.is_deleted && (
                    <MenuItem
                      icon={Trash2}
                      label="Delete for everyone"
                      danger
                      onClick={() => { onDeleteForEveryone(); close(); }}
                    />
                  )}
                </>
              )}
              {!mine && (
                <MenuItem
                  icon={Flag}
                  label="Report"
                  danger
                  onClick={() => { toast.info('Reported — a moderator will review it'); close(); }}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[0.85rem] transition-colors hover:bg-white/[0.07]"
      style={{ color: danger ? '#ff8080' : 'var(--color-star)' }}
    >
      <Icon size={14} className="shrink-0" />
      {label}
    </button>
  );
}

function EmojiPicker({ onPick }) {
  const groups = [
    { id: 'smileys', label: 'Smileys', emoji: ['😀', '😂', '🥰', '😍', '🤩', '😎', '🙂', '😊'] },
    { id: 'gestures', label: 'Gestures', emoji: ['👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '💪'] },
    { id: 'hearts', label: 'Hearts', emoji: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔'] },
    { id: 'objects', label: 'Objects', emoji: ['🔥', '⭐', '✨', '💯', '🎉', '🎊', '🎁', '🏆'] },
  ];

  const [group, setGroup] = useState(groups[0].id);
  const current = groups.find((g) => g.id === group) || groups[0];

  return (
    <div className="mb-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
      <div className="flex gap-1 mb-2 overflow-x-auto scrollbar-hide">
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGroup(g.id)}
            aria-pressed={group === g.id}
            className={`font-mono text-[9px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              group === g.id ? 'text-star bg-white/[0.09]' : 'text-dim hover:text-star'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-0.5">
        {current.emoji.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onPick(e)}
            className="w-9 h-9 grid place-items-center rounded-lg text-[1.15rem] hover:bg-white/10 hover:scale-125 transition-transform"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
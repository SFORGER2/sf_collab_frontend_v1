import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Check, Copy, CornerUpLeft, MessageSquare, MoreVertical, Paperclip,
  Pencil, Search, Send, Smile, SmilePlus, Trash2, Users, Flag, X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  EMOJI_GROUPS, ME, QUICK_REACTIONS, SAMPLE_CONVERSATIONS, SAMPLE_GROUPS, timeLabel,
} from '@/services/mock/conversations';
import { Eyebrow, Tag } from '@/components/cosmos';

/**
 * Chat.
 *
 * Rebuilt after the first pass overflowed horizontally: the quick-react button
 * was absolutely positioned at `left-full` / `right-full`, which sits *outside*
 * the container and forced the whole thread into a horizontal scroll with the
 * message text clipped off the left edge. Actions are now flex siblings inside
 * the row, and the scroll container clamps the x-axis, so nothing can push the
 * layout sideways again.
 *
 * Message actions (react, reply, copy, edit, delete, report) live behind one
 * kebab per message rather than a row of icons — six affordances on every
 * bubble is noise, and on mobile there is no room for them at all.
 *
 * Mobile is a two-pane push: the thread list is the page, tapping a thread
 * replaces it, and a back arrow returns. Side-by-side at 20rem + content does
 * not fit on a phone, and a squeezed sidebar is worse than none.
 *
 * NOTE FOR BACKEND: threads from GET /api/chat/conversations, messages from
 * .../:id/messages, POST .../:id/reactions { messageId, emoji } toggling one
 * row per user per emoji, and DELETE .../messages/:id for removal.
 */
export default function CosmosChatPage() {
  /**
   * Direct messages and groups are separate tabs, not one merged list.
   * A group has members, a name of its own, and different moderation rules —
   * flattening them into one inbox loses all three.
   */
  const [tab, setTab] = useState('dms');
  const [dms, setDms] = useState(SAMPLE_CONVERSATIONS);
  const [groups, setGroups] = useState(SAMPLE_GROUPS);
  const [activeId, setActiveId] = useState(SAMPLE_CONVERSATIONS[0].id);

  const threads = tab === 'groups' ? groups : dms;
  const setThreads = tab === 'groups' ? setGroups : setDms;
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const endRef = useRef(null);

  const active = threads.find((t) => t.id === activeId) || threads[0];
  const isGroup = !!active?.isGroup;

  const filtered = useMemo(() => {
    if (!query.trim()) return threads;
    const q = query.toLowerCase();
    return threads.filter(
      (t) =>
        t.user.name.toLowerCase().includes(q) ||
        t.messages.some((m) => m.text?.toLowerCase().includes(q))
    );
  }, [threads, query]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [activeId, active?.messages.length]);

  useEffect(() => {
    setThreads((ts) => ts.map((t) => (t.id === activeId ? { ...t, unread: 0 } : t)));
  }, [activeId]);

  const patchMessages = (fn) =>
    setThreads((ts) => ts.map((t) => (t.id === activeId ? { ...t, messages: fn(t.messages) } : t)));

  const send = () => {
    const text = draft.trim();
    if (!text) return;

    if (editing) {
      patchMessages((ms) => ms.map((m) => (m.id === editing ? { ...m, text, edited: true } : m)));
      setEditing(null);
    } else {
      patchMessages((ms) => [
        ...ms,
        { id: `m${Date.now()}`, from: 'me', at: Date.now(), text, replyTo: replyTo?.id || null },
      ]);
      setThreads((ts) => ts.map((t) => (t.id === activeId ? { ...t, lastAt: Date.now() } : t)));
    }

    setDraft('');
    setReplyTo(null);
    setPickerOpen(false);
  };

  /** Toggle my reaction. One row per user per emoji. */
  const react = (messageId, emoji) =>
    patchMessages((ms) =>
      ms.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions || [];
        const hit = existing.find((r) => r.emoji === emoji);
        if (!hit) return { ...m, reactions: [...existing, { emoji, by: [ME.id] }] };

        const mine = hit.by.includes(ME.id);
        const by = mine ? hit.by.filter((b) => b !== ME.id) : [...hit.by, ME.id];
        return {
          ...m,
          reactions: by.length
            ? existing.map((r) => (r.emoji === emoji ? { ...r, by } : r))
            : existing.filter((r) => r.emoji !== emoji),
        };
      })
    );

  /**
   * Two different actions that a single "Delete" conflates.
   *
   * "For me" hides it from my view only — the other person still has it, so
   * pretending otherwise would be a lie. "For everyone" retracts it, and
   * leaves a tombstone rather than a silent gap, because a message vanishing
   * without trace is how you get an argument about what was said.
   */
  const removeForMe = (messageId) => {
    patchMessages((ms) => ms.filter((m) => m.id !== messageId));
    toast.success('Deleted for you');
  };

  const removeForEveryone = (messageId) => {
    patchMessages((ms) =>
      ms.map((m) =>
        m.id === messageId
          ? { ...m, text: 'This message was deleted', deleted: true, reactions: [], attachment: null }
          : m
      )
    );
    toast.success('Deleted for everyone');
  };

  const startEdit = (m) => { setEditing(m.id); setDraft(m.text); setReplyTo(null); };

  return (
    <div className="w-full max-w-[1180px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <Eyebrow>Messages</Eyebrow>
          <h1 className="font-display text-[1.35rem] sm:text-[1.5rem] text-star mt-1 leading-tight">
            Conversations
          </h1>
        </div>
        <Tag tone="future" title="Threads come from the chat API once it is wired">
          Sample data
        </Tag>
      </div>

      <div
        className="cosmos-panel overflow-hidden flex"
        style={{ height: 'min(74vh, 46rem)' }}
      >
        {/* ── Threads. Full width on mobile until one is opened. ────────── */}
        <aside
          className={`flex-col min-h-0 min-w-0 border-r border-white/[0.07] w-full md:w-[19rem] md:shrink-0 ${
            mobileThreadOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3 border-b border-white/[0.07] shrink-0">
            <div className="flex items-center gap-1 p-1 mb-2.5 rounded-full bg-white/[0.04] border border-white/10">
              {[
                { id: 'dms', label: 'Direct', icon: MessageSquare, count: dms.reduce((n, t) => n + t.unread, 0) },
                { id: 'groups', label: 'Groups', icon: Users, count: groups.reduce((n, t) => n + t.unread, 0) },
              ].map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => {
                    setTab(x.id);
                    const list = x.id === 'groups' ? groups : dms;
                    setActiveId(list[0]?.id);
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
              const last = t.messages[t.messages.length - 1];
              const isActive = t.id === active?.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setActiveId(t.id); setMobileThreadOpen(true); }}
                  className="w-full flex items-start gap-3 px-3 py-3 text-left border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]"
                  style={isActive ? { background: 'rgba(255,191,94,0.08)', boxShadow: 'inset 2px 0 0 #ffbf5e' } : undefined}
                >
                  <Avatar user={t.user} isGroup={t.isGroup} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[0.88rem] text-star truncate flex-1 min-w-0">{t.user.name}</span>
                      <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-dim shrink-0">
                        {timeLabel(t.lastAt)}
                      </span>
                    </span>
                    <span className="block text-[0.78rem] text-dim truncate mt-0.5">
                      {last?.from === 'me' ? 'You: ' : ''}{last?.text || 'Attachment'}
                    </span>
                  </span>
                  {t.unread > 0 && (
                    <span
                      className="grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full font-mono text-[9px] shrink-0 mt-0.5"
                      style={{ background: '#ffbf5e', color: '#14111f' }}
                    >
                      {t.unread}
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

        {/* ── Thread ──────────────────────────────────────────────────── */}
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

            <Avatar user={active.user} isGroup={isGroup} />
            <div className="min-w-0 flex-1">
              {isGroup ? (
                <span className="block text-[0.95rem] text-star truncate">{active.user.name}</span>
              ) : (
                <Link
                  to={`/user-profile?userId=${active.user.id}`}
                  className="block text-[0.95rem] text-star hover:text-gold transition-colors truncate"
                >
                  {active.user.name}
                </Link>
              )}
              <span className="flex items-center gap-1.5 text-[0.78rem] text-dim truncate">
                {active.user.online && <span className="cosmos-live-dot text-emerald-400" />}
                {isGroup
                  ? `${active.user.role} · ${(active.members || []).slice(0, 3).join(', ')}`
                  : active.user.online ? 'Active now' : active.user.role}
              </span>
            </div>
          </header>

          {/* overflow-x-hidden is load-bearing: without it one wide element
              drags the whole thread sideways and clips the text. */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-5 py-4 flex flex-col">
            {active.messages.map((m, i) => (
              <Bubble
                key={m.id}
                message={m}
                prev={active.messages[i - 1]}
                thread={active}
                isGroup={isGroup}
                onReact={(emoji) => react(m.id, emoji)}
                onReply={() => setReplyTo(m)}
                onEdit={() => startEdit(m)}
                onDeleteForMe={() => removeForMe(m.id)}
                onDeleteForEveryone={() => removeForEveryone(m.id)}
              />
            ))}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-white/[0.07] p-3 shrink-0">
            {(replyTo || editing) && (
              <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-white/[0.04] border-l-2 border-gold">
                <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-gold shrink-0">
                  {editing ? 'Editing' : 'Replying'}
                </span>
                <span className="text-[0.82rem] text-dim truncate flex-1 min-w-0">
                  {editing ? draft : replyTo?.text}
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
                disabled={!draft.trim()}
                aria-label={editing ? 'Save edit' : 'Send'}
                className="p-2.5 rounded-xl shrink-0 transition-colors disabled:opacity-35"
                style={{ background: 'rgba(255,191,94,0.15)', color: '#ffbf5e' }}
              >
                {editing ? <Check size={18} /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Avatar({ user, isGroup }) {
  const initials = user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <span className="relative shrink-0">
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
      {user.online && (
        <span
          className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
          style={{ background: '#3ee6a0', border: '2px solid var(--color-panel)' }}
        />
      )}
    </span>
  );
}

/**
 * One message.
 *
 * The action button is a flex sibling of the bubble, never absolutely
 * positioned outside it — that was what broke the layout. It reserves its
 * width always and only becomes visible on hover or focus, so the bubble
 * doesn't shift when the controls appear.
 */
function Bubble({ message, prev, thread, isGroup, onReact, onReply, onEdit, onDeleteForMe, onDeleteForEveryone }) {
  const mine = message.from === 'me';
  const grouped = prev && prev.from === message.from && message.at - prev.at < 5 * 60_000;
  const [menu, setMenu] = useState(null); // 'react' | 'more' | null

  const replied = message.replyTo
    ? thread.messages.find((m) => m.id === message.replyTo)
    : null;

  const close = () => setMenu(null);

  return (
    <div
      className={`group/msg flex items-start gap-1 w-full ${mine ? 'flex-row-reverse' : 'flex-row'} ${
        grouped ? 'mt-0.5' : 'mt-3'
      }`}
    >
      <div className={`flex flex-col min-w-0 ${mine ? 'items-end' : 'items-start'}`} style={{ maxWidth: 'min(78%, 34rem)' }}>
        {/* In a group you need to know who is speaking; in a DM it is noise. */}
        {isGroup && !mine && !grouped && (
          <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-dim mb-1 px-1">
            {message.author}
          </span>
        )}

        {replied && (
          <span className="flex items-center gap-1.5 mb-1 px-2 py-1 rounded-lg bg-white/[0.03] border-l-2 border-white/20 max-w-full">
            <CornerUpLeft size={10} className="text-dim shrink-0" />
            <span className="text-[0.75rem] text-dim truncate">{replied.text}</span>
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
          <span style={message.deleted ? { fontStyle: 'italic', opacity: 0.55 } : undefined}>
            {message.text}
          </span>

          {message.attachment && (
            <span className="flex items-center gap-2 mt-2 px-2.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 max-w-full">
              <Paperclip size={13} className="text-dim shrink-0" />
              <span className="text-[0.82rem] text-star truncate">{message.attachment.name}</span>
              <span className="font-mono text-[9px] text-dim shrink-0">{message.attachment.size}</span>
            </span>
          )}
        </div>

        {message.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions.map((r) => {
              const mineOn = r.by.includes(ME.id);
              return (
                <button
                  key={r.emoji}
                  type="button"
                  onClick={() => onReact(r.emoji)}
                  aria-pressed={mineOn}
                  title={mineOn ? 'Remove your reaction' : 'React'}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.8rem] transition-colors hover:scale-110"
                  style={
                    mineOn
                      ? { background: 'rgba(255,191,94,0.2)', border: '1px solid rgba(255,191,94,0.5)' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
                  }
                >
                  <span>{r.emoji}</span>
                  <span className="font-mono text-[9.5px] text-dim">{r.by.length}</span>
                </button>
              );
            })}
          </div>
        )}

        <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-dim/70 mt-1">
          {timeLabel(message.at)}{message.edited && ' · edited'}
        </span>
      </div>

      {/* Actions. Width is reserved always so the bubble never shifts. */}
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
              {QUICK_REACTIONS.map((e) => (
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
                  navigator.clipboard?.writeText(message.text || '');
                  toast.success('Copied');
                  close();
                }}
              />
              {mine ? (
                <>
                  {!message.deleted && (
                    <MenuItem icon={Pencil} label="Edit" onClick={() => { onEdit(); close(); }} />
                  )}
                  <MenuItem
                    icon={Trash2}
                    label="Delete for me"
                    danger
                    onClick={() => { onDeleteForMe(); close(); }}
                  />
                  {!message.deleted && (
                    <MenuItem
                      icon={Trash2}
                      label="Delete for everyone"
                      danger
                      onClick={() => { onDeleteForEveryone(); close(); }}
                    />
                  )}
                </>
              ) : (
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

/** Grouped picker — one flat wall of emoji is unusable past about twenty. */
function EmojiPicker({ onPick }) {
  const [group, setGroup] = useState(EMOJI_GROUPS[0].id);
  const current = EMOJI_GROUPS.find((g) => g.id === group) || EMOJI_GROUPS[0];

  return (
    <div className="mb-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
      <div className="flex gap-1 mb-2 overflow-x-auto scrollbar-hide">
        {EMOJI_GROUPS.map((g) => (
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

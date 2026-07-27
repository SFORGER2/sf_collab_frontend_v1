import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Paperclip, Search, Send, Smile, SmilePlus,
} from 'lucide-react';
import {
  EMOJI_GROUPS, ME, QUICK_REACTIONS, SAMPLE_CONVERSATIONS, timeLabel,
} from '@/services/mock/conversations';
import { Eyebrow, Tag } from '@/components/cosmos';

/**
 * Chat.
 *
 * Rebuilt on the cosmos surface with three things the old screen lacked:
 * something to look at (sample threads, so the layout can actually be judged),
 * reactions you can add rather than only read, and an emoji picker that is
 * grouped instead of one long wall.
 *
 * Reaction affordance was the specific complaint. Previously emoji were
 * decoration printed under a message; now hovering a bubble reveals a quick
 * row of the eight people actually reach for, tapping one toggles it, and an
 * existing reaction chip is itself the toggle. Nothing needs a menu.
 *
 * The old page is kept at /chat/legacy — it carries socket wiring and delivery
 * state this does not, and that is not something to delete on a rewrite's
 * first day.
 *
 * NOTE FOR BACKEND: threads from GET /api/chat/conversations, messages from
 * .../:id/messages, and POST .../:id/reactions { messageId, emoji } toggling
 * one row per user per emoji.
 */
export default function CosmosChatPage() {
  const [threads, setThreads] = useState(SAMPLE_CONVERSATIONS);
  const [activeId, setActiveId] = useState(SAMPLE_CONVERSATIONS[0].id);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const endRef = useRef(null);

  const active = threads.find((t) => t.id === activeId) || threads[0];

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

  /** Mark read on open — an unread badge that survives reading is a bug. */
  useEffect(() => {
    setThreads((ts) => ts.map((t) => (t.id === activeId ? { ...t, unread: 0 } : t)));
  }, [activeId]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setThreads((ts) =>
      ts.map((t) =>
        t.id === activeId
          ? {
              ...t,
              lastAt: Date.now(),
              messages: [...t.messages, { id: `m${Date.now()}`, from: 'me', at: Date.now(), text }],
            }
          : t
      )
    );
    setDraft('');
    setPickerOpen(false);
  };

  /** Toggle my reaction on a message. One row per user per emoji. */
  const react = (messageId, emoji) => {
    setThreads((ts) =>
      ts.map((t) => {
        if (t.id !== activeId) return t;
        return {
          ...t,
          messages: t.messages.map((m) => {
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
          }),
        };
      })
    );
  };

  return (
    <div className="w-full max-w-[1180px] mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <Eyebrow>Messages</Eyebrow>
          <h1 className="font-display text-[1.5rem] text-star mt-1 leading-tight">Conversations</h1>
        </div>
        <Tag tone="future" title="Threads come from the chat API once it is wired">
          Sample data
        </Tag>
      </div>

      <div
        className="cosmos-panel overflow-hidden grid"
        style={{ gridTemplateColumns: 'minmax(0,20rem) 1fr', height: 'min(72vh, 46rem)' }}
      >
        {/* ── Threads ─────────────────────────────────────────────────── */}
        <aside className="border-r border-white/[0.07] flex flex-col min-h-0">
          <div className="p-3.5 border-b border-white/[0.07]">
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

          <div className="flex-1 overflow-y-auto">
            {filtered.map((t) => {
              const last = t.messages[t.messages.length - 1];
              const isActive = t.id === active?.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  className="w-full flex items-start gap-3 px-3.5 py-3 text-left border-b border-white/[0.04] transition-colors"
                  style={isActive ? { background: 'rgba(255,191,94,0.08)', boxShadow: 'inset 2px 0 0 #ffbf5e' } : undefined}
                >
                  <Avatar user={t.user} />

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[0.88rem] text-star truncate flex-1">{t.user.name}</span>
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
              <p className="text-[0.85rem] text-dim text-center py-10">No conversations match.</p>
            )}
          </div>
        </aside>

        {/* ── Thread ──────────────────────────────────────────────────── */}
        <section className="flex flex-col min-h-0 min-w-0">
          <header className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.07]">
            <Avatar user={active.user} />
            <div className="min-w-0 flex-1">
              <Link
                to={`/user-profile?userId=${active.user.id}`}
                className="block text-[0.95rem] text-star hover:text-gold transition-colors truncate"
              >
                {active.user.name}
              </Link>
              <span className="flex items-center gap-1.5 text-[0.78rem] text-dim">
                {active.user.online && <span className="cosmos-live-dot text-emerald-400" />}
                {active.user.online ? 'Active now' : active.user.role}
              </span>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1">
            {active.messages.map((m, i) => (
              <Bubble
                key={m.id}
                message={m}
                prev={active.messages[i - 1]}
                onReact={(emoji) => react(m.id, emoji)}
              />
            ))}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-white/[0.07] p-3.5">
            {pickerOpen && <EmojiPicker onPick={(e) => setDraft((d) => d + e)} />}

            <div className="flex items-end gap-2">
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
                aria-label="Attach"
                className="p-2.5 rounded-xl text-dim hover:text-star hover:bg-white/[0.06] transition-colors shrink-0"
              >
                <Paperclip size={18} />
              </button>

              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                rows={1}
                placeholder="Write a message…  ⏎ to send, ⇧⏎ for a new line"
                className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[0.9rem] text-star placeholder-dim resize-none focus:outline-none focus:border-gold/50"
                style={{ maxHeight: '7rem' }}
              />

              <button
                type="button"
                onClick={send}
                disabled={!draft.trim()}
                aria-label="Send"
                className="p-2.5 rounded-xl shrink-0 transition-colors disabled:opacity-35"
                style={{ background: 'rgba(255,191,94,0.15)', color: '#ffbf5e' }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Avatar({ user }) {
  const initials = user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <span className="relative shrink-0">
      <span
        className="grid place-items-center w-10 h-10 rounded-full font-mono text-[11px]"
        style={{ background: 'rgba(139,108,255,0.18)', color: '#8b6cff' }}
      >
        {initials}
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
 * The quick-reaction row appears on hover and on keyboard focus — hover-only
 * would put it out of reach on touch, which is the same trap the dashboard
 * controls fell into.
 */
function Bubble({ message, prev, onReact }) {
  const mine = message.from === 'me';
  const grouped = prev && prev.from === message.from && message.at - prev.at < 5 * 60_000;
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className={`group/msg relative flex ${mine ? 'justify-end' : 'justify-start'} ${grouped ? 'mt-0.5' : 'mt-3'}`}>
      <div className={`max-w-[min(78%,34rem)] flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
        <div
          className="px-3.5 py-2.5 rounded-2xl text-[0.9rem] leading-relaxed"
          style={
            mine
              ? { background: 'rgba(255,191,94,0.14)', border: '1px solid rgba(255,191,94,0.28)', color: 'var(--color-star)' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'var(--color-star)' }
          }
        >
          {message.text}

          {message.attachment && (
            <span className="flex items-center gap-2 mt-2 px-2.5 py-2 rounded-xl bg-white/[0.05] border border-white/10">
              <Paperclip size={13} className="text-dim shrink-0" />
              <span className="text-[0.82rem] text-star truncate">{message.attachment.name}</span>
              <span className="font-mono text-[9px] text-dim shrink-0">{message.attachment.size}</span>
            </span>
          )}
        </div>

        {/* Existing reactions — each chip is its own toggle. */}
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
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.78rem] transition-colors"
                  style={
                    mineOn
                      ? { background: 'rgba(255,191,94,0.18)', border: '1px solid rgba(255,191,94,0.45)' }
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
          {timeLabel(message.at)}
        </span>
      </div>

      {/* Quick react — hover or focus, never hover alone. */}
      <div
        className={`absolute top-0 ${mine ? 'right-full mr-2' : 'left-full ml-2'} opacity-0 group-hover/msg:opacity-100 focus-within:opacity-100 transition-opacity`}
      >
        <button
          type="button"
          onClick={() => setShowPicker((p) => !p)}
          aria-label="Add reaction"
          className="p-1.5 rounded-lg text-dim hover:text-gold hover:bg-white/[0.08] transition-colors"
        >
          <SmilePlus size={15} />
        </button>

        {showPicker && (
          <div
            className="absolute z-20 top-8 right-0 flex gap-0.5 p-1.5 rounded-xl cosmos-panel"
            style={{ background: 'rgba(16,12,34,0.97)' }}
          >
            {QUICK_REACTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => { onReact(e); setShowPicker(false); }}
                className="w-8 h-8 grid place-items-center rounded-lg text-[1.05rem] hover:bg-white/10 hover:scale-125 transition-transform"
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Grouped picker — one flat wall of emoji is unusable past about twenty. */
function EmojiPicker({ onPick }) {
  const [group, setGroup] = useState(EMOJI_GROUPS[0].id);
  const current = EMOJI_GROUPS.find((g) => g.id === group) || EMOJI_GROUPS[0];

  return (
    <div className="mb-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
      <div className="flex gap-1 mb-2">
        {EMOJI_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGroup(g.id)}
            aria-pressed={group === g.id}
            className={`font-mono text-[9px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-full transition-colors ${
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

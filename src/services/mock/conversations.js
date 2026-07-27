/**
 * SAMPLE CONVERSATIONS.
 *
 * Chat was an empty shell: no threads, no messages, so there was nothing to
 * judge the layout against and no way to tell a broken renderer from an empty
 * inbox. These are real-shaped conversations — different lengths, unread
 * counts, reactions, attachments and one unanswered thread — because a chat UI
 * only shows its problems when the content is uneven.
 *
 * ⚠️ SAMPLE DATA. The chat page labels it; it must never merge with real
 * threads, and nothing here should ever be sendable to a real person.
 */

const min = (m) => Date.now() - m * 60_000;
const hr = (h) => Date.now() - h * 3_600_000;
const day = (d) => Date.now() - d * 86_400_000;

export const ME = { id: 'me', name: 'You' };

export const SAMPLE_CONVERSATIONS = [
  {
    id: 'c1',
    user: { id: 'sample-1', name: 'Ada Okonkwo', role: 'Founder & CEO', online: true },
    unread: 2,
    lastAt: min(4),
    messages: [
      { id: 'm1', from: 'sample-1', at: hr(3), text: 'Saw your profile on the Founder Match Vision — your matchmaking work is exactly the thing we keep failing at.' },
      { id: 'm2', from: 'me', at: hr(3) - 60000 * 8, text: 'Thanks! I looked at the Vision. The skills-plus-intent scoring is the interesting part — most tools stop at keywords.' },
      { id: 'm3', from: 'sample-1', at: hr(2), text: 'Exactly. Keyword matching is why every intro is cold. Would you want to take a look at what we have?', reactions: [{ emoji: '🔥', by: ['me'] }] },
      { id: 'm4', from: 'me', at: hr(2) - 60000 * 20, text: 'Yes. Send it over.' },
      { id: 'm5', from: 'sample-1', at: min(9), text: 'Here is the current scoring doc.', attachment: { name: 'match-scoring-v3.pdf', size: '840 KB' } },
      { id: 'm6', from: 'sample-1', at: min(4), text: 'No rush — read it whenever. Happy to walk through it on a call if easier.' },
    ],
  },
  {
    id: 'c2',
    user: { id: 'sample-2', name: 'Mikkel Rasmussen', role: 'Backend Engineer', online: true },
    unread: 0,
    lastAt: min(48),
    messages: [
      { id: 'm1', from: 'me', at: hr(5), text: 'Are you still looking for something part-time? The Ledger Vision needs a backend person who has done offline-first.' },
      { id: 'm2', from: 'sample-2', at: hr(4), text: 'I am, yes. SMS-first is a fun constraint — you cannot assume a round trip.' },
      { id: 'm3', from: 'me', at: hr(4) - 60000 * 15, text: 'That is exactly the hard part. Every state transition has to survive a dropped message.' },
      { id: 'm4', from: 'sample-2', at: min(48), text: 'Send me the repo and I will read through it this week.', reactions: [{ emoji: '👍', by: ['me'] }, { emoji: '🚀', by: ['me'] }] },
    ],
  },
  {
    id: 'c3',
    user: { id: 'sample-7', name: 'Kwame Boateng', role: 'Mentor · 2 exits', online: false },
    unread: 1,
    lastAt: hr(6),
    messages: [
      { id: 'm1', from: 'sample-7', at: day(1), text: 'Happy to do a session. Before we book it — what is the single decision you are stuck on?' },
      { id: 'm2', from: 'me', at: day(1) - 60000 * 90, text: 'Whether to raise now or wait until we have six months of retention data.' },
      { id: 'm3', from: 'sample-7', at: hr(6), text: 'Then that is the session. Bring whatever retention data you do have, even if it is four weeks — the shape matters more than the length.' },
    ],
  },
  {
    id: 'c4',
    user: { id: 'sample-8', name: 'Sofia Marchetti', role: 'Product Designer', online: false },
    unread: 0,
    lastAt: day(2),
    messages: [
      { id: 'm1', from: 'sample-8', at: day(2) - 60000 * 30, text: 'Design system kit is up on the marketplace if it is useful — 40 components, Figma and React.' },
      { id: 'm2', from: 'me', at: day(2), text: 'Picked it up. The form states alone saved me a day.', reactions: [{ emoji: '❤️', by: ['sample-8'] }] },
    ],
  },
  {
    id: 'c5',
    user: { id: 'sample-10', name: 'Nora Lindqvist', role: 'Investor · Pre-seed', online: false },
    unread: 0,
    lastAt: day(4),
    // Deliberately unanswered — an inbox where every thread is resolved is not
    // an inbox anyone recognises.
    messages: [
      { id: 'm1', from: 'sample-10', at: day(4), text: 'Following the Carbon Ledger Vision. When you have something on emissions methodology, I would like to read it.' },
    ],
  },
  {
    id: 'c6',
    user: { id: 'sample-16', name: 'Hana Suleiman', role: 'ML Engineer', online: true },
    unread: 0,
    lastAt: day(6),
    messages: [
      { id: 'm1', from: 'me', at: day(6) - 60000 * 45, text: 'Your evals Vision — are you scoring on a fixed set, or generating cases?' },
      { id: 'm2', from: 'sample-16', at: day(6), text: 'Fixed set for regression, generated for exploration. The generated ones find things nobody thought to write down.' },
    ],
  },
];

/** Reactions people actually reach for, in the order they reach for them. */
export const QUICK_REACTIONS = ['👍', '🔥', '❤️', '🎉', '👀', '😄', '🙏', '🚀'];

/** Emoji for the composer picker, grouped so the list isn't one long wall. */
export const EMOJI_GROUPS = [
  { id: 'reactions', label: 'Reactions', emoji: ['👍', '👎', '🔥', '❤️', '🎉', '👀', '🙏', '🤝', '💯', '⚡'] },
  { id: 'faces', label: 'Faces', emoji: ['😄', '😅', '😂', '🙂', '😉', '🤔', '😐', '😴', '😬', '🤯'] },
  { id: 'work', label: 'Work', emoji: ['🚀', '💡', '📈', '📉', '🛠️', '📝', '📌', '⏰', '✅', '🐛'] },
  { id: 'objects', label: 'Objects', emoji: ['💰', '🎯', '🧠', '☕', '🍕', '🌍', '🔒', '📦', '🏆', '✨'] },
];

export function timeLabel(ts) {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return 'now';
  const m = Math.floor(secs / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d` : new Date(ts).toLocaleDateString();
}

/** Sample threads when the API has none. Labelled, never blended. */
export function withConversationFallback(threads, { enabled = true } = {}) {
  if (!enabled) return { items: threads, isSample: false };
  if (Array.isArray(threads) && threads.length > 0) return { items: threads, isSample: false };
  return { items: SAMPLE_CONVERSATIONS, isSample: true };
}

/**
 * THE WINNERS FEED.
 *
 * Who won what, across the whole platform, newest first — and every name links
 * to a real profile. That last part is the point: an anonymous "someone just
 * won Elite" banner is indistinguishable from marketing, and everyone reads it
 * that way. A name you can click, whose profile you can look at, is evidence.
 *
 * ⚠️ FRONTEND MODEL ONLY.
 *
 * BACKEND: needs `GET /api/lottery/winners?limit=30` returning
 *   { success, data: { winners: [{ id, prizeId, wonAt,
 *       user: { id, firstName, lastName, picture } }] } }
 *
 * Only surface wins the winner has not made private, and never expose anything
 * beyond the public profile fields — this is a public feed.
 *
 * Until that route exists, `seedWinners()` generates a plausible feed from the
 * real prize table so the interface can be reviewed. It is clearly marked as
 * sample data in the UI; it must not ship as if it were real.
 */

import { PRIZES, PRIZES_BY_ID, chanceOf } from './lotteryPrizes';

const SAMPLE_PEOPLE = [
  { id: 'sample-1', firstName: 'Ada', lastName: 'Okonkwo' },
  { id: 'sample-2', firstName: 'Mikkel', lastName: 'Rasmussen' },
  { id: 'sample-3', firstName: 'Priya', lastName: 'Raghavan' },
  { id: 'sample-4', firstName: 'Tomás', lastName: 'Ferreira' },
  { id: 'sample-5', firstName: 'Yuki', lastName: 'Nakamura' },
  { id: 'sample-6', firstName: 'Lena', lastName: 'Hoffmann' },
  { id: 'sample-7', firstName: 'Kwame', lastName: 'Boateng' },
  { id: 'sample-8', firstName: 'Sofia', lastName: 'Marchetti' },
  { id: 'sample-9', firstName: 'Idris', lastName: 'Haddad' },
  { id: 'sample-10', firstName: 'Nora', lastName: 'Lindqvist' },
];

/**
 * A feed is boring if it's all common items and dishonest if it's all rare
 * ones. This draws from the real weights but lifts the floor slightly, because
 * a public feed genuinely does skew rare — nobody's "10 Credits" is news.
 */
function weightedSample() {
  const pool = PRIZES.map((p) => ({
    prize: p,
    w: chanceOf(p) ** 0.55, // flatten the curve without inverting it
  }));
  const total = pool.reduce((s, x) => s + x.w, 0);
  let t = Math.random() * total;
  for (const x of pool) {
    t -= x.w;
    if (t <= 0) return x.prize;
  }
  return PRIZES[0];
}

/** Sample feed, newest first, spread over the last few hours. */
export function seedWinners(count = 12) {
  // Gaps accumulate. Multiplying a fresh random by the index gave a feed whose
  // timestamps weren't monotonic — "33m ago" sitting above "32m ago".
  let elapsed = 0;
  const now = Date.now();

  return Array.from({ length: count }, (_, i) => {
    const prize = weightedSample();
    const person = SAMPLE_PEOPLE[Math.floor(Math.random() * SAMPLE_PEOPLE.length)];
    if (i > 0) elapsed += (4 + Math.random() * 21) * 60_000;

    return {
      id: `seed-${i}-${prize.id}`,
      prizeId: prize.id,
      wonAt: now - elapsed,
      user: person,
      sample: true,
    };
  });
}

/**
 * Fetch the real feed, falling back to sample data.
 * Returns `{ winners, isSample }` so the UI can say which it's showing.
 */
export async function fetchWinners(limit = 12) {
  try {
    const res = await fetch(`/api/lottery/winners?limit=${limit}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(String(res.status));

    const body = await res.json();
    const winners = body?.data?.winners || body?.winners;
    if (!Array.isArray(winners) || winners.length === 0) throw new Error('empty');

    return { winners, isSample: false };
  } catch {
    return { winners: seedWinners(limit), isSample: true };
  }
}

/** Resolve a feed entry to its prize, tolerating unknown ids. */
export function prizeFor(entry) {
  return PRIZES_BY_ID[entry?.prizeId] || null;
}

/** "4m ago" — compact enough for a dense list. */
export function timeAgo(ts) {
  const secs = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Where a winner's name links to. */
export function profileHref(user) {
  return user?.id ? `/user-profile?userId=${user.id}` : null;
}

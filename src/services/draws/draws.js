/**
 * DRAWS — daily and weekly prize pools.
 *
 * Members stake SF Coins or SF Crystals into a pool; when it closes, winners are
 * drawn and prizes are awarded. Odds are proportional to stake, which keeps it
 * participatory rather than pay-to-win: a large stake improves your chances but
 * never guarantees a win, and every entry has non-zero odds.
 *
 * ⚠️  FRONTEND MODEL ONLY — NOT THE SOURCE OF TRUTH.
 * Draw state, entry validation, the RNG and prize settlement must all live on
 * the backend. A client-side draw is trivially manipulated, and anything
 * involving stakes and prizes needs a server-side audit trail. This module
 * exists so the interface can be designed and reviewed; treat it as the
 * contract to implement.
 *
 * Two currencies, deliberately distinct:
 *   SF Coins    — earned through contribution. The everyday stake.
 *   SF Crystals — scarce, earned rarely. Weight more heavily in premium draws.
 */

export const CURRENCIES = {
  coins: { id: 'coins', name: 'SF Coins', accent: '#ffbf5e', weight: 1 },
  crystals: { id: 'crystals', name: 'SF Crystals', accent: '#4fd8ff', weight: 10 },
};

export const PRIZE_KINDS = {
  subscription: { label: 'Subscription', accent: '#ffbf5e' },
  credits: { label: 'Credits', accent: '#8b6cff' },
  badge: { label: 'Badge', accent: '#3ee6a0' },
  coins: { label: 'SF Coins', accent: '#ffbf5e' },
  feature: { label: 'Feature spot', accent: '#ff4fd8' },
};

/**
 * Prizes are role-specific.
 *
 * A month of the Founder plan is worthless to a builder, and a featured Vision
 * slot means nothing to a mentor. Each role's pool pays out in things that
 * advance *that* role — the generic catalogue that shipped first was the wrong
 * shape for four of the five profiles.
 *
 * Credits and SF Coins appear everywhere because they are universally useful;
 * everything else is tailored.
 */
const ROLE_PRIZES = {
  founder: {
    daily: [
      { kind: 'credits', label: '250 credits', count: 3 },
      { kind: 'coins', label: '1,000 SF Coins', count: 5 },
      { kind: 'badge', label: 'Daily Spark badge', count: 10 },
    ],
    weekly: [
      { kind: 'subscription', label: '1 month Founder plan', count: 1 },
      { kind: 'feature', label: 'Vision featured for a week', count: 2 },
      { kind: 'credits', label: '2,000 credits — enough for a pitch deck', count: 3 },
      { kind: 'badge', label: 'Orbit badge', count: 20 },
    ],
  },
  builder: {
    daily: [
      { kind: 'credits', label: '250 credits', count: 3 },
      { kind: 'coins', label: '1,000 SF Coins', count: 5 },
      { kind: 'badge', label: 'Daily Spark badge', count: 10 },
    ],
    weekly: [
      { kind: 'subscription', label: '1 month Builder plan', count: 2 },
      { kind: 'feature', label: 'Profile boosted to founders hiring', count: 3 },
      { kind: 'credits', label: '2,000 credits', count: 3 },
      { kind: 'badge', label: 'Proven Builder badge', count: 20 },
    ],
  },
  mentor: {
    daily: [
      { kind: 'credits', label: '250 credits', count: 3 },
      { kind: 'coins', label: '1,000 SF Coins', count: 5 },
      { kind: 'badge', label: 'Daily Spark badge', count: 10 },
    ],
    weekly: [
      { kind: 'feature', label: 'Top placement in the mentor directory', count: 2 },
      { kind: 'subscription', label: '1 month Builder plan', count: 1 },
      { kind: 'credits', label: '2,000 credits', count: 3 },
      { kind: 'badge', label: 'Trusted Mentor badge', count: 15 },
    ],
  },
  influencer: {
    daily: [
      { kind: 'credits', label: '250 credits — caption and video generation', count: 3 },
      { kind: 'coins', label: '1,000 SF Coins', count: 5 },
      { kind: 'badge', label: 'Daily Spark badge', count: 10 },
    ],
    weekly: [
      { kind: 'feature', label: 'Featured creator slot for a week', count: 2 },
      { kind: 'subscription', label: '1 month Builder plan', count: 1 },
      { kind: 'credits', label: '2,000 credits — roughly 25 videos', count: 3 },
      { kind: 'badge', label: 'Signal Booster badge', count: 20 },
    ],
  },
  investor: {
    daily: [
      { kind: 'credits', label: '250 credits', count: 3 },
      { kind: 'coins', label: '1,000 SF Coins', count: 5 },
      { kind: 'badge', label: 'Daily Spark badge', count: 10 },
    ],
    weekly: [
      { kind: 'feature', label: 'Early access to new Visions for a week', count: 2 },
      { kind: 'subscription', label: '1 month Scale plan', count: 1 },
      { kind: 'credits', label: '2,000 credits', count: 3 },
      { kind: 'badge', label: 'Early Backer badge', count: 15 },
    ],
  },
  member: {
    daily: [
      { kind: 'credits', label: '250 credits', count: 3 },
      { kind: 'coins', label: '1,000 SF Coins', count: 5 },
      { kind: 'badge', label: 'Daily Spark badge', count: 10 },
    ],
    weekly: [
      { kind: 'subscription', label: '1 month Builder plan', count: 1 },
      { kind: 'credits', label: '2,000 credits', count: 3 },
      { kind: 'badge', label: 'Orbit badge', count: 20 },
    ],
  },
};

const DRAW_SHELLS = [
  {
    id: 'daily-spark',
    name: 'Daily Spark',
    cadence: 'daily',
    accent: '#ffbf5e',
    description: 'A small pool that resets every day. Low stakes, quick odds.',
    minStake: 10,
    currency: 'coins',
  },
  {
    id: 'weekly-orbit',
    name: 'Weekly Orbit',
    cadence: 'weekly',
    accent: '#8b6cff',
    description: 'A larger weekly pool. SF Crystals count for ten times their number.',
    minStake: 50,
    currency: 'coins',
    allowCrystals: true,
  },
];

/**
 * The draw catalogue for a given role. Replace with GET /api/draws?role=…
 * `closesAt` should be an ISO string from the server; the countdown is derived.
 */
export function drawsForRole(role = 'member') {
  const prizes = ROLE_PRIZES[role] || ROLE_PRIZES.member;
  return DRAW_SHELLS.map((shell) => ({
    ...shell,
    prizes: prizes[shell.cadence] || [],
  }));
}

/** Backwards-compatible default (member pool). */
export const DRAWS = drawsForRole('member');

const STORAGE_KEY = 'sfc.draws';

export function readDrawState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || { entries: {} };
  } catch {
    return { entries: {} };
  }
}

export function writeDrawState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent('sfc:draws-changed'));
}

/** Next reset — daily at midnight, weekly on Monday. Server should own this. */
export function nextClose(cadence) {
  const now = new Date();
  const next = new Date(now);
  next.setHours(0, 0, 0, 0);

  if (cadence === 'weekly') {
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    next.setDate(next.getDate() + daysUntilMonday);
  } else {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

export function formatCountdown(target) {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return 'Closing…';

  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return `${h}h ${m}m`;
}

/**
 * Your share of a pool, as a percentage. Proportional to weighted stake, so the
 * displayed odds are honest rather than a vague "better chance".
 */
export function winChance(myStake, poolStake) {
  if (!myStake) return 0;
  const total = Math.max(poolStake, myStake);
  return Math.min(100, (myStake / total) * 100);
}

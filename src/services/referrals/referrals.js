/**
 * REFERRALS.
 *
 * A referral programme is easy to build badly: pay for signups and you buy
 * bots. So nothing pays out at signup here. Rewards unlock at the points where
 * the person you brought in has actually done something — completed a profile,
 * made a contribution, subscribed — because those are the moments where they
 * became worth having, and they're expensive to fake.
 *
 * Both sides are paid. A one-sided programme makes the referrer a salesperson;
 * paying both makes the invite a favour.
 *
 * ⚠️ FRONTEND MODEL ONLY. Attribution, fraud checks and payouts are all
 * server-side. A client that can claim its own referral rewards will.
 *
 * BACKEND:
 *   GET  /api/referrals            → { code, stats, referred: [...] }
 *   POST /api/referrals/claim/:id  → pays a specific unlocked milestone
 * Self-referral, shared-device and disposable-email checks belong there too.
 */

export const MILESTONES = [
  {
    id: 'joined',
    label: 'They join',
    detail: 'Signed up with your link',
    youGet: { crystals: 0, coins: 100 },
    theyGet: { crystals: 0, coins: 100 },
    // Deliberately no crystals: signup is the cheapest thing in the world to
    // fake, so it pays in the soft currency only.
    accent: '#a9a2c2',
  },
  {
    id: 'profile',
    label: 'They complete their profile',
    detail: 'Above 70% complete, with a verified email',
    youGet: { crystals: 50, coins: 200 },
    theyGet: { crystals: 50, coins: 200 },
    accent: '#4fd8ff',
  },
  {
    id: 'contribution',
    label: 'They contribute',
    detail: 'First accepted contribution, task or Vision join',
    youGet: { crystals: 150, coins: 500 },
    theyGet: { crystals: 150, coins: 500 },
    accent: '#3ee6a0',
  },
  {
    id: 'subscribe',
    label: 'They subscribe',
    detail: 'Any paid plan, after the first month clears',
    youGet: { crystals: 600, coins: 1000 },
    theyGet: { crystals: 300, coins: 500 },
    accent: '#ffbf5e',
  },
];

/** Tiers reward people who bring in a lot of the right kind of person. */
export const TIERS = [
  { id: 'seed', label: 'Seed', min: 0, multiplier: 1, accent: '#a9a2c2' },
  { id: 'orbit', label: 'Orbit', min: 5, multiplier: 1.15, accent: '#4fd8ff' },
  { id: 'nova', label: 'Nova', min: 15, multiplier: 1.35, accent: '#8b6cff' },
  { id: 'nebula', label: 'Nebula', min: 40, multiplier: 1.6, accent: '#ffbf5e' },
];

/** Tier is driven by *activated* referrals, not signups — same reason as above. */
export function tierFor(activatedCount = 0) {
  return [...TIERS].reverse().find((t) => activatedCount >= t.min) || TIERS[0];
}

export function nextTier(activatedCount = 0) {
  return TIERS.find((t) => t.min > activatedCount) || null;
}

/** Total crystals earned so far, with the tier multiplier applied. */
export function totalEarned(referred = []) {
  const activated = referred.filter((r) => r.milestones?.length > 1).length;
  const mult = tierFor(activated).multiplier;

  const base = referred.reduce((sum, r) => {
    const hit = (r.milestones || []).map((id) => MILESTONES.find((m) => m.id === id));
    return sum + hit.reduce((s, m) => s + (m?.youGet.crystals || 0), 0);
  }, 0);

  return Math.round(base * mult);
}

export function buildLink(code) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/join-sf?ref=${code}`;
}

/** Stable per-user code. The server owns the real one; this is for review. */
export function codeFor(user) {
  const base = (user?.firstName || user?.first_name || 'sf').toLowerCase().replace(/[^a-z]/g, '');
  const id = String(user?.id || '0').replace(/\D/g, '').slice(-4).padStart(4, '0');
  return `${base.slice(0, 6)}${id}`;
}

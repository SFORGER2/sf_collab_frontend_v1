/**
 * ENTITLEMENTS
 * ============
 *
 * One place that answers: "can this user, on this plan, with these credits,
 * do this thing right now?" Every gated surface in the app reads from here so
 * limits stay consistent instead of being reinvented per screen.
 *
 * ⚠️  FRONTEND SHAPING ONLY — NOT SECURITY.
 * Everything here is advisory: it decides what to show and what to blur. The
 * backend must enforce the same limits on every endpoint, because a user can
 * trivially edit localStorage or call the API directly. Treat this file as the
 * contract the backend needs to mirror, not as the enforcement point.
 *
 * The plan and balance currently come from localStorage so the UI is reviewable
 * without a backend. Replace `readAccount()` with the real
 * GET /api/billing/account response — the rest of the app talks to this module,
 * not to storage, so that swap is a single-function change.
 */

// Plan definitions are role-specific and live in ./plans.js — each role has its
// own four-step ladder plus an Enterprise tier. This module resolves whichever
// tier the account is on against the ladder for the role they are working as.
import { plansForRole } from './plans';

export { TIERS as PLAN_ORDER } from './plans';

/**
 * Credit cost per metered action.
 *
 * ⚠️ ALL AI TOOLS ARE PRICED IN CREDITS, NEVER SF Coins. SF Coins are earned
 * through contribution and spent in the store and draws; credits are bought and
 * spent on compute. Keeping them separate is what stops earned reputation from
 * being convertible into unlimited AI usage.
 *
 * PRICING BASIS: costs are set at roughly 3× our expected token cost at the
 * *most expensive* credit pack rate (Spark, $0.05/credit), giving ~3× margin at
 * the worst-case purchase price and more on larger packs. These are placeholder
 * economics — revisit once real usage data exists.
 */
export const CREDIT_COSTS = {
  matchSuggestion: 5,
  assistantMessage: 1,
  aiGeneration: 10,
  pitchDeck: 60,
  businessPlan: 40,
  videoGeneration: 80,
  logoGeneration: 15,
  captionGeneration: 8,
  dataScrape: 12,
  imageGeneration: 20,
};

/**
 * Length-based pricing.
 *
 * Generation cost scales with output size, because a 200-word answer and a
 * 20-page business plan are not the same amount of compute. Cost is the base
 * price scaled by size tier, rounded up so we never undercharge.
 *
 * @param {string} action  key in CREDIT_COSTS
 * @param {number} units   words in, or expected out — whichever the caller meters
 */
export const SIZE_TIERS = [
  { id: 'short', label: 'Short', maxUnits: 300, multiplier: 1 },
  { id: 'standard', label: 'Standard', maxUnits: 1200, multiplier: 2 },
  { id: 'long', label: 'Long', maxUnits: 4000, multiplier: 4 },
  { id: 'extended', label: 'Extended', maxUnits: Infinity, multiplier: 8 },
];

export function tierFor(units = 0) {
  return SIZE_TIERS.find((t) => units <= t.maxUnits) || SIZE_TIERS[SIZE_TIERS.length - 1];
}

export function creditCostFor(action, units = 0) {
  const base = CREDIT_COSTS[action] ?? 0;
  return Math.ceil(base * tierFor(units).multiplier);
}

export const CREDIT_PACKS = [
  { id: 'spark', name: 'Spark', credits: 100, price: 5, accent: '#ffbf5e' },
  { id: 'orbit', name: 'Orbit', credits: 500, price: 20, accent: '#4fd8ff', bonus: 50 },
  { id: 'nebula', name: 'Nebula', credits: 1500, price: 50, accent: '#8b6cff', bonus: 300, popular: true },
  { id: 'galaxy', name: 'Galaxy', credits: 5000, price: 150, accent: '#ff4fd8', bonus: 1500 },
];

/** Features that never cost anything — knowing this prevents over-gating. */
export const ALWAYS_FREE = ['ai-news', 'knowledge', 'posts', 'connections', 'discover-startups'];

const STORAGE_KEY = 'sfc.entitlements';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Reads the local account snapshot. Replace with the billing API response.
 * Usage counters reset when the date rolls over.
 */
export function readAccount() {
  let raw = null;
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    raw = null;
  }

  const base = {
    planId: 'free',
    credits: 120,
    usage: {},
    usageDate: todayKey(),
    adsEnabled: true,
    ...(raw || {}),
  };

  if (base.usageDate !== todayKey()) {
    base.usage = {};
    base.usageDate = todayKey();
  }

  return base;
}

export function writeAccount(account) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  } catch {
    /* storage unavailable — limits simply won't persist across reloads */
  }
  window.dispatchEvent(new CustomEvent('sfc:entitlements-changed'));
}

/**
 * Resolve a tier id against a role's ladder.
 *
 * The same tier id means different limits depending on the role — "pro" gives a
 * founder 15 Visions and a builder 50 applications. When no role is passed we
 * fall back to whichever role the user is currently working as.
 */
export function getPlan(planId, role) {
  const activeRole = role || (() => {
    try { return localStorage.getItem('activeRole') || 'member'; } catch { return 'member'; }
  })();

  const ladder = plansForRole(activeRole);
  return ladder.find((p) => p.id === planId) || ladder[0];
}

/**
 * Whether an action is available, and why not if it isn't.
 *
 * @returns {{allowed:boolean, reason:'ok'|'limit'|'credits', used:number,
 *            limit:number, remaining:number, creditCost:number,
 *            canUseCredits:boolean}}
 */
export function checkLimit(account, limitKey, creditKey) {
  const plan = getPlan(account.planId);
  const limit = plan.limits[limitKey] ?? Infinity;
  const used = account.usage[limitKey] || 0;
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used);
  const creditCost = creditKey ? CREDIT_COSTS[creditKey] ?? 0 : 0;
  const canUseCredits = Boolean(creditKey) && account.credits >= creditCost;

  if (remaining > 0) {
    return { allowed: true, reason: 'ok', used, limit, remaining, creditCost, canUseCredits };
  }
  if (canUseCredits) {
    return { allowed: true, reason: 'credits', used, limit, remaining: 0, creditCost, canUseCredits };
  }
  return { allowed: false, reason: 'limit', used, limit, remaining: 0, creditCost, canUseCredits };
}

/**
 * Consume one unit of an allowance, spending credits if the daily limit is
 * already exhausted. Returns the updated account, or null if it wasn't allowed.
 */
export function consume(account, limitKey, creditKey) {
  const check = checkLimit(account, limitKey, creditKey);
  if (!check.allowed) return null;

  const next = { ...account, usage: { ...account.usage } };

  if (check.reason === 'credits') {
    next.credits = Math.max(0, next.credits - check.creditCost);
  } else {
    next.usage[limitKey] = (next.usage[limitKey] || 0) + 1;
  }

  writeAccount(next);
  return next;
}

/** Ads show on ad-supported plans, unless an admin has switched them off. */
export function shouldShowAds(account) {
  return getPlan(account.planId).showsAds && account.adsEnabled !== false;
}

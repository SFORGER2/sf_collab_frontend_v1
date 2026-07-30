/**
 * SF CRYSTALS — the hard currency.
 *
 * Three currencies now, each with a job:
 *   SF Coins  — earned by contributing. Soft, plentiful, cosmetic purchases.
 *   Credits   — metered platform usage: AI generation, matchmaking, tools.
 *   Crystals  — scarce. Bought with money or earned rarely. The only thing the
 *               lottery accepts and the only thing items trade for.
 *
 * Crystals are deliberately the narrow currency. Putting the lottery and
 * player-to-player trading on the same scarce token means one exchange rate to
 * reason about instead of three, and it keeps the gambling surface away from
 * the credits people need for actual work — nobody should have to choose
 * between a pitch deck and a roll.
 *
 * ⚠️ FRONTEND MODEL ONLY. Balances, conversion and every trade must be
 * server-side and transactional. A client that can write its own crystal
 * balance can buy the whole catalogue.
 *
 * BACKEND:
 *   GET  /api/wallet                          → { coins, credits, crystals }
 *   POST /api/wallet/convert  { usd }         → charges, credits crystals
 *   POST /api/trades          { toUserId, itemIds[], askCrystals }
 *   POST /api/trades/:id/accept | /decline
 * Trades must move item and crystals atomically, or one side loses both.
 */

const KEY = 'sfc.wallet.crystals';
const TRADES_KEY = 'sfc.trades.v1';

/** Starting balance for review builds only — the server owns the real one. */
const DEV_START = 240;

/**
 * Conversion tiers.
 *
 * Bigger purchases get more per dollar, which is standard and also honest —
 * the payment processing fee is close to fixed per transaction, so small
 * top-ups genuinely cost more to serve.
 */
export const CONVERSION_TIERS = [
  { id: 'small', usd: 5, crystals: 500, bonus: 0 },
  { id: 'medium', usd: 10, crystals: 1100, bonus: 10 },
  { id: 'large', usd: 25, crystals: 2900, bonus: 16 },
  { id: 'xl', usd: 50, crystals: 6250, bonus: 25 },
  { id: 'max', usd: 100, crystals: 13500, bonus: 35 },
];

/** Base rate, used for the custom-amount field. */
export const BASE_RATE = 100; // crystals per USD before any bonus

export function crystalsForUsd(usd) {
  const tier = [...CONVERSION_TIERS].reverse().find((t) => usd >= t.usd);
  const bonus = tier ? tier.bonus : 0;
  return Math.floor(usd * BASE_RATE * (1 + bonus / 100));
}

export function balance() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw == null ? DEV_START : Number(raw) || 0;
  } catch {
    return DEV_START;
  }
}

function setBalance(next) {
  try {
    localStorage.setItem(KEY, String(Math.max(0, Math.round(next))));
  } catch {
    /* storage blocked */
  }
  window.dispatchEvent(new CustomEvent('sfc:crystals'));
  return balance();
}

export function add(amount) {
  return setBalance(balance() + amount);
}

/** Returns false rather than going negative, so callers must check. */
export function spend(amount) {
  if (balance() < amount) return false;
  setBalance(balance() - amount);
  return true;
}

export function subscribe(fn) {
  const handler = () => fn(balance());
  window.addEventListener('sfc:crystals', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('sfc:crystals', handler);
    window.removeEventListener('storage', handler);
  };
}

/* ── Player-to-player trading ──────────────────────────────────────────── */

export const TRADE_STATES = {
  pending: { id: 'pending', label: 'Awaiting response', accent: '#ffbf5e' },
  accepted: { id: 'accepted', label: 'Accepted', accent: '#3ee6a0' },
  declined: { id: 'declined', label: 'Declined', accent: '#a9a2c2' },
};

/**
 * The platform's cut on a trade.
 *
 * Non-zero on purpose: a frictionless trade market turns into a wash-trading
 * machine for moving crystals between alt accounts. 5% is small enough to
 * ignore for a real trade and large enough to make laundering pointless.
 */
export const TRADE_FEE_PCT = 5;

export function feeFor(askCrystals) {
  return Math.ceil(askCrystals * (TRADE_FEE_PCT / 100));
}

export function readTrades() {
  try {
    const raw = JSON.parse(localStorage.getItem(TRADES_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeTrades(list) {
  try {
    localStorage.setItem(TRADES_KEY, JSON.stringify(list));
  } catch {
    /* storage blocked */
  }
  window.dispatchEvent(new CustomEvent('sfc:trades'));
  return list;
}

/** List an owned item for crystals. */
export function listForTrade({ itemId, askCrystals, note = '' }) {
  const trade = {
    id: `t-${Date.now()}-${itemId}`,
    itemId,
    askCrystals,
    note,
    status: 'pending',
    createdAt: Date.now(),
    fee: feeFor(askCrystals),
  };
  writeTrades([trade, ...readTrades()]);
  return trade;
}

export function cancelTrade(id) {
  return writeTrades(readTrades().filter((t) => t.id !== id));
}

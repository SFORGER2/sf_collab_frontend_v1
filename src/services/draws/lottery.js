/**
 * LOTTERY — one roll, one prize out of thirty.
 *
 * Rebuilt from a three-reel match-3 into a case-opening. Match-3 with thirty
 * distinct prizes gives absurd odds and, worse, most rolls end in "no match" —
 * nothing happens, which is the least interesting outcome a machine can
 * produce. Here every roll wins *something*; the question is what, and most of
 * the time it's worth less than the ticket. That is the honest version of the
 * mechanic and it's also the one that's fun to watch.
 *
 * The reel is a strip of prize tiles that decelerates onto the won item.
 *
 * ⚠️  FRONTEND MODEL ONLY — NOT THE SOURCE OF TRUTH.
 * `roll()` uses Math.random in the browser. Fine for designing and reviewing
 * the interface, useless for anything real: a client that decides its own
 * outcome will decide to win. The backend must own the RNG, the ticket debit,
 * the prize grant and the audit trail.
 *
 *   POST /api/lottery/roll  → { prizeId, rollId, balance, wonAt }
 *
 * `rollWith(prizeId)` exists so the server's answer can drive the same
 * animation without the client ever picking.
 */

import { PRIZES, PRIZES_BY_ID, TOTAL_WEIGHT, chanceOf } from './lotteryPrizes';

export { PRIZES, PRIZES_BY_ID, JACKPOT, RARITIES, KINDS, oddsLabel, byRarity, chanceOf }
  from './lotteryPrizes';

/**
 * SF Crystals per ticket — crystals, not credits.
 *
 * The lottery moved onto crystals so the gambling surface never competes with
 * the credits people need for actual work; nobody should have to choose
 * between a pitch deck and a roll. At 100 crystals per dollar that puts a roll
 * at about $2.50.
 */
export const TICKET_COST = 250;

/**
 * Prize `value` in lotteryPrizes.js is a *credit*-equivalent worth, kept on
 * that scale so the catalogue stays readable ("900 Credits" really is 900).
 * Crystals are the scarcer token, so converting the two needs this factor —
 * without it RTP silently reads 8.9% and the table looks broken when it isn't.
 */
export const CRYSTALS_PER_VALUE_UNIT = 10;

/** What should come back to players, as a fraction of stakes. */
export const RTP_TARGET = 0.85;

/**
 * Return to player: expected crystal-equivalent value per crystal staked.
 *
 * Worth stating plainly — most items are worth less than the ticket, so the
 * table only balances because of the rare tail. Check this after any change to
 * a weight, a value or the ticket price; thirty weights against thirty values
 * is very easy to get quietly wrong.
 */
export function rtp() {
  return expectedValue() / TICKET_COST;
}

/** Expected crystal value of a single roll. */
export function expectedValue() {
  return PRIZES.reduce(
    (sum, p) => sum + chanceOf(p) * p.value * CRYSTALS_PER_VALUE_UNIT,
    0
  );
}

/** How much of the return comes from the rare tail rather than the filler. */
export function tailShare() {
  const rare = PRIZES.filter((p) => ["rare", "epic", "legendary", "mythic"].includes(p.rarity));
  const fromTail = rare.reduce((sum, p) => sum + chanceOf(p) * p.value * CRYSTALS_PER_VALUE_UNIT, 0);
  return fromTail / expectedValue();
}

/**
 * Weighted draw across the whole catalogue.
 * @returns {{ prize: object, rolledAt: number }}
 */
export function roll() {
  let ticket = Math.random() * TOTAL_WEIGHT;
  for (const prize of PRIZES) {
    ticket -= prize.weight;
    if (ticket <= 0) return { prize, rolledAt: Date.now() };
  }
  // Floating-point exhaustion — fall back to the last item rather than null.
  return { prize: PRIZES[PRIZES.length - 1], rolledAt: Date.now() };
}

/** Score a server-decided result, so the client never picks the outcome. */
export function rollWith(prizeId) {
  return { prize: PRIZES_BY_ID[prizeId] || PRIZES[0], rolledAt: Date.now() };
}

/** Did this roll beat the ticket price? Drives the win/loss framing. */
export function beatTheStake(prize) {
  return prize.value * CRYSTALS_PER_VALUE_UNIT > TICKET_COST;
}

/**
 * Dev-time guard. The catalogue is thirty weights against thirty values; it is
 * very easy to change one and quietly hand out free subscriptions forever.
 */
if (import.meta.env?.DEV) {
  const actual = rtp();
  if (Math.abs(actual - RTP_TARGET) > 0.1) {
    console.warn(
      `[lottery] RTP is ${(actual * 100).toFixed(1)}%, target ${(RTP_TARGET * 100).toFixed(0)}%. ` +
        'Prize weights and values are out of balance — see services/draws/lotteryPrizes.js'
    );
  }
}

/* ── Local roll history ──────────────────────────────────────────────────
   The player's own rolls, so the page has something to show before the
   backend exists. Capped — this is a review aid, not a ledger. */

const HISTORY_KEY = 'sfc.lottery.history';
const HISTORY_MAX = 20;

export function readHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(raw) ? raw.slice(0, HISTORY_MAX) : [];
  } catch {
    return [];
  }
}

export function pushHistory(prize) {
  const entry = { at: Date.now(), prizeId: prize.id };
  const next = [entry, ...readHistory()].slice(0, HISTORY_MAX);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* storage blocked — history is cosmetic */
  }
  return next;
}

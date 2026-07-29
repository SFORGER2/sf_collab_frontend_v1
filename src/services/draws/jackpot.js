/**
 * THE JACKPOT — three reels, three matches.
 *
 * Separate from the lottery on purpose. The lottery is a case-opening: every
 * roll wins something, most of it small, and the appeal is the reveal. The
 * jackpot is the opposite shape — most rolls win nothing at all, and the appeal
 * is the tiny chance of a very large payout. Putting both on one page would
 * have meant one of them pretending to be the other.
 *
 * Eight symbols per reel. Three of a kind pays by symbol; two of a kind returns
 * part of the ticket so a near-miss isn't a dead loss. Everything is crystals.
 *
 * Eight, not six, for an arithmetic reason worth recording: at 400 crystals a
 * spin, a six-symbol reel puts any specific triple at 1 in 216, and a year of
 * Elite at that frequency costs 555 crystals per spin to fund — the machine
 * would pay out 226% of what it took in. Eight symbols makes it 1 in 512 and
 * the top prize affordable without cheapening it.
 *
 * ⚠️ FRONTEND MODEL ONLY. Same warning as lottery.js — the RNG, the debit and
 * the payout must be server-side. `spinWith(reels)` scores a server result.
 *
 * BACKEND: POST /api/jackpot/spin → { reels: [a,b,c], outcome, payout, balance }
 */

/** Crystals per spin. Higher than a lottery ticket — the tail is much longer. */
export const SPIN_COST = 400;

export const RTP_TARGET = 0.85;

/**
 * Eight symbols, each on every reel once, so P(any specific triple) = 1/512.
 * A flat reel keeps the odds legible: people can count the symbols and check.
 */
export const SYMBOLS = [
  { id: 'dust', glyph: '·', name: 'Dust', accent: '#6d6588', triple: 100, grant: { crystals: 100 } },
  { id: 'chip', glyph: '▫', name: 'Chip', accent: '#a9a2c2', triple: 200, grant: { crystals: 200 } },
  { id: 'coin', glyph: '●', name: 'Coin', accent: '#3ee6a0', triple: 2000, grant: { coins: 8000 } },
  { id: 'crystal', glyph: '◆', name: 'Crystal', accent: '#4fd8ff', triple: 3000, grant: { crystals: 3000 } },
  { id: 'spark', glyph: '✧', name: 'Spark', accent: '#ff6fd8', triple: 5000, grant: { crystals: 5000 } },
  { id: 'orbit', glyph: '◎', name: 'Orbit', accent: '#8b6cff', triple: 9000, grant: { plan: 'starter', months: 3 } },
  { id: 'crown', glyph: '♛', name: 'Crown', accent: '#ffbf5e', triple: 18000, grant: { plan: 'pro', months: 3 } },
  { id: 'nova', glyph: '☄', name: 'Nova', accent: '#ff6f3c', triple: 120000, grant: { plan: 'elite', months: 12 }, jackpot: true },
];

export const SYMBOLS_BY_ID = Object.fromEntries(SYMBOLS.map((s) => [s.id, s]));

/** Two of a kind returns this fraction of the ticket, in crystals. */
export const NEAR_MISS_RETURN = 0.25;

const N = SYMBOLS.length;

/** P(three of a specific symbol) = (1/8)³ = 1/512. */
export function tripleOdds() {
  return 1 / N ** 3;
}

/** P(any triple) = 8/512 = 1/64. */
export function anyTripleOdds() {
  return N / N ** 3;
}

/** P(exactly two matching) = symbols · 3 · p² · (1−p). */
export function nearMissOdds() {
  const p = 1 / N;
  return N * 3 * p * p * (1 - p);
}

export function oddsLabel(symbol) {
  return `1 in ${(N ** 3).toLocaleString()}`;
}

/** Expected crystals back per spin. */
export function expectedValue() {
  const fromTriples = SYMBOLS.reduce((sum, s) => sum + tripleOdds() * s.triple, 0);
  const fromNear = nearMissOdds() * SPIN_COST * NEAR_MISS_RETURN;
  return fromTriples + fromNear;
}

export function rtp() {
  return expectedValue() / SPIN_COST;
}

export function spin() {
  const reels = [0, 1, 2].map(() => SYMBOLS[Math.floor(Math.random() * N)].id);
  return settle(reels);
}

/** Score a set of reels — split out so a server result runs the same path. */
export function settle(reels) {
  const [a, b, c] = reels;

  if (a === b && b === c) {
    const symbol = SYMBOLS_BY_ID[a];
    return {
      reels,
      outcome: symbol.jackpot ? 'jackpot' : 'triple',
      symbol,
      payout: symbol.triple,
      rolledAt: Date.now(),
    };
  }

  const pair = a === b ? a : b === c ? b : a === c ? a : null;
  if (pair) {
    return {
      reels,
      outcome: 'near',
      symbol: SYMBOLS_BY_ID[pair],
      payout: Math.round(SPIN_COST * NEAR_MISS_RETURN),
      rolledAt: Date.now(),
    };
  }

  return { reels, outcome: 'none', symbol: null, payout: 0, rolledAt: Date.now() };
}

export function spinWith(reels) {
  return settle(reels);
}

/** Dev guard — six payouts against one probability is easy to get wrong. */
if (import.meta.env?.DEV) {
  const actual = rtp();
  if (Math.abs(actual - RTP_TARGET) > 0.1) {
    console.warn(
      `[jackpot] RTP is ${(actual * 100).toFixed(1)}%, target ${(RTP_TARGET * 100).toFixed(0)}%.`
    );
  }
}

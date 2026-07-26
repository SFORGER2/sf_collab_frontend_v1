/**
 * LOTTERY — the three-reel roll.
 *
 * A ticket costs credits. Three reels spin; match three of a symbol and you win
 * that symbol's prize. Match two and you get the ticket cost back in SF Coins,
 * so a near-miss is not a dead loss.
 *
 * ⚠️  FRONTEND MODEL ONLY — NOT THE SOURCE OF TRUTH.
 * `spin()` uses Math.random in the browser. That is fine for designing and
 * reviewing the interface and useless for anything with real stakes: a client
 * that decides its own outcome can decide to win. The backend must own the RNG,
 * the ticket debit, the settlement and the audit trail. Everything below is the
 * contract to implement, not the implementation.
 *
 * ── The maths, stated plainly so it can be argued with ──────────────────────
 *
 * Each reel carries REEL_SIZE slots. A symbol's `slots` is how many of those
 * slots it occupies, so P(one reel shows symbol s) = s.slots / REEL_SIZE, and
 * P(all three match on s) = (s.slots / REEL_SIZE)³.
 *
 * The jackpot occupies a single slot on each reel, so its odds are
 * 1 / REEL_SIZE³ = 1/2744. At TICKET_COST credits per ticket that is 68,600
 * credits of tickets per jackpot on average. The jackpot pays JACKPOT_CREDITS,
 * which is deliberately set below that — about 2.7× cheaper to fund than a
 * break-even jackpot would be — with the difference plus the lower tiers
 * landing total return-to-player near RTP_TARGET. Whatever is left funds the
 * daily and weekly prize pools rather than disappearing.
 *
 * Call `rtp()` after changing any number here; if it drifts far from
 * RTP_TARGET, the table is wrong.
 */

/** Slots on each reel. 14 is chosen so jackpot odds land at 1/2744. */
export const REEL_SIZE = 14;

/** Credits per ticket. */
export const TICKET_COST = 25;

/** The top prize, in credits. */
export const JACKPOT_CREDITS = 25000;

/** What total payout should come back to players, as a fraction of stakes. */
export const RTP_TARGET = 0.85;

/**
 * Reel symbols, rarest first.
 *
 * `slots` must sum to REEL_SIZE. `payout` is the credit value of a triple;
 * `prize` is what the player is actually told they won.
 */
export const SYMBOLS = [
  {
    id: 'nova',
    glyph: '✦',
    name: 'Nova',
    accent: '#ffbf5e',
    slots: 1,
    payout: JACKPOT_CREDITS,
    prize: 'The jackpot',
    tier: 'jackpot',
  },
  {
    id: 'crystal',
    glyph: '◆',
    name: 'Crystal',
    accent: '#4fd8ff',
    slots: 2,
    payout: 900,
    prize: '900 credits',
    tier: 'major',
  },
  {
    id: 'orbit',
    glyph: '◎',
    name: 'Orbit',
    accent: '#8b6cff',
    slots: 3,
    payout: 250,
    prize: '250 credits',
    tier: 'major',
  },
  {
    id: 'spark',
    glyph: '✧',
    name: 'Spark',
    accent: '#ff6fd8',
    slots: 4,
    payout: 70,
    prize: '70 credits',
    tier: 'minor',
  },
  {
    id: 'coin',
    glyph: '●',
    name: 'Coin',
    accent: '#3ee6a0',
    slots: 4,
    payout: 50,
    prize: '50 credits',
    tier: 'minor',
  },
];

/**
 * Consolation for two matching symbols, in SF Coins.
 *
 * Two of three match roughly *half* the time, so this number moves RTP more
 * than any jackpot figure does. It was originally set to the full ticket price,
 * which on its own returned 52% and pushed total RTP to 188% — the lottery paid
 * out nearly twice what it took in. Change it only with `rtp()` in hand.
 */
export const NEAR_MISS_COINS = 8;

/** Flattened reel: one entry per slot, so a spin is a uniform pick. */
const REEL = SYMBOLS.flatMap((s) => Array(s.slots).fill(s.id));

if (REEL.length !== REEL_SIZE) {
  // Loud in dev, harmless in prod — a mismatch silently skews every payout.
  console.warn(
    `[lottery] symbol slots sum to ${REEL.length}, expected ${REEL_SIZE}. Odds are wrong.`
  );
}

export const SYMBOLS_BY_ID = Object.fromEntries(SYMBOLS.map((s) => [s.id, s]));

/** Probability of three of a kind on `symbol`. */
export function tripleOdds(symbol) {
  return (symbol.slots / REEL_SIZE) ** 3;
}

/** "1 in 2,744" — the way odds are actually readable. */
export function oddsLabel(symbol) {
  const p = tripleOdds(symbol);
  return `1 in ${Math.round(1 / p).toLocaleString()}`;
}

/** Probability that exactly two of the three reels match. */
export function nearMissChance() {
  // For each symbol: 3 × p² × (1 − p) arrangements of exactly two matches.
  return SYMBOLS.reduce((sum, s) => {
    const p = s.slots / REEL_SIZE;
    return sum + 3 * p * p * (1 - p);
  }, 0);
}

/**
 * Return to player: expected credits back per credit staked.
 * Near-miss pays in SF Coins, counted here at parity with credits.
 */
export function rtp() {
  const fromTriples = SYMBOLS.reduce((sum, s) => sum + tripleOdds(s) * s.payout, 0);
  const fromNearMiss = nearMissChance() * NEAR_MISS_COINS;
  return (fromTriples + fromNearMiss) / TICKET_COST;
}

/**
 * Roll three reels.
 *
 * @returns {{ reels: string[], outcome: 'jackpot'|'triple'|'near'|'none',
 *             symbol: object|null, payout: number, coins: number }}
 */
export function spin() {
  const reels = [0, 1, 2].map(() => REEL[Math.floor(Math.random() * REEL.length)]);
  return settle(reels);
}

/** Score a set of reels. Split out so the server's result can be scored too. */
export function settle(reels) {
  const [a, b, c] = reels;

  if (a === b && b === c) {
    const symbol = SYMBOLS_BY_ID[a];
    return {
      reels,
      outcome: symbol.tier === 'jackpot' ? 'jackpot' : 'triple',
      symbol,
      payout: symbol.payout,
      coins: 0,
    };
  }

  const pairId = a === b ? a : b === c ? b : a === c ? a : null;
  if (pairId) {
    return {
      reels,
      outcome: 'near',
      symbol: SYMBOLS_BY_ID[pairId],
      payout: 0,
      coins: NEAR_MISS_COINS,
    };
  }

  return { reels, outcome: 'none', symbol: null, payout: 0, coins: 0 };
}

/**
 * Dev-time guard.
 *
 * The payout table is five numbers that each interact with a cubed probability,
 * so it is very easy to change one and quietly hand out free credits forever.
 * This shouts if the table drifts more than 10 points from target.
 */
if (import.meta.env?.DEV) {
  const actual = rtp();
  if (Math.abs(actual - RTP_TARGET) > 0.1) {
    console.warn(
      `[lottery] RTP is ${(actual * 100).toFixed(1)}%, target ${(RTP_TARGET * 100).toFixed(0)}%. ` +
        'Payouts and ticket price are out of balance.'
    );
  }
}

/* ── Local history, so the page can show recent rolls before the backend
      exists. Capped, because this is a review aid and not a ledger. ──────── */

const HISTORY_KEY = 'sfc.lottery.history';
const HISTORY_MAX = 12;

export function readHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(raw) ? raw.slice(0, HISTORY_MAX) : [];
  } catch {
    return [];
  }
}

export function pushHistory(result) {
  const entry = {
    at: Date.now(),
    reels: result.reels,
    outcome: result.outcome,
    payout: result.payout,
    coins: result.coins,
  };
  const next = [entry, ...readHistory()].slice(0, HISTORY_MAX);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked — history is cosmetic */
  }
  return next;
}

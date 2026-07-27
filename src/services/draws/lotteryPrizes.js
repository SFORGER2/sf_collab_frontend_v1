/**
 * THE PRIZE CATALOGUE
 *
 * A roll wins you one item out of thirty. Most are worth less than the ticket,
 * a few are worth far more, and the top of the table is a real thing you want
 * rather than a pile of credits — a year of Elite, a unique animated frame, a
 * featured slot on the front of discovery.
 *
 * That shape matters. Paying 25 credits to win 30 credits is arithmetic; paying
 * 25 credits for a shot at a year of Elite is a decision. Every item therefore
 * has an identity — a name, a glyph, a colour, a rarity — and the reel shows
 * the item, not a number.
 *
 * `value` is the credit-equivalent worth, used only to compute return-to-player
 * so the table can be checked. Players see the item, never the valuation.
 *
 * ⚠️ FRONTEND MODEL ONLY. The catalogue, the weights and the roll must move to
 * the backend before any of this is real — see the warning in lottery.js.
 * Fulfilment matters too: winning "1 Month Pro" has to actually grant the plan,
 * and winning a cosmetic has to actually appear on the profile.
 */

export const RARITIES = {
  common: { id: 'common', label: 'Common', accent: '#a9a2c2', glow: 0.18 },
  uncommon: { id: 'uncommon', label: 'Uncommon', accent: '#3ee6a0', glow: 0.28 },
  rare: { id: 'rare', label: 'Rare', accent: '#4fd8ff', glow: 0.4 },
  epic: { id: 'epic', label: 'Epic', accent: '#8b6cff', glow: 0.55 },
  legendary: { id: 'legendary', label: 'Legendary', accent: '#ffbf5e', glow: 0.8 },
  mythic: { id: 'mythic', label: 'Mythic', accent: '#ff6f3c', glow: 1 },
};

/** Item categories — drives the icon shown when there's no artwork. */
export const KINDS = {
  credits: 'credits',
  coins: 'coins',
  cosmetic: 'cosmetic',
  subscription: 'subscription',
  boost: 'boost',
  asset: 'asset',
};

/**
 * Thirty items.
 *
 * `weight` is relative — probability is weight / total. Tuned so RTP lands
 * near target; run `rtp()` in lottery.js after touching any of it.
 */
export const PRIZES = [
  // ── Common: below the 25-credit ticket, and ~89% of all rolls. ───────────
  // This tier is where the balance actually lives. A first pass had commons at
  // 74% with higher values and total RTP came out at 128% — the machine paid
  // out more than it took in, forever. Weight sits here now, values are low.
  { id: 'credits-10', name: '10 Credits', glyph: '◈', kind: KINDS.credits, rarity: 'common', value: 10, weight: 16000, grant: { credits: 10 } },
  { id: 'coins-25', name: '25 SF Coins', glyph: '●', kind: KINDS.coins, rarity: 'common', value: 10, weight: 14000, grant: { coins: 25 } },
  { id: 'sticker-cosmos', name: 'Cosmos Sticker Pack', glyph: '✧', kind: KINDS.cosmetic, rarity: 'common', value: 8, weight: 12000 },
  { id: 'frame-ember', name: 'Frame: Ember', glyph: '◯', kind: KINDS.cosmetic, rarity: 'common', value: 10, weight: 11000 },
  { id: 'effect-flicker', name: 'Name Effect: Flicker', glyph: '⌁', kind: KINDS.cosmetic, rarity: 'common', value: 10, weight: 10000 },
  { id: 'credits-15', name: '15 Credits', glyph: '◈', kind: KINDS.credits, rarity: 'common', value: 15, weight: 8000, grant: { credits: 15 } },
  { id: 'banner-dust', name: 'Banner: Nebula Dust', glyph: '▭', kind: KINDS.cosmetic, rarity: 'common', value: 12, weight: 7000 },
  { id: 'boost-xp', name: 'XP Boost ×2 · 24h', glyph: '⇗', kind: KINDS.boost, rarity: 'common', value: 15, weight: 5500 },
  { id: 'coins-50', name: '50 SF Coins', glyph: '●', kind: KINDS.coins, rarity: 'common', value: 20, weight: 3000, grant: { coins: 50 } },
  { id: 'credits-20', name: '20 Credits', glyph: '◈', kind: KINDS.credits, rarity: 'common', value: 20, weight: 2500, grant: { credits: 20 } },

  // ── Uncommon: at and above the ticket price. ~9% of rolls. ───────────────
  { id: 'credits-40', name: '40 Credits', glyph: '◈', kind: KINDS.credits, rarity: 'uncommon', value: 40, weight: 2000, grant: { credits: 40 } },
  { id: 'frame-solar', name: 'Frame: Solar Flare', glyph: '◉', kind: KINDS.cosmetic, rarity: 'uncommon', value: 45, weight: 1800 },
  { id: 'border-aurora', name: 'Border: Aurora', glyph: '❖', kind: KINDS.cosmetic, rarity: 'uncommon', value: 50, weight: 1600 },
  { id: 'banner-horizon', name: 'Banner: Event Horizon', glyph: '▬', kind: KINDS.cosmetic, rarity: 'uncommon', value: 60, weight: 1300 },
  { id: 'coins-150', name: '150 SF Coins', glyph: '●', kind: KINDS.coins, rarity: 'uncommon', value: 60, weight: 1100, grant: { coins: 150 } },
  { id: 'boost-vision', name: 'Vision Boost · 24h featured', glyph: '⇑', kind: KINDS.boost, rarity: 'uncommon', value: 75, weight: 700 },
  { id: 'voice-nova', name: 'AI Voice: Nova', glyph: '♪', kind: KINDS.asset, rarity: 'uncommon', value: 80, weight: 300 },
  { id: 'credits-100', name: '100 Credits', glyph: '◈', kind: KINDS.credits, rarity: 'uncommon', value: 100, weight: 200, grant: { credits: 100 } },

  // ── Rare: ~1.6% of rolls ────────────────────────────────────────────────
  { id: 'pfp-pulsar', name: 'Animated PFP: Pulsar', glyph: '☉', kind: KINDS.cosmetic, rarity: 'rare', value: 180, weight: 420 },
  { id: 'sub-starter', name: 'Starter Plan · 1 month', glyph: '✦', kind: KINDS.subscription, rarity: 'rare', value: 190, weight: 380, grant: { plan: 'starter', months: 1 } },
  { id: 'theme-deep', name: 'Theme: Deep Space', glyph: '◐', kind: KINDS.cosmetic, rarity: 'rare', value: 200, weight: 330 },
  { id: 'credits-250', name: '250 Credits', glyph: '◈', kind: KINDS.credits, rarity: 'rare', value: 250, weight: 250, grant: { credits: 250 } },
  { id: 'snippets', name: 'Code Snippet Bundle', glyph: '⌘', kind: KINDS.asset, rarity: 'rare', value: 300, weight: 130 },
  { id: 'feature-startup', name: 'Startup Feature Slot · 7 days', glyph: '★', kind: KINDS.boost, rarity: 'rare', value: 350, weight: 90 },

  // ── Epic: ~0.34% of rolls ───────────────────────────────────────────────
  { id: 'sub-pro', name: 'Pro Plan · 1 month', glyph: '✦', kind: KINDS.subscription, rarity: 'epic', value: 490, weight: 180, grant: { plan: 'pro', months: 1 } },
  { id: 'vault-design', name: 'Design Asset Vault', glyph: '◫', kind: KINDS.asset, rarity: 'epic', value: 600, weight: 100 },
  { id: 'border-supernova', name: 'Border: Supernova', glyph: '✺', kind: KINDS.cosmetic, rarity: 'epic', value: 800, weight: 60 },

  // ── Legendary / Mythic — the reason anyone rolls ─────────────────────────
  { id: 'credits-5000', name: '5,000 Credits', glyph: '◈', kind: KINDS.credits, rarity: 'legendary', value: 5000, weight: 14, grant: { credits: 5000 } },
  { id: 'crown-founder', name: "Founder's Crown", glyph: '♛', kind: KINDS.cosmetic, rarity: 'legendary', value: 5000, weight: 12, note: 'Unique animated frame' },
  { id: 'sub-elite-year', name: 'Elite Plan · 1 YEAR', glyph: '☄', kind: KINDS.subscription, rarity: 'mythic', value: 15000, weight: 4, grant: { plan: 'elite', months: 12 }, jackpot: true },
];

export const PRIZES_BY_ID = Object.fromEntries(PRIZES.map((p) => [p.id, p]));

export const TOTAL_WEIGHT = PRIZES.reduce((sum, p) => sum + p.weight, 0);

/** The jackpot item — the top of the table, shown in the masthead. */
export const JACKPOT = PRIZES.find((p) => p.jackpot) || PRIZES[PRIZES.length - 1];

/** Probability of drawing this prize. */
export function chanceOf(prize) {
  return prize.weight / TOTAL_WEIGHT;
}

/** "1 in 25,000" — odds people can actually read. */
export function oddsLabel(prize) {
  const p = chanceOf(prize);
  if (p >= 0.01) return `${(p * 100).toFixed(1)}%`;
  return `1 in ${Math.round(1 / p).toLocaleString()}`;
}

/** Prizes grouped by rarity, rarest first — used for the odds table. */
export function byRarity() {
  const order = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
  return order
    .map((id) => ({
      rarity: RARITIES[id],
      items: PRIZES.filter((p) => p.rarity === id),
      chance: PRIZES.filter((p) => p.rarity === id).reduce((s, p) => s + chanceOf(p), 0),
    }))
    .filter((g) => g.items.length > 0);
}

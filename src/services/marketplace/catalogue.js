/**
 * THE COSMETICS & GOODS CATALOGUE.
 *
 * NOT a replacement for /marketplace or /store — both of those are already
 * backed by real APIs (listings, sellers, purchases, earnings, boosts) and are
 * left alone. This is the local catalogue the *inventory* resolves against, so
 * an item can be described consistently whether it was won in the lottery,
 * bought in the store, or granted by a plan. When the store API returns its own
 * product records, `inventory.resolve()` should prefer those and fall back here.
 *
 * Two halves that behave differently and shouldn't be confused:
 *
 *   Cosmetics — animated avatars, frames, borders, banners, name effects and
 *   profile themes. Bought with SF Coins, which you earn by contributing, so
 *   the things that mark you out are earned rather than purchased with money.
 *
 *   Digital goods — apps, code snippets, design kits, AI voices, templates.
 *   Bought with credits. Some are made by SF, most are listed by members, and
 *   those carry a seller and a revenue split.
 *
 * Everything lands in the same inventory as lottery wins — from the owner's
 * side an avatar frame is an avatar frame regardless of how it arrived.
 *
 * ⚠️ FRONTEND CATALOGUE ONLY.
 * BACKEND: GET /api/marketplace/items?category=&sort=  and
 *          POST /api/marketplace/purchase { itemId } — which must re-check the
 *          balance and ownership server-side, then grant into the inventory.
 *          Member listings additionally need moderation and a payout ledger.
 */

export const CURRENCY = {
  coins: { id: 'coins', label: 'SF Coins', accent: '#ffbf5e', hint: 'Earned by contributing' },
  credits: { id: 'credits', label: 'Credits', accent: '#8b6cff', hint: 'Bought or earned' },
};

export const CATEGORIES = [
  { id: 'featured', label: 'Featured', blurb: 'Hand-picked this week' },
  { id: 'cosmetics', label: 'Cosmetics', blurb: 'How you appear across the ecosystem' },
  { id: 'apps', label: 'Apps', blurb: 'Tools that plug into your workspace' },
  { id: 'assets', label: 'Code & design', blurb: 'Snippets, kits and templates' },
  { id: 'voices', label: 'AI voices', blurb: 'Narration for your content' },
  { id: 'services', label: 'Services', blurb: 'Work delivered by members' },
];

/** Rarity is shared with the lottery so the colour vocabulary matches. */
export { RARITIES } from '@/services/draws/lotteryPrizes';

/**
 * `kind` matches the lottery's KINDS so the inventory can group both sources
 * together. `id` prefixes matter — inventory infers the equip slot from them.
 */
export const MARKET_ITEMS = [
  // ── Cosmetics · SF Coins ────────────────────────────────────────────────
  { id: 'pfp-nebula', name: 'Animated PFP: Nebula', glyph: '◍', kind: 'cosmetic', category: 'cosmetics', rarity: 'rare', currency: 'coins', price: 2400, animated: true, blurb: 'Slow-drifting nebula behind your avatar.' },
  { id: 'pfp-eclipse', name: 'Animated PFP: Eclipse', glyph: '◑', kind: 'cosmetic', category: 'cosmetics', rarity: 'epic', currency: 'coins', price: 4200, animated: true, blurb: 'A corona that breathes on hover.' },
  { id: 'frame-orbit', name: 'Frame: Orbit', glyph: '◎', kind: 'cosmetic', category: 'cosmetics', rarity: 'uncommon', currency: 'coins', price: 900, animated: true, blurb: 'A satellite tracks your avatar.' },
  { id: 'frame-prism', name: 'Frame: Prism', glyph: '◈', kind: 'cosmetic', category: 'cosmetics', rarity: 'rare', currency: 'coins', price: 1800 },
  { id: 'border-glacier', name: 'Border: Glacier', glyph: '❄', kind: 'cosmetic', category: 'cosmetics', rarity: 'uncommon', currency: 'coins', price: 700 },
  { id: 'border-magma', name: 'Border: Magma', glyph: '✹', kind: 'cosmetic', category: 'cosmetics', rarity: 'epic', currency: 'coins', price: 3600, animated: true, blurb: 'Molten edge that flows.' },
  { id: 'banner-drift', name: 'Banner: Slow Drift', glyph: '▤', kind: 'cosmetic', category: 'cosmetics', rarity: 'common', currency: 'coins', price: 350 },
  { id: 'banner-signal', name: 'Banner: Signal', glyph: '▥', kind: 'cosmetic', category: 'cosmetics', rarity: 'uncommon', currency: 'coins', price: 850, animated: true },
  { id: 'effect-static', name: 'Name Effect: Static', glyph: '⌇', kind: 'cosmetic', category: 'cosmetics', rarity: 'common', currency: 'coins', price: 400 },
  { id: 'effect-goldleaf', name: 'Name Effect: Gold Leaf', glyph: '✤', kind: 'cosmetic', category: 'cosmetics', rarity: 'rare', currency: 'coins', price: 2100, animated: true },
  { id: 'theme-obsidian', name: 'Theme: Obsidian', glyph: '◧', kind: 'cosmetic', category: 'cosmetics', rarity: 'rare', currency: 'coins', price: 2000, blurb: 'Recolours your whole public profile.' },
  { id: 'theme-daybreak', name: 'Theme: Daybreak', glyph: '◨', kind: 'cosmetic', category: 'cosmetics', rarity: 'uncommon', currency: 'coins', price: 1100 },

  // ── Apps · credits ──────────────────────────────────────────────────────
  { id: 'app-standup', name: 'Standup Bot', glyph: '⌸', kind: 'asset', category: 'apps', rarity: 'uncommon', currency: 'credits', price: 250, blurb: 'Collects daily updates and posts a digest to your workspace.' },
  { id: 'app-burndown', name: 'Burndown Charts', glyph: '⌹', kind: 'asset', category: 'apps', rarity: 'uncommon', currency: 'credits', price: 300, blurb: 'Sprint velocity and burndown inside ERP.' },
  { id: 'app-investor-crm', name: 'Investor CRM', glyph: '⌺', kind: 'asset', category: 'apps', rarity: 'rare', currency: 'credits', price: 800, blurb: 'Pipeline, warm intros and follow-up reminders.' },
  { id: 'app-changelog', name: 'Changelog Publisher', glyph: '⌻', kind: 'asset', category: 'apps', rarity: 'common', currency: 'credits', price: 150, blurb: 'Turns merged work into a public changelog.' },

  // ── Code & design · credits, mostly member-listed ───────────────────────
  { id: 'asset-auth-kit', name: 'Auth Starter Kit', glyph: '⌘', kind: 'asset', category: 'assets', rarity: 'rare', currency: 'credits', price: 600, seller: 'Mikkel Rasmussen', blurb: 'JWT, refresh rotation and RBAC, wired and tested.' },
  { id: 'asset-dashboard-kit', name: 'Dashboard UI Kit', glyph: '◫', kind: 'asset', category: 'assets', rarity: 'rare', currency: 'credits', price: 550, seller: 'Sofia Marchetti', blurb: '40 components, Figma and React.' },
  { id: 'asset-pitch-templates', name: 'Pitch Deck Templates ×12', glyph: '▦', kind: 'asset', category: 'assets', rarity: 'uncommon', currency: 'credits', price: 280, seller: 'Ada Okonkwo' },
  { id: 'asset-brand-pack', name: 'Brand Identity Pack', glyph: '◪', kind: 'asset', category: 'assets', rarity: 'epic', currency: 'credits', price: 1200, seller: 'Yuki Nakamura', blurb: 'Logo system, type scale and full colour tokens.' },
  { id: 'asset-icons', name: 'Icon Set · 600 glyphs', glyph: '✦', kind: 'asset', category: 'assets', rarity: 'uncommon', currency: 'credits', price: 220, seller: 'Lena Hoffmann' },
  { id: 'asset-stripe-flow', name: 'Stripe Checkout Flow', glyph: '⌗', kind: 'asset', category: 'assets', rarity: 'rare', currency: 'credits', price: 700, seller: 'Tomás Ferreira', blurb: 'Subscriptions, webhooks and the failure paths nobody writes.' },

  // ── AI voices · credits ─────────────────────────────────────────────────
  { id: 'voice-atlas', name: 'AI Voice: Atlas', glyph: '♪', kind: 'asset', category: 'voices', rarity: 'uncommon', currency: 'credits', price: 320, blurb: 'Warm, measured. Good for explainers.' },
  { id: 'voice-vega', name: 'AI Voice: Vega', glyph: '♫', kind: 'asset', category: 'voices', rarity: 'rare', currency: 'credits', price: 640, blurb: 'Bright and quick. Good for shorts.' },
  { id: 'voice-orion', name: 'AI Voice: Orion', glyph: '♬', kind: 'asset', category: 'voices', rarity: 'epic', currency: 'credits', price: 1100, blurb: 'Deep narration with breath control.' },

  // ── Services · credits, member-delivered ────────────────────────────────
  { id: 'svc-landing-review', name: 'Landing Page Teardown', glyph: '◉', kind: 'asset', category: 'services', rarity: 'uncommon', currency: 'credits', price: 400, seller: 'Priya Raghavan', blurb: 'A recorded walkthrough of what is losing you signups.' },
  { id: 'svc-pitch-coach', name: 'Pitch Coaching · 60 min', glyph: '◎', kind: 'asset', category: 'services', rarity: 'rare', currency: 'credits', price: 900, seller: 'Kwame Boateng' },
  { id: 'svc-code-audit', name: 'Codebase Audit', glyph: '⌸', kind: 'asset', category: 'services', rarity: 'epic', currency: 'credits', price: 1600, seller: 'Idris Haddad', blurb: 'Architecture, security and what will break at scale.' },
];

export const MARKET_ITEMS_BY_ID = Object.fromEntries(MARKET_ITEMS.map((i) => [i.id, i]));

/** Featured is a view, not a category — items are tagged into it by hand. */
const FEATURED_IDS = [
  'pfp-eclipse', 'border-magma', 'asset-auth-kit', 'voice-orion',
  'app-investor-crm', 'asset-brand-pack', 'theme-obsidian', 'svc-code-audit',
];

export function itemsFor(category = 'featured') {
  if (category === 'featured') return FEATURED_IDS.map((id) => MARKET_ITEMS_BY_ID[id]).filter(Boolean);
  return MARKET_ITEMS.filter((i) => i.category === category);
}

export const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'rarity', label: 'Rarest first' },
];

const RARITY_ORDER = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

export function sortItems(items, sort) {
  const out = [...items];
  if (sort === 'price-asc') return out.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return out.sort((a, b) => b.price - a.price);
  if (sort === 'rarity') {
    return out.sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
  }
  return out;
}

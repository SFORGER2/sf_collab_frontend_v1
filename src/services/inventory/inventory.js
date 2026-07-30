/**
 * INVENTORY — everything you own.
 *
 * One store for items from every source: won in the lottery, bought in the
 * marketplace, granted by a plan, or awarded for an achievement. They land in
 * the same place because from the owner's side they are the same thing — a
 * thing you have — and splitting them by where they came from would mean
 * looking in four places to find your avatar frame.
 *
 * Items are `{ itemId, source, acquiredAt, qty, equipped }`. The catalogue
 * entry (name, glyph, rarity, kind) is resolved at read time from whichever
 * catalogue owns it, so the stored record stays small and a catalogue edit
 * flows through to everyone who owns the item.
 *
 * ⚠️ FRONTEND MODEL ONLY. localStorage is not an inventory — it is per-browser,
 * trivially editable, and gone when someone clears their cache.
 *
 * BACKEND:
 *   GET    /api/inventory                    → { items: [...] }
 *   POST   /api/inventory/:itemId/equip      → equips within its slot
 *   POST   /api/inventory/:itemId/unequip
 * Grants must be server-side — a client that can write its own inventory can
 * grant itself a year of Elite.
 */

import { PRIZES_BY_ID } from '@/services/draws/lotteryPrizes';
import { MARKET_ITEMS_BY_ID } from '@/services/marketplace/catalogue';

const KEY = 'sfc.inventory.v1';

export const SOURCES = {
  lottery: { id: 'lottery', label: 'Lottery' },
  marketplace: { id: 'marketplace', label: 'Marketplace' },
  reward: { id: 'reward', label: 'Reward' },
  plan: { id: 'plan', label: 'Plan' },
};

/**
 * Cosmetics are exclusive within a slot — you can own six avatar frames and
 * wear one. Anything not listed here is not equippable at all.
 */
export const SLOTS = {
  frame: { id: 'frame', label: 'Avatar frame' },
  border: { id: 'border', label: 'Border' },
  banner: { id: 'banner', label: 'Profile banner' },
  effect: { id: 'effect', label: 'Name effect' },
  theme: { id: 'theme', label: 'Profile theme' },
  pfp: { id: 'pfp', label: 'Animated avatar' },
};

/** Infer the slot from an item id. Catalogue ids are prefixed by convention. */
export function slotOf(itemId = '') {
  const prefix = itemId.split('-')[0];
  return SLOTS[prefix]?.id || null;
}

/** Resolve an owned record to its catalogue entry, whichever catalogue that is. */
export function resolve(itemId) {
  return PRIZES_BY_ID[itemId] || MARKET_ITEMS_BY_ID[itemId] || null;
}

export function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function write(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage blocked — the backend is the real store anyway */
  }
  // Let open surfaces (the header count, the profile) update without a reload.
  window.dispatchEvent(new CustomEvent('sfc:inventory'));
  return items;
}

/**
 * Add an item. Stackable things (credits, coins, consumables) increment a
 * quantity; unique things (a cosmetic you already own) do not duplicate.
 */
export function grant(itemId, source = SOURCES.lottery.id) {
  const entry = resolve(itemId);
  if (!entry) return read();

  const items = read();
  const existing = items.find((i) => i.itemId === itemId);
  const stackable = entry.stackable ?? ['credits', 'coins', 'boost'].includes(entry.kind);

  if (existing && stackable) {
    existing.qty = (existing.qty || 1) + 1;
    existing.acquiredAt = Date.now();
    return write(items);
  }
  if (existing) return items; // already owned and unique — nothing to do

  return write([
    { itemId, source, acquiredAt: Date.now(), qty: 1, equipped: false },
    ...items,
  ]);
}

/** Equip within a slot, unequipping whatever was there. */
export function equip(itemId) {
  const slot = slotOf(itemId);
  const items = read().map((i) => {
    if (i.itemId === itemId) return { ...i, equipped: true };
    if (slot && slotOf(i.itemId) === slot) return { ...i, equipped: false };
    return i;
  });
  return write(items);
}

export function unequip(itemId) {
  return write(read().map((i) => (i.itemId === itemId ? { ...i, equipped: false } : i)));
}

export function owns(itemId) {
  return read().some((i) => i.itemId === itemId);
}

/** Owned records joined to their catalogue entries, newest first. */
export function readResolved() {
  return read()
    .map((i) => ({ ...i, item: resolve(i.itemId) }))
    .filter((i) => i.item)
    .sort((a, b) => b.acquiredAt - a.acquiredAt);
}

/** Grouped by kind, for the inventory page's sections. */
export function groupByKind() {
  const groups = {};
  for (const row of readResolved()) {
    const kind = row.item.kind || 'other';
    (groups[kind] = groups[kind] || []).push(row);
  }
  return groups;
}

export function count() {
  return read().reduce((n, i) => n + (i.qty || 1), 0);
}

/** Subscribe to changes — returns an unsubscribe. */
export function subscribe(fn) {
  const handler = () => fn(read());
  window.addEventListener('sfc:inventory', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('sfc:inventory', handler);
    window.removeEventListener('storage', handler);
  };
}

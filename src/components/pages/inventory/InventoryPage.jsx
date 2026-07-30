import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Check, Coins, Gem, Package, Palette, Rocket, Sparkles, Store, Ticket, X } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  SLOTS, SOURCES, equip, groupByKind, readResolved, slotOf, subscribe, unequip,
} from '@/services/inventory/inventory';
import { RARITIES } from '@/services/draws/lotteryPrizes';
import {
  TRADE_FEE_PCT, balance as crystalBalance, cancelTrade, feeFor, listForTrade,
  readTrades, subscribe as subCrystals,
} from '@/services/wallet/crystals';
import { AdSlot, CosmosButton, Display, Eyebrow, Lede, Panel, Reveal, Tag } from '@/components/cosmos';

/**
 * Inventory — everything you own, wherever it came from.
 *
 * Lottery wins, store purchases, plan grants and achievement rewards all land
 * here together, because from the owner's side they are the same thing: a
 * thing you have. Splitting the page by source would mean looking in four
 * places to find one avatar frame.
 *
 * Cosmetics are exclusive within a slot — you can own six frames and wear one —
 * so equipping is a radio choice per slot rather than a free-for-all.
 *
 * NOTE FOR BACKEND: reads `GET /api/inventory`, and equip/unequip post to
 * `/api/inventory/:itemId/equip`. Grants must be server-side; a client that can
 * write its own inventory can grant itself a year of Elite.
 */

const KIND_META = {
  cosmetic: { label: 'Cosmetics', icon: Palette, blurb: 'How you appear across the ecosystem' },
  subscription: { label: 'Subscriptions', icon: Rocket, blurb: 'Plan time you have been granted' },
  boost: { label: 'Boosts', icon: Sparkles, blurb: 'Temporary advantages, use them when they matter' },
  asset: { label: 'Assets & tools', icon: Package, blurb: 'Code, design, voices and apps' },
  credits: { label: 'Credits', icon: Gem, blurb: 'Already added to your balance' },
  coins: { label: 'SF Coins', icon: Coins, blurb: 'Already added to your wallet' },
};

const KIND_ORDER = ['cosmetic', 'subscription', 'boost', 'asset', 'credits', 'coins'];

const SOURCE_ICON = {
  lottery: Ticket,
  marketplace: Store,
  reward: Sparkles,
  plan: Rocket,
};

export default function InventoryPage() {
  const [, bump] = useState(0);
  const [filter, setFilter] = useState('all');
  const [crystals, setCrystals] = useState(crystalBalance);
  const [trades, setTrades] = useState(readTrades);
  const [listing, setListing] = useState(null);   // item being listed
  const [ask, setAsk] = useState('');

  // Any surface can grant; re-read when one does rather than polling.
  useEffect(() => subscribe(() => bump((n) => n + 1)), []);
  useEffect(() => subCrystals(setCrystals), []);

  const listedIds = new Set(trades.filter((t) => t.status === 'pending').map((t) => t.itemId));

  const submitListing = () => {
    const price = Number(ask);
    if (!price || price < 10) { toast.error('Ask at least 10 crystals'); return; }
    listForTrade({ itemId: listing.itemId, askCrystals: price });
    setTrades(readTrades());
    setListing(null); setAsk('');
    toast.success(`Listed for ${price} crystals`);
  };

  const unlist = (id) => { setTrades(cancelTrade(id)); toast.success('Listing removed'); };

  const all = readResolved();
  const groups = useMemo(groupByKind, [all.length, filter]);
  const equipped = all.filter((r) => r.equipped);

  const visibleKinds = KIND_ORDER.filter(
    (k) => groups[k]?.length && (filter === 'all' || filter === k)
  );

  const toggle = (row) => {
    const slot = slotOf(row.itemId);
    if (!slot) {
      toast.info('This one is used from where it applies, not equipped here.');
      return;
    }
    if (row.equipped) {
      unequip(row.itemId);
      toast.success(`${row.item.name} unequipped`);
    } else {
      equip(row.itemId);
      toast.success(`${row.item.name} equipped`);
    }
    bump((n) => n + 1);
  };

  return (
    <div className="w-full max-w-[1180px] mx-auto px-4 sm:px-6 py-8">
      <Reveal>
        <Eyebrow>Inventory</Eyebrow>
        <Display size="xl" className="mt-3 mb-4">Everything you own.</Display>
        <Lede>
          Won in the lottery, bought in the store, earned through contribution — it all
          lands here. Equip a cosmetic and it follows you everywhere you appear.
        </Lede>
      </Reveal>

      {all.length === 0 ? (
        <EmptyInventory />
      ) : (
        <>
          {/* Equipped loadout */}
          <Panel className="cosmos-panel-neon p-6 mt-7" accent="#ffbf5e">
            <Eyebrow className="mb-3.5">Currently equipped</Eyebrow>
            {equipped.length === 0 ? (
              <p className="text-[0.88rem] text-dim">
                Nothing equipped yet. Pick a frame, border or theme below.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {equipped.map((row) => {
                  const rarity = RARITIES[row.item.rarity] || RARITIES.common;
                  return (
                    <span
                      key={row.itemId}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ background: `${rarity.accent}14`, border: `1px solid ${rarity.accent}44` }}
                    >
                      <span className="text-[1.05rem] leading-none" style={{ color: rarity.accent }}>
                        {row.item.glyph}
                      </span>
                      <span className="text-[0.85rem] text-star">{row.item.name}</span>
                      <span className="font-mono text-[8.5px] tracking-[0.14em] uppercase text-dim">
                        {SLOTS[slotOf(row.itemId)]?.label}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Crystals + listings — trading is crystals-only, one token to
              reason about instead of three. */}
          <div className="grid gap-3 mt-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            <Link to="/wallet/crystals" className="cosmos-card p-4 flex items-center gap-3 group" style={{ '--cosmos-accent': '#4fd8ff' }}>
              <span className="grid place-items-center w-10 h-10 rounded-xl shrink-0 transition-transform group-hover:scale-105"
                    style={{ background: 'rgba(79,216,255,0.14)', border: '1px solid rgba(79,216,255,0.3)', color: '#4fd8ff' }}>
                <Gem size={16} />
              </span>
              <span className="min-w-0">
                <span className="cosmos-stat-label block">SF Crystals</span>
                <span className="font-display text-[1.15rem] text-cyan tabular-nums">{crystals.toLocaleString()}</span>
                <span className="block text-[0.75rem] text-dim">Buy more</span>
              </span>
            </Link>

            {trades.filter((t) => t.status === 'pending').length > 0 && (
              <div className="cosmos-card p-4" style={{ '--cosmos-accent': '#ffbf5e' }}>
                <Eyebrow className="mb-2">Listed for trade</Eyebrow>
                <div className="flex flex-col gap-1.5">
                  {trades.filter((t) => t.status === 'pending').map((t) => {
                    const item = all.find((r) => r.itemId === t.itemId)?.item;
                    return (
                      <div key={t.id} className="flex items-center gap-2 text-[0.82rem]">
                        <span className="text-star truncate flex-1 min-w-0">{item?.name || t.itemId}</span>
                        <span className="font-mono text-cyan tabular-nums">{t.askCrystals}</span>
                        <button type="button" onClick={() => unlist(t.id)} aria-label="Remove listing"
                                className="text-dim hover:text-red-400 transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1 p-1 mt-6 rounded-full bg-white/[0.04] border border-white/10 w-fit overflow-x-auto">
            {['all', ...KIND_ORDER.filter((k) => groups[k]?.length)].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                aria-pressed={filter === k}
                className={`font-mono text-[10px] tracking-[0.14em] uppercase px-3.5 py-2 rounded-full whitespace-nowrap transition-colors ${
                  filter === k ? 'text-star bg-white/[0.08]' : 'text-dim hover:text-star'
                }`}
              >
                {k === 'all' ? `All · ${all.length}` : `${KIND_META[k].label} · ${groups[k].length}`}
              </button>
            ))}
          </div>

          {visibleKinds.map((kind) => {
            const meta = KIND_META[kind];
            const Icon = meta.icon;
            return (
              <section key={kind} className="mt-7">
                <div className="flex items-center gap-2.5 mb-1">
                  <Icon size={14} className="text-dim" />
                  <Eyebrow>{meta.label}</Eyebrow>
                </div>
                <p className="text-[0.82rem] text-dim mb-3.5">{meta.blurb}</p>

                <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
                  {groups[kind].map((row) => (
                    <ItemCard
                      key={row.itemId}
                      row={row}
                      listed={listedIds.has(row.itemId)}
                      onToggle={() => toggle(row)}
                      onList={() => { setListing(row); setAsk(''); }}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          <AdSlot placement="inventory-mid" format="banner" className="mt-7" />
        </>
      )}

      {/* List for trade */}
      {listing && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4"
             style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
             onClick={() => setListing(null)}>
          <div className="cosmos-panel cosmos-panel-neon p-6 w-full max-w-[26rem]"
               style={{ '--cosmos-accent': '#4fd8ff', '--field-accent': '#4fd8ff' }}
               onClick={(e) => e.stopPropagation()}>
            <Eyebrow className="mb-1">List for trade</Eyebrow>
            <h3 className="font-display text-[1.15rem] text-star mb-1">{listing.item.name}</h3>
            <p className="text-[0.82rem] text-dim mb-4">
              Other members pay in SF Crystals. The item leaves your inventory only when a
              trade is accepted.
            </p>

            <label className="block">
              <span className="cosmos-stat-label block mb-1.5">Asking price in crystals</span>
              <input
                type="number"
                min="10"
                value={ask}
                autoFocus
                onChange={(e) => setAsk(e.target.value)}
                placeholder="500"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-cyan/40 text-[0.92rem] text-star focus:outline-none focus:border-cyan"
              />
            </label>

            {Number(ask) > 0 && (
              <p className="text-[0.8rem] text-dim mt-2.5">
                {TRADE_FEE_PCT}% platform fee: <span className="text-star">{feeFor(Number(ask))}</span> crystals.
                You receive <span className="text-cyan">{Number(ask) - feeFor(Number(ask))}</span>.
              </p>
            )}

            <div className="flex flex-wrap gap-2.5 mt-5">
              <CosmosButton variant="primary" size="sm" onClick={submitListing}>
                <ArrowLeftRight size={13} /> List it
              </CosmosButton>
              <CosmosButton variant="quiet" size="sm" onClick={() => setListing(null)}>Cancel</CosmosButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemCard({ row, onToggle, onList, listed }) {
  const { item } = row;
  const rarity = RARITIES[item.rarity] || RARITIES.common;
  const slot = slotOf(row.itemId);
  const SourceIcon = SOURCE_ICON[row.source] || Package;

  return (
    <div
      className="cosmos-card p-0 overflow-hidden flex flex-col"
      style={{
        '--cosmos-accent': rarity.accent,
        borderColor: row.equipped ? `${rarity.accent}88` : undefined,
        boxShadow: row.equipped ? `0 0 20px ${rarity.accent}33` : undefined,
      }}
    >
      <div
        className="relative grid place-items-center h-[92px]"
        style={{ background: `linear-gradient(160deg, ${rarity.accent}22 0%, rgba(255,255,255,0.02) 78%)` }}
      >
        <span className="leading-none" style={{ fontSize: '2.1rem', color: rarity.accent }}>
          {item.glyph}
        </span>

        {row.qty > 1 && (
          <span className="absolute top-2 right-2 font-mono text-[9px] tracking-[0.1em] px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(0,0,0,0.5)', color: 'var(--color-star)' }}>
            ×{row.qty}
          </span>
        )}

        <span className="absolute top-2 left-2" title={SOURCES[row.source]?.label}>
          <SourceIcon size={11} className="text-dim" />
        </span>
      </div>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <span className="text-[0.86rem] text-star leading-tight">{item.name}</span>
        <Tag tone="neutral" className="!py-0.5 w-fit">{rarity.label}</Tag>

        {slot ? (
          <div className="mt-auto flex flex-col gap-1.5">
            <CosmosButton
              variant={row.equipped ? 'quiet' : 'ghost'}
              size="sm"
              onClick={onToggle}
            >
              {row.equipped ? <><Check size={12} /> Equipped</> : 'Equip'}
            </CosmosButton>
            {/* Equipped items can't be listed — unequip first, so nobody
                accidentally trades away the frame they are wearing. */}
            {listed ? (
              <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-cyan text-center">Listed</span>
            ) : !row.equipped && (
              <button type="button" onClick={onList}
                      className="font-mono text-[9px] tracking-[0.12em] uppercase text-dim hover:text-cyan transition-colors py-0.5">
                Trade for crystals
              </button>
            )}
          </div>
        ) : (
          <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-dim mt-auto pt-1.5">
            {SOURCES[row.source]?.label || 'Owned'}
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyInventory() {
  return (
    <Panel className="p-10 text-center mt-7">
      <span className="grid place-items-center w-14 h-14 rounded-2xl mx-auto mb-4"
            style={{ background: 'rgba(255,191,94,0.1)', color: '#ffbf5e' }}>
        <Package size={24} />
      </span>
      <h2 className="font-display text-[1.2rem] text-star">Nothing here yet</h2>
      <p className="text-[0.9rem] text-dim mt-2 max-w-[48ch] mx-auto">
        Items you win, buy or earn land here. Cosmetics you equip follow you everywhere
        you appear in the ecosystem.
      </p>
      <div className="flex flex-wrap justify-center gap-2.5 mt-6">
        <CosmosButton variant="primary" size="sm" asChild>
          <Link to="/draws?tab=lottery"><Ticket size={14} /> Try the lottery</Link>
        </CosmosButton>
        <CosmosButton variant="ghost" size="sm" asChild>
          <Link to="/store"><Store size={14} /> Browse the store</Link>
        </CosmosButton>
        <CosmosButton variant="quiet" size="sm" asChild>
          <Link to="/wallet/earn">Earn SF Coins</Link>
        </CosmosButton>
      </div>
    </Panel>
  );
}

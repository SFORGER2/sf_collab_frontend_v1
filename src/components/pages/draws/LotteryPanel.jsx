import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Info, Ticket, Trophy } from 'lucide-react';
import {
  JACKPOT, PRIZES_BY_ID, RARITIES, TICKET_COST,
  beatTheStake, byRarity, oddsLabel, pushHistory, readHistory, roll, rtp,
} from '@/services/draws/lottery';
import { fetchWinners, prizeFor, profileHref, timeAgo } from '@/services/draws/winners';
import { balance as crystalBalance, spend as spendCrystals, add as addCrystals, subscribe as subCrystals } from '@/services/wallet/crystals';
import { AdSlot, CosmosButton, Eyebrow, Panel, Tag } from '@/components/cosmos';
import { grant as grantToInventory } from '@/services/inventory/inventory';
import LotteryReels, { IdleReel } from './LotteryReels';
import PrizeTile from './PrizeTile';

/**
 * The lottery.
 *
 * One roll, one prize out of thirty. Most are worth less than the ticket, a
 * few are worth far more, and the top of the table is a year of Elite rather
 * than a pile of credits — because paying 25 credits to win 30 credits is
 * arithmetic, and paying 25 for a shot at a year of Elite is a decision.
 *
 * Odds are on the page, computed from the same table the roll uses, so they
 * cannot drift out of sync with what actually happens.
 *
 * NOTE FOR BACKEND: `POST /api/lottery/roll` debits the ticket, rolls, grants
 * the prize and returns `{ prizeId, rollId, balance }`. The reel takes the
 * result as a prop and `rollWith(prizeId)` scores a server answer, so moving
 * the roll server-side changes nothing visual.
 */
export default function LotteryPanel() {
  const [crystals, setCrystals] = useState(crystalBalance);
  useEffect(() => subCrystals(setCrystals), []);

  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [history, setHistory] = useState(readHistory);
  const [winners, setWinners] = useState({ winners: [], isSample: true });

  useEffect(() => {
    let cancelled = false;
    fetchWinners(12).then((w) => { if (!cancelled) setWinners(w); });
    return () => { cancelled = true; };
  }, []);

  const canAfford = crystals >= TICKET_COST;
  const returnPct = Math.round(rtp() * 100);

  const doRoll = () => {
    if (spinning || !canAfford) return;
    setRevealed(false);
    setSpinning(true);
    if (!spendCrystals(TICKET_COST)) return;

    const outcome = roll();
    // One frame of motion before the landing position is committed.
    setTimeout(() => { setResult(outcome); setSpinning(false); }, 60);
  };

  const onSettled = useCallback(() => {
    setRevealed(true);
    setResult((r) => {
      if (!r) return r;
      // Credit grants settle immediately; everything else is a backend grant.
      // Credit prizes pay out in crystals now that the ticket is crystals.
      if (r.prize.grant?.credits) addCrystals(r.prize.grant.credits * 10);
      // Everything won lands in the inventory, alongside store purchases.
      grantToInventory(r.prize.id, 'lottery');
      setHistory(pushHistory(r.prize));
      return r;
    });
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* The machine */}
      <Panel className="cosmos-panel-neon p-6" accent={RARITIES[JACKPOT.rarity].accent}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <Eyebrow>Top prize</Eyebrow>
            <h2
              className="font-display text-[1.75rem] leading-none mt-1.5"
              style={{ color: RARITIES[JACKPOT.rarity].accent }}
            >
              {JACKPOT.name}
            </h2>
            <p className="text-[0.88rem] text-dim mt-1.5 max-w-[48ch]">
              Every roll wins one of 30 items. Most are worth less than the ticket —
              the tail is where it gets interesting.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="cosmos-stat-label block">Your crystals</span>
            <span className="font-display text-[1.3rem] text-star tabular-nums">
              {crystals.toLocaleString()}
            </span>
          </div>
        </div>

        {result ? (
          <LotteryReels result={result} spinning={spinning} onSettled={onSettled} />
        ) : (
          <IdleReel />
        )}

        {/* Outcome — reserved height so the panel doesn't jump on reveal */}
        <div className="min-h-[4.5rem] grid place-items-center mt-4">
          {revealed && result ? (
            <Outcome prize={result.prize} />
          ) : (
            <p className="text-[0.85rem] text-dim">
              {spinning ? 'Rolling…' : 'One roll, one prize. 30 items in the pool.'}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <CosmosButton variant="primary" onClick={doRoll} disabled={spinning || !canAfford}>
            <Ticket size={15} />
            {spinning ? 'Rolling…' : `Roll — ${TICKET_COST} crystals`}
          </CosmosButton>

          {!canAfford && (
            <CosmosButton variant="ghost" size="sm" asChild>
              <Link to="/wallet/crystals">Get crystals</Link>
            </CosmosButton>
          )}
        </div>
      </Panel>

      <AdSlot placement="lottery-mid" format="banner" />

      {/* Winners — names link to real profiles */}
      <WinnersFeed data={winners} />

      {/* The full table */}
      <Panel className="p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
          <Eyebrow>All 30 prizes & odds</Eyebrow>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-dim">
            {returnPct}% returns to players
          </span>
        </div>

        <div className="flex flex-col gap-5">
          {byRarity().map(({ rarity, items, chance }) => (
            <div key={rarity.id}>
              <div className="flex items-center gap-2.5 mb-2.5">
                <span
                  className="font-mono text-[10px] tracking-[0.16em] uppercase"
                  style={{ color: rarity.accent }}
                >
                  {rarity.label}
                </span>
                <span className="h-px flex-1" style={{ background: `${rarity.accent}33` }} />
                <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-dim">
                  {(chance * 100).toFixed(chance < 0.01 ? 3 : 1)}% of rolls
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {items.map((p) => (
                  <div key={p.id} className="flex flex-col items-center gap-1">
                    <PrizeTile prize={p} width={96} compact />
                    <span className="font-mono text-[9px] tracking-[0.08em] uppercase text-dim">
                      {oddsLabel(p)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="flex items-start gap-2 text-[0.83rem] text-dim mt-5">
          <Info size={13} className="shrink-0 mt-0.5" />
          Tickets are bought with SF Crystals, a platform currency, and
          prizes are platform items — subscriptions, cosmetics, boosts and credits. Never cash,
          and nothing is exchangeable for money. The odds above are the actual numbers the
          roll uses.
        </p>
      </Panel>

      {/* The player's own rolls */}
      {history.length > 0 && (
        <Panel className="p-6">
          <Eyebrow className="mb-3.5">Your rolls</Eyebrow>
          <div className="flex flex-col gap-1">
            {history.map((h) => {
              const p = PRIZES_BY_ID[h.prizeId];
              if (!p) return null;
              const rarity = RARITIES[p.rarity];
              return (
                <div
                  key={h.at}
                  className="flex flex-wrap items-center gap-3 py-2 border-b border-white/[0.06] last:border-0"
                >
                  <span className="text-[1.05rem] leading-none w-5 text-center" style={{ color: rarity.accent }}>
                    {p.glyph}
                  </span>
                  <span className="text-[0.88rem] text-star flex-1 min-w-0 truncate">{p.name}</span>
                  <Tag tone="neutral">{rarity.label}</Tag>
                  <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-dim">
                    {timeAgo(h.at)}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
}

function Outcome({ prize }) {
  const rarity = RARITIES[prize.rarity];
  const beat = beatTheStake(prize);

  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <span
        className="font-display text-[1.25rem] leading-tight"
        style={{ color: rarity.accent }}
      >
        {prize.name}
      </span>
      <span className="flex flex-wrap items-center justify-center gap-2">
        <Tag tone="neutral">{rarity.label}</Tag>
        <span className="text-[0.82rem] text-dim">
          {beat ? 'Worth more than your ticket.' : 'Worth less than your ticket — roll again?'}
        </span>
      </span>
      {prize.note && <span className="text-[0.8rem] text-dim/80">{prize.note}</span>}
    </div>
  );
}

/**
 * Recent winners.
 *
 * Every name is a link to that person's profile. An anonymous "someone just won
 * Elite" banner is indistinguishable from marketing and gets read that way; a
 * name you can click and a profile you can look at is evidence.
 */
function WinnersFeed({ data }) {
  const { winners, isSample } = data;
  if (!winners?.length) return null;

  return (
    <Panel className="p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3.5">
        <span className="flex items-center gap-2">
          <Trophy size={13} className="text-gold" />
          <Eyebrow>Recent winners</Eyebrow>
        </span>
        {isSample && (
          <Tag tone="future" title="The winners endpoint does not exist yet">
            Sample data
          </Tag>
        )}
      </div>

      <div className="flex flex-col gap-0.5 max-h-[22rem] overflow-y-auto -mr-1 pr-1">
        {winners.map((w) => {
          const prize = prizeFor(w);
          if (!prize) return null;
          const rarity = RARITIES[prize.rarity];
          const href = profileHref(w.user);
          const name = [w.user?.firstName, w.user?.lastName].filter(Boolean).join(' ') || 'Someone';

          return (
            <div
              key={w.id}
              className="flex flex-wrap items-center gap-3 py-2.5 border-b border-white/[0.06] last:border-0"
            >
              <span
                className="grid place-items-center w-9 h-9 rounded-lg shrink-0 text-[1.05rem]"
                style={{ background: `${rarity.accent}18`, border: `1px solid ${rarity.accent}33`, color: rarity.accent }}
              >
                {prize.glyph}
              </span>

              <span className="min-w-0 flex-1">
                {href ? (
                  <Link
                    to={href}
                    className="inline-flex items-center gap-1 text-[0.9rem] text-star hover:text-gold transition-colors"
                  >
                    {name}
                    <ExternalLink size={10} className="opacity-50" />
                  </Link>
                ) : (
                  <span className="text-[0.9rem] text-star">{name}</span>
                )}
                <span className="block text-[0.82rem] truncate" style={{ color: rarity.accent }}>
                  {prize.name}
                </span>
              </span>

              <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-dim shrink-0">
                {timeAgo(w.wonAt)}
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

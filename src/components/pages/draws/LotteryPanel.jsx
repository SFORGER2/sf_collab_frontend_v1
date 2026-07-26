import React, { useCallback, useState } from 'react';
import { Coins, Info, Sparkles, Ticket, TrendingUp } from 'lucide-react';
import {
  JACKPOT_CREDITS, NEAR_MISS_COINS, SYMBOLS, SYMBOLS_BY_ID, TICKET_COST,
  oddsLabel, pushHistory, readHistory, rtp, spin,
} from '@/services/draws/lottery';
import { useEntitlements } from '@/services/entitlements/useEntitlements';
import { CosmosButton, Eyebrow, Panel, Tag } from '@/components/cosmos';
import LotteryReels from './LotteryReels';

/**
 * The lottery tab.
 *
 * One ticket, three reels, match three to win. The odds table is on the page
 * rather than behind a link, because a prize mechanic that hides its odds is
 * one you should not trust — and the return-to-player figure is computed from
 * the same table the roll uses, so it cannot drift out of sync with reality.
 *
 * NOTE FOR BACKEND: the roll happens client-side today (see the warning in
 * services/draws/lottery.js). The real flow is
 * `POST /api/lottery/spin` → server debits the ticket, rolls, settles, returns
 * `{ reels, outcome, payout, coins, balance }`. The reels component takes the
 * result as a prop precisely so swapping the source changes nothing visual.
 */
export default function LotteryPanel() {
  const { credits, addCredits } = useEntitlements();

  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [history, setHistory] = useState(readHistory);

  const balance = typeof credits === 'number' ? credits : credits?.balance ?? 0;
  const canAfford = balance >= TICKET_COST;
  const returnPct = Math.round(rtp() * 100);

  const roll = () => {
    if (spinning || !canAfford) return;

    setRevealed(false);
    setSpinning(true);

    // Debit up front — the ticket is spent whether or not it wins. Winnings are
    // credited on reveal, not here, so the balance doesn't change before the
    // reels have shown why.
    addCredits(-TICKET_COST);

    const outcome = spin();

    // One frame of pure motion before the landing positions are committed,
    // so the reels are visibly spinning rather than jumping straight to rest.
    setTimeout(() => {
      setResult(outcome);
      setSpinning(false);
    }, 90);
  };

  const onSettled = useCallback(() => {
    setRevealed(true);
    setResult((r) => {
      if (!r) return r;
      if (r.payout > 0) addCredits(r.payout);
      setHistory(pushHistory(r));
      return r;
    });
  }, [addCredits]);

  return (
    <div className="flex flex-col gap-5">
      {/* The machine */}
      <Panel className="cosmos-panel-neon p-6" accent="#ffbf5e">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <Eyebrow>Jackpot</Eyebrow>
            <h2 className="font-display text-[2rem] text-gold leading-none mt-1.5">
              {JACKPOT_CREDITS.toLocaleString()}
              <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-dim ml-2">
                credits
              </span>
            </h2>
            <p className="text-[0.88rem] text-dim mt-1.5 max-w-[46ch]">
              Three Novas takes the lot. Any three matching symbols pays out; two
              matching returns your ticket in SF Coins.
            </p>
          </div>

          <div className="text-right">
            <span className="cosmos-stat-label block">Your balance</span>
            <span className="font-display text-[1.3rem] text-star tabular-nums">
              {balance.toLocaleString()}
            </span>
          </div>
        </div>

        <LotteryReels result={result} spinning={spinning} onSettled={onSettled} />

        {/* Outcome line — reserved height so the panel doesn't jump on reveal */}
        <div className="min-h-[3.25rem] grid place-items-center mt-4">
          {revealed && result ? (
            <Outcome result={result} />
          ) : (
            <p className="text-[0.85rem] text-dim">
              {spinning ? 'Rolling…' : 'Match three symbols to win.'}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <CosmosButton variant="primary" onClick={roll} disabled={spinning || !canAfford}>
            <Ticket size={15} />
            {spinning ? 'Rolling…' : `Roll — ${TICKET_COST} credits`}
          </CosmosButton>

          {!canAfford && (
            <span className="text-[0.82rem] text-dim">
              Not enough credits for a ticket.
            </span>
          )}
        </div>
      </Panel>

      {/* Odds — on the page, not hidden */}
      <Panel className="p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
          <Eyebrow>Prizes & odds</Eyebrow>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-dim">
            {returnPct}% returns to players
          </span>
        </div>

        <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
          {SYMBOLS.map((s) => (
            <div
              key={s.id}
              className="cosmos-card p-3.5 flex items-center gap-3"
              style={{ '--cosmos-accent': s.accent }}
            >
              <span
                className="grid place-items-center w-11 h-11 rounded-xl shrink-0 text-[1.4rem] leading-none"
                style={{ background: `${s.accent}18`, border: `1px solid ${s.accent}33`, color: s.accent }}
              >
                {s.glyph}{s.glyph}{s.glyph}
              </span>
              <span className="min-w-0">
                <span className="cosmos-stat-label block">{s.name} × 3</span>
                <span className="block text-[0.88rem] text-star mt-0.5">{s.prize}</span>
                <span className="block font-mono text-[10px] tracking-[0.1em] uppercase text-dim mt-0.5">
                  {oddsLabel(s)}
                </span>
              </span>
            </div>
          ))}

          <div className="cosmos-card p-3.5 flex items-center gap-3">
            <span
              className="grid place-items-center w-11 h-11 rounded-xl shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-dim)' }}
            >
              <Coins size={18} />
            </span>
            <span className="min-w-0">
              <span className="cosmos-stat-label block">Any two matching</span>
              <span className="block text-[0.88rem] text-star mt-0.5">
                {NEAR_MISS_COINS} SF Coins back
              </span>
              <span className="block font-mono text-[10px] tracking-[0.1em] uppercase text-dim mt-0.5">
                Roughly 1 in 4
              </span>
            </span>
          </div>
        </div>

        <p className="flex items-start gap-2 text-[0.83rem] text-dim mt-4">
          <Info size={13} className="shrink-0 mt-0.5" />
          Tickets are bought with credits you have earned or purchased for platform use, and
          prizes pay out in credits and SF Coins — never cash. The odds above are the actual
          numbers the roll uses.
        </p>
      </Panel>

      {/* Recent rolls */}
      {history.length > 0 && (
        <Panel className="p-6">
          <Eyebrow className="mb-3.5">Your recent rolls</Eyebrow>
          <div className="flex flex-col gap-1.5">
            {history.map((h) => (
              <div
                key={h.at}
                className="flex flex-wrap items-center gap-3 py-2 border-b border-white/[0.06] last:border-0"
              >
                <span className="flex gap-1 text-[1.05rem] leading-none">
                  {h.reels.map((id, i) => (
                    <span key={i} style={{ color: SYMBOLS_BY_ID[id]?.accent }}>
                      {SYMBOLS_BY_ID[id]?.glyph}
                    </span>
                  ))}
                </span>

                <span className="text-[0.85rem] text-dim flex-1 min-w-0">
                  {h.payout > 0
                    ? `Won ${h.payout.toLocaleString()} credits`
                    : h.coins > 0
                    ? `Two matched — ${h.coins} SF Coins back`
                    : 'No match'}
                </span>

                <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-dim">
                  {new Date(h.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

function Outcome({ result }) {
  if (result.outcome === 'jackpot') {
    return (
      <p className="flex items-center gap-2 font-display text-[1.2rem] text-gold">
        <Sparkles size={18} /> Jackpot — {result.payout.toLocaleString()} credits
      </p>
    );
  }

  if (result.outcome === 'triple') {
    return (
      <p
        className="flex items-center gap-2 font-display text-[1.1rem]"
        style={{ color: result.symbol.accent }}
      >
        <TrendingUp size={16} /> Three {result.symbol.name}s — {result.symbol.prize}
      </p>
    );
  }

  if (result.outcome === 'near') {
    return (
      <p className="flex flex-wrap items-center justify-center gap-2 text-[0.92rem] text-star">
        <Tag tone="accent">So close</Tag>
        Two {result.symbol.name}s — {result.coins} SF Coins back.
      </p>
    );
  }

  return <p className="text-[0.9rem] text-dim">No match this time.</p>;
}

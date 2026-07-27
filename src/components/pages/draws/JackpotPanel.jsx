import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, Sparkles, Zap } from 'lucide-react';
import {
  NEAR_MISS_RETURN, SPIN_COST, SYMBOLS, SYMBOLS_BY_ID,
  anyTripleOdds, nearMissOdds, oddsLabel, rtp, spin,
} from '@/services/draws/jackpot';
import {
  add as addCrystals, balance as crystalBalance, spend as spendCrystals,
  subscribe as subCrystals,
} from '@/services/wallet/crystals';
import { AdSlot, CosmosButton, Eyebrow, Panel, Tag } from '@/components/cosmos';

/**
 * The jackpot — three reels, match three.
 *
 * Deliberately the opposite shape to the lottery. There, every roll wins
 * something small and the appeal is the reveal. Here most spins win nothing and
 * the appeal is the tail: 1 in 216 for any triple, 1 in 1,296 for Nova, which
 * pays a year of Elite.
 *
 * Reels stop left to right so the third one carries the tension — landing all
 * three at once removes the only interesting second of the whole thing.
 */

const ROW_H = 84;
const LOOPS = 7;
const BASE_MS = 1400;
const STAGGER = 420;

export default function JackpotPanel() {
  const [crystals, setCrystals] = useState(crystalBalance);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => subCrystals(setCrystals), []);

  const canAfford = crystals >= SPIN_COST;
  const nova = SYMBOLS[SYMBOLS.length - 1];

  const doSpin = () => {
    if (spinning || !canAfford) return;
    setRevealed(false);
    setSpinning(true);
    if (!spendCrystals(SPIN_COST)) { setSpinning(false); return; }

    const outcome = spin();
    setTimeout(() => { setResult(outcome); setSpinning(false); }, 60);

    setTimeout(() => {
      setRevealed(true);
      if (outcome.payout > 0) addCrystals(outcome.payout);
    }, BASE_MS + STAGGER * 2 + 260);
  };

  return (
    <div className="flex flex-col gap-5">
      <Panel className="cosmos-panel-neon p-6" accent={nova.accent}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <Eyebrow>Jackpot</Eyebrow>
            <h2 className="font-display text-[1.75rem] leading-none mt-1.5" style={{ color: nova.accent }}>
              Three Novas · Elite for a year
            </h2>
            <p className="text-[0.88rem] text-dim mt-1.5 max-w-[50ch]">
              Match three of anything to win. Most spins win nothing — that is what makes the
              top of the table worth chasing.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="cosmos-stat-label block">Your crystals</span>
            <span className="font-display text-[1.3rem] text-cyan tabular-nums">
              {crystals.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Reels */}
        <div
          className="flex items-stretch justify-center gap-2.5 p-3 rounded-2xl"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: 'inset 0 0 44px rgba(0,0,0,0.65)',
          }}
        >
          {[0, 1, 2].map((i) => (
            <Reel
              key={i}
              index={i}
              landOn={result?.reels?.[i]}
              spinning={spinning}
              won={revealed && (result?.outcome === 'triple' || result?.outcome === 'jackpot')}
            />
          ))}
        </div>

        <div className="min-h-[3.5rem] grid place-items-center mt-4">
          {revealed && result ? (
            <Outcome result={result} />
          ) : (
            <p className="text-[0.85rem] text-dim">
              {spinning ? 'Spinning…' : `Any three matching pays. 1 in ${Math.round(1 / anyTripleOdds())}.`}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <CosmosButton variant="primary" onClick={doSpin} disabled={spinning || !canAfford}>
            <Zap size={15} /> {spinning ? 'Spinning…' : `Spin — ${SPIN_COST} crystals`}
          </CosmosButton>
          {!canAfford && (
            <CosmosButton variant="ghost" size="sm" asChild>
              <Link to="/wallet/crystals">Get crystals</Link>
            </CosmosButton>
          )}
        </div>
      </Panel>

      <AdSlot placement="jackpot-mid" format="banner" />

      {/* Paytable */}
      <Panel className="p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
          <Eyebrow>Paytable</Eyebrow>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-dim">
            {Math.round(rtp() * 100)}% returns to players
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {[...SYMBOLS].reverse().map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center gap-3 py-2.5 border-b border-white/[0.06] last:border-0"
            >
              <span className="text-[1.3rem] leading-none w-20 shrink-0" style={{ color: s.accent }}>
                {s.glyph}{s.glyph}{s.glyph}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.9rem] text-star">{s.name} × 3</span>
                <span className="block text-[0.78rem] text-dim">
                  {s.grant.plan
                    ? `${s.grant.plan[0].toUpperCase() + s.grant.plan.slice(1)} plan · ${s.grant.months} month${s.grant.months > 1 ? 's' : ''}`
                    : s.grant.crystals
                    ? `${s.grant.crystals.toLocaleString()} crystals`
                    : `${s.grant.coins.toLocaleString()} SF Coins`}
                </span>
              </span>
              <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-dim shrink-0">
                {oddsLabel(s)}
              </span>
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-3 py-2.5 mt-1">
            <span className="text-[1.3rem] leading-none w-20 shrink-0 text-dim">◆◆✧</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.9rem] text-star">Any two matching</span>
              <span className="block text-[0.78rem] text-dim">
                {Math.round(SPIN_COST * NEAR_MISS_RETURN)} crystals back
              </span>
            </span>
            <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-dim shrink-0">
              {Math.round(nearMissOdds() * 100)}% of spins
            </span>
          </div>
        </div>

        <p className="flex items-start gap-2 text-[0.83rem] text-dim mt-4">
          <Info size={13} className="shrink-0 mt-0.5" />
          Six symbols on each of three reels, so any specific triple is 1 in 216 and any
          triple at all is 1 in 36. You can count the reels and check — that's the point of a
          flat paytable.
        </p>
      </Panel>
    </div>
  );
}

function Reel({ index, landOn, spinning, won }) {
  const strip = React.useMemo(() => {
    const base = [];
    for (let i = 0; i < LOOPS; i += 1) base.push(...SYMBOLS.map((s) => s.id));
    base.push(landOn || SYMBOLS[0].id);
    return base;
  }, [landOn]);

  const landingIndex = strip.length - 1;
  const settled = !spinning && !!landOn;
  const idle = index + 2;

  const offset = settled ? -landingIndex * ROW_H : -idle * ROW_H;
  const accent = landOn ? SYMBOLS_BY_ID[landOn]?.accent : '#a9a2c2';

  return (
    <div
      className="relative overflow-hidden rounded-xl flex-1 min-w-0"
      style={{
        height: ROW_H,
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${settled && won ? accent : 'rgba(255,255,255,0.08)'}`,
        boxShadow: settled && won ? `0 0 26px ${accent}66, inset 0 0 22px ${accent}22` : 'none',
        transition: 'border-color 260ms, box-shadow 260ms',
      }}
    >
      <div
        style={{
          transform: `translateY(${offset}px)`,
          transition: settled
            ? `transform ${(BASE_MS + index * STAGGER) / 1000}s cubic-bezier(0.12, 0.85, 0.18, 1)`
            : 'none',
        }}
      >
        {strip.map((id, i) => {
          const s = SYMBOLS_BY_ID[id];
          return (
            <div key={`${id}-${i}`} className="grid place-items-center select-none" style={{ height: ROW_H }}>
              <span
                style={{
                  fontSize: '2.2rem',
                  color: s.accent,
                  filter: settled && i === landingIndex && won ? `drop-shadow(0 0 12px ${s.accent})` : 'none',
                }}
              >
                {s.glyph}
              </span>
            </div>
          );
        })}
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(9,7,20,0.9) 0%, transparent 30%, transparent 70%, rgba(9,7,20,0.9) 100%)',
        }}
      />
    </div>
  );
}

function Outcome({ result }) {
  if (result.outcome === 'jackpot') {
    return (
      <p className="flex items-center gap-2 font-display text-[1.25rem]" style={{ color: result.symbol.accent }}>
        <Sparkles size={19} /> JACKPOT — Elite for a year
      </p>
    );
  }
  if (result.outcome === 'triple') {
    return (
      <p className="flex flex-col items-center gap-1 text-center">
        <span className="font-display text-[1.15rem]" style={{ color: result.symbol.accent }}>
          Three {result.symbol.name}s
        </span>
        <span className="text-[0.85rem] text-dim">
          {result.payout.toLocaleString()} crystals
        </span>
      </p>
    );
  }
  if (result.outcome === 'near') {
    return (
      <p className="flex flex-wrap items-center justify-center gap-2 text-[0.92rem] text-star">
        <Tag tone="accent">So close</Tag>
        Two {result.symbol.name}s — {result.payout} crystals back.
      </p>
    );
  }
  return <p className="text-[0.9rem] text-dim">No match. Spin again?</p>;
}

import React, { useEffect, useState } from 'react';
import { Gem, Info, Ticket, Timer, Trophy } from 'lucide-react';
import {
  CURRENCIES, drawsForRole, PRIZE_KINDS, formatCountdown, nextClose,
  readDrawState, winChance, writeDrawState,
} from '@/services/draws/draws';
import {
  AdSlot, CosmosButton, Display, Eyebrow, Lede, Panel, ProgressRail, Reveal, Tag,
} from '@/components/cosmos';

/**
 * Draws & prizes.
 *
 * ⚠️ The draw model runs client-side for review only — see the warning at the
 * top of services/draws/draws.js. Entries, RNG and settlement must move to the
 * backend before this is usable with real stakes.
 */
export default function DrawsPage() {
  const role = localStorage.getItem('activeRole') || 'member';
  const draws = drawsForRole(role);
  const [state, setState] = useState(readDrawState);
  const [, setTick] = useState(0);

  // Keep countdowns live.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const enter = (draw, stake, currency) => {
    const next = {
      ...state,
      entries: { ...state.entries, [draw.id]: { stake, currency, at: Date.now() } },
    };
    writeDrawState(next);
    setState(next);
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
      <Reveal>
        <Eyebrow>Rewards</Eyebrow>
        <Display size="xl" className="mt-3 mb-4">Draws &amp; prizes</Display>
        <Lede>
          Stake SF Coins or SF Crystals into a pool. When it closes, winners are drawn —
          your odds are proportional to your stake, and every entry has a real chance.
        </Lede>
      </Reveal>

      <div className="flex flex-wrap gap-3 mt-6">
        {Object.values(CURRENCIES).map((c) => (
          <div key={c.id} className="cosmos-card p-4 flex items-center gap-3 flex-1 min-w-[190px]">
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `${c.accent}1f`, color: c.accent }}
            >
              {c.id === 'crystals' ? <Gem size={16} /> : <Ticket size={16} />}
            </span>
            <span>
              <span className="cosmos-stat-label block">{c.name}</span>
              <span className="font-mono text-[11px] text-dim">
                {c.weight}× draw weight
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-5 mt-6">
        {draws.map((draw) => (
          <DrawCard
            key={draw.id}
            draw={draw}
            entry={state.entries[draw.id]}
            onEnter={enter}
          />
        ))}
      </div>

      <AdSlot placement="draws-page" format="banner" className="mt-6" />

      <Panel className="p-6 mt-6">
        <Eyebrow className="mb-3">How draws work</Eyebrow>
        <ul className="flex flex-col gap-2.5 text-[0.9rem] text-dim">
          <li>Stake SF Coins you've earned through contribution — never real money.</li>
          <li>Odds are proportional to your weighted stake. SF Crystals count 10× each.</li>
          <li>Pools close on schedule. Winners are drawn and prizes credited automatically.</li>
          <li>Unsuccessful stakes are returned in full to your wallet.</li>
        </ul>
        <p className="flex items-start gap-2 text-[0.85rem] text-dim mt-4">
          <Info size={14} className="shrink-0 mt-0.5" />
          Draws are a reward mechanic for ecosystem participation, not gambling: entry uses
          earned currency only, and stakes are refunded when you don't win.
        </p>
      </Panel>
    </div>
  );
}

function DrawCard({ draw, entry, onEnter }) {
  const [stake, setStake] = useState(draw.minStake);
  const [currency, setCurrency] = useState(draw.currency);
  const closes = nextClose(draw.cadence);

  // Placeholder pool size — the server owns real totals.
  const poolStake = 12000;
  const chance = winChance(
    (entry?.stake ?? stake) * CURRENCIES[entry?.currency ?? currency].weight,
    poolStake
  );

  return (
    <Panel className="p-6" accent={draw.accent}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <Eyebrow>{draw.cadence === 'daily' ? 'Daily draw' : 'Weekly draw'}</Eyebrow>
            <Tag tone="live" dot>Open</Tag>
          </div>
          <h2 className="font-display text-[1.3rem] text-star">{draw.name}</h2>
          <p className="text-[0.9rem] text-dim mt-1 max-w-[54ch]">{draw.description}</p>
        </div>

        <div className="text-right">
          <span className="cosmos-stat-label flex items-center gap-1.5 justify-end">
            <Timer size={12} /> Closes in
          </span>
          <span className="font-display text-[1.2rem]" style={{ color: draw.accent }}>
            {formatCountdown(closes)}
          </span>
        </div>
      </div>

      <div className="grid gap-3 mb-5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
        {draw.prizes.map((prize) => {
          const kind = PRIZE_KINDS[prize.kind];
          return (
            <div key={prize.label} className="cosmos-card p-3.5">
              <span className="flex items-center gap-1.5 mb-1.5">
                <Trophy size={12} style={{ color: kind.accent }} />
                <span className="cosmos-stat-label">{kind.label}</span>
              </span>
              <span className="block text-[0.9rem] text-star leading-tight">{prize.label}</span>
              <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-dim mt-1 block">
                ×{prize.count}
              </span>
            </div>
          );
        })}
      </div>

      {entry ? (
        <div className="flex flex-col gap-3">
          <ProgressRail label="Your share of the pool" value={chance} />
          <div className="flex flex-wrap items-center gap-3">
            <Tag tone="accent">
              {entry.stake} {CURRENCIES[entry.currency].name} staked
            </Tag>
            <span className="text-[0.85rem] text-dim">
              You're entered. Results are announced when the pool closes.
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="cosmos-stat-label">Your stake</span>
            <input
              type="number"
              min={draw.minStake}
              step={draw.minStake}
              value={stake}
              onChange={(e) => setStake(Math.max(draw.minStake, Number(e.target.value) || 0))}
              className="w-32 px-3 py-2 rounded-full bg-white/[0.04] border border-white/10 text-sm text-star tabular-nums focus:outline-none focus:border-[var(--cosmos-accent)]"
            />
          </label>

          {draw.allowCrystals && (
            <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10">
              {Object.values(CURRENCIES).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCurrency(c.id)}
                  aria-pressed={currency === c.id}
                  className={`font-mono text-[10px] tracking-[0.14em] uppercase px-3 py-1.5 rounded-full transition-colors ${
                    currency === c.id ? 'text-star bg-white/[0.08]' : 'text-dim hover:text-star'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-dim">
            ≈ {chance.toFixed(1)}% share
          </span>

          <CosmosButton variant="primary" size="sm" onClick={() => onEnter(draw, stake, currency)}>
            <Ticket size={14} /> Enter draw
          </CosmosButton>
        </div>
      )}
    </Panel>
  );
}

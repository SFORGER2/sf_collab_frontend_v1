import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PRIZES, PRIZES_BY_ID, RARITIES } from '@/services/draws/lotteryPrizes';
import PrizeTile from './PrizeTile';

/**
 * The reel.
 *
 * A horizontal strip of prize tiles that accelerates, then decelerates onto the
 * won item under a fixed centre marker. The strip is built *from the result* —
 * the winning tile is placed at a known index and the transform lands exactly
 * on it — so the animation only ever shows an outcome, it never picks one.
 * When the backend owns the roll, nothing here changes.
 *
 * The long tail-off is deliberate. The whole appeal of a case-opening is the
 * two seconds where it's still slowing down and might yet stop somewhere good,
 * so the easing spends most of its time at the end.
 *
 * Honours prefers-reduced-motion by cutting straight to the result.
 */

const TILE_W = 108;   // px per tile, including gap
const GAP = 8;
const STRIP_LEN = 56; // tiles before the winner — long enough to blur past
const SPIN_MS = 4200;

export default function LotteryReels({ result, spinning, onSettled }) {
  const reduced = usePrefersReducedMotion();
  const settledFor = useRef(null);

  const prize = result?.prize;

  // Filler tiles are drawn from the real catalogue so the strip looks like the
  // pool it comes from — mostly common, with the occasional rare flashing past.
  const strip = useMemo(() => {
    if (!prize) return [];
    const filler = Array.from({ length: STRIP_LEN }, () => {
      const pool = Math.random() < 0.86
        ? PRIZES.filter((p) => p.rarity === 'common' || p.rarity === 'uncommon')
        : PRIZES;
      return pool[Math.floor(Math.random() * pool.length)];
    });
    // Winner sits at STRIP_LEN, with a few tiles after so it isn't the edge.
    const trailing = Array.from({ length: 6 }, () => PRIZES[Math.floor(Math.random() * PRIZES.length)]);
    return [...filler, prize, ...trailing];
  }, [prize, result?.rolledAt]);

  const winnerIndex = STRIP_LEN;

  useEffect(() => {
    if (!result || spinning) return;
    if (settledFor.current === result) return;
    settledFor.current = result;

    if (reduced) { onSettled?.(); return; }
    const t = setTimeout(() => onSettled?.(), SPIN_MS + 120);
    return () => clearTimeout(t);
  }, [result, spinning, reduced, onSettled]);

  const settled = !spinning && !!prize;
  const step = TILE_W + GAP;

  // Land the winner under the centre marker, with a small random offset so it
  // doesn't stop dead-centre every time — that reads as scripted.
  const jitter = useMemo(() => (Math.random() - 0.5) * (TILE_W * 0.5), [result?.rolledAt]);
  const offset = settled || reduced ? -(winnerIndex * step) + jitter : 0;

  const accent = prize ? RARITIES[prize.rarity].accent : '#a9a2c2';

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.7)',
        padding: '14px 0',
      }}
    >
      {/* Centre marker — the thing the strip lands under */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-20"
        style={{ width: 2, background: settled ? accent : 'rgba(255,255,255,0.5)', transition: 'background 300ms' }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 z-20"
        style={{
          width: 0, height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `8px solid ${settled ? accent : 'rgba(255,255,255,0.6)'}`,
        }}
      />

      {/* The strip. Centred by translating half the container, then the offset. */}
      <div className="relative" style={{ height: 122 }}>
        <div
          className="absolute top-0 left-1/2 flex"
          style={{
            gap: GAP,
            transform: `translateX(calc(-${TILE_W / 2}px + ${offset}px))`,
            transition: reduced || !settled ? 'none' : `transform ${SPIN_MS}ms cubic-bezier(0.09, 0.72, 0.13, 1)`,
          }}
        >
          {strip.map((p, i) => (
            <PrizeTile
              key={`${p.id}-${i}`}
              prize={p}
              width={TILE_W}
              won={settled && i === winnerIndex}
              dimmed={settled && i !== winnerIndex}
            />
          ))}
        </div>
      </div>

      {/* Edge fade, so tiles enter and leave rather than popping at a boundary */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(90deg, rgba(9,7,20,0.95) 0%, transparent 18%, transparent 82%, rgba(9,7,20,0.95) 100%)',
        }}
      />
    </div>
  );
}

/** Idle state before the first roll — a slow drift, so the machine looks live. */
export function IdleReel() {
  const sample = useMemo(
    () => Array.from({ length: 14 }, () => PRIZES[Math.floor(Math.random() * PRIZES.length)]),
    []
  );

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.7)',
        padding: '14px 0',
      }}
    >
      <div className="flex gap-2 px-3" style={{ height: 122 }}>
        {sample.map((p, i) => (
          <PrizeTile key={`${p.id}-${i}`} prize={p} width={TILE_W} dimmed />
        ))}
      </div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(9,7,20,0.95) 0%, transparent 18%, transparent 82%, rgba(9,7,20,0.95) 100%)',
        }}
      />
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  return reduced;
}

export { PRIZES_BY_ID };

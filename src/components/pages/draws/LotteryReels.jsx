import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SYMBOLS, SYMBOLS_BY_ID } from '@/services/draws/lottery';

/**
 * The three reels.
 *
 * Each reel is a tall strip of symbols translated upward. The strip is built by
 * repeating the symbol list, with the winning symbol placed at a known index —
 * so the landing position is decided by the *result*, not by the animation. The
 * visual never picks the outcome; it only shows one.
 *
 * Reels stop left to right with a staggered delay, because all three landing at
 * once removes the only interesting second of the whole interaction. Each stop
 * gets a short bounce so it reads as mechanical rather than as a fade.
 *
 * Respects `prefers-reduced-motion`: the result snaps into place instead.
 */

const ROW_H = 76;          // px per symbol cell
const LOOPS = 6;           // full passes through the symbol list before landing
const SPIN_MS = 1500;      // first reel's travel time
const STAGGER_MS = 320;    // extra time per subsequent reel

export default function LotteryReels({ result, spinning, onSettled }) {
  const reduced = usePrefersReducedMotion();

  // A settle callback fires once per spin, after the last reel lands.
  const settledFor = useRef(null);
  useEffect(() => {
    if (!result || spinning) return;
    if (settledFor.current === result) return;
    settledFor.current = result;

    if (reduced) { onSettled?.(); return; }
    const total = SPIN_MS + STAGGER_MS * 2 + 260;
    const t = setTimeout(() => onSettled?.(), total);
    return () => clearTimeout(t);
  }, [result, spinning, reduced, onSettled]);

  return (
    <div
      className="flex items-stretch justify-center gap-2.5 p-3 rounded-2xl"
      style={{
        background: 'rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)',
      }}
    >
      {[0, 1, 2].map((i) => (
        <Reel
          key={i}
          index={i}
          landOn={result?.reels?.[i]}
          spinning={spinning}
          reduced={reduced}
          won={result?.outcome === 'jackpot' || result?.outcome === 'triple'}
        />
      ))}
    </div>
  );
}

function Reel({ index, landOn, spinning, reduced, won }) {
  // The strip: LOOPS passes of the symbol list, then the landing symbol.
  const strip = useMemo(() => {
    const base = [];
    for (let i = 0; i < LOOPS; i += 1) base.push(...SYMBOLS.map((s) => s.id));
    base.push(landOn || SYMBOLS[SYMBOLS.length - 1].id);
    return base;
  }, [landOn]);

  const landingIndex = strip.length - 1;
  const settled = !spinning && !!landOn;

  // At rest before the first roll, park each reel on a different symbol —
  // parking all three on SYMBOLS[0] showed three jackpots, which reads as a
  // win that never happened.
  const idleIndex = index + 1;

  const offset = settled || reduced ? -landingIndex * ROW_H : -idleIndex * ROW_H;
  const duration = reduced ? 0 : (SPIN_MS + index * STAGGER_MS) / 1000;

  const accent = landOn ? SYMBOLS_BY_ID[landOn]?.accent : '#a9a2c2';

  return (
    <div
      className="relative overflow-hidden rounded-xl flex-1 min-w-0"
      style={{
        height: ROW_H,
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${settled && won ? `${accent}88` : 'rgba(255,255,255,0.08)'}`,
        boxShadow: settled && won ? `0 0 24px ${accent}55, inset 0 0 20px ${accent}22` : 'none',
        transition: 'border-color 240ms ease, box-shadow 240ms ease',
      }}
    >
      <div
        style={{
          transform: `translateY(${offset}px)`,
          transition: duration
            ? `transform ${duration}s cubic-bezier(0.13, 0.9, 0.2, 1)`
            : 'none',
        }}
      >
        {strip.map((id, i) => {
          const s = SYMBOLS_BY_ID[id];
          const isLanding = i === landingIndex;
          return (
            <div
              key={`${id}-${i}`}
              className="grid place-items-center select-none"
              style={{ height: ROW_H }}
            >
              <span
                className="leading-none"
                style={{
                  fontSize: '2rem',
                  color: s.accent,
                  filter: settled && isLanding && won ? `drop-shadow(0 0 10px ${s.accent})` : 'none',
                  opacity: settled && isLanding ? 1 : 0.9,
                }}
              >
                {s.glyph}
              </span>
            </div>
          );
        })}
      </div>

      {/* Fade the strip at the edges so symbols enter and leave rather than
          appearing and vanishing at a hard boundary. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(9,7,20,0.85) 0%, transparent 28%, transparent 72%, rgba(9,7,20,0.85) 100%)',
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

import React from 'react';
import { momentumOf, momentumReason } from '@/services/vision/momentum';

/**
 * The momentum flame.
 *
 * Marks Visions that are actually moving, so a listing stops being a wall of
 * identical cards. Three tiers, one to three flames, hotter colour as it climbs
 * — and nothing at all below the first threshold, which is the point: if
 * everything burns, the flame carries no information.
 *
 * The flicker is two overlaid paths animating at different, deliberately
 * non-round durations so they drift out of phase instead of pulsing in lockstep.
 * It is small and in the corner of a card; it should read as alive in
 * peripheral vision without demanding attention.
 *
 *   <MomentumFlame item={vision} />                 // decides its own tier
 *   <MomentumFlame item={vision} showLabel />       // adds "Hot"
 *
 * Renders null when the item hasn't earned one, so callers don't need to check.
 */
export function MomentumFlame({ item, size = 16, showLabel = false, className = '' }) {
  const { score, tier } = momentumOf(item || {});
  if (!tier) return null;

  const reason = momentumReason(item);
  const title = `${tier.label} — ${reason}`;

  return (
    <span
      className={`cosmos-flame inline-flex items-center gap-1 ${className}`}
      title={title}
      aria-label={`${tier.label}: ${reason}`}
      data-momentum={tier.id}
      data-momentum-score={score}
      style={{ '--flame': tier.accent }}
    >
      <span className="inline-flex items-center" style={{ gap: 1 }}>
        {Array.from({ length: tier.flames }, (_, i) => (
          <Flame key={i} size={size} delay={i * 0.23} accent={tier.accent} />
        ))}
      </span>

      {showLabel && (
        <span
          className="font-mono text-[9.5px] tracking-[0.14em] uppercase"
          style={{ color: tier.accent }}
        >
          {tier.label}
        </span>
      )}
    </span>
  );
}

function Flame({ size, delay, accent }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="cosmos-flame-svg"
      style={{ animationDelay: `${delay}s`, overflow: 'visible' }}
    >
      {/* Outer body */}
      <path
        className="cosmos-flame-outer"
        style={{ animationDelay: `${delay}s` }}
        d="M12 2.5c2.2 3.1 1.1 4.6.2 6 -.7 1.1-1.3 2 -.5 3.3 .6 1 1.9 1 2.6 .1 .6-.8 .6-1.9 .3-2.8 2 1.7 3.4 4 3.4 6.4 0 3.6-3 6-6 6s-6-2.4-6-6c0-4.4 3.4-6.6 4.5-9.4 .4-1.1 .5-2.3 1.5-3.6Z"
        fill={accent}
        opacity="0.9"
      />
      {/* Inner core — brighter, faster flicker, so the two drift apart */}
      <path
        className="cosmos-flame-inner"
        style={{ animationDelay: `${delay + 0.11}s` }}
        d="M12 12.2c1.3 1 2 2.2 2 3.4 0 1.7-1.2 2.9-2.6 2.9s-2.5-1.1-2.5-2.6c0-1.6 1.6-2.3 3.1-3.7Z"
        fill="#fff6e0"
        opacity="0.75"
      />
    </svg>
  );
}

export default MomentumFlame;

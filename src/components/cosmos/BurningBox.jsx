import React from 'react';
import { Flame } from 'lucide-react';
import { momentumOf, momentumReason } from '@/services/vision/momentum';

/**
 * Wraps a card so it *burns* when it's on a run.
 *
 * The first pass at this was a small flame icon in the card's corner, which was
 * too quiet — the whole appeal of a hot streak is that you spot it across the
 * room without reading anything. So the box itself catches: an ember border,
 * a heat glow that breathes, and flame licks along the top edge, all scaled by
 * the momentum tier (see cosmos.css → BURNING BOXES).
 *
 * Below the first tier it renders a plain wrapper and nothing else. That
 * restraint is what makes it work: if every card burns, none of them do.
 *
 *   <BurningBox item={vision}>
 *     <YourCard />
 *   </BurningBox>
 *
 * `as` lets it wrap without adding a DOM level where the parent is a grid item.
 */
export function BurningBox({ item, children, className = '', as: Tag = 'div', ...rest }) {
  const { score, tier } = momentumOf(item || {});

  if (!tier) {
    return <Tag className={className} {...rest}>{children}</Tag>;
  }

  return (
    <Tag
      className={`cosmos-burning ${className}`}
      data-heat={tier.id}
      data-momentum-score={score}
      title={`${tier.label} — ${momentumReason(item)}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * The streak ribbon that sits on a burning card.
 *
 * Says which tier and why, because "Hot" on its own is decoration. Position it
 * yourself — it's a plain inline element so it can sit in a header row or be
 * absolutely placed over a banner.
 */
export function StreakBadge({ item, className = '' }) {
  const { tier } = momentumOf(item || {});
  if (!tier) return null;

  return (
    <span
      className={`cosmos-streak inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[9px] tracking-[0.14em] uppercase whitespace-nowrap ${className}`}
      style={{ '--heat': tier.accent, '--heat-2': '#ff3c2f' }}
      title={momentumReason(item)}
    >
      <Flame size={9} />
      {tier.label}
    </span>
  );
}

export default BurningBox;

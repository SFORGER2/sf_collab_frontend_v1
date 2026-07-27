import React from 'react';
import { Coins, Gem, Palette, Rocket, Sparkles, Package } from 'lucide-react';
import { KINDS, RARITIES } from '@/services/draws/lotteryPrizes';

/**
 * One prize, as a card.
 *
 * There's no artwork pipeline yet, so each item gets a large glyph over a
 * rarity-tinted panel plus a category icon — enough that a Founder's Crown and
 * a 10-credit consolation read as different things at a glance, which is the
 * job. Swapping in real images later means adding an `image` field to the
 * catalogue and rendering it in place of the glyph; nothing else changes.
 *
 * Rarity drives border, glow and the top strip, so scanning the odds table or
 * watching the reel gives you the same colour vocabulary in both places.
 */

const KIND_ICON = {
  [KINDS.credits]: Gem,
  [KINDS.coins]: Coins,
  [KINDS.cosmetic]: Palette,
  [KINDS.subscription]: Rocket,
  [KINDS.boost]: Sparkles,
  [KINDS.asset]: Package,
};

export default function PrizeTile({ prize, width = 108, won = false, dimmed = false, compact = false }) {
  const rarity = RARITIES[prize.rarity] || RARITIES.common;
  const Icon = KIND_ICON[prize.kind] || Package;

  return (
    <div
      className="relative shrink-0 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-1.5 px-2 py-3 transition-all duration-300"
      style={{
        width,
        height: compact ? 96 : 122,
        background: `linear-gradient(180deg, ${rarity.accent}1a 0%, rgba(255,255,255,0.02) 70%)`,
        border: `1px solid ${won ? rarity.accent : `${rarity.accent}33`}`,
        boxShadow: won ? `0 0 26px ${rarity.accent}88, inset 0 0 20px ${rarity.accent}33` : 'none',
        opacity: dimmed ? 0.42 : 1,
        transform: won ? 'scale(1.04)' : 'none',
      }}
    >
      {/* Rarity strip — the fastest read when tiles are flying past */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 right-0"
        style={{ height: 3, background: rarity.accent, opacity: won ? 1 : 0.65 }}
      />

      <span
        className="leading-none select-none"
        style={{
          fontSize: compact ? '1.5rem' : '1.85rem',
          color: rarity.accent,
          filter: won ? `drop-shadow(0 0 10px ${rarity.accent})` : 'none',
        }}
      >
        {prize.glyph}
      </span>

      <span
        className="text-center leading-tight px-0.5"
        style={{ fontSize: compact ? '0.66rem' : '0.7rem', color: 'var(--color-star)' }}
      >
        {prize.name}
      </span>

      <span className="absolute bottom-1.5 right-1.5 opacity-45" style={{ color: rarity.accent }}>
        <Icon size={10} />
      </span>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEntitlements } from '@/services/entitlements/useEntitlements';

/**
 * Advertising slot for ad-supported plans.
 *
 * Renders nothing at all when the user is on a paid plan, or when an admin has
 * switched ads off globally (which is the current default state — there is no
 * ad inventory yet, so the toggle in Admin → Monetisation starts off).
 *
 * Reserving these positions now means monetisation can be switched on later
 * without relayout work. Each slot is labelled and dismissible, and always
 * offers the ad-free upgrade path.
 *
 *   <AdSlot placement="dashboard-sidebar" format="square" />
 *
 * When real inventory exists, replace the placeholder body with the ad network
 * embed; the visibility rules above stay as they are.
 */
const FORMATS = {
  banner: 'min-h-[90px]',
  square: 'min-h-[250px]',
  strip: 'min-h-[60px]',
};

export function AdSlot({ placement, format = 'banner', className, style, onDismiss }) {
  const { showAds } = useEntitlements();
  const [dismissed, setDismissed] = React.useState(false);

  /* Tell the parent too — StickyTopAd holds a spacer that must go with it. */
  const dismiss = () => { setDismissed(true); onDismiss?.(); };

  if (!showAds || dismissed) return null;

  /**
   * `strip` is the top-of-page placement, so it lays out as one row rather
   * than a stacked block. Stacked, it ran to ~168px and pushed the actual page
   * below the fold — an ad that buries the content people came for is worse
   * than no ad, because they leave.
   */
  if (format === 'strip') {
    return (
      <aside
        aria-label="Advertisement"
        data-ad-placement={placement}
        style={style}
        className={cn(
          'relative flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl',
          'border border-dashed border-white/12 bg-white/[0.02] pl-4 pr-9 py-2.5',
          className
        )}
      >
        <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-dim/60 shrink-0">
          Ad
        </span>

        <span className="text-[0.88rem] text-star">Buy your advertisement here</span>

        <span className="text-[0.82rem] text-dim hidden sm:inline">
          Reach founders, builders and investors across SFCollab.
        </span>

        <span className="flex items-center gap-3 ml-auto shrink-0">
          <Link
            to="/advertise"
            className="font-mono text-[9.5px] tracking-[0.14em] uppercase px-3 py-1 rounded-full border border-gold/45 text-gold hover:text-star hover:border-gold transition-colors"
          >
            Advertise
          </Link>
          <Link
            to="/plans"
            className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-dim hover:text-star transition-colors"
          >
            Ad-free →
          </Link>
        </span>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss advertisement"
          className="absolute top-1/2 right-2 -translate-y-1/2 p-1 rounded-md text-dim hover:text-star hover:bg-white/[0.06] transition-colors"
        >
          <X size={12} />
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Advertisement"
      data-ad-placement={placement}
      className={cn(
        'relative rounded-2xl border border-dashed border-white/12 bg-white/[0.02]',
        'flex flex-col items-center justify-center gap-2 p-4 text-center',
        FORMATS[format] || FORMATS.banner,
        className
      )}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss advertisement"
        className="absolute top-2 right-2 p-1 rounded-md text-dim hover:text-star hover:bg-white/[0.06] transition-colors"
      >
        <X size={13} />
      </button>

      <span className="font-mono text-[9.5px] tracking-[0.22em] uppercase text-dim/70">
        Advertisement
      </span>

      <span className="font-display text-[1.02rem] text-star">
        Buy your advertisement here
      </span>

      <span className="text-[0.85rem] text-dim max-w-[42ch]">
        Reach founders, builders and investors across the SFCollab ecosystem.
      </span>

      <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
        <Link
          to="/advertise"
          className="font-mono text-[10px] tracking-[0.14em] uppercase px-3.5 py-1.5 rounded-full border border-gold/45 text-gold hover:text-star hover:border-gold transition-colors"
        >
          Advertise with us
        </Link>
        <Link
          to="/plans"
          className="font-mono text-[10px] tracking-[0.14em] uppercase text-dim hover:text-star transition-colors"
        >
          Go ad-free →
        </Link>
      </div>
    </aside>
  );
}

/**
 * Interleaves ad slots into a long list at a fixed cadence, so ads appear
 * through a scroll rather than only at the top and bottom. Returns the original
 * array untouched on paid plans.
 *
 *   {withAds(items, 6, 'discover').map(renderRow)}
 */
export function useInterleavedAds() {
  const { showAds } = useEntitlements();

  return React.useCallback(
    (items = [], every = 6, placement = 'list') => {
      if (!showAds || items.length <= every) return items;

      const out = [];
      items.forEach((item, i) => {
        out.push(item);
        if ((i + 1) % every === 0 && i < items.length - 1) {
          out.push({ __ad: true, key: `ad-${placement}-${i}`, placement });
        }
      });
      return out;
    },
    [showAds]
  );
}

export default AdSlot;

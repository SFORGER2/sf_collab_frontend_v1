import React from 'react';
import { cn } from '../../lib/utils';
import { Display, Eyebrow } from './primitives';
import { AdSlot } from './AdSlot';
import { useEntitlements } from '@/services/entitlements/useEntitlements';

/**
 * The standard page container.
 *
 * Most screens in this app set their own width, padding and heading markup, so
 * they don't line up with each other — some run edge-to-edge, some centre at a
 * different max-width, and headings vary in size and weight. Wrapping a page in
 * PageShell gives it the same gutters, the same measure, and the same masthead
 * treatment as everything else.
 *
 *   <PageShell eyebrow="Builder" title="Rewards"
 *              description="What your contributions have earned.">
 *     …
 *   </PageShell>
 *
 * `width` controls the measure:
 *   default  1100px — reading and forms
 *   wide     1400px — dashboards, dense tables, card grids
 *   full     no cap — canvases and workspaces that genuinely need the room
 *
 * On ad-supported plans a slot is placed directly under the masthead, which is
 * the top of the scroll — the previous footer placement was rarely seen.
 */
const WIDTHS = {
  default: 'max-w-[1100px]',
  wide: 'max-w-[1400px]',
  full: 'max-w-none',
};

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  width = 'default',
  showAd = true,
  adPlacement,
  className,
  children,
}) {
  const { showAds } = useEntitlements();

  return (
    <div className={cn('w-full mx-auto px-4 sm:px-6 py-6 sm:py-8', WIDTHS[width] || WIDTHS.default, className)}>
      {(title || eyebrow || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {title && <Display size="lg" className={eyebrow ? 'mt-2' : undefined}>{title}</Display>}
            {description && (
              <p className="text-[0.95rem] text-dim mt-2 max-w-[64ch]">{description}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
        </header>
      )}

      {/* Ads sit at the top of the scroll on ad-supported plans, where they are
          actually seen, rather than buried at the foot of the page. */}
      {showAd && showAds && (
        <AdSlot placement={adPlacement || 'page-top'} format="banner" className="mb-6" />
      )}

      {children}
    </div>
  );
}

export default PageShell;

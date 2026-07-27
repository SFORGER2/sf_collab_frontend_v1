import React, { useState } from 'react';
import { AdSlot } from './AdSlot';

/**
 * The top ad bar that stays put while you scroll.
 *
 * `position: sticky` does not work here and can't be made to: the layout's
 * <main> is `overflow-hidden` and its inner scroll wrapper is
 * `overflow-x-hidden`, and any `overflow` value other than `visible` on an
 * ancestor makes that ancestor the sticky element's scroll container. The
 * element then "sticks" to a box that never scrolls, so it just scrolls away
 * with the page — measured: it moved from y=-25 to y=-57 on a 132px scroll.
 *
 * So it's `fixed`, pinned below the 64px navbar, with a spacer of the same
 * height holding its place in the flow. The spacer means content starts below
 * the bar instead of underneath it, and both vanish together on dismiss.
 */

const NAV_H = 64;   // navbar is h-16
const BAR_H = 60;   // strip (45px) + vertical padding

/**
 * Dismissal has to outlive the route change.
 *
 * The banner is remounted on every navigation, so component state reset it and
 * the ad came straight back — closing it did nothing you could feel. It now
 * stays shut for the rest of the session, which is what "close" means to the
 * person clicking it. Session, not forever: a permanent opt-out is what the
 * paid plan is for, and that path is one click away in the banner itself.
 */
const DISMISS_KEY = 'sfc.ads.dismissed';

function readDismissed() {
  try { return sessionStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
}

export function StickyTopAd({ placement }) {
  const [dismissed, setDismissed] = useState(readDismissed);

  const dismiss = () => {
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* blocked */ }
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <>
      {/* Holds the space so the page doesn't start underneath the bar */}
      <div style={{ height: BAR_H }} aria-hidden="true" />

      <div
        className="fixed left-0 right-0 z-30 px-4 sm:px-6 py-2"
        style={{
          top: NAV_H,
          background: 'linear-gradient(180deg, rgba(9,7,20,0.96) 70%, rgba(9,7,20,0) 100%)',
        }}
      >
        <div className="w-full max-w-[1180px] mx-auto">
          <AdSlot
            placement={placement}
            format="strip"
            className="backdrop-blur-xl"
            style={{ background: 'rgba(16,12,34,0.92)' }}
            onDismiss={dismiss}
          />
        </div>
      </div>
    </>
  );
}

export default StickyTopAd;

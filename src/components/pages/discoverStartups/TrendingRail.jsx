import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';

/**
 * Trending Now — one row, paged with arrows.
 *
 * It was a three-column grid that wrapped, so "trending" filled half the screen
 * and pushed everything below it out of sight. Trending is a glance, not a
 * section: one row, scroll sideways, get on with the page.
 *
 * Scroll-snap does the positioning so the arrows and a trackpad swipe agree
 * with each other, and the arrows disable at each end rather than sitting there
 * doing nothing.
 */
export default function TrendingRail({ children, title = 'Trending Now' }) {
  const railRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = () => {
    const el = railRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  useEffect(() => {
    sync();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [children]);

  /** Page by roughly one card, so a click always lands on a card edge. */
  const page = (dir) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector('[data-rail-item]');
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const arrow =
    'grid place-items-center w-9 h-9 rounded-full border transition-colors disabled:opacity-30 disabled:cursor-default';

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Flame className="w-5 h-5 text-orange-500" />
        <h2 className="text-xl font-bold text-white tracking-tight flex-1">{title}</h2>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => page(-1)}
            disabled={atStart}
            aria-label="Previous"
            className={`${arrow} border-white/15 text-dim hover:text-star hover:bg-white/10`}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            disabled={atEnd}
            aria-label="Next"
            className={`${arrow} border-white/15 text-dim hover:text-star hover:bg-white/10`}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {React.Children.map(children, (child, i) => (
          <div
            key={i}
            data-rail-item
            className="shrink-0 w-[300px] sm:w-[340px]"
            style={{ scrollSnapAlign: 'start' }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

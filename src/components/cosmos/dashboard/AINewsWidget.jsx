import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { CosmosButton } from '../CosmosButton';
import { Tag } from '../primitives';

/**
 * AI News, as a dashboard widget.
 *
 * It used to sit inside the Community submenu, which framed it as a social
 * destination. It is a free, always-on intelligence feed, so it belongs where
 * people already are. Free forever — it never consumes credits (see
 * ALWAYS_FREE in services/entitlements/entitlements.js).
 */
export default function AINewsWidget({ limit = 4 }) {
  const [items, setItems] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/ai-news/ainews?page=1&per_page=${limit}`, { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((body) => {
        if (cancelled) return;
        const list = body?.data?.items || body?.items || body?.data || [];
        setItems(Array.isArray(list) ? list.slice(0, limit) : []);
        setState('ready');
      })
      .catch(() => !cancelled && setState('error'));

    return () => { cancelled = true; };
  }, [limit]);

  return (
    <div className="flex flex-col gap-1" style={{ '--cosmos-accent': '#8b6cff' }}>
      <div className="flex items-center gap-2 mb-2">
        <Tag tone="live" dot>Free</Tag>
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-dim">
          Never uses credits
        </span>
      </div>

      {state === 'loading' && (
        <div className="flex flex-col gap-2 py-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-3 rounded bg-white/[0.06] animate-shimmer" />
          ))}
        </div>
      )}

      {state === 'error' && (
        <p className="text-[0.88rem] text-dim py-3">
          The news feed is unavailable right now.
        </p>
      )}

      {state === 'ready' && items.length === 0 && (
        <p className="text-[0.88rem] text-dim py-3">No stories yet today.</p>
      )}

      {state === 'ready' && items.length > 0 && (
        <ul className="flex flex-col divide-y divide-white/[0.07]">
          {items.map((item, i) => (
            <li key={item.id ?? i} className="py-2.5">
              <Link
                to={item.id ? `/ai-news/${item.id}` : '/ai-news'}
                className="group flex items-start gap-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.9rem] text-star leading-snug line-clamp-2 group-hover:text-violet transition-colors">
                    {item.title || item.headline || 'Untitled'}
                  </span>
                  {(item.source || item.published_at) && (
                    <span className="block font-mono text-[10px] tracking-[0.1em] uppercase text-dim mt-1">
                      {[item.source, item.published_at?.slice(0, 10)].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-dim shrink-0 mt-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <CosmosButton variant="quiet" size="sm" className="mt-3 self-start" asChild>
        <Link to="/ai-news">Open AI News</Link>
      </CosmosButton>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Timer } from 'lucide-react';
import { CosmosButton, Tag } from '@/components/cosmos';
import { drawsForRole, formatCountdown, nextClose, readDrawState } from '@/services/draws/draws';

/**
 * Compact draws summary for the dashboard. The full experience lives at /draws.
 */
export default function DrawsWidget() {
  const state = readDrawState();
  const role = localStorage.getItem('activeRole') || 'member';
  const draws = drawsForRole(role);

  return (
    <div className="flex flex-col gap-3" style={{ '--cosmos-accent': '#ffbf5e' }}>
      {draws.map((draw) => {
        const entry = state.entries[draw.id];
        const closes = nextClose(draw.cadence);

        return (
          <div
            key={draw.id}
            className="flex items-center gap-3 py-2.5 border-b border-white/[0.07] last:border-0"
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `${draw.accent}1f`, color: draw.accent }}
            >
              <Ticket size={15} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-[0.92rem] text-star truncate">{draw.name}</span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-dim">
                <Timer size={11} /> {formatCountdown(closes)}
              </span>
            </span>

            {entry ? (
              <Tag tone="live" dot>{entry.stake} in</Tag>
            ) : (
              <Tag tone="future">Not entered</Tag>
            )}
          </div>
        );
      })}

      <CosmosButton variant="primary" size="sm" className="mt-1 self-start" asChild>
        <Link to="/draws">Enter a draw</Link>
      </CosmosButton>
    </div>
  );
}

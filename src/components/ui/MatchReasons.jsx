import React from 'react';
import { Badge } from './badge';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

/**
 * MatchReasons Component
 *
 * Presentational component to render matchmaking reasons as chips/tags.
 *
 * @param {Object} props
 * @param {string[]} [props.reasons] - Array of matchmaking reasons
 * @param {string} [props.className] - Optional container class names
 */
export function MatchReasons({ reasons, className }) {
  if (!reasons || !Array.isArray(reasons) || reasons.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {reasons.map((reason, idx) => (
        <Badge
          key={idx}
          variant="secondary"
          className="text-[10px] px-2 py-0.5 bg-slate-800 border-slate-700/50 hover:bg-slate-800 text-slate-300 font-normal rounded-md flex items-center gap-1"
        >
          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
          {reason}
        </Badge>
      ))}
    </div>
  );
}

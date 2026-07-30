import React, { useState } from 'react';
import { GraduationCap, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import { Eyebrow, Panel, Tag } from './primitives';
import { CosmosButton } from './CosmosButton';

/**
 * Turn the tutorials back on.
 *
 * Every tour writes `sfc.tour.<key>.<role>` once it is dismissed and never
 * shows again — which is right, nobody wants the dashboard tour twice, but it
 * left no way back. People change roles, hand the account to a colleague, or
 * skip a tour by accident on the first click and then can't find it again.
 *
 * Clearing those keys is all it takes; the tours re-arm themselves.
 */

const PREFIX = 'sfc.tour.';

/** Every tour the current browser has seen, newest key order not guaranteed. */
export function seenTours() {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX)) out.push(key);
    }
  } catch {
    /* storage blocked */
  }
  return out;
}

export function resetTours() {
  const keys = seenTours();
  try {
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* storage blocked */
  }
  window.dispatchEvent(new CustomEvent('sfc:tours-reset'));
  return keys.length;
}

/** Full panel — for Settings and the Help centre. */
export function TutorialsControl({ className = '' }) {
  const [seen, setSeen] = useState(seenTours);

  const reset = () => {
    const n = resetTours();
    setSeen([]);
    toast.success(
      n ? `${n} tutorial${n === 1 ? '' : 's'} re-armed — they'll show again as you visit each page` : 'Tutorials were already on'
    );
  };

  return (
    <Panel className={`p-6 ${className}`} accent="#8b6cff">
      <div className="flex flex-wrap items-start gap-4">
        <span
          className="grid place-items-center w-11 h-11 rounded-xl shrink-0"
          style={{ background: 'rgba(139,108,255,0.14)', color: '#8b6cff' }}
        >
          <GraduationCap size={20} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Eyebrow>Tutorials</Eyebrow>
            <Tag tone="neutral">{seen.length} completed</Tag>
          </div>
          <p className="text-[0.88rem] text-dim mt-1.5 max-w-[58ch]">
            Each page shows its walkthrough once, then stays quiet. Turn them back on if you
            skipped one, switched roles, or someone else is picking this up.
          </p>
        </div>

        <CosmosButton variant="ghost" size="sm" onClick={reset} disabled={seen.length === 0}>
          <RotateCcw size={14} /> Show tutorials again
        </CosmosButton>
      </div>
    </Panel>
  );
}

/** Compact version — for a settings row or a menu. */
export function TutorialsResetButton({ className = '' }) {
  return (
    <button
      type="button"
      onClick={() => {
        const n = resetTours();
        toast.success(n ? 'Tutorials re-armed' : 'Tutorials were already on');
      }}
      className={`inline-flex items-center gap-2 text-[0.85rem] text-dim hover:text-star transition-colors ${className}`}
    >
      <RotateCcw size={13} /> Show tutorials again
    </button>
  );
}

export default TutorialsControl;

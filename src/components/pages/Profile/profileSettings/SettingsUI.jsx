import React from 'react';
import { Eyebrow } from '@/components/cosmos';

/**
 * Shared form primitives for Settings.
 *
 * The settings screens predated the cosmos theme and each section had invented
 * its own look: five different gradient boxes (blue, purple, green, orange,
 * pink), `bg-gray-700` inputs, `bg-blue-600` buttons. Reading down the page you
 * crossed five unrelated colour schemes, and none of them matched the app.
 *
 * These are the only building blocks a settings section should need. One panel
 * style, one input style, one toggle. Sections carry an accent for their icon
 * and focus ring — that is the only colour that varies, and it is deliberate.
 */

export const FIELD =
  'w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[0.92rem] text-star ' +
  'placeholder:text-dim/60 focus:outline-none focus:border-[var(--field-accent,#ffbf5e)] ' +
  'focus:bg-white/[0.06] transition-colors';

const READONLY =
  'w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.07] text-[0.92rem] ' +
  'text-dim cursor-not-allowed';

/** Section header — icon, title, one line of context. */
export function SectionHead({ icon: Icon, title, description, accent = '#ffbf5e' }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span
        className="grid place-items-center w-11 h-11 rounded-xl shrink-0"
        style={{ background: `${accent}18`, border: `1px solid ${accent}33`, color: accent }}
      >
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <h2 className="font-display text-[1.25rem] text-star leading-tight">{title}</h2>
        {description && <p className="text-[0.85rem] text-dim mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

/** A grouped block of related fields. */
export function SettingsCard({ title, hint, accent = '#ffbf5e', children, className = '' }) {
  return (
    <div
      className={`cosmos-panel p-5 ${className}`}
      style={{ '--cosmos-accent': accent, '--field-accent': accent }}
    >
      {title && (
        <div className="mb-4">
          <Eyebrow>{title}</Eyebrow>
          {hint && <p className="text-[0.82rem] text-dim mt-1.5">{hint}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

/** Label + control + optional hint/error, in a consistent vertical rhythm. */
export function Field({ label, hint, error, required, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="flex items-baseline gap-1.5 mb-1.5">
        <span className="cosmos-stat-label">{label}</span>
        {required && <span className="text-red-400 text-[0.7rem]">required</span>}
      </span>
      {children}
      {error ? (
        <span className="block text-[0.78rem] text-red-400 mt-1.5">{error}</span>
      ) : hint ? (
        <span className="block text-[0.78rem] text-dim mt-1.5">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput({ readOnly, className = '', ...props }) {
  return <input {...props} readOnly={readOnly} className={`${readOnly ? READONLY : FIELD} ${className}`} />;
}

export function TextArea({ className = '', ...props }) {
  return <textarea {...props} className={`${FIELD} resize-y ${className}`} />;
}

/**
 * Native select, restyled. Options still render with the OS palette, so they
 * get an explicit dark background rather than inheriting white-on-white.
 */
export function Select({ options = [], placeholder = 'Select…', className = '', ...props }) {
  return (
    <select {...props} className={`${FIELD} ${className}`}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => {
        const value = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        return (
          <option key={value} value={value} style={{ background: 'var(--surface-option)', color: "var(--color-star)" }}>
            {label}
          </option>
        );
      })}
    </select>
  );
}

/** Row with a label, a description and a switch on the right. */
export function Toggle({ label, description, checked, onChange, accent = '#ffbf5e' }) {
  return (
    <label className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors">
      <span className="min-w-0">
        <span className="block text-[0.9rem] text-star">{label}</span>
        {description && <span className="block text-[0.78rem] text-dim mt-0.5">{description}</span>}
      </span>

      <span className="relative shrink-0">
        <input
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only peer"
        />
        <span
          className="block w-10 h-[22px] rounded-full transition-colors"
          style={{ background: checked ? accent : 'rgba(255,255,255,0.14)' }}
        />
        <span
          className="absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(18px)' : 'none' }}
        />
      </span>
    </label>
  );
}

/** Multi-select as a row of pills — used for roles, focus areas, interests. */
export function PillGroup({ options = [], value = [], onChange, accent = '#ffbf5e' }) {
  const toggle = (v) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const val = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        const on = value.includes(val);
        return (
          <button
            key={val}
            type="button"
            onClick={() => toggle(val)}
            className="px-3.5 py-2 rounded-xl border text-[0.85rem] capitalize transition-colors"
            style={
              on
                ? { borderColor: `${accent}88`, background: `${accent}14`, color: accent }
                : { borderColor: 'rgba(255,255,255,0.1)', color: 'var(--color-dim)' }
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Inline warning — for "you must set X" states that block a feature. */
export function Notice({ tone = 'warn', children }) {
  const tones = {
    warn: { color: '#ffbf5e', bg: 'rgba(255,191,94,0.08)', border: 'rgba(255,191,94,0.28)' },
    error: { color: '#ff8080', bg: 'rgba(255,128,128,0.08)', border: 'rgba(255,128,128,0.3)' },
    info: { color: '#4fd8ff', bg: 'rgba(79,216,255,0.08)', border: 'rgba(79,216,255,0.28)' },
  };
  const t = tones[tone] || tones.warn;

  return (
    <div
      className="rounded-xl px-3.5 py-2.5 text-[0.83rem]"
      style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.color }}
    >
      {children}
    </div>
  );
}

/** Two-column grid that collapses on narrow screens. */
export function FieldGrid({ children, className = '' }) {
  return (
    <div className={`grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] ${className}`}>
      {children}
    </div>
  );
}

import React from 'react';
import { cn } from '../../lib/utils';
import { roleAccentVars } from './roles';

/* ==========================================================================
   Surfaces
   ========================================================================== */

/**
 * Panel — the primary content surface. Frosted, 22px, hairline bordered.
 * One panel per logical block; don't nest panels inside panels (use Card).
 *
 * `accent` draws a 1px gradient rule along the top edge and sets the accent
 * variable for everything inside, so Eyebrow/StatTile pick it up for free.
 */
export function Panel({ as: Tag = 'section', className, accent, role, style, children, ...props }) {
  const accentVars = role ? roleAccentVars(role) : accent ? { '--cosmos-accent': accent } : null;

  return (
    <Tag
      className={cn('cosmos-panel', (accent || role) && 'cosmos-panel-accent', className)}
      style={{ ...accentVars, ...style }}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * Card — a secondary surface for items inside a Panel. Pass `interactive` when
 * the whole card is a link or button target: it lifts and takes the accent
 * colour on hover.
 */
export function Card({
  as: Tag = 'div',
  className,
  interactive = false,
  accent,
  role,
  style,
  children,
  ...props
}) {
  const accentVars = role ? roleAccentVars(role) : accent ? { '--cosmos-accent': accent } : null;

  return (
    <Tag
      className={cn('cosmos-card', interactive && 'cosmos-card-interactive', 'p-5', className)}
      style={{ ...accentVars, ...style }}
      {...props}
    >
      {children}
    </Tag>
  );
}

/* ==========================================================================
   Typography
   ========================================================================== */

/**
 * Eyebrow — the mono, wide-tracked, uppercase label above a heading. This is
 * the single strongest signal that a screen belongs to the cosmos system, so
 * prefer giving every Panel one over adding decoration elsewhere.
 */
export function Eyebrow({ as: Tag = 'p', className, children, ...props }) {
  return (
    <Tag className={cn('cosmos-eyebrow', className)} {...props}>
      {children}
    </Tag>
  );
}

const DISPLAY_SIZES = {
  xl: 'text-[clamp(1.7rem,4.6vw,3.3rem)] leading-[1.28]',
  lg: 'text-[clamp(1.45rem,3vw,2.2rem)] leading-[1.3]',
  md: 'text-[clamp(1.2rem,2.2vw,1.6rem)] leading-[1.35]',
  sm: 'text-[1.05rem] leading-[1.4]',
};

/**
 * Display — Unbounded heading. Choose the level for document structure and the
 * `size` for visual weight; they're deliberately independent so a section can
 * be an <h2> without being forced to look like one.
 */
export function Display({ as: Tag = 'h2', size = 'lg', className, children, ...props }) {
  return (
    <Tag
      className={cn(
        'font-display font-semibold tracking-[-0.02em] text-star',
        DISPLAY_SIZES[size] || DISPLAY_SIZES.lg,
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/** Lede — the slightly larger intro paragraph under a Display heading. */
export function Lede({ className, children, ...props }) {
  return (
    <p className={cn('text-[1.08rem] text-star/90 max-w-[70ch]', className)} {...props}>
      {children}
    </p>
  );
}

/* ==========================================================================
   Status
   ========================================================================== */

const TAG_TONES = {
  live: 'cosmos-tag-live',
  dev: 'cosmos-tag-dev',
  planned: 'cosmos-tag-planned',
  future: 'cosmos-tag-future',
  demo: 'cosmos-tag-demo',
  accent: 'cosmos-tag-accent',
  neutral: '',
};

/**
 * Tag — a status pill. `dot` adds a pulsing indicator; reserve it for state
 * that is genuinely live right now, otherwise it cries wolf.
 */
export function Tag({ tone = 'neutral', dot = false, className, children, ...props }) {
  return (
    <span className={cn('cosmos-tag', TAG_TONES[tone] ?? '', className)} {...props}>
      {dot && <span className="cosmos-tag-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

/* ==========================================================================
   Metrics
   ========================================================================== */

/**
 * StatTile — a single number with a mono caption. The gamified unit of the
 * dashboards: points, streaks, contributions, reputation, wallet balance.
 *
 * `delta` renders a signed change chip; positive reads emerald, negative red.
 */
export function StatTile({
  value,
  label,
  hint,
  delta,
  icon,
  accent,
  role,
  className,
  style,
  ...props
}) {
  const accentVars = role ? roleAccentVars(role) : accent ? { '--cosmos-accent': accent } : null;
  const deltaNum = typeof delta === 'number' ? delta : null;

  return (
    <div
      className={cn('cosmos-card p-5 flex flex-col gap-1.5', className)}
      style={{ ...accentVars, ...style }}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="cosmos-stat-label">{label}</span>
        {icon && (
          <span className="text-dim shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      <span className="cosmos-stat-value">{value}</span>

      {(hint || deltaNum !== null) && (
        <div className="flex items-center gap-2 flex-wrap">
          {deltaNum !== null && (
            <span
              className={cn(
                'font-mono text-[10.5px] tracking-[0.1em] px-1.5 py-0.5 rounded',
                deltaNum >= 0
                  ? 'text-emerald-400 bg-emerald-400/10'
                  : 'text-red-400 bg-red-400/10'
              )}
            >
              {deltaNum >= 0 ? '+' : ''}
              {deltaNum}
            </span>
          )}
          {hint && <span className="text-[0.82rem] text-dim">{hint}</span>}
        </div>
      )}
    </div>
  );
}

/**
 * ProgressRail — a thin gold-to-cyan meter. Use for anything with a completion
 * percentage: profile completeness, milestone progress, funding, XP to level.
 */
export function ProgressRail({ value = 0, label, showValue = true, className, ...props }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && <span className="cosmos-stat-label">{label}</span>}
          {showValue && (
            <span className="font-mono text-[11px] text-gold tabular-nums">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div
        className="cosmos-rail"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ==========================================================================
   Progression
   ========================================================================== */

/**
 * StepPath — numbered progression with the gold-to-violet connector line.
 * Feed it `steps: [{ title, description, done }]`. Used for onboarding,
 * milestones, and the Vision-to-Startup journey.
 */
export function StepPath({ steps = [], className, ...props }) {
  return (
    <ol className={cn('cosmos-path', className)} {...props}>
      {steps.map((step, i) => (
        <li key={step.id ?? i} data-done={step.done ? 'true' : undefined}>
          <b className={cn('font-medium', step.done ? 'text-emerald-400' : 'text-star')}>
            {step.title}
          </b>
          {step.description && (
            <span className="block text-[0.92rem] text-dim">{step.description}</span>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Wordmark — the animated gradient SFCollab logotype. */
export function Wordmark({ as: Tag = 'span', className, children = 'SFCollab', ...props }) {
  return (
    <Tag className={cn('cosmos-wordmark', className)} {...props}>
      {children}
    </Tag>
  );
}

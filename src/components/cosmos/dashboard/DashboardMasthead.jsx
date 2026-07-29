import React from 'react';
import { Link } from 'react-router-dom';
import { Coins, Sparkles } from 'lucide-react';
import { Eyebrow, Tag } from '../primitives';
import { CosmosButton } from '../CosmosButton';
import { roleAccent } from '../roles';
import { useEntitlements } from '@/services/entitlements/useEntitlements';

const GREETINGS = [
  { until: 5, text: 'Still up' },
  { until: 12, text: 'Good morning' },
  { until: 18, text: 'Good afternoon' },
  { until: 24, text: 'Good evening' },
];

function greeting() {
  const h = new Date().getHours();
  return (GREETINGS.find((g) => h < g.until) || GREETINGS[3]).text;
}

/**
 * The dashboard masthead.
 *
 * Replaces a bare "Welcome back, {name}." line that used a third of the fold to
 * say nothing actionable. It now carries the four things worth knowing on
 * arrival — who you're working as, the date, your plan and credit balance, and
 * the one action that matters for this role — while keeping the greeting.
 *
 * The role's accent colour runs through the rule beneath it, so switching
 * roles is visible even above the fold.
 */
export function DashboardMasthead({ role = 'member', name, primaryAction, children }) {
  const accent = roleAccent(role);
  const { plan, credits, showAds } = useEntitlements();

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <header className="relative mb-6" style={{ '--cosmos-accent': accent.color }}>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span
              aria-hidden="true"
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: accent.color, boxShadow: `0 0 10px ${accent.color}` }}
            />
            <Eyebrow>{accent.label} workspace</Eyebrow>
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-dim hidden sm:inline">
              · {today}
            </span>
          </div>

          <h1 className="font-display text-[clamp(1.5rem,3.2vw,2.15rem)] leading-tight text-star">
            {greeting()}
            {name ? `, ${name}` : ''}.
          </h1>

          {children && <div className="mt-2.5 text-[0.95rem] text-dim max-w-[60ch]">{children}</div>}
        </div>

        <div className="flex flex-col items-end gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <Link to="/plans" aria-label={`Current plan: ${plan.name}`}>
              <Tag tone={plan.showsAds ? 'future' : 'accent'}>{plan.name}</Tag>
            </Link>
            <Link
              to="/credits"
              className="flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.14em] uppercase text-dim hover:text-gold transition-colors"
            >
              <Coins size={13} /> {credits.toLocaleString()}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <CosmosButton variant="ai" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('sfassistant:open'))}>
              <Sparkles size={14} /> Ask SF
            </CosmosButton>
            {primaryAction && (
              <CosmosButton variant="primary" size="sm" asChild>
                <Link to={primaryAction.to}>{primaryAction.label}</Link>
              </CosmosButton>
            )}
          </div>
        </div>
      </div>

      {/* Role-coloured rule — the accent thread from the landing page */}
      <div
        aria-hidden="true"
        className="mt-5 h-px w-full"
        style={{
          background: `linear-gradient(90deg, ${accent.color}, ${accent.color}22 35%, transparent 70%)`,
        }}
      />

      {showAds && (
        <p className="mt-2 font-mono text-[9.5px] tracking-[0.16em] uppercase text-dim/60">
          Free plan · ad-supported
        </p>
      )}
    </header>
  );
}

export default DashboardMasthead;

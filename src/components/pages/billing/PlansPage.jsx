import React from 'react';
import { Check, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PLAN_ORDER, PLANS } from '@/services/entitlements/entitlements';
import { useEntitlements } from '@/services/entitlements/useEntitlements';
import { CosmosButton, Display, Eyebrow, Lede, Panel, Reveal, Tag } from '@/components/cosmos';

const LIMIT_ROWS = [
  { key: 'assistantMessagesPerDay', label: 'AI assistant messages / day' },
  { key: 'matchSuggestionsPerDay', label: 'AI match suggestions / day' },
  { key: 'aiGenerationsPerDay', label: 'AI generations / day' },
  { key: 'activeVisions', label: 'Active Visions' },
  { key: 'driveStorageGb', label: 'SF Drive storage (GB)' },
];

const fmt = (v) => (v === Infinity ? 'Unlimited' : v.toLocaleString());

/**
 * Plan comparison and upgrade.
 *
 * NOTE FOR BACKEND: plan definitions live in
 * services/entitlements/entitlements.js as the frontend's source of truth so
 * the UI is reviewable offline. They must be replaced by
 * GET /api/billing/plans, and the limits mirrored server-side — the frontend
 * copy shapes the interface, it does not enforce anything.
 *
 * "Choose plan" currently switches the local plan so gating can be exercised
 * across the app. Replace with a Stripe checkout session.
 */
export default function PlansPage() {
  const { plan: currentPlan, setPlan } = useEntitlements();

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      <Reveal className="text-center">
        <Eyebrow>Billing</Eyebrow>
        <Display size="xl" className="mt-3 mb-4">Choose your plan</Display>
        <Lede className="mx-auto">
          Every plan includes the full ecosystem — Visions, startups, SF Drive, SF Meet and the
          community. Plans differ in how much AI you can use each day.
        </Lede>
      </Reveal>

      <Reveal stagger className="grid gap-4 mt-9 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isCurrent = currentPlan.id === id;

          return (
            <div
              key={id}
              className="cosmos-panel cosmos-panel-accent p-6 flex flex-col gap-4"
              style={{ '--cosmos-accent': plan.accent }}
            >
              <div className="flex items-center justify-between gap-2">
                <Eyebrow>{plan.name}</Eyebrow>
                {plan.popular && <Tag tone="accent">Most popular</Tag>}
                {isCurrent && <Tag tone="live" dot>Current</Tag>}
              </div>

              <div>
                <span className="font-display text-[2.1rem] text-star leading-none">
                  ${plan.price}
                </span>
                <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-dim ml-1.5">
                  / month
                </span>
              </div>

              <p className="text-[0.9rem] text-dim">{plan.tagline}</p>

              <ul className="flex flex-col gap-2 mt-1">
                {LIMIT_ROWS.map((row) => (
                  <li key={row.key} className="flex items-start gap-2 text-[0.85rem]">
                    <Check size={13} className="mt-1 shrink-0" style={{ color: plan.accent }} />
                    <span className="text-dim">
                      <span className="text-star font-medium">{fmt(plan.limits[row.key])}</span>{' '}
                      {row.label.replace(/ \/ day$/, ' per day').toLowerCase()}
                    </span>
                  </li>
                ))}
                <li className="flex items-start gap-2 text-[0.85rem]">
                  {plan.showsAds ? (
                    <Minus size={13} className="mt-1 shrink-0 text-dim" />
                  ) : (
                    <Check size={13} className="mt-1 shrink-0" style={{ color: plan.accent }} />
                  )}
                  <span className={plan.showsAds ? 'text-dim' : 'text-star'}>
                    {plan.showsAds ? 'Ad-supported' : 'No advertising'}
                  </span>
                </li>
              </ul>

              <CosmosButton
                variant={plan.popular ? 'primary' : 'ghost'}
                size="sm"
                className="mt-auto"
                disabled={isCurrent}
                onClick={() => setPlan(id)}
              >
                {isCurrent ? 'Your plan' : `Choose ${plan.name}`}
              </CosmosButton>
            </div>
          );
        })}
      </Reveal>

      <Panel className="p-6 mt-8 overflow-x-auto">
        <Eyebrow className="mb-4">Full comparison</Eyebrow>
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-2.5 cosmos-stat-label font-normal">Limit</th>
              {PLAN_ORDER.map((id) => (
                <th key={id} className="py-2.5 cosmos-stat-label font-normal text-right">
                  {PLANS[id].name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LIMIT_ROWS.map((row) => (
              <tr key={row.key} className="border-b border-white/[0.07]">
                <td className="py-2.5 text-[0.9rem] text-star">{row.label}</td>
                {PLAN_ORDER.map((id) => (
                  <td key={id} className="py-2.5 font-mono text-[11px] text-dim text-right tabular-nums">
                    {fmt(PLANS[id].limits[row.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <p className="text-center text-[0.88rem] text-dim mt-6">
        Need more than a plan allows on a given day?{' '}
        <Link to="/credits" className="text-gold hover:text-star transition-colors">
          Top up with credits
        </Link>
        .
      </p>
    </div>
  );
}

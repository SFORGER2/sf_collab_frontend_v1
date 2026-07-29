import React, { useState } from 'react';
import { Check, Mail, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LIMIT_LABELS, limitKeysForRole, plansForRole, taglineForRole } from '@/services/entitlements/plans';
import { useEntitlements } from '@/services/entitlements/useEntitlements';
import {
  CosmosButton, Display, Eyebrow, Lede, PageShell, Panel, Reveal, RoleTabs, Tag,
} from '@/components/cosmos';

const fmt = (v) => (v === Infinity ? 'Unlimited' : typeof v === 'number' ? v.toLocaleString() : v);

/**
 * Plans, per role.
 *
 * Each role has its own four-step ladder plus Enterprise, because the thing you
 * run out of differs by role — a founder runs out of Vision slots, a builder
 * runs out of applications, an influencer runs out of generations. A single
 * shared ladder priced the wrong resource for four of the five profiles.
 *
 * The role switcher lets you compare ladders without changing your active role,
 * which matters for anyone who wears more than one hat.
 *
 * NOTE FOR BACKEND: definitions live in services/entitlements/plans.js so the
 * page is reviewable offline. Replace with GET /api/billing/plans?role=… and
 * mirror every limit server-side. "Choose" currently only switches the local
 * plan so gating can be exercised — it needs a Stripe checkout session.
 */
export default function PlansPage() {
  const { plan: currentPlan, setPlan } = useEntitlements();
  const activeRole = localStorage.getItem('activeRole') || 'member';
  const [role, setRole] = useState(activeRole);

  const plans = plansForRole(role);
  const limitKeys = limitKeysForRole(role);

  return (
    <PageShell width="wide" showAd={false}>
      <Reveal className="text-center">
        <Eyebrow>Billing</Eyebrow>
        <Display size="xl" className="mt-3 mb-4">Choose Your Plan</Display>
        <Lede className="mx-auto">{taglineForRole(role)}</Lede>
        <p className="text-[0.9rem] text-dim mt-3 max-w-[64ch] mx-auto">
          Every plan includes the full ecosystem — Visions, startups, SF Drive, SF Meet and the
          community. Plans differ in how much of each role's work you can do per day.
        </p>
      </Reveal>

      {/* Compare any role's ladder without switching your active role */}
      <div className="flex flex-col items-center gap-2.5 mt-7">
        <span className="cosmos-stat-label">Plans for</span>
        <RoleTabs value={role} onChange={setRole} label="Choose a role to compare plans" />
      </div>

      <Reveal
        stagger
        className="grid gap-4 mt-8 [grid-template-columns:repeat(auto-fit,minmax(215px,1fr))]"
      >
        {plans.map((plan) => {
          const isCurrent = currentPlan.id === plan.id;

          return (
            <div
              key={plan.id}
              className="cosmos-panel cosmos-panel-accent p-6 flex flex-col gap-4"
              style={{ '--cosmos-accent': plan.accent }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Eyebrow>{plan.name}</Eyebrow>
                {plan.popular && <Tag tone="accent">Most Popular</Tag>}
                {isCurrent && <Tag tone="live" dot>Current</Tag>}
              </div>

              <div>
                {plan.contactOnly ? (
                  <span className="font-display text-[1.5rem] text-star leading-none">
                    Let's Talk
                  </span>
                ) : (
                  <>
                    <span className="font-display text-[2rem] text-star leading-none">
                      ${plan.price}
                    </span>
                    <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-dim ml-1.5">
                      / Month
                    </span>
                  </>
                )}
              </div>

              <p className="text-[0.88rem] text-dim">{plan.summary}</p>

              <ul className="flex flex-col gap-2 mt-1">
                {plan.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-[0.85rem] text-star/90">
                    <Check size={13} className="mt-1 shrink-0" style={{ color: plan.accent }} />
                    {h}
                  </li>
                ))}
                <li className="flex items-start gap-2 text-[0.85rem]">
                  {plan.showsAds ? (
                    <Minus size={13} className="mt-1 shrink-0 text-dim" />
                  ) : (
                    <Check size={13} className="mt-1 shrink-0" style={{ color: plan.accent }} />
                  )}
                  <span className={plan.showsAds ? 'text-dim' : 'text-star/90'}>
                    {plan.showsAds ? 'Ad-supported' : 'No Advertising'}
                  </span>
                </li>
              </ul>

              {plan.contactOnly ? (
                <CosmosButton variant="ghost" size="sm" className="mt-auto" asChild>
                  <Link to="/contact"><Mail size={14} /> Contact Us</Link>
                </CosmosButton>
              ) : (
                <CosmosButton
                  variant={plan.popular ? 'primary' : 'ghost'}
                  size="sm"
                  className="mt-auto"
                  disabled={isCurrent}
                  onClick={() => setPlan(plan.id)}
                >
                  {isCurrent ? 'Your Plan' : `Choose ${plan.name}`}
                </CosmosButton>
              )}
            </div>
          );
        })}
      </Reveal>

      <Panel className="p-6 mt-8">
        <Eyebrow className="mb-4">Full Comparison</Eyebrow>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-2.5 cosmos-stat-label font-normal">Limit</th>
                {plans.map((p) => (
                  <th key={p.id} className="py-2.5 cosmos-stat-label font-normal text-right">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {limitKeys.map((key) => (
                <tr key={key} className="border-b border-white/[0.07]">
                  <td className="py-2.5 text-[0.9rem] text-star">{LIMIT_LABELS[key] || key}</td>
                  {plans.map((p) => (
                    <td
                      key={p.id}
                      className="py-2.5 font-mono text-[11px] text-dim text-right tabular-nums"
                    >
                      {fmt(p.limits?.[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="text-center text-[0.88rem] text-dim mt-6">
        Need more than a plan allows on a given day?{' '}
        <Link to="/credits" className="text-gold hover:text-star transition-colors">
          Top Up With Credits
        </Link>
        .
      </p>
    </PageShell>
  );
}

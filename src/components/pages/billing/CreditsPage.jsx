import React, { useState } from 'react';
import { Check, Coins, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CREDIT_COSTS, CREDIT_PACKS } from '@/services/entitlements/entitlements';
import { useEntitlements } from '@/services/entitlements/useEntitlements';
import { CosmosButton, Display, Eyebrow, Lede, Panel, Reveal, Tag } from '@/components/cosmos';

const COST_LABELS = {
  matchSuggestion: 'AI match suggestion',
  assistantMessage: 'Assistant message',
  aiGeneration: 'AI generation',
  logoGeneration: 'Logo generation',
  businessPlan: 'Business plan',
  pitchDeck: 'Pitch deck',
  videoGeneration: 'Video generation',
};

/**
 * Credit purchase.
 *
 * Credits are the metered currency for AI work — they top up when a plan's
 * daily allowance runs out, so nobody is hard-stopped mid-task.
 *
 * NOTE FOR BACKEND: checkout is not wired. `handleBuy` currently credits the
 * local account directly so the flow is reviewable. It must be replaced with a
 * Stripe session against POST /api/billing/credits/checkout — @stripe/stripe-js
 * and @stripe/react-stripe-js are already dependencies, and /checkout/:tierId
 * plus /checkout/return already exist for the crowdfunding flow.
 */
export default function CreditsPage() {
  const { credits, plan, addCredits } = useEntitlements();
  const [pending, setPending] = useState(null);

  const handleBuy = (pack) => {
    setPending(pack.id);
    // Placeholder for the real checkout session.
    setTimeout(() => {
      addCredits(pack.credits + (pack.bonus || 0));
      setPending(null);
    }, 450);
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
      <Reveal>
        <Eyebrow>Billing</Eyebrow>
        <Display size="xl" className="mt-3 mb-4">Credits</Display>
        <Lede>
          Credits pay for AI work — matchmaking, generation, and assistant messages beyond your
          plan's daily allowance. They never expire.
        </Lede>
      </Reveal>

      <Panel className="p-6 mt-8 flex flex-wrap items-center justify-between gap-5" accent="#ffbf5e">
        <div>
          <Eyebrow>Current balance</Eyebrow>
          <p className="cosmos-stat-value mt-1.5">{credits.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <span className="cosmos-stat-label">Your plan</span>
          <p className="font-display text-[1.05rem] text-star mt-1">{plan.name}</p>
          <Link
            to="/plans"
            className="font-mono text-[10px] tracking-[0.14em] uppercase text-gold hover:text-star transition-colors"
          >
            Compare plans →
          </Link>
        </div>
      </Panel>

      <Reveal stagger className="grid gap-4 mt-6 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
        {CREDIT_PACKS.map((pack) => (
          <div
            key={pack.id}
            className="cosmos-panel p-5 flex flex-col gap-3"
            style={{ '--cosmos-accent': pack.accent }}
          >
            <div className="flex items-center justify-between gap-2">
              <Eyebrow>{pack.name}</Eyebrow>
              {pack.popular && <Tag tone="accent">Best value</Tag>}
            </div>

            <div>
              <span className="cosmos-stat-value" style={{ color: pack.accent }}>
                {pack.credits.toLocaleString()}
              </span>
              {pack.bonus > 0 && (
                <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-emerald-400 mt-1">
                  +{pack.bonus.toLocaleString()} bonus
                </span>
              )}
            </div>

            <p className="font-display text-[1.3rem] text-star">${pack.price}</p>

            <CosmosButton
              variant={pack.popular ? 'primary' : 'ghost'}
              size="sm"
              className="mt-auto"
              disabled={pending === pack.id}
              onClick={() => handleBuy(pack)}
            >
              {pending === pack.id ? 'Processing…' : <><Coins size={14} /> Buy credits</>}
            </CosmosButton>
          </div>
        ))}
      </Reveal>

      <Panel className="p-6 mt-6">
        <Eyebrow>What credits buy</Eyebrow>
        <div className="grid gap-2.5 mt-4 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
          {Object.entries(CREDIT_COSTS).map(([key, cost]) => (
            <div key={key} className="flex items-center justify-between gap-3 py-2 border-b border-white/[0.07]">
              <span className="text-[0.9rem] text-star">{COST_LABELS[key] || key}</span>
              <span className="font-mono text-[11px] text-gold tabular-nums">{cost}</span>
            </div>
          ))}
        </div>

        <p className="flex items-start gap-2 text-[0.85rem] text-dim mt-5">
          <Info size={14} className="shrink-0 mt-0.5" />
          AI News and the knowledge base are always free and never consume credits.
        </p>
      </Panel>

      <Panel className="p-6 mt-6">
        <Eyebrow>Included every day</Eyebrow>
        <ul className="grid gap-2 mt-4">
          {Object.entries(plan.limits).map(([key, value]) => (
            <li key={key} className="flex items-center gap-2.5 text-[0.9rem] text-star">
              <Check size={14} className="text-emerald-400 shrink-0" />
              <span className="text-dim">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
              <span className="font-mono text-[11px] text-star">
                {value === Infinity ? 'Unlimited' : value}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Gem, Info, Package, Ticket } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  BASE_RATE, CONVERSION_TIERS, add, balance, crystalsForUsd, subscribe,
} from '@/services/wallet/crystals';
import { CosmosButton, Display, Eyebrow, Lede, Panel, Reveal, Tag } from '@/components/cosmos';
import { Field, Notice, TextInput } from '../Profile/profileSettings/SettingsUI';

/**
 * Buy SF Crystals.
 *
 * Crystals are the only scarce currency — the lottery takes them and items
 * trade for them, and nothing else does. Keeping both on one token means one
 * exchange rate to reason about, and it keeps the gambling surface away from
 * the credits people need for actual work. Nobody should have to choose
 * between a pitch deck and a roll.
 *
 * Larger tiers give more per dollar. That's standard, and it's also honest:
 * payment processing is close to a fixed cost per transaction, so a $5 top-up
 * genuinely costs more to serve than a $100 one.
 *
 * ⚠️ NO PAYMENT IS TAKEN HERE. This is the interface only — the button hands
 * off to checkout, and the balance must be credited by the backend after the
 * payment settles, never by the client.
 *
 * BACKEND: POST /api/wallet/convert { usd } → creates a Stripe session and
 * credits crystals on the webhook, not on return.
 */
export default function CrystalsPage() {
  const [bal, setBal] = useState(balance);
  const [custom, setCustom] = useState('');

  useEffect(() => subscribe(setBal), []);

  const customUsd = Number(custom) || 0;
  const customCrystals = customUsd > 0 ? crystalsForUsd(customUsd) : 0;

  const buy = (usd) => {
    // A real purchase goes through checkout; this only exists so the flow and
    // the balances downstream can be reviewed before payments are wired up.
    if (!import.meta.env.DEV) {
      toast.info('Checkout is not connected yet');
      return;
    }
    add(crystalsForUsd(usd));
    toast.success(`${crystalsForUsd(usd).toLocaleString()} crystals added (dev only)`);
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
      <Reveal>
        <Eyebrow>Wallet</Eyebrow>
        <Display size="xl" className="mt-3 mb-4">SF Crystals</Display>
        <Lede>
          The scarce one. Crystals buy lottery tickets and are the only thing members trade
          items for — so one rate, one token, no guessing what something is worth.
        </Lede>
      </Reveal>

      <Panel className="cosmos-panel-neon p-6 mt-7" accent="#4fd8ff">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-12 h-12 rounded-2xl"
                  style={{ background: 'rgba(79,216,255,0.12)', color: '#4fd8ff' }}>
              <Gem size={22} />
            </span>
            <div>
              <span className="cosmos-stat-label block">Your balance</span>
              <span className="font-display text-[1.9rem] text-cyan tabular-nums leading-none">
                {bal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <CosmosButton variant="ghost" size="sm" asChild>
              <Link to="/draws?tab=lottery"><Ticket size={14} /> Spend on the lottery</Link>
            </CosmosButton>
            <CosmosButton variant="quiet" size="sm" asChild>
              <Link to="/wallet/inventory"><Package size={14} /> My inventory</Link>
            </CosmosButton>
          </div>
        </div>
      </Panel>

      {/* Tiers */}
      <div className="grid gap-3 mt-5 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
        {CONVERSION_TIERS.map((tier) => (
          <div
            key={tier.id}
            className="cosmos-card p-5 flex flex-col gap-2"
            style={{ '--cosmos-accent': tier.bonus >= 25 ? '#ffbf5e' : '#4fd8ff' }}
          >
            <div className="flex items-center justify-between gap-2">
              <Eyebrow>${tier.usd}</Eyebrow>
              {tier.bonus > 0 && <Tag tone="accent">+{tier.bonus}%</Tag>}
            </div>

            <span className="font-display text-[1.5rem] text-star tabular-nums leading-none">
              {tier.crystals.toLocaleString()}
            </span>
            <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-dim">
              crystals
            </span>

            <span className="text-[0.78rem] text-dim mt-1">
              {Math.round(tier.crystals / tier.usd)} per dollar
            </span>

            <CosmosButton variant="ghost" size="sm" className="mt-auto" onClick={() => buy(tier.usd)}>
              Buy
            </CosmosButton>
          </div>
        ))}
      </div>

      {/* Custom amount */}
      <Panel className="p-6 mt-5" style={{ '--field-accent': '#4fd8ff' }}>
        <Eyebrow className="mb-3">Custom amount</Eyebrow>
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Amount in USD" className="min-w-[180px]">
            <TextInput
              type="number"
              min="1"
              value={custom}
              placeholder="25"
              onChange={(e) => setCustom(e.target.value)}
            />
          </Field>

          <div className="min-w-[140px]">
            <span className="cosmos-stat-label block mb-1.5">You receive</span>
            <span className="font-display text-[1.35rem] text-cyan tabular-nums">
              {customCrystals.toLocaleString()}
            </span>
          </div>

          <CosmosButton
            variant="primary"
            size="sm"
            disabled={customUsd <= 0}
            onClick={() => buy(customUsd)}
          >
            <Check size={13} /> Buy {customCrystals.toLocaleString()} crystals
          </CosmosButton>
        </div>

        <p className="text-[0.8rem] text-dim mt-3">
          Base rate is {BASE_RATE} crystals per dollar; the bonus from the nearest tier below
          your amount is applied automatically.
        </p>
      </Panel>

      <Panel className="p-6 mt-5">
        <Notice tone="info">
          Crystals are a platform currency for lottery entries and member-to-member item
          trades. They are not money, cannot be withdrawn, and are not exchangeable for cash.
        </Notice>
        <p className="flex items-start gap-2 text-[0.83rem] text-dim mt-4">
          <Info size={13} className="shrink-0 mt-0.5" />
          You can also earn crystals through contribution streaks and draws — see{' '}
          <Link to="/wallet/earn" className="text-gold hover:text-star transition-colors">
            Earn
          </Link>
          .
        </p>
      </Panel>
    </div>
  );
}

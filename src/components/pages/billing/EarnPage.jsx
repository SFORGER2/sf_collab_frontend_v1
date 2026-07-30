import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, CheckCircle, Coins, Gem, Lightbulb, MessageSquare,
  Rocket, Share2, UserPlus, Users,
} from 'lucide-react';
import {
  CosmosButton, Display, Eyebrow, Lede, Panel, ProgressRail, Reveal, Tag,
} from '@/components/cosmos';

/**
 * Earn SF Coins.
 *
 * SF Coins are earned through contribution, never bought — that separation is
 * what keeps them meaningful as a reputation signal. Credits are the purchased
 * currency and pay for AI compute; SF Coins pay for the store and draw entries.
 *
 * NOTE FOR BACKEND: every amount here is a placeholder. Real values, progress
 * and claim state need `GET /api/wallet/earn` plus a ledger endpoint.
 */
const EARN_ROUTES = [
  {
    group: 'Build',
    accent: '#4fd8ff',
    items: [
      { icon: CheckCircle, label: 'Complete a task', reward: 50, hint: 'Any task closed and approved in ERP.' },
      { icon: Rocket, label: 'Ship a milestone', reward: 250, hint: 'Move a Vision milestone to done.' },
      { icon: Users, label: 'Join a startup team', reward: 150, hint: 'One-off, per startup you join.' },
    ],
  },
  {
    group: 'Contribute',
    accent: '#ffbf5e',
    items: [
      { icon: Lightbulb, label: 'Submit an idea', reward: 40, hint: 'Post to the contribution board.' },
      { icon: MessageSquare, label: 'Give useful feedback', reward: 25, hint: 'Feedback marked helpful by the owner.' },
      { icon: CheckCircle, label: 'Vote in a poll', reward: 10, hint: 'Daily cap applies.' },
    ],
  },
  {
    group: 'Grow the ecosystem',
    accent: '#ff4fd8',
    items: [
      { icon: UserPlus, label: 'Refer someone who builds', reward: 500, hint: 'Paid when they complete their first task.' },
      { icon: Share2, label: 'Share a Vision', reward: 20, hint: 'Once per Vision, per platform.' },
      { icon: BookOpen, label: 'Write a knowledge entry', reward: 200, hint: 'Accepted into the knowledge base.' },
    ],
  },
];

export default function EarnPage() {
  const balance = 0;
  const crystals = 0;

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
      <Reveal>
        <Eyebrow>Wallet</Eyebrow>
        <Display size="xl" className="mt-3 mb-4">Earn SF Coins</Display>
        <Lede>
          SF Coins are earned, never bought. They come from real contribution — work shipped,
          feedback given, people brought in — and they spend in the SF Store and on draw entries.
        </Lede>
      </Reveal>

      <div className="grid gap-4 mt-7 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <Panel className="p-5" accent="#ffbf5e">
          <Eyebrow>SF Coins</Eyebrow>
          <p className="cosmos-stat-value mt-1.5">{balance.toLocaleString()}</p>
          <Link to="/store" className="font-mono text-[10px] tracking-[0.14em] uppercase text-gold hover:text-star transition-colors">
            Spend in SF Store →
          </Link>
        </Panel>

        <Panel className="p-5" accent="#4fd8ff">
          <Eyebrow>SF Crystals</Eyebrow>
          <p className="cosmos-stat-value mt-1.5" style={{ color: '#4fd8ff' }}>{crystals}</p>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-dim">
            Rare · 10× draw weight
          </span>
        </Panel>

        <Panel className="p-5" accent="#8b6cff">
          <Eyebrow>Credits</Eyebrow>
          <p className="text-[0.88rem] text-dim mt-2">
            AI tools run on credits, not SF Coins.
          </p>
          <CosmosButton variant="quiet" size="sm" className="mt-3" asChild>
            <Link to="/credits">Buy credits</Link>
          </CosmosButton>
        </Panel>
      </div>

      <Panel className="p-6 mt-5">
        <Eyebrow className="mb-3">This week</Eyebrow>
        <ProgressRail label="Weekly earning streak" value={0} />
        <p className="text-[0.88rem] text-dim mt-3">
          Contribute on five separate days to unlock a bonus SF Crystal.
        </p>
      </Panel>

      <div className="flex flex-col gap-5 mt-6">
        {EARN_ROUTES.map((group) => (
          <Panel key={group.group} className="p-6" accent={group.accent}>
            <Eyebrow className="mb-4">{group.group}</Eyebrow>
            <ul className="flex flex-col divide-y divide-white/[0.07]">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-center gap-3.5 py-3.5">
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `${group.accent}1f`, color: group.accent }}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.95rem] text-star">{item.label}</span>
                      <span className="block text-[0.82rem] text-dim">{item.hint}</span>
                    </span>
                    <Tag tone="accent">
                      <Coins size={11} /> +{item.reward}
                    </Tag>
                  </li>
                );
              })}
            </ul>
          </Panel>
        ))}
      </div>

      <Panel className="p-6 mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Eyebrow>Ready to spend?</Eyebrow>
          <p className="text-[0.9rem] text-dim mt-1.5">
            Stake SF Coins in daily and weekly draws for subscriptions, credits and badges.
          </p>
        </div>
        <CosmosButton variant="primary" size="sm" asChild>
          <Link to="/draws"><Gem size={14} /> Enter a draw</Link>
        </CosmosButton>
      </Panel>
    </div>
  );
}

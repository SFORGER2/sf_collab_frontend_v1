import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Mail, Target, TrendingUp, Users } from 'lucide-react';
import {
  CosmosButton, Display, Eyebrow, Lede, Panel, Reveal, Tag,
} from '@/components/cosmos';

/**
 * Advertise with SFCollab — the destination behind every ad slot's
 * "Buy your advertisement here" call to action.
 *
 * NOTE FOR BACKEND: there is no ad inventory or booking system yet. This page
 * describes the offer and collects interest; the enquiry form needs a real
 * endpoint (`POST /api/advertising/enquiry`) and the placement/pricing figures
 * are placeholders.
 */
const PLACEMENTS = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    accent: '#ffbf5e',
    reach: 'Every free-plan member, daily',
    description: 'A banner inside the dashboard grid, seen on every visit.',
  },
  {
    id: 'discovery',
    name: 'Discovery feed',
    accent: '#4fd8ff',
    description: 'Interleaved through startup and Vision browsing.',
    reach: 'Founders and builders actively searching',
  },
  {
    id: 'vision',
    name: 'Vision pages',
    accent: '#8b6cff',
    description: 'Alongside the space people spend the most time in.',
    reach: 'High-intent, long-dwell audience',
  },
];

export default function AdvertisePage() {
  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 py-8">
      <Reveal className="text-center">
        <Eyebrow>Advertising</Eyebrow>
        <Display size="xl" className="mt-3 mb-4">Reach people who build.</Display>
        <Lede className="mx-auto">
          SFCollab's audience is founders, builders, mentors, influencers and investors —
          people actively starting and staffing companies. Advertising is shown only to
          free-plan members, so it never interrupts paying customers.
        </Lede>
      </Reveal>

      <Reveal stagger className="grid gap-4 mt-9 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {PLACEMENTS.map((p) => (
          <div key={p.id} className="cosmos-panel cosmos-panel-accent p-6 flex flex-col gap-3" style={{ '--cosmos-accent': p.accent }}>
            <Eyebrow>{p.name}</Eyebrow>
            <p className="text-[0.92rem] text-star">{p.description}</p>
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-dim mt-auto">
              {p.reach}
            </span>
          </div>
        ))}
      </Reveal>

      <Panel className="p-6 mt-6">
        <Eyebrow className="mb-4">What you get</Eyebrow>
        <ul className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {[
            { icon: Target, text: 'Placement by role — reach only founders, or only builders' },
            { icon: Users, text: 'A audience that is starting companies right now' },
            { icon: TrendingUp, text: 'Impression and click reporting' },
            { icon: Check, text: 'No tracking of individual users' },
          ].map((row) => {
            const Icon = row.icon;
            return (
              <li key={row.text} className="flex items-start gap-2.5 text-[0.9rem] text-dim">
                <Icon size={15} className="text-gold shrink-0 mt-0.5" />
                {row.text}
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel className="p-6 mt-5 text-center" accent="#ffbf5e">
        <Tag tone="dev" className="mb-3">Taking enquiries</Tag>
        <h2 className="font-display text-[1.3rem] text-star mb-2">
          Inventory opens as the ecosystem grows
        </h2>
        <p className="text-[0.9rem] text-dim max-w-[52ch] mx-auto mb-5">
          Ad slots are reserved throughout the product but are not yet running. Tell us what
          you'd like to reach and we'll get in touch when placements open.
        </p>
        <CosmosButton variant="primary" size="sm" asChild>
          <Link to="/contact"><Mail size={14} /> Talk to us</Link>
        </CosmosButton>
      </Panel>
    </div>
  );
}

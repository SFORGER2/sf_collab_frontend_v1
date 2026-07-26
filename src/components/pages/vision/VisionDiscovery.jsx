import React from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck, Building2, Coins, Megaphone, Rocket, Search, Sparkles, TrendingUp, Users,
} from 'lucide-react';
import {
  AllowanceMeter, CosmosButton, Eyebrow, Tag,
} from '@/components/cosmos';
import { useEntitlements } from '@/services/entitlements/useEntitlements';
import { CREDIT_COSTS } from '@/services/entitlements/entitlements';

/**
 * Role-specific discovery on a Vision page.
 *
 * Each role is looking for something different, and showing everyone the
 * founder's recruiting panel was wrong in every direction: a builder was shown
 * other builders (their competition), a mentor was shown nothing useful, and an
 * investor got a hiring tool.
 *
 *   founder    → builders who match the roles this Vision needs
 *   builder    → similar startups, i.e. other places to contribute
 *   mentor     → founders and teams asking for mentorship
 *   investor   → other high-signal Visions worth evaluating
 *   influencer → projects approaching launch, ready to promote
 *
 * Every one of these is a search, and every search costs. The first
 * `FREE_PER_DAY` results are included; beyond that each additional page is paid
 * for in credits.
 *
 * ⚠️ Frontend shaping only — the backend must enforce the same daily cap, or
 * the limit is a suggestion. See services/entitlements/entitlements.js.
 */

export const FREE_PER_DAY = 10;

const DISCOVERY = {
  founder: {
    accent: '#4fd8ff',
    eyebrow: 'AI matchmaking',
    title: 'Builders for this Vision',
    blurb: 'People whose skills match the roles you still need filled.',
    emptyHint: 'Add required roles to your Vision so matchmaking has something to work with.',
    icon: Users,
    cta: 'Find builders',
    to: '/discover-users?matchFor=vision',
    itemKind: 'people',
  },
  builder: {
    accent: '#4fd8ff',
    eyebrow: 'Explore',
    title: 'Similar startups',
    blurb: 'Other projects in this space that need what you do.',
    emptyHint: 'Nothing similar surfaced yet — browse all startups to find your next contribution.',
    icon: Building2,
    cta: 'Find similar startups',
    to: '/discover-startups?similarTo=vision',
    itemKind: 'startups',
  },
  mentor: {
    accent: '#3ee6a0',
    eyebrow: 'Guide',
    title: 'Teams seeking mentorship',
    blurb: 'Founders and builders who have asked for guidance in your areas.',
    emptyHint: 'No open mentorship requests match your expertise right now.',
    icon: BadgeCheck,
    cta: 'Find people to mentor',
    to: '/mentors?seeking=1',
    itemKind: 'people',
  },
  investor: {
    accent: '#8b6cff',
    eyebrow: 'Deal flow',
    title: 'High-signal Visions',
    blurb: 'Visions with the strongest readiness scores and team traction.',
    emptyHint: 'No comparable Visions surfaced yet.',
    icon: TrendingUp,
    cta: 'Find high-signal Visions',
    to: '/ideation?sort=readiness',
    itemKind: 'visions',
  },
  influencer: {
    accent: '#ff4fd8',
    eyebrow: 'Momentum',
    title: 'Ready to promote',
    blurb: 'Projects approaching launch that need an audience.',
    emptyHint: 'Nothing is close enough to launch to promote yet.',
    icon: Megaphone,
    cta: 'Find launches to promote',
    to: '/discover-startups?stage=launching',
    itemKind: 'startups',
  },
  member: {
    accent: '#ffbf5e',
    eyebrow: 'Explore',
    title: 'Similar Visions',
    blurb: 'Other ideas in this space worth following.',
    emptyHint: 'Nothing similar surfaced yet.',
    icon: Rocket,
    cta: 'Explore Visions',
    to: '/ideation',
    itemKind: 'visions',
  },
};

export function VisionDiscovery({ viewerRole = 'member', isCreator = false, results = [] }) {
  // The creator of a Vision recruits for it regardless of which role they're
  // wearing; everyone else gets their own role's lens.
  const key = isCreator ? 'founder' : viewerRole;
  const config = DISCOVERY[key] || DISCOVERY.member;
  const Icon = config.icon;

  const { check, spend, credits } = useEntitlements();
  const status = check('matchSuggestionsPerDay', 'matchSuggestion');

  const free = results.slice(0, FREE_PER_DAY);
  const remaining = Math.max(0, results.length - FREE_PER_DAY);
  const cost = CREDIT_COSTS.matchSuggestion;

  return (
    <section className="cosmos-panel p-6" style={{ '--cosmos-accent': config.accent }}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <Eyebrow>{config.eyebrow}</Eyebrow>
          <h2 className="font-display text-[1.05rem] text-star mt-1.5 flex items-center gap-2">
            <Icon size={16} style={{ color: config.accent }} />
            {config.title}
          </h2>
          <p className="text-[0.88rem] text-dim mt-1">{config.blurb}</p>
        </div>
        <AllowanceMeter
          limitKey="matchSuggestionsPerDay"
          creditKey="matchSuggestion"
          label="searches left today"
        />
      </div>

      {free.length > 0 ? (
        <ul className="flex flex-col divide-y divide-white/[0.07]">
          {free.map((item, i) => (
            <ResultRow key={item.id ?? i} item={item} kind={config.itemKind} accent={config.accent} />
          ))}
        </ul>
      ) : (
        <p className="text-[0.9rem] text-dim py-5">{config.emptyHint}</p>
      )}

      {/* Beyond the free daily allowance, results are paid for. */}
      <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-4 border-t border-white/10">
        <CosmosButton variant="ghost" size="sm" asChild>
          <Link to={config.to}>
            <Search size={14} /> {config.cta}
          </Link>
        </CosmosButton>

        {remaining > 0 && (
          <CosmosButton
            variant="primary"
            size="sm"
            disabled={!status.allowed}
            onClick={() => spend('matchSuggestionsPerDay', 'matchSuggestion')}
          >
            <Coins size={14} />
            {status.reason === 'credits'
              ? `Show ${remaining} more · ${cost} credits`
              : `Show ${remaining} more`}
          </CosmosButton>
        )}

        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-dim">
          {FREE_PER_DAY} free {config.itemKind}/day · {credits} credits
        </span>

        {!status.allowed && (
          <CosmosButton variant="quiet" size="sm" asChild>
            <Link to="/credits"><Sparkles size={13} /> Get credits</Link>
          </CosmosButton>
        )}
      </div>
    </section>
  );
}

function ResultRow({ item, kind, accent }) {
  const isPerson = kind === 'people';
  const to = isPerson
    ? `/users/${item.id}`
    : kind === 'visions'
      ? `/vision/${item.id}`
      : `/startup-details/${item.id}`;

  return (
    <li className="flex items-center gap-3 py-3">
      <span
        className="w-9 h-9 rounded-full flex items-center justify-center font-mono text-[11px] shrink-0"
        style={{ background: `${accent}1f`, color: accent }}
      >
        {(item.name || item.title || '?').slice(0, 2).toUpperCase()}
      </span>

      <span className="min-w-0 flex-1">
        <Link to={to} className="block text-[0.92rem] text-star truncate hover:underline">
          {item.name || item.title}
        </Link>
        <span className="block font-mono text-[10px] tracking-[0.1em] uppercase text-dim truncate">
          {item.role || item.industry || item.stage || ''}
        </span>
      </span>

      {item.match != null && <Tag tone="dev">{item.match}% match</Tag>}

      <CosmosButton variant="quiet" size="sm" asChild>
        <Link to={to}>{isPerson ? 'View' : 'Open'}</Link>
      </CosmosButton>
    </li>
  );
}

export default VisionDiscovery;

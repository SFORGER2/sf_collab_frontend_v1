import React from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck, Bookmark, Eye, Handshake, Megaphone, MessageSquare,
  Share2, Sparkles, TrendingUp, UserPlus, Users,
} from 'lucide-react';
import { CosmosButton, Eyebrow, Gated, AllowanceMeter, Tag } from '@/components/cosmos';

/**
 * What this Vision offers *you*, decided by the role you're viewing as.
 *
 * The same Vision is a different object depending on who's looking at it: a
 * founder needs contributors, a builder needs a way in, an investor needs
 * signal, an influencer needs something to amplify. Previously every viewer saw
 * the founder's controls — builders were shown "find builders" panels
 * advertising themselves back to themselves.
 *
 * `viewerRole` is the active role, not the Vision owner's role. `isCreator`
 * separates "this is my Vision" from "I happen to be a founder".
 */

const ROLE_CONFIG = {
  founder: {
    accent: '#ffbf5e',
    eyebrow: 'Grow this Vision',
    primary: { label: 'Invite collaborators', icon: UserPlus, to: '/discover-users' },
    secondary: [
      { label: 'Manage applications', icon: Users, to: '/founder/my-applications' },
      { label: 'Share', icon: Share2, to: '#share' },
    ],
  },
  builder: {
    accent: '#4fd8ff',
    eyebrow: 'Get involved',
    primary: { label: 'Apply to contribute', icon: Handshake, to: '#apply' },
    secondary: [
      { label: 'Save for later', icon: Bookmark, to: '#save' },
      { label: 'Ask a question', icon: MessageSquare, to: '#discuss' },
    ],
  },
  mentor: {
    accent: '#3ee6a0',
    eyebrow: 'Offer guidance',
    primary: { label: 'Offer mentorship', icon: BadgeCheck, to: '#mentor' },
    secondary: [
      { label: 'Review the roadmap', icon: TrendingUp, to: '#roadmap' },
      { label: 'Leave feedback', icon: MessageSquare, to: '#discuss' },
    ],
  },
  influencer: {
    accent: '#ff4fd8',
    eyebrow: 'Create momentum',
    primary: { label: 'Promote this Vision', icon: Megaphone, to: '#promote' },
    secondary: [
      { label: 'Generate a caption', icon: Sparkles, to: '/caption-generator' },
      { label: 'Share', icon: Share2, to: '#share' },
    ],
  },
  investor: {
    accent: '#8b6cff',
    eyebrow: 'Evaluate',
    primary: { label: 'Follow for signals', icon: Eye, to: '#follow' },
    secondary: [
      { label: 'Save to watchlist', icon: Bookmark, to: '#save' },
      { label: 'Contact the founder', icon: MessageSquare, to: '#discuss' },
    ],
  },
  member: {
    accent: '#ffbf5e',
    eyebrow: 'Support this Vision',
    primary: { label: 'Follow this Vision', icon: Eye, to: '#follow' },
    secondary: [
      { label: 'Save for later', icon: Bookmark, to: '#save' },
      { label: 'Join the discussion', icon: MessageSquare, to: '#discuss' },
    ],
  },
};

export function VisionActions({ viewerRole = 'member', isCreator = false }) {
  const config = ROLE_CONFIG[viewerRole] || ROLE_CONFIG.member;
  const Primary = config.primary.icon;

  return (
    <section className="cosmos-panel p-4 sm:p-6" style={{ '--cosmos-accent': config.accent }}>
      <Eyebrow className="mb-4">{isCreator ? 'Your Vision' : config.eyebrow}</Eyebrow>

      <div className="flex flex-wrap gap-2.5">
        <CosmosButton variant="primary" size="sm" asChild>
          <Link to={config.primary.to}>
            <Primary size={14} /> {config.primary.label}
          </Link>
        </CosmosButton>

        {config.secondary.map((action) => {
          const Icon = action.icon;
          return (
            <CosmosButton key={action.label} variant="quiet" size="sm" asChild>
              <Link to={action.to}>
                <Icon size={14} /> {action.label}
              </Link>
            </CosmosButton>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Suggested people for this Vision — metered.
 *
 * Only shown to the Vision's creator and to founders: it's a recruiting tool,
 * and showing builders a list of other builders was the exact "builders
 * advertisement" problem. Suggestions are limited per day and unlockable with
 * credits.
 */
export function SuggestedContributors({ viewerRole, isCreator, suggestions = [] }) {
  // Only *this* Vision's founder recruits for it. Being a founder elsewhere
  // doesn't qualify, and a builder must never be shown a list of other builders
  // — that was the "builders advertised to builders" problem.
  if (!isCreator) return null;

  const FREE_VISIBLE = 10;
  const free = suggestions.slice(0, FREE_VISIBLE);
  const locked = suggestions.slice(FREE_VISIBLE);

  return (
    <section className="cosmos-panel p-4 sm:p-6" style={{ '--cosmos-accent': '#4fd8ff' }}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <Eyebrow>AI matchmaking</Eyebrow>
          <h2 className="font-display text-[1.05rem] text-star mt-1.5">Potential contributors</h2>
        </div>
        <AllowanceMeter limitKey="matchSuggestionsPerDay" creditKey="matchSuggestion" />
      </div>

      {free.length > 0 ? (
        <ul className="flex flex-col divide-y divide-white/[0.07]">
          {free.map((person) => (
            <PersonRow key={person.id} person={person} />
          ))}
        </ul>
      ) : (
        <p className="text-[0.9rem] text-dim py-6 text-center">
          No suggestions yet — add required roles to your Vision so matchmaking has something
          to work with.
        </p>
      )}

      {/* Beyond the first ten, matchmaking is metered. */}
      {locked.length > 0 && (
        <Gated
          className="mt-3"
          limitKey="matchSuggestionsPerDay"
          creditKey="matchSuggestion"
          title={`${locked.length} more matches`}
          description="You've seen today's free suggestions. Unlock the rest with credits, or upgrade for a larger daily allowance."
        >
          <ul className="flex flex-col divide-y divide-white/[0.07]">
            {locked.slice(0, 5).map((person) => (
              <PersonRow key={person.id} person={person} />
            ))}
          </ul>
        </Gated>
      )}
    </section>
  );
}

function PersonRow({ person }) {
  return (
    <li className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 py-3">
      <span className="w-9 h-9 rounded-full bg-cyan/12 text-cyan flex items-center justify-center font-mono text-[11px] shrink-0">
        {(person.name || '?').slice(0, 2).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.92rem] text-star truncate">{person.name}</span>
        <span className="block font-mono text-[10px] tracking-[0.1em] uppercase text-dim truncate">
          {person.role}
        </span>
      </span>
      {person.match != null && <Tag tone="dev">{person.match}% match</Tag>}
      <CosmosButton variant="quiet" size="sm">Invite</CosmosButton>
    </li>
  );
}

/**
 * What a non-owner sees where the founder sees recruiting.
 *
 * A builder looking at a Vision wants other projects like it, not a directory
 * of people they're competing with. Investors and influencers get the same
 * "more like this" framing.
 */
export function SimilarVisions({ isCreator, similar = [] }) {
  if (isCreator) return null;

  return (
    <section className="cosmos-panel p-4 sm:p-6" style={{ '--cosmos-accent': '#4fd8ff' }}>
      <Eyebrow className="mb-1.5">Explore</Eyebrow>
      <h2 className="font-display text-[1.05rem] text-star mb-4">Similar Visions</h2>

      {similar.length > 0 ? (
        <ul className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))]">
          {similar.map((v) => (
            <li key={v.id || v._id}>
              <Link to={`/ideation-details?id=${v.id || v._id}`} className="cosmos-card cosmos-card-interactive p-4 block h-full">
                <span className="block text-[0.95rem] text-star leading-snug line-clamp-2">
                  {v.title}
                </span>
                <span className="block font-mono text-[10px] tracking-[0.1em] uppercase text-dim mt-1.5">
                  {[v.industry, v.stage].filter(Boolean).join(' · ')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[0.9rem] text-dim">
          Nothing similar surfaced yet.{' '}
          <Link to="/discover-startups" className="text-cyan hover:text-star transition-colors">
            Browse all startups
          </Link>
          .
        </p>
      )}
    </section>
  );
}

export default VisionActions;

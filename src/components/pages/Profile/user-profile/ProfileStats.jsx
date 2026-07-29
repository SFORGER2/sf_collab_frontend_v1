import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Flame, Target, Rocket, Heart, Star, TrendingUp,
  BookOpen, Lightbulb, Users, ArrowUpRight,
} from 'lucide-react';
import { Eyebrow } from '@/components/cosmos';

/**
 * The stat band under the profile header.
 *
 * Redesigned around two ideas the old flat grid missed:
 *
 * 1. Not all stats matter equally. Streak, tasks completed and active startups
 *    are what people actually check, so they get large tiles with a ring gauge
 *    showing progress toward the next milestone — a number with nothing to
 *    measure it against tells you nothing.
 * 2. A stat should lead somewhere. Every tile that has a destination is a
 *    button, so "12 ideas" is one click from the ideas themselves.
 *
 * The rings fill on mount rather than snapping, which reads as momentum.
 */

/** Next round milestone above `value` — what the ring is filling toward. */
function nextMilestone(value, ladder) {
  for (const m of ladder) if (value < m) return m;
  // Past the top rung: keep doubling so the ring never sits permanently full.
  const top = ladder[ladder.length - 1];
  let next = top;
  while (value >= next) next *= 2;
  return next;
}

const ProfileStats = ({ profile }) => {
  const navigate = useNavigate();

  const { hero, rest } = useMemo(() => {
    const streak = profile?.streak_days || 0;
    const tasks = profile?.assignedTasks?.completed || 0;
    const startups =
      (profile?.startupMemberships?.length || 0) + (profile?.foundedStartups?.length || 0);

    return {
      hero: [
        {
          key: 'streak',
          icon: Flame,
          label: 'Current streak',
          value: streak,
          unit: streak === 1 ? 'day' : 'days',
          accent: '#ffbf5e',
          ladder: [7, 30, 100, 365],
          caption: (m) => `${m - streak} more to a ${m}-day streak`,
          to: '/builder/rewards',
        },
        {
          key: 'tasks',
          icon: Target,
          label: 'Tasks completed',
          value: tasks,
          unit: 'done',
          accent: '#3ee6a0',
          ladder: [10, 50, 250, 1000],
          caption: (m) => `${m - tasks} from your next badge`,
          to: '/erp/tasks',
        },
        {
          key: 'startups',
          icon: Rocket,
          label: 'Active startups',
          value: startups,
          unit: startups === 1 ? 'venture' : 'ventures',
          accent: '#8b6cff',
          ladder: [1, 3, 5, 10],
          caption: () =>
            startups === 0 ? 'Join or found your first' : 'Building in the open',
          to: '/my-startups',
        },
      ],
      rest: [
        {
          key: 'impact', icon: Heart, label: 'Community impact',
          value: profile?.statistics?.total_likes_received || 0,
          unit: 'likes', accent: '#ff6fd8',
        },
        {
          key: 'achievements', icon: Star, label: 'Achievements',
          value: profile?.achievements?.length || 0,
          unit: 'unlocked', accent: '#ffbf5e',
        },
        {
          key: 'engagement', icon: TrendingUp, label: 'Engagement',
          value: profile?.statistics?.engagement_score || 0,
          unit: '%', accent: '#4fd8ff',
        },
        {
          key: 'knowledge', icon: BookOpen, label: 'Knowledge posts',
          value: profile?.knowledgePosts?.length || 0,
          unit: 'published', accent: '#8b6cff', to: '/knowledge',
        },
        {
          key: 'ideas', icon: Lightbulb, label: 'Ideas shared',
          value: profile?.ideas?.length || 0,
          unit: 'ideas', accent: '#3ee6a0', to: '/ideation',
        },
        {
          key: 'friends', icon: Users, label: 'Connections',
          value: profile?.friendsCount || 0,
          unit: 'people', accent: '#4fd8ff', to: '/connections',
        },
      ],
    };
  }, [profile]);

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {hero.map((stat, i) => (
          <HeroTile key={stat.key} stat={stat} index={i} navigate={navigate} />
        ))}
      </div>

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(148px,1fr))]">
        {rest.map((stat, i) => (
          <MiniTile key={stat.key} stat={stat} index={i} navigate={navigate} />
        ))}
      </div>
    </div>
  );
};

function HeroTile({ stat, index, navigate }) {
  const { icon: Icon, label, value, unit, accent, ladder, caption, to } = stat;
  const milestone = nextMilestone(value, ladder);
  const pct = Math.min(100, Math.round((value / milestone) * 100));

  const Wrapper = to ? motion.button : motion.div;

  return (
    <Wrapper
      type={to ? 'button' : undefined}
      onClick={to ? () => navigate(to) : undefined}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      style={{ '--cosmos-accent': accent }}
      className={`cosmos-card group relative overflow-hidden p-5 text-left flex items-center gap-4
        ${to ? 'cursor-pointer' : ''}`}
    >
      {/* Accent bloom, revealed on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 w-36 h-36 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
        style={{ background: accent }}
      />

      <RingGauge pct={pct} accent={accent}>
        <Icon size={18} style={{ color: accent }} />
      </RingGauge>

      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <Eyebrow>{label}</Eyebrow>
          {to && (
            <ArrowUpRight
              size={11}
              className="text-dim opacity-0 group-hover:opacity-100 transition-opacity"
            />
          )}
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span
            className="font-display text-[1.85rem] leading-none tabular-nums"
            style={{ color: accent }}
          >
            {value.toLocaleString()}
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-dim">
            {unit}
          </span>
        </div>

        <p className="text-[0.78rem] text-dim mt-1.5 truncate">{caption(milestone)}</p>
      </div>
    </Wrapper>
  );
}

/** Circular progress ring with the stat's icon at its centre. */
function RingGauge({ pct, accent, children }) {
  const R = 26;
  const C = 2 * Math.PI * R;

  return (
    <div className="relative shrink-0 w-[62px] h-[62px] grid place-items-center">
      <svg viewBox="0 0 62 62" className="absolute inset-0 -rotate-90">
        <circle cx="31" cy="31" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <motion.circle
          cx="31" cy="31" r={R}
          fill="none"
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C - (C * pct) / 100 }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 }}
          style={{ filter: `drop-shadow(0 0 6px ${accent}88)` }}
        />
      </svg>
      <span
        className="grid place-items-center w-10 h-10 rounded-full"
        style={{ background: `${accent}18` }}
      >
        {children}
      </span>
    </div>
  );
}

function MiniTile({ stat, index, navigate }) {
  const { icon: Icon, label, value, unit, accent, to } = stat;
  const Wrapper = to ? motion.button : motion.div;

  return (
    <Wrapper
      type={to ? 'button' : undefined}
      onClick={to ? () => navigate(to) : undefined}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.04, duration: 0.35 }}
      style={{ '--cosmos-accent': accent }}
      className={`cosmos-card group relative p-3.5 text-left flex items-center gap-3
        ${to ? 'cursor-pointer' : ''}`}
    >
      <span
        className="grid place-items-center w-8 h-8 rounded-lg shrink-0 transition-transform group-hover:scale-110"
        style={{ background: `${accent}18` }}
      >
        <Icon size={14} style={{ color: accent }} />
      </span>

      <div className="min-w-0">
        <div className="font-display text-[1.05rem] leading-none tabular-nums text-star">
          {Number(value).toLocaleString()}
          <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-dim ml-1">
            {unit}
          </span>
        </div>
        {/* Labels wrap rather than truncate — "Knowledge pos…" helps nobody. */}
        <div className="cosmos-stat-label mt-1 leading-tight">{label}</div>
      </div>
    </Wrapper>
  );
}

export default ProfileStats;

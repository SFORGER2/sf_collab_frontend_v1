import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Rocket } from 'lucide-react';
import { CosmosButton, Display, Eyebrow, MomentumFlame, Tag } from '@/components/cosmos';

const STATE_TONE = {
  draft: 'future',
  public: 'dev',
  team_forming: 'accent',
  ready_for_activation: 'live',
  archived: 'future',
};

const STATE_LABEL = {
  draft: 'Draft',
  public: 'Public',
  team_forming: 'Team forming',
  ready_for_activation: 'Ready for activation',
  archived: 'Archived',
};

/**
 * The Vision hero.
 *
 * A Vision is one star that accretes into a startup, so progress is drawn as an
 * orbital ring rather than a bar: the arc closes as points accumulate, and the
 * core brightens when activation is in reach. That's the whole metaphor — no
 * animated starfield, nothing competing with the actual work below it.
 */
export function VisionHero({
  idea,
  readiness,
  score,
  threshold,
  progressPct,
  eligible,
  isCreator,
  refreshing,
  onBack,
  onRefresh,
  onConvert,
}) {
  const R = 54;
  const circumference = 2 * Math.PI * R;
  const dash = (progressPct / 100) * circumference;
  const arcColor = eligible ? '#3ee6a0' : progressPct >= 40 ? '#4fd8ff' : '#ffbf5e';

  return (
    <section
      className="cosmos-panel cosmos-panel-accent relative overflow-hidden p-4 sm:p-8"
      style={{ '--cosmos-accent': arcColor }}
    >
      {/* A single soft nebula behind the ring, keyed to progress. */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          right: '-6%',
          top: '-40%',
          width: '460px',
          height: '460px',
          background: `radial-gradient(circle, ${arcColor}22 0%, transparent 62%)`,
        }}
      />

      <div className="relative flex flex-wrap items-start gap-6">
        <div className="flex-1 min-w-0 sm:min-w-[260px]">
          <div className="flex items-center gap-2.5 mb-4">
            <button
              onClick={onBack}
              aria-label="Back"
              className="p-1.5 rounded-lg text-dim hover:text-star hover:bg-white/[0.06] transition-colors min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Eyebrow>Vision</Eyebrow>
            <Tag tone={STATE_TONE[readiness.visionState] || 'dev'} dot={eligible}>
              {STATE_LABEL[readiness.visionState] || 'Public'}
            </Tag>
            {/* Momentum sits next to state because they answer different
                questions: state is how far along, momentum is whether anyone
                is actually pushing. A Vision can be "team forming" and dead. */}
            <MomentumFlame item={idea} size={16} showLabel />
          </div>

          <Display size="xl" className="mb-3">{idea.title}</Display>

          {idea.description && (
            <p className="text-[1.02rem] text-star/85 max-w-[62ch] mb-4">
              {idea.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2.5">
            {idea.industry && <Tag>{idea.industry}</Tag>}
            {idea.stage && <Tag>{idea.stage}</Tag>}
            {idea.creator?.name && (
              (idea.creator.id || idea.creator._id) ? (
                <Link
                  to={`/user-profile?userId=${idea.creator.id || idea.creator._id}`}
                  className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-dim hover:text-star transition-colors"
                >
                  by {idea.creator.name}
                </Link>
              ) : (
                <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-dim">
                  by {idea.creator.name}
                </span>
              )
            )}
          </div>

          {isCreator && eligible && readiness.visionState !== 'archived' && (
            <CosmosButton variant="primary" className="mt-6" onClick={onConvert}>
              <Rocket size={15} /> Convert to Startup
            </CosmosButton>
          )}
        </div>

        {/* Orbital progress */}
        <div className="relative shrink-0 mx-auto sm:mx-0">
          <svg width="140" height="140" viewBox="0 0 140 140" role="img"
               aria-label={`${Math.round(score)} of ${threshold} vision points`}>
            <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="70" cy="70" r={R} fill="none"
              stroke={arcColor} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.22,1,0.36,1)' }}
            />
            <circle cx="70" cy="70" r="20" fill={arcColor} opacity={eligible ? 0.28 : 0.13} />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[1.7rem] leading-none" style={{ color: arcColor }}>
              {Math.round(score)}
            </span>
            <span className="font-mono text-[9.5px] tracking-[0.16em] uppercase text-dim mt-1">
              of {threshold} pts
            </span>
          </div>

          <button
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh vision points"
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 p-1.5 rounded-lg text-dim hover:text-star hover:bg-white/[0.06] transition-colors disabled:opacity-40 min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default VisionHero;

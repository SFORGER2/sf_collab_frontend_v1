import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Building2,
  CircleCheckBig,
  Coins,
  Rocket,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatAPI } from '@/utils/APIs/chatApi';
import { ConnectionButton } from '../connection/ConnectionButton';

const KIND_CONFIG = {
  builder: {
    label: 'Builder',
    accent: 'from-sky-500/20 via-cyan-500/10 to-transparent',
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    icon: Rocket,
    reasonLabel: 'Why this builder fits',
    metaLabel: 'Contribution fit',
    metaHint: 'Skills, shipping velocity, and execution style',
  },
  startup: {
    label: 'Startup',
    accent: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    icon: Building2,
    reasonLabel: 'Why this startup fits',
    metaLabel: 'Company fit',
    metaHint: 'Stage, team needs, and operating context',
  },
  mentor: {
    label: 'Mentor',
    accent: 'from-violet-500/20 via-fuchsia-500/10 to-transparent',
    badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    icon: Sparkles,
    reasonLabel: 'Why this mentor fits',
    metaLabel: 'Mentoring fit',
    metaHint: 'Domain expertise, guidance style, and outcomes',
  },
  investor: {
    label: 'Investor',
    accent: 'from-amber-500/20 via-orange-500/10 to-transparent',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    icon: Coins,
    reasonLabel: 'Why this investor fits',
    metaLabel: 'Investment fit',
    metaHint: 'Thesis, check size, and portfolio alignment',
  },
  user: {
    label: 'User',
    accent: 'from-slate-500/20 via-zinc-500/10 to-transparent',
    badge: 'bg-slate-500/15 text-slate-200 border-slate-500/30',
    icon: UserRound,
    reasonLabel: 'Why this profile fits',
    metaLabel: 'Profile fit',
    metaHint: 'General profile alignment and intent',
  },
};

const clampScore = (score) => {
  if (typeof score !== 'number' || Number.isNaN(score)) return null;
  return Math.max(0, Math.min(100, score));
};

const getMatchLabel = (score) => {
  if (score == null) return null;
  if (score >= 90) return { label: 'Excellent Match', color: 'text-emerald-400' };
  if (score >= 75) return { label: 'Strong Match', color: 'text-blue-400' };
  if (score >= 50) return { label: 'Good Match', color: 'text-yellow-400' };
  return { label: 'Potential Match', color: 'text-slate-400' };
};

const getInitials = (name = '') => {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

function MatchCard({ match, className, compact = false }) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const navigate = useNavigate();

  const config = KIND_CONFIG[match.kind] || KIND_CONFIG.user;
  const Icon = config.icon;
  const score = clampScore(match.matchScore);
  const matchLabel = getMatchLabel(score);
  const initials = useMemo(() => getInitials(match.name), [match.name]);
  const reasons = Array.isArray(match.reasons) ? match.reasons.filter(Boolean) : [];

  // Parses metadata into clean, distinct pill tags (e.g. React, Node.js, Seed Stage)
  const cleanTags = useMemo(() => {
    if (!match.meta || typeof match.meta !== 'object') return [];

    const tags = [];
    Object.entries(match.meta).forEach(([_, val]) => {
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach((v) => tags.push(String(v)));
      } else if (typeof val === 'string') {
        val.split(/[,|]/).forEach((v) => {
          const trimmed = v.trim();
          if (trimmed) tags.push(trimmed);
        });
      } else {
        tags.push(String(val));
      }
    });

    return tags.slice(0, 4); // Limit to 4 max to maintain clean card height
  }, [match.meta]);

  const handleMessage = async () => {
    try {
      const data = await chatAPI.createDirectConversation(match.id);
      const conversationId = data?.conversation?.id;

      if (!conversationId) {
        throw new Error('Conversation id missing from response');
      }

      navigate(`/chat?conversationId=${conversationId}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to open chat');
    }
  };

  const buttonClasses =
    'w-full bg-white text-slate-955 hover:bg-white/90 active:scale-[0.97] transition-transform duration-[160ms] ease-out font-medium rounded-xl';
  const actionWrapperClasses = 'w-full sm:flex-1 sm:min-w-[100px] xl:flex-none xl:w-auto';

  const renderActions = () => {
    if (match.kind === 'startup') {
      return (
        <>
          <div className={actionWrapperClasses}>
            <Button asChild size="sm" className={buttonClasses}>
              <Link to={`/startup-details/${match.id}`}>View Startup</Link>
            </Button>
          </div>
          <div className={actionWrapperClasses}>
            <Button asChild size="sm" className={buttonClasses}>
              <Link to={`/startup-details/${match.id}`}>Invite</Link>
            </Button>
          </div>
          <div className={actionWrapperClasses}>
            <Button size="sm" className={buttonClasses} onClick={handleMessage}>
              Message
            </Button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className={actionWrapperClasses}>
          <Button asChild size="sm" className={buttonClasses}>
            <Link to={`/user-profile?userId=${match.id}`}>View Profile</Link>
          </Button>
        </div>
        <div className={actionWrapperClasses}>
          <ConnectionButton userId={match.id} size="sm" className="w-full" />
        </div>
        <div className={actionWrapperClasses}>
          <Button size="sm" className={buttonClasses} onClick={handleMessage}>
            Message
          </Button>
        </div>
      </>
    );
  };

  return (
    <Card
      className={cn(
        'group relative flex flex-col h-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-sm backdrop-blur-xl',
        'transition-[transform,box-shadow,border-color] duration-200',
        '[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5',
        '[@media(hover:hover)_and_(pointer:fine)]:hover:border-white/20',
        'hover:shadow-xl hover:shadow-black/20',
        className
      )}
    >
      <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br', config.accent)} />

      {/* Card Header */}
      <CardHeader className={cn('relative border-b border-white/5 px-4 py-4 sm:px-6', compact && 'gap-1')}>
        <div className="flex items-start justify-between gap-2.5 sm:gap-3 min-w-0 w-full">
          <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0 overflow-hidden">
            <Avatar className="size-11 shrink-0 rounded-xl ring-1 ring-white/10 sm:size-13">
              {match.avatarUrl && !avatarFailed ? (
                <AvatarImage
                  src={match.avatarUrl}
                  alt={match.name}
                  className="object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : null}
              <AvatarFallback className="rounded-xl bg-slate-700 text-xs font-semibold text-white ring-1 ring-white/10">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <h3 className="truncate text-sm font-semibold text-white sm:text-base">
                  {match.name}
                </h3>
                <Badge
                  variant="outline"
                  className={cn('shrink-0 border text-[9px] uppercase tracking-wider px-1.5 py-0', config.badge)}
                >
                  {config.label}
                </Badge>
              </div>

              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-300 min-w-0">
                <Icon className="size-3 shrink-0 text-slate-400" />
                <span className="truncate">{match.role || config.metaLabel}</span>
              </div>

              {cleanTags.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1 min-w-0 max-w-full overflow-hidden">
                  {cleanTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex max-w-[110px] items-center rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-300 truncate"
                      title={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top-Right Match Score Badge */}
          <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-right flex flex-col items-end justify-center min-w-[76px] sm:min-w-[86px] ml-auto">
            <div className="text-[9px] font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap">Match score</div>
            <div className="text-sm sm:text-base font-bold text-white leading-tight mt-0.5">{score != null ? `${score}%` : '-'}</div>
            {matchLabel && (
              <div className={`text-[9px] font-semibold mt-0.5 whitespace-nowrap ${matchLabel.color}`}>
                {matchLabel.label}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Card Content - flex-1 flex flex-col justify-between to pin footers */}
      <CardContent className="relative flex flex-1 flex-col justify-between space-y-4 px-4 py-4 sm:px-6">
        <div className="space-y-4">
          {/* AI Explanation Callout */}
          <div className="flex items-start gap-2.5 rounded-xl border border-blue-500/15 bg-blue-500/5 p-3">
            <CircleCheckBig className="mt-0.5 size-4 shrink-0 text-cyan-400" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">AI explanation</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-200">
                {match.aiExplanation || 'No AI explanation provided.'}
              </p>
            </div>
          </div>

          {/* Fit Reasons List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{config.reasonLabel}</p>
            </div>

            {reasons.length > 0 ? (
              <ul className="space-y-1.5">
                {reasons.map((reason, index) => (
                  <li key={`${reason}-${index}`} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cyan-400" />
                    <span className="leading-snug">{reason}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">No reasons provided.</p>
            )}
          </div>

          {/* Breakdown (Optional) */}
          {match.breakdown && Object.keys(match.breakdown).length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs uppercase tracking-wider text-slate-400">Match breakdown</p>
              {Object.entries(match.breakdown).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-20 text-xs text-slate-400 capitalize">{key.replace('_', ' ')}</span>
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full">
                    <div className="h-1.5 bg-cyan-400 rounded-full" style={{ width: `${value}%` }} />
                  </div>
                  <span className="text-xs text-slate-300">{value}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Action Buttons - Pinned to bottom of card */}
        <div className="mt-auto border-t border-white/5 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {renderActions()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

MatchCard.propTypes = {
  className: PropTypes.string,
  compact: PropTypes.bool,
  match: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    kind: PropTypes.oneOf(['builder', 'startup', 'mentor', 'investor', 'user']).isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string,
    matchScore: PropTypes.number,
    aiExplanation: PropTypes.string,
    avatarUrl: PropTypes.string,
    ctaLabel: PropTypes.string,
    ctaHref: PropTypes.string,
    ctaOnClick: PropTypes.func,
    secondaryCtaLabel: PropTypes.string,
    secondaryCtaOnClick: PropTypes.func,
    reasons: PropTypes.arrayOf(PropTypes.string),
    meta: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default MatchCard;
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

const getInitials = (name = '') => {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const formatMetaValue = (value) => {
  if (value == null || value === '') return null;
  if (Array.isArray(value)) return value.join(' | ');
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([key, val]) => `${key}: ${val}`)
      .join(' | ');
  }
  return String(value);
};

function MatchCard({ match, className, compact = false }) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const navigate = useNavigate();

  const config = KIND_CONFIG[match.kind] || KIND_CONFIG.user;
  const Icon = config.icon;
  const score = clampScore(match.matchScore);
  const initials = useMemo(() => getInitials(match.name), [match.name]);
  const reasons = Array.isArray(match.reasons) ? match.reasons.filter(Boolean) : [];

  const metaLine = useMemo(() => {
    if (!match.meta) return null;

    const priorityKeys = ['skills', 'expertise', 'stage', 'company', 'thesis', 'checkSize', 'portfolio', 'focus'];
    for (const key of priorityKeys) {
      if (key in match.meta) {
        const formatted = formatMetaValue(match.meta[key]);
        if (formatted) return formatted;
      }
    }

    const fallback = formatMetaValue(match.meta);
    return fallback || null;
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

  const handlePrimaryAction = (e) => {
    e?.preventDefault?.();
    if (match.ctaOnClick) {
      match.ctaOnClick(match);
    }
  };

  const renderCta = () => { // eslint-disable-line no-unused-vars
    const hasPrimary = Boolean(match.ctaLabel && (match.ctaHref || match.ctaOnClick));
    const hasSecondary = Boolean(match.secondaryCtaLabel && match.secondaryCtaOnClick);

    if (!hasPrimary && !hasSecondary) return null;

    const primaryClasses = 'w-full sm:w-auto bg-white text-slate-955 hover:bg-white/90 font-medium rounded-xl';
    const secondaryClasses = 'w-full sm:w-auto border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white font-medium rounded-xl';

    return (
      <div className="flex w-full sm:w-auto items-center gap-2">
        {hasSecondary && (
          <Button
            size="sm"
            variant="outline"
            className={secondaryClasses}
            onClick={(e) => {
              e.preventDefault();
              match.secondaryCtaOnClick(match);
            }}
          >
            {match.secondaryCtaLabel}
          </Button>
        )}
        {hasPrimary && (
          match.ctaHref && !match.ctaOnClick ? (
            <Button asChild size="sm" className={primaryClasses}>
              <a href={match.ctaHref}>{match.ctaLabel}</a>
            </Button>
          ) : (
            <Button
              size="sm"
              className={primaryClasses}
              onClick={match.ctaOnClick ? handlePrimaryAction : undefined}
            >
              {match.ctaLabel}
            </Button>
          )
        )}
      </div>
    );
  };

  const buttonClasses = 'w-full sm:w-auto bg-white text-slate-955 hover:bg-white/90';

  const renderActions = () => {
    if (match.kind === 'startup') {
      return (
        <>
          <Button asChild size="sm" className={buttonClasses}>
            <Link to={`/startup-details/${match.id}`}>View Startup</Link>
          </Button>
          <Button asChild size="sm" className={buttonClasses}>
            <Link to={`/startup-details/${match.id}`}>Startup Invitation</Link>
          </Button>
          <Button size="sm" className={buttonClasses} onClick={handleMessage}>
            Message
          </Button>
        </>
      );
    }

    return (
      <>
        <Button asChild size="sm" className={buttonClasses}>
          <Link to={`/user-profile?userId=${match.id}`}>View Profile</Link>
        </Button>
        <ConnectionButton userId={match.id} size="sm" />
        <Button size="sm" className={buttonClasses} onClick={handleMessage}>
          Message
        </Button>
      </>
    );
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-sm backdrop-blur-xl',
        'transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-xl hover:shadow-black/20',
        className
      )}
    >
      <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br', config.accent)} />

      <CardHeader className={cn('relative border-b border-white/5 px-4 py-4 sm:px-6', compact && 'gap-1')}>
        <div className="flex items-start gap-3 sm:gap-4">
          <Avatar className="size-14 shrink-0 rounded-xl ring-1 ring-white/10 sm:size-16">
            {match.avatarUrl && !avatarFailed ? (
              <AvatarImage
                src={match.avatarUrl}
                alt={match.name}
                className="object-cover"
                onError={() => setAvatarFailed(true)}
              />
            ) : null}
            <AvatarFallback className="rounded-xl bg-slate-700 text-sm font-semibold text-white ring-1 ring-white/10">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="min-w-0 break-words text-base font-semibold text-white sm:text-lg">
                {match.name}
              </h3>
              <Badge
                variant="outline"
                className={cn('shrink-0 border text-[11px] uppercase tracking-wide', config.badge)}
              >
                {config.label}
              </Badge>
            </div>

            <div className="mt-1 flex items-center gap-2 text-sm text-slate-300">
              <Icon className="size-4 shrink-0 text-slate-400" />
              <span className="truncate">{match.role || config.metaLabel}</span>
            </div>

            {metaLine && (
              <p className="mt-1 text-xs text-slate-400">
                {config.metaLabel}: <span className="text-slate-300">{metaLine}</span>
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <div className="min-w-[80px] rounded-full border border-white/10 bg-white/5 px-3 py-1 text-right">
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Match score</div>
              <div className="text-lg font-semibold text-white">{score != null ? `${score}%` : '-'}</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4 px-4 py-4 sm:px-6">
        <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <CircleCheckBig className="mt-0.5 size-4 shrink-0 text-cyan-300" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">AI explanation</p>
            <p className="mt-1 text-sm leading-6 text-slate-200">
              {match.aiExplanation || 'No AI explanation provided.'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{config.reasonLabel}</p>
            <p className="text-[11px] text-slate-500">{config.metaHint}</p>
          </div>

          {reasons.length > 0 ? (
            <ul className="space-y-2">
              {reasons.map((reason, index) => (
                <li key={`${reason}-${index}`} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-400" />
                  <span className="leading-6">{reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No reasons provided.</p>
          )}
        </div>

        {/* Breakdown (optional) */}
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

        <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
          <div className="text-xs text-slate-500">
            {compact ? 'Compact view enabled' : 'Full match card view'}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
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
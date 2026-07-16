/**
 * ErrorState.jsx
 * A fully reusable error UI component.
 *
 * Props:
 *   title    {string}   - Bold heading  (default: "Something Went Wrong")
 *   message  {string}   - Body copy     (default: generic fallback)
 *   onRetry  {function} - Called when the Retry button is clicked (optional)
 *   type     {'network'|'auth'|'forbidden'|'server'|'unknown'} - Controls icon (optional)
 *   className {string}  - Extra Tailwind classes for the wrapper (optional)
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  WifiOff,
  ShieldOff,
  Lock,
  ServerCrash,
  CircleAlert,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ── Icon map keyed by error type ────────────────────────────────────────────

const TYPE_CONFIG = {
  network: {
    Icon: WifiOff,
    iconColor: 'text-amber-400',
    ringColor: 'ring-amber-500/20',
    bgColor: 'bg-amber-500/10',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    badgeLabel: 'Network Error',
  },
  auth: {
    Icon: Lock,
    iconColor: 'text-sky-400',
    ringColor: 'ring-sky-500/20',
    bgColor: 'bg-sky-500/10',
    badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    badgeLabel: 'Unauthorized',
  },
  forbidden: {
    Icon: ShieldOff,
    iconColor: 'text-rose-400',
    ringColor: 'ring-rose-500/20',
    bgColor: 'bg-rose-500/10',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    badgeLabel: 'Forbidden',
  },
  server: {
    Icon: ServerCrash,
    iconColor: 'text-orange-400',
    ringColor: 'ring-orange-500/20',
    bgColor: 'bg-orange-500/10',
    badgeColor: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    badgeLabel: 'Server Error',
  },
  unknown: {
    Icon: CircleAlert,
    iconColor: 'text-slate-400',
    ringColor: 'ring-slate-500/20',
    bgColor: 'bg-slate-500/10',
    badgeColor: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    badgeLabel: 'Error',
  },
};

function ErrorState({
  title = 'Something Went Wrong',
  message = "We couldn't load your content right now. Give it another shot.",
  onRetry,
  type = 'unknown',
  className,
}) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.unknown;
  const { Icon, iconColor, ringColor, bgColor, badgeColor, badgeLabel } = config;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex min-h-[260px] w-full flex-col items-center justify-center gap-6 rounded-2xl',
        'border border-white/10 bg-slate-950/80 px-6 py-10 text-center backdrop-blur-xl',
        className
      )}
    >
      {/* Icon bubble */}
      <div
        className={cn(
          'flex size-16 items-center justify-center rounded-2xl ring-1',
          bgColor,
          ringColor
        )}
      >
        <Icon className={cn('size-8', iconColor)} strokeWidth={1.5} />
      </div>

      {/* Badge */}
      <span
        className={cn(
          '-mt-2 rounded-full border px-3 py-0.5 text-[11px] font-medium uppercase tracking-widest',
          badgeColor
        )}
      >
        {badgeLabel}
      </span>

      {/* Copy */}
      <div className="max-w-sm space-y-2">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-sm leading-6 text-slate-400">{message}</p>
      </div>

      {/* Retry button — only rendered when a handler is supplied */}
      {typeof onRetry === 'function' && (
        <Button
          id="error-state-retry-btn"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="size-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

ErrorState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func,
  type: PropTypes.oneOf(['network', 'auth', 'forbidden', 'server', 'unknown']),
  className: PropTypes.string,
};

export default ErrorState;

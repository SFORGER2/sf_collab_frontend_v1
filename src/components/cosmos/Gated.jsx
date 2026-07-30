import React from 'react';
import { Link } from 'react-router-dom';
import { Coins, Lock, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CosmosButton } from './CosmosButton';
import { Eyebrow } from './primitives';
import { useEntitlements } from '@/services/entitlements/useEntitlements';

/**
 * Wraps content that is metered by plan or credits.
 *
 * When the allowance is spent, the children stay visible but blurred and
 * non-interactive, with an unlock panel over them. Showing the shape of what's
 * behind the gate converts far better than hiding it — and it's honest, because
 * the user can see exactly what they'd get.
 *
 *   <Gated limitKey="matchSuggestionsPerDay" creditKey="matchSuggestion"
 *          title="More matches" description="…">
 *     <MatchList />
 *   </Gated>
 *
 * ⚠️  This is presentation only. The backend must enforce the same limit — see
 * the warning at the top of services/entitlements/entitlements.js.
 */
export function Gated({
  limitKey,
  creditKey,
  title = 'Daily limit reached',
  description,
  children,
  className,
  onUnlock,
}) {
  const { check, spend, plan, credits } = useEntitlements();
  const status = check(limitKey, creditKey);

  if (status.allowed && status.reason === 'ok') {
    return <div className={className}>{children}</div>;
  }

  const handleUnlock = () => {
    if (spend(limitKey, creditKey)) onUnlock?.();
  };

  return (
    <div className={cn('relative', className)}>
      <div className="pointer-events-none select-none blur-[6px] opacity-40" aria-hidden="true">
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="cosmos-panel max-w-sm w-full p-5 text-center" style={{ '--cosmos-accent': '#ffbf5e' }}>
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gold/12 text-gold mb-3">
            <Lock size={16} />
          </span>

          <Eyebrow className="mb-1.5">{plan.name} plan</Eyebrow>
          <h3 className="font-display text-[1.05rem] text-star mb-2">{title}</h3>

          {description && <p className="text-[0.88rem] text-dim mb-4">{description}</p>}

          <p className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-dim mb-4">
            {status.used}/{status.limit === Infinity ? '∞' : status.limit} used today
          </p>

          <div className="flex flex-col gap-2">
            {creditKey && (
              <CosmosButton
                variant="primary"
                size="sm"
                onClick={handleUnlock}
                disabled={!status.canUseCredits}
              >
                <Coins size={14} />
                {status.canUseCredits
                  ? `Unlock for ${status.creditCost} credits`
                  : `Need ${status.creditCost} credits`}
              </CosmosButton>
            )}

            <CosmosButton variant="ghost" size="sm" asChild>
              <Link to={status.canUseCredits ? '/plans' : '/credits'}>
                <Sparkles size={14} />
                {status.canUseCredits ? 'Upgrade for more' : 'Get credits'}
              </Link>
            </CosmosButton>
          </div>

          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-dim mt-3">
            Balance: {credits} credits
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline remaining-allowance counter. Put it beside the action it describes so
 * people can see a limit approaching rather than hitting it by surprise.
 */
export function AllowanceMeter({ limitKey, creditKey, label, className }) {
  const { check } = useEntitlements();
  const { remaining, limit } = check(limitKey, creditKey);

  if (limit === Infinity) return null;

  const low = remaining <= Math.max(1, Math.floor(limit * 0.25));

  return (
    <span
      className={cn(
        'font-mono text-[10px] tracking-[0.14em] uppercase',
        low ? 'text-gold' : 'text-dim',
        className
      )}
    >
      {remaining} {label || 'left today'}
    </span>
  );
}

export default Gated;

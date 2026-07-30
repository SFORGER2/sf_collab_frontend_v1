import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Check, Copy, Gem, Info, Share2, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  MILESTONES, TIERS, buildLink, codeFor, nextTier, tierFor, totalEarned,
} from '@/services/referrals/referrals';
import { AdSlot, CosmosButton, Display, Eyebrow, Lede, Panel, ProgressRail, Reveal, Tag } from '@/components/cosmos';

/**
 * Referrals.
 *
 * Nothing pays out at signup, on purpose — pay for signups and you buy bots.
 * Rewards unlock as the person you brought in actually does something, and
 * both sides get paid, because a one-sided programme makes the referrer a
 * salesperson while paying both makes the invite a favour.
 *
 * NOTE FOR BACKEND: GET /api/referrals for the code, stats and referred list;
 * POST /api/referrals/claim/:id to pay an unlocked milestone. Attribution and
 * fraud checks — self-referral, shared device, disposable email — must live
 * server-side.
 */
export default function ReferralsPage() {
  const { user } = useSelector((state) => state.auth);
  const [copied, setCopied] = useState(false);

  const code = codeFor(user);
  const link = buildLink(code);

  // BACKEND: replace with the real referred list. Empty is the honest default
  // — inventing referrals would make the numbers on this page a lie.
  const referred = [];

  const activated = referred.filter((r) => r.milestones?.length > 1).length;
  const tier = tierFor(activated);
  const next = nextTier(activated);
  const earned = useMemo(() => totalEarned(referred), [referred]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — select the link and copy it manually');
    }
  };

  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({
        title: 'SFCollab',
        text: 'Building something? This is where I found my team.',
        url: link,
      });
    } catch {
      /* user cancelled the share sheet — not an error */
    }
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
      <Reveal>
        <Eyebrow>Referrals</Eyebrow>
        <Display size="xl" className="mt-3 mb-4">Bring people worth having.</Display>
        <Lede>
          Both of you get paid, and the rewards land as they actually get going — not the
          moment they sign up. That keeps this a favour rather than a funnel.
        </Lede>
      </Reveal>

      {/* Link */}
      <Panel className="cosmos-panel-neon p-6 mt-7" accent="#4fd8ff">
        <Eyebrow className="mb-3">Your invite link</Eyebrow>
        <div className="flex flex-wrap items-center gap-2.5">
          <code className="flex-1 min-w-[220px] px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-[0.85rem] text-star break-all">
            {link}
          </code>
          <CosmosButton variant="primary" size="sm" onClick={copy}>
            {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
          </CosmosButton>
          <CosmosButton variant="ghost" size="sm" onClick={share}>
            <Share2 size={13} /> Share
          </CosmosButton>
        </div>
      </Panel>

      {/* Stats */}
      <div className="grid gap-3 mt-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        <StatCard label="Invited" value={referred.length} hint="People who signed up" accent="#a9a2c2" icon={<Users size={16} />} />
        <StatCard label="Activated" value={activated} hint="Got past a first milestone" accent="#3ee6a0" icon={<Check size={16} />} />
        <StatCard label="Crystals earned" value={earned} hint="After your tier multiplier" accent="#4fd8ff" icon={<Gem size={16} />} />
      </div>

      {/* Tier */}
      <Panel className="p-6 mt-4" accent={tier.accent}>
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
          <span className="flex items-center gap-2">
            <Eyebrow>Your tier</Eyebrow>
            <Tag tone="accent">{tier.label}</Tag>
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-dim">
              ×{tier.multiplier} rewards
            </span>
          </span>
          {next && (
            <span className="text-[0.82rem] text-dim">
              {next.min - activated} more activated to reach {next.label}
            </span>
          )}
        </div>

        {next && (
          <ProgressRail
            label={`${tier.label} → ${next.label}`}
            value={Math.min(100, Math.round((activated / next.min) * 100))}
          />
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {TIERS.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.78rem]"
              style={{
                background: t.id === tier.id ? `${t.accent}18` : 'transparent',
                border: `1px solid ${t.id === tier.id ? `${t.accent}55` : 'rgba(255,255,255,0.1)'}`,
                color: t.id === tier.id ? t.accent : 'var(--color-dim)',
              }}
            >
              {t.label}
              <span className="font-mono text-[9px] opacity-70">{t.min}+</span>
            </span>
          ))}
        </div>

        <p className="text-[0.8rem] text-dim mt-3">
          Tier is driven by activated referrals, not signups — for the same reason nothing
          pays out at signup.
        </p>
      </Panel>

      <AdSlot placement="referrals-mid" format="banner" className="mt-4" />

      {/* Milestones */}
      <Panel className="p-6 mt-4">
        <Eyebrow className="mb-1">What pays, and when</Eyebrow>
        <p className="text-[0.85rem] text-dim mb-4">
          Each milestone pays once, to both of you.
        </p>

        <div className="flex flex-col gap-2.5">
          {MILESTONES.map((m, i) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-white/[0.07] bg-white/[0.02]"
              style={{ borderLeftColor: m.accent, borderLeftWidth: 2 }}
            >
              <span
                className="grid place-items-center w-7 h-7 rounded-lg shrink-0 font-mono text-[11px]"
                style={{ background: `${m.accent}18`, color: m.accent }}
              >
                {i + 1}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[0.9rem] text-star">{m.label}</span>
                <span className="block text-[0.78rem] text-dim mt-0.5">{m.detail}</span>
              </span>

              <span className="flex flex-col items-end shrink-0">
                <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-dim">You</span>
                <span className="text-[0.85rem]" style={{ color: m.accent }}>
                  {m.youGet.crystals > 0 ? `${m.youGet.crystals} crystals` : `${m.youGet.coins} coins`}
                </span>
              </span>

              <span className="flex flex-col items-end shrink-0">
                <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-dim">Them</span>
                <span className="text-[0.85rem] text-star/85">
                  {m.theyGet.crystals > 0 ? `${m.theyGet.crystals} crystals` : `${m.theyGet.coins} coins`}
                </span>
              </span>
            </div>
          ))}
        </div>

        <p className="flex items-start gap-2 text-[0.82rem] text-dim mt-4">
          <Info size={13} className="shrink-0 mt-0.5" />
          Signup pays in SF Coins only — it is the cheapest thing in the world to fake, so it
          never pays crystals. Self-referrals and duplicate accounts don't count.
        </p>
      </Panel>

      {/* Referred list */}
      <Panel className="p-6 mt-4">
        <Eyebrow className="mb-3.5">People you've brought in</Eyebrow>
        {referred.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[0.9rem] text-dim">Nobody yet. Share your link above.</p>
            <div className="flex flex-wrap justify-center gap-2.5 mt-4">
              <CosmosButton variant="ghost" size="sm" onClick={share}>
                <Share2 size={13} /> Share your link
              </CosmosButton>
              <CosmosButton variant="quiet" size="sm" asChild>
                <Link to="/wallet/crystals">See what crystals buy</Link>
              </CosmosButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {referred.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2.5 border-b border-white/[0.06] last:border-0">
                <span className="text-[0.9rem] text-star flex-1 min-w-0 truncate">{r.name}</span>
                <span className="flex gap-1">
                  {MILESTONES.map((m) => (
                    <span
                      key={m.id}
                      title={m.label}
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: r.milestones?.includes(m.id) ? m.accent : 'rgba(255,255,255,0.12)',
                      }}
                    />
                  ))}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function StatCard({ label, value, hint, accent, icon }) {
  return (
    <div className="cosmos-card p-4 flex items-center gap-3" style={{ '--cosmos-accent': accent }}>
      <span
        className="grid place-items-center w-10 h-10 rounded-xl shrink-0"
        style={{ background: `${accent}18`, border: `1px solid ${accent}33`, color: accent }}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="cosmos-stat-label block">{label}</span>
        <span className="font-display text-[1.2rem] tabular-nums" style={{ color: accent }}>
          {Number(value).toLocaleString()}
        </span>
        <span className="block text-[0.75rem] text-dim">{hint}</span>
      </span>
    </div>
  );
}

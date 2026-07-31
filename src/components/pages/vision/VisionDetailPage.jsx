import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft, Bookmark, Check, Heart, Layers, Lightbulb, Loader2, MessageCircle,
  Rocket, Share2, Sparkles, Target, Users, Wrench, Zap,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { ideaAPI } from '@/utils/APIs/ideaAPI';
import { momentumOf, momentumReason } from '@/services/vision/momentum';
import {
  AdSlot, BurningBox, CosmosButton, Display, Eyebrow, Lede, Panel,
  ProgressRail, Reveal, StreakBadge, Tag,
} from '@/components/cosmos';
import { SAMPLE_PEOPLE } from '@/services/mock/people';
import ApplicationModal from '../discoverStartups/ApplicationModal';

/**
 * The Vision page.
 *
 * A Vision is one star that might accrete into a company, and this page is
 * where someone decides whether to put their evenings into it. So it is built
 * around that decision rather than as a record: what the problem is, what
 * exists today, who is already in, what is still missing, and how to join.
 *
 * The old page was a stock card stack that answered none of those in order —
 * you had to read the whole thing to work out whether the Vision needed you.
 *
 * Structure, top to bottom:
 *   Hero        — the claim, its momentum, and the one action for your role
 *   Readiness   — how close to becoming a startup, and what is blocking it
 *   The case    — problem, solution, what exists
 *   The team    — who is in, what roles are open, apply
 *   Stack/tags  — what it's built with
 *
 * NOTE FOR BACKEND: reads GET /api/ideas/:id. `requiredRoles`, `techStack`,
 * `readinessScore` and `collaborators` all need to be on that payload; the
 * page degrades gracefully where they are missing rather than rendering empty
 * shells.
 */

const STATE_LABEL = {
  draft: 'Draft',
  public: 'Open',
  team_forming: 'Team forming',
  ready_for_activation: 'Ready to launch',
  archived: 'Archived',
};

const SAMPLE_VISION = {
  id: 'sample-vision',
  title: 'Founder Match: Find Your Tech Co-Founder',
  description:
    'A simple tool that connects non-technical founders with developers based on actual skills and shared interests, not resume buzzwords.',
  problemStatement:
    'Non-technical founders struggle to find developers who are both skilled and genuinely interested in their domain. Networking events and cold LinkedIn outreach produce low-quality matches and waste months.',
  solution:
    'Matching on tech stack requirements *and* soft-signal alignment — build consistency, sector interest, availability — so introductions start warm instead of cold.',
  projectDetails:
    'Working prototype matching on skills and availability. Next: bring in contribution history so the score reflects what people have actually shipped, not what they claim.',
  stage: 'Prototype',
  category: 'AI / SaaS',
  visionState: 'team_forming',
  readinessScore: 68,
  likes: 184,
  comments: 37,
  collaborators: 6,
  views: 3100,
  lastActivityAt: new Date().toISOString(),
  tags: ['Matchmaking', 'Startup Tool', 'Community'],
  requiredRoles: ['Fullstack Engineer', 'Product Designer', 'Growth Marketer'],
  techStack: ['React', 'Node.js', 'Postgres', 'Tailwind', 'WebSockets'],
  author: { id: 'sample-1', name: 'Ada Okonkwo', role: 'Founder & CEO' },
  isSample: true,
};

export default function VisionDetailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const id = params.get('id');

  const [vision, setVision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await ideaAPI.getIdeaById?.(id);
        const data = res?.data?.idea || res?.data || res;
        if (!cancelled && data?.title) { setVision(data); return; }
        throw new Error('empty');
      } catch {
        // Labelled sample rather than a spinner forever — an unreviewable page
        // is worse than one that says what it's showing.
        if (!cancelled) setVision(SAMPLE_VISION);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const { tier } = useMemo(() => momentumOf(vision || {}), [vision]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-dim">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  const readiness = Number(vision.readinessScore) || 0;
  const roles = vision.requiredRoles || [];
  const stack = vision.techStack || [];
  const isOwner = user?.id && String(user.id) === String(vision.author?.id || vision.creatorId);

  // Matchmaking suggestions are the founder's view; everyone else sees the team.
  const suggestions = SAMPLE_PEOPLE.slice(0, 4);

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-[0.85rem] text-dim hover:text-star transition-colors mb-5"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {vision.isSample && (
        <div
          className="mb-5 rounded-xl px-3.5 py-2.5 text-[0.83rem]"
          style={{
            background: 'rgba(255,191,94,0.08)',
            border: '1px solid rgba(255,191,94,0.28)',
            color: '#ffbf5e',
          }}
        >
          Sample Vision — this one isn't real. The backend returned nothing for this id.
        </div>
      )}

      {/* ── Hero. The claim, the heat, the action. ─────────────────────── */}
      <Reveal>
        <BurningBox item={vision} className="cosmos-panel cosmos-panel-neon relative overflow-hidden p-6 sm:p-9 rounded-2xl">
          {/* One nebula keyed to readiness — not a competing starfield. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              right: '-8%', top: '-45%', width: 520, height: 520,
              background: `radial-gradient(circle, ${readiness > 60 ? '#3ee6a022' : '#ffbf5e22'} 0%, transparent 62%)`,
            }}
          />

          <div className="relative flex flex-wrap items-start gap-6">
            <div className="flex-1 min-w-[280px]">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <Eyebrow>Vision</Eyebrow>
                <Tag tone={readiness > 70 ? 'live' : 'dev'} dot={readiness > 70}>
                  {STATE_LABEL[vision.visionState] || 'Open'}
                </Tag>
                {vision.stage && <Tag tone="neutral">{vision.stage}</Tag>}
                <StreakBadge item={vision} />
              </div>

              <Display size="xl" className="mb-3">{vision.title}</Display>
              <Lede className="max-w-[62ch]">{vision.description}</Lede>

              <div className="flex flex-wrap items-center gap-4 mt-5">
                {vision.author?.name && (
                  <Link
                    to={`/user-profile?userId=${vision.author.id}`}
                    className="flex items-center gap-2.5 group"
                  >
                    <span
                      className="grid place-items-center w-9 h-9 rounded-full font-mono text-[11px] shrink-0"
                      style={{ background: 'rgba(255,191,94,0.15)', color: '#ffbf5e' }}
                    >
                      {vision.author.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.88rem] text-star group-hover:text-gold transition-colors">
                        {vision.author.name}
                      </span>
                      <span className="block font-mono text-[9.5px] tracking-[0.12em] uppercase text-dim">
                        {vision.author.role || 'Creator'}
                      </span>
                    </span>
                  </Link>
                )}

                {tier && (
                  <span className="text-[0.82rem] text-dim">{momentumReason(vision)}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5 mt-6">
                {isOwner ? (
                  <>
                    <CosmosButton variant="primary" asChild>
                      <Link to={`/vision/${vision.id}/workspace`}>
                        <Layers size={15} /> Open workspace
                      </Link>
                    </CosmosButton>
                    <CosmosButton variant="ghost" asChild>
                      <Link to="/discover-users?matchFor=vision">
                        <Sparkles size={14} /> Find builders
                      </Link>
                    </CosmosButton>
                  </>
                ) : (
                  <>
                    <CosmosButton variant="primary" onClick={() => setIsApplicationModalOpen(true)}>
                      <Rocket size={15} /> Ask to join
                    </CosmosButton>
                    <CosmosButton variant="ghost" onClick={() => { setLiked(!liked); }}>
                      <Heart size={14} className={liked ? 'fill-current text-red-400' : ''} />
                      {(vision.likes || 0) + (liked ? 1 : 0)}
                    </CosmosButton>
                  </>
                )}

                <CosmosButton variant="quiet" onClick={() => setSaved(!saved)}>
                  <Bookmark size={14} className={saved ? 'fill-current' : ''} />
                  {saved ? 'Saved' : 'Save'}
                </CosmosButton>

                <CosmosButton
                  variant="quiet"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success('Link copied');
                  }}
                >
                  <Share2 size={14} /> Share
                </CosmosButton>
              </div>
            </div>

            {/* Readiness ring */}
            <div className="relative shrink-0 mx-auto sm:mx-0">
              <ReadinessRing value={readiness} />
            </div>
          </div>
        </BurningBox>
      </Reveal>

      {/* ── Signals ────────────────────────────────────────────────────── */}
      <div className="grid gap-3 mt-4 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        <Signal icon={<Heart size={15} />} label="Backing" value={vision.likes || 0} accent="#ff6fd8" />
        <Signal icon={<MessageCircle size={15} />} label="Discussion" value={vision.comments || 0} accent="#4fd8ff" />
        <Signal icon={<Users size={15} />} label="On the team" value={vision.collaborators || 0} accent="#3ee6a0" />
        <Signal icon={<Zap size={15} />} label="Roles open" value={roles.length} accent="#ffbf5e" />
      </div>

      <AdSlot placement="vision-detail" format="banner" className="mt-4" />

      {/* ── The case ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 mt-4 lg:grid-cols-2">
        <CasePanel
          icon={Target} accent="#ff6fd8" eyebrow="The problem"
          title="What is actually broken" body={vision.problemStatement}
        />
        <CasePanel
          icon={Lightbulb} accent="#3ee6a0" eyebrow="The solution"
          title="What this does about it" body={vision.solution}
        />
      </div>

      {vision.projectDetails && (
        <Panel className="p-6 mt-4" accent="#4fd8ff">
          <Eyebrow className="mb-2.5">Where it stands</Eyebrow>
          <p className="text-[0.95rem] text-star/85 leading-relaxed max-w-[76ch]">
            {vision.projectDetails}
          </p>
        </Panel>
      )}

      {/* ── The team ───────────────────────────────────────────────────── */}
      {roles.length > 0 && (
        <Panel className="p-6 mt-4" accent="#ffbf5e">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-1">
            <Eyebrow>Who this needs</Eyebrow>
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-dim">
              {roles.length} open
            </span>
          </div>
          <p className="text-[0.85rem] text-dim mb-4">
            Named roles, not "looking for cofounders" — so you can tell in one read whether
            it's you.
          </p>

          <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            {roles.map((role) => (
              <div
                key={role}
                className="cosmos-card p-3.5 flex items-center gap-3"
                style={{ '--cosmos-accent': '#ffbf5e' }}
              >
                <span
                  className="grid place-items-center w-9 h-9 rounded-xl shrink-0"
                  style={{ background: 'rgba(255,191,94,0.14)', color: '#ffbf5e' }}
                >
                  <Wrench size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.88rem] text-star truncate">{role}</span>
                  <span className="block font-mono text-[9px] tracking-[0.12em] uppercase text-dim">
                    Open
                  </span>
                </span>
                <CosmosButton variant="quiet" size="sm" onClick={() => {
                  setSelectedRole(role);
                  setIsApplicationModalOpen(true);
                }}>
                  Apply
                </CosmosButton>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Matchmaking — owner only, and metered elsewhere */}
      {isOwner && (
        <Panel className="p-6 mt-4" accent="#8b6cff">
          <Eyebrow className="mb-1">People who fit these roles</Eyebrow>
          <p className="text-[0.85rem] text-dim mb-4">
            Matched on skills, availability and what they have actually shipped.
          </p>
          <div className="flex flex-col divide-y divide-white/[0.07]">
            {suggestions.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                <span
                  className="grid place-items-center w-9 h-9 rounded-full font-mono text-[11px] shrink-0"
                  style={{ background: 'rgba(139,108,255,0.16)', color: '#8b6cff' }}
                >
                  {p.firstName[0]}{p.lastName[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <Link to={`/user-profile?userId=${p.id}`} className="block text-[0.9rem] text-star hover:text-gold transition-colors">
                    {p.name}
                  </Link>
                  <span className="block text-[0.78rem] text-dim truncate">{p.headline}</span>
                </span>
                <Tag tone="dev">{p.match}% match</Tag>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <CosmosButton variant="ai" size="sm" asChild>
              <Link to="/discover-users?matchFor=vision"><Sparkles size={14} /> See all matches</Link>
            </CosmosButton>
          </div>
        </Panel>
      )}

      {/* ── Stack & tags ───────────────────────────────────────────────── */}
      {(stack.length > 0 || vision.tags?.length > 0) && (
        <Panel className="p-6 mt-4">
          {stack.length > 0 && (
            <>
              <Eyebrow className="mb-2.5">Built with</Eyebrow>
              <div className="flex flex-wrap gap-2 mb-5">
                {stack.map((t) => <Tag key={t} tone="neutral">{t}</Tag>)}
              </div>
            </>
          )}
          {vision.tags?.length > 0 && (
            <>
              <Eyebrow className="mb-2.5">Tags</Eyebrow>
              <div className="flex flex-wrap gap-2">
                {vision.tags.map((t) => <Tag key={t} tone="future">#{t}</Tag>)}
              </div>
            </>
          )}
        </Panel>
      )}

      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => {
          setIsApplicationModalOpen(false);
          setSelectedRole(null);
        }}
        entity={vision}
        entityType="vision"
        roleSelected={selectedRole}
      />
    </div>
  );
}

/** Readiness as an arc that closes — the Vision accreting into a company. */
function ReadinessRing({ value }) {
  const R = 54;
  const C = 2 * Math.PI * R;
  const dash = (value / 100) * C;
  const accent = value >= 70 ? '#3ee6a0' : value >= 40 ? '#4fd8ff' : '#ffbf5e';

  return (
    <div className="relative">
      <svg width="146" height="146" viewBox="0 0 146 146" role="img" aria-label={`${value}% ready`}>
        <circle cx="73" cy="73" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx="73" cy="73" r={R} fill="none"
          stroke={accent} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          transform="rotate(-90 73 73)"
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 8px ${accent}66)` }}
        />
        <circle cx="73" cy="73" r="22" fill={accent} opacity={value >= 70 ? 0.26 : 0.12} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[1.7rem] leading-none" style={{ color: accent }}>
          {value}%
        </span>
        <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-dim mt-1">
          ready
        </span>
      </div>
    </div>
  );
}

function Signal({ icon, label, value, accent }) {
  return (
    <div className="cosmos-card p-4 flex items-center gap-3" style={{ '--cosmos-accent': accent }}>
      <span
        className="grid place-items-center w-9 h-9 rounded-xl shrink-0"
        style={{ background: `${accent}18`, border: `1px solid ${accent}33`, color: accent }}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="cosmos-stat-label block">{label}</span>
        <span className="font-display text-[1.15rem] tabular-nums" style={{ color: accent }}>
          {Number(value).toLocaleString()}
        </span>
      </span>
    </div>
  );
}

function CasePanel({ icon: Icon, accent, eyebrow, title, body }) {
  if (!body) return null;
  return (
    <Panel className="p-6" accent={accent}>
      <div className="flex items-center gap-2.5 mb-3">
        <span
          className="grid place-items-center w-9 h-9 rounded-xl shrink-0"
          style={{ background: `${accent}18`, border: `1px solid ${accent}33`, color: accent }}
        >
          <Icon size={16} />
        </span>
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <p className="text-[0.9rem] text-star mt-0.5">{title}</p>
        </div>
      </div>
      <p className="text-[0.95rem] text-star/85 leading-relaxed">{body}</p>
    </Panel>
  );
}

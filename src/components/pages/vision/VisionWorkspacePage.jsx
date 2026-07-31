// src/components/pages/vision/VisionWorkspacePage.jsx
//
// Implements the "Vision page" UI requirements from the
// Vision → Startup Progression System spec (section 11):
//   - Vision Points
//   - Progress bar
//   - Next available milestones
//   - Recent activity
//   - Team members
//   - Interested users / builders / investors / customers
//   - Convert to Startup button (when eligible)
//
// Data sources (existing backend):
//   GET  /ideas/:id                     -> idea.to_dict()      (camelCase)
//   GET  /ideas/:id/readiness           -> readiness_routes.py (snake_case)
//   GET  /idea-comments?idea_id=:id     -> recent activity feed
//   GET  /activation/ideas/:id/eligibility
//   POST /activation/ideas/:id/activate

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import {
  ArrowLeft, Target, Users, TrendingUp, MessageSquare, Heart,
  Bookmark, Rocket, Loader2, X, CheckCircle, Circle, AlertCircle,
  Map, Lightbulb, Zap, RefreshCw, UserPlus, Briefcase, Wallet,
  ShoppingBag, Clock, ArrowRight,
} from 'lucide-react';

import { ideaAPI } from '@/utils/APIs/ideaAPI';
import { visionAPI } from '@/utils/APIs/visionAPI';
import { getProfilePicture } from '@/utils/getProfilePicture';
import { formatFriendlyDate } from '@/utils/formatFriendlyDate';
import { CosmosButton, Eyebrow, Tag, AdSlot } from '@/components/cosmos';
import { useEntitlements } from '@/services/entitlements/useEntitlements';
import VisionHero from './VisionHero';
import VisionActions from './VisionActions';
import VisionDiscovery from './VisionDiscovery';
import {
  mockMentorshipSeekers,
  mockSimilarVisions,
  mockSuggestedContributors,
} from '@/services/mock/mockProfiles';
import ApplicationModal from '../discoverStartups/ApplicationModal';

// ── helpers ──────────────────────────────────────────────────────────────

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

// Normalises the two different response shapes the backend returns
// (idea.to_dict() is camelCase, readiness_routes.py is snake_case).
const normaliseReadiness = (source) => ({
  score: source?.readinessScore ?? source?.readiness_score ?? 0,
  breakdown: source?.readinessBreakdown ?? source?.readiness_breakdown ?? {},
  needs: source?.readinessNeeds ?? source?.readiness_needs ?? [],
  visionState: source?.visionState ?? source?.vision_state ?? 'public',
});

const VISION_STATE_LABELS = {
  draft: { label: 'Draft', color: 'bg-gray-500/15 text-gray-300 border-gray-500/30' },
  public: { label: 'Public', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  team_forming: { label: 'Team Forming', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  ready_for_activation: { label: 'Ready for Activation', color: 'bg-green-500/15 text-green-300 border-green-500/30' },
  archived: { label: 'Archived', color: 'bg-red-500/15 text-red-300 border-red-500/30' },
};

const MILESTONE_ICONS = {
  roadmap: Map,
  problem_statement: Lightbulb,
  outcome_goal: Target,
  required_roles: Users,
  collaborators: UserPlus,
  collaborator_interest: TrendingUp,
  activity: Zap,
};

/**
 * Every readiness category the backend scores, paired with the action that
 * earns it. The score breakdown used to render as read-only stat boxes — you
 * could see you were short on points but not what to do about it.
 *
 * `openToAll` marks the ones any viewer can contribute to; the rest belong to
 * the Vision's creator.
 */
const MILESTONES = [
  {
    key: 'problem_statement',
    label: 'Define the problem',
    hint: 'What is broken, missing, or too hard today.',
    cta: 'Write it',
    action: (id) => `/ideation-details?id=${id}#problem`,
  },
  {
    key: 'outcome_goal',
    label: 'Set the outcome',
    hint: 'What success looks like if this works.',
    cta: 'Set goal',
    action: (id) => `/ideation-details?id=${id}#outcome`,
  },
  {
    key: 'roadmap',
    label: 'Build the roadmap',
    hint: 'The steps between here and a working product.',
    cta: 'Add steps',
    action: (id) => `/ideation-details?id=${id}#roadmap`,
  },
  {
    key: 'required_roles',
    label: 'Name the roles you need',
    hint: 'Matchmaking has nothing to work with until you do.',
    cta: 'Add roles',
    action: (id) => `/ideation-details?id=${id}#roles`,
  },
  {
    key: 'collaborators',
    label: 'Gather collaborators',
    hint: 'People committed to building this with you.',
    cta: 'Find people',
    action: () => '/discover-users',
  },
  {
    key: 'collaborator_interest',
    label: 'Attract interest',
    hint: 'Saves, follows and questions from the ecosystem.',
    cta: 'Share it',
    openToAll: true,
    action: (id) => `/ideation-details?id=${id}#share`,
  },
  {
    key: 'activity',
    label: 'Keep it alive',
    hint: 'Updates and discussion show real momentum.',
    cta: 'Post an update',
    openToAll: true,
    action: (id) => `/ideation-details?id=${id}#discuss`,
  },
];

// ── Convert to Startup modal ────────────────────────────────────────────

const ConvertToStartupModal = ({ ideaId, ideaTitle, onClose, onConverted }) => {
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [startupName, setStartupName] = useState(ideaTitle || '');

  useEffect(() => {
    (async () => {
      try {
        const body = await visionAPI.getActivationEligibility(ideaId);
        setEligibility(body?.data ?? body);
      } catch (err) {
        toast.error('Failed to check eligibility');
        onClose();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId]);

  const handleConvert = async () => {
    if (!startupName.trim()) {
      toast.error('Enter a startup name');
      return;
    }
    setConverting(true);
    try {
      const body = await visionAPI.activateStartup(ideaId, startupName.trim());
      if (body?.success !== false) {
        toast.success(body?.message || 'Startup created!');
        onConverted(body?.data?.startup ?? body?.startup);
      } else {
        toast.error(body?.error || 'Conversion failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f1116] border border-white/[0.08] rounded-2xl w-full max-w-md p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-green-400" />
            <h2 className="text-white font-bold">Convert to Startup</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : eligibility ? (
          <>
            <div className="space-y-2">
              {Object.entries(eligibility.checks || {}).map(([key, check]) => (
                <div
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    check.passed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  {check.passed ? (
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${check.passed ? 'text-green-300' : 'text-red-300'}`}>
                      {key === 'readiness_score' && `Vision Points: ${Math.round(check.value)} / ${check.required}`}
                      {key === 'collaborators' && `Collaborators: ${check.value} / ${check.required} required`}
                      {key === 'roadmap' && `Roadmap: ${check.value} item${check.value !== 1 ? 's' : ''} defined`}
                    </p>
                    {!check.passed && check.message && (
                      <p className="text-red-400/70 text-xs mt-0.5">{check.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {eligibility.eligible ? (
              <>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Startup name</label>
                  <input
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    placeholder="Enter startup name..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5
                               text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50"
                  />
                </div>

                <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 text-xs text-gray-400 space-y-1.5">
                  <p className="text-white font-medium mb-2 text-sm">What happens next:</p>
                  <p className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" /> Startup workspace is created</p>
                  <p className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" /> Team members are transferred</p>
                  <p className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" /> Roadmap items become milestones</p>
                  <p className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" /> The Vision remains public as your origin story</p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConvert}
                  disabled={converting || !startupName.trim()}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white
                             font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {converting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Converting...</>
                  ) : (
                    <><Rocket className="w-4 h-4" /> Convert to Startup</>
                  )}
                </motion.button>
              </>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <p className="text-amber-300 text-sm font-medium mb-2">Not ready yet</p>
                <ul className="space-y-1">
                  {(eligibility.blocking_reasons || []).map((reason, i) => (
                    <li key={i} className="text-amber-200/70 text-xs flex items-center gap-2">
                      <Circle className="w-2.5 h-2.5 flex-shrink-0" /> {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : null}
      </motion.div>
    </motion.div>
  );
};

// ── main page ────────────────────────────────────────────────────────────

export default function VisionWorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [idea, setIdea] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const { showAds } = useEntitlements();

  const isCreator = idea && user && idea.creator?.id === user.id;

  // The role the viewer is currently working as — this drives which actions
  // the page offers. Distinct from `isCreator`, which is about ownership.
  const viewerRole = localStorage.getItem('activeRole') || 'member';

  /**
   * Results for the discovery panel, chosen by lens.
   *
   * In dev, when the backend returns nothing, we fall back to mock data —
   * otherwise the metered states (10 free, then credits) are unreachable,
   * because with fewer than 10 results there is nothing to unlock. The mock
   * helpers return [] in production builds.
   */
  const discoveryResults = useMemo(() => {
    if (!idea) return [];

    const real = isCreator
      ? idea.suggestedContributors
      : viewerRole === 'mentor'
        ? idea.mentorshipSeekers
        : idea.similarVisions || idea.relatedStartups;

    if (real?.length) return real;

    if (isCreator) return mockSuggestedContributors();
    if (viewerRole === 'mentor') return mockMentorshipSeekers();
    return mockSimilarVisions();
  }, [idea, isCreator, viewerRole]);

  const load = useCallback(async () => {
    try {
      const [ideaBody, commentsBody] = await Promise.all([
        ideaAPI.getIdeaById(id),
        ideaAPI.getIdeaComments({ idea_id: id, per_page: 6 }).catch(() => null),
      ]);

      const ideaData = ideaBody?.data?.idea ?? ideaBody?.idea ?? null;
      setIdea(ideaData);
      setReadiness(normaliseReadiness(ideaData));

      const comments = commentsBody?.data?.comments ?? [];
      setActivity(comments);
    } catch (err) {
      console.error('VisionWorkspacePage load error:', err);
      toast.error('Could not load this Vision');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const body = await visionAPI.getReadiness(id);
      setReadiness(normaliseReadiness(body?.data ?? body));
    } catch (err) {
      // fall back to a full reload if the dedicated endpoint fails
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-gray-400">
        Vision not found.
      </div>
    );
  }

  const score = readiness.score;
  // The activation threshold is enforced by the backend; 70 is its current
  // default (see readiness_routes.py / Idea.compute_readiness_score()).
  // We display it dynamically once the eligibility check has run at least once.
  const threshold = 70;
  const pointsRemaining = Math.max(0, threshold - score);
  const progressPct = Math.min(100, Math.round((score / threshold) * 100));
  const eligible = score >= threshold;
  const stateConfig = VISION_STATE_LABELS[readiness.visionState] || VISION_STATE_LABELS.public;

  const teamMembers = idea.teamMembers || [];
  const roadmapItems = idea.roadmapItems || [];

  // "Next available milestones" = readiness needs, each mapped to the
  // roadmap/points category it unlocks.
  const nextMilestones = readiness.needs || [];

  // Interested breakdown — the backend doesn't yet segment interest by role
  // (user / builder / investor / customer), so we surface what real signal
  // exists today and label the rest as not-yet-tracked rather than fake it.
  const interested = {
    users: idea.likes ?? 0,
    builders: idea.bookmarks ?? 0, // collaborators bookmarking = builder interest proxy
    investors: null, // not tracked yet
    customers: null, // not tracked yet
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        <VisionHero
          idea={idea}
          readiness={readiness}
          score={score}
          threshold={threshold}
          progressPct={progressPct}
          eligible={eligible}
          isCreator={isCreator}
          refreshing={refreshing}
          onBack={() => navigate(-1)}
          onRefresh={handleRefresh}
          onConvert={() => setShowConvert(true)}
        />

        {/* What you can do here, from your role's point of view */}
        <VisionActions viewerRole={viewerRole} isCreator={isCreator} onApply={() => setIsApplicationModalOpen(true)} />

        {/* Signals — each milestone is a thing you can go and prove */}
        <section className="cosmos-panel p-6">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div>
              <Eyebrow>Signals</Eyebrow>
              <h2 className="font-display text-[1.05rem] text-star mt-1.5">
                Prove this Vision
              </h2>
            </div>
            <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-dim">
              {eligible
                ? 'Ready to convert'
                : `${Math.round(pointsRemaining)} points to activation`}
            </span>
          </div>

          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(215px,1fr))]">
            {MILESTONES.map((milestone) => {
              const Icon = MILESTONE_ICONS[milestone.key] || Circle;
              const earned = readiness.breakdown[milestone.key] ?? 0;
              const done = earned > 0;
              const canAct = isCreator || viewerRole === 'founder' || milestone.openToAll;

              return (
                <div
                  key={milestone.key}
                  className="cosmos-card p-4 flex flex-col gap-2.5"
                  style={{ '--cosmos-accent': done ? '#3ee6a0' : '#ffbf5e' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <Icon
                      className="w-4 h-4 shrink-0"
                      style={{ color: done ? '#3ee6a0' : '#a9a2c2' }}
                    />
                    {done ? (
                      <Tag tone="live">{earned} pts</Tag>
                    ) : (
                      <Tag tone="future">0 pts</Tag>
                    )}
                  </div>

                  <div>
                    <p className="text-[0.95rem] text-star leading-tight">{milestone.label}</p>
                    <p className="text-[0.82rem] text-dim mt-1">{milestone.hint}</p>
                  </div>

                  {canAct && (
                    <CosmosButton
                      variant={done ? 'quiet' : 'ghost'}
                      size="sm"
                      className="mt-auto self-start"
                      asChild
                    >
                      <Link to={milestone.action(id)}>
                        {done ? 'Update' : milestone.cta}
                      </Link>
                    </CosmosButton>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Discovery, framed by the role you're viewing as. The creator always
            gets the recruiting lens regardless of active role. */}
        <VisionDiscovery
          viewerRole={viewerRole}
          isCreator={isCreator}
          results={discoveryResults}
        />

        {showAds && <AdSlot placement="vision-detail" format="banner" />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Next available milestones */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Map className="w-4 h-4 text-blue-400" />
              Next Available Milestones
            </h2>
            {nextMilestones.length === 0 ? (
              <p className="text-gray-500 text-sm">All current milestones complete — nice work.</p>
            ) : (
              <ul className="space-y-2.5">
                {nextMilestones.map((need, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Circle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    {need}
                  </li>
                ))}
              </ul>
            )}

            {roadmapItems.length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/[0.06]">
                <p className="text-gray-500 text-xs mb-2">Roadmap</p>
                <ul className="space-y-1.5">
                  {roadmapItems.slice(0, 5).map((item, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400/70 flex-shrink-0" />
                      {typeof item === 'string' ? item : item.title || JSON.stringify(item)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Recent Activity
            </h2>
            {activity.length === 0 ? (
              <p className="text-gray-500 text-sm">No activity yet — comments and updates will show up here.</p>
            ) : (
              <ul className="space-y-3">
                {activity.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px]
                                    font-semibold text-gray-300 flex-shrink-0 overflow-hidden">
                      {getProfilePicture(item.author) ? (
                        <img
                          src={getProfilePicture(item.author)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials(`${item.author?.firstName || ''} ${item.author?.lastName || ''}`)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-300 truncate">
                        <span className="text-white font-medium">
                          {item.author?.firstName} {item.author?.lastName}
                        </span>{' '}
                        commented: <span className="text-gray-400">{item.content}</span>
                      </p>
                      <p className="text-gray-600 text-[11px]">{formatFriendlyDate(item.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Team members */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Team Members
              <span className="text-gray-500 text-xs font-normal">({teamMembers.length})</span>
            </h2>
            {teamMembers.length === 0 ? (
              <p className="text-gray-500 text-sm">Solo founder so far — invite collaborators to grow your team.</p>
            ) : (
              <ul className="space-y-3">
                {teamMembers.map((member, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center
                                    justify-center text-xs font-semibold text-blue-300 flex-shrink-0">
                      {initials(member.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{member.name}</p>
                      <p className="text-gray-500 text-xs truncate">{member.position}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Interested users / builders / investors / customers */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Interest
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                <Heart className="w-3.5 h-3.5 text-pink-400 mb-1.5" />
                <p className="text-white text-lg font-semibold">{interested.users}</p>
                <p className="text-gray-500 text-[11px]">Interested Users</p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                <Bookmark className="w-3.5 h-3.5 text-blue-400 mb-1.5" />
                <p className="text-white text-lg font-semibold">{interested.builders}</p>
                <p className="text-gray-500 text-[11px]">Interested Builders</p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 opacity-50">
                <Wallet className="w-3.5 h-3.5 text-green-400 mb-1.5" />
                <p className="text-white text-lg font-semibold">—</p>
                <p className="text-gray-500 text-[11px]">Interested Investors</p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 opacity-50">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400 mb-1.5" />
                <p className="text-white text-lg font-semibold">—</p>
                <p className="text-gray-500 text-[11px]">Interested Customers</p>
              </div>
            </div>
            <p className="text-gray-600 text-[11px] mt-3">
              Investor and customer interest tracking isn't wired up on the backend yet — these will
              populate once that signal exists.
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Link
            to={`/ideation-details?id=${idea.id}`}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            Open full Vision discussion <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {showConvert && (
          <ConvertToStartupModal
            ideaId={idea.id}
            ideaTitle={idea.title}
            onClose={() => setShowConvert(false)}
            onConverted={(startup) => {
              setShowConvert(false);
              if (startup?.id) navigate(`/startup-workspace/${startup.id}`);
            }}
          />
        )}
      </AnimatePresence>

      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        entity={idea}
        entityType="vision"
      />
    </div>
  );
}
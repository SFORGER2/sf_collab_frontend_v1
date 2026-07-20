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

import React, { useState, useEffect, useCallback } from 'react';
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

  const isCreator = idea && user && idea.creator?.id === user.id;

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
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-300" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white truncate">{idea.title}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${stateConfig.color}`}>
                {stateConfig.label}
              </span>
            </div>
            <p className="text-gray-500 text-sm">{idea.industry} • {idea.stage}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-40"
            title="Refresh Vision Points"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Vision Points + Progress bar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Vision Points</h2>
              <p className="text-gray-500 text-xs">Progress toward Startup conversion</p>
            </div>
          </div>

          <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-bold text-white">
              {Math.round(score)} <span className="text-lg text-gray-500 font-normal">/ {threshold} points</span>
            </span>
            <span className="text-sm text-gray-400">
              {eligible ? 'Ready to convert!' : `${Math.round(pointsRemaining)} points remaining`}
            </span>
          </div>

          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: eligible ? '#22c55e' : progressPct >= 40 ? '#3b82f6' : '#f59e0b' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {Object.entries(readiness.breakdown).map(([key, value]) => {
              const Icon = MILESTONE_ICONS[key] || Circle;
              return (
                <div key={key} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                  <Icon className="w-3.5 h-3.5 text-gray-400 mb-1.5" />
                  <p className="text-white text-sm font-semibold">{value} pts</p>
                  <p className="text-gray-500 text-[11px] capitalize">{key.replace(/_/g, ' ')}</p>
                </div>
              );
            })}
          </div>

          {/* Convert to Startup button — only when eligible */}
          {isCreator && eligible && readiness.visionState !== 'archived' && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowConvert(true)}
              className="mt-5 w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                         bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
            >
              <Rocket className="w-4 h-4" />
              Convert to Startup
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>

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
    </div>
  );
}
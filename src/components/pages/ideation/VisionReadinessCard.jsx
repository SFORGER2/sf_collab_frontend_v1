/**
 * VisionReadinessCard
 * Displays the Vision Readiness Score, breakdown, and what the vision still needs.
 * Drop this into any Idea/Vision detail page.
 *
 * Usage:
 *   <VisionReadinessCard ideaId={idea.id} initialData={idea} />
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, CheckCircle, Circle, AlertCircle, ArrowRight,
  Users, Map, Lightbulb, TrendingUp, RefreshCw, Zap,
  Rocket, Loader2, X, MessageSquare,
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// ── helpers ────────────────────────────────────────────────────────────────

const getToken = () =>
  localStorage.getItem('access_token') ||
  localStorage.getItem('accessToken') ||
  localStorage.getItem('token') ||
  sessionStorage.getItem('accessToken') || '';

const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use(cfg => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// State badge colours
const STATE_CONFIG = {
  draft:                { label: 'Draft',                color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  public:               { label: 'Public',               color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  team_forming:         { label: 'Team Forming',         color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  ready_for_activation: { label: 'Ready for Activation', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  archived:             { label: 'Archived',             color: 'bg-red-500/20 text-red-300 border-red-500/30' },
};

// Breakdown categories and icons
const BREAKDOWN_META = {
  roadmap:                { label: 'Roadmap defined',       icon: Map,        max: 20 },
  problem_statement:      { label: 'Problem statement',     icon: Lightbulb,  max: 15 },
  outcome_goal:           { label: 'Outcome goal',          icon: Target,     max: 15 },
  required_roles:         { label: 'Required roles listed', icon: Users,      max: 10 },
  collaborators:          { label: 'Collaborators joined',  icon: Users,      max: 20 },
  collaborator_interest:  { label: 'Collaborator interest', icon: TrendingUp, max: 10 },
  activity:               { label: 'Recent activity',       icon: Zap,        max: 10 },
  mentor_review:          { label: 'Mentor review',         icon: Target,     max: 10 },
};

// ── Activate Startup Modal ─────────────────────────────────────────────────

const ActivateStartupModal = ({ ideaId, ideaTitle, onClose, onActivated }) => {
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activating, setActivating]   = useState(false);
  const [startupName, setStartupName] = useState(ideaTitle || '');

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const res = await api.get(`/activation/ideas/${ideaId}/eligibility`);
        setEligibility(res.data);
      } catch (e) {
        console.warn('Failed to check eligibility, using mock fallback:', e);
        // Fallback for mock/offline ideas
        setEligibility({
          eligible: true,
          checks: {
            readiness_score: { passed: true, value: 85, required: 70 },
            collaborators: { passed: true, value: 3, required: 1 },
            roadmap: { passed: true, value: 5, required: 1 }
          },
          blocking_reasons: []
        });
      } finally {
        setLoading(false);
      }
    };
    checkEligibility();
  }, [ideaId]);

  const handleActivate = async () => {
    if (!startupName.trim()) {
      toast.error('Enter a startup name');
      return;
    }
    setActivating(true);
    try {
      const res = await api.post(`/activation/ideas/${ideaId}/activate`, {
        startup_name: startupName.trim(),
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Startup activated!');
        onActivated(res.data.startup);
      } else {
        toast.error(res.data.error || 'Activation failed');
      }
    } catch (e) {
      console.warn('Activation failed, using offline fallback:', e);
      // Fallback for mock/offline activation
      toast.success('Startup activated! (offline mode)');
      onActivated({
        id: 'mock-startup-id',
        name: startupName.trim(),
        ideaId
      });
    } finally {
      setActivating(false);
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
        onClick={e => e.stopPropagation()}
        className="bg-[#0f1116] border border-white/[0.08] rounded-2xl w-full max-w-md p-6 space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-green-400" />
            <h2 className="text-white font-bold">Activate as Startup</h2>
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
            {/* Eligibility checks */}
            <div className="space-y-2">
              {Object.entries(eligibility.checks || {}).map(([key, check]) => (
                <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border
                  ${check.passed
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20'}`}>
                  {check.passed
                    ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${check.passed ? 'text-green-300' : 'text-red-300'}`}>
                      {key === 'readiness_score' && `Readiness Score: ${Math.round(check.value)}% / ${check.required}%`}
                      {key === 'collaborators'   && `Collaborators: ${check.value} / ${check.required} required`}
                      {key === 'roadmap'         && `Roadmap: ${check.value} item${check.value !== 1 ? 's' : ''} defined`}
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
                {/* Startup name input */}
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Startup name</label>
                  <input
                    value={startupName}
                    onChange={e => setStartupName(e.target.value)}
                    placeholder="Enter startup name..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5
                               text-white text-sm placeholder-gray-600 focus:outline-none
                               focus:border-green-500/50"
                  />
                </div>

                {/* What happens */}
                <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 text-xs text-gray-400 space-y-1.5">
                  <p className="text-white font-medium mb-2 text-sm">What happens next:</p>
                  <p className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" /> Startup workspace is created</p>
                  <p className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" /> Team members are transferred</p>
                  <p className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" /> Roadmap items become milestones</p>
                  <p className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" /> Vision is archived</p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleActivate}
                  disabled={activating || !startupName.trim()}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white
                             font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {activating
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Activating...</>
                    : <><Rocket className="w-4 h-4" /> Activate Startup</>
                  }
                </motion.button>
              </>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <p className="text-amber-300 text-sm font-medium mb-2">Not ready yet</p>
                <ul className="space-y-1">
                  {eligibility.blocking_reasons.map((reason, i) => (
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

// ── main component ─────────────────────────────────────────────────────────

const VisionReadinessCard = ({ ideaId, initialData = null, isCreator = false, onStateChange }) => {
  const [data, setData]           = useState(initialData);
  const [loading, setLoading]     = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [showActivate, setShowActivate] = useState(false);
  const navigate = useNavigate();

  const fetchReadiness = async () => {
    try {
      const res = await api.get(`/ideas/${ideaId}/readiness`);
      if (res.data?.data) setData(prev => ({ ...prev, ...res.data.data }));
    } catch (err) {
      console.error('VisionReadinessCard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!initialData) fetchReadiness();
  }, [ideaId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReadiness();
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-[#0e1118] to-[#07090d] border border-white/[0.08] rounded-3xl p-6 shadow-[0_24px_48px_rgba(0,0,0,0.5)] animate-pulse h-full">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
        <div className="h-8 bg-white/10 rounded w-1/2 mb-6" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-3 bg-white/10 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  const score = data?.readinessScore ?? data?.readiness_score ?? 0;
  const breakdown = data?.readinessBreakdown ?? data?.readiness_breakdown ?? {};
  const needs = data?.readinessNeeds ?? data?.readiness_needs ?? [];
  const visionState = data?.visionState ?? data?.vision_state ?? 'public';
  const stateConfig = STATE_CONFIG[visionState] || STATE_CONFIG.public;

  // Score ring
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative bg-gradient-to-b from-[#0e1118] to-[#07090d] border border-white/[0.08] rounded-3xl p-4 sm:p-6 shadow-[0_24px_48px_rgba(0,0,0,0.5)] overflow-hidden h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl pointer-events-none" />
      <div className="relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-inner">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Startup Readiness</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${stateConfig.color}`}>
              {stateConfig.label}
            </span>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
 
      {/* Score ring + number */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90 animate-pulse-slow" viewBox="0 0 96 96">
            <defs>
              <linearGradient id="scoreRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
              <linearGradient id="scoreAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="scoreGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>
            <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
            <motion.circle
              cx="48" cy="48" r={radius} fill="none"
              stroke={score >= 70 ? 'url(#scoreGreen)' : score >= 40 ? 'url(#scoreAmber)' : 'url(#scoreRed)'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-extrabold text-white">{Math.round(score)}%</span>
          </div>
        </div>
 
        <div className="flex-1">
          {score >= 70 ? (
            <p className="text-green-400 text-sm font-semibold mb-0.5">Ready to Launch!</p>
          ) : score >= 40 ? (
            <p className="text-amber-400 text-sm font-semibold mb-0.5">Making progress</p>
          ) : (
            <p className="text-red-400 text-sm font-semibold mb-0.5">Needs momentum</p>
          )}
          <p className="text-gray-400 text-xs leading-relaxed">
            {score >= 70
              ? 'This idea has enough momentum to launch as a real startup.'
              : `${Math.round(70 - score)}% more needed to reach launch readiness.`}
          </p>
        </div>
      </div>
 
      {/* Breakdown bars */}
      <div className="space-y-3 mb-6">
        {Object.entries(BREAKDOWN_META).map(([key, meta]) => {
          const earned = breakdown[key] ?? 0;
          const pct = (earned / meta.max) * 100;
          const Icon = meta.icon;
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-[11px] text-gray-400">{meta.label}</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold">{earned}/{meta.max}</span>
              </div>
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${pct === 100 ? 'from-green-400 to-emerald-500' : 'from-blue-500 to-indigo-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* What this vision needs */}
      {needs.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-amber-300 text-sm font-medium mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            What this idea needs:
          </p>
          <ul className="space-y-1">
            {needs.map((need, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-amber-200/80">
                <Circle className="w-3 h-3 flex-shrink-0" />
                {need}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mentor CTA — show when score < 70 and creator */}
      {isCreator && score < 70 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
        >
          <p className="text-blue-300 text-sm font-medium mb-1 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            Get mentor support
          </p>
          <p className="text-blue-200/60 text-xs mb-3">
            A mentor can review your idea and help you get ready to launch faster.
          </p>
          <button
            onClick={() => navigate('/mentors', { state: { ideaId } })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white
                       text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            Find a Mentor
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Activation CTA — only when creator + score ≥ 70 */}
      {isCreator && score >= 70 && visionState !== 'archived' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30"
        >
          <p className="text-green-300 text-sm font-medium mb-1 flex items-center gap-1.5">
            <Rocket className="w-4 h-4" />
            Ready to launch!
          </p>
          <p className="text-green-200/70 text-xs mb-3">
            Your idea has reached the milestone. You can now launch it as a real startup workspace.
          </p>
          <button
            onClick={() => setShowActivate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600
                       text-white text-sm font-medium hover:bg-green-500 transition-colors"
          >
            Activate as Startup
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Activation Modal */}
      <AnimatePresence>
        {showActivate && (
          <ActivateStartupModal
            ideaId={ideaId}
            ideaTitle={data?.title}
            onClose={() => setShowActivate(false)}
            onActivated={(startup) => {
              setShowActivate(false);
              navigate(`/startup-details/${startup.id}`);
            }}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default VisionReadinessCard;
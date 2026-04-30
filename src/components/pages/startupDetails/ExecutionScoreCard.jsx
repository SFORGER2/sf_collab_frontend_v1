/**
 * ExecutionScoreCard
 * Displays the Startup Execution Score, lifecycle state, milestone progress,
 * and crowdfunding unlock status.
 *
 * Usage:
 *   <ExecutionScoreCard startupId={startup.id} initialData={startup} isCreator={true} />
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, CheckCircle, Clock, Users, Target,
  TrendingUp, RefreshCw, Unlock, Lock, AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/config';
import { toast } from 'react-toastify';

const getToken = () =>
  // The app stores the token under 'access_token' (set by authThunks/authSlice)
  localStorage.getItem('access_token') ||
  localStorage.getItem('accessToken') ||
  localStorage.getItem('token') ||
  sessionStorage.getItem('access_token') || '';

const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use(cfg => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Lifecycle state display config
const LIFECYCLE_CONFIG = {
  founder_only: { label: 'Founder Only',   color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',   dot: 'bg-gray-400' },
  active:       { label: 'Active',          color: 'bg-green-500/20 text-green-300 border-green-500/30', dot: 'bg-green-400' },
  recruiting:   { label: 'Recruiting',      color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',   dot: 'bg-blue-400' },
  slowing:      { label: 'Slowing',         color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', dot: 'bg-yellow-400' },
  at_risk:      { label: 'At Risk',         color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', dot: 'bg-orange-400' },
  dormant:      { label: 'Dormant',         color: 'bg-red-500/20 text-red-300 border-red-500/30',     dot: 'bg-red-400' },
  launched:     { label: '🚀 Launched',     color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', dot: 'bg-purple-400' },
  archived:     { label: 'Archived',        color: 'bg-gray-600/20 text-gray-400 border-gray-600/30',  dot: 'bg-gray-500' },
};

const ExecutionScoreCard = ({ startupId, initialData = null, isCreator = false, onMilestoneComplete }) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [crowdfunding, setCrowdfunding] = useState(null);
  const [milestoneInput, setMilestoneInput] = useState('');
  const [completingMilestone, setCompletingMilestone] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  const fetchData = async () => {
    try {
      const [scoreRes, cfRes] = await Promise.all([
        api.get(`/startups/${startupId}/execution-score`),
        api.get(`/startups/${startupId}/crowdfunding-eligibility`),
      ]);
      if (scoreRes.data?.data) {
        setData(prev => ({ ...prev, ...scoreRes.data.data }));
      }
      if (cfRes.data?.data) {
        setCrowdfunding(cfRes.data.data);
      }
    } catch (err) {
      console.error('ExecutionScoreCard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!initialData) fetchData();
    else fetchData(); // always refresh crowdfunding status
  }, [startupId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const handleCompleteMilestone = async () => {
    if (!milestoneInput.trim()) {
      toast.error('Please enter a milestone title');
      return;
    }
    try {
      setCompletingMilestone(true);
      const res = await api.post(`/startups/${startupId}/complete-milestone`, {
        milestone_title: milestoneInput.trim(),
      });
      if (res.data?.data) {
        toast.success(`Milestone "${milestoneInput}" completed! 🎉`);
        setMilestoneInput('');
        setShowMilestoneForm(false);
        await fetchData();
        onMilestoneComplete?.();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to complete milestone');
    } finally {
      setCompletingMilestone(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
        <div className="h-12 bg-white/10 rounded w-1/2 mb-6" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-3 bg-white/10 rounded w-full" />)}
        </div>
      </div>
    );
  }

  const score = data?.execution_score ?? data?.executionScore ?? 0;
  const lifecycleState = data?.lifecycle_state ?? data?.lifecycleState ?? 'active';
  const milestonesCompleted = data?.milestones_completed ?? data?.milestonesCompleted ?? 0;
  const milestonesTotal = data?.milestones_total ?? data?.milestonesTotal ?? 0;
  const activeBuilders = data?.active_builders ?? data?.memberCount ?? 0;
  const completionRate = milestonesTotal > 0 ? Math.round((milestonesCompleted / milestonesTotal) * 100) : 0;

  const stateConfig = LIFECYCLE_CONFIG[lifecycleState] || LIFECYCLE_CONFIG.active;

  // Score colour: 0–4 red, 4–7 amber, 7+ green
  const scoreColor = score >= 7 ? 'text-green-400' : score >= 4 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = score >= 7 ? 'from-green-500/10 to-emerald-500/10 border-green-500/20'
    : score >= 4 ? 'from-amber-500/10 to-yellow-500/10 border-amber-500/20'
    : 'from-red-500/10 to-orange-500/10 border-red-500/20';

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Execution Score</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${stateConfig.dot}`} />
              <span className={`text-xs px-2 py-0.5 rounded-full border ${stateConfig.color}`}>
                {stateConfig.label}
              </span>
            </div>
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

      {/* Score display */}
      <div className={`p-5 rounded-xl bg-gradient-to-br border ${scoreBg}`}>
        <div className="flex items-end gap-2 mb-2">
          <span className={`text-5xl font-bold ${scoreColor}`}>{score.toFixed(1)}</span>
          <span className="text-gray-400 text-lg mb-1">/ 10</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            {milestonesCompleted}/{milestonesTotal || '?'} milestones
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4 text-blue-400" />
            {activeBuilders} builder{activeBuilders !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Milestone progress bar */}
      {milestonesTotal > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400 flex items-center gap-1.5">
              <Target className="w-4 h-4" /> Milestone Progress
            </span>
            <span className="text-sm text-white font-medium">{completionRate}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      )}

      {/* Complete milestone form (creator/team only) */}
      {isCreator && (
        <div>
          {!showMilestoneForm ? (
            <button
              onClick={() => setShowMilestoneForm(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-all text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Record completed milestone
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <input
                type="text"
                value={milestoneInput}
                onChange={e => setMilestoneInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCompleteMilestone()}
                placeholder="Milestone title (e.g. MVP shipped)"
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500/50"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCompleteMilestone}
                  disabled={completingMilestone}
                  className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {completingMilestone ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Complete
                </button>
                <button
                  onClick={() => { setShowMilestoneForm(false); setMilestoneInput(''); }}
                  className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Crowdfunding unlock status */}
      {crowdfunding && (
        <div className={`p-4 rounded-xl border ${
          crowdfunding.already_unlocked
            ? 'bg-purple-500/10 border-purple-500/30'
            : crowdfunding.eligible
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {crowdfunding.already_unlocked ? (
              <Unlock className="w-4 h-4 text-purple-400" />
            ) : crowdfunding.eligible ? (
              <Unlock className="w-4 h-4 text-green-400" />
            ) : (
              <Lock className="w-4 h-4 text-gray-400" />
            )}
            <span className={`text-sm font-medium ${
              crowdfunding.already_unlocked ? 'text-purple-300'
              : crowdfunding.eligible ? 'text-green-300'
              : 'text-gray-300'
            }`}>
              Crowdfunding {crowdfunding.already_unlocked ? 'Unlocked 🎉' : crowdfunding.eligible ? 'Ready to Unlock' : 'Locked'}
            </span>
          </div>

          {!crowdfunding.already_unlocked && crowdfunding.reasons?.length > 0 && (
            <ul className="space-y-1">
              {crowdfunding.reasons.map((r, i) => (
                <li key={i} className="text-xs text-gray-400 flex items-start gap-1.5">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-500" />
                  {r}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-2 flex gap-3 text-xs text-gray-500">
            <span>{crowdfunding.milestones_completed} / 3 milestones</span>
            <span>{crowdfunding.active_members} / 2 collaborators</span>
            <span>{Math.min(crowdfunding.days_active, 14)} / 14 days</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionScoreCard;
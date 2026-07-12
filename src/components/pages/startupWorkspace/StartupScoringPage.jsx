// src/components/pages/startupWorkspace/StartupScoringPage.jsx
//
// "Startup Scoring" module (spec section 10). Uses the existing
// execution-score / crowdfunding-eligibility endpoints. This is the
// operational counterpart to the Vision's "Vision Points" — once a
// Vision converts to a Startup, progress is tracked here instead.

import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Gauge, RefreshCw, Loader2, CheckCircle2, Circle, Rocket, Zap } from 'lucide-react';
import { startupWorkspaceAPI } from '@/utils/APIs/startupWorkspaceAPI';

export default function StartupScoringPage() {
  const { startupId } = useOutletContext();

  const [score, setScore] = useState(null);
  const [crowdfunding, setCrowdfunding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recording, setRecording] = useState(false);

  const load = useCallback(async () => {
    try {
      const [scoreBody, cfBody] = await Promise.all([
        startupWorkspaceAPI.getExecutionScore(startupId),
        startupWorkspaceAPI.getCrowdfundingEligibility(startupId).catch(() => null),
      ]);
      setScore(scoreBody?.data ?? scoreBody);
      setCrowdfunding(cfBody?.data ?? cfBody);
    } catch (err) {
      console.error('Failed to load startup scoring:', err);
      toast.error('Could not load Startup Scoring');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startupId]);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
  };

  const handleRecordActivity = async () => {
    setRecording(true);
    try {
      await startupWorkspaceAPI.recordActivity(startupId);
      toast.success('Activity recorded');
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to record activity');
    } finally {
      setRecording(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  const executionScore = score?.execution_score ?? 0;
  const scoreColor = executionScore >= 7 ? '#22c55e' : executionScore >= 4 ? '#f59e0b' : '#ef4444';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Gauge className="w-5 h-5 text-blue-400" /> Startup Scoring
          </h1>
          <p className="text-gray-500 text-sm">
            Post-conversion progress tracking — the operational counterpart to Vision Points.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Execution score */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-6">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="36" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <motion.circle
              cx="48" cy="48" r="36" fill="none"
              stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 36}
              initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 36 - (Math.min(executionScore, 10) / 10) * 2 * Math.PI * 36 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-white">{executionScore}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-white font-medium mb-1">Execution Score</p>
          <p className="text-gray-400 text-sm mb-3">
            {score?.active_builders ?? 0} active builder{score?.active_builders === 1 ? '' : 's'} • last activity{' '}
            {score?.last_activity_at ? new Date(score.last_activity_at).toLocaleDateString() : 'unknown'}
          </p>
          <button
            onClick={handleRecordActivity}
            disabled={recording}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30
                       text-blue-300 text-xs font-medium hover:bg-blue-600/30 transition-colors disabled:opacity-50"
          >
            {recording ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Record activity
          </button>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Milestones</h2>
          <span className="text-gray-400 text-sm">
            {score?.milestones_completed ?? 0} / {score?.milestones_total ?? 0} ({score?.milestone_completion_rate ?? 0}%)
          </span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${score?.milestone_completion_rate ?? 0}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Crowdfunding eligibility */}
      {crowdfunding && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Rocket className="w-4 h-4 text-green-400" /> Crowdfunding Eligibility
          </h2>
          {crowdfunding.already_unlocked ? (
            <p className="text-green-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Crowdfunding is unlocked for this startup.
            </p>
          ) : (
            <>
              <p className={`text-sm mb-2 ${crowdfunding.eligible ? 'text-green-300' : 'text-amber-300'}`}>
                {crowdfunding.eligible ? 'Eligible to unlock crowdfunding.' : 'Not yet eligible.'}
              </p>
              <ul className="space-y-1.5">
                {(crowdfunding.reasons || []).map((reason, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <Circle className="w-3 h-3 flex-shrink-0" /> {reason}
                  </li>
                ))}
              </ul>
              <p className="text-gray-500 text-xs mt-3">
                {crowdfunding.milestones_needed ?? 0} more milestone(s) needed •{' '}
                {crowdfunding.active_members ?? 0} active member(s)
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
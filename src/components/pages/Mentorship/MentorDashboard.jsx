/**
 * MentorDashboard — SF Collab
 * Where mentors manage incoming requests, active sessions, and earnings.
 *
 * Route: /mentors/dashboard
 *
 * Sections:
 *   - Incoming requests (pending) → Accept / Decline
 *   - Active sessions (accepted) → Mark Complete with summary
 *   - Past sessions (completed)
 *   - Earnings summary + payout button
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, X, Clock, MessageSquare, Star, DollarSign,
  Users, TrendingUp, Loader2, ChevronDown, ChevronUp,
  AlertCircle, Sparkles, ArrowRight, Plus, Minus,
  Shield, RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import {
  mentorProfileAPI,
  mentorRequestAPI,
} from '@/utils/APIs/mentorshipAPI';

// ── Status badge ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: 'Pending',   cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  accepted:  { label: 'Active',    cls: 'bg-blue-500/10   text-blue-400   border-blue-500/20'   },
  completed: { label: 'Completed', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  declined:  { label: 'Declined',  cls: 'bg-red-500/10    text-red-400    border-red-500/20'    },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-500/10   text-gray-400   border-gray-500/20'   },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

// ── Request Card ──────────────────────────────────────────────────
const RequestCard = ({ req, onAccept, onDecline, onComplete }) => {
  const [expanded, setExpanded]     = useState(false);
  const [declining, setDeclining]   = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [completing, setCompleting] = useState(false);
  const [summary, setSummary]       = useState('');
  const [actionItems, setActionItems] = useState(['']);
  const [loading, setLoading]       = useState(false);

  const isPending   = req.status === 'pending';
  const isAccepted  = req.status === 'accepted';
  const isCompleted = req.status === 'completed';

  const project = req.idea || req.startup;
  const projectLabel = req.idea ? 'Vision' : 'Startup';

  const handleAccept = async () => {
    setLoading(true);
    await onAccept(req.id);
    setLoading(false);
  };

  const handleDecline = async () => {
    setLoading(true);
    await onDecline(req.id, declineReason);
    setLoading(false);
    setDeclining(false);
  };

  const handleComplete = async () => {
    const items = actionItems.filter(i => i.trim());
    setLoading(true);
    await onComplete(req.id, summary.trim(), items);
    setLoading(false);
    setCompleting(false);
  };

  const addActionItem = () => setActionItems(prev => [...prev, '']);
  const updateItem = (i, val) => setActionItems(prev => prev.map((v, idx) => idx === i ? val : v));
  const removeItem = (i) => setActionItems(prev => prev.filter((_, idx) => idx !== i));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111318] border border-white/[0.07] rounded-2xl overflow-hidden"
    >
      {/* Card header */}
      <div className="p-4 flex items-start gap-3">
        {/* Founder avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600
                        flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {req.founder?.name?.charAt(0) || 'F'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-white font-semibold text-sm">{req.founder?.name || 'Founder'}</p>
            <StatusBadge status={req.status} />
          </div>

          {/* Project */}
          {project && (
            <p className="text-gray-500 text-xs mt-0.5">
              {projectLabel}: <span className="text-gray-300">{project.title || project.name}</span>
              {req.idea?.readiness_score > 0 && (
                <span className="ml-2 text-blue-400">
                  {Math.round(req.idea.readiness_score)}% ready
                </span>
              )}
            </p>
          )}

          {/* Areas of help */}
          {req.areas_of_help?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {req.areas_of_help.slice(0, 3).map((area, i) => (
                <span key={i} className="text-[10px] bg-white/[0.04] text-gray-400
                                         border border-white/[0.06] px-1.5 py-0.5 rounded-md">
                  {area}
                </span>
              ))}
              {req.areas_of_help.length > 3 && (
                <span className="text-[10px] text-gray-600">+{req.areas_of_help.length - 3}</span>
              )}
            </div>
          )}

          {/* Message preview */}
          {req.message && (
            <p className="text-gray-500 text-xs mt-2 line-clamp-2 italic">
              "{req.message}"
            </p>
          )}

          {/* Paid badge */}
          {req.agreed_rate_cents > 0 && (
            <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
              <DollarSign size={10} /> ${(req.agreed_rate_cents / 100).toFixed(2)} session
            </p>
          )}

          <p className="text-gray-600 text-[10px] mt-1">
            {new Date(req.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpanded(v => !v)}
          className="text-gray-600 hover:text-gray-400 transition-colors p-1 flex-shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded actions */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/[0.05] pt-3">

              {/* Full message */}
              {req.message && (
                <div className="bg-white/[0.03] rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1 font-medium">Message from founder</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{req.message}</p>
                </div>
              )}

              {/* PENDING — Accept / Decline */}
              {isPending && !declining && (
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleAccept}
                    disabled={loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50
                               text-white font-semibold py-2.5 rounded-xl text-sm transition-colors
                               flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    Accept
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={() => setDeclining(true)}
                    disabled={loading}
                    className="flex-1 bg-white/[0.05] hover:bg-red-500/10 text-gray-400
                               hover:text-red-400 border border-white/[0.08] hover:border-red-500/20
                               font-semibold py-2.5 rounded-xl text-sm transition-colors
                               flex items-center justify-center gap-2">
                    <X size={14} /> Decline
                  </motion.button>
                </div>
              )}

              {/* Decline reason form */}
              {isPending && declining && (
                <div className="space-y-2">
                  <textarea rows={2} value={declineReason}
                    onChange={e => setDeclineReason(e.target.value)}
                    placeholder="Reason for declining (optional)..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2
                               text-white text-sm placeholder-gray-600 focus:outline-none
                               focus:border-red-500/40 resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => setDeclining(false)}
                      className="flex-1 bg-white/[0.04] text-gray-400 py-2 rounded-xl text-sm">
                      Cancel
                    </button>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleDecline}
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white
                                 font-semibold py-2 rounded-xl text-sm transition-colors
                                 flex items-center justify-center gap-2">
                      {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                      Confirm Decline
                    </motion.button>
                  </div>
                </div>
              )}

              {/* ACCEPTED — Mark Complete */}
              {isAccepted && !completing && (
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => setCompleting(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold
                             py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  <CheckCircle size={14} /> Mark Session Complete
                </motion.button>
              )}

              {/* Session completion form */}
              {isAccepted && completing && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Session summary</p>
                    <textarea rows={3} value={summary}
                      onChange={e => setSummary(e.target.value)}
                      placeholder="What did you discuss? What were the key insights?"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2
                                 text-white text-sm placeholder-gray-600 focus:outline-none
                                 focus:border-blue-500/40 resize-none" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs text-gray-500">Action items for founder</p>
                      <button onClick={addActionItem}
                        className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1">
                        <Plus size={10} /> Add
                      </button>
                    </div>
                    {actionItems.map((item, i) => (
                      <div key={i} className="flex gap-2 mb-1.5">
                        <input value={item}
                          onChange={e => updateItem(i, e.target.value)}
                          placeholder={`Action item ${i + 1}...`}
                          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5
                                     text-white text-xs placeholder-gray-600 focus:outline-none
                                     focus:border-blue-500/40" />
                        {actionItems.length > 1 && (
                          <button onClick={() => removeItem(i)}
                            className="text-gray-600 hover:text-red-400 transition-colors">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setCompleting(false)}
                      className="flex-1 bg-white/[0.04] text-gray-400 py-2 rounded-xl text-sm">
                      Cancel
                    </button>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleComplete}
                      disabled={loading || !summary.trim()}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50
                                 text-white font-semibold py-2 rounded-xl text-sm transition-colors
                                 flex items-center justify-center gap-2">
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      Complete Session
                    </motion.button>
                  </div>
                </div>
              )}

              {/* COMPLETED — show session info */}
              {isCompleted && req.session && (
                <div className="bg-emerald-500/[0.07] border border-emerald-500/[0.15] rounded-xl p-3 space-y-2">
                  {req.session.summary && (
                    <p className="text-gray-300 text-xs leading-relaxed">{req.session.summary}</p>
                  )}
                  {req.session.founder_rating && (
                    <div className="flex items-center gap-1 text-yellow-400 text-xs">
                      <Star size={11} fill="currentColor" />
                      Rated {req.session.founder_rating}/5
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-[#111318] border border-white/[0.07] rounded-2xl p-4">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-gray-500 text-xs">{label}</p>
        <p className="text-white font-bold text-lg leading-tight">{value}</p>
      </div>
    </div>
  </div>
);

// ── MAIN COMPONENT ────────────────────────────────────────────────
const MentorDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [profile, setProfile]   = useState(null);
  const [requests, setRequests] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('pending');
  const [payingOut, setPayingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [profileRes, requestsRes, earningsRes] = await Promise.all([
        mentorProfileAPI.getMyProfile(),
        mentorProfileAPI.getMyRequests(),
        mentorProfileAPI.getMyEarnings(),
      ]);

      if (profileRes.success)  setProfile(profileRes.mentor);
      if (requestsRes.success) setRequests(requestsRes.requests);
      if (earningsRes.success) setEarnings(earningsRes.earnings);
    } catch (e) {
      console.error('Dashboard load error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    toast.success('Dashboard refreshed');
  };

  const handleAccept = async (reqId) => {
    const res = await mentorProfileAPI.acceptRequest(reqId);
    if (res.success) {
      toast.success('Request accepted!');
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'accepted' } : r));
    } else {
      toast.error(res.error || 'Failed to accept');
    }
  };

  const handleDecline = async (reqId, reason) => {
    const res = await mentorProfileAPI.declineRequest(reqId, reason);
    if (res.success) {
      toast.success('Request declined');
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'declined' } : r));
    } else {
      toast.error(res.error || 'Failed to decline');
    }
  };

  const handleComplete = async (reqId, summary, actionItems) => {
    const res = await mentorProfileAPI.completeSession(reqId, { summary, action_items: actionItems });
    if (res.success) {
      toast.success('Session marked as complete!');
      await loadAll();
    } else {
      toast.error(res.error || 'Failed to complete session');
    }
  };

  const handlePayout = async () => {
    if (!earnings?.pending_payout || earnings.pending_payout < 5) {
      toast.error('Minimum payout is $5.00');
      return;
    }
    setPayingOut(true);
    try {
      const res = await mentorProfileAPI.requestPayout();
      if (res.success) {
        toast.success(res.message || 'Payout processed!');
        await loadAll();
      } else {
        toast.error(res.error || 'Payout failed');
      }
    } finally {
      setPayingOut(false);
    }
  };

  // Filter requests by tab
  const filtered = requests.filter(r => {
    if (tab === 'pending')   return r.status === 'pending';
    if (tab === 'active')    return r.status === 'accepted';
    if (tab === 'completed') return ['completed', 'declined', 'cancelled'].includes(r.status);
    return true;
  });

  const pendingCount  = requests.filter(r => r.status === 'pending').length;
  const activeCount   = requests.filter(r => r.status === 'accepted').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <Loader2 size={32} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  // Not a mentor yet
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center text-center px-4">
        <div>
          <div className="w-20 h-20 bg-white/[0.03] rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Shield size={36} className="text-gray-600" />
          </div>
          <p className="text-white font-bold text-xl mb-2">Not a Mentor Yet</p>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">
            Register as a mentor from the Mentors page to start receiving and managing requests.
          </p>
          <a href="/mentors"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white
                       font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
            Go to Mentors <ArrowRight size={14} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white">

      {/* Header */}
      <div className="bg-[#0a0c10]/90 backdrop-blur-xl border-b border-white/[0.05] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Mentor Dashboard</h1>
            <p className="text-gray-500 text-xs mt-0.5">Manage your mentorship requests and sessions</p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing}
            className="p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]
                       rounded-xl text-gray-400 transition-colors disabled:opacity-50">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Pending" value={pendingCount}
            icon={Clock} color="bg-yellow-600" />
          <StatCard label="Active" value={activeCount}
            icon={MessageSquare} color="bg-blue-600" />
          <StatCard label="Completed" value={earnings?.sessions_completed || 0}
            icon={CheckCircle} color="bg-emerald-600" />
          <StatCard label="Avg Rating"
            value={earnings?.average_rating ? `${earnings.average_rating.toFixed(1)}★` : '—'}
            icon={Star} color="bg-purple-600" />
        </div>

        {/* Earnings card */}
        {earnings && (
          <div className="bg-[#111318] border border-white/[0.07] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-400" /> Earnings
              </h2>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handlePayout}
                disabled={payingOut || (earnings.pending_payout < 5)}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white
                           text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors
                           flex items-center gap-1.5"
              >
                {payingOut ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                Withdraw to Balance
              </motion.button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Earned', value: `$${earnings.total_earned?.toFixed(2) || '0.00'}` },
                { label: 'Pending Payout', value: `$${earnings.pending_payout?.toFixed(2) || '0.00'}`, highlight: true },
                { label: 'Mentored', value: `${earnings.startups_mentored || 0} startups` },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="text-center">
                  <p className={`text-lg font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>
                    {value}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            {earnings.pending_payout > 0 && earnings.pending_payout < 5 && (
              <p className="text-yellow-400/70 text-xs mt-3 text-center">
                Minimum payout is $5.00 — you need ${(5 - earnings.pending_payout).toFixed(2)} more
              </p>
            )}
          </div>
        )}

        {/* Requests tabs */}
        <div>
          <div className="flex items-center gap-1 mb-4 p-1 bg-white/[0.04] rounded-xl w-fit">
            {[
              { key: 'pending',   label: 'Pending',   count: pendingCount },
              { key: 'active',    label: 'Active',    count: activeCount },
              { key: 'completed', label: 'Past',      count: null },
            ].map(({ key, label, count }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                  ${tab === key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'}`}>
                {label}
                {count != null && count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                    ${tab === key ? 'bg-white/20 text-white' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-3">
                {tab === 'pending'
                  ? <Clock size={28} className="text-gray-600" />
                  : tab === 'active'
                    ? <MessageSquare size={28} className="text-gray-600" />
                    : <CheckCircle size={28} className="text-gray-600" />
                }
              </div>
              <p className="text-white font-semibold">
                {tab === 'pending' ? 'No pending requests' :
                 tab === 'active'  ? 'No active sessions' :
                 'No past sessions'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {tab === 'pending' ? 'New requests will appear here' :
                 tab === 'active'  ? 'Accepted requests appear here' :
                 'Completed sessions appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filtered.map(req => (
                  <RequestCard
                    key={req.id}
                    req={req}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onComplete={handleComplete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
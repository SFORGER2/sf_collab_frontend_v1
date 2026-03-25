/**
 * MyMentorshipRequests — SF Collab
 * Founder's view of all their sent mentorship requests.
 * Shows status, mentor info, and allows rating completed sessions.
 *
 * Route: /mentors/my-requests
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle, X, Star, Loader2,
  MessageSquare, DollarSign, Users, ArrowRight,
  Download, RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { mentorRequestAPI } from '@/utils/APIs/mentorshipAPI';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Clock },
  accepted:  { label: 'Accepted',  cls: 'bg-blue-500/10   text-blue-400   border-blue-500/20',   icon: CheckCircle },
  completed: { label: 'Completed', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle },
  declined:  { label: 'Declined',  cls: 'bg-red-500/10    text-red-400    border-red-500/20',    icon: X },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-500/10   text-gray-400   border-gray-500/20',   icon: X },
};

// ── Rate Session Modal ────────────────────────────────────────────
const RateSessionModal = ({ session, onClose, onRated }) => {
  const [rating, setRating]     = useState(0);
  const [review, setReview]     = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!rating) { toast.error('Select a star rating'); return; }
    setLoading(true);
    try {
      const res = await mentorRequestAPI.rateSession(session.id, rating, review);
      if (res.success) {
        toast.success('Rating submitted!');
        onRated();
        onClose();
      } else {
        toast.error(res.error || 'Failed to submit rating');
      }
    } finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0f1116] border border-white/[0.08] rounded-2xl w-full max-w-sm p-6 space-y-4"
      >
        <h2 className="text-white font-bold">Rate Your Session</h2>

        {/* Stars */}
        <div className="flex items-center justify-center gap-3 py-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setRating(n)}>
              <Star size={32}
                className={`transition-colors ${n <= rating ? 'text-yellow-400' : 'text-gray-700'}`}
                fill={n <= rating ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-center text-gray-400 text-sm">
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
          </p>
        )}

        <textarea rows={3} value={review}
          onChange={e => setReview(e.target.value)}
          placeholder="Share your experience (optional)..."
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5
                     text-white text-sm placeholder-gray-600 focus:outline-none resize-none" />

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 bg-white/[0.04] text-gray-400 py-2.5 rounded-xl text-sm">
            Cancel
          </button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
            disabled={loading || !rating}
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40
                       text-black font-semibold py-2.5 rounded-xl text-sm
                       flex items-center justify-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
            Submit
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Request Row ───────────────────────────────────────────────────
const RequestRow = ({ req, onCancel, onRate }) => {
  const cfg     = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const mentor  = req.mentor;
  const project = req.idea || req.startup;
  const hasSession = req.session;
  const alreadyRated = hasSession?.founder_rating != null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111318] border border-white/[0.07] rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-start gap-3">
        {/* Mentor avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600
                        flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {mentor?.user?.name?.charAt(0) || 'M'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-white font-semibold text-sm">
              {mentor?.user?.name || 'Mentor'}
            </p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}
                              flex items-center gap-1`}>
              <StatusIcon size={10} />
              {cfg.label}
            </span>
          </div>

          {project && (
            <p className="text-gray-500 text-xs mt-0.5">
              {req.idea ? 'Vision' : 'Startup'}: <span className="text-gray-300">
                {project.title || project.name}
              </span>
            </p>
          )}

          {/* Areas */}
          {req.areas_of_help?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {req.areas_of_help.slice(0, 3).map((area, i) => (
                <span key={i} className="text-[10px] bg-white/[0.04] text-gray-400
                                         border border-white/[0.06] px-1.5 py-0.5 rounded-md">
                  {area}
                </span>
              ))}
            </div>
          )}

          <p className="text-gray-600 text-[10px] mt-1.5">
            Sent {new Date(req.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric'
            })}
            {req.agreed_rate_cents > 0 && (
              <span className="ml-2 text-blue-400">
                · ${(req.agreed_rate_cents / 100).toFixed(2)} session
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Decline reason */}
      {req.status === 'declined' && req.decline_reason && (
        <div className="bg-red-500/[0.07] border border-red-500/[0.15] rounded-xl p-3 text-xs text-red-300/80">
          Reason: {req.decline_reason}
        </div>
      )}

      {/* Session summary */}
      {req.status === 'completed' && hasSession?.summary && (
        <div className="bg-emerald-500/[0.07] border border-emerald-500/[0.15] rounded-xl p-3 space-y-2">
          <p className="text-gray-300 text-xs leading-relaxed">{hasSession.summary}</p>
          {hasSession.action_items?.length > 0 && (
            <div>
              <p className="text-gray-500 text-[10px] mb-1 font-medium">Action items:</p>
              <ul className="space-y-0.5">
                {hasSession.action_items.map((item, i) => (
                  <li key={i} className="text-gray-400 text-xs flex items-start gap-1.5">
                    <ArrowRight size={10} className="flex-shrink-0 mt-0.5 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasSession.founder_rating && (
            <p className="text-yellow-400 text-xs flex items-center gap-1">
              <Star size={11} fill="currentColor" /> You rated this {hasSession.founder_rating}/5
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {req.status === 'pending' && (
          <button onClick={() => onCancel(req.id)}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors
                       border border-white/[0.06] hover:border-red-500/20 px-3 py-1.5 rounded-lg">
            Cancel Request
          </button>
        )}
        {req.status === 'completed' && !alreadyRated && hasSession && (
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => onRate(hasSession)}
            className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400
                       border border-yellow-500/20 text-xs font-semibold py-1.5 rounded-lg
                       transition-colors flex items-center justify-center gap-1.5">
            <Star size={12} /> Rate Session
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// ── MAIN COMPONENT ────────────────────────────────────────────────
const MyMentorshipRequests = () => {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('all');
  const [ratingSession, setRatingSession] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = async () => {
    try {
      const res = await mentorRequestAPI.getMySentRequests();
      if (res.success) setRequests(res.requests);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
  };

  const handleCancel = async (reqId) => {
    const res = await mentorRequestAPI.cancelRequest(reqId);
    if (res.success) {
      toast.success('Request cancelled');
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'cancelled' } : r));
    } else {
      toast.error(res.error || 'Failed to cancel');
    }
  };

  const TABS = [
    { key: 'all',       label: 'All' },
    { key: 'pending',   label: 'Pending' },
    { key: 'accepted',  label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ];

  const filtered = tab === 'all' ? requests : requests.filter(r => r.status === tab);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white">

      {/* Header */}
      <div className="border-b border-white/[0.05] px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">My Mentorship Requests</h1>
            <p className="text-gray-500 text-xs mt-0.5">Track requests you've sent to mentors</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} disabled={refreshing}
              className="p-2 bg-white/[0.04] border border-white/[0.06] rounded-xl
                         text-gray-400 transition-colors disabled:opacity-50">
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <a href="/mentors"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white
                         text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              <Users size={13} /> Find Mentors
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5 p-1 bg-white/[0.04] rounded-xl w-fit">
          {TABS.map(({ key, label }) => {
            const count = key === 'all' ? requests.length : requests.filter(r => r.status === key).length;
            return (
              <button key={key} onClick={() => setTab(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5
                  ${tab === key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                {label}
                {count > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold
                    ${tab === key ? 'bg-white/20' : 'bg-white/[0.06] text-gray-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="text-blue-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MessageSquare size={40} className="text-gray-700 mb-3" />
            <p className="text-white font-semibold">No requests found</p>
            <p className="text-gray-500 text-sm mt-1">
              {tab === 'all'
                ? 'Find a mentor and send your first request'
                : `No ${tab} requests`}
            </p>
            {tab === 'all' && (
              <a href="/mentors"
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2
                           rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                <Users size={14} /> Browse Mentors
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map(req => (
                <RequestRow
                  key={req.id}
                  req={req}
                  onCancel={handleCancel}
                  onRate={setRatingSession}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Rate modal */}
      <AnimatePresence>
        {ratingSession && (
          <RateSessionModal
            session={ratingSession}
            onClose={() => setRatingSession(null)}
            onRated={loadRequests}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyMentorshipRequests;
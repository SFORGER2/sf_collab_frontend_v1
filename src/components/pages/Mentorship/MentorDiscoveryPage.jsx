/**
 * MentorDiscoveryPage — SF Collab
 * Browse mentors, view profiles, send mentorship requests.
 *
 * Route: /mentors
 *
 * Flow:
 *   Browse mentors → click mentor → view profile modal
 *   → "Request Mentorship" → select vision or startup → send request
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, Star, Users, Briefcase, Clock, CheckCircle,
  X, ChevronRight, Loader2, ArrowLeft, DollarSign,
  Sparkles, Shield, Globe, Linkedin, MessageSquare,
  Filter, Plus, AlertCircle, TrendingUp,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { mentorDiscoveryAPI, mentorRequestAPI } from '@/utils/APIs/mentorshipAPI';
import { API_BASE_URL } from '@/utils/config';

// ── Constants ─────────────────────────────────────────────────────────────────
const BACKEND_URL = API_BASE_URL.replace('/api', '');

const SECTORS = [
  'All', 'Technology', 'Product', 'Design', 'Marketing', 'Sales',
  'Finance', 'Legal', 'Operations', 'AI / ML', 'SaaS',
  'FinTech', 'EdTech', 'Healthcare', 'Web3', 'Other',
];

const AREAS_OF_HELP = [
  'GTM strategy', 'Technical architecture', 'Product prioritization',
  'Hiring', 'Fundraising preparation', 'Vision refinement',
  'Readiness improvement', 'Milestone planning', 'Design review',
  'Marketing strategy', 'Sales process', 'Legal structure',
  'Other',
];

const getAvatarUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

// ── Star rating display ───────────────────────────────────────────────────────
const StarRating = ({ rating, count, size = 14 }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <Star key={n} size={size}
        className={n <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-700'}
        fill={n <= Math.round(rating) ? 'currentColor' : 'none'} />
    ))}
    {count > 0 && (
      <span className="text-gray-400 text-xs ml-1">
        {rating.toFixed(1)} ({count})
      </span>
    )}
  </div>
);

// ── Mentor Card ───────────────────────────────────────────────────────────────
const MentorCard = ({ mentor, onClick, currentUserId }) => {
  const user    = mentor.user;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'M';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      onClick={() => onClick(mentor)}
      className="bg-[#111318] border border-white/[0.07] rounded-2xl p-5 cursor-pointer
                 hover:border-white/[0.15] hover:shadow-xl hover:shadow-black/30
                 transition-all duration-200 flex flex-col gap-4"
    >
      {/* Top — avatar + name + badges */}
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          {user?.profile_picture ? (
            <img src={getAvatarUrl(user.profile_picture)}
                 className="w-12 h-12 rounded-xl object-cover" alt="" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600
                            flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
          )}
          {mentor.is_available && (
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500
                             rounded-full border-2 border-[#111318]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-white font-semibold text-sm truncate">{user?.name || 'Mentor'}</p>
            {user?.reputation_score >= 70 && (
              <Shield size={12} className="text-blue-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-gray-500 text-xs mt-0.5">{mentor.experience_years}y experience</p>
          <div className="mt-1.5">
            <StarRating rating={mentor.average_rating} count={mentor.rating_count} size={12} />
          </div>
        </div>

        {/* Price badge */}
        <div className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0
          ${mentor.is_free
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
          {mentor.is_free ? 'Free' : `$${mentor.session_rate}`}
        </div>
      </div>

      {/* Bio */}
      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{mentor.bio}</p>

      {/* Sectors */}
      <div className="flex flex-wrap gap-1.5">
        {(mentor.sector_expertise || []).slice(0, 3).map(s => (
          <span key={s} className="text-[10px] bg-white/[0.04] text-gray-400
                                   border border-white/[0.06] px-2 py-0.5 rounded-full">
            {s}
          </span>
        ))}
        {(mentor.sector_expertise || []).length > 3 && (
          <span className="text-[10px] text-gray-600">
            +{mentor.sector_expertise.length - 3}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-gray-500 pt-1
                      border-t border-white/[0.05]">
        <span className="flex items-center gap-1">
          <Users size={11} /> {mentor.startups_mentored} mentored
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle size={11} /> {mentor.sessions_completed} sessions
        </span>
        {!mentor.is_free && (
          <span className="flex items-center gap-1">
            <DollarSign size={11} /> ${mentor.session_rate}/session
          </span>
        )}
      </div>
    </motion.div>
  );
};

// ── Request Mentorship Modal ──────────────────────────────────────────────────

// ── Request Mentorship Modal ──────────────────────────────────────
const RequestMentorModal = ({ mentor, onClose, onSuccess }) => {
  const { user, access_token } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading]                     = useState(false);
  const [stripeRedirecting, setStripeRedirecting] = useState(false);
  const [myIdeas, setMyIdeas]       = useState([]);
  const [myStartups, setMyStartups] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [form, setForm] = useState({
  idea_id: '',
  startup_id: '',
  message: '',
  areas_of_help: [],
  otherHelpText: '',   // <-- new
  mentorship_mode: mentor.is_free ? 'free_community' : 'paid_session',
});

  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const { startupsAPI } = await import('@/utils/APIs/startupsAPI');

        // Load user's OWN startups (my_startups = created by me).
        // NOTE: `builder: true` was used before — that filter deliberately
        // EXCLUDES startups you created (it means "member but not creator"),
        // so your own startups were never showing up here. my_startups is
        // the correct filter for "startups I own".
        const startupsRes = await startupsAPI.getAll({ my_startups: true, per_page: 50 });
        const startups = startupsRes?.startups || startupsRes?.data?.startups || [];
        setMyStartups(startups);

        // Load user's ideas (visions) — filtered to only MY ideas via creator_id.
        // Without this, /api/ideas returns every vision on the platform.
        try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(`/api/ideas?per_page=50&creator_id=${user?.id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          const json = await res.json();
          const ideas = json?.data?.ideas || json?.ideas || [];
          setMyIdeas(ideas);
        } catch {
          setMyIdeas([]);
        }

      } catch (e) {
        console.error('Failed to load projects', e);
      } finally {
        setLoadingProjects(false);
      }
    };
    loadProjects();
  }, []);

  const toggleArea = (area) => {
    setForm(f => ({
      ...f,
      areas_of_help: f.areas_of_help.includes(area)
        ? f.areas_of_help.filter(a => a !== area)
        : [...f.areas_of_help, area],
    }));
  };

  const handleSend = async () => {
    if (!form.message.trim()) {
      toast.error('Please add a message to the mentor');
      return;
    }
    setLoading(true);
    try {
      const payload = {
  mentor_id: parseInt(mentor.id),
  message: form.message.trim(),
  areas_of_help: form.areas_of_help.includes('Other') && form.otherHelpText.trim()
    ? [...form.areas_of_help.filter(a => a !== 'Other'), form.otherHelpText.trim()]
    : form.areas_of_help,
  mentorship_mode: form.mentorship_mode,
};
      if (form.idea_id)    payload.idea_id    = parseInt(form.idea_id);
      if (form.startup_id) payload.startup_id = parseInt(form.startup_id);

      const res = await mentorRequestAPI.sendRequest(payload);
      if (res.success) {
        toast.success('Mentorship request sent!');
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.error || 'Failed to send request');
      }
    } catch {
      toast.error('Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!form.message.trim()) {
      toast.error('Please add a message to the mentor');
      return;
    }
    setStripeRedirecting(true);
    try {
      const rateCents = Math.round((mentor.session_rate || 0) * 100);
      const res = await axios.post(
        `${API_BASE_URL}/payments/create-checkout-session`,
        {
          id: `mentorship-${mentor.id}`,
          title: `Mentorship session with ${mentor.user?.name}`,
          description: form.message.trim(),
          price: rateCents,
          currency: 'usd',
          user_id: user?.id,
          type: 'mentorship',
          option: JSON.stringify({
            mentor_id: mentor.id,
            idea_id: form.idea_id || null,
            startup_id: form.startup_id || null,
            areas_of_help: form.areas_of_help,
            mentorship_mode: form.mentorship_mode,
          }),
        },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Could not start checkout');
      }
    } catch {
      toast.error('Stripe checkout failed. Please try again.');
    } finally {
      setStripeRedirecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center
                 justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0f1116] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl
                   w-full sm:max-w-lg max-h-[92vh] overflow-y-auto"
      >
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>
        <div className="flex items-center justify-between p-5 pb-3">
          <div>
            <h2 className="text-white font-bold">Request Mentorship</h2>
            <p className="text-gray-500 text-xs mt-0.5">from {mentor.user?.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-4">
          {/* Mentor mini card */}
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600
                            flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {mentor.user?.name?.charAt(0) || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{mentor.user?.name}</p>
              <p className="text-gray-500 text-xs">{(mentor.sector_expertise || []).slice(0, 2).join(' · ')}</p>
            </div>
            <div className={`text-xs px-2 py-0.5 rounded-full font-medium
              ${mentor.is_free ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
              {mentor.is_free ? 'Free' : `$${mentor.session_rate}`}
            </div>
          </div>

          {/* Project selector */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">
              Which project do you need help with? <span className="text-gray-600">(optional)</span>
            </label>
            {loadingProjects ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                <Loader2 size={14} className="animate-spin" /> Loading your projects...
              </div>
            ) : (
              <div className="space-y-2">
                {myIdeas.length > 0 && (
                  <div>
                    <p className="text-[11px] text-gray-600 mb-1">Vision</p>
                    <select
                      value={form.idea_id}
                      onChange={e => setForm(f => ({ ...f, idea_id: e.target.value, startup_id: '' }))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5
                                 text-white text-sm focus:outline-none focus:border-blue-500/50 appearance-none"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Select a Vision</option>
                      {myIdeas.map(idea => (
                        <option
                          key={idea.id}
                          value={idea.id}
                          style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}
                        >
                          {idea.title} — {Math.round(idea.readinessScore || idea.readiness_score || 0)}% ready
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {myStartups.length > 0 && (
                  <div>
                    <p className="text-[11px] text-gray-600 mb-1">Startup</p>
                    <select
                      value={form.startup_id}
                      onChange={e => setForm(f => ({ ...f, startup_id: e.target.value, idea_id: '' }))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5
                                 text-white text-sm focus:outline-none focus:border-blue-500/50 appearance-none"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Select a Startup</option>
                      {myStartups.map(s => (
                        <option
                          key={s.id}
                          value={s.id}
                          style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}
                        >
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {myIdeas.length === 0 && myStartups.length === 0 && (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-xs text-gray-500 space-y-2">
                    <p>You don't have any visions or startups yet — that's fine, this is optional. You can still send your request below.</p>
                    <button
                      type="button"
                      onClick={() => { onClose(); navigate('/ideation'); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20
                                 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
                    >
                      <Plus size={12} /> Create a Vision
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Areas of help */}
          <div className="flex flex-wrap gap-2">
  {AREAS_OF_HELP.map(area => (
    <button key={area} onClick={() => toggleArea(area)}
      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors
        ${form.areas_of_help.includes(area)
          ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
          : 'bg-white/[0.03] text-gray-500 border-white/[0.06] hover:border-white/[0.12]'}`}>
      {area}
    </button>
  ))}
</div>

{/* Show text input when "Other" is selected */}
{form.areas_of_help.includes('Other') && (
  <div className="mt-2">
    <input
      type="text"
      placeholder="Describe your specific need..."
      value={form.otherHelpText || ''}
      onChange={(e) => setForm(f => ({ ...f, otherHelpText: e.target.value }))}
      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5
                 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
    />
  </div>
)}

          {/* Message */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Message to mentor *</label>
            <textarea rows={4} value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Describe your challenge and what specific guidance you're looking for..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5
                         text-white text-sm focus:outline-none focus:border-blue-500/50
                         placeholder-gray-600 resize-none" />
          </div>

          {/* Paid session note */}
          {!mentor.is_free && (
            <div className="bg-blue-500/[0.07] border border-blue-500/[0.15] rounded-xl p-3.5
                            flex items-start gap-2.5 text-xs text-blue-300/80">
              <DollarSign size={14} className="flex-shrink-0 mt-0.5" />
              <span>
                Paid session at <strong className="text-blue-300">${mentor.session_rate}</strong>.
                Choose to pay now via card, or have it deducted from your Balance after the session completes.
              </span>
            </div>
          )}

          {/* CTA — free mentor: single send button; paid mentor: two payment paths */}
          {mentor.is_free ? (
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleSend}
              disabled={loading || loadingProjects}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white
                         font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Sending...</>
                : <><MessageSquare size={15} /> Send Request</>
              }
            </motion.button>
          ) : (
            <div className="space-y-2">
              {/* Option 1: send request — Balance deducted after session */}
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleSend}
                disabled={loading || stripeRedirecting || loadingProjects}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white
                           font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Sending...</>
                  : <><MessageSquare size={15} /> Send Request — Pay from Balance after session</>
                }
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-white/[0.05]" />
                <span className="text-gray-600 text-[10px] uppercase tracking-wider">or pay now</span>
                <div className="flex-1 h-px bg-white/[0.05]" />
              </div>

              {/* Option 2: Stripe upfront card payment */}
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleStripeCheckout}
                disabled={loading || stripeRedirecting || loadingProjects}
                className="w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10]
                           disabled:opacity-50 text-white font-semibold py-3
                           rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                {stripeRedirecting
                  ? <><Loader2 size={14} className="animate-spin" /> Redirecting to Stripe...</>
                  : <><DollarSign size={14} /> Pay ${mentor.session_rate} now with Card (Stripe)</>
                }
              </motion.button>

              <p className="text-[10px] text-gray-600 text-center">
                Card: payment captured upfront · Balance: charged only after session completes
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};


// ── Mentor Profile Modal ──────────────────────────────────────────────────────
const MentorProfileModal = ({ mentor, onClose, onRequest, onDelete, currentUserId }) => {
  const user     = mentor.user;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'M';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center
                   justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#0f1116] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl
                     w-full sm:max-w-xl max-h-[92vh] overflow-y-auto"
        >
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between p-5 pb-3">
            <div className="flex items-center gap-3">
              {user?.profile_picture ? (
                <img src={getAvatarUrl(user.profile_picture)}
                     className="w-14 h-14 rounded-xl object-cover" alt="" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600
                                flex items-center justify-center text-white font-bold text-lg">
                  {initials}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-white font-bold">{user?.name}</h2>
                  {user?.reputation_score >= 70 && (
                    <Shield size={14} className="text-blue-400" />
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-0.5">{mentor.experience_years} years experience</p>
                <StarRating rating={mentor.average_rating} count={mentor.rating_count} />
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          <div className="px-5 pb-6 space-y-5">
            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border
                ${mentor.is_available
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                {mentor.is_available ? '● Available' : '○ Unavailable'}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border
                ${mentor.is_free
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                {mentor.is_free ? 'Free Mentorship' : `$${mentor.session_rate} / session`}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-gray-400 border border-white/[0.06]">
                {mentor.mentorship_style?.replace('_', ' ')}
              </span>
            </div>

            {/* Bio */}
            <p className="text-gray-300 text-sm leading-relaxed">{mentor.bio}</p>

            {/* Sectors */}
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Expertise</p>
              <div className="flex flex-wrap gap-2">
                {(mentor.sector_expertise || []).map(s => (
                  <span key={s} className="text-xs bg-blue-500/10 text-blue-400
                                           border border-blue-500/20 px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Mentored', value: mentor.startups_mentored, icon: Users },
                { label: 'Sessions', value: mentor.sessions_completed, icon: CheckCircle },
                { label: 'Success rate', value: `${mentor.milestone_success_rate || 0}%`, icon: TrendingUp },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-center">
                  <Icon size={16} className="text-gray-500 mx-auto mb-1" />
                  <p className="text-white font-bold text-lg">{value}</p>
                  <p className="text-gray-500 text-[10px]">{label}</p>
                </div>
              ))}
            </div>

            {/* Links */}
            {(mentor.linkedin_url || mentor.website_url) && (
              <div className="flex gap-3">
                {mentor.linkedin_url && (
                  <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer"
                     onClick={e => e.stopPropagation()}
                     className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    <Linkedin size={13} /> LinkedIn
                  </a>
                )}
                {mentor.website_url && (
                  <a href={mentor.website_url} target="_blank" rel="noopener noreferrer"
                     onClick={e => e.stopPropagation()}
                     className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-300 transition-colors">
                    <Globe size={13} /> Website
                  </a>
                )}
              </div>
            )}

            {/* Availability */}
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3.5 flex items-center gap-3">
              <Clock size={15} className="text-gray-500 flex-shrink-0" />
              <p className="text-gray-400 text-sm">
                Available ~{mentor.available_hours_per_week} hours/week
              </p>
            </div>

            {/* Paid session pricing breakdown */}
            {!mentor.is_free && (
              <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Session rate</span>
                  <span className="text-white font-bold">${mentor.session_rate}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Platform fee (10%)</span>
                  <span>${mentor.platform_fee?.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/[0.05] pt-2 flex justify-between text-sm">
                  <span className="text-gray-500">Mentor receives</span>
                  <span className="text-emerald-400 font-medium">${mentor.mentor_receives?.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-600 pt-1">
                  Payment is deducted from your Balance only after the session is completed.
                </p>
              </div>
            )}

            {/* CTA */}
            {String(mentor.user_id) === String(currentUserId) ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => onDelete(mentor)}
                className="w-full bg-red-600/20 hover:bg-red-600/40 border border-red-500/30
                           text-red-300 font-semibold py-3.5 rounded-xl transition-colors
                           flex items-center justify-center gap-2"
              >
                Delete My Listing
              </motion.button>
            ) : mentor.is_available ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => onRequest(mentor)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5
                           rounded-xl transition-colors flex items-center justify-center gap-2
                           shadow-lg shadow-blue-600/20"
              >
                <MessageSquare size={16} />
                Request Mentorship
              </motion.button>
            ) : (
              <div className="w-full bg-white/[0.04] border border-white/[0.08] text-gray-500
                              font-medium py-3.5 rounded-xl text-center text-sm">
                Currently unavailable
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Become a Mentor Modal ─────────────────────────────────────────────────────
const BecomeMentorModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bio: '',
    sector_expertise: [],
    experience_years: '',
    mentorship_style: 'conversational',
    linkedin_url: '',
    is_free: true,
    session_rate: '',
    available_hours_per_week: 2,
  });

  const STYLES = [
    { value: 'structured', label: 'Structured' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'hands_on', label: 'Hands-on' },
    { value: 'advisory', label: 'Advisory' },
    { value: 'accountability', label: 'Accountability' },
  ];

  const SECTORS_LIST = [
    'Technology', 'Product', 'Design', 'Marketing', 'Sales',
    'Finance', 'Legal', 'Operations', 'AI / ML', 'SaaS',
    'FinTech', 'EdTech', 'Healthcare', 'Web3', 'Other',
  ];

  const toggleSector = (s) => {
    setForm(f => ({
      ...f,
      sector_expertise: f.sector_expertise.includes(s)
        ? f.sector_expertise.filter(x => x !== s)
        : [...f.sector_expertise, s],
    }));
  };

  const handleSubmit = async () => {
    if (!form.bio.trim()) { toast.error('Bio is required'); return; }
    if (!form.sector_expertise.length) { toast.error('Select at least one sector'); return; }
    if (!form.experience_years) { toast.error('Enter years of experience'); return; }

    setLoading(true);
    try {
      const { mentorProfileAPI } = await import('@/utils/APIs/mentorshipAPI');
      const res = await mentorProfileAPI.register({
        ...form,
        experience_years: parseInt(form.experience_years),
        session_rate: parseFloat(form.session_rate) || 0,
      });
      if (res.success) {
        toast.success('Mentor profile created!');
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.error || 'Failed to register');
      }
    } catch {
      toast.error('Failed to register as mentor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center
                 justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0f1116] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl
                   w-full sm:max-w-lg max-h-[92vh] overflow-y-auto"
      >
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-white font-bold">Become a Mentor</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="px-5 pb-6 space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Bio *</label>
            <textarea rows={3} value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Describe your background, expertise, and what kind of founders you can help..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5
                         text-white text-sm focus:outline-none focus:border-blue-500/50
                         placeholder-gray-600 resize-none" />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Sector expertise *</label>
            <div className="flex flex-wrap gap-2">
              {SECTORS_LIST.map(s => (
                <button key={s} onClick={() => toggleSector(s)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors
                    ${form.sector_expertise.includes(s)
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                      : 'bg-white/[0.03] text-gray-500 border-white/[0.06] hover:border-white/[0.12]'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Years of experience *</label>
              <input type="number" min="0" value={form.experience_years}
                onChange={e => setForm(f => ({ ...f, experience_years: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5
                           text-white text-sm focus:outline-none focus:border-blue-500/50"
                placeholder="e.g. 5" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Hours/week available</label>
              <input type="number" min="1" max="40"
                value={form.available_hours_per_week}
                onChange={e => setForm(f => ({ ...f, available_hours_per_week: parseInt(e.target.value) }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5
                           text-white text-sm focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Mentorship style</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map(s => (
                <button key={s.value} onClick={() => setForm(f => ({ ...f, mentorship_style: s.value }))}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors
                    ${form.mentorship_style === s.value
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                      : 'bg-white/[0.03] text-gray-500 border-white/[0.06] hover:border-white/[0.12]'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">LinkedIn URL</label>
            <input value={form.linkedin_url}
              onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))}
              placeholder="https://linkedin.com/in/..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5
                         text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600" />
          </div>

          {/* Pricing */}
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white text-sm font-medium">Pricing</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setForm(f => ({ ...f, is_free: true }))}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors
                    ${form.is_free ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/[0.04] text-gray-500 border border-white/[0.06]'}`}>
                  Free
                </button>
                <button onClick={() => setForm(f => ({ ...f, is_free: false }))}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors
                    ${!form.is_free ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-white/[0.04] text-gray-500 border border-white/[0.06]'}`}>
                  Paid
                </button>
              </div>
            </div>
            {!form.is_free && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Session rate (USD)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="number" min="1" step="1" value={form.session_rate}
                    onChange={e => setForm(f => ({ ...f, session_rate: e.target.value }))}
                    placeholder="50"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2.5
                               text-white text-sm focus:outline-none focus:border-blue-500/50" />
                </div>
                <p className="text-xs text-gray-600 mt-1">Platform takes 10%. You receive 90%.</p>
              </div>
            )}
          </div>

          <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white
                       font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            Create Mentor Profile
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const MentorDiscoveryPage = () => {
  const { user } = useSelector(state => state.auth);
  const [mentors, setMentors]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestMentor, setRequestMentor]   = useState(null);
  const [showBecome, setShowBecome] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });

  const [filters, setFilters] = useState({
  sector: '', is_free: '', available: '', sort: 'rating', search: '',
});

  const loadMentors = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, per_page: 18 };
      if (filters.search)    params.search    = filters.search;
      if (filters.sector && filters.sector !== 'All') params.sector = filters.sector;
      if (filters.is_free)   params.is_free   = filters.is_free;
      if (filters.available) params.available = filters.available;
      if (filters.sort)      params.sort      = filters.sort;

      const res = await mentorDiscoveryAPI.getMentors(params);
      if (res.success) {
        setMentors(res.mentors);
        setPagination(res.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadMentors(1); }, [loadMentors]);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0c10]/90 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-white">Find a Mentor</h1>
              <p className="text-gray-500 text-xs mt-0.5 hidden sm:block">
                Get expert guidance on your vision or startup
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowBecome(true)}
              className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.10] text-gray-300
                         border border-white/[0.08] px-3 py-2 rounded-xl text-xs transition-colors"
            >
              <Plus size={13} /> Become a Mentor
            </motion.button>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="Search mentors by name or expertise..."
              className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl
                         pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600
                         focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide pb-0.5">
            {SECTORS.map(s => (
              <button key={s}
                onClick={() => setFilters(f => ({ ...f, sector: s === 'All' ? '' : s }))}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                  ${(s === 'All' && !filters.sector) || filters.sector === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] border border-white/[0.06]'}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Sort + filter row */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 ml-auto">
              {[
                { value: '', label: 'All' },
                { value: 'true', label: 'Free only' },
              ].map(opt => (
                <button key={opt.value}
                  onClick={() => setFilters(f => ({ ...f, is_free: opt.value }))}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors
                    ${filters.is_free === opt.value
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-500 hover:text-gray-300'}`}>
                  {opt.label}
                </button>
              ))}
              <select value={filters.sort}
                onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5
                           text-gray-400 text-xs focus:outline-none appearance-none">
                <option value="rating">Top Rated</option>
                <option value="sessions">Most Sessions</option>
                <option value="experience">Most Experienced</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mentor grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {!loading && (
          <p className="text-gray-600 text-sm mb-4">
            {pagination.total} mentor{pagination.total !== 1 ? 's' : ''} found
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-[#111318] border border-white/[0.05] rounded-2xl h-56 animate-pulse" />
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-white/[0.03] rounded-3xl flex items-center justify-center mb-4">
              <Users size={36} className="text-gray-600" />
            </div>
            <p className="text-white font-semibold text-lg">No mentors found</p>
            <p className="text-gray-500 text-sm mt-2 max-w-xs">
              Try adjusting your filters or be the first to join as a mentor.
            </p>
            <button onClick={() => setShowBecome(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
              <Plus size={14} /> Become a Mentor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors.map(m => (
              <MentorCard key={m.id} mentor={m} onClick={setSelectedMentor} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} onClick={() => loadMentors(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors
                  ${pagination.page === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/[0.04] text-gray-500 hover:bg-white/[0.08] border border-white/[0.06]'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {selectedMentor && !requestMentor && (
          <MentorProfileModal
            mentor={selectedMentor}
            onClose={() => setSelectedMentor(null)}
            onRequest={(m) => { setSelectedMentor(null); setRequestMentor(m); }}
            onDelete={async (m) => {
              if (!window.confirm('Delete your mentor listing? This cannot be undone.')) return;
              try {
                const token = localStorage.getItem('access_token');
                const res = await fetch(`/api/mentorship/mentors/${m.id}`, {
                  method: 'DELETE',
                  headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (res.ok) {
                  toast.success('Mentor listing deleted');
                  setMentors(prev => prev.filter(x => x.id !== m.id));
                  setSelectedMentor(null);
                } else { toast.error('Failed to delete listing'); }
              } catch { toast.error('Failed to delete listing'); }
            }}
            currentUserId={user?.id}
          />
        )}
        {requestMentor && (
          <RequestMentorModal
            mentor={requestMentor}
            onClose={() => setRequestMentor(null)}
            onSuccess={() => loadMentors(1)}
          />
        )}
        {showBecome && (
          <BecomeMentorModal
            onClose={() => setShowBecome(false)}
            onSuccess={() => loadMentors(1)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentorDiscoveryPage;
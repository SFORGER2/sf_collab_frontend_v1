// src/components/pages/meet/CreateMeetingModal.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X, Video, Users, Calendar, Clock, Mic, MicOff,
  VideoOff, ChevronDown, Search, Check
} from "lucide-react";
import { meetAPI } from "@/utils/APIs/meetAPI";
import { usersAPI } from "@/utils/APIs/userAPI";
import { useSelector } from "react-redux";

const MEETING_TYPES = [
  { value: "startup_team",     label: "Team Sync",        desc: "Weekly syncs, milestone planning, execution updates" },
  { value: "mentor_session",   label: "Mentor Session",   desc: "Feedback, roadmap, GTM review" },
  { value: "milestone_review", label: "Milestone Review", desc: "Proof review, QA, launch check-ins" },
  { value: "customer_call",    label: "Customer Call",    desc: "Discovery, sales, onboarding" },
  { value: "investor_call",    label: "Investor Call",    desc: "Fundraising, board discussions" },
  { value: "vision_review",    label: "Vision Review",    desc: "Founder idea refinement" },
  { value: "internal_org",     label: "Internal Org",     desc: "Hiring, finance, legal review" },
  { value: "dispute_review",   label: "Dispute Review",   desc: "Evidence-based sensitive review" },
];

export default function CreateMeetingModal({ startupId, onClose, onCreated }) {
  const { user } = useSelector(s => s.auth);
  const [step, setStep]       = useState(1); // 1 = basics, 2 = participants, 3 = settings
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [form, setForm] = useState({
    title:               "",
    meeting_type:        "startup_team",
    scheduled_start_at:  "",
    scheduled_end_at:    "",
    timezone:            Intl.DateTimeFormat().resolvedOptions().timeZone,
    startup_id:          startupId || null,
    linked_milestone_ids:[],
    recording_enabled:   false,
    transcription_enabled: false,
    live_notes_enabled:  true,
    visibility_scope:    "invited_only",
  });

  const [participantSearch, setParticipantSearch] = useState("");
  const [searchResults, setSearchResults]         = useState([]);
  const [invitedUsers, setInvitedUsers]           = useState([]);

  useEffect(() => {
    if (participantSearch.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await usersAPI.search?.(participantSearch) ||
                    usersAPI.getAll?.({ q: participantSearch });
        setSearchResults((res?.data?.users || res?.data || []).slice(0, 6));
      } catch { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [participantSearch]);

  function update(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    if (!form.title.trim()) { setError("Meeting title is required"); return; }
    if (!form.scheduled_start_at) { setError("Please set a start time"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await meetAPI.createMeeting(form);
      const meeting = res.data?.meeting || res.data;
      // Invite selected participants
      for (const u of invitedUsers) {
        try { await meetAPI.inviteParticipant(meeting.id, { user_id: u.id }); } catch {}
      }
      onCreated?.(meeting);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to create meeting");
    } finally {
      setLoading(false);
    }
  }

  const selectedType = MEETING_TYPES.find(t => t.value === form.meeting_type);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="font-bold text-white text-lg">New Meeting</h2>
            <div className="flex gap-2 mt-1.5">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1 w-8 rounded-full transition-all
                  ${s <= step ? "bg-blue-500" : "bg-zinc-800"}`} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-none">

          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                  Meeting Title *
                </label>
                <input
                  value={form.title}
                  onChange={e => update("title", e.target.value)}
                  placeholder="e.g. Q2 Milestone Review"
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white
                    placeholder-zinc-600 focus:outline-none focus:border-zinc-600 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                  Meeting Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MEETING_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => update("meeting_type", t.value)}
                      className={`text-left p-3 rounded-xl border text-sm transition-all
                        ${form.meeting_type === t.value
                          ? "bg-blue-600/20 border-blue-500/60 text-white"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                    >
                      <div className="font-medium text-xs">{t.label}</div>
                      <div className="text-[10px] mt-0.5 opacity-60 truncate">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                    Start *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.scheduled_start_at}
                    onChange={e => update("scheduled_start_at", e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white
                      text-sm focus:outline-none focus:border-zinc-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                    End
                  </label>
                  <input
                    type="datetime-local"
                    value={form.scheduled_end_at}
                    onChange={e => update("scheduled_end_at", e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white
                      text-sm focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Participants */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                  Invite Participants
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    value={participantSearch}
                    onChange={e => setParticipantSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl
                      text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    {searchResults.map(u => {
                      const invited = invitedUsers.some(i => i.id === u.id);
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            if (invited) {
                              setInvitedUsers(prev => prev.filter(i => i.id !== u.id));
                            } else {
                              setInvitedUsers(prev => [...prev, u]);
                            }
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 flex-shrink-0">
                            {u.first_name?.[0]}{u.last_name?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white font-medium truncate">
                              {u.first_name} {u.last_name}
                            </div>
                            <div className="text-xs text-zinc-500 truncate">{u.email}</div>
                          </div>
                          {invited && <Check size={16} className="text-blue-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {invitedUsers.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                    Invited ({invitedUsers.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {invitedUsers.map(u => (
                      <div key={u.id} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800
                        rounded-full px-3 py-1.5 text-sm text-zinc-300">
                        {u.first_name} {u.last_name}
                        <button onClick={() => setInvitedUsers(prev => prev.filter(i => i.id !== u.id))}>
                          <X size={12} className="text-zinc-500 hover:text-zinc-300" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                  Visibility
                </label>
                <select
                  value={form.visibility_scope}
                  onChange={e => update("visibility_scope", e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white
                    text-sm focus:outline-none focus:border-zinc-600"
                >
                  <option value="invited_only">Invited participants only</option>
                  <option value="startup_members">All startup members</option>
                  <option value="private">Private (owner only)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Settings */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">Configure recording and features for this meeting.</p>

              {[
                { key: "recording_enabled",     icon: Video,  label: "Enable Recording",     desc: "Cloud recording via Daily.co" },
                { key: "transcription_enabled",  icon: Mic,    label: "Enable Transcription",  desc: "Auto-transcribe with Whisper AI" },
                { key: "live_notes_enabled",     icon: null,   label: "Live Notes",            desc: "Collaborative real-time notes" },
              ].map(({ key, icon: Icon, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-zinc-900
                  border border-zinc-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    {Icon && <Icon size={18} className="text-zinc-400" />}
                    <div>
                      <div className="text-sm font-medium text-white">{label}</div>
                      <div className="text-xs text-zinc-500">{desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => update(key, !form[key])}
                    className={`w-11 h-6 rounded-full transition-colors relative
                      ${form[key] ? "bg-blue-600" : "bg-zinc-700"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all
                      ${form[key] ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
              ))}

              {/* Summary card */}
              <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm font-semibold text-blue-300 mb-2">Meeting Summary</p>
                <div className="space-y-1 text-xs text-zinc-400">
                  <div>📋 <span className="text-white">{form.title || "Untitled"}</span></div>
                  <div>🎯 <span className="text-white">{selectedType?.label}</span></div>
                  <div>📅 <span className="text-white">
                    {form.scheduled_start_at
                      ? new Date(form.scheduled_start_at).toLocaleString()
                      : "No time set"}
                  </span></div>
                  <div>👥 <span className="text-white">{invitedUsers.length + 1} participant(s)</span></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
          <button
            onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <button
            onClick={step < 3 ? () => setStep(s => s + 1) : handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500
              disabled:opacity-50 rounded-xl text-sm font-semibold text-white transition-colors"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {step < 3 ? "Continue" : "Create Meeting"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
// src/components/pages/startupWorkspace/HiringPage.jsx
//
// "Hiring" module (spec section 10). Backed by the existing recruitment
// system (app/routes/recruitment_routes.py) — jobs, applicants, a
// stage pipeline, outreach logs, and referrals. This page surfaces:
//   - the startup's open roles
//   - a Kanban-style pipeline board per role
//   - quick applicant intake + stage moves
//   - per-applicant outreach history/logging
//   - referrals for the selected role

import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  UserPlus2, Plus, X, Loader2, MapPin, Briefcase, Mail, Phone,
  Link2, Star, ChevronRight, Users, MessageSquare, Send, Gift,
} from 'lucide-react';
import { recruitmentAPI } from '@/utils/APIs/recruitmentAPI';

const STAGE_ORDER = [
  'sourced', 'contacted', 'responded', 'screening',
  'interviewing', 'offer_sent', 'hired', 'rejected', 'withdrawn',
];

const STAGE_LABELS = {
  sourced: 'Sourced',
  contacted: 'Contacted',
  responded: 'Responded',
  screening: 'Screening',
  interviewing: 'Interviewing',
  offer_sent: 'Offer Sent',
  hired: 'Hired',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

const CHANNEL_OPTIONS = ['email', 'linkedin', 'twitter', 'phone', 'referral', 'other'];

// The board is a lot to show at once — default to the "active" stages,
// with rejected/withdrawn tucked away unless toggled on.
const DEFAULT_VISIBLE_STAGES = STAGE_ORDER.filter(
  (s) => s !== 'rejected' && s !== 'withdrawn'
);

export default function HiringPage() {
  const { startupId } = useOutletContext();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [board, setBoard] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [showNewJob, setShowNewJob] = useState(false);
  const [showAddApplicant, setShowAddApplicant] = useState(false);
  const [showArchivedStages, setShowArchivedStages] = useState(false);
  const [activeApplicant, setActiveApplicant] = useState(null);
  const [showReferrals, setShowReferrals] = useState(false);

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const data = await recruitmentAPI.listJobs({ startupId, isOpen: true });
      setJobs(data || []);
      if (data?.length && !selectedJobId) setSelectedJobId(data[0].id);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      toast.error('Could not load open roles');
    } finally {
      setLoadingJobs(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startupId]);

  const loadBoard = useCallback(async (jobId) => {
    if (!jobId) return;
    setLoadingBoard(true);
    try {
      const data = await recruitmentAPI.getPipelineBoard(jobId);
      setBoard(data);
    } catch (err) {
      console.error('Failed to load pipeline board:', err);
      toast.error('Could not load the pipeline for this role');
    } finally {
      setLoadingBoard(false);
    }
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);
  useEffect(() => { if (selectedJobId) loadBoard(selectedJobId); }, [selectedJobId, loadBoard]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const visibleStages = showArchivedStages ? STAGE_ORDER : DEFAULT_VISIBLE_STAGES;
  const totalApplicants = board
    ? Object.values(board).reduce((sum, list) => sum + list.length, 0)
    : 0;

  const handleMoveStage = async (applicant, newStage) => {
    try {
      const result = await recruitmentAPI.moveStage(applicant.id, newStage);
      toast.success(`Moved ${applicant.name} to ${STAGE_LABELS[newStage]}`);
      if (result?.memberAdded) {
        toast.success(`${applicant.name} was added to the startup team`);
      } else if (newStage === 'hired' && result?.memberAddError) {
        toast.error(`Hired, but couldn't add to team: ${result.memberAddError}`);
      } else if (newStage === 'hired' && !applicant.userId) {
        toast.info(`${applicant.name} isn't linked to a platform account, so they weren't added as a team member automatically.`);
      }
      loadBoard(selectedJobId);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to move applicant');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus2 className="w-5 h-5 text-blue-400" /> Hiring
          </h1>
          <p className="text-gray-500 text-sm">Open roles, applicant pipeline, outreach & referrals.</p>
        </div>
        <button
          onClick={() => setShowNewJob(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500
                     text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Job list */}
        <div className="space-y-2">
          {loadingJobs ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <Briefcase className="w-5 h-5 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No open roles yet.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-colors ${
                  selectedJobId === job.id
                    ? 'bg-blue-600/15 border-blue-500/40'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <p className="text-white text-sm font-medium truncate">{job.title}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  {job.department && <span>{job.department}</span>}
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-1.5 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {job.applicantCount} applicant{job.applicantCount === 1 ? '' : 's'}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Pipeline board */}
        <div>
          {!selectedJob ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center text-gray-500 text-sm">
              Create a role to start building your pipeline.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-white font-semibold">{selectedJob.title}</h2>
                  <p className="text-gray-500 text-xs">{totalApplicants} in pipeline</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowArchivedStages((v) => !v)}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showArchivedStages ? 'Hide' : 'Show'} rejected/withdrawn
                  </button>
                  <button
                    onClick={() => setShowReferrals(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10
                               border border-white/10 text-gray-300 text-xs transition-colors"
                  >
                    <Gift className="w-3.5 h-3.5" /> Referrals
                  </button>
                  <button
                    onClick={() => setShowAddApplicant(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10
                               border border-white/10 text-gray-300 text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Applicant
                  </button>
                </div>
              </div>

              {loadingBoard ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {visibleStages.map((stage) => (
                    <div key={stage} className="w-64 flex-shrink-0">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          {STAGE_LABELS[stage]}
                        </p>
                        <span className="text-xs text-gray-600">{board?.[stage]?.length ?? 0}</span>
                      </div>
                      <div className="space-y-2 min-h-[60px]">
                        {(board?.[stage] || []).map((applicant) => (
                          <ApplicantCard
                            key={applicant.id}
                            applicant={applicant}
                            onMoveStage={(newStage) => handleMoveStage(applicant, newStage)}
                            onOpenDetail={() => setActiveApplicant(applicant)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showNewJob && (
          <NewJobModal
            startupId={startupId}
            onClose={() => setShowNewJob(false)}
            onCreated={(job) => {
              setShowNewJob(false);
              setJobs((prev) => [job, ...prev]);
              setSelectedJobId(job.id);
            }}
          />
        )}
        {showAddApplicant && selectedJob && (
          <AddApplicantModal
            jobId={selectedJob.id}
            onClose={() => setShowAddApplicant(false)}
            onAdded={() => {
              setShowAddApplicant(false);
              loadBoard(selectedJobId);
              loadJobs();
            }}
          />
        )}
        {activeApplicant && (
          <ApplicantDetailModal
            applicant={activeApplicant}
            onClose={() => setActiveApplicant(null)}
          />
        )}
        {showReferrals && selectedJob && (
          <ReferralsModal
            jobId={selectedJob.id}
            onClose={() => setShowReferrals(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ApplicantCard({ applicant, onMoveStage, onOpenDetail }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3 hover:border-white/20 transition-colors">
      <button onClick={onOpenDetail} className="text-left w-full">
        <p className="text-white text-sm font-medium truncate">{applicant.name}</p>
        {applicant.email && (
          <p className="text-gray-500 text-xs flex items-center gap-1 mt-1 truncate">
            <Mail className="w-3 h-3 flex-shrink-0" /> {applicant.email}
          </p>
        )}
        {applicant.score != null && (
          <p className="text-amber-400 text-xs flex items-center gap-1 mt-1">
            <Star className="w-3 h-3" /> {applicant.score}
          </p>
        )}
      </button>
      <div className="flex items-center gap-1.5 mt-2">
        {applicant.linkedin && (
          <a href={applicant.linkedin} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-400">
            <Link2 className="w-3.5 h-3.5" />
          </a>
        )}
        {applicant.phone && (
          <span className="text-gray-500 flex items-center gap-1 text-[11px]">
            <Phone className="w-3 h-3" /> {applicant.phone}
          </span>
        )}
      </div>
      <select
        value={applicant.stage}
        onChange={(e) => onMoveStage(e.target.value)}
        className="w-full mt-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5
                   text-gray-300 text-xs focus:outline-none focus:border-blue-500/50"
      >
        {STAGE_ORDER.map((s) => (
          <option key={s} value={s}>{STAGE_LABELS[s]}</option>
        ))}
      </select>
    </div>
  );
}

function NewJobModal({ startupId, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', department: '', location: '', description: '', isRemote: false });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Role title is required');
      return;
    }
    setSaving(true);
    try {
      const job = await recruitmentAPI.createJob({ startupId, ...form });
      toast.success('Role created');
      onCreated(job);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create role');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="New Role" icon={Briefcase} onClose={onClose}>
      <ModalField label="Title">
        <input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Founding Engineer"
          className="modal-input"
        />
      </ModalField>
      <div className="grid grid-cols-2 gap-3">
        <ModalField label="Department">
          <input
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            className="modal-input"
          />
        </ModalField>
        <ModalField label="Location">
          <input
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="modal-input"
          />
        </ModalField>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-400">
        <input
          type="checkbox"
          checked={form.isRemote}
          onChange={(e) => setForm((f) => ({ ...f, isRemote: e.target.checked }))}
        />
        Remote
      </label>
      <ModalField label="Description">
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="modal-input resize-none"
        />
      </ModalField>
      <ModalSubmit onClick={handleSubmit} saving={saving} label="Create Role" />
    </ModalShell>
  );
}

function AddApplicantModal({ jobId, onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', linkedin: '', resumeUrl: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      await recruitmentAPI.addApplicant(jobId, form);
      toast.success('Applicant added');
      onAdded();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to add applicant');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Add Applicant" icon={UserPlus2} onClose={onClose}>
      <ModalField label="Name">
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="modal-input"
        />
      </ModalField>
      <div className="grid grid-cols-2 gap-3">
        <ModalField label="Email">
          <input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="modal-input"
          />
        </ModalField>
        <ModalField label="Phone">
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="modal-input"
          />
        </ModalField>
      </div>
      <ModalField label="LinkedIn">
        <input
          value={form.linkedin}
          onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))}
          className="modal-input"
        />
      </ModalField>
      <ModalField label="Resume URL">
        <input
          value={form.resumeUrl}
          onChange={(e) => setForm((f) => ({ ...f, resumeUrl: e.target.value }))}
          className="modal-input"
        />
      </ModalField>
      <ModalField label="Notes">
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className="modal-input resize-none"
        />
      </ModalField>
      <ModalSubmit onClick={handleSubmit} saving={saving} label="Add Applicant" />
    </ModalShell>
  );
}

// ── Applicant detail: outreach history + log new outreach ─────────────────

function ApplicantDetailModal({ applicant, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ channel: 'email', subject: '', body: '', followUpAt: '' });
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recruitmentAPI.listOutreach(applicant.id);
      setLogs(data || []);
    } catch (err) {
      toast.error('Could not load outreach history');
    } finally {
      setLoading(false);
    }
  }, [applicant.id]);

  useEffect(() => { load(); }, [load]);

  const handleLog = async () => {
    setSending(true);
    try {
      await recruitmentAPI.logOutreach(applicant.id, {
        channel: form.channel,
        subject: form.subject || undefined,
        body: form.body || undefined,
        followUpAt: form.followUpAt ? new Date(form.followUpAt).toISOString() : undefined,
      });
      toast.success('Outreach logged');
      setForm({ channel: 'email', subject: '', body: '', followUpAt: '' });
      load();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to log outreach');
    } finally {
      setSending(false);
    }
  };

  return (
    <ModalShell title={applicant.name} icon={MessageSquare} onClose={onClose} wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-400 mb-2">
        {applicant.email && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {applicant.email}</span>}
        {applicant.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {applicant.phone}</span>}
      </div>
      {applicant.notes && (
        <p className="text-gray-400 text-xs bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">{applicant.notes}</p>
      )}

      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mt-2">Outreach history</p>
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 text-blue-400 animate-spin" /></div>
      ) : logs.length === 0 ? (
        <p className="text-gray-500 text-sm">No outreach logged yet.</p>
      ) : (
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-blue-300 capitalize">{log.channel}</span>
                <span className="text-[11px] text-gray-500">{new Date(log.sentAt).toLocaleDateString()}</span>
              </div>
              {log.subject && <p className="text-sm text-white mt-1">{log.subject}</p>}
              {log.body && <p className="text-xs text-gray-400 mt-0.5">{log.body}</p>}
              <span className="text-[11px] text-gray-500 capitalize">{log.status}</span>
            </div>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-white/[0.06] space-y-3">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Log new outreach</p>
        <div className="grid grid-cols-2 gap-3">
          <ModalField label="Channel">
            <select
              value={form.channel}
              onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}
              className="modal-input"
            >
              {CHANNEL_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </ModalField>
          <ModalField label="Follow-up date">
            <input
              type="date"
              value={form.followUpAt}
              onChange={(e) => setForm((f) => ({ ...f, followUpAt: e.target.value }))}
              className="modal-input"
            />
          </ModalField>
        </div>
        <ModalField label="Subject">
          <input
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            className="modal-input"
          />
        </ModalField>
        <ModalField label="Message">
          <textarea
            rows={2}
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            className="modal-input resize-none"
          />
        </ModalField>
        <button
          onClick={handleLog}
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                     text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Log Outreach
        </button>
      </div>
    </ModalShell>
  );
}

// ── Referrals ───────────────────────────────────────────────────────────

function ReferralsModal({ jobId, onClose }) {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ candidateName: '', candidateEmail: '', candidateLinkedin: '', note: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recruitmentAPI.listReferrals(jobId);
      setReferrals(data || []);
    } catch (err) {
      toast.error('Could not load referrals');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!form.candidateName.trim()) {
      toast.error('Candidate name is required');
      return;
    }
    setSaving(true);
    try {
      await recruitmentAPI.createReferral(jobId, form);
      toast.success('Referral added');
      setForm({ candidateName: '', candidateEmail: '', candidateLinkedin: '', note: '' });
      load();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to add referral');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePaid = async (referral) => {
    try {
      await recruitmentAPI.updateReferral(referral.id, { bonusPaid: !referral.bonusPaid });
      load();
    } catch (err) {
      toast.error('Failed to update referral');
    }
  };

  return (
    <ModalShell title="Referrals" icon={Gift} onClose={onClose} wide>
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 text-blue-400 animate-spin" /></div>
      ) : referrals.length === 0 ? (
        <p className="text-gray-500 text-sm">No referrals yet for this role.</p>
      ) : (
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {referrals.map((r) => (
            <div key={r.id} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">{r.candidateName}</p>
                {r.candidateEmail && <p className="text-gray-500 text-xs">{r.candidateEmail}</p>}
                {r.note && <p className="text-gray-500 text-xs mt-1">{r.note}</p>}
              </div>
              <button
                onClick={() => handleTogglePaid(r)}
                className={`text-[11px] px-2 py-1 rounded-full border flex-shrink-0 ${
                  r.bonusPaid
                    ? 'text-green-300 bg-green-500/15 border-green-500/30'
                    : 'text-gray-400 bg-white/5 border-white/10'
                }`}
              >
                {r.bonusPaid ? 'Bonus paid' : 'Mark bonus paid'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-white/[0.06] space-y-3">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Add referral</p>
        <ModalField label="Candidate name">
          <input
            value={form.candidateName}
            onChange={(e) => setForm((f) => ({ ...f, candidateName: e.target.value }))}
            className="modal-input"
          />
        </ModalField>
        <div className="grid grid-cols-2 gap-3">
          <ModalField label="Email">
            <input
              value={form.candidateEmail}
              onChange={(e) => setForm((f) => ({ ...f, candidateEmail: e.target.value }))}
              className="modal-input"
            />
          </ModalField>
          <ModalField label="LinkedIn">
            <input
              value={form.candidateLinkedin}
              onChange={(e) => setForm((f) => ({ ...f, candidateLinkedin: e.target.value }))}
              className="modal-input"
            />
          </ModalField>
        </div>
        <ModalField label="Note">
          <textarea
            rows={2}
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            className="modal-input resize-none"
          />
        </ModalField>
        <ModalSubmit onClick={handleSubmit} saving={saving} label="Add Referral" />
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, icon: Icon, onClose, children, wide = false }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#0f1116] border border-white/[0.08] rounded-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto ${
          wide ? 'max-w-lg' : 'max-w-md'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-bold">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
        <style>{`
          .modal-input {
            width: 100%;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 0.75rem;
            padding: 0.55rem 0.8rem;
            color: white;
            font-size: 0.875rem;
          }
          .modal-input:focus { outline: none; border-color: rgba(59,130,246,0.5); }
        `}</style>
      </motion.div>
    </motion.div>
  );
}

function ModalField({ label, children }) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function ModalSubmit({ onClick, saving, label }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
      {label}
    </button>
  );
}
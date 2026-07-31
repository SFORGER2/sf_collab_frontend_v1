// src/components/pages/meet/MeetingDetailPage.jsx
// Loads real meeting data — replaces hardcoded meeting-detail component
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Video, Calendar, Clock, FileText, ArrowLeft, Link2 } from "lucide-react";
import { toast } from "react-toastify";
import { meetAPI } from "@/utils/APIs/meetAPI";

const STATUS_COLORS = {
  scheduled:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  live:       "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  ended:      "bg-zinc-700/50 text-zinc-400 border-zinc-700",
  processing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  indexed:    "bg-zinc-700/50 text-zinc-400 border-zinc-700",
  cancelled:  "bg-red-500/20 text-red-400 border-red-500/30",
};

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function duration(start, end) {
  if (!start || !end) return null;
  const mins = Math.round((new Date(end) - new Date(start)) / 60000);
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function MeetingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting,     setMeeting]     = useState(null);
  const [files,       setFiles]       = useState([]);
  const [decisions,   setDecisions]   = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [ending,      setEnding]      = useState(false);

  useEffect(() => { if (id) load(); }, [id]);

  async function load() {
    setLoading(true);
    try {
      const [mRes, fRes, dRes, aRes] = await Promise.allSettled([
        meetAPI.getMeeting(id),
        meetAPI.getFiles(id),
        meetAPI.getDecisions(id),
        meetAPI.getActionItems(id),
      ]);
      if (mRes.status === "fulfilled") setMeeting(mRes.value.data);
      if (fRes.status === "fulfilled") setFiles(fRes.value.data || []);
      if (dRes.status === "fulfilled") setDecisions(dRes.value.data?.decisions || []);
      if (aRes.status === "fulfilled") setActionItems(aRes.value.data?.action_items || []);
    } finally { setLoading(false); }
  }

  async function handleEnd() {
    if (!window.confirm("End this meeting?")) return;
    setEnding(true);
    try { await meetAPI.endMeeting(id); await load(); }
    catch (e) { alert(e?.response?.data?.error || "Failed to end meeting."); }
    finally { setEnding(false); }
  }

  async function handleJoin() {
    try { await meetAPI.startMeeting(id); } catch { /* silent — meeting may already be live */ }
    navigate(`/meet/room/${id}`);
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/meet/room/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Meeting link copied!");
    } catch {
      toast.error("Could not copy link — please copy it manually: " + url);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  if (!meeting) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-zinc-400">Meeting not found.</p>
      <button onClick={() => navigate(-1)} className="text-blue-400 text-sm">Back</button>
    </div>
  );

  const isLive      = meeting.status === "live";
  const isScheduled = meeting.status === "scheduled";
  const isEnded     = ["ended", "indexed", "processing"].includes(meeting.status);
  const canJoin     = !isEnded; // can join scheduled or live meetings
  const dur = duration(meeting.scheduled_start_at, meeting.scheduled_end_at);

  return (
    <div className="min-h-screen text-white px-4 py-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[meeting.status] || STATUS_COLORS.indexed}`}>
                {meeting.status}
              </span>
              {meeting.meeting_type && (
                <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded-md text-zinc-400 capitalize">
                  {meeting.meeting_type.replace(/_/g, " ")}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">{meeting.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
              <span className="flex items-center gap-1.5"><Calendar size={14} />{fmt(meeting.scheduled_start_at)}</span>
              {dur && <span className="flex items-center gap-1.5"><Clock size={14} />{dur}</span>}
            </div>
            {meeting.description && <p className="text-zinc-400 text-sm mt-2">{meeting.description}</p>}
          </div>

          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            {canJoin && (
              <button onClick={handleJoin}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold text-white transition-colors">
                <Video size={15} />{isLive ? "Rejoin" : "Join Meeting"}
              </button>
            )}
            {isLive && (
              <button onClick={handleEnd} disabled={ending}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl text-sm font-semibold text-white transition-colors">
                {ending ? "Ending…" : "End Meeting"}
              </button>
            )}
            {isEnded && (
              <button onClick={() => navigate(`/meet/${id}/summary`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm text-zinc-300 transition-colors">
                <FileText size={14} /> View Summary
              </button>
            )}
            {/* ── Phase 3: Copy Meeting Link ────────────────────────────── */}
            <button onClick={handleCopyLink}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm text-zinc-300 hover:text-white transition-colors">
              <Link2 size={14} /> Copy Link
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4 text-sm">Decisions ({decisions.length})</h3>
          {decisions.length === 0 ? <p className="text-zinc-600 text-sm">No decisions recorded yet.</p> : (
            <div className="space-y-2">
              {decisions.map((d, i) => (
                <div key={d.id || i} className="flex items-start gap-2 p-2.5 bg-zinc-800/50 rounded-xl">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-zinc-200">{d.decision_statement}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4 text-sm">Action Items ({actionItems.length})</h3>
          {actionItems.length === 0 ? <p className="text-zinc-600 text-sm">No action items yet.</p> : (
            <div className="space-y-2">
              {actionItems.map((item, i) => (
                <div key={item.id || i} className="flex items-start gap-2 p-2.5 bg-zinc-800/50 rounded-xl">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${item.status === "done" ? "bg-emerald-400" : "bg-zinc-500"}`} />
                  <p className={`text-sm ${item.status === "done" ? "line-through text-zinc-500" : "text-zinc-200"}`}>{item.title}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 md:col-span-2">
            <h3 className="font-semibold text-white mb-4 text-sm flex items-center gap-2">
              <Link2 size={14} className="text-zinc-400" /> Linked Files ({files.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {files.map((f, i) => (
                <div key={f.file_id || f.id || i} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
                  <FileText size={14} className="text-zinc-400 flex-shrink-0" />
                  <span className="text-sm text-zinc-200 truncate">{f.filename || f.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

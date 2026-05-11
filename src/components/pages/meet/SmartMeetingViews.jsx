// src/components/pages/meet/SmartMeetingViews.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Milestone, Clock, Sparkles, Video,
  ChevronRight, Play, FileText, Mic, Search,
  TrendingUp, Star, Zap
} from "lucide-react";
import { meetAPI } from "@/utils/APIs/meetAPI";
import { useSelector } from "react-redux";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  scheduled:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  live:       "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  processing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  indexed:    "bg-zinc-700/50 text-zinc-400 border-zinc-700",
  ended:      "bg-zinc-700/50 text-zinc-400 border-zinc-700",
  cancelled:  "bg-red-500/20 text-red-400 border-red-500/30",
};

const TYPE_LABELS = {
  startup_team:    "Team Sync",
  mentor_session:  "Mentor",
  milestone_review:"Milestone",
  customer_call:   "Customer",
  investor_call:   "Investor",
  vision_review:   "Vision",
  internal_org:    "Internal",
  dispute_review:  "Dispute",
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getAiScore(meeting) {
  // Simple heuristic scoring for "AI suggested" tab
  let score = 0;
  if (meeting.linked_milestone_ids?.length) score += 3;
  if (meeting.recording_file_id)            score += 2;
  if (meeting.summary_doc_id)               score += 2;
  if (meeting.transcript_file_id)           score += 1;
  if (meeting.status === "indexed")         score += 2;
  return score;
}

// ── Meeting Row ───────────────────────────────────────────────────────────────

function MeetingRow({ meeting, onClick, showScore }) {
  const isLive = meeting.status === "live";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all
        ${isLive
          ? "bg-emerald-950/30 border-emerald-500/30 shadow-lg shadow-emerald-500/5"
          : "bg-zinc-900/50 border-zinc-800/60 hover:border-zinc-700"
        }`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
        ${isLive ? "bg-emerald-500/20" : "bg-zinc-800"}`}>
        <Video size={16} className={isLive ? "text-emerald-400" : "text-zinc-500"} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-sm font-semibold text-white truncate">{meeting.title}</span>
          {isLive && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
          <span>{formatDate(meeting.scheduled_start_at)}</span>
          {meeting.meeting_type && (
            <span className="px-1.5 py-0.5 bg-zinc-800 rounded-md text-zinc-500">
              {TYPE_LABELS[meeting.meeting_type] || meeting.meeting_type}
            </span>
          )}
          {meeting.linked_milestone_ids?.length > 0 && (
            <span className="flex items-center gap-1 text-zinc-500">
              <Milestone size={10} />
              {meeting.linked_milestone_ids.length} milestone
            </span>
          )}
        </div>
      </div>

      {/* Artifacts */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        {meeting.recording_file_id  && <Play     size={12} className="text-amber-400" />}
        {meeting.transcript_file_id && <Mic      size={12} className="text-blue-400" />}
        {meeting.summary_doc_id     && <FileText size={12} className="text-emerald-400" />}
      </div>

      {/* Status + AI score */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {showScore && (
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <Star size={10} className="text-purple-400" />
            <span className="text-[10px] text-purple-300 font-semibold">{getAiScore(meeting)}</span>
          </div>
        )}
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium hidden sm:block
          ${STATUS_COLORS[meeting.status] || STATUS_COLORS.indexed}`}>
          {meeting.status}
        </span>
        <ChevronRight size={14} className="text-zinc-700" />
      </div>
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center">
        <Icon size={24} className="text-zinc-700" />
      </div>
      <p className="text-zinc-400 font-medium text-sm">{title}</p>
      {subtitle && <p className="text-zinc-600 text-xs text-center max-w-xs">{subtitle}</p>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SmartMeetingViews({ startupId }) {
  const navigate  = useNavigate();
  const { user }  = useSelector(s => s.auth);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState("all");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    fetchMeetings();
  }, [startupId]);

  async function fetchMeetings() {
    setLoading(true);
    try {
      const params = startupId ? { startup_id: startupId } : {};
      const res    = await meetAPI.listMeetings(params);
      setMeetings(res.data || []);
    } catch (e) {
      console.error("SmartMeetingViews fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  // ── Tab filters ─────────────────────────────────────────────────────────────

  const now = new Date();

  const allMeetings = meetings.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const milestoneMeetings = meetings.filter(m =>
    (m.linked_milestone_ids?.length > 0) &&
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const recentMeetings = meetings
    .filter(m =>
      ["indexed", "ended", "processing"].includes(m.status) &&
      m.title.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.actual_end_at || b.scheduled_start_at) - new Date(a.actual_end_at || a.scheduled_start_at))
    .slice(0, 10);

  const aiSuggestedMeetings = meetings
    .filter(m =>
      m.status === "indexed" &&
      m.title.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => getAiScore(b) - getAiScore(a))
    .slice(0, 8);

  const TABS = [
    {
      id:    "all",
      label: "All Meetings",
      icon:  Calendar,
      count: allMeetings.length,
      data:  allMeetings,
      empty: { icon: Calendar, title: "No meetings yet", subtitle: "Create your first meeting to get started" },
    },
    {
      id:    "milestone",
      label: "Milestone",
      icon:  Milestone,
      count: milestoneMeetings.length,
      data:  milestoneMeetings,
      empty: { icon: Milestone, title: "No milestone meetings", subtitle: "Link a meeting to a milestone to see it here" },
    },
    {
      id:    "recent",
      label: "Recent",
      icon:  Clock,
      count: recentMeetings.length,
      data:  recentMeetings,
      empty: { icon: Clock, title: "No recent meetings", subtitle: "Completed meetings will appear here" },
    },
    {
      id:    "ai",
      label: "AI Suggested",
      icon:  Sparkles,
      count: aiSuggestedMeetings.length,
      data:  aiSuggestedMeetings,
      showScore: true,
      empty: { icon: Sparkles, title: "No AI suggestions yet", subtitle: "AI surfaces your richest indexed meetings — complete more meetings to see suggestions" },
    },
  ];

  const activeTab = TABS.find(t => t.id === tab);

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white tracking-tight mb-1">Meeting Views</h2>
        <p className="text-sm text-zinc-500">Browse and find meetings across your workspace</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search meetings..."
          className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl
            text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600
            transition-colors"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-zinc-900 rounded-xl overflow-x-auto scrollbar-none"
        style={{ scrollbarWidth: "none" }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold
              whitespace-nowrap transition-all flex-shrink-0
              ${tab === t.id
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
              }`}
          >
            <t.icon size={13} className={
              t.id === "ai" && tab === t.id ? "text-purple-400" :
              t.id === "milestone" && tab === t.id ? "text-emerald-400" :
              t.id === "recent" && tab === t.id ? "text-blue-400" : ""
            } />
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md
              ${tab === t.id ? "bg-zinc-700 text-zinc-300" : "bg-zinc-800 text-zinc-600"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* AI Suggested banner */}
      {tab === "ai" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/20
            rounded-xl mb-4"
        >
          <Sparkles size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-purple-300">AI-ranked meetings</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Ranked by richness — meetings with transcripts, summaries, decisions,
              and milestone links score highest.
            </p>
          </div>
        </motion.div>
      )}

      {/* Milestone banner */}
      {tab === "milestone" && milestoneMeetings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20
            rounded-xl mb-4"
        >
          <TrendingUp size={14} className="text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-zinc-400">
            <span className="text-emerald-300 font-semibold">{milestoneMeetings.length} meeting{milestoneMeetings.length !== 1 ? "s" : ""}</span>
            {" "}linked to milestones in this workspace
          </p>
        </motion.div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none"
        style={{ scrollbarWidth: "none" }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-zinc-900/60 rounded-2xl animate-pulse border border-zinc-800/60" />
          ))
        ) : activeTab?.data.length === 0 ? (
          <EmptyState
            icon={activeTab.empty.icon}
            title={activeTab.empty.title}
            subtitle={activeTab.empty.subtitle}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {activeTab?.data.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.03 }}
              >
                <MeetingRow
                  meeting={m}
                  onClick={() => navigate(`/meet/${m.id}`)}
                  showScore={activeTab.showScore}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Stats footer */}
      {!loading && meetings.length > 0 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-zinc-900">
          <div className="flex gap-4">
            {[
              { label: "Total",     value: meetings.length,                                     color: "text-zinc-300" },
              { label: "Live",      value: meetings.filter(m => m.status === "live").length,     color: "text-emerald-400" },
              { label: "Indexed",   value: meetings.filter(m => m.status === "indexed").length,  color: "text-blue-400" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-zinc-600">{s.label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={fetchMeetings}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
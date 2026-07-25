// src/components/pages/meet/MeetingsTab.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  FileText,
  Mic,
  Play,
  Archive,
  Search,
  Filter,
} from "lucide-react";
import { meetAPI } from "@/utils/APIs/meetAPI";
import CreateMeetingModal from "./CreateMeetingModal";
import { AIActions, AISidebar } from "./component/sidebar";

const STATUS_COLORS = {
  scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  live: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse",
  processing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  indexed: "bg-zinc-700/50 text-zinc-400 border-zinc-700",
  ended: "bg-zinc-700/50 text-zinc-400 border-zinc-700",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const TYPE_LABELS = {
  startup_team: "Team Sync",
  mentor_session: "Mentor Session",
  milestone_review: "Milestone Review",
  customer_call: "Customer Call",
  investor_call: "Investor Call",
  vision_review: "Vision Review",
  internal_org: "Internal",
  dispute_review: "Dispute Review",
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MeetingCard({ meeting, onClick }) {
  const isLive = meeting.status === "live";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-2xl border p-4 transition-all
        ${
          isLive
            ? "bg-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
            : "bg-zinc-900/60 border-zinc-800/60 hover:border-zinc-700"
        }`}
    >
      {isLive && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-500 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          <span className="text-[10px] font-bold text-white tracking-wide">
            LIVE
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          ${isLive ? "bg-emerald-500/20" : "bg-zinc-800"}`}
        >
          <Video
            size={18}
            className={isLive ? "text-emerald-400" : "text-zinc-400"}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-white text-sm truncate">
              {meeting.title}
            </h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-medium
              ${STATUS_COLORS[meeting.status] || STATUS_COLORS.indexed}`}
            >
              {meeting.status}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(meeting.scheduled_start_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatTime(meeting.scheduled_start_at)}
            </span>
            {meeting.meeting_type && (
              <span className="px-2 py-0.5 bg-zinc-800 rounded-md text-zinc-400">
                {TYPE_LABELS[meeting.meeting_type] || meeting.meeting_type}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2">
            {meeting.recording_file_id && (
              <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                <Play size={10} className="text-amber-400" /> Recording
              </span>
            )}
            {meeting.transcript_file_id && (
              <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                <Mic size={10} className="text-blue-400" /> Transcript
              </span>
            )}
            {meeting.summary_doc_id && (
              <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                <FileText size={10} className="text-emerald-400" /> Summary
              </span>
            )}
          </div>
        </div>

        <ChevronRight size={16} className="text-zinc-600 flex-shrink-0 mt-1" />
      </div>
    </motion.div>
  );
}

export default function MeetingsTab({ startupId }) {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, [startupId]);

  async function fetchMeetings() {
    setLoading(true);
    try {
      const params = startupId ? { startup_id: startupId } : {};
      const res = await meetAPI.listMeetings(params);
      setMeetings(res.data || []);
    } catch (e) {
      console.error("Failed to fetch meetings:", e);
    } finally {
      setLoading(false);
    }
  }

  const now = new Date();
  const upcoming = meetings.filter(
    (m) =>
      ["scheduled", "live"].includes(m.status) &&
      new Date(m.scheduled_start_at) >= now,
  );
  const past = meetings.filter((m) =>
    ["indexed", "archived", "ended", "processing"].includes(m.status),
  );

  const filtered = (tab === "upcoming" ? upcoming : past).filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="h-full px-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Meetings
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {upcoming.length} upcoming · {past.length} past
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500
            rounded-xl text-sm font-semibold text-white transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus size={16} />
          New Meeting
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search meetings..."
          className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl
            text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-zinc-900 rounded-xl p-1">
        {[
          { id: "upcoming", label: "Upcoming", count: upcoming.length },
          { id: "past", label: "Past", count: past.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all
              ${
                tab === t.id
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
          >
            {t.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-md
              ${tab === t.id ? "bg-zinc-700 text-zinc-300" : "bg-zinc-800 text-zinc-600"}`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-zinc-900/60 rounded-2xl animate-pulse border border-zinc-800/60"
            />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
              <Video size={24} className="text-zinc-600" />
            </div>
            <p className="text-zinc-500 text-sm">
              {tab === "upcoming" ? "No upcoming meetings" : "No past meetings"}
            </p>
            {tab === "upcoming" && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Schedule one →
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((m) => (
              <MeetingCard
                key={m.id}
                meeting={m}
                onClick={() => navigate(`/meet/${m.id}`)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      <AIActions onOpenSidebar={() => setOpen(true)} />
      <AISidebar open={open} onClose={() => setOpen(false)} />
      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateMeetingModal
            startupId={startupId}
            onClose={() => setShowCreate(false)}
            onCreated={(newMeeting) => {
              setMeetings((prev) => [newMeeting, ...prev]);
              setShowCreate(false);
              navigate(`/meet/${newMeeting.id}`);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

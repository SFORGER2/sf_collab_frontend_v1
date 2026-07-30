// src/components/pages/meet/MeetingCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Video, Calendar, Clock, ChevronRight, Play, Mic, FileText } from 'lucide-react';
import { Badge } from '@/components/erp/ui';

const STATUS_COLORS = {
  scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  live: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse',
  processing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  indexed: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
  ended: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const TYPE_LABELS = {
  startup_team: 'Team Sync',
  mentor_session: 'Mentor Session',
  milestone_review: 'Milestone Review',
  customer_call: 'Customer Call',
  investor_call: 'Investor Call',
  vision_review: 'Vision Review',
  internal_org: 'Internal',
  dispute_review: 'Dispute Review',
};

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MeetingCard({ meeting, onClick, compact = false }) {
  const isLive = meeting.status === 'live';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-2xl border p-4 transition-all ${
        isLive
          ? 'bg-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
          : 'bg-[#121215] border-zinc-800/80 hover:border-zinc-600'
      }`}
    >
      {isLive && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-500 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          <span className="text-[10px] font-bold text-white tracking-wide">LIVE</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isLive ? 'bg-emerald-500/20' : 'bg-zinc-800'
          }`}
        >
          <Video size={18} className={isLive ? 'text-emerald-400' : 'text-zinc-400'} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-white text-sm truncate">{meeting.title}</h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                STATUS_COLORS[meeting.status] || STATUS_COLORS.indexed
              }`}
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

          {!compact && (
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
          )}
        </div>

        <ChevronRight size={16} className="text-zinc-600 flex-shrink-0 mt-1" />
      </div>
    </motion.div>
  );
}
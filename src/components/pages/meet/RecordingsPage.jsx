// src/components/pages/meet/RecordingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Play, Mic, FileText, Search, Filter, Download, Eye } from 'lucide-react';
import { meetAPI } from '@/utils/APIs/meetAPI';
import { PageHeader, GlassCard, StatCard, Button, Spinner, EmptyState } from '@/components/erp/ui';

export default function RecordingsPage() {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await meetAPI.getRecordings();
      setRecordings(res.data || []);
    } catch (err) {
      console.error('Failed to fetch recordings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  const filteredRecordings = recordings.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasTranscript = (m) => m.transcript_file_id;
  const hasSummary = (m) => m.summary_doc_id;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Recordings"
          subtitle="All recorded meetings with transcripts and summaries"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download size={14} className="mr-1" /> Export All
              </Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={Video}
            label="Total Recordings"
            value={recordings.length}
            accent="#6366f1"
          />
          <StatCard
            icon={Mic}
            label="With Transcripts"
            value={recordings.filter(hasTranscript).length}
            accent="#22c55e"
          />
          <StatCard
            icon={FileText}
            label="With Summaries"
            value={recordings.filter(hasSummary).length}
            accent="#f59e0b"
          />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recordings..."
            className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <RecordingSkeleton key={i} />
            ))}
          </div>
        ) : filteredRecordings.length === 0 ? (
          <EmptyState
            icon={<Video className="w-12 h-12 text-zinc-600" />}
            title="No recordings"
            description="Recorded meetings will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecordings.map((m, idx) => (
              <RecordingCard
                key={m.id}
                meeting={m}
                index={idx}
                onClick={() => navigate(`/meet/${m.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecordingCard({ meeting, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-600 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
          <Video className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{meeting.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {meeting.recording_file_id && (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <Play size={10} /> Recording
              </span>
            )}
            {meeting.transcript_file_id && (
              <span className="flex items-center gap-1 text-xs text-blue-400">
                <Mic size={10} /> Transcript
              </span>
            )}
            {meeting.summary_doc_id && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <FileText size={10} /> Summary
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {new Date(meeting.scheduled_start_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
            <Eye size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
            <Download size={14} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function RecordingSkeleton() {
  return (
    <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-zinc-800/60" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-800/60 rounded w-2/3" />
          <div className="flex gap-2">
            <div className="h-3 bg-zinc-800/40 rounded w-16" />
            <div className="h-3 bg-zinc-800/40 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
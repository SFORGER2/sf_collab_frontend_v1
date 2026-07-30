// src/components/pages/meet/PastMeetingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Archive, Search, Filter, FileText, Clock } from 'lucide-react';
import { meetAPI } from '@/utils/APIs/meetAPI';
import { PageHeader, StatCard, Button, Spinner, EmptyState } from '@/components/erp/ui';
import { MeetingCard } from './MeetingCard';

export default function PastMeetingsPage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await meetAPI.getPast();
      setMeetings(res.data || []);
    } catch (err) {
      console.error('Failed to fetch past meetings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const filteredMeetings = meetings.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by month
  const groupedMeetings = filteredMeetings.reduce((acc, m) => {
    const date = new Date(m.scheduled_start_at || m.actual_end_at);
    const key = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const sortedGroups = Object.keys(groupedMeetings).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  const totalDecisions = meetings.reduce(
    (sum, m) => sum + (m.decisions?.length || 0),
    0
  );
  const totalActionItems = meetings.reduce(
    (sum, m) => sum + (m.action_items?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Past Meetings"
          subtitle="Historical meetings and their outputs"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={Archive}
            label="Total Past Meetings"
            value={meetings.length}
            accent="#6366f1"
          />
          <StatCard
            icon={FileText}
            label="Decisions Made"
            value={totalDecisions}
            accent="#22c55e"
          />
          <StatCard
            icon={Clock}
            label="Action Items"
            value={totalActionItems}
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
            placeholder="Search past meetings..."
            className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <MeetingSkeleton key={i} />
            ))}
          </div>
        ) : filteredMeetings.length === 0 ? (
          <EmptyState
            icon={<Archive className="w-12 h-12 text-zinc-600" />}
            title="No past meetings"
            description="Completed meetings will appear here."
          />
        ) : (
          <div className="space-y-6">
            {sortedGroups.map((month) => (
              <div key={month}>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  {month}
                </h3>
                <div className="space-y-3">
                  {groupedMeetings[month].map((m) => (
                    <MeetingCard
                      key={m.id}
                      meeting={m}
                      onClick={() => navigate(`/meet/${m.id}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MeetingSkeleton() {
  return (
    <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-800/60" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <div className="h-4 bg-zinc-800/60 rounded w-2/3" />
            <div className="h-4 bg-zinc-800/40 rounded w-16" />
          </div>
          <div className="flex gap-3">
            <div className="h-3 bg-zinc-800/40 rounded w-24" />
            <div className="h-3 bg-zinc-800/40 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
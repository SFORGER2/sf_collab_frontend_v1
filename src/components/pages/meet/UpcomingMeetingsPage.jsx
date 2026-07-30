// src/components/pages/meet/UpcomingMeetingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, Search, Filter } from 'lucide-react';
import { useSelector } from 'react-redux';
import { meetAPI } from '@/utils/APIs/meetAPI';
import { PageHeader, GlassCard, StatCard, Button, Spinner, EmptyState } from '@/components/erp/ui';
import { MeetingCard } from './MeetingCard';
import CreateMeetingModal from './CreateMeetingModal';

export default function UpcomingMeetingsPage() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await meetAPI.getUpcoming();
      setMeetings(res.data || []);
    } catch (err) {
      console.error('Failed to fetch upcoming meetings:', err);
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

  const now = new Date();
  const todayMeetings = filteredMeetings.filter(
    (m) => new Date(m.scheduled_start_at).toDateString() === now.toDateString()
  );
  const thisWeekMeetings = filteredMeetings.filter(
    (m) => {
      const d = new Date(m.scheduled_start_at);
      const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
      return diff > 0 && diff <= 7;
    }
  );
  const laterMeetings = filteredMeetings.filter(
    (m) => {
      const d = new Date(m.scheduled_start_at);
      const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
      return diff > 7;
    }
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Upcoming Meetings"
          subtitle="Scheduled meetings you're invited to"
          actions={
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} className="mr-1" /> Schedule Meeting
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={Calendar}
            label="Total Upcoming"
            value={meetings.length}
            accent="#6366f1"
          />
          <StatCard
            icon={Calendar}
            label="Today"
            value={todayMeetings.length}
            accent="#22c55e"
          />
          <StatCard
            icon={Clock}
            label="This Week"
            value={thisWeekMeetings.length}
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
            placeholder="Search upcoming meetings..."
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
            icon={<Calendar className="w-12 h-12 text-zinc-600" />}
            title="No upcoming meetings"
            description="You don't have any scheduled meetings yet."
            action={
              <Button onClick={() => setShowCreate(true)}>
                <Plus size={16} className="mr-1" /> Schedule One
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {todayMeetings.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-4">
                  Today
                </h3>
                {todayMeetings.map((m) => (
                  <MeetingCard
                    key={m.id}
                    meeting={m}
                    onClick={() => navigate(`/meet/${m.id}`)}
                  />
                ))}
              </>
            )}

            {thisWeekMeetings.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-4">
                  This Week
                </h3>
                {thisWeekMeetings.map((m) => (
                  <MeetingCard
                    key={m.id}
                    meeting={m}
                    onClick={() => navigate(`/meet/${m.id}`)}
                  />
                ))}
              </>
            )}

            {laterMeetings.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-4">
                  Later
                </h3>
                {laterMeetings.map((m) => (
                  <MeetingCard
                    key={m.id}
                    meeting={m}
                    onClick={() => navigate(`/meet/${m.id}`)}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <CreateMeetingModal
          onClose={() => setShowCreate(false)}
          onCreated={(newMeeting) => {
            setMeetings((prev) => [newMeeting, ...prev]);
            setShowCreate(false);
            navigate(`/meet/${newMeeting.id}`);
          }}
        />
      )}
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
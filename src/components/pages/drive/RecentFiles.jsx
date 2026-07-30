// src/components/pages/drive/RecentFiles.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Calendar, User, FileText, Folder, Sparkles,
  Search, Filter, Eye, Download, CheckCircle2,
  ArrowUpRight, Clock as ClockIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader, GlassCard, Button, Badge, Spinner, EmptyState } from '@/components/erp/ui';

const TIME_SECTIONS = [
  { id: 'today', label: 'Today', icon: ClockIcon },
  { id: 'yesterday', label: 'Yesterday', icon: ClockIcon },
  { id: 'week', label: 'This Week', icon: Calendar },
  { id: 'older', label: 'Older', icon: Calendar },
];

const QUICK_FILTERS = [
  { id: 'opened', label: 'Recently Opened' },
  { id: 'uploaded', label: 'Recently Uploaded' },
  { id: 'updated', label: 'Recently Updated' },
  { id: 'indexed', label: 'Recently Indexed' },
];

export default function RecentFiles() {
  const [activeFilter, setActiveFilter] = useState('opened');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Group files by time section
  const groupedFiles = files.reduce((acc, file) => {
    const date = new Date(file.last_opened || file.updated_at);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString();
    const isThisWeek = date > new Date(now.setDate(now.getDate() - 7));

    let section = 'older';
    if (isToday) section = 'today';
    else if (isYesterday) section = 'yesterday';
    else if (isThisWeek) section = 'week';

    if (!acc[section]) acc[section] = [];
    acc[section].push(file);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Recent Files"
          subtitle="Your recently opened, uploaded, and updated files"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Filter size={16} className="mr-1" /> Filter</Button>
            </div>
          }
        />

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {QUICK_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-medium transition-all',
                activeFilter === filter.id
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                  : 'text-zinc-400 hover:text-white bg-[#121215] border border-zinc-800/80'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recent files..."
            className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <SectionSkeleton key={i} />)}
          </div>
        ) : Object.keys(groupedFiles).length === 0 ? (
          <EmptyState
            icon={<Clock className="w-12 h-12 text-zinc-600" />}
            title="No recent files"
            description="Files you open or edit will appear here."
          />
        ) : (
          <div className="space-y-6">
            {TIME_SECTIONS.map((section) => {
              const sectionFiles = groupedFiles[section.id] || [];
              if (sectionFiles.length === 0) return null;
              const Icon = section.icon;

              return (
                <div key={section.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={16} className="text-zinc-500" />
                    <h3 className="text-sm font-semibold text-white">{section.label}</h3>
                    <Badge color="gray">{sectionFiles.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {sectionFiles.map((file, idx) => (
                      <RecentFileRow key={file.id} file={file} index={idx} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function RecentFileRow({ file, index }) {
  const isAI_Indexed = file.ai_indexed;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 hover:border-zinc-600 transition-all group flex items-center gap-4"
    >
      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white truncate">{file.name}</p>
          {isAI_Indexed && (
            <Badge color="green" className="flex items-center gap-1">
              <CheckCircle2 size={10} /> AI Indexed
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
          <span className="flex items-center gap-1">
            <User size={12} />
            {file.owner?.name || 'Unknown'}
          </span>
          <span className="flex items-center gap-1">
            <Folder size={12} />
            {file.workspace || 'Personal'}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {file.last_opened ? `Opened ${new Date(file.last_opened).toLocaleDateString()}` : ''}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
          <Eye size={14} />
        </Button>
        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
          <Download size={14} />
        </Button>
        <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
          <Sparkles size={14} />
        </Button>
      </div>
    </motion.div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-4 h-4 bg-zinc-800/60 rounded" />
        <div className="h-4 bg-zinc-800/60 rounded w-24" />
      </div>
      {[1, 2].map(i => (
        <div key={i} className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-800/60" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-zinc-800/60 rounded w-2/3" />
              <div className="h-3 bg-zinc-800/40 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
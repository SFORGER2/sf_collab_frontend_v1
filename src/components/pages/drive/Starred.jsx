// src/components/pages/drive/Starred.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Pin, Sparkles, Folder, FileText, Users,
  Calendar, Award, Link2, Eye, Download,
  MoreHorizontal, CheckCircle2, Filter, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader, GlassCard, Button, Badge, Spinner, EmptyState } from '@/components/erp/ui';

const STAR_SECTIONS = [
  { id: 'pinned', label: 'Pinned', icon: Pin },
  { id: 'recent', label: 'Recently Starred', icon: Star },
  { id: 'ai_recommended', label: 'AI Recommended', icon: Sparkles },
  { id: 'startup_favorites', label: 'Startup Favorites', icon: Users },
  { id: 'canonical', label: 'Canonical Documents', icon: Award },
];

export default function Starred() {
  const [activeSection, setActiveSection] = useState('pinned');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadStarred = async () => {
      setLoading(true);
      try {
        // Simulated data
        const data = [
          { id: 1, name: 'Product Roadmap 2026', starred_at: '2026-01-15', is_canonical: true, is_pinned: true, linked_milestone: 'MVP Launch', linked_meeting: 'Q1 Planning' },
          { id: 2, name: 'Investor Pitch Deck v4', starred_at: '2026-01-12', is_canonical: false, is_pinned: false },
          { id: 3, name: 'Architecture Decisions', starred_at: '2026-01-10', is_canonical: true, is_pinned: false },
        ];
        setFiles(data);
      } catch (err) {
        console.error('Failed to load starred files:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStarred();
  }, [activeSection]);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Starred"
          subtitle="Important documents you've bookmarked"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Filter size={16} className="mr-1" /> Filter</Button>
            </div>
          }
        />

        {/* Section Navigation */}
        <div className="flex overflow-x-auto gap-1 mb-6 pb-2 scrollbar-thin scrollbar-thumb-white/5">
          {STAR_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon size={16} />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search starred files..."
            className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <StarredSkeleton key={i} />)}
          </div>
        ) : filteredFiles.length === 0 ? (
          <EmptyState
            icon={<Star className="w-12 h-12 text-zinc-600" />}
            title="No starred files"
            description="Star important documents to find them quickly."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFiles.map((file, idx) => (
              <StarredCard key={file.id} file={file} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StarredCard({ file, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[#121215] border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-600 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
          {file.is_canonical ? (
            <Award className="w-5 h-5 text-yellow-400" />
          ) : (
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400/30" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-white truncate">{file.name}</p>
            {file.is_pinned && <Pin size={12} className="text-yellow-400" />}
            {file.is_canonical && (
              <Badge color="yellow" className="flex items-center gap-1">
                <Award size={10} /> Canonical
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Star size={12} />
              Starred {new Date(file.starred_at).toLocaleDateString()}
            </span>
            {file.linked_milestone && (
              <span className="flex items-center gap-1 text-indigo-400">
                <Link2 size={12} />
                {file.linked_milestone}
              </span>
            )}
            {file.linked_meeting && (
              <span className="flex items-center gap-1 text-purple-400">
                <Users size={12} />
                {file.linked_meeting}
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-yellow-400">
          <Star className="w-4 h-4 fill-yellow-400" />
        </Button>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800/50">
        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
          <Eye size={14} className="mr-1" /> Preview
        </Button>
        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
          <Download size={14} className="mr-1" /> Download
        </Button>
        <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 ml-auto">
          <Sparkles size={14} className="mr-1" /> AI Analyze
        </Button>
      </div>
    </motion.div>
  );
}

function StarredSkeleton() {
  return (
    <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-zinc-800/60" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-800/60 rounded w-2/3" />
          <div className="h-3 bg-zinc-800/40 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}
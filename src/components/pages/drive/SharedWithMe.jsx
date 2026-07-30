// src/components/pages/drive/SharedWithMe.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Users, Building2, Clock, Link2, User, Shield,
  Eye, Download, Sparkles, Search, Filter, SortAsc,
  ChevronDown, X, Calendar, AlertCircle, UserCheck,
  UserPlus, Briefcase, Star, FileText, Folder,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader, GlassCard, Button, Badge, Spinner, EmptyState } from '@/components/erp/ui';

const SHARED_SECTIONS = [
  { id: 'recent', label: 'Shared Recently', icon: Clock },
  { id: 'startup', label: 'Shared by Startup', icon: Briefcase },
  { id: 'organization', label: 'Shared by Organization', icon: Building2 },
  { id: 'expiring', label: 'Expiring Shares', icon: AlertCircle },
  { id: 'public', label: 'Public Links', icon: Link2 },
  { id: 'advisor', label: 'Advisor Shared', icon: UserCheck },
  { id: 'mentor', label: 'Mentor Shared', icon: UserPlus },
];

const PERMISSION_BADGES = {
  view: { label: 'View Only', color: 'gray' },
  comment: { label: 'Can Comment', color: 'blue' },
  edit: { label: 'Can Edit', color: 'green' },
  admin: { label: 'Full Access', color: 'purple' },
};

export default function SharedWithMe() {
  const [activeSection, setActiveSection] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Temporary mock fetch – replace with actual driveService call
  const fetchSharedFiles = useCallback(async (section) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: 1,
        name: 'Q1 Roadmap.pdf',
        owner: { name: 'Sarah Chen' },
        shared_at: '2026-01-18T10:00:00Z',
        expires_at: '2026-02-18T10:00:00Z',
        permission: 'edit',
      },
      {
        id: 2,
        name: 'Investor Update.pptx',
        owner: { name: 'Alex Rivera' },
        shared_at: '2026-01-16T14:30:00Z',
        expires_at: null,
        permission: 'view',
      },
      {
        id: 3,
        name: 'Architecture Diagram.svg',
        owner: { name: 'You' },
        shared_at: '2026-01-15T09:15:00Z',
        expires_at: '2026-01-30T09:15:00Z',
        permission: 'comment',
      },
    ];
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchSharedFiles(activeSection);
        setFiles(data);
      } catch (err) {
        console.error('Failed to load shared files:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeSection, fetchSharedFiles]);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Shared with Me"
          subtitle="Files shared by your team, startups, and organization"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Filter size={16} className="mr-1" /> Filter</Button>
              <Button variant="outline" size="sm"><SortAsc size={16} className="mr-1" /> Sort</Button>
            </div>
          }
        />

        {/* Section Navigation */}
        <div className="flex overflow-x-auto gap-1 mb-6 pb-2 scrollbar-thin scrollbar-thumb-white/5">
          {SHARED_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400'
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
            placeholder="Search shared files..."
            className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <FileSkeleton key={i} />)}
          </div>
        ) : filteredFiles.length === 0 ? (
          <EmptyState
            icon={<Share2 className="w-12 h-12 text-zinc-600" />}
            title="No shared files"
            description="Files shared with you will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFiles.map((file, idx) => (
              <SharedFileCard key={file.id} file={file} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SharedFileCard({ file, index }) {
  const permissionMeta = PERMISSION_BADGES[file.permission] || PERMISSION_BADGES.view;
  const isExpiring = file.expires_at && new Date(file.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[#121215] border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-600 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-white truncate">{file.name}</p>
            <Badge color={permissionMeta.color}>{permissionMeta.label}</Badge>
            {isExpiring && <Badge color="yellow">Expiring Soon</Badge>}
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <User size={12} />
              {file.owner?.name || 'Unknown'}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {new Date(file.shared_at).toLocaleDateString()}
            </span>
            {file.expires_at && (
              <span className="flex items-center gap-1 text-amber-400">
                <AlertCircle size={12} />
                Expires {new Date(file.expires_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800/50">
        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
          <Eye size={14} className="mr-1" /> Preview
        </Button>
        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
          <Download size={14} className="mr-1" /> Download
        </Button>
        <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 ml-auto">
          <Sparkles size={14} className="mr-1" /> Summarize
        </Button>
      </div>
    </motion.div>
  );
}

function FileSkeleton() {
  return (
    <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-zinc-800/60" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-800/60 rounded w-2/3" />
          <div className="h-3 bg-zinc-800/40 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800/50">
        <div className="h-8 bg-zinc-800/40 rounded w-16" />
        <div className="h-8 bg-zinc-800/40 rounded w-16" />
      </div>
    </div>
  );
}
// src/components/pages/drive/StartupDrive.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, FileText, Folder, BookOpen, Microscope,
  ClipboardCheck, Users, Package, Archive, Rocket,  // ✅ ROCKET ADDED
  Sparkles, Clock, AlertTriangle, CheckCircle2,
  Search, Filter, Grid, List, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader, GlassCard, Button, Badge, Spinner, EmptyState } from '@/components/erp/ui';

const STARTUP_TABS = [
  { id: 'all', label: 'All Files', icon: FileText },
  { id: 'product', label: 'Product', icon: Package },
  { id: 'research', label: 'Research', icon: Microscope },
  { id: 'architecture', label: 'Architecture', icon: BookOpen },
  { id: 'milestones', label: 'Milestones', icon: ClipboardCheck },
  { id: 'meetings', label: 'Meetings', icon: Users },
  { id: 'assets', label: 'Assets', icon: Folder },
  { id: 'launch', label: 'Launch Docs', icon: Rocket },
  { id: 'archived', label: 'Archived', icon: Archive },
];

export default function StartupDrive() {
  const [activeTab, setActiveTab] = useState('all');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');

  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true);
      try {
        const data = [
          { id: 1, name: 'Product Roadmap 2026.pdf', type: 'product', updated: '2026-01-15', canonical: true, needs_review: false },
          { id: 2, name: 'System Architecture v3.md', type: 'architecture', updated: '2026-01-14', canonical: true, needs_review: false },
          { id: 3, name: 'MVP Launch Checklist.xlsx', type: 'milestones', updated: '2026-01-13', canonical: false, needs_review: true },
          { id: 4, name: 'User Research Summary.pdf', type: 'research', updated: '2026-01-12', canonical: false, needs_review: false },
          { id: 5, name: 'Q1 Investor Deck.pptx', type: 'assets', updated: '2026-01-10', canonical: false, needs_review: true },
        ];
        setFiles(data);
      } catch (err) {
        console.error('Failed to load startup files:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFiles();
  }, [activeTab]);

  const filteredFiles = activeTab === 'all'
    ? files
    : files.filter(f => f.type === activeTab);

  const canonicalFiles = files.filter(f => f.canonical);
  const needsReview = files.filter(f => f.needs_review);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Startup Drive"
          subtitle="AlphaPay · Knowledge hub for your startup"
          actions={
            <div className="flex items-center gap-2">
              <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-zinc-800">
                <button
                  onClick={() => setView('grid')}
                  className={cn('p-1.5 rounded', view === 'grid' ? 'bg-zinc-700' : 'text-zinc-500')}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={cn('p-1.5 rounded', view === 'list' ? 'bg-zinc-700' : 'text-zinc-500')}
                >
                  <List size={16} />
                </button>
              </div>
              <Button><Plus size={16} className="mr-1" /> New File</Button>
            </div>
          }
        />

        {/* AI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <GlassCard className="p-4 border-indigo-500/20 bg-indigo-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-indigo-400" />
              <span className="text-xs font-medium text-indigo-400">AI Workspace Summary</span>
            </div>
            <p className="text-sm text-zinc-300">42 files · 8 canonical docs · 5 pending review</p>
          </GlassCard>
          <GlassCard className="p-4 border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Canonical Docs</span>
            </div>
            <p className="text-sm text-zinc-300">{canonicalFiles.length} source-of-truth documents</p>
          </GlassCard>
          <GlassCard className="p-4 border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-amber-400" />
              <span className="text-xs font-medium text-amber-400">Needs Review</span>
            </div>
            <p className="text-sm text-zinc-300">{needsReview.length} files awaiting approval</p>
          </GlassCard>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 mb-6 pb-2 scrollbar-thin scrollbar-thumb-white/5">
          {STARTUP_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Quick Views */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" size="sm" className="text-xs">
            <Clock size={14} className="mr-1" /> Recently Updated
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <CheckCircle2 size={14} className="mr-1" /> Canonical Docs
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <AlertTriangle size={14} className="mr-1" /> Needs Review
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <FileSkeleton key={i} />)}
          </div>
        ) : filteredFiles.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12 text-zinc-600" />}
            title="No files in this section"
            description="Upload files to build your startup knowledge base."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file, idx) => (
              <StartupFileCard key={file.id} file={file} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StartupFileCard({ file, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 hover:border-zinc-600 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{file.name}</p>
          <div className="flex items-center gap-2 mt-1">
            {file.canonical && <Badge color="yellow" size="sm">Canonical</Badge>}
            {file.needs_review && <Badge color="amber" size="sm">Needs Review</Badge>}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Updated {new Date(file.updated).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800/50">
        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs">
          <Eye size={12} className="mr-1" /> Preview
        </Button>
        <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 text-xs ml-auto">
          <Sparkles size={12} className="mr-1" /> AI
        </Button>
      </div>
    </motion.div>
  );
}

function FileSkeleton() {
  return (
    <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-zinc-800/60" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-800/60 rounded w-2/3" />
          <div className="h-3 bg-zinc-800/40 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}
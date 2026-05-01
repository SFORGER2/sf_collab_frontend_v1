'use client';

import React, { lazy, Suspense, useState } from 'react';
import {
  FileText, Download, Share2, Edit3, Clock,
  Link as LinkIcon, Tag, Eye, ArrowLeft, MoreHorizontal, History,
} from 'lucide-react';

const VersionHistoryModal = lazy(() => import('@/components/drive/VersionHistoryModal'));
const FileLinkModal       = lazy(() => import('@/components/drive/FileLinkModal'));
const FileShareModal      = lazy(() => import('@/components/drive/FileShareModal'));

const FileDetailPage = () => {
  const file = {
    id: 1,
    name: "Q4_Strategy_Deck_v4.2.fig",
    original_name: "Q4_Strategy_Deck_v4.2.fig",
    type: "Figma File",
    size: "24.8 MB",
    modified: "2 hours ago",
    previewUrl: "/api/placeholder/800/520",
    summary: "Comprehensive Q4 growth strategy including market analysis, product roadmap, team expansion plans, and financial projections. Key focus on AI integration and deep space collaboration protocols.",
    tags: ["strategy", "q4", "roadmap", "finance", "ai"],
    linkedMilestones: [
      { id: 1, title: "Vision Alignment Sync",   status: "completed",   date: "Apr 18" },
      { id: 2, title: "Team Core Optimization",  status: "in-progress", date: "Apr 25" },
      { id: 3, title: "Launch Milestone Review", status: "pending",     date: "May 2"  },
    ],
    versions: [
      { version: "v4.2", date: "Apr 26, 2026", size: "24.8 MB", changes: "Added AI synergy section and updated financials" },
      { version: "v4.1", date: "Apr 22, 2026", size: "22.1 MB", changes: "Incorporated startup lifecycle vectors" },
      { version: "v4.0", date: "Apr 15, 2026", size: "19.4 MB", changes: "Initial core architecture diagrams" },
    ],
  };

  const [versionOpen, setVersionOpen] = useState(false);
  const [linkOpen,    setLinkOpen]    = useState(false);
  const [shareOpen,   setShareOpen]   = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-mono overflow-hidden">

      {/* Top Bar */}
      <div className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-900/50 to-cyan-900/30 rounded-xl flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">{file.name}</h1>
                <p className="text-xs text-white/50">{file.type} • {file.size}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm transition-all">
              <Edit3 className="w-4 h-4" /> Edit
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm transition-all">
              <Download className="w-4 h-4" /> Download
            </button>
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm transition-all"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="p-2 hover:bg-white/5 rounded-2xl transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-12 gap-8">

        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">

          {/* Preview */}
          <div className="relative bg-[#12121a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/50">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/5 to-transparent" />
            <div className="aspect-video bg-black flex items-center justify-center relative">
              <img src={file.previewUrl} alt="File Preview" className="max-h-full max-w-full object-contain" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity">
                <button className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/20 hover:border-white/40">
                  <Eye className="w-5 h-5" />
                  <span className="font-medium">Open Full Preview</span>
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-white/60">
                <Clock className="w-4 h-4" /> Last modified {file.modified}
              </div>
              <div className="text-white/60">Current Operator: COMMANDER_ALPHA</div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-[#12121a] border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-purple-400">◉</span> SUMMARY
              </h2>
            </div>
            <p className="text-white/80 leading-relaxed text-[15px]">{file.summary}</p>
          </div>

          {/* Tags */}
          <div className="bg-[#12121a] border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold">TAGS</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {file.tags.map((tag, i) => (
                <div key={i} className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm transition-colors cursor-pointer">
                  #{tag}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">

          {/* Linked Milestones */}
          <div className="bg-[#12121a] border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-purple-400" /> LINKED MILESTONES
              </h2>
              <button
                onClick={() => setLinkOpen(true)}
                className="text-xs text-purple-400 hover:text-purple-300 transition"
              >
                + Link
              </button>
            </div>
            <div className="space-y-4">
              {file.linkedMilestones.map((milestone) => (
                <div key={milestone.id} className="group p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all flex gap-4">
                  <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                    milestone.status === 'completed'   ? 'bg-emerald-400' :
                    milestone.status === 'in-progress' ? 'bg-amber-400'   : 'bg-white/30'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{milestone.title}</div>
                    <div className="text-xs text-white/50 mt-0.5">{milestone.date}</div>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest self-start px-2.5 py-0.5 rounded bg-white/5 text-white/40">
                    {milestone.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Version History */}
          <div className="bg-[#12121a] border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" /> VERSION HISTORY
              </h2>
              <button
                onClick={() => setVersionOpen(true)}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
              >
                <History className="w-3 h-3" /> View All
              </button>
            </div>
            <div className="space-y-6">
              {file.versions.map((ver, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-900/50 to-cyan-900/30 border border-white/10 rounded-2xl flex items-center justify-center text-xs font-mono">
                    {ver.version}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{ver.date}</div>
                    <div className="text-xs text-white/50 mt-0.5">{ver.size}</div>
                    <div className="text-xs text-white/70 mt-2 line-clamp-2">{ver.changes}</div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 self-center p-2 hover:bg-white/10 rounded-xl transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-[#12121a] border border-white/10 rounded-3xl p-8 text-xs space-y-6">
            <div>
              <div className="text-gray-300 mb-1">PROCESSING STATUS</div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-gradient-to-r from-purple-500 via-violet-400 to-purple-700 rounded-full" />
                <span className="text-emerald-400 font-medium">SYNCHRONIZING</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-2xl font-semibold text-purple-100">42</div>
                <div className="text-[10px] uppercase tracking-widest text-white/50 mt-1">Active Queries</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-purple-100">14ms</div>
                <div className="text-[10px] uppercase tracking-widest text-white/50 mt-1">Latency</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Suspense fallback={null}>
        <VersionHistoryModal isOpen={versionOpen} onClose={() => setVersionOpen(false)} file={file} />
        <FileLinkModal       isOpen={linkOpen}    onClose={() => setLinkOpen(false)}    file={file} />
        <FileShareModal      isOpen={shareOpen}   onClose={() => setShareOpen(false)}   file={file} />
      </Suspense>
    </div>
  );
};

export default FileDetailPage;
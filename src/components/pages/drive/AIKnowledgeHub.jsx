// src/components/pages/drive/AIKnowledgeHub.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Database, FileText, AlertTriangle, CheckCircle2,
  Clock, RefreshCw, Sparkles, GitMerge, GitBranch,
  Network, MemoryStick, Search, Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader, GlassCard, Button, Badge, Spinner, EmptyState } from '@/components/erp/ui';

const AI_STATS = [
  { label: 'Indexed Files', value: 142, icon: FileText, color: 'text-blue-400' },
  { label: 'Pending Index', value: 8, icon: Clock, color: 'text-amber-400' },
  { label: 'Needs Summary', value: 12, icon: Sparkles, color: 'text-purple-400' },
  { label: 'Needs Review', value: 5, icon: AlertTriangle, color: 'text-red-400' },
  { label: 'Conflicts Detected', value: 3, icon: GitMerge, color: 'text-orange-400' },
  { label: 'Duplicates', value: 7, icon: GitBranch, color: 'text-yellow-400' },
];

const ACTIONS = [
  { id: 'reindex', label: 'Reindex All', icon: RefreshCw, color: 'blue' },
  { id: 'summarize', label: 'Regenerate Summaries', icon: Sparkles, color: 'purple' },
  { id: 'detect', label: 'Detect Conflicts', icon: GitMerge, color: 'orange' },
  { id: 'canonical', label: 'Mark Canonical', icon: CheckCircle2, color: 'green' },
];

export default function AIKnowledgeHub() {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(null);

  const handleAction = async (actionId) => {
    setProcessing(actionId);
    setTimeout(() => setProcessing(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="AI Knowledge Hub"
          subtitle="Everything the AI knows about your workspace"
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {AI_STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 text-center"
              >
                <Icon className={cn('w-5 h-5 mx-auto mb-2', stat.color)} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            const isProcessing = processing === action.id;
            return (
              <Button
                key={action.id}
                variant={action.color === 'blue' ? 'primary' : 'outline'}
                onClick={() => handleAction(action.id)}
                disabled={isProcessing}
                className={cn(
                  'gap-2',
                  action.color === 'purple' && 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10',
                  action.color === 'orange' && 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10',
                  action.color === 'green' && 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10',
                )}
              >
                {isProcessing ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Icon size={16} />
                )}
                {action.label}
              </Button>
            );
          })}
        </div>

        {/* Knowledge Graph Preview */}
        <GlassCard className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Network size={16} className="text-indigo-400" />
              Knowledge Graph
            </h3>
            <Badge color="gray">Live</Badge>
          </div>
          <div className="h-48 bg-zinc-900/50 rounded-xl border border-zinc-800/50 flex items-center justify-center">
            <div className="text-center text-zinc-600">
              <Network size={32} className="mx-auto mb-2" />
              <p className="text-sm">3,421 nodes · 8,934 relations</p>
              <p className="text-xs text-zinc-700">Knowledge graph is processing</p>
            </div>
          </div>
        </GlassCard>

        {/* Recent Indexing Activity */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={16} className="text-zinc-400" />
            Recent Indexing Activity
          </h3>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-zinc-900/30 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">Document_{i}.pdf</p>
                  <p className="text-xs text-zinc-500">Indexed {i} minutes ago</p>
                </div>
                <Badge color="green">Complete</Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
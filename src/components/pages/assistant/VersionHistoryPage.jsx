/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
// src/components/pages/assistant/VersionHistoryPage.jsx
// Task 11 — Version history: GET /api/assistant/documents/:id/versions
// Task 12 — "What Changed?" panel: GET /api/assistant/documents/:id/changes?from=&to=
// Returns: { change_summary, diff_stats: { added_lines, removed_lines, similarity, samples[] } }

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  History, GitCompare, ChevronLeft, RotateCw, AlertTriangle,
  PlusCircle, MinusCircle, ArrowLeftRight, FileText, ChevronDown, Check,
} from 'lucide-react';
import assistantService, { APIError } from '@/services/assistantService';
import { cn } from '@/lib/utils';

const Motion = motion;

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,700&family=Roboto:wght@300;400;500;700&display=swap');
  .font-editorial { font-family: 'Newsreader', Georgia, serif; }
  .font-roboto    { font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif; }
  @media (prefers-reduced-motion: reduce) { .motion-safe-t { transition: none !important; } }
`;

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={cn('bg-zinc-800/50 rounded-lg animate-pulse', className)} />
);

// ─── Diff stat pill ───────────────────────────────────────────────────────────
const DiffPill = ({ icon, value, label, color }) => {
  const Icon = icon;
  return (
    <div className={cn('flex flex-col items-center px-4 py-3 rounded-xl border', color)}>
      <Icon size={14} className="mb-1" aria-hidden="true" />
      <span className="font-editorial text-xl font-bold leading-none mb-0.5">{value}</span>
      <span className="text-[9px] uppercase tracking-wider text-current opacity-70">{label}</span>
    </div>
  );
};

// ─── Sample change row ────────────────────────────────────────────────────────
const SampleChange = ({ sample, index, shouldReduceMotion }) => (
  <motion.div
    initial={shouldReduceMotion ? {} : { opacity: 0, x: -6 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05, duration: 0.25 }}
    className="font-mono text-xs rounded-xl overflow-hidden border border-white/8"
  >
    {sample.before && (
      <div className="flex items-start gap-3 px-3 py-2 bg-amber-500/6 border-b border-white/5">
        <span className="text-amber-400 shrink-0 pt-0.5" aria-label="Removed">−</span>
        <span className="text-zinc-400 leading-relaxed break-all">{sample.before}</span>
      </div>
    )}
    {sample.after && (
      <div className="flex items-start gap-3 px-3 py-2 bg-emerald-500/6">
        <span className="text-emerald-400 shrink-0 pt-0.5" aria-label="Added">+</span>
        <span className="text-zinc-300 leading-relaxed break-all">{sample.after}</span>
      </div>
    )}
    {/* Plain change (no before/after distinction) */}
    {!sample.before && !sample.after && sample.text && (
      <div className="px-3 py-2 bg-zinc-900/40">
        <span className="text-zinc-400 leading-relaxed">{sample.text}</span>
      </div>
    )}
  </motion.div>
);

// ─── What Changed panel ───────────────────────────────────────────────────────
function WhatChangedPanel({ docId, fromVersion, toVersion, onClose }) {
  const shouldReduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [changes, setChanges] = useState(null);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      // GET /api/assistant/documents/:id/changes?from=&to= (defaults to latest vs previous)
      const data = await assistantService.getDocumentChanges(docId, fromVersion, toVersion);
      setChanges(data);
    } catch (e) {
      setErr(e.isBusy ? 'Assistant is busy. Try again shortly.' : (e.message || 'Could not load changes.'));
    } finally {
      setLoading(false);
    }
  }, [docId, fromVersion, toVersion]);

  useEffect(() => { load(); }, [load]);

  const diff = changes?.diff_stats ?? {};
  const samples = diff.samples ?? [];
  const similarity = typeof diff.similarity === 'number'
    ? Math.round(diff.similarity * 100)
    : (diff.similarity ?? null);

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { x: '100%' }}
      animate={{ x: 0, opacity: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      className="fixed right-0 top-0 h-full w-full sm:max-w-xl bg-zinc-950 border-l border-white/10 z-50 overflow-y-auto font-roboto"
      role="dialog"
      aria-modal="true"
      aria-label={`What changed: version ${fromVersion ?? 'prev'} → ${toVersion ?? 'latest'}`}
    >
      {/* Sticky header */}
      <div className="sticky top-0 flex items-center justify-between px-4 sm:px-6 py-4 bg-zinc-950/95 backdrop-blur-sm border-b border-white/8 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20" aria-hidden="true">
            <GitCompare size={14} className="text-violet-400" />
          </div>
          <span className="text-sm font-semibold text-white">
            What Changed?
          </span>
          {(fromVersion || toVersion) && (
            <span className="text-[11px] text-zinc-600 font-mono">
              v{fromVersion ?? '?'} → v{toVersion ?? 'latest'}
            </span>
          )}
        </div>
        <button onClick={onClose} className={cn('p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all duration-200', FOCUS_RING)} aria-label="Close panel">
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Loading */}
        {loading && (
          <div aria-busy="true" aria-label="Loading changes" className="space-y-4">
            <Skeleton className="h-20" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <Skeleton className="h-24" />
            <Skeleton className="h-16" />
          </div>
        )}

        {/* Error */}
        {err && !loading && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-amber-500/25 bg-amber-500/8" role="alert">
            <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm text-amber-200">{err}</p>
              <button onClick={load} className={cn('mt-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors', FOCUS_RING)}>Retry</button>
            </div>
          </div>
        )}

        {/* Changes */}
        {changes && !loading && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
          >
            {/* Change summary — matches ai-news article summary highlight box */}
            <div className="p-4 rounded-xl border border-blue-500/15 bg-blue-500/8">
              <p className="text-sm text-blue-200 leading-relaxed font-roboto">
                {changes.change_summary || 'No summary available.'}
              </p>
            </div>

            {/* Diff stats */}
            <div>
              <h3 className="text-[11px] text-zinc-500 uppercase tracking-wider mb-3 font-roboto">Diff Statistics</h3>
              <div className="grid grid-cols-3 gap-3">
                <DiffPill
                  icon={PlusCircle}
                  value={diff.added_lines ?? 0}
                  label="Added"
                  color="bg-emerald-500/8 border-emerald-500/20 text-emerald-400"
                />
                <DiffPill
                  icon={MinusCircle}
                  value={diff.removed_lines ?? 0}
                  label="Removed"
                  color="bg-amber-500/8 border-amber-500/20 text-amber-400"
                />
                <DiffPill
                  icon={ArrowLeftRight}
                  value={similarity !== null ? `${similarity}%` : '—'}
                  label="Similarity"
                  color="bg-blue-500/8 border-blue-500/20 text-blue-400"
                />
              </div>
            </div>

            {/* Sample changes */}
            {samples.length > 0 && (
              <div>
                <h3 className="text-[11px] text-zinc-500 uppercase tracking-wider mb-3 font-roboto">Sample Changes</h3>
                <div className="space-y-2">
                  {samples.map((s, i) => (
                    <SampleChange key={i} sample={s} index={i} shouldReduceMotion={shouldReduceMotion} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Version row ──────────────────────────────────────────────────────────────
const VersionRow = ({
  version,
  index,
  isMultiSelected,
  onToggleMultiSelect,
  onCompare,
  shouldReduceMotion
}) => (
  <motion.div
    initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04, duration: 0.28 }}
    className={cn(
      'flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer',
      isMultiSelected
        ? 'border-blue-500/40 bg-blue-500/10'
        : 'border-white/8 bg-zinc-900/40 hover:border-white/15 hover:bg-zinc-900/60'
    )}
    onClick={() => onToggleMultiSelect(version.version)}
  >
    {/* Checkbox */}
    <div
      className={cn(
        'w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors',
        isMultiSelected
          ? 'bg-blue-600 border-blue-500 text-white'
          : 'border-white/20 bg-zinc-800/40 hover:border-white/40'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onToggleMultiSelect(version.version);
      }}
    >
      {isMultiSelected && <Check size={12} className="stroke-[3]" />}
    </div>

    {/* Version badge */}
    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border shrink-0', isMultiSelected ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-zinc-800/60 border-white/10 text-zinc-500')}>
      <span className="text-xs font-mono font-bold">v{version.version ?? (index + 1)}</span>
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-roboto text-zinc-200 font-medium truncate">
        {version.change_summary || `Version ${version.version ?? (index + 1)}`}
      </p>
      <p className="text-[11px] font-roboto text-zinc-600 mt-0.5">
        {version.created_at
          ? new Date(version.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          : '—'}
      </p>
    </div>

    {/* Compare button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onCompare(version.version);
      }}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-roboto text-zinc-400 border border-white/8 hover:text-white hover:bg-zinc-800/60 transition-all duration-200',
        FOCUS_RING
      )}
      aria-label={`Compare version ${version.version}`}
    >
      <GitCompare size={12} aria-hidden="true" />
      <span className="hidden sm:inline">Compare</span>
    </button>
  </motion.div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
export default function VersionHistoryPage() {
  const { id } = useParams();
  const shouldReduceMotion = useReducedMotion();

  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [compareFrom, setCompareFrom] = useState(null);
  const [compareTo, setCompareTo] = useState(null);

  // Multi-select version comparison state
  const [selectedVersions, setSelectedVersions] = useState([]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setPageError(null);
    try {
      const data = await assistantService.getDocumentVersions(id);
      const list = Array.isArray(data) ? data : (data?.versions ?? []);
      setVersions(list);
    } catch (e) {
      setPageError(e.message || 'Could not load version history.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleCompare = (versionNumber) => {
    // Compare selected version against the next (or latest)
    const idx = versions.findIndex((v) => v.version === versionNumber);
    const prev = versions[idx + 1]?.version;
    setCompareFrom(prev ?? null);
    setCompareTo(versionNumber);
    setShowPanel(true);
  };

  const handleQuickDiff = () => {
    // Defaults: latest vs previous
    setCompareFrom(null);
    setCompareTo(null);
    setShowPanel(true);
  };

  const handleToggleMultiSelect = (versionNumber) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionNumber)) {
        return prev.filter(v => v !== versionNumber);
      }
      if (prev.length >= 2) {
        // Keep the latest selected, replace the oldest one
        return [prev[1], versionNumber];
      }
      return [...prev, versionNumber];
    });
  };

  const handleCompareSelected = () => {
    if (selectedVersions.length !== 2) return;
    const sorted = [...selectedVersions].sort((a, b) => a - b);
    setCompareFrom(sorted[0]);
    setCompareTo(sorted[1]);
    setShowPanel(true);
  };

  return (
    <div className="min-h-[calc(100dvh-60px)] w-full font-roboto text-white px-4 sm:px-6 py-8" style={{ background: 'transparent' }}>
      <style>{STYLE}</style>

      {/* Header */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8"
      >
        <Link
          to="/assistant/documents"
          className={cn('inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-4', FOCUS_RING)}
        >
          <ChevronLeft size={13} aria-hidden="true" />
          Back to Documents
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/25" aria-hidden="true">
                <History size={18} className="text-violet-400" />
              </div>
              <span className="text-xs font-roboto font-semibold text-violet-400 uppercase tracking-widest">Document History</span>
            </div>
            <h1 className="font-editorial text-3xl md:text-4xl font-bold text-white leading-[1.15] mb-2">
              Version <span className="text-violet-400">History</span>
            </h1>
            <p className="text-sm text-zinc-400 font-roboto max-w-lg leading-relaxed">
              Track every version of this document and see exactly what changed between them.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Compare Selected button */}
            <button
              onClick={handleCompareSelected}
              disabled={selectedVersions.length !== 2}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-roboto font-semibold transition-all duration-200',
                selectedVersions.length === 2
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-zinc-900/60 border border-white/8 text-zinc-500 cursor-not-allowed',
                FOCUS_RING
              )}
              aria-label="Compare selected versions"
            >
              <GitCompare size={15} aria-hidden="true" />
              Compare Selected ({selectedVersions.length}/2)
            </button>

            {/* Quick diff button */}
            <button
              onClick={handleQuickDiff}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-roboto font-semibold',
                'bg-violet-500/15 border border-violet-500/25 text-violet-400',
                'hover:bg-violet-500/25 hover:text-white transition-all duration-200',
                FOCUS_RING
              )}
              aria-label="View latest changes"
            >
              <GitCompare size={15} aria-hidden="true" />
              What Changed?
            </button>
          </div>
        </div>
      </motion.div>

      {/* Error */}
      {pageError && !loading && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-amber-500/25 bg-amber-500/8 mb-6 font-roboto" role="alert">
          <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm text-amber-200">{pageError}</p>
            <button onClick={load} className={cn('mt-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors', FOCUS_RING)}>Retry</button>
          </div>
        </div>
      )}

      {/* Skeleton loading */}
      {loading && (
        <div className="space-y-3" aria-busy="true" aria-label="Loading versions">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-white/5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/60 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-zinc-800/60 rounded w-2/3" />
                <div className="h-2.5 bg-zinc-800/40 rounded w-1/3" />
              </div>
              <div className="h-8 w-20 bg-zinc-800/40 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !pageError && versions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <History size={36} className="text-zinc-700 mb-4" aria-hidden="true" />
          <p className="text-sm text-zinc-600">No version history found for this document.</p>
        </div>
      )}

      {/* Version list */}
      {!loading && !pageError && versions.length > 0 && (
        <div className="space-y-2.5 max-w-2xl">
          {versions.map((v, i) => (
            <VersionRow
              key={v.id || v.version || i}
              version={v}
              index={i}
              isMultiSelected={selectedVersions.includes(v.version)}
              onToggleMultiSelect={handleToggleMultiSelect}
              onCompare={handleCompare}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>
      )}

      {/* What Changed drawer */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPanel(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              aria-hidden="true"
            />
            <WhatChangedPanel
              key="panel"
              docId={id}
              fromVersion={compareFrom}
              toVersion={compareTo}
              onClose={() => setShowPanel(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

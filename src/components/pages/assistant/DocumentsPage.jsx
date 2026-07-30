// src/components/pages/assistant/DocumentsPage.jsx
// Task 8 — Upload Knowledge Files (POST /api/assistant/documents/ingest)
// Task 9 — Index My Drive (POST /api/assistant/documents/sync-drive)
// Also includes document library (GET /api/assistant/documents)

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Upload, HardDrive, Library, FileText, Trash2, History,
  CheckCircle2, AlertTriangle, RotateCw, X, Filter,
  ChevronDown, Clock, Tag, Folder, Database, Shield,
  FilePlus, Search, Eye,
} from 'lucide-react';
import { toast } from 'react-toastify';
import assistantService, { APIError } from '@/services/assistantService';
import { workspaceAPI } from '@/services/workspaceAPI';
import { cn } from '@/lib/utils';
import { Link, useSearchParams } from 'react-router-dom';

const Motion = motion;

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,700&family=Roboto:wght@300;400;500;700&display=swap');
  .font-editorial { font-family: 'Newsreader', Georgia, serif; }
  .font-roboto    { font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif; }
  .doc-scrollbar::-webkit-scrollbar { width: 4px; }
  .doc-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  @media (prefers-reduced-motion: reduce) { .motion-safe-t { transition: none !important; transform: none !important; } }
`;

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950';

const ACCEPTED_TYPES = ['pdf', 'docx', 'pptx', 'xlsx', 'csv', 'txt', 'md', 'html', 'json'];
const ACCEPT_ATTR = ACCEPTED_TYPES.map((t) => `.${t}`).join(',');

const DOC_TYPES = [
  'business_plan', 'report', 'spec', 'meeting_summary',
  'pitch_outline', 'roadmap', 'proposal', 'custom',
];
const SCOPES = ['user', 'workspace'];
const SENSITIVITIES = ['public', 'internal', 'confidential'];

// ─── Tab button ───────────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, icon, label }) => {
  const Icon = icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-roboto font-medium transition-all duration-200',
        active
          ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400'
          : 'text-zinc-500 hover:text-white border border-transparent',
        FOCUS_RING
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={15} aria-hidden="true" />
      {label}
    </button>
  );
};

// ─── File type badge ──────────────────────────────────────────────────────────
const TypeBadge = ({ ext }) => (
  <span className="text-[10px] font-roboto font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-zinc-800 text-zinc-400 border-white/8">
    {ext}
  </span>
);

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5 animate-pulse">
    <div className="w-8 h-8 rounded-lg bg-zinc-800/60 shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-zinc-800/60 rounded w-2/3" />
      <div className="h-2.5 bg-zinc-800/40 rounded w-1/3" />
    </div>
    <div className="h-3 bg-zinc-800/40 rounded w-16" />
  </div>
);

// ─── Upload tab ───────────────────────────────────────────────────────────────
function UploadTab() {
  const shouldReduceMotion = useReducedMotion();
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Metadata
  const [tags, setTags] = useState('');
  const [folder, setFolder] = useState('');
  const [docType, setDocType] = useState('');
  const [scope, setScope] = useState('user');
  const [sensitivity, setSensitivity] = useState('');

  const handleFile = (f) => {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setUploadError(`Unsupported file type: .${ext}`);
      return;
    }
    setFile(f);
    setDone(false);
    setUploadError(null);
    setProgress(0);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    setProgress(0);
    try {
      await assistantService.ingestFile(file, {
        tags: tags.trim() || undefined,
        folderName: folder.trim() || undefined,
        documentType: docType || undefined,
        scope: scope || undefined,
        sensitivity: sensitivity || undefined,
        onProgress: setProgress,
      });
      setDone(true);
      setFile(null);
      setProgress(100);
      toast.success('Document uploaded to knowledge base.');
    } catch (e) {
      setUploadError(e.isBusy ? 'Assistant is busy. Try again shortly.' : (e.message || 'Upload failed.'));
    } finally {
      setUploading(false);
    }
  };

  const inputClass = cn(
    'w-full px-3 py-2.5 rounded-xl text-sm font-roboto text-white placeholder:text-zinc-600',
    'bg-zinc-900/60 border border-white/8 focus:border-blue-500/40 focus:outline-none transition-colors',
    FOCUS_RING
  );

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload a document file"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        className={cn(
          'relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden',
          isDragging
            ? 'border-blue-500/60 bg-blue-500/8'
            : 'border-white/10 bg-zinc-900/40 hover:border-white/20 hover:bg-zinc-900/60',
          FOCUS_RING
        )}
      >
        {/* Dot-grid placeholder (ai-news pattern) */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" aria-hidden="true" />
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="sr-only"
          aria-label="Choose file to upload"
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        />
        <div className="relative flex flex-col items-center justify-center py-10 px-6 text-center">
          {file ? (
            <>
              <FileText size={28} className="text-blue-400 mb-3" aria-hidden="true" />
              <p className="text-sm font-roboto font-semibold text-white mb-1">{file.name}</p>
              <p className="text-xs font-roboto text-zinc-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </>
          ) : (
            <>
              <Upload size={28} className="text-zinc-600 mb-3" aria-hidden="true" />
              <p className="text-sm font-roboto text-zinc-300 font-medium mb-1">
                Drop a file or click to browse
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                {ACCEPTED_TYPES.map((t) => <TypeBadge key={t} ext={t} />)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Metadata fields */}
      {file && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <div>
            <label htmlFor="up-tags" className="block text-[11px] text-zinc-500 mb-1.5 font-roboto">Tags (comma-separated)</label>
            <div className="relative">
              <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" aria-hidden="true" />
              <input id="up-tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="spec, q3, finance" className={cn(inputClass, 'pl-8')} />
            </div>
          </div>
          <div>
            <label htmlFor="up-folder" className="block text-[11px] text-zinc-500 mb-1.5 font-roboto">Folder name</label>
            <div className="relative">
              <Folder size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" aria-hidden="true" />
              <input id="up-folder" type="text" value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="Investor Docs" className={cn(inputClass, 'pl-8')} />
            </div>
          </div>
          <div>
            <label htmlFor="up-type" className="block text-[11px] text-zinc-500 mb-1.5 font-roboto">Document type</label>
            <div className="relative">
              <Database size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" aria-hidden="true" />
              <select id="up-type" value={docType} onChange={(e) => setDocType(e.target.value)} className={cn(inputClass, 'pl-8 appearance-none cursor-pointer')}>
                <option value="">Select type…</option>
                {DOC_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="up-scope" className="block text-[11px] text-zinc-500 mb-1.5 font-roboto">Scope</label>
            <div className="relative">
              <Shield size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" aria-hidden="true" />
              <select id="up-scope" value={scope} onChange={(e) => setScope(e.target.value)} className={cn(inputClass, 'pl-8 appearance-none cursor-pointer')}>
                {SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="up-sensitivity" className="block text-[11px] text-zinc-500 mb-1.5 font-roboto">Sensitivity</label>
            <div className="relative">
              <Shield size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" aria-hidden="true" />
              <select id="up-sensitivity" value={sensitivity} onChange={(e) => setSensitivity(e.target.value)} className={cn(inputClass, 'pl-8 appearance-none cursor-pointer')}>
                <option value="">Not specified</option>
                {SENSITIVITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-roboto text-zinc-500">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Success */}
      {done && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-emerald-500/25 bg-emerald-500/8 font-roboto"
          role="status"
        >
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" aria-hidden="true" />
          <p className="text-sm text-emerald-300">Document ingested successfully.</p>
        </motion.div>
      )}

      {/* Error */}
      {uploadError && !uploading && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-amber-500/25 bg-amber-500/8 font-roboto" role="alert">
          <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-amber-200">{uploadError}</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-roboto font-semibold',
          'bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200',
          'disabled:opacity-40 disabled:pointer-events-none',
          FOCUS_RING
        )}
        aria-label="Upload document to knowledge base"
      >
        {uploading ? <RotateCw size={15} className="animate-spin" aria-hidden="true" /> : <Upload size={15} aria-hidden="true" />}
        {uploading ? 'Uploading…' : 'Upload to Knowledge Base'}
      </button>
    </div>
  );
}

// ─── Drive sync tab (Task 9) ───────────────────────────────────────────────────
function DriveTab() {
  const shouldReduceMotion = useReducedMotion();
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [results, setResults] = useState(null);
  const [driveError, setDriveError] = useState(null);

  // Load user's workspaces on mount
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const list = await workspaceAPI.getMyWorkspaces();
        setWorkspaces(list || []);
        if (list && list.length > 0) {
          setWorkspaceId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load workspaces for Drive sync:', err);
      } finally {
        setLoadingWorkspaces(false);
      }
    };
    loadWorkspaces();
  }, []);

  const handleSync = async () => {
    if (!workspaceId) {
      toast.warning('Please select a workspace to index.');
      return;
    }
    setSyncing(true);
    setDriveError(null);
    setResults(null);
    try {
      const data = await assistantService.syncDrive(workspaceId);
      setResults(data);
      toast.success('Drive indexing completed.');
    } catch (e) {
      setDriveError(e.isBusy ? 'Assistant is busy. Try again shortly.' : (e.message || 'Sync failed.'));
    } finally {
      setSyncing(false);
    }
  };

  const STATS = results
    ? [
        { label: 'Scanned', value: results.scanned ?? 0, color: 'text-zinc-300' },
        { label: 'Indexed', value: results.ingested ?? 0, color: 'text-blue-400' },
        { label: 'Updated', value: results.updated ?? 0, color: 'text-violet-400' },
        { label: 'Skipped', value: results.skipped ?? 0, color: 'text-zinc-500' },
        { label: 'Failed', value: results.failed ?? 0, color: 'text-amber-400' },
      ]
    : [];

  return (
    <div className="space-y-5 max-w-2xl">
      {/* CTA card — matches NewsletterWidget pattern from ai-news */}
      <div
        className="relative overflow-hidden rounded-xl border border-emerald-500/20 p-6 font-roboto"
        style={{ background: 'linear-gradient(135deg, #071a10 0%, #050a06 100%)' }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" aria-hidden="true">
            <HardDrive size={20} />
          </div>
          <div>
            <h2 className="font-editorial text-lg font-bold text-white">Index My Drive</h2>
            <p className="text-xs text-zinc-500">Sync your SF Drive documents into the AI knowledge base</p>
          </div>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed mb-5">
          This scans all files in your SF Drive and indexes their content so the AI can answer questions grounded in your actual documents.
          Re‑indexing is safe — existing documents are updated, not duplicated.
        </p>

        {/* Workspace selector */}
        <div className="mb-4">
          <label htmlFor="drive-workspace" className="block text-[11px] text-zinc-500 mb-1.5 font-roboto">
            Workspace to index
          </label>
          <select
            id="drive-workspace"
            value={workspaceId || ''}
            onChange={(e) => setWorkspaceId(Number(e.target.value))}
            disabled={loadingWorkspaces || syncing}
            className={cn(
              'w-full px-3 py-2.5 rounded-xl text-sm font-roboto text-white',
              'bg-zinc-900/60 border border-white/8 focus:border-blue-500/40 focus:outline-none transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              FOCUS_RING
            )}
          >
            {loadingWorkspaces && <option value="">Loading workspaces…</option>}
            {!loadingWorkspaces && workspaces.length === 0 && (
              <option value="">No workspaces available</option>
            )}
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing || !workspaceId || loadingWorkspaces}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold',
            'bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-200',
            'disabled:opacity-40 disabled:pointer-events-none',
            FOCUS_RING
          )}
          aria-label="Start indexing SF Drive"
        >
          {syncing
            ? <RotateCw size={15} className="animate-spin" aria-hidden="true" />
            : <HardDrive size={15} aria-hidden="true" />}
          {syncing ? 'Indexing…' : 'Index My Drive'}
        </button>
      </div>

      {/* Error */}
      {driveError && !syncing && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-amber-500/25 bg-amber-500/8 font-roboto" role="alert">
          <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-amber-200">{driveError}</p>
        </div>
      )}

      {/* Results stats card */}
      {results && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-xl border border-white/8 bg-zinc-900/60 p-5 font-roboto"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={15} className="text-emerald-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-white">Indexing Complete</span>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <span className={cn('font-editorial text-3xl font-bold leading-none mb-1', s.color)}>
                  {s.value}
                </span>
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Library tab ──────────────────────────────────────────────────────────────
function LibraryTab() {
  const shouldReduceMotion = useReducedMotion();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [libError, setLibError] = useState(null);
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deleting, setDeleting] = useState(null);

  // Workspace integration
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceFilter, setWorkspaceFilter] = useState('');

  // View modal state
  const [viewingDoc, setViewingDoc] = useState(null);
  const [docContent, setDocContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(null); // stores doc.id when viewing

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const list = await workspaceAPI.getMyWorkspaces();
        setWorkspaces(list || []);
      } catch (err) {
        console.error("Error loading workspaces for filters:", err);
      }
    };
    fetchWorkspaces();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLibError(null);
    try {
      const data = await assistantService.listDocuments({
        workspaceId: workspaceFilter || undefined,
        scope: scopeFilter || undefined,
        documentType: typeFilter || undefined,
        limit: 50,
      });
      setDocs(Array.isArray(data) ? data : (data?.documents ?? []));
    } catch (e) {
      setLibError(e.message || 'Could not load documents.');
    } finally {
      setLoading(false);
    }
  }, [workspaceFilter, scopeFilter, typeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This also removes its vectors.`)) return;
    setDeleting(id);
    try {
      await assistantService.deleteDocument(id);
      setDocs((prev) => prev.filter((d) => d.id !== id));
      toast.success('Document deleted.');
    } catch (e) {
      toast.error(e.message || 'Delete failed.');
    } finally {
      setDeleting(null);
    }
  };

  const handleView = async (doc) => {
    setLoadingContent(doc.id);
    try {
      const data = await assistantService.getDocument(doc.id, true);
      setViewingDoc(doc);
      setDocContent(data?.text || data?.content || 'No text extracted for this document.');
    } catch (e) {
      toast.error(e.message || 'Could not fetch document content.');
    } finally {
      setLoadingContent(null);
    }
  };

  const filtered = docs.filter((d) =>
    !search || d.title?.toLowerCase().includes(search.toLowerCase())
  );

  const selectClass = cn(
    'px-3 py-2 rounded-xl text-xs font-roboto text-white bg-zinc-900/60 border border-white/8',
    'focus:border-blue-500/40 focus:outline-none transition-colors appearance-none cursor-pointer',
    FOCUS_RING
  );

  return (
    <div className="space-y-4 font-roboto">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents…"
            className={cn('w-full pl-8 pr-3 py-2 rounded-xl text-xs text-white placeholder:text-zinc-600 bg-zinc-900/60 border border-white/8 focus:border-blue-500/40 focus:outline-none transition-colors', FOCUS_RING)}
            aria-label="Search documents"
          />
        </div>
        <div className="relative">
          <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" aria-hidden="true" />
          <select value={workspaceFilter} onChange={(e) => setWorkspaceFilter(e.target.value)} className={cn(selectClass, 'pl-8')}>
            <option value="">All workspaces</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" aria-hidden="true" />
          <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)} className={cn(selectClass, 'pl-8')}>
            <option value="">All scopes</option>
            {SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="relative">
          <Database size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" aria-hidden="true" />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={cn(selectClass, 'pl-8')}>
            <option value="">All types</option>
            {DOC_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <button onClick={load} className={cn('p-2 rounded-xl text-zinc-500 hover:text-white border border-white/8 hover:bg-zinc-800/60 transition-all duration-200', FOCUS_RING)} aria-label="Refresh document list">
          <RotateCw size={14} aria-hidden="true" />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/8 bg-zinc-900/40 overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-2.5 border-b border-white/8 bg-zinc-950/40">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Title</span>
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider hidden sm:block">Version</span>
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider hidden sm:block">Created</span>
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Actions</span>
        </div>

        {libError && (
          <div className="px-4 py-6 text-center" role="alert">
            <AlertTriangle size={18} className="text-amber-400 mx-auto mb-2" aria-hidden="true" />
            <p className="text-xs text-zinc-500">{libError}</p>
            <button onClick={load} className={cn('mt-2 text-xs text-blue-400 hover:text-white transition-colors', FOCUS_RING)}>Retry</button>
          </div>
        )}

        {loading && [0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)}

        {!loading && !libError && filtered.length === 0 && (
          <div className="py-12 text-center">
            <Library size={28} className="text-zinc-700 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm text-zinc-600">
              {docs.length === 0 ? 'No documents indexed yet.' : 'No documents match your filters.'}
            </p>
          </div>
        )}

        <AnimatePresence>
          {!loading && filtered.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-4 py-3 border-b border-white/5 hover:bg-zinc-800/30 transition-colors duration-150"
            >
              {/* Title + tags */}
              <div className="min-w-0">
                <p className="text-sm font-roboto text-zinc-200 truncate">{doc.title || 'Untitled'}</p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {doc.document_type && (
                    <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full">
                      {doc.document_type.replace(/_/g, ' ')}
                    </span>
                  )}
                  {doc.tags && doc.tags.split(',').slice(0, 2).map((t) => (
                    <span key={t} className="text-[10px] text-zinc-600 font-roboto">#{t.trim()}</span>
                  ))}
                </div>
              </div>

              {/* Version */}
              <span className="text-xs font-roboto text-zinc-600 hidden sm:block">
                v{doc.version || 1}
              </span>

              {/* Date */}
              <span className="text-[10px] font-roboto text-zinc-600 hidden sm:block whitespace-nowrap">
                {doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {/* View Document content action */}
                <button
                  onClick={() => handleView(doc)}
                  disabled={loadingContent === doc.id}
                  className={cn('p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/60 transition-all duration-200 disabled:opacity-50', FOCUS_RING)}
                  aria-label={`View content of ${doc.title}`}
                  title="View content"
                >
                  {loadingContent === doc.id ? (
                    <RotateCw size={13} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Eye size={13} aria-hidden="true" />
                  )}
                </button>
                <Link
                  to={`/assistant/documents/${doc.id}/versions`}
                  className={cn('p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/60 transition-all duration-200', FOCUS_RING)}
                  aria-label={`View versions of ${doc.title}`}
                  title="Version history"
                >
                  <History size={13} aria-hidden="true" />
                </Link>
                <button
                  onClick={() => handleDelete(doc.id, doc.title)}
                  disabled={deleting === doc.id}
                  className={cn('p-1.5 rounded-lg text-zinc-600 hover:text-amber-400 hover:bg-amber-500/8 transition-all duration-200 disabled:opacity-50', FOCUS_RING)}
                  aria-label={`Delete ${doc.title}`}
                  title="Delete document"
                >
                  {deleting === doc.id ? (
                    <RotateCw size={13} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 size={13} aria-hidden="true" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* View Document Content Modal */}
      <AnimatePresence>
        {viewingDoc && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 font-roboto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingDoc(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] z-10"
              role="dialog"
              aria-modal="true"
              aria-label={`Document content: ${viewingDoc.title}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-zinc-900/40">
                <div className="min-w-0">
                  <h3 className="font-editorial text-lg font-bold text-white truncate">{viewingDoc.title}</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Version {viewingDoc.version || 1} • {viewingDoc.document_type?.toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setViewingDoc(null)}
                  className={cn('p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all duration-200', FOCUS_RING)}
                  aria-label="Close modal"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 p-6 overflow-y-auto doc-scrollbar text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {docContent}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const shouldReduceMotion = useReducedMotion();
  const [searchParams] = useSearchParams();
  const VALID_TABS = ['upload', 'drive', 'library'];
  const initialTab = VALID_TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'upload';
  const [tab, setTab] = useState(initialTab);

  const TABS = [
    { id: 'upload',  label: 'Upload File',    icon: Upload },
    { id: 'drive',   label: 'Index My Drive', icon: HardDrive },
    { id: 'library', label: 'Library',        icon: Library },
  ];

  return (
    <div className="min-h-[calc(100dvh-60px)] w-full font-roboto text-white px-4 sm:px-6 py-8" style={{ background: 'transparent' }}>
      <style>{STYLE}</style>

      {/* Page header */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/25">
            <FilePlus size={18} className="text-blue-400" aria-hidden="true" />
          </div>
          <span className="text-xs font-roboto font-semibold text-blue-400 uppercase tracking-widest">Knowledge Base</span>
        </div>
        <h1 className="font-editorial text-3xl md:text-4xl font-bold text-white mb-2 leading-[1.15]">
          AI <span className="text-blue-400">Documents</span>
        </h1>
        <p className="font-roboto text-zinc-400 text-sm max-w-xl leading-relaxed">
          Upload documents, sync your SF Drive, and manage the AI knowledge base that grounds every answer.
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-6 border-b border-white/8 pb-3"
        role="tablist"
        aria-label="Document management tabs"
      >
        {TABS.map((t) => (
          <TabBtn
            key={t.id}
            active={tab === t.id}
            onClick={() => setTab(t.id)}
            icon={t.icon}
            label={t.label}
          />
        ))}
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          role="tabpanel"
          aria-label={TABS.find((t) => t.id === tab)?.label}
        >
          {tab === 'upload'  && <UploadTab />}
          {tab === 'drive'   && <DriveTab />}
          {tab === 'library' && <LibraryTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Unlink, Flag, CheckSquare, Search, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getApiUrl } from '@/utils/config';
import { requestInterceptor, requestErrorInterceptor, responseInterceptor, responseErrorInterceptor } from '@/utils/APIs/interceptors';
import driveService from '@/services/driveService';

// ── Internal API instance ─────────────────────────────────────────────────────
const internalApi = axios.create({ baseURL: `${getApiUrl()}/api` });
internalApi.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
internalApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ── Entity type config ────────────────────────────────────────────────────────
const ENTITY_TYPES = [
  { key: 'milestone', label: 'Milestone', icon: Flag,        color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  { key: 'task',      label: 'Task',      icon: CheckSquare, color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
];

// ── LinkedBadge ───────────────────────────────────────────────────────────────
function LinkedBadge({ link, onUnlink }) {
  const cfg = ENTITY_TYPES.find(t => t.key === link.entity_type) || ENTITY_TYPES[0];
  const Icon = cfg.icon;
  const [busy, setBusy] = useState(false);

  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl border"
      style={{ borderColor: `${cfg.color}44`, background: cfg.bg }}
    >
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${cfg.color}22` }}>
          <Icon size={14} style={{ color: cfg.color }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{link.entity_name || `${cfg.label} #${link.entity_id}`}</p>
          <p className="text-xs" style={{ color: cfg.color }}>{cfg.label}</p>
        </div>
      </div>
      <button
        onClick={async () => { setBusy(true); try { await onUnlink(link.entity_type, link.entity_id); } finally { setBusy(false); } }}
        disabled={busy}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#64748b] hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-40"
      >
        <Unlink size={12} className={busy ? 'animate-pulse' : ''} /> Unlink
      </button>
    </div>
  );
}

// ── Search result row ─────────────────────────────────────────────────────────
function SearchResult({ item, type, onLink, linking }) {
  const cfg = ENTITY_TYPES.find(t => t.key === type);
  const Icon = cfg.icon;
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-[#2a2d3e] bg-[#1e2130] hover:border-[#3d4160] transition">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-[#2a2d3e] flex items-center justify-center flex-shrink-0">
          <Icon size={14} className="text-[#64748b]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{item.title || item.name}</p>
          {item.status && (
            <p className="text-xs text-[#64748b] capitalize">{item.status.replace('_', ' ')}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => onLink(item.id)}
        disabled={linking}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition disabled:opacity-50 flex-shrink-0"
        style={{ background: cfg.color }}
      >
        {linking ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
        Link
      </button>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function FileLinkModal({ isOpen, onClose, file }) {
  const [activeType, setActiveType]     = useState('milestone');
  const [linkedObjects, setLinkedObjects] = useState([]);
  const [results, setResults]           = useState([]);
  const [search, setSearch]             = useState('');
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [searching, setSearching]       = useState(false);
  const [linking, setLinking]           = useState(false);

  // Load linked objects
  useEffect(() => {
    if (!isOpen || !file) return;
    setSearch(''); setResults([]);
    (async () => {
      setLoadingLinks(true);
      try {
        const data = await driveService.getLinkedObjects(file.id);
        setLinkedObjects(data.links || []);
      } catch {
        toast.error('Could not load linked objects.');
      } finally {
        setLoadingLinks(false);
      }
    })();
  }, [isOpen, file]);

  // Search milestones or tasks
  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const endpoint = activeType === 'milestone' ? '/milestones' : '/tasks';
        const res = await internalApi.get(endpoint, { params: { search, per_page: 8 } });
        const items = res.data?.milestones || res.data?.tasks || res.data || [];
        setResults(Array.isArray(items) ? items : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [search, activeType]);

  const handleLink = async (entityId) => {
    setLinking(true);
    try {
      if (activeType === 'milestone') {
        await driveService.linkToMilestone(file.id, entityId);
      } else {
        await driveService.linkToTask(file.id, entityId);
      }
      const data = await driveService.getLinkedObjects(file.id);
      setLinkedObjects(data.links || []);
      setSearch(''); setResults([]);
      toast.success('File linked successfully.');
    } catch {
      toast.error('Failed to link file.');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async (entityType, entityId) => {
    try {
      await driveService.unlink(file.id, entityType, entityId);
      setLinkedObjects(prev => prev.filter(l => !(l.entity_type === entityType && l.entity_id === entityId)));
      toast.success('Link removed.');
    } catch {
      toast.error('Failed to remove link.');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1a1d27] rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col border border-[#2a2d3e] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2d3e]">
              <div>
                <h2 className="text-lg font-bold text-white">Link File</h2>
                <p className="text-xs text-[#64748b] mt-0.5 truncate max-w-xs">{file?.original_name}</p>
              </div>
              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-[#64748b] hover:text-white transition"
              >
                <X size={20} />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {/* Type tabs */}
              <div className="flex gap-2">
                {ENTITY_TYPES.map(({ key, label, icon: Icon, color }) => (
                  <button
                    key={key}
                    onClick={() => { setActiveType(key); setSearch(''); setResults([]); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: activeType === key ? `${color}22` : 'var(--surface-drive)',
                      color:      activeType === key ? color : '#64748b',
                      border:     `1px solid ${activeType === key ? `${color}55` : '#2a2d3e'}`,
                    }}
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${activeType === 'milestone' ? 'milestones' : 'tasks'}…`}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#2a2d3e] bg-[#0f1117] text-white text-sm placeholder:text-[#64748b] outline-none focus:border-[#6366f1] transition"
                />
                {searching && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] animate-spin" />
                )}
              </div>

              {/* Search results */}
              {results.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-[#64748b] font-semibold uppercase tracking-wider">Results</p>
                  {results.map(item => (
                    <SearchResult
                      key={item.id}
                      item={item}
                      type={activeType}
                      onLink={handleLink}
                      linking={linking}
                    />
                  ))}
                </div>
              )}

              {search && !searching && results.length === 0 && (
                <p className="text-sm text-[#64748b] text-center py-4">No results found.</p>
              )}

              {/* Currently linked */}
              <div className="space-y-2">
                <p className="text-xs text-[#64748b] font-semibold uppercase tracking-wider">
                  Linked Objects ({linkedObjects.length})
                </p>
                {loadingLinks ? (
                  <div className="flex justify-center py-6">
                    <div className="w-5 h-5 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : linkedObjects.length === 0 ? (
                  <p className="text-sm text-[#64748b] italic py-2">No linked objects yet.</p>
                ) : (
                  linkedObjects.map((link, i) => (
                    <LinkedBadge key={i} link={link} onUnlink={handleUnlink} />
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
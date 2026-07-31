import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Shield, Users, User, Eye, Edit3, Trash2, Loader2, Building2, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getApiUrl } from '@/utils/config';
import { requestInterceptor, requestErrorInterceptor, responseInterceptor, responseErrorInterceptor } from '@/utils/APIs/interceptors';
import driveService from '@/services/driveService';

const internalApi = axios.create({ baseURL: `${getApiUrl()}/api` });
internalApi.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
internalApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ── Config ────────────────────────────────────────────────────────────────────
const PERMISSION_LEVELS = [
  { key: 'view', label: 'View',  icon: Eye,   desc: 'Can view and download' },
  { key: 'edit', label: 'Edit',  icon: Edit3, desc: 'Can view and edit'     },
];

const SHARE_TABS = [
  { key: 'user',      label: 'User',      icon: User      },
  { key: 'workspace', label: 'Workspace', icon: Building2 },
];

// ── Permission toggle ─────────────────────────────────────────────────────────
function PermissionToggle({ value, onChange, disabled }) {
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-[#0f1117] border border-[#2a2d3e]">
      {PERMISSION_LEVELS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all disabled:opacity-40"
          style={{
            background: value === key ? '#6366f1' : 'transparent',
            color:      value === key ? '#fff' : '#64748b',
          }}
        >
          <Icon size={12} /> {label}
        </button>
      ))}
    </div>
  );
}

// ── Existing permission row ───────────────────────────────────────────────────
function PermissionRow({ perm, onUpdate, onRevoke }) {
  const [level,    setLevel]    = useState(perm.permission_level);
  const [updating, setUpdating] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const handleLevelChange = async (newLevel) => {
    setUpdating(true);
    try {
      await onUpdate(perm.id, newLevel);
      setLevel(newLevel);
    } finally {
      setUpdating(false);
    }
  };

  const Icon = perm.subject_type === 'workspace' ? Building2 : User;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#2a2d3e] bg-[#1e2130]">
      <div className="w-8 h-8 rounded-lg bg-[#2a2d3e] flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-[#94a3b8]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">
          {perm.subject_name || `${perm.subject_type} #${perm.subject_id}`}
        </p>
        <p className="text-xs text-[#64748b] capitalize">{perm.subject_type}</p>
      </div>
      <PermissionToggle value={level} onChange={handleLevelChange} disabled={updating || revoking} />
      <button
        onClick={async () => { setRevoking(true); try { await onRevoke(perm.id); } finally { setRevoking(false); } }}
        disabled={revoking || updating}
        className="p-1.5 rounded-lg text-[#64748b] hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-40 flex-shrink-0"
      >
        {revoking ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      </button>
    </div>
  );
}

// ── Search result for adding ──────────────────────────────────────────────────
function AddResult({ item, type, onShare, sharing }) {
  const [level, setLevel] = useState('view');
  const Icon = type === 'workspace' ? Building2 : User;

  return (
    <div className="p-3 rounded-xl border border-[#2a2d3e] bg-[#1e2130] space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#2a2d3e] flex items-center justify-center flex-shrink-0">
          <Icon size={15} className="text-[#94a3b8]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {item.first_name ? `${item.first_name} ${item.last_name}` : item.name}
          </p>
          <p className="text-xs text-[#64748b]">{item.email || item.tagline || type}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <PermissionToggle value={level} onChange={setLevel} disabled={sharing} />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onShare(item.id, level)}
          disabled={sharing}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#6366f1] text-white hover:bg-[#5558e0] disabled:opacity-50 transition ml-auto"
        >
          {sharing ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          Share
        </motion.button>
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function FileShareModal({ isOpen, onClose, file }) {
  const [tab,          setTab]          = useState('user');
  const [permissions,  setPermissions]  = useState([]);
  const [results,      setResults]      = useState([]);
  const [search,       setSearch]       = useState('');
  const [loadingPerms, setLoadingPerms] = useState(true);
  const [searching,    setSearching]    = useState(false);
  const [sharing,      setSharing]      = useState(false);

  // Load existing permissions
  useEffect(() => {
    if (!isOpen || !file) return;
    setSearch(''); setResults([]);
    (async () => {
      setLoadingPerms(true);
      try {
        const data = await driveService.getPermissions(file.id);
        setPermissions(data.permissions || []);
      } catch {
        toast.error('Could not load permissions.');
      } finally {
        setLoadingPerms(false);
      }
    })();
  }, [isOpen, file]);

  // Search users or workspaces
  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const endpoint = tab === 'user' ? '/users' : '/startups';
        const res = await internalApi.get(endpoint, { params: { search, per_page: 6 } });
        const items = res.data?.users || res.data?.startups || res.data || [];
        setResults(Array.isArray(items) ? items : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [search, tab]);

  const handleShare = async (subjectId, level) => {
    setSharing(true);
    try {
      if (tab === 'user') {
        await driveService.shareWithUser(file.id, subjectId, level);
      } else {
        await driveService.shareWithWorkspace(file.id, subjectId, level);
      }
      const data = await driveService.getPermissions(file.id);
      setPermissions(data.permissions || []);
      setSearch(''); setResults([]);
      toast.success('Access granted.');
    } catch {
      toast.error('Failed to share file.');
    } finally {
      setSharing(false);
    }
  };

  const handleUpdate = async (permId, level) => {
    try {
      await driveService.updatePermission(file.id, permId, level);
      setPermissions(prev => prev.map(p => p.id === permId ? { ...p, permission_level: level } : p));
    } catch {
      toast.error('Failed to update permission.');
    }
  };

  const handleRevoke = async (permId) => {
    if (!window.confirm('Remove this person\'s access?')) return;
    try {
      await driveService.revokePermission(file.id, permId);
      setPermissions(prev => prev.filter(p => p.id !== permId));
      toast.success('Access removed.');
    } catch {
      toast.error('Failed to revoke access.');
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
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#6366f1]/20 flex items-center justify-center">
                  <Shield size={18} className="text-[#6366f1]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Share File</h2>
                  <p className="text-xs text-[#64748b] mt-0.5 truncate max-w-xs">{file?.original_name}</p>
                </div>
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
              {/* Tabs */}
              <div className="flex gap-2">
                {SHARE_TABS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => { setTab(key); setSearch(''); setResults([]); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: tab === key ? 'rgba(99,102,241,0.15)' : 'var(--surface-drive)',
                      color:      tab === key ? '#6366f1'               : '#64748b',
                      border:     `1px solid ${tab === key ? 'rgba(99,102,241,0.4)' : '#2a2d3e'}`,
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
                  placeholder={`Search ${tab === 'user' ? 'users by name or email' : 'workspaces'}…`}
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
                    <AddResult
                      key={item.id}
                      item={item}
                      type={tab}
                      onShare={handleShare}
                      sharing={sharing}
                    />
                  ))}
                </div>
              )}

              {search && !searching && results.length === 0 && (
                <p className="text-sm text-[#64748b] text-center py-3">No results found.</p>
              )}

              {/* Current permissions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#64748b] font-semibold uppercase tracking-wider">
                    Who has access ({permissions.length})
                  </p>
                </div>

                {loadingPerms ? (
                  <div className="flex justify-center py-6">
                    <div className="w-5 h-5 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : permissions.length === 0 ? (
                  <div className="text-center py-6 rounded-xl border border-dashed border-[#2a2d3e]">
                    <Users size={24} className="text-[#2a2d3e] mx-auto mb-2" />
                    <p className="text-sm text-[#64748b]">Only you have access.</p>
                  </div>
                ) : (
                  permissions.map(perm => (
                    <PermissionRow
                      key={perm.id}
                      perm={perm}
                      onUpdate={handleUpdate}
                      onRevoke={handleRevoke}
                    />
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
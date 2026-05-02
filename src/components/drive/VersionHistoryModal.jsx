import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, GitCompare, Clock, User } from 'lucide-react';
import { toast } from 'react-toastify';
import driveService from '@/services/driveService';

const fmt = (d) => d
  ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';

const fmtB = (b) => {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
};

function DiffView({ diff, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
      className="mt-4 rounded-xl border border-white/10 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-[#1e2130] border-b border-white/10">
        <span className="text-sm font-semibold text-white font-mono">Comparison</span>
        <button onClick={onClose} className="text-white/40 hover:text-white transition"><X size={16} /></button>
      </div>
      <div className="grid grid-cols-2 divide-x divide-white/10">
        {['version_a', 'version_b'].map((key, i) => (
          <div key={key} className="p-4 bg-[#0a0a0f]">
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-2">{i === 0 ? '← Older' : 'Newer →'}</p>
            <p className="text-xs text-white/60 font-mono whitespace-pre-wrap leading-relaxed">
              {diff?.[key]?.summary || diff?.[key]?.preview || 'No preview available'}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function VersionCard({ version, isLatest, isSelected, onSelect, onRestore, restoring }) {
  return (
    <div
      onClick={() => onSelect(version.id)}
      className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-purple-500/60 bg-purple-500/10' : 'border-white/10 bg-[#12121a] hover:border-white/20'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono border ${isLatest ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-white/5 text-white/50 border-white/10'}`}>
            v{version.version_number}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-white truncate">{version.change_summary || `Version ${version.version_number}`}</p>
              {isLatest && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex-shrink-0">CURRENT</span>}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
              <span className="flex items-center gap-1"><Clock size={11} /> {fmt(version.created_at)}</span>
              {version.changed_by && <span className="flex items-center gap-1"><User size={11} /> {version.changed_by.name}</span>}
              {version.size_bytes && <span>{fmtB(version.size_bytes)}</span>}
            </div>
          </div>
        </div>
        {!isLatest && (
          <button
            onClick={(e) => { e.stopPropagation(); onRestore(version.id); }}
            disabled={restoring}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 text-white/50 hover:bg-purple-500/20 hover:text-purple-400 border border-white/10 transition disabled:opacity-40 flex-shrink-0"
          >
            <RotateCcw size={12} className={restoring ? 'animate-spin' : ''} /> Restore
          </button>
        )}
      </div>
    </div>
  );
}

export default function VersionHistoryModal({ isOpen, onClose, file }) {
  const [versions,  setVersions]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [selected,  setSelected]  = useState([]);
  const [diff,      setDiff]      = useState(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    if (!isOpen || !file) return;
    setSelected([]); setDiff(null);
    (async () => {
      setLoading(true);
      try {
        const data = await driveService.getVersions(file.id);
        setVersions(data.versions || []);
      } catch { toast.error('Could not load version history.'); }
      finally   { setLoading(false); }
    })();
  }, [isOpen, file]);

  const handleSelect = (id) => {
    setDiff(null);
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 2 ? [prev[1], id] : [...prev, id]);
  };

  const handleRestore = async (versionId) => {
    if (!window.confirm('Restore this version?')) return;
    setRestoring(true);
    try {
      await driveService.restoreVersion(file.id, versionId);
      toast.success('Version restored.');
      const data = await driveService.getVersions(file.id);
      setVersions(data.versions || []);
      setSelected([]);
    } catch { toast.error('Failed to restore.'); }
    finally   { setRestoring(false); }
  };

  const handleCompare = async () => {
    if (selected.length !== 2) return;
    setComparing(true);
    try {
      const data = await driveService.compareVersions(file.id, selected[0], selected[1]);
      setDiff(data);
    } catch { toast.error('Comparison not available.'); }
    finally   { setComparing(false); }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#11131a] rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col border border-white/10 overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white font-mono">Version History</h2>
                <p className="text-xs text-white/40 mt-0.5 truncate max-w-xs">{file?.original_name || file?.name}</p>
              </div>
              <motion.button whileHover={{ rotate: 90 }} onClick={onClose} className="text-white/40 hover:text-white transition"><X size={20} /></motion.button>
            </div>

            {selected.length === 2 && (
              <div className="px-6 py-3 bg-purple-500/10 border-b border-purple-500/20 flex items-center justify-between">
                <p className="text-sm text-purple-400 font-medium font-mono">2 versions selected</p>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleCompare} disabled={comparing}
                  className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-lg bg-purple-500 text-white hover:bg-purple-400 disabled:opacity-50 transition">
                  <GitCompare size={14} className={comparing ? 'animate-pulse' : ''} />
                  {comparing ? 'Comparing…' : 'Compare'}
                </motion.button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {loading ? (
                <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : versions.length === 0 ? (
                <div className="text-center py-12"><Clock size={32} className="text-white/10 mx-auto mb-3" /><p className="text-white/30 text-sm font-mono">No version history yet.</p></div>
              ) : (
                <>
                  <p className="text-xs text-white/30 font-mono">Select up to 2 versions to compare. Click Restore to roll back.</p>
                  {versions.map((v, i) => (
                    <VersionCard key={v.id} version={v} isLatest={i === 0}
                      isSelected={selected.includes(v.id)}
                      onSelect={handleSelect} onRestore={handleRestore} restoring={restoring} />
                  ))}
                  <AnimatePresence>{diff && <DiffView diff={diff} onClose={() => setDiff(null)} />}</AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
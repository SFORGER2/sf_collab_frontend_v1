// src/components/pages/drive/Trash.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, RotateCw, AlertCircle, Clock, User,
  FileText, Folder, CheckSquare, Square,
  XCircle, History, Calendar, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader, GlassCard, Button, Badge, Spinner, EmptyState } from '@/components/erp/ui';

export default function Trash() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadTrash = async () => {
      setLoading(true);
      try {
        const data = [
          { id: 1, name: 'Old Proposal v2.pdf', deleted_at: '2026-01-10', deleted_by: 'Sarah Chen', retention_days: 30 },
          { id: 2, name: 'Meeting Notes Q4.docx', deleted_at: '2026-01-08', deleted_by: 'Alex Rivera', retention_days: 30 },
          { id: 3, name: 'Draft Pitch Deck.pptx', deleted_at: '2026-01-05', deleted_by: 'You', retention_days: 30 },
        ];
        setFiles(data);
      } catch (err) {
        console.error('Failed to load trash:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTrash();
  }, []);

  const handleSelectAll = () => {
    if (selectedIds.length === files.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(files.map(f => f.id));
    }
  };

  const handleRestore = (id) => {
    // Simulate restore
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handlePermanentDelete = (id) => {
    if (window.confirm('Delete permanently? This cannot be undone.')) {
      setFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleBulkRestore = () => {
    setFiles(prev => prev.filter(f => !selectedIds.includes(f.id)));
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Permanently delete ${selectedIds.length} files?`)) {
      setFiles(prev => prev.filter(f => !selectedIds.includes(f.id)));
      setSelectedIds([]);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Trash"
          subtitle="Files awaiting permanent deletion"
          actions={
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <>
                  <Button variant="success" size="sm" onClick={handleBulkRestore}>
                    <RotateCw size={16} className="mr-1" /> Restore ({selectedIds.length})
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                    <Trash2 size={16} className="mr-1" /> Delete Forever
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm"><History size={16} className="mr-1" /> Retention Policy</Button>
            </div>
          }
        />

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trashed files..."
            className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 transition-colors"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <TrashSkeleton key={i} />)}
          </div>
        ) : filteredFiles.length === 0 ? (
          <EmptyState
            icon={<Trash2 className="w-12 h-12 text-zinc-600" />}
            title="Trash is empty"
            description="Deleted files will appear here for 30 days before permanent removal."
          />
        ) : (
          <div className="bg-[#121215] border border-zinc-800/80 rounded-xl overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800 bg-zinc-900/30">
              <button onClick={handleSelectAll} className="text-zinc-500 hover:text-white">
                {selectedIds.length === files.length ? (
                  <CheckSquare size={16} />
                ) : (
                  <Square size={16} />
                )}
              </button>
              <span className="text-xs text-zinc-500 font-medium">Select All</span>
              <span className="text-xs text-zinc-500 ml-auto">
                {files.length} files · Expires in {files[0]?.retention_days} days
              </span>
            </div>
            {filteredFiles.map((file, idx) => (
              <TrashRow
                key={file.id}
                file={file}
                index={idx}
                isSelected={selectedIds.includes(file.id)}
                onSelect={() => {
                  setSelectedIds(prev =>
                    prev.includes(file.id)
                      ? prev.filter(id => id !== file.id)
                      : [...prev, file.id]
                  );
                }}
                onRestore={() => handleRestore(file.id)}
                onDelete={() => handlePermanentDelete(file.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TrashRow({ file, index, isSelected, onSelect, onRestore, onDelete }) {
  const daysLeft = file.retention_days - Math.floor((Date.now() - new Date(file.deleted_at).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        'flex items-center gap-4 px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors',
        isSelected && 'bg-indigo-500/5'
      )}
    >
      <button onClick={onSelect} className="text-zinc-500 hover:text-white">
        {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
      </button>
      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
        <FileText className="w-4 h-4 text-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{file.name}</p>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <User size={12} />
            Deleted by {file.deleted_by}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {new Date(file.deleted_at).toLocaleDateString()}
          </span>
          {daysLeft > 0 ? (
            <span className="flex items-center gap-1 text-amber-400">
              <AlertCircle size={12} />
              {daysLeft} days left
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-400">
              <AlertCircle size={12} />
              Expiring soon
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300" onClick={onRestore}>
          <RotateCw size={14} className="mr-1" /> Restore
        </Button>
        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={onDelete}>
          <XCircle size={14} className="mr-1" /> Delete
        </Button>
      </div>
    </motion.div>
  );
}

function TrashSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800/50 animate-pulse">
      <div className="w-4 h-4 bg-zinc-800/60 rounded" />
      <div className="w-8 h-8 rounded-lg bg-zinc-800/60" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 bg-zinc-800/60 rounded w-2/3" />
        <div className="h-3 bg-zinc-800/40 rounded w-1/2" />
      </div>
    </div>
  );
}
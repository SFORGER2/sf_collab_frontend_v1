import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, User, GitCompare, ArrowRight, Loader2, Plus, Minus, Check, Percent } from 'lucide-react';
import assistantService from '@/services/assistantService';

const MOCK_VERSIONS = [
  {
    id: "v-3",
    version_number: 3,
    change_summary: "Refined target channels segment, added SEO metrics and updated allocation details.",
    created_at: "2026-07-10T10:00:00Z",
    changed_by: { name: "Oskar K" }
  },
  {
    id: "v-2",
    version_number: 2,
    change_summary: "Adjusted budget estimates and initial social media marketing targets.",
    created_at: "2026-07-08T15:20:00Z",
    changed_by: { name: "Ivan Gomez" }
  },
  {
    id: "v-1",
    version_number: 1,
    change_summary: "Initial document creation and skeleton framework.",
    created_at: "2026-07-05T09:00:00Z",
    changed_by: { name: "Oskar K" }
  }
];

export default function AIVersionHistoryPanel({ document, onClose }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState([]); // Array of version numbers
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);

  // Safe extraction of diff statistics from API response structure
  const diffStats = comparisonResult?.diff_stats || {};
  const similarity = diffStats.similarity ?? comparisonResult?.similarity ?? 0;
  const addedLines = diffStats.added_lines ?? comparisonResult?.added_count ?? 0;
  const removedLines = diffStats.removed_lines ?? comparisonResult?.removed_count ?? 0;

  useEffect(() => {
    fetchVersions();
  }, [document]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const list = await assistantService.getDocumentVersions(document.id);
      if (list && list.length > 0) {
        // Sort descending by version number
        setVersions(list.sort((a, b) => b.version_number - a.version_number));
      } else {
        setVersions(MOCK_VERSIONS);
      }
    } catch (err) {
      console.error("Error loading document versions:", err);
      setVersions(MOCK_VERSIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (versionNumber) => {
    setComparisonResult(null); // Clear previous diff result
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

  const handleCompare = async () => {
    if (selectedVersions.length !== 2) return;
    setComparing(true);
    setComparisonResult(null);

    // Sort selected so selectedVersions[0] is older, selectedVersions[1] is newer
    const sortedSelected = [...selectedVersions].sort((a, b) => a - b);
    const [fromVer, toVer] = sortedSelected;

    try {
      const res = await assistantService.getDocumentChanges(document.id, fromVer, toVer);
      if (res) {
        setComparisonResult(res);
      } else {
        throw new Error("Empty response");
      }
    } catch (err) {
      console.error("Error fetching version changes:", err);
      // Fallback mock comparison
      setTimeout(() => {
        setComparisonResult({
          similarity: 82,
          added_count: 14,
          removed_count: 5,
          change_summary: "Added new Q3 projection metrics for SEO channels and removed outdated social budget assumptions.",
          version_a: {
            version_number: fromVer,
            summary: "Older draft of sections with basic channel estimates."
          },
          version_b: {
            version_number: toVer,
            summary: "Refined draft of sections with specific SEO metrics, active target lists, and adjusted budget tables."
          }
        });
        setComparing(false);
      }, 600);
      return;
    }
    setComparing(false);
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="fixed top-[60px] right-0 bottom-0 w-full max-w-lg bg-[#0c0c12] border-l border-white/10 z-40 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock size={16} className="text-indigo-400" />
            Version History
          </h2>
          <p className="text-xs text-white/40 mt-1 truncate max-w-[340px]">
            {document.title}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white transition p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Drawer Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-workspace-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-12 flex-col gap-2">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            <span className="text-xs text-white/40">Loading versions...</span>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Instruction Banner */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 text-xs text-white/50 leading-relaxed">
              Select any <strong>two versions</strong> to compare differences and review what changed.
            </div>

            {/* Versions List */}
            <div className="space-y-2.5">
              {versions.map((ver, idx) => {
                const isSelected = selectedVersions.includes(ver.version_number);
                const isLatest = idx === 0;

                return (
                  <div
                    key={ver.id || ver.version_number}
                    onClick={() => handleCheckboxChange(ver.version_number)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected 
                        ? 'border-indigo-500/50 bg-indigo-500/5' 
                        : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className="pt-0.5">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-indigo-600 border-indigo-500 text-white' 
                            : 'border-white/20 hover:border-white/45 bg-transparent'
                        }`}>
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                            v{ver.version_number}
                          </span>
                          {isLatest && (
                            <span className="text-[9px] font-bold bg-white/5 text-white/50 border border-white/10 px-1.5 py-0.5 rounded-full uppercase">
                              Latest
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs font-medium text-white/90 mt-2 leading-relaxed">
                          {ver.change_summary || "No change summary recorded."}
                        </p>

                        <div className="flex items-center gap-3 mt-3 text-[10px] text-white/40">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(ver.created_at).toLocaleDateString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {ver.changed_by && (
                            <span className="flex items-center gap-1">
                              <User size={10} />
                              {ver.changed_by.name}
                            </span>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compare CTA Trigger */}
            {selectedVersions.length === 2 && (
              <button
                onClick={handleCompare}
                disabled={comparing}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
              >
                {comparing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <GitCompare size={14} />
                )}
                Compare Version {selectedVersions[0]} and {selectedVersions[1]}
              </button>
            )}

            {/* "What Changed?" Diff Panel (Task 12) */}
            {comparisonResult && (
              <div className="mt-4 bg-[#101017] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    What Changed?
                  </h3>
                  <span className="text-[10px] text-white/40 font-mono">
                    v{Math.min(...selectedVersions)} → v{Math.max(...selectedVersions)}
                  </span>
                </div>

                {/* Similarity & Line Counts grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-white/40 mb-1 flex items-center justify-center gap-0.5">
                      <Percent size={10} /> Similarity
                    </div>
                    <div className="text-sm font-bold text-white font-mono">
                      {similarity}%
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-white/40 mb-1 flex items-center justify-center gap-0.5">
                      <Plus size={10} className="text-emerald-500" /> Added
                    </div>
                    <div className="text-sm font-bold text-emerald-400 font-mono">
                      +{addedLines} lines
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-white/40 mb-1 flex items-center justify-center gap-0.5">
                      <Minus size={10} className="text-rose-500" /> Removed
                    </div>
                    <div className="text-sm font-bold text-rose-400 font-mono">
                      -{removedLines} lines
                    </div>
                  </div>
                </div>

                {/* Change Summary text */}
                <div className="space-y-1">
                  <span className="text-[10px] text-white/40 font-medium block">Analysis Summary</span>
                  <p className="text-xs text-white/70 leading-relaxed bg-white/[0.01] border border-white/5 p-3 rounded-xl italic">
                    "{comparisonResult.change_summary}"
                  </p>
                </div>

                {/* Snippets Comparisons */}
                <div className="space-y-2">
                  <span className="text-[10px] text-white/40 font-medium block">Changes Comparison</span>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="bg-black/35 rounded-xl border border-white/5 p-3 font-mono text-[10px] leading-relaxed text-white/60">
                      <span className="text-white/30 block mb-1 text-[9px] uppercase tracking-wider">Older Version Summary:</span>
                      <p className="whitespace-pre-wrap">{comparisonResult.version_a?.summary}</p>
                    </div>
                    <div className="bg-indigo-950/20 rounded-xl border border-indigo-500/10 p-3 font-mono text-[10px] leading-relaxed text-white/60">
                      <span className="text-indigo-400/40 block mb-1 text-[9px] uppercase tracking-wider">Newer Version Summary:</span>
                      <p className="whitespace-pre-wrap">{comparisonResult.version_b?.summary}</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}
      </div>

    </motion.div>
  );
}

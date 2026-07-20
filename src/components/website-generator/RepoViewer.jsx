import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Copy, Check, GitBranch, Shield, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function RepoViewer({ repoData, onReset, inline = false }) {
  const [copied, setCopied] = useState(false);
  const [activeBranch, setActiveBranch] = useState(repoData?.default_branch || "main");

  useEffect(() => {
    if (repoData?.default_branch) {
      setActiveBranch(repoData.default_branch);
    }
  }, [repoData?.default_branch]);

  const handleCopySha = () => {
    if (!repoData?.pushed_commit_sha) return;
    navigator.clipboard.writeText(repoData.pushed_commit_sha);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const provider = repoData?.provider || "github";
  const branches = repoData?.branches || ["main"];
  const commitSha = repoData?.pushed_commit_sha || "unknown";
  const shortCommitSha = commitSha.slice(0, 7);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col gap-5",
        inline
          ? ""
          : "relative bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-white/[0.07] rounded-2xl p-6 shadow-xl overflow-hidden"
      )}
    >
      {!inline && (
        <>
          {/* Emerald top bar for success */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/50 via-emerald-400/70 to-emerald-500/50" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
        </>
      )}
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
            <h3 className="text-[16px] font-bold text-white tracking-tight">Delivery Completed</h3>
          </div>
          <p className="text-[12.5px] text-zinc-600 mt-1.5">
            Codebase is live on your remote repository.
          </p>
        </div>

        {/* Re-deploy trigger */}
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all bg-white/[0.04] border border-white/[0.07] text-zinc-500 hover:bg-white/[0.09] hover:text-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
          >
            <RefreshCw size={11} />
            Push Again
          </button>
        )}
      </div>

      {/* Main CTA: Open Repository */}
      {repoData?.html_url && (
        <a
          href={repoData.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_24px_rgba(16,185,129,0.4)] outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.99]"
        >
          Open Repository
          <ExternalLink size={14} />
        </a>
      )}

      {/* Meta Grid */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <div className="bg-black/30 border border-white/[0.06] p-3 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.12em]">Git Provider</span>
          <span className="text-[13px] font-semibold text-zinc-200 flex items-center gap-2">
            {provider === "github" ? (
              <svg aria-hidden="true" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="text-zinc-300">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
            ) : (
              <svg aria-hidden="true" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="text-[#fc6d26]">
                <path d="m15.97 8.47-.03-.09-1.99-6.14a.512.512 0 0 0-.97-.02L11.16 7.7H4.84L3.02 2.22a.512.512 0 0 0-.97.02L.06 8.38c-.01.03-.02.06-.03.09a1.51 1.51 0 0 0 .52 1.63l7.05 5.12c.12.09.28.09.4 0l7.05-5.12a1.51 1.51 0 0 0 .52-1.63z"/>
              </svg>
            )}
            <span className="capitalize">{provider}</span>
          </span>
        </div>

        <div className="bg-black/30 border border-white/[0.06] p-3 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.12em]">Visibility</span>
          <span className="text-[13px] font-semibold text-zinc-200 flex items-center gap-1.5">
            <Shield size={13} className="text-zinc-500" />
            {repoData?.private ? (
              <span className="bg-red-500/10 text-red-400 border border-red-500/15 px-1.5 py-0.5 rounded-md text-[11px] font-bold">Private</span>
            ) : (
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-1.5 py-0.5 rounded-md text-[11px] font-bold">Public</span>
            )}
          </span>
        </div>

        <div className="bg-black/30 border border-white/[0.06] p-3 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.12em]">Default Branch</span>
          <span className="text-[13px] font-semibold text-zinc-200 flex items-center gap-1.5">
            <GitBranch size={13} className="text-violet-400" />
            <span>{repoData?.default_branch || "main"}</span>
          </span>
        </div>

        <div className="bg-black/30 border border-white/[0.06] p-3 rounded-xl flex flex-col gap-1 relative group">
          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.12em]">Commit SHA</span>
          <div className="flex items-center justify-between gap-1">
            <span className="text-[13px] font-mono font-semibold text-zinc-300">{shortCommitSha}</span>
            <button
              onClick={handleCopySha}
              className="text-zinc-600 hover:text-white p-1 rounded-lg hover:bg-white/[0.07] transition-all focus:outline-none"
              title="Copy commit SHA"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      </div>

      {/* Branch List Section */}
      <div className="flex flex-col gap-2.5 border-t border-white/[0.05] pt-4">
        <label className="text-[10.5px] font-bold text-zinc-600 uppercase tracking-[0.12em]">
          Branches ({branches.length})
        </label>
        
        <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1 select-none">
          {branches.map((b) => (
            <button
              key={b}
              onClick={() => setActiveBranch(b)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-semibold rounded-lg border flex items-center gap-1.5 transition-all outline-none",
                activeBranch === b
                  ? "bg-violet-500/[0.12] text-violet-300 border-violet-500/30 shadow-[0_0_8px_rgba(124,58,237,0.2)]"
                  : "bg-white/[0.03] text-zinc-600 border-white/[0.06] hover:border-white/[0.12] hover:text-zinc-400"
              )}
            >
              <GitBranch size={10} className={activeBranch === b ? "text-violet-400" : "text-zinc-700"} />
              {b}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default RepoViewer;

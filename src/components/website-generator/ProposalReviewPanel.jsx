import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Globe,
  Database,
  Terminal,
  Folder,
  File,
  Copy,
  Check,
  CheckCircle,
  RefreshCw,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import EntityExplorer from "./EntityExplorer";

// Collapsible file tree node
function FileTreeNode({ node, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.isDir && node.children && Object.keys(node.children).length > 0;

  if (!node.isDir) {
    return (
      <div
        className="flex items-center gap-2 py-1 select-none"
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        <File className="text-zinc-600 w-3.5 h-3.5 flex-shrink-0" />
        <span className="font-mono text-[12px] text-zinc-400">{node.name}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-1 hover:bg-white/[0.02] cursor-pointer select-none rounded text-left w-full outline-none focus:outline-none"
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        <Folder className={cn("text-violet-400 w-3.5 h-3.5 flex-shrink-0", isOpen ? "opacity-80" : "opacity-55")} />
        <span className="font-mono text-[12px] font-semibold text-zinc-300 flex-1">{node.name}</span>
        {hasChildren && (
          <span className="text-[10px] text-zinc-600 font-mono pr-2">
            {isOpen ? "▼" : "▶"}
          </span>
        )}
      </button>
      {isOpen && hasChildren && (
        <div className="flex flex-col">
          {Object.values(node.children)
            .sort((a, b) => (b.isDir ? 1 : 0) - (a.isDir ? 1 : 0) || a.name.localeCompare(b.name))
            .map((child) => (
              <FileTreeNode key={child.name} node={child} depth={depth + 1} />
            ))}
        </div>
      )}
    </div>
  );
}

// Parse flat paths array to tree structure
function buildTree(paths) {
  const root = { name: "project-workspace", isDir: true, children: {} };
  paths.forEach((p) => {
    const parts = p.split("/");
    let current = root;
    parts.forEach((part, i) => {
      const isLast = i === parts.length - 1;
      if (!current.children) {
        current.isDir = true;
        current.children = {};
      }
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          isDir: !isLast,
          children: isLast ? null : {},
        };
      } else if (!isLast && !current.children[part].isDir) {
        current.children[part].isDir = true;
        current.children[part].children = {};
      }
      current = current.children[part];
    });
  });
  return root;
}

export default function ProposalReviewPanel({
  proposal,
  isApproving = false,
  onApprove,
  onReHarvest,
  className
}) {
  const [activeTab, setActiveTab] = useState("entities"); // "entities" | "schema" | "files"
  const [copied, setCopied] = useState(false);

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-white/[0.07] bg-zinc-950/40 rounded-2xl min-h-[400px]">
        <RefreshCw className="animate-spin text-violet-500 w-8 h-8 mb-4" />
        <p className="text-[14px] font-semibold text-zinc-400">Loading architectural proposal...</p>
      </div>
    );
  }

  const { stack = {}, entities = [], pages = [], file_tree = [], schema_preview = "" } = proposal;

  const fileTreeRoot = buildTree(file_tree);

  const handleCopy = () => {
    navigator.clipboard.writeText(schema_preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} id="proposal-review-panel">
      {/* ── Architectural Stack Overview ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Frontend Stack", val: stack.frontend || "React + Tailwind", icon: <Globe className="text-violet-400" size={16} /> },
          { label: "Backend Core", val: stack.backend || "Node.js + Express", icon: <Cpu className="text-violet-400" size={16} /> },
          { label: "Database Engine", val: stack.database || "MySQL 8.0", icon: <Database className="text-violet-400" size={16} /> },
          { label: "Deployment / CI", val: stack.ci || "GitHub Actions", icon: <Terminal className="text-violet-400" size={16} /> }
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-zinc-900/40 border border-white/[0.05] rounded-xl p-4 flex flex-col gap-1.5 hover:border-white/[0.1] transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500/20 to-transparent" />
            <div className="flex items-center gap-2 text-zinc-500">
              {item.icon}
              <span className="text-[10.5px] uppercase font-bold tracking-wider">{item.label}</span>
            </div>
            <span className="text-[12.5px] font-semibold text-zinc-200 tracking-tight leading-snug">{item.val}</span>
          </div>
        ))}
      </div>

      {/* ── Generated Pages chip list ── */}
      <div className="bg-zinc-900/20 border border-white/[0.05] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider min-w-[100px]">Proposed Pages:</span>
        <div className="flex flex-wrap gap-2">
          {pages.map((p) => (
            <span
              key={p}
              className="text-[11.5px] font-semibold text-zinc-300 bg-white/[0.04] border border-white/[0.06] px-3 py-1 rounded-lg hover:border-violet-500/20 hover:text-white transition-colors"
            >
              📄 {p}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main View Switcher ── */}
      <div className="flex flex-col border border-white/[0.07] bg-[#08080a] rounded-2xl overflow-hidden shadow-2xl">
        {/* Navigation Tabs */}
        <div className="px-6 border-b border-white/[0.06] bg-black/40 flex items-center justify-between">
          <div className="flex gap-4">
            {[
              { id: "entities", label: "Database Explorer", count: entities.length },
              { id: "schema", label: "SQL Schema", code: true },
              { id: "files", label: "File Tree structure", count: file_tree.length }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "py-4 text-[12.5px] font-bold tracking-tight border-b-2 transition-all relative flex items-center gap-1.5 outline-none focus:outline-none",
                  activeTab === t.id
                    ? "border-violet-500 text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                )}
              >
                {t.label}
                {t.count !== undefined && (
                  <span className={cn(
                    "text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded",
                    activeTab === t.id
                      ? "bg-violet-500/20 text-violet-400"
                      : "bg-white/[0.04] text-zinc-600"
                  )}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Contextual actions */}
          {activeTab === "schema" && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-zinc-400 bg-white/[0.04] hover:bg-white/[0.08] hover:text-zinc-200 border border-white/[0.06] rounded-lg transition-all focus:outline-none"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied SQL</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Tab content display */}
        <div className="p-6 bg-zinc-950/30 min-h-[380px]">
          {activeTab === "entities" && (
            <EntityExplorer entities={entities} />
          )}

          {activeTab === "schema" && (
            <div className="relative rounded-xl border border-white/[0.05] bg-black/50 p-4 font-mono text-[12px] leading-relaxed text-zinc-400 overflow-x-auto max-h-[460px] scrollbar-thin">
              <pre className="whitespace-pre">{schema_preview || "-- No schema available"}</pre>
            </div>
          )}

          {activeTab === "files" && (
            <div className="rounded-xl border border-white/[0.05] bg-black/20 p-4 max-h-[420px] overflow-y-auto">
              <div className="flex flex-col gap-0.5">
                {Object.values(fileTreeRoot.children).map((child) => (
                  <FileTreeNode key={child.name} node={child} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky Action Bar Footer ── */}
      <div className="flex items-center justify-between p-4 bg-zinc-950 border border-white/[0.07] rounded-xl shadow-xl mt-2">
        <div className="flex items-center gap-2">
          <CheckCircle size={15} className="text-violet-400 animate-pulse" />
          <span className="text-[12.5px] text-zinc-500 font-medium">Architecture review complete? Click approval to initiate code scaffolding.</span>
        </div>
        <div className="flex items-center gap-3">
          {onReHarvest && (
            <button
              onClick={onReHarvest}
              className="px-4 py-2.5 rounded-lg text-[12px] font-bold bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200 transition-all flex items-center gap-2"
            >
              <RefreshCw size={13} />
              Re-Harvest
            </button>
          )}
          <button
            onClick={onApprove}
            disabled={isApproving}
            className="px-6 py-2.5 rounded-lg text-[12.5px] font-extrabold bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.25)] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all flex items-center gap-2 disabled:opacity-40"
          >
            {isApproving ? (
              <>
                <svg aria-hidden="true" className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Approving...
              </>
            ) : (
              "Approve & Generate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

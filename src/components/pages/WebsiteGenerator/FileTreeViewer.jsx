/**
 * FileTreeViewer — Task 17: File Tree Viewer
 *
 * Collapsible, searchable file tree.
 * Tree format: { "folderName": { ... }, "fileName.ext": null }
 */

import React, { useState, useMemo } from "react";
import { FolderTree, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars

// ── File-type colour map ───────────────────────────────────────────────────────
const EXT_COLOR = {
  jsx: "text-violet-400",
  tsx: "text-violet-400",
  js:  "text-amber-400",
  ts:  "text-amber-400",
  css: "text-sky-400",
  json:"text-orange-400",
  md:  "text-slate-400",
  html:"text-rose-400",
};

function extColor(name) {
  const ext = name.split(".").pop();
  return EXT_COLOR[ext] || "text-slate-500";
}

// ── Inline SVG icons (no extra deps) ─────────────────────────────────────────
function FolderIcon({ open }) {
  return (
    <svg
      className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${open ? "text-amber-400" : "text-slate-500"}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      {open ? (
        <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v1H2V6zM2 9h16v5a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" />
      ) : (
        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      )}
    </svg>
  );
}

function FileIcon({ name }) {
  return (
    <svg
      className={`w-3.5 h-3.5 flex-shrink-0 ${extColor(name)}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ── Chevron ───────────────────────────────────────────────────────────────────
function Chevron({ open }) {
  return (
    <motion.svg
      animate={{ rotate: open ? 90 : 0 }}
      transition={{ duration: 0.15 }}
      className="w-2.5 h-2.5 text-slate-600 flex-shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </motion.svg>
  );
}

// ── Recursive tree node ───────────────────────────────────────────────────────
function TreeNode({ name, node, depth = 0 }) {
  const isFolder = node !== null && typeof node === "object";
  const [open, setOpen] = useState(true);

  const indent = depth * 14;

  if (!isFolder) {
    // File
    return (
      <div
        className="flex items-center gap-2 py-0.5 px-2 rounded hover:bg-white/[0.04] transition-colors group"
        style={{ paddingLeft: `${indent + 8}px` }}
      >
        <FileIcon name={name} />
        <span className={`text-xs ${extColor(name)} group-hover:text-slate-200 transition-colors`}>
          {name}
        </span>
      </div>
    );
  }

  // Folder
  const children = Object.entries(node);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 py-0.5 px-2 rounded hover:bg-white/[0.04] transition-colors text-left"
        style={{ paddingLeft: `${indent + 8}px` }}
      >
        <Chevron open={open} />
        <FolderIcon open={open} />
        <span className="text-xs text-slate-300 font-medium">{name}</span>
        <span className="text-[10px] text-slate-600 ml-auto">{children.length}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {children.map(([childName, childNode]) => (
              <TreeNode
                key={childName}
                name={childName}
                node={childNode}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Filter tree to matching entries + their parents ───────────────────────────
function filterTree(tree, query) {
  if (!query) return tree;
  const q = query.toLowerCase();
  const result = {};
  for (const [key, val] of Object.entries(tree)) {
    if (val === null) {
      // file
      if (key.toLowerCase().includes(q)) result[key] = null;
    } else {
      // folder — recurse
      const filtered = filterTree(val, q);
      if (
        Object.keys(filtered).length > 0 ||
        key.toLowerCase().includes(q)
      ) {
        result[key] = filtered;
      }
    }
  }
  return result;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FileTreeViewer({ tree = {} }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => filterTree(tree, search.trim()), [tree, search]);
  const hasResults = Object.keys(filtered).length > 0;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center flex-shrink-0">
          <FolderTree className="w-4 h-4 text-sky-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">File Structure</h3>
          <p className="text-xs text-slate-500">Task 17 · Collapsible file tree</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <input
          id="file-tree-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search files…"
          aria-label="Search file tree"
          className="w-full pl-8 pr-3 py-2 rounded-lg border border-white/10 bg-white/5
                     text-sm text-slate-100 placeholder-slate-600 outline-none
                     hover:border-white/20 focus:border-violet-500/60 focus:ring-2
                     focus:ring-violet-500/20 transition-all duration-200"
        />
      </div>

      {/* Tree */}
      <div className="bg-white/[0.02] rounded-xl border border-white/8 py-2 overflow-hidden">
        {hasResults ? (
          Object.entries(filtered).map(([name, node]) => (
            <TreeNode key={name} name={name} node={node} depth={0} />
          ))
        ) : (
          <p className="text-xs text-slate-500 text-center py-6">
            No files match <span className="font-mono text-slate-400">"{search}"</span>
          </p>
        )}
      </div>
    </div>
  );
}

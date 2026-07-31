// src/components/pages/erp/AuditLogsPage.jsx — REDESIGNED
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScrollText,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
  Tag,
  Clock,
  Filter,
  Download,
} from "lucide-react";

import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../utils/APIs/interceptors";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPEmptyState } from "../../erp/shared/ERPEmptyState";
import { ERPTableSkeleton } from "../../erp/shared/ERPLoadingSkeleton";
import { ERPBanner } from "../../erp/shared/ERPBanner";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ── Action color map ────────────────────────────────────────────────────────────
const ACTION_COLOR = {
  TASK_APPROVED:    "#10b981",
  TASK_REJECTED:    "#ef4444",
  TASK_SUBMITTED:   "#6366f1",
  USER_WARNED:      "#f59e0b",
  USER_FLAGGED:     "#ef4444",
  PAYOUT_PROCESSED: "#10b981",
  POOL_LOCKED:      "#6366f1",
  SETTING_UPDATED:  "#6b7280",
  ROLE_CHANGED:     "#f59e0b",
};

function getActionColor(action) {
  if (!action) return "#6b7280";
  const key = Object.keys(ACTION_COLOR).find(k => action.includes(k.split("_")[0]));
  return ACTION_COLOR[action] || ACTION_COLOR[key] || "#6b7280";
}

function formatValue(val) {
  if (val === null || val === undefined) return "—";
  if (typeof val === "object") return JSON.stringify(val).slice(0, 80);
  return String(val).slice(0, 80);
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT LOGS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export function AuditLogsPage() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const isAdmin = user?.role === "admin" || user?.is_global_admin;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterAction, setFilterAction] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const limit = 200;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = isAdmin
        ? `/admin/audit-logs?workspace_id=${workspaceId}&limit=${limit}`
        : `/workspaces/${workspaceId}/audit-logs?limit=${limit}`;
      if (filterAction) url += `&action=${encodeURIComponent(filterAction)}`;
      const res = await api.get(url);
      setLogs(res.data?.data?.logs || res.data?.logs || []);
      setPage(1);
    } catch (err) {
      console.error("Failed to load audit logs", err);
      setError(err?.response?.data?.error || "Failed to load audit logs");
    } finally { setLoading(false); }
  }, [workspaceId, isAdmin, filterAction, limit]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Client-side date filter
  const filtered = logs.filter(log => {
    if (!filterDate) return true;
    return new Date(log.created_at).toISOString().startsWith(filterDate);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedLogs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = () => {
    const csv = [
      ["Timestamp", "Actor", "Action", "Entity", "Reason"].join(","),
      ...filtered.map(l => [
        new Date(l.created_at).toISOString(),
        l.actor_user_id,
        l.action,
        `${l.entity_type}#${l.entity_id}`,
        l.reason || "",
      ].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <ERPPageHeader
          icon={<ScrollText size={20} />}
          title="Audit Logs"
          description="Complete audit trail of all workspace actions and changes"
          breadcrumbs={[{ label: "Admin" }, { label: "Audit Logs" }]}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/[0.06] text-zinc-400 hover:text-white text-sm transition-all"
              >
                <Download size={13} />
                Export CSV
              </button>
              <button
                onClick={fetchLogs}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/[0.06] text-zinc-400 hover:text-white text-sm transition-all"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          }
        />

        <AnimatePresence>
          {error && <ERPBanner message={error} type="error" onDismiss={() => setError(null)} />}
        </AnimatePresence>

        {/* ── Filters ── */}
        <div
          className="flex flex-wrap gap-3 items-center px-5 py-4 rounded-xl mb-6"
          style={{ background: "var(--surface-panel)", border: "1px solid var(--surface-border)" }}
        >
          <Filter size={13} className="text-zinc-500 shrink-0" />

          {/* Action search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter by action…"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full bg-zinc-800 border border-white/[0.06] text-zinc-300 text-xs rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Date filter */}
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-zinc-500" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-zinc-800 border border-white/[0.06] text-zinc-300 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500/50"
            />
            {filterDate && (
              <button onClick={() => setFilterDate("")} className="text-zinc-500 hover:text-zinc-300 text-xs">✕</button>
            )}
          </div>

          <span className="ml-auto text-xs text-zinc-500">{filtered.length} entries</span>
        </div>

        {/* ── Table ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface-panel)", border: "1px solid var(--surface-border)" }}>
          {loading ? (
            <ERPTableSkeleton rows={8} cols={5} />
          ) : filtered.length === 0 ? (
            <ERPEmptyState
              icon={<ScrollText size={28} />}
              title="No audit logs found"
              sub="Audit trail entries will appear here as your team takes actions."
              compact
            />
          ) : (
            <>
              {/* Table head */}
              <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1fr_28px] gap-4 px-5 py-3 border-b border-white/[0.04] text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                <span className="flex items-center gap-1.5"><Clock size={10} /> Timestamp</span>
                <span className="flex items-center gap-1.5"><User size={10} /> Actor</span>
                <span className="flex items-center gap-1.5"><Tag size={10} /> Action</span>
                <span>Entity</span>
                <span>Reason</span>
                <span />
              </div>

              <div>
                <AnimatePresence initial={false}>
                  {paginatedLogs.map((log, i) => {
                    const color = getActionColor(log.action);
                    const isExpanded = expandedRows.has(log.id);
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.015 }}
                      >
                        {/* Row */}
                        <div
                          className="grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1fr_28px] gap-4 px-5 py-3.5 border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors items-center group"
                          onClick={() => toggleRow(log.id)}
                        >
                          <span className="text-xs text-zinc-400 font-mono whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="text-xs text-zinc-300 truncate">
                            {log.actor_user_id ? `#${log.actor_user_id}` : "System"}
                          </span>
                          <div>
                            <span
                              className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
                            >
                              {log.action}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-400 truncate">
                            {log.entity_type} <span className="text-zinc-600">#{log.entity_id}</span>
                          </span>
                          <span className="text-xs text-zinc-500 truncate">{log.reason || "—"}</span>
                          <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
                            <ChevronRight size={12} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                          </motion.span>
                        </div>

                        {/* Expanded details */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              key="detail"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                              <div className="px-5 py-4 border-b border-white/[0.04]" style={{ background: "var(--surface-panel)" }}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1.5">Before</p>
                                    <pre className="text-amber-400/80 font-mono text-xs bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 overflow-x-auto whitespace-pre-wrap break-all">
                                      {formatValue(log.before_value)}
                                    </pre>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1.5">After</p>
                                    <pre className="text-emerald-400/80 font-mono text-xs bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5 overflow-x-auto whitespace-pre-wrap break-all">
                                      {formatValue(log.after_value)}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.04]">
                  <span className="text-xs text-zinc-500">
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs text-zinc-300 transition-colors"
                    >
                      Prev
                    </button>
                    <span className="text-xs text-zinc-500">{page} / {totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs text-zinc-300 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuditLogsPage;
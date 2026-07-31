// src/components/pages/erp/AuditLogsPage.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../utils/APIs/interceptors";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const COLUMNS = [
  { key: "created_at", label: "Timestamp", sortable: true },
  { key: "actor_user_id", label: "Actor", sortable: true },
  { key: "action", label: "Action", sortable: true },
  { key: "entity", label: "Entity", sortable: true },
  { key: "before_value", label: "Before", sortable: true },
  { key: "after_value", label: "After", sortable: true },
  { key: "reason", label: "Reason", sortable: true },
];

// ----------------------------------------------------------------------
// Small presentational helpers
// ----------------------------------------------------------------------

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChevronDownIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ChevronUpIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function ChevronsUpDownIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="7 15 12 20 17 15" />
      <polyline points="7 9 12 4 17 9" />
    </svg>
  );
}

function MoreVerticalIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

function AlertIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function InboxIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  );
}

function Spinner({ label = "Loading audit logs…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
      <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
      <div className="flex-1">
        <p className="font-medium text-red-200">Couldn&apos;t load audit logs</p>
        <p className="text-red-400/90">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 rounded-md border border-red-800 px-2.5 py-1 text-xs font-medium text-red-200 transition-colors hover:bg-red-900/50"
        >
          Retry
        </button>
      )}
    </div>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80">
        <InboxIcon className="h-6 w-6 text-slate-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-200">No audit logs found</p>
        <p className="mt-1 text-sm text-slate-500">
          {hasFilters
            ? "Nothing matches your current search or filter."
            : "Activity will show up here as soon as something happens."}
        </p>
      </div>
      {hasFilters && onClear && (
        <button
          onClick={onClear}
          className="mt-1 rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800"
        >
          Clear search &amp; filter
        </button>
      )}
    </div>
  );
}

const ACTION_STYLES = [
  { match: /delete|remove|reject|deny/i, className: "bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/20" },
  { match: /approve|create|add|grant/i, className: "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/20" },
  { match: /update|edit|modify|change/i, className: "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/20" },
  { match: /login|logout|access|view/i, className: "bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/20" },
];

function ActionBadge({ action }) {
  if (!action) return <span className="text-slate-600">—</span>;
  const style = ACTION_STYLES.find((s) => s.match.test(action));
  const className = style?.className || "bg-slate-500/10 text-slate-300 ring-1 ring-inset ring-slate-500/20";
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${className}`}>
      {action}
    </span>
  );
}

function ValuePill({ value, tone }) {
  const formatted = formatValue(value);
  if (formatted === "—") return <span className="text-slate-600">—</span>;
  const toneClass = tone === "before" ? "text-amber-300/90" : "text-emerald-300/90";
  return <span className={`font-mono text-xs ${toneClass}`}>{formatted}</span>;
}

function SortableHeader({ column, sortKey, sortDirection, onSort }) {
  const isActive = sortKey === column.key;
  return (
    <th
      scope="col"
      className="sticky top-0 z-10 select-none whitespace-nowrap border-b border-slate-800 bg-slate-900/95 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 backdrop-blur"
    >
      {column.sortable ? (
        <button
          type="button"
          onClick={() => onSort(column.key)}
          className={`group inline-flex items-center gap-1.5 transition-colors hover:text-slate-200 ${
            isActive ? "text-slate-100" : ""
          }`}
        >
          {column.label}
          {isActive ? (
            sortDirection === "asc" ? (
              <ChevronUpIcon className="h-3.5 w-3.5 text-indigo-400" />
            ) : (
              <ChevronDownIcon className="h-3.5 w-3.5 text-indigo-400" />
            )
          ) : (
            <ChevronsUpDownIcon className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400" />
          )}
        </button>
      ) : (
        column.label
      )}
    </th>
  );
}

function RowActionMenu({ log, onCopyId, onViewDetails }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Row actions"
        className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
      >
        <MoreVerticalIcon className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-xl shadow-black/40">
          <button
            onClick={() => {
              onViewDetails(log);
              setOpen(false);
            }}
            className="block w-full px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800"
          >
            View details
          </button>
          <button
            onClick={() => {
              onCopyId(log);
              setOpen(false);
            }}
            className="block w-full px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800"
          >
            Copy log ID
          </button>
        </div>
      )}
    </div>
  );
}

function DetailsModal({ log, onClose }) {
  if (!log) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Audit log</p>
            <h2 className="mt-1 text-base font-semibold text-slate-100">
              {log.entity_type} #{log.entity_id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            Close
          </button>
        </div>
        <dl className="space-y-3 text-sm">
          <Detail label="Timestamp" value={new Date(log.created_at).toLocaleString()} />
          <Detail label="Actor" value={log.actor_user_id} />
          <Detail label="Action" value={<ActionBadge action={log.action} />} />
          <Detail label="Reason" value={log.reason || "—"} />
          <Detail label="Before" value={<pre className="whitespace-pre-wrap break-words text-xs text-amber-300/90">{formatValue(log.before_value, 500)}</pre>} />
          <Detail label="After" value={<pre className="whitespace-pre-wrap break-words text-xs text-emerald-300/90">{formatValue(log.after_value, 500)}</pre>} />
        </dl>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-200">{value}</dd>
    </div>
  );
}

function Pagination({ page, totalPages, totalRows, pageSize, onPageChange, onPageSizeChange }) {
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-slate-800 px-4 py-3 sm:flex-row">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Rows per page</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {ROWS_PER_PAGE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="hidden sm:inline">
          &middot; Showing {from}-{to} of {totalRows}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-md border border-slate-700 px-2.5 py-1 font-medium transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>
        <span className="px-1 tabular-nums">
          Page {page} of {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-md border border-slate-700 px-2.5 py-1 font-medium transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Data helpers
// ----------------------------------------------------------------------

function formatValue(val, maxLen = 50) {
  if (val === null || val === undefined) return "—";
  if (typeof val === "object") return JSON.stringify(val).slice(0, maxLen);
  return String(val).slice(0, maxLen);
}

function getSortValue(log, key) {
  switch (key) {
    case "created_at":
      return new Date(log.created_at).getTime() || 0;
    case "entity":
      return `${log.entity_type || ""} ${log.entity_id || ""}`.toLowerCase();
    case "before_value":
      return formatValue(log.before_value, 1000).toLowerCase();
    case "after_value":
      return formatValue(log.after_value, 1000).toLowerCase();
    default:
      return String(log[key] ?? "").toLowerCase();
  }
}

function matchesSearch(log, query) {
  if (!query) return true;
  const haystack = [
    log.actor_user_id,
    log.action,
    log.entity_type,
    log.entity_id,
    log.reason,
    formatValue(log.before_value, 200),
    formatValue(log.after_value, 200),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

// ----------------------------------------------------------------------
// Main component
// ----------------------------------------------------------------------

export function AuditLogsPage() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const isAdmin = user?.role === "admin" || user?.is_global_admin;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Server-side action filter (kept identical to original API contract)
  const [filterAction, setFilterAction] = useState("");
  const [limit] = useState(100);

  // Client-side UX state (search, sort, pagination) — additive, no API impact
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(ROWS_PER_PAGE_OPTIONS[0]);
  const [knownActions, setKnownActions] = useState([]);
  const [detailsLog, setDetailsLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url;
      if (isAdmin) {
        url = `/admin/audit-logs?workspace_id=${workspaceId}&limit=${limit}`;
      } else {
        url = `/workspaces/${workspaceId}/audit-logs?limit=${limit}`;
      }
      if (filterAction) {
        url += `&action=${encodeURIComponent(filterAction)}`;
      }
      const res = await api.get(url);
      const data = res.data?.data?.logs || res.data?.logs || [];
      setLogs(data);
      setKnownActions((prev) => {
        const merged = new Set(prev);
        data.forEach((l) => l.action && merged.add(l.action));
        return Array.from(merged).sort();
      });
    } catch (err) {
      console.error("Failed to load audit logs", err);
      setError(err?.response?.data?.error || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [workspaceId, isAdmin, filterAction, limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterAction, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const filteredLogs = useMemo(
    () => logs.filter((log) => matchesSearch(log, searchQuery)),
    [logs, searchQuery]
  );

  const sortedLogs = useMemo(() => {
    const copy = [...filteredLogs];
    copy.sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);
      if (av < bv) return sortDirection === "asc" ? -1 : 1;
      if (av > bv) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filteredLogs, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedLogs.slice(start, start + pageSize);
  }, [sortedLogs, currentPage, pageSize]);

  const hasActiveFilters = Boolean(searchQuery || filterAction);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterAction("");
  };

  const handleCopyId = (log) => {
    const value = String(log.id ?? "");
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-slate-50 sm:text-2xl">Audit Logs</h1>
          <p className="text-sm text-slate-500">
            Track every change made across this workspace, who made it, and why.
          </p>
        </header>

        <ErrorBanner message={error} onRetry={fetchLogs} />

        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-black/20">
          {/* Controls */}
          <div className="flex flex-col gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs…"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-56"
              >
                <option value="">All actions</option>
                {knownActions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchLogs}
                className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 active:bg-indigo-700"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Body */}
          {loading ? (
            <Spinner />
          ) : sortedLogs.length === 0 ? (
            <EmptyState hasFilters={hasActiveFilters} onClear={hasActiveFilters ? clearFilters : undefined} />
          ) : (
            <>
              <div className="max-h-[60vh] overflow-auto">
                <table className="w-full min-w-[900px] border-collapse text-sm">
                  <thead>
                    <tr>
                      {COLUMNS.map((column) => (
                        <SortableHeader
                          key={column.key}
                          column={column}
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      ))}
                      <th className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/95 px-4 py-3 text-right backdrop-blur">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-slate-800/70 transition-colors last:border-b-0 hover:bg-slate-800/40"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-300">{log.actor_user_id}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <ActionBadge action={log.action} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                          {log.entity_type} #{log.entity_id}
                        </td>
                        <td className="max-w-[220px] truncate px-4 py-3">
                          <ValuePill value={log.before_value} tone="before" />
                        </td>
                        <td className="max-w-[220px] truncate px-4 py-3">
                          <ValuePill value={log.after_value} tone="after" />
                        </td>
                        <td className="max-w-[240px] truncate px-4 py-3 text-slate-400">{log.reason || "—"}</td>
                        <td className="px-4 py-3">
                          <RowActionMenu log={log} onCopyId={handleCopyId} onViewDetails={setDetailsLog} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={currentPage}
                totalPages={totalPages}
                totalRows={sortedLogs.length}
                pageSize={pageSize}
                onPageChange={(p) => setPage(Math.min(Math.max(1, p), totalPages))}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </div>
      </div>

      <DetailsModal log={detailsLog} onClose={() => setDetailsLog(null)} />
    </div>
  );
}

export default AuditLogsPage;

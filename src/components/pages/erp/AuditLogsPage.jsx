// src/components/pages/erp/AuditLogsPage.jsx
import { useState, useEffect, useCallback } from "react";
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

export function AuditLogsPage() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterAction, setFilterAction] = useState("");
  const [limit] = useState(100);

  const isAdmin = user?.role === "admin" || user?.is_global_admin;

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
      setLogs(res.data?.data?.logs || res.data?.logs || []);
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

  if (loading) return <Spinner />;

  return (
    <div style={styles.container}>
      <h1 style={styles.h1}>📋 Audit Logs</h1>

      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="Filter by action (e.g. TASK_APPROVED)"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          style={styles.filterInput}
        />
        <button onClick={fetchLogs} style={styles.filterBtn}>
          Apply
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {logs.length === 0 ? (
        <div style={styles.empty}>No audit logs found</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Before</th>
                <th>After</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td>{log.actor_user_id}</td>
                  <td>{log.action}</td>
                  <td>{log.entity_type} #{log.entity_id}</td>
                  <td style={styles.before}>{formatValue(log.before_value)}</td>
                  <td style={styles.after}>{formatValue(log.after_value)}</td>
                  <td>{log.reason || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatValue(val) {
  if (val === null || val === undefined) return "—";
  if (typeof val === "object") return JSON.stringify(val).slice(0, 50);
  return String(val).slice(0, 50);
}

// ----------------------------------------------------------------------
// Spinner & Styles (same style patterns as other pages)
// ----------------------------------------------------------------------
const Spinner = () => (
  <div style={{ textAlign: "center", padding: 60 }}>
    <div style={{ width: 30, height: 30, borderRadius: "50%", border: "3px solid #1f2937", borderTop: "3px solid #6366f1", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const styles = {
  container: { maxWidth: 1200, margin: "0 auto", padding: "28px 20px" },
  h1: { fontSize: 24, fontWeight: 700, marginBottom: 20, color: "#f9fafb" },
  filterBar: { display: "flex", gap: 12, marginBottom: 20 },
  filterInput: {
    background: "#1f2937",
    border: "1px solid #374151",
    borderRadius: 8,
    padding: "8px 14px",
    color: "#f9fafb",
    flex: 1,
  },
  filterBtn: {
    background: "#4f46e5",
    border: "none",
    padding: "8px 20px",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
  },
  error: { background: "#450a0a", border: "1px solid #991b1b", borderRadius: 8, padding: 10, marginBottom: 16, color: "#fca5a5" },
  empty: { textAlign: "center", padding: 60, color: "#6b7280" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", color: "#e5e7eb", fontSize: 14 },
  before: { color: "#fbbf24" },
  after: { color: "#34d399" },
};

// Add table header styles in a <style> tag or inline – we'll use inline for simplicity
// but you can add th/td styles via global CSS.
// For consistency, we can add a style block:
document.head.insertAdjacentHTML("beforeend", `
<style>
  .audit-table th {
    text-align: left;
    padding: 12px 8px;
    color: #9ca3af;
    border-bottom: 1px solid #1f2937;
  }
  .audit-table td {
    padding: 12px 8px;
    border-bottom: 1px solid #1f2937;
    vertical-align: top;
  }
</style>
`);
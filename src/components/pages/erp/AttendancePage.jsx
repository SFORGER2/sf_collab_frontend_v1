/**
 * AttendancePage.jsx — SFCollab ERP (Corrected for backend)
 * API wiring:
 *   MY ATTENDANCE:
 *     GET  /attendance/my-history?workspace_id=<id>&limit=30
 *     POST /attendance/clock-in
 *     POST /attendance/clock-out
 *   WORKSPACE ATTENDANCE (admin):
 *     GET  /attendance/workspace-overview/<workspace_id>?date=YYYY-MM-DD
 */

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { workspaceAPI } from "../../../services/workspaceAPI";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};
const statusColor = {
  present: "#22c55e",
  late: "#f59e0b",
  absent: "#ef4444",
  not_clocked_in: "#6b7280",
};
const statusLabel = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  not_clocked_in: "Not Clocked In",
};

// ═════════════════════════════════════════════════════════════════════════════
// MY ATTENDANCE PAGE
// ═════════════════════════════════════════════════════════════════════════════
export function MyAttendancePage() {
  const { user } = useSelector((s) => s.auth);

  // ── Workspace selection ──────────────────────────────────────────────────
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [workspacesLoading, setWorkspacesLoading] = useState(true);

  // ── Attendance data ──────────────────────────────────────────────────────
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg);
    else setNotice(msg);
    setTimeout(() => { setError(null); setNotice(null); }, 4000);
  };

  // ── Load workspaces ──────────────────────────────────────────────────────
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const data = await workspaceAPI.getMyWorkspaces();
        setWorkspaces(data);
      } catch (e) {
        console.error("Failed to load workspaces", e);
        flash("Could not load workspaces", true);
      } finally {
        setWorkspacesLoading(false);
      }
    };
    loadWorkspaces();
  }, []);

  // ── Compute workspaceId ──────────────────────────────────────────────────
  useEffect(() => {
    if (user?.active_workspace_id) {
      setWorkspaceId(user.active_workspace_id);
    } else if (workspaces.length > 0) {
      setWorkspaceId(workspaces[0].id);
    } else {
      setWorkspaceId(null);
    }
  }, [user, workspaces]);

  // ── Load attendance history (depends on workspaceId) ──────────────────
  const loadHistory = useCallback(async () => {
    if (!workspaceId) {
      // Still no workspace – skip API call
      return;
    }
    try {
      const { data } = await api.get("/attendance/my-history", {
        params: { workspace_id: workspaceId, limit: 30 },
      });
      const records = data.data?.records || data.records || [];
      setHistory(records);
      // Find today's record
      const todayStr = new Date().toISOString().split("T")[0];
      const todayRecord = records.find(r => r.date?.startsWith?.(todayStr));
      setToday(todayRecord || null);
    } catch (e) {
      flash(e?.response?.data?.error || "Could not load attendance", true);
    }
  }, [workspaceId]);

  // ── Trigger initial load when workspaceId is set ──────────────────────
  useEffect(() => {
    if (workspaceId) {
      setLoading(true);
      loadHistory().finally(() => setLoading(false));
    } else if (!workspacesLoading) {
      // No workspaces and we've finished loading – show empty state
      setLoading(false);
    }
  }, [workspaceId, workspacesLoading, loadHistory]);

  // ── Clock In ─────────────────────────────────────────────────────────────
  const clockIn = async () => {
    if (!workspaceId) {
      flash("No workspace selected", true);
      return;
    }
    setActionLoading(true);
    try {
      await api.post("/attendance/clock-in", { workspace_id: workspaceId });
      flash("Clocked in successfully!");
      await loadHistory();
    } catch (e) {
      flash(e?.response?.data?.error || "Clock-in failed", true);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Clock Out ────────────────────────────────────────────────────────────
  const clockOut = async () => {
    if (!workspaceId) {
      flash("No workspace selected", true);
      return;
    }
    setActionLoading(true);
    try {
      await api.post("/attendance/clock-out", { workspace_id: workspaceId });
      flash("Clocked out successfully!");
      await loadHistory();
    } catch (e) {
      flash(e?.response?.data?.error || "Clock-out failed", true);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading || workspacesLoading) {
    return <PageLoader label="Loading attendance…" />;
  }

  // If we have no workspaceId after loading, show a message
  if (!workspaceId) {
    return (
      <div style={styles.page}>
        <PageHeader title="My Attendance" sub="No workspace available" />
        <div style={styles.card}>
          <p style={{ color: "#9ca3af" }}>Please create or join a workspace to track attendance.</p>
        </div>
      </div>
    );
  }

  const canClockIn = !today || !today.clock_in_time;
  const canClockOut = today && today.clock_in_time && !today.clock_out_time;

  return (
    <div style={styles.page}>
      <PageHeader title="My Attendance" sub={new Date().toDateString()} />
      {notice && <Banner type="success">{notice}</Banner>}
      {error && <Banner type="error">{error}</Banner>}
      <div style={styles.grid2}>
        <StatCard
          label="Today's Status"
          value={statusLabel[today?.status] || "Not Clocked In"}
          accent={statusColor[today?.status] || "#6b7280"}
          sub={today?.status === "late" ? "Threshold: 09:00" : undefined}
        />
        <StatCard
          label="Hours Worked"
          value={today?.duration_hours ? `${today.duration_hours}h` : "—"}
          accent="#6366f1"
          sub={today?.clock_in_time ? `In: ${fmt(today.clock_in_time)}` : "Not clocked in yet"}
        />
      </div>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Clock Actions</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <ActionButton
            label="Clock In"
            icon="⏱"
            disabled={!canClockIn || actionLoading}
            onClick={clockIn}
            color="#22c55e"
          />
          <ActionButton
            label="Clock Out"
            icon="🏁"
            disabled={!canClockOut || actionLoading}
            onClick={clockOut}
            color="#ef4444"
          />
        </div>
        {today?.clock_in_time && (
          <p style={styles.meta}>
            Clocked in at <strong>{fmt(today.clock_in_time)}</strong>
            {today.clock_out_time && <> · Clocked out at <strong>{fmt(today.clock_out_time)}</strong></>}
          </p>
        )}
      </div>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Attendance History</h3>
        <AttendanceTable records={history} />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// WORKSPACE ATTENDANCE (Admin)
// ═════════════════════════════════════════════════════════════════════════════
export function WorkspaceAttendancePage() {
  const { user } = useSelector((s) => s.auth);

  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [workspacesLoading, setWorkspacesLoading] = useState(true);

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  // Load workspaces
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const data = await workspaceAPI.getMyWorkspaces();
        setWorkspaces(data);
      } catch (e) {
        console.error("Failed to load workspaces", e);
        flash("Could not load workspaces", true);
      } finally {
        setWorkspacesLoading(false);
      }
    };
    loadWorkspaces();
  }, []);

  // Compute workspaceId
  useEffect(() => {
    if (user?.active_workspace_id) {
      setWorkspaceId(user.active_workspace_id);
    } else if (workspaces.length > 0) {
      setWorkspaceId(workspaces[0].id);
    } else {
      setWorkspaceId(null);
    }
  }, [user, workspaces]);

  // Load workspace attendance
  const load = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const res = await api.get(`/attendance/workspace-overview/${workspaceId}`, {
        params: { date: dateFilter },
      });
      const data = res.data?.data || res.data;
      setRecords(data.records || []);
      setSummary(data.summary);
    } catch (e) {
      flash(e?.response?.data?.error || "Failed to load workspace attendance", true);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, dateFilter]);

  useEffect(() => {
    if (workspaceId) {
      load();
    } else if (!workspacesLoading) {
      setLoading(false);
    }
  }, [workspaceId, workspacesLoading, load]);

  if (loading || workspacesLoading) return <PageLoader label="Loading workspace attendance…" />;

  if (!workspaceId) {
    return (
      <div style={styles.page}>
        <PageHeader title="Workspace Attendance" sub="No workspace available" />
        <div style={styles.card}>
          <p style={{ color: "#9ca3af" }}>Please create or join a workspace to view attendance.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <PageHeader title="Workspace Attendance" sub="Admin view — all members" />
      {error && <Banner type="error">{error}</Banner>}
      {summary && (
        <div style={styles.grid4}>
          <StatCard label="Present" value={summary.present ?? "—"} accent="#22c55e" />
          <StatCard label="Late"    value={summary.late    ?? "—"} accent="#f59e0b" />
          <StatCard label="Absent"  value={summary.absent  ?? "—"} accent="#ef4444" />
          <StatCard label="Total"   value={summary.total   ?? "—"} accent="#6366f1" />
        </div>
      )}
      <div style={{ ...styles.card, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label style={styles.label}>Date</label>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={styles.input}
        />
        <button onClick={load} style={styles.btnSecondary}>Refresh</button>
      </div>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Member Attendance — {fmtDate(dateFilter)}</h3>
        {loading ? <PageLoader label="Loading…" inline /> : <AttendanceTable records={records} showUser />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared sub‑components (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────
function AttendanceTable({ records, showUser = false }) {
  if (!records.length) return <p style={styles.empty}>No attendance records found.</p>;
  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            {showUser && <Th>Member</Th>}
            <Th>Date</Th>
            <Th>Status</Th>
            <Th>Clock In</Th>
            <Th>Clock Out</Th>
            <Th>Hours</Th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} style={styles.tr}>
              {showUser && <Td>{r.user?.name || "—"}</Td>}
              <Td>{fmtDate(r.date)}</Td>
              <Td><StatusPill status={r.status} /></Td>
              <Td>{fmt(r.clock_in_time)}</Td>
              <Td>{fmt(r.clock_out_time)}</Td>
              <Td>{r.duration_hours ? `${r.duration_hours}h` : "—"}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span style={{
      background: statusColor[status] + "22",
      color: statusColor[status],
      border: `1px solid ${statusColor[status]}44`,
      padding: "2px 10px",
      borderRadius: 99,
      fontSize: 12,
      fontWeight: 600,
    }}>
      {statusLabel[status] || status}
    </span>
  );
}

function StatCard({ label, value, accent, sub }) {
  return (
    <div style={{ ...styles.card, borderTop: `3px solid ${accent}` }}>
      <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: accent, margin: 0 }}>{value}</p>
      {sub && <p style={styles.meta}>{sub}</p>}
    </div>
  );
}

function ActionButton({ label, icon, disabled, onClick, color }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#1f2937" : color,
        color: disabled ? "#6b7280" : "#fff",
        border: "none",
        borderRadius: 8,
        padding: "10px 22px",
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        gap: 8,
        alignItems: "center",
        transition: "opacity .2s",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span>{icon}</span> {label}
    </button>
  );
}

function Banner({ type, children }) {
  const bg = { success: "#052e16", error: "#450a0a", info: "#0c1a2e" };
  const border = { success: "#166534", error: "#991b1b", info: "#1d4ed8" };
  return (
    <div style={{
      background: bg[type] || bg.info,
      border: `1px solid ${border[type] || border.info}`,
      borderRadius: 8,
      padding: "10px 16px",
      fontSize: 14,
      color: "#e5e7eb",
      marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f9fafb", margin: 0 }}>{title}</h1>
      {sub && <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function PageLoader({ label, inline }) {
  return (
    <div style={{ textAlign: "center", padding: inline ? "20px 0" : 80, color: "#6b7280" }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        border: "3px solid #374151", borderTop: "3px solid #6366f1",
        animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
      }} />
      <p style={{ fontSize: 13 }}>{label}</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const Th = ({ children }) => (
  <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11,
    fontWeight: 600, color: "#9ca3af", textTransform: "uppercase",
    letterSpacing: "0.05em", borderBottom: "1px solid #1f2937" }}>
    {children}
  </th>
);

const Td = ({ children }) => (
  <td style={{ padding: "12px 14px", fontSize: 13, color: "#d1d5db",
    borderBottom: "1px solid #111827" }}>
    {children}
  </td>
);

// ─────────────────────────────────────────────────────────────────────────────
// Styles (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
const styles = {
  page: { padding: "28px 32px", maxWidth: 1100, margin: "0 auto", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#111827", border: "1px solid #1f2937", borderRadius: 12,
    padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: 600, color: "#f3f4f6", marginBottom: 16, marginTop: 0 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 16 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 16 },
  meta: { fontSize: 12, color: "#6b7280", marginTop: 6, marginBottom: 0 },
  empty: { color: "#6b7280", fontSize: 13, textAlign: "center", padding: "20px 0" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  tr: { transition: "background .15s" },
  label: { fontSize: 13, color: "#9ca3af" },
  input: { background: "#1f2937", border: "1px solid #374151", borderRadius: 6,
    padding: "8px 12px", color: "#f9fafb", fontSize: 13 },
  btnSecondary: { background: "#1f2937", border: "1px solid #374151", borderRadius: 6,
    padding: "8px 16px", color: "#d1d5db", fontSize: 13, cursor: "pointer" },
  btnDanger: { background: "#450a0a", border: "1px solid #991b1b", borderRadius: 6,
    padding: "8px 16px", color: "#fca5a5", fontSize: 13, cursor: "pointer" },
};
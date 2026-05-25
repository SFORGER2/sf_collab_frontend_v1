// src/components/pages/erp/AnalyticsDashboard.jsx (debug version)
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";

const api = axios.create({ baseURL: "/api/erp-analytics" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const pct = (v) => (v != null ? `${Math.round(v)}%` : "—");
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

const PERIODS = [
  { value: "weekly",  label: "This Week",   days: 7 },
  { value: "monthly", label: "This Month",  days: 30 },
  { value: "quarter", label: "Last Quarter", days: 90 },
];

export function AnalyticsDashboard() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const [period, setPeriod] = useState("monthly");
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAnalytics = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const endDate = new Date().toISOString().split("T")[0];
      let startDate;
      if (period === "weekly") {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        startDate = start.toISOString().split("T")[0];
      } else if (period === "monthly") {
        const start = new Date();
        start.setDate(1);
        startDate = start.toISOString().split("T")[0];
      } else {
        const start = new Date();
        start.setMonth(start.getMonth() - 3);
        startDate = start.toISOString().split("T")[0];
      }
      console.log("Fetching analytics with:", { workspaceId, startDate, endDate });
      const response = await api.get("/workspace", {
        params: { workspace_id: workspaceId, start_date: startDate, end_date: endDate },
      });
      console.log("Analytics API response:", response.data);
      const data = response.data?.data || response.data;
      setMetrics(data.metrics);
    } catch (err) {
      console.error("Analytics error:", err);
      setError(err?.response?.data?.error || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [workspaceId, period]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) return <Spinner />;
  if (error) return <Banner type="error">{error}</Banner>;
  if (!metrics) return <div style={{ padding: 80, textAlign: "center" }}>No data yet</div>;

  const activeRate = metrics.active_users?.rate || 0;

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div>
          <h1 style={s.h1}>Analytics</h1>
          <p style={s.sub}>Workspace performance overview</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)} style={period === p.value ? s.periodActive : s.periodBtn}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={s.kpiGrid}>
        <KPICard label="Attendance Rate" value={pct(metrics.attendance_rate)} icon="📅" accent="#22c55e" />
        <KPICard label="Task Completion" value={pct(metrics.task_completion_rate)} icon="✅" accent="#6366f1" />
        <KPICard label="Update Consistency" value={pct(metrics.update_consistency)} icon="📝" accent="#f59e0b" />
        <KPICard label="Active Users (7d)" value={`${metrics.active_users?.active || 0} / ${metrics.active_users?.total || 0}`} icon="👥" accent="#06b6d4" sub={`${Math.round(activeRate)}% active`} />
      </div>

      <div style={s.grid2}>
        <MetricBreakdown metrics={metrics} />
        {metrics.details && <DetailsPanel details={metrics.details} />}
      </div>
    </div>
  );
}

// ... (rest of the component – same as before, but I'll keep the sub-components for completeness)

function KPICard({ label, value, icon, accent, sub }) {
  return (
    <div style={{ ...s.card, borderTop: `3px solid ${accent}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>
        {label}
      </p>
      <p style={{ fontSize: 32, fontWeight: 700, color: accent, margin: 0 }}>{value}</p>
      {sub && <p style={s.meta}>{sub}</p>}
    </div>
  );
}

function MetricBreakdown({ metrics }) {
  const bars = [
    { label: "Attendance Rate",   value: metrics.attendance_rate,       color: "#22c55e" },
    { label: "Task Completion",   value: metrics.task_completion_rate,  color: "#6366f1" },
    { label: "Update Consistency", value: metrics.update_consistency,    color: "#f59e0b" },
  ];
  return (
    <div style={s.card}>
      <h3 style={s.cardTitle}>Metric Overview</h3>
      {bars.map((b) => (
        <div key={b.label} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{b.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>{Math.round(b.value)}%</span>
          </div>
          <div style={{ background: "#1f2937", borderRadius: 99, height: 6, overflow: "hidden" }}>
            <div style={{ background: b.color, width: `${Math.min(b.value, 100)}%`, height: "100%", borderRadius: 99, transition: "width 0.6s ease" }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Chip label="Overdue Tasks" value={metrics.details?.tasks_total ?? "—"} accent="#ef4444" />
        <Chip label="Active (Weekly)" value={metrics.active_users?.active ?? "—"} accent="#06b6d4" />
      </div>
    </div>
  );
}

function DetailsPanel({ details }) {
  if (!details) return null;
  return (
    <div style={s.card}>
      <h3 style={s.cardTitle}>Period Details</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div><span style={{ color: "#6b7280" }}>Dates:</span> {fmtDate(details.date_start)} → {fmtDate(details.date_end)}</div>
        <div><span style={{ color: "#6b7280" }}>Attendance:</span> {details.attendance_presentish} / {details.attendance_expected} days</div>
        <div><span style={{ color: "#6b7280" }}>Tasks:</span> {details.tasks_done} / {details.tasks_total} completed</div>
        <div><span style={{ color: "#6b7280" }}>Updates:</span> {details.updates_submitted} / {details.updates_expected} submitted</div>
      </div>
    </div>
  );
}

function Chip({ label, value, accent }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 18, fontWeight: 700, color: accent, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 0" }}>{label}</p>
    </div>
  );
}

function Banner({ type, children }) {
  const bg = { error: "#450a0a", success: "#052e16", info: "#0c1a2e" };
  const border = { error: "#991b1b", success: "#166534", info: "#1d4ed8" };
  return (
    <div style={{ background: bg[type], border: `1px solid ${border[type]}`, borderRadius: 8, padding: "10px 16px", fontSize: 13, color: "#e5e7eb", marginBottom: 12 }}>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", border: "3px solid #1f2937", borderTop: "3px solid #6366f1", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const s = {
  page:        { padding: "28px 32px", maxWidth: 1100, margin: "0 auto", fontFamily: "'DM Sans', sans-serif" },
  topBar:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  h1:          { fontSize: 24, fontWeight: 700, color: "#f9fafb", margin: 0 },
  sub:         { color: "#6b7280", fontSize: 13, marginTop: 4 },
  kpiGrid:     { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 16 },
  grid2:       { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12, marginBottom: 16 },
  card:        { background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20, marginBottom: 16 },
  cardTitle:   { fontSize: 13, fontWeight: 600, color: "#f3f4f6", marginBottom: 16, marginTop: 0 },
  meta:        { fontSize: 12, color: "#6b7280", margin: "4px 0 0" },
  periodBtn:   { background: "#1f2937", border: "1px solid #374151", borderRadius: 6, padding: "6px 14px", color: "#9ca3af", fontSize: 12, cursor: "pointer" },
  periodActive:{ background: "#1e1b4b", border: "1px solid #4338ca", borderRadius: 6, padding: "6px 14px", color: "#a5b4fc", fontSize: 12, fontWeight: 600, cursor: "pointer" },
};
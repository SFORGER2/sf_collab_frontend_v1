/**
 * AnalyticsDashboard.jsx — SFCollab ERP
 * Covers: Attendance rate, Task completion, Update consistency, Active users
 * API wiring: analytics.py routes at /analytics/*
 *   GET /analytics/workspace   → workspace metrics + trends
 *   GET /analytics/trends      → period-over-period (admin)
 *   GET /analytics/anomalies   → anomaly detection (admin)
 *   GET /analytics/history/:id → sparkline data
 *
 * JWT claims expected: { workspace_id, role, sub }
 * No recharts — uses SVG sparklines for zero extra deps.
 */

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";

const api = axios.create({ baseURL: "" }); // Uses real ERP endpoints
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ── Helpers ───────────────────────────────────────────────────────────────────
const pct = (v) => (v != null ? `${Math.round(v)}%` : "—");
const fmt = (v, suffix = "") => (v != null ? `${v}${suffix}` : "—");
const PERIODS = [
  { value: "daily",   label: "Today" },
  { value: "weekly",  label: "This Week" },
  { value: "monthly", label: "This Month" },
];

// ═════════════════════════════════════════════════════════════════════════════
// ANALYTICS DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
export function AnalyticsDashboard() {
  const { user } = useSelector((s) => s.auth);
  const isAdmin = ["admin", "team_lead"].includes(user?.role);

  // Use user.id as the workspace scope — backend defaults workspace_id to user_id
  const workspaceId = user?.id;

  const [period, setPeriod]       = useState("weekly");
  const [data, setData]           = useState(null);
  const [trends, setTrends]       = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [history, setHistory]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const params = { period, workspace_id: workspaceId };
      const calls = [
        api.get("/api/attendance/workspace-summary", { params: { workspace_id: workspaceId } }),
      ];
      if (isAdmin) {
        calls.push(api.get("/api/erp-alerts", { params: { workspace_id: workspaceId } }));
        calls.push(api.get("/api/activity", { params: { workspace_id: workspaceId } }));
        calls.push(api.get("/api/attendance/history", {
          params: { period: "weekly", limit: 12 },
        }));
      }
      const [wsRes, trendRes, anomalyRes, histRes] = await Promise.all(calls);
      setData(wsRes.data);
      setTrends(trendRes?.data || null);
      setAnomalies(anomalyRes?.data?.anomalies || []);
      setHistory(histRes?.data || []);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [workspaceId, period, isAdmin]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div>
          <h1 style={s.h1}>Analytics</h1>
          <p style={s.sub}>Workspace performance overview</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              style={period === p.value ? s.periodActive : s.periodBtn}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <Banner type="error">{error}</Banner>}

      {loading ? <Spinner /> : data ? (
        <>
          {/* KPI row */}
          <div style={s.kpiGrid}>
            <KPICard
              label="Attendance Rate"
              value={pct(data.attendance_rate)}
              icon="📅"
              accent="#22c55e"
              trend={trends?.attendance_rate}
            />
            <KPICard
              label="Task Completion"
              value={pct(data.task_completion_rate)}
              icon="✅"
              accent="#6366f1"
              trend={trends?.task_completion_rate}
            />
            <KPICard
              label="Update Consistency"
              value={pct(data.update_consistency)}
              icon="📝"
              accent="#f59e0b"
              trend={trends?.update_consistency}
            />
            <KPICard
              label="Active Users (Today)"
              value={fmt(data.active_users_daily)}
              icon="👥"
              accent="#06b6d4"
              sub={`/ ${data.total_users ?? "?"} total`}
            />
          </div>

          {/* Second row */}
          <div style={s.grid2}>
            <MetricBreakdown data={data} />
            {isAdmin && <TrendsPanel trends={trends} />}
          </div>

          {/* Sparkline history */}
          {isAdmin && history.length > 1 && (
            <HistoryChart history={history} />
          )}

          {/* Anomalies */}
          {isAdmin && anomalies.length > 0 && (
            <AnomaliesPanel anomalies={anomalies} />
          )}

          {/* Team breakdown (if returned) */}
          {data.team_breakdown && data.team_breakdown.length > 0 && (
            <TeamBreakdown rows={data.team_breakdown} />
          )}
        </>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────────────────────────────────────
function KPICard({ label, value, icon, accent, trend, sub }) {
  const trendUp = trend?.change > 0;
  const trendDown = trend?.change < 0;

  return (
    <div style={{ ...s.card, borderTop: `3px solid ${accent}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        {trend != null && (
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: trendUp ? "#22c55e" : trendDown ? "#ef4444" : "#6b7280",
          }}>
            {trendUp ? "▲" : trendDown ? "▼" : "—"} {Math.abs(trend.change ?? 0).toFixed(1)}%
          </span>
        )}
      </div>
      <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>
        {label}
      </p>
      <p style={{ fontSize: 32, fontWeight: 700, color: accent, margin: 0 }}>{value}</p>
      {sub && <p style={s.meta}>{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Metric Breakdown (bar chart via CSS)
// ─────────────────────────────────────────────────────────────────────────────
function MetricBreakdown({ data }) {
  const bars = [
    { label: "Attendance Rate",   value: data.attendance_rate    ?? 0, color: "#22c55e" },
    { label: "Task Completion",   value: data.task_completion_rate ?? 0, color: "#6366f1" },
    { label: "Update Consistency", value: data.update_consistency ?? 0, color: "#f59e0b" },
    { label: "Active Users %",    value: data.total_users
        ? Math.round((data.active_users_daily / data.total_users) * 100)
        : 0, color: "#06b6d4" },
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
            <div style={{
              background: b.color, width: `${Math.min(b.value, 100)}%`,
              height: "100%", borderRadius: 99, transition: "width 0.6s ease",
            }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Chip label="Overdue Tasks" value={data.overdue_tasks ?? 0} accent="#ef4444" />
        <Chip label="Active (Weekly)" value={data.active_users_weekly ?? "—"} accent="#06b6d4" />
        <Chip label="Total Users" value={data.total_users ?? "—"} accent="#6b7280" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Trends Panel
// ─────────────────────────────────────────────────────────────────────────────
function TrendsPanel({ trends }) {
  if (!trends) return (
    <div style={s.card}>
      <h3 style={s.cardTitle}>Period Trends</h3>
      <p style={{ color: "#4b5563", fontSize: 13 }}>No trend data available.</p>
    </div>
  );

  const metrics = [
    { key: "attendance_rate",    label: "Attendance",  color: "#22c55e" },
    { key: "task_completion_rate", label: "Tasks",     color: "#6366f1" },
    { key: "update_consistency", label: "Updates",     color: "#f59e0b" },
    { key: "active_users_daily", label: "Active",      color: "#06b6d4" },
  ];

  return (
    <div style={s.card}>
      <h3 style={s.cardTitle}>Period-over-Period</h3>
      {metrics.map((m) => {
        const curr = trends.current?.[m.key];
        const prev = trends.previous?.[m.key];
        const change = curr != null && prev != null ? curr - prev : null;
        return (
          <div key={m.key} style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1f2937" }}>
            <span style={{ fontSize: 13, color: "#d1d5db" }}>{m.label}</span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {prev != null && (
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  {typeof prev === "number" && prev <= 100 ? pct(prev) : fmt(prev)}
                </span>
              )}
              <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>
                {curr != null ? (curr <= 100 ? pct(curr) : fmt(curr)) : "—"}
              </span>
              {change != null && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: change > 0 ? "#22c55e" : change < 0 ? "#ef4444" : "#6b7280",
                }}>
                  {change > 0 ? "+" : ""}{change.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Sparkline history chart
// ─────────────────────────────────────────────────────────────────────────────
function HistoryChart({ history }) {
  const W = 600, H = 100, PAD = 10;

  const series = [
    { key: "attendance_rate",      color: "#22c55e", label: "Attendance" },
    { key: "task_completion_rate", color: "#6366f1", label: "Tasks" },
    { key: "update_consistency",   color: "#f59e0b", label: "Updates" },
  ];

  const n = history.length;
  if (n < 2) return null;

  const xStep = (W - PAD * 2) / (n - 1);

  const toPath = (key) => {
    const vals = history.map((h) => h[key] ?? 0);
    const min = Math.min(...vals), max = Math.max(...vals) || 100;
    const points = vals.map((v, i) => {
      const x = PAD + i * xStep;
      const y = H - PAD - ((v - min) / (max - min || 1)) * (H - PAD * 2);
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  };

  const labels = history.map((h) =>
    h.period_start ? new Date(h.period_start).toLocaleDateString([], { month: "short", day: "numeric" }) : ""
  );

  return (
    <div style={s.card}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ ...s.cardTitle, marginBottom: 0 }}>12-Week Trend</h3>
        <div style={{ display: "flex", gap: 12 }}>
          {series.map((sr) => (
            <span key={sr.key} style={{ fontSize: 11, color: sr.color, display: "flex", gap: 5, alignItems: "center" }}>
              <span style={{ width: 16, height: 2, background: sr.color, display: "inline-block" }} />
              {sr.label}
            </span>
          ))}
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H + 20}`} style={{ width: "100%", minWidth: 300 }}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((v) => {
            const y = H - PAD - (v / 100) * (H - PAD * 2);
            return (
              <line key={v} x1={PAD} y1={y} x2={W - PAD} y2={y}
                stroke="#1f2937" strokeWidth="1" />
            );
          })}

          {/* Series lines */}
          {series.map((sr) => (
            <path key={sr.key} d={toPath(sr.key)}
              fill="none" stroke={sr.color} strokeWidth="2"
              strokeLinejoin="round" strokeLinecap="round" />
          ))}

          {/* X labels */}
          {labels.filter((_, i) => i % Math.ceil(n / 6) === 0).map((label, i) => {
            const idx = i * Math.ceil(n / 6);
            return (
              <text key={i} x={PAD + idx * xStep} y={H + 14}
                fontSize="9" fill="#6b7280" textAnchor="middle">
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Anomalies panel
// ─────────────────────────────────────────────────────────────────────────────
function AnomaliesPanel({ anomalies }) {
  return (
    <div style={{ ...s.card, borderColor: "#7f1d1d" }}>
      <h3 style={{ ...s.cardTitle, color: "#fca5a5" }}>⚠ Anomalies Detected</h3>
      {anomalies.map((a, i) => (
        <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0",
          borderBottom: "1px solid #1f2937", alignItems: "flex-start" }}>
          <span style={{ color: "#ef4444", fontSize: 16, flexShrink: 0 }}>●</span>
          <div>
            <p style={{ color: "#fca5a5", fontSize: 13, margin: "0 0 2px", fontWeight: 600 }}>
              {a.metric?.replace(/_/g, " ")}
            </p>
            <p style={{ color: "#9ca3af", fontSize: 12, margin: 0 }}>
              {a.description || `Value ${a.value} deviates from expected ${a.expected}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Team breakdown table
// ─────────────────────────────────────────────────────────────────────────────
function TeamBreakdown({ rows }) {
  return (
    <div style={s.card}>
      <h3 style={s.cardTitle}>Team Breakdown</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Team / Dept", "Attendance", "Task Completion", "Updates", "Active"].map((h) => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11,
                  fontWeight: 600, color: "#9ca3af", textTransform: "uppercase",
                  letterSpacing: "0.05em", borderBottom: "1px solid #1f2937" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={td}>{r.name || r.department || "—"}</td>
                <td style={td}>{pct(r.attendance_rate)}</td>
                <td style={td}>{pct(r.task_completion_rate)}</td>
                <td style={td}>{pct(r.update_consistency)}</td>
                <td style={td}>{r.active_users ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tiny helpers
// ─────────────────────────────────────────────────────────────────────────────
function Chip({ label, value, accent }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 18, fontWeight: 700, color: accent, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 0" }}>{label}</p>
    </div>
  );
}

function Banner({ type, children }) {
  const bg = { success: "#052e16", error: "#450a0a", info: "#0c1a2e" };
  const border = { success: "#166534", error: "#991b1b", info: "#1d4ed8" };
  return (
    <div style={{ background: bg[type], border: `1px solid ${border[type]}`,
      borderRadius: 8, padding: "10px 16px", fontSize: 13, color: "#e5e7eb", marginBottom: 12 }}>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%",
        border: "3px solid #1f2937", borderTop: "3px solid #6366f1",
        animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const td = { padding: "10px 12px", fontSize: 13, color: "#d1d5db", borderBottom: "1px solid #111827" };

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s = {
  page:        { padding: "28px 32px", maxWidth: 1100, margin: "0 auto", fontFamily: "'DM Sans', sans-serif" },
  topBar:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                 marginBottom: 24, flexWrap: "wrap", gap: 12 },
  h1:          { fontSize: 24, fontWeight: 700, color: "#f9fafb", margin: 0 },
  sub:         { color: "#6b7280", fontSize: 13, marginTop: 4 },
  kpiGrid:     { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 16 },
  grid2:       { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12, marginBottom: 16 },
  card:        { background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20, marginBottom: 16 },
  cardTitle:   { fontSize: 13, fontWeight: 600, color: "#f3f4f6", marginBottom: 16, marginTop: 0 },
  meta:        { fontSize: 12, color: "#6b7280", margin: "4px 0 0" },
  periodBtn:   { background: "#1f2937", border: "1px solid #374151", borderRadius: 6,
                 padding: "6px 14px", color: "#9ca3af", fontSize: 12, cursor: "pointer" },
  periodActive:{ background: "#1e1b4b", border: "1px solid #4338ca", borderRadius: 6,
                 padding: "6px 14px", color: "#a5b4fc", fontSize: 12, fontWeight: 600, cursor: "pointer" },
};
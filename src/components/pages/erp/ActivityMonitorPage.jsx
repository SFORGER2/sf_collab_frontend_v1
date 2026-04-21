/**
 * ActivityMonitorPage.jsx — SFCollab ERP
 * Covers: Active users, status summary (admin), workspace activity feed
 * API wiring: activityMonitor.py routes at /api/activity/*
 *   GET /api/activity/me               → current user's activity
 *   GET /api/activity/status-summary   → active/idle/inactive/dead counts (admin)
 *   GET /api/activity/workspace        → paginated workspace activity (admin)
 *   GET /api/activity/active-users     → only active users (admin)
 *   GET /api/activity/inactive-users   → idle/inactive users (admin)
 *   POST /api/activity/heartbeat       → update own last_activity
 *
 * UserActivity statuses: active | idle | inactive | dead | unknown
 * Thresholds from ACTIVITY_CONFIG:
 *   active   < 5 min
 *   idle     < 30 min
 *   inactive < 24 h
 *   dead     ≥ 24 h
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_META = {
  active:   { color: "#22c55e", bg: "#052e16", label: "Active",   dot: "●" },
  idle:     { color: "#f59e0b", bg: "#451a03", label: "Idle",     dot: "●" },
  inactive: { color: "#6366f1", bg: "#1e1b4b", label: "Inactive", dot: "●" },
  dead:     { color: "#4b5563", bg: "#111827", label: "Offline",  dot: "○" },
  unknown:  { color: "#6b7280", bg: "#111827", label: "Unknown",  dot: "○" },
};

const fmtAgo = (iso) => {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const HEARTBEAT_INTERVAL_MS = 60_000; // 1 min — server rate-limits at 30/min

// ═════════════════════════════════════════════════════════════════════════════
// ACTIVITY MONITOR PAGE
// ═════════════════════════════════════════════════════════════════════════════
export function ActivityMonitorPage() {
  const { user } = useSelector((s) => s.auth);
  const isAdmin = ["admin", "team_lead"].includes(user?.role);

  const [tab, setTab] = useState("summary"); // summary | workspace | active | inactive

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div>
          <h1 style={s.h1}>Activity Monitor</h1>
          <p style={s.sub}>Real-time workspace presence</p>
        </div>
        <HeartbeatBeacon />
      </div>

      {/* My status card always visible */}
      <MyActivityCard />

      {isAdmin && (
        <>
          {/* Tab nav */}
          <div style={s.tabRow}>
            {[
              { id: "summary",   label: "Status Summary" },
              { id: "workspace", label: "All Members" },
              { id: "active",    label: "Active Now" },
              { id: "inactive",  label: "Inactive" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={tab === t.id ? s.tabActive : s.tab}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "summary"   && <StatusSummaryPanel />}
          {tab === "workspace" && <WorkspaceActivityPanel />}
          {tab === "active"    && <UserListPanel endpoint="/activity/active-users" emptyMsg="No users active in the last 5 minutes." />}
          {tab === "inactive"  && <UserListPanel endpoint="/activity/inactive-users" emptyMsg="No inactive users." />}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Heartbeat beacon — silently pings heartbeat to keep current_user's status fresh
// ─────────────────────────────────────────────────────────────────────────────
function HeartbeatBeacon() {
  const timerRef = useRef(null);
  const [beat, setBeat] = useState(false);

  const ping = useCallback(async () => {
    try {
      await api.post("/activity/heartbeat", {
        client_timestamp: new Date().toISOString(),
      });
      setBeat(true);
      setTimeout(() => setBeat(false), 600);
    } catch { /* silent — rate limit or network */ }
  }, []);

  useEffect(() => {
    ping();
    timerRef.current = setInterval(ping, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [ping]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: beat ? "#22c55e" : "#374151",
        transition: "background 0.3s",
      }} />
      <span style={{ fontSize: 12, color: "#6b7280" }}>Heartbeat active</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// My Activity Card
// ─────────────────────────────────────────────────────────────────────────────
function MyActivityCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/activity/me")
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!data || data.status === "no_data") return null;

  const m = STATUS_META[data.status] || STATUS_META.unknown;

  return (
    <div style={{ ...s.card, display: "flex", gap: 16, alignItems: "center",
      borderLeft: `3px solid ${m.color}`, marginBottom: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%",
        background: m.bg, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
        👤
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: "#f9fafb", fontWeight: 600, fontSize: 14 }}>Your Status</span>
          <StatusDot status={data.status} />
        </div>
        <p style={s.meta}>
          Last activity: <strong style={{ color: "#d1d5db" }}>{fmtAgo(data.last_activity)}</strong>
          {data.last_login && (
            <> · Last login: <strong style={{ color: "#d1d5db" }}>{fmtAgo(data.last_login)}</strong></>
          )}
        </p>
        {data.ip_address && (
          <p style={s.meta}>IP: {data.ip_address}</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Summary (admin)
// ─────────────────────────────────────────────────────────────────────────────
function StatusSummaryPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/activity/status-summary")
      .then((r) => setData(r.data))
      .catch((e) => setError(e?.response?.data?.error || "Could not load summary"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error)   return <Banner type="error">{error}</Banner>;
  if (!data)   return null;

  const segments = [
    { key: "active",   label: "Active",   color: "#22c55e" },
    { key: "idle",     label: "Idle",     color: "#f59e0b" },
    { key: "inactive", label: "Inactive", color: "#6366f1" },
    { key: "dead",     label: "Offline",  color: "#374151" },
  ];

  const total = data.total || 1;
  const onlinePct = Math.round(((data.active + data.idle) / total) * 100);

  return (
    <>
      {/* Big stat */}
      <div style={{ ...s.card, textAlign: "center", marginBottom: 16 }}>
        <p style={{ fontSize: 52, fontWeight: 800, color: "#22c55e", margin: 0 }}>
          {data.active + data.idle}
        </p>
        <p style={{ color: "#9ca3af", fontSize: 13, margin: "4px 0 0" }}>
          Online now ({onlinePct}% of {total} members)
        </p>
        {/* Stacked bar */}
        <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden",
          margin: "16px auto", maxWidth: 400, background: "#1f2937" }}>
          {segments.map((seg) => {
            const pct = (data[seg.key] / total) * 100;
            return pct > 0 ? (
              <div key={seg.key} style={{ width: `${pct}%`, background: seg.color,
                transition: "width 0.6s ease" }} title={`${seg.label}: ${data[seg.key]}`} />
            ) : null;
          })}
        </div>
      </div>

      {/* Cards */}
      <div style={s.grid4}>
        {segments.map((seg) => (
          <div key={seg.key} style={{ ...s.card, borderTop: `3px solid ${seg.color}`, marginBottom: 0 }}>
            <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px" }}>
              {seg.label}
            </p>
            <p style={{ fontSize: 30, fontWeight: 700, color: seg.color, margin: 0 }}>
              {data[seg.key] ?? 0}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Workspace activity table (admin)
// ─────────────────────────────────────────────────────────────────────────────
function WorkspaceActivityPanel() {
  const [records, setRecords]   = useState([]);
  const [page, setPage]         = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const LIMIT = 20;

  const load = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const { data } = await api.get("/activity/workspace", {
        params: { page: p, limit: LIMIT },
      });
      setRecords(data.data || []);
    } catch (e) {
      setError(e?.response?.data?.error || "Could not load workspace activity");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [load, page]);

  if (loading) return <Spinner />;
  if (error)   return <Banner type="error">{error}</Banner>;

  return (
    <div style={s.card}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ ...s.cardTitle, marginBottom: 0 }}>All Members</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} style={s.pageBtn}>← Prev</button>
          <span style={{ color: "#6b7280", fontSize: 12, alignSelf: "center" }}>Page {page + 1}</span>
          <button disabled={records.length < LIMIT} onClick={() => setPage((p) => p + 1)} style={s.pageBtn}>Next →</button>
        </div>
      </div>
      {records.length === 0 ? (
        <p style={s.empty}>No activity records found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Member", "Status", "Last Active", "Online"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.user_id} style={{ borderBottom: "1px solid #111827" }}>
                  <td style={tdStyle}>{r.name || `User #${r.user_id}`}</td>
                  <td style={tdStyle}><StatusDot status={r.status} /></td>
                  <td style={tdStyle}>{fmtAgo(r.last_activity)}</td>
                  <td style={tdStyle}>
                    <span style={{ color: r.is_online ? "#22c55e" : "#6b7280", fontWeight: 600, fontSize: 12 }}>
                      {r.is_online ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic user list panel (active / inactive)
// ─────────────────────────────────────────────────────────────────────────────
function UserListPanel({ endpoint, emptyMsg }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    api.get(endpoint, { params: { limit: 50 } })
      .then((r) => setRecords(r.data.data || []))
      .catch((e) => setError(e?.response?.data?.error || "Load failed"))
      .finally(() => setLoading(false));
  }, [endpoint]);

  if (loading) return <Spinner />;
  if (error)   return <Banner type="error">{error}</Banner>;
  if (!records.length) return (
    <EmptyState icon="💤" title={emptyMsg} sub="" />
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
      {records.map((r) => {
        const m = STATUS_META[r.status] || STATUS_META.unknown;
        return (
          <div key={r.user_id} style={{ ...s.card, marginBottom: 0,
            borderLeft: `2px solid ${m.color}`, display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.bg,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
              👤
            </div>
            <div>
              <p style={{ color: "#f9fafb", fontSize: 13, fontWeight: 600, margin: 0 }}>
                {r.name || `User #${r.user_id}`}
              </p>
              <p style={s.meta}>{fmtAgo(r.last_activity)}</p>
            </div>
            <StatusDot status={r.status} style={{ marginLeft: "auto" }} />
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tiny helpers
// ─────────────────────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const m = STATUS_META[status] || STATUS_META.unknown;
  return (
    <span style={{
      background: m.bg, color: m.color, border: `1px solid ${m.color}33`,
      borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <span style={{ fontSize: 8, lineHeight: 1 }}>{m.dot}</span>
      {m.label}
    </span>
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

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 0", color: "#6b7280" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 15, color: "#9ca3af", margin: "0 0 4px" }}>{title}</p>
      {sub && <p style={{ fontSize: 12 }}>{sub}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: 50 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%",
        border: "3px solid #1f2937", borderTop: "3px solid #6366f1",
        animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s = {
  page:       { padding: "28px 32px", maxWidth: 1100, margin: "0 auto", fontFamily: "'DM Sans', sans-serif" },
  topBar:     { display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 20, flexWrap: "wrap", gap: 12 },
  h1:         { fontSize: 24, fontWeight: 700, color: "#f9fafb", margin: 0 },
  sub:        { color: "#6b7280", fontSize: 13, marginTop: 4 },
  card:       { background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20 },
  cardTitle:  { fontSize: 13, fontWeight: 600, color: "#f3f4f6", marginBottom: 16, marginTop: 0 },
  meta:       { fontSize: 12, color: "#6b7280", margin: "4px 0 0" },
  grid4:      { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 16 },
  tabRow:     { display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" },
  tab:        { background: "#1f2937", border: "1px solid #374151", borderRadius: 6,
                padding: "6px 14px", color: "#9ca3af", fontSize: 13, cursor: "pointer" },
  tabActive:  { background: "#1e1b4b", border: "1px solid #4338ca", borderRadius: 6,
                padding: "6px 14px", color: "#a5b4fc", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  pageBtn:    { background: "#1f2937", border: "1px solid #374151", borderRadius: 6,
                padding: "5px 12px", color: "#9ca3af", fontSize: 12, cursor: "pointer" },
  empty:      { color: "#6b7280", fontSize: 13, textAlign: "center", padding: "20px 0" },
};

const thStyle = {
  padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 600,
  color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em",
  borderBottom: "1px solid #1f2937",
};
const tdStyle = {
  padding: "10px 12px", fontSize: 13, color: "#d1d5db",
};
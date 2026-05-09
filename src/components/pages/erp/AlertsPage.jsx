/**
 * AlertsPage.jsx — SFCollab ERP
 * Covers: Alert list (by type/priority), resolve alert, view user
 * API wiring: alert.py (alerts_engine) — expects routes at /api/alerts/*
 * Uses Alert model: id, type, priority, message, user_id, resolved, archived,
 *   created_at, resolved_at, resolved_by, resolution_note
 * AlertType enum: missing_attendance | late_attendance | missing_update |
 *   task_overdue | inactive_user
 * AlertPriority enum: LOW | MEDIUM | HIGH
 */

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";

const api = axios.create({ baseURL: "/api/erp-alerts" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ── Constants ────────────────────────────────────────────────────────────────
const ALERT_TYPES = [
  { value: "",                   label: "All Types" },
  { value: "missing_attendance", label: "Missing Attendance" },
  { value: "late_attendance",    label: "Late Attendance" },
  { value: "missing_update",     label: "Missing Update" },
  { value: "task_overdue",       label: "Overdue Task" },
  { value: "inactive_user",      label: "Inactive User" },
];

const TYPE_META = {
  missing_attendance: { icon: "📋", color: "#ef4444", bg: "#450a0a" },
  late_attendance:    { icon: "⏰", color: "#f59e0b", bg: "#451a03" },
  missing_update:     { icon: "📝", color: "#6366f1", bg: "#1e1b4b" },
  task_overdue:       { icon: "🔥", color: "#f97316", bg: "#431407" },
  inactive_user:      { icon: "💤", color: "#6b7280", bg: "#111827" },
};

const PRIORITY_COLOR = {
  HIGH:   { text: "#ef4444", bg: "#450a0a", border: "#7f1d1d" },
  MEDIUM: { text: "#f59e0b", bg: "#451a03", border: "#78350f" },
  LOW:    { text: "#6b7280", bg: "#111827", border: "#374151" },
};

const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleString([], { month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit" }) : "—";

// ═════════════════════════════════════════════════════════════════════════════
// ALERTS PAGE
// ═════════════════════════════════════════════════════════════════════════════
export function AlertsPage() {
  const { user } = useSelector((s) => s.auth);
  const isAdmin = ["admin", "team_lead"].includes(user?.role);
  const navigate = useNavigate();

  // Use user.id as the workspace scope — backend defaults workspace_id to user_id
  const workspaceId = user?.id;

  const [alerts, setAlerts]             = useState([]);
  const [digest, setDigest]             = useState(null);
  const [typeFilter, setTypeFilter]     = useState("");
  const [showResolved, setShowResolved] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [resolving, setResolving]       = useState(null);
  const [modal, setModal]               = useState(null);
  const [notice, setNotice]             = useState(null);
  const [error, setError]               = useState(null);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setNotice(msg);
    setTimeout(() => { setError(null); setNotice(null); }, 4500);
  };

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const params = { workspace_id: workspaceId, limit: 100 };
      if (typeFilter)   params.type     = typeFilter;
      if (showResolved) params.resolved = true;

      const [alertsRes, digestRes] = await Promise.all([
        api.get("", { params }),
        isAdmin ? api.get("/digest", { params: { workspace_id: workspaceId } }) : Promise.resolve({ data: null }),
      ]);
      setAlerts(alertsRes.data.alerts || alertsRes.data || []);
      setDigest(digestRes.data);
    } catch (e) {
      flash(e?.response?.data?.error || "Could not load alerts", true);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, typeFilter, showResolved, isAdmin]);

  useEffect(() => { load(); }, [load]);

  const resolveAlert = async (alertId, note = "") => {
    setResolving(alertId);
    try {
      await api.post(`/${alertId}/resolve`, {
        workspace_id: workspaceId,
        resolution_note: note,
      });
      flash("Alert resolved.");
      setModal(null);
      load();
    } catch (e) {
      flash(e?.response?.data?.error || "Failed to resolve alert", true);
    } finally {
      setResolving(null);
    }
  };

  const openResolveModal = (alert) => setModal({ alert, note: "" });

  // ── Active vs resolved split ───────────────────────────────────────────────
  const active   = alerts.filter((a) => !a.resolved && !a.archived);
  const resolved = alerts.filter((a) => a.resolved);

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div>
          <h1 style={s.h1}>Alerts</h1>
          <p style={s.sub}>Workspace warnings and action items</p>
        </div>
        <button onClick={load} style={s.btnGhost}>↻ Refresh</button>
      </div>

      {notice && <Banner type="success">{notice}</Banner>}
      {error  && <Banner type="error">{error}</Banner>}

      {/* Digest summary (admin) */}
      {isAdmin && digest && <DigestBar digest={digest} />}

      {/* Filters */}
      <div style={s.filterRow}>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={s.select}
        >
          {ALERT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 13 }}>
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            style={{ accentColor: "#6366f1" }}
          />
          Show resolved
        </label>

        <span style={{ marginLeft: "auto", color: "#6b7280", fontSize: 13 }}>
          {active.length} active alert{active.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Alert list */}
      {loading ? (
        <Spinner />
      ) : active.length === 0 && !showResolved ? (
        <EmptyState icon="✅" title="No active alerts" sub="The workspace is looking healthy." />
      ) : (
        <>
          {active.map((a) => (
            <AlertCard
              key={a.id}
              alert={a}
              isAdmin={isAdmin}
              onResolve={() => openResolveModal(a)}
              resolving={resolving === a.id}
              onViewUser={(userId) => navigate(`/users/${userId}`)}
            />
          ))}

          {showResolved && resolved.length > 0 && (
            <>
              <div style={s.sectionDivider}>Resolved ({resolved.length})</div>
              {resolved.map((a) => (
                <AlertCard key={a.id} alert={a} isAdmin={false} resolved />
              ))}
            </>
          )}
        </>
      )}

      {/* Resolve modal */}
      {modal && (
        <ResolveModal
          alert={modal.alert}
          onClose={() => setModal(null)}
          onConfirm={(note) => resolveAlert(modal.alert.id, note)}
          loading={resolving === modal.alert.id}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function DigestBar({ digest }) {
  const groups = digest?.groups || [];
  return (
    <div style={s.digestBar}>
      <span style={{ color: "#9ca3af", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>
        Today's Digest
      </span>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {groups.map((g, i) => {
          const m = TYPE_META[g.type] || TYPE_META.inactive_user;
          const p = PRIORITY_COLOR[g.priority] || PRIORITY_COLOR.LOW;
          return (
            <span key={i} style={{
              background: m.bg, color: m.color, border: `1px solid ${p.border}`,
              borderRadius: 99, padding: "3px 12px", fontSize: 12, fontWeight: 600,
            }}>
              {m.icon} {g.count} {g.type.replace(/_/g, " ")}
            </span>
          );
        })}
        {groups.length === 0 && <span style={{ color: "#6b7280", fontSize: 12 }}>No open alerts today</span>}
      </div>
      <span style={{ color: "#4b5563", fontSize: 12, marginLeft: "auto" }}>
        Total open: <strong style={{ color: "#f9fafb" }}>{digest?.total_open ?? 0}</strong>
      </span>
    </div>
  );
}

function AlertCard({ alert, isAdmin, onResolve, resolving, resolved, onViewUser }) {
  const m = TYPE_META[alert.type] || TYPE_META.inactive_user;
  const p = PRIORITY_COLOR[alert.priority] || PRIORITY_COLOR.LOW;

  return (
    <div style={{
      ...s.alertCard,
      borderLeft: `3px solid ${m.color}`,
      opacity: resolved ? 0.55 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 20, marginTop: 2 }}>{m.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 4 }}>
            <span style={{
              background: p.bg, color: p.text, border: `1px solid ${p.border}`,
              borderRadius: 99, padding: "1px 10px", fontSize: 11, fontWeight: 700,
            }}>
              {alert.priority}
            </span>
            <span style={{ color: m.color, fontSize: 12, fontWeight: 600 }}>
              {alert.type?.replace(/_/g, " ")}
            </span>
            {resolved && (
              <span style={{ background: "#052e16", color: "#22c55e",
                border: "1px solid #166534", borderRadius: 99, padding: "1px 10px", fontSize: 11 }}>
                ✓ Resolved
              </span>
            )}
          </div>

          <p style={{ color: "#e5e7eb", fontSize: 14, margin: "0 0 6px" }}>{alert.message}</p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {alert.user && (
              <span style={s.metaChip}>👤 {alert.user.name || `User #${alert.user_id}`}</span>
            )}
            <span style={s.metaChip}>🕐 {fmtTime(alert.created_at)}</span>
            {resolved && alert.resolved_at && (
              <span style={s.metaChip}>✓ {fmtTime(alert.resolved_at)}</span>
            )}
            {alert.resolution_note && (
              <span style={{ ...s.metaChip, color: "#9ca3af" }}>📎 {alert.resolution_note}</span>
            )}
          </div>
        </div>

        {/* Admin action buttons */}
        {isAdmin && !resolved && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
            <button
              onClick={onResolve}
              disabled={resolving}
              style={s.btnResolve}
            >
              {resolving ? "…" : "Resolve"}
            </button>
            {alert.user_id && (
              <button
                onClick={() => onViewUser(alert.user_id)}
                style={s.btnViewUser}
              >
                View user
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResolveModal({ alert, onClose, onConfirm, loading }) {
  const [note, setNote] = useState("");
  const m = TYPE_META[alert.type] || TYPE_META.inactive_user;

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ color: "#f9fafb", fontSize: 16, margin: 0 }}>
            {m.icon} Resolve Alert
          </h3>
          <button onClick={onClose} style={s.btnGhost}>✕</button>
        </div>

        <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 12 }}>{alert.message}</p>

        <label style={s.label}>Resolution note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. User clocked in manually, task was reassigned…"
          rows={3}
          style={s.textarea}
        />

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} style={s.btnGhost}>Cancel</button>
          <button
            onClick={() => onConfirm(note)}
            disabled={loading}
            style={s.btnPrimary}
          >
            {loading ? "Resolving…" : "Confirm Resolve"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Banner({ type, children }) {
  const bg     = { success: "#052e16", error: "#450a0a", info: "#0c1a2e" };
  const border = { success: "#166534", error: "#991b1b", info: "#1d4ed8" };
  return (
    <div style={{
      background: bg[type], border: `1px solid ${border[type]}`,
      borderRadius: 8, padding: "10px 16px", fontSize: 13, color: "#e5e7eb", marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 16, fontWeight: 600, color: "#9ca3af", margin: "0 0 6px" }}>{title}</p>
      <p style={{ fontSize: 13 }}>{sub}</p>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        border: "3px solid #1f2937", borderTop: "3px solid #6366f1",
        animation: "spin 0.8s linear infinite", margin: "0 auto",
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s = {
  page:        { padding: "28px 32px", maxWidth: 900, margin: "0 auto", fontFamily: "'DM Sans', sans-serif" },
  topBar:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  h1:          { fontSize: 24, fontWeight: 700, color: "#f9fafb", margin: 0 },
  sub:         { color: "#6b7280", fontSize: 13, marginTop: 4 },
  filterRow:   { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap",
                 background: "#111827", border: "1px solid #1f2937", borderRadius: 10,
                 padding: "12px 16px", marginBottom: 16 },
  select:      { background: "#1f2937", border: "1px solid #374151", borderRadius: 6,
                 padding: "7px 12px", color: "#f9fafb", fontSize: 13 },
  digestBar:   { background: "#111827", border: "1px solid #1f2937", borderRadius: 10,
                 padding: "12px 16px", marginBottom: 16,
                 display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" },
  alertCard:   { background: "#111827", border: "1px solid #1f2937", borderRadius: 10,
                 padding: 16, marginBottom: 10 },
  metaChip:    { color: "#6b7280", fontSize: 12, display: "inline-flex", gap: 4, alignItems: "center" },
  sectionDivider: { color: "#4b5563", fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                    letterSpacing: "0.06em", padding: "16px 0 8px" },
  btnGhost:    { background: "transparent", border: "1px solid #374151", borderRadius: 6,
                 padding: "6px 14px", color: "#9ca3af", fontSize: 13, cursor: "pointer" },
  btnResolve:  { background: "#1e1b4b", border: "1px solid #4338ca", borderRadius: 6,
                 padding: "6px 14px", color: "#a5b4fc", fontSize: 13, cursor: "pointer",
                 whiteSpace: "nowrap", flexShrink: 0 },
  btnViewUser: { background: "#1f2937", border: "1px solid #374151", borderRadius: 6,
                 padding: "6px 14px", color: "#9ca3af", fontSize: 13, cursor: "pointer",
                 whiteSpace: "nowrap", flexShrink: 0 },
  btnPrimary:  { background: "#4f46e5", border: "none", borderRadius: 6,
                 padding: "8px 18px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btnDanger:   { background: "#450a0a", border: "1px solid #991b1b", borderRadius: 6,
                 padding: "8px 16px", color: "#fca5a5", fontSize: 13, cursor: "pointer" },
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
                 display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal:       { background: "#111827", border: "1px solid #1f2937", borderRadius: 14,
                 padding: 24, width: "100%", maxWidth: 460 },
  label:       { display: "block", fontSize: 12, color: "#9ca3af", marginBottom: 6 },
  textarea:    { width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: 6,
                 padding: "10px 12px", color: "#f9fafb", fontSize: 13, resize: "vertical",
                 fontFamily: "inherit", boxSizing: "border-box" },
};
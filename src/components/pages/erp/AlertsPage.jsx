// src/components/pages/erp/AlertsPage.jsx — REDESIGNED
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  User,
  RefreshCw,
  Filter,
  X,
  ExternalLink,
  Shield,
  Zap,
  FileText,
  ChevronDown,
} from "lucide-react";

import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPEmptyState } from "../../erp/shared/ERPEmptyState";
import { ERPSpinner } from "../../erp/shared/ERPLoadingSkeleton";
import { ERPBannerManager } from "../../erp/shared/ERPBanner";

const api = axios.create({ baseURL: "/api/erp-alerts" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ── Type config ────────────────────────────────────────────────────────────────
const TYPE_META = {
  missing_update:  { icon: FileText,       color: "#6366f1", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.2)",  label: "Missing Update" },
  late_attendance: { icon: Clock,          color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)",  label: "Late Attendance" },
  task_overdue:    { icon: Zap,            color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.2)",   label: "Overdue Task" },
  inactive_user:   { icon: User,           color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.2)", label: "Inactive User" },
};

const PRIORITY_CFG = {
  HIGH:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   label: "HIGH" },
  MEDIUM: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  label: "MEDIUM" },
  LOW:    { color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.2)",  label: "LOW" },
};

const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

// ═══════════════════════════════════════════════════════════════════════════════
// ALERTS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export function AlertsPage() {
  const { user } = useSelector((s) => s.auth);
  const isAdmin = ["admin", "team_lead"].includes(user?.role);
  const navigate = useNavigate();
  const workspaceId = user?.active_workspace_id || 1;

  const [alerts, setAlerts] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [showResolved, setShowResolved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(null);
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setNotice(msg);
    setTimeout(() => { setError(null); setNotice(null); }, 4500);
  };

  const loadAlerts = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const params = { workspace_id: workspaceId, limit: 100 };
      if (typeFilter) params.type = typeFilter;
      if (showResolved) params.resolved = "true";
      const response = await api.get("/list", { params });
      const data = response.data?.data || response.data;
      setAlerts(data.alerts || []);
    } catch (e) {
      flash(e?.response?.data?.error || "Could not load alerts", true);
    } finally { setLoading(false); }
  }, [workspaceId, typeFilter, showResolved]);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  const resolveAlert = async (alertId, note = "") => {
    setResolving(alertId);
    try {
      await api.post(`/${alertId}/resolve`, { resolution_note: note });
      flash("Alert resolved successfully.");
      setModal(null);
      loadAlerts();
    } catch (e) {
      flash(e?.response?.data?.error || "Failed to resolve alert", true);
    } finally { setResolving(null); }
  };

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const resolvedAlerts = alerts.filter((a) => a.resolved);

  // Group by priority
  const highAlerts = activeAlerts.filter(a => a.priority === "HIGH");
  const mediumAlerts = activeAlerts.filter(a => a.priority === "MEDIUM");
  const lowAlerts = activeAlerts.filter(a => a.priority === "LOW" || !a.priority);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <ERPPageHeader
          icon={<Bell size={20} />}
          title="Alerts & Warnings"
          description="Workspace warnings, action items and system notifications"
          breadcrumbs={[{ label: "ERP" }, { label: "Alerts" }]}
          badge={
            activeAlerts.length > 0 ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                {activeAlerts.length} active
              </span>
            ) : null
          }
          actions={
            <button
              onClick={loadAlerts}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/[0.06] text-zinc-400 hover:text-white text-sm transition-all"
            >
              <RefreshCw size={14} />
            </button>
          }
        />

        <ERPBannerManager
          notice={notice} error={error}
          onDismissNotice={() => setNotice(null)}
          onDismissError={() => setError(null)}
        />

        {/* ── Filter bar ── */}
        <div
          className="flex flex-wrap items-center gap-3 px-5 py-4 rounded-xl mb-6"
          style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Filter size={13} className="text-zinc-500 shrink-0" />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-800 border border-white/[0.06] text-zinc-300 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500/50 cursor-pointer"
          >
            <option value="">All Types</option>
            {Object.entries(TYPE_META).map(([key, m]) => (
              <option key={key} value={key}>{m.label}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
            <div
              onClick={() => setShowResolved(v => !v)}
              className="w-8 h-4 rounded-full relative transition-all cursor-pointer"
              style={{ background: showResolved ? "#6366f1" : "rgba(255,255,255,0.1)" }}
            >
              <div
                className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200"
                style={{ left: showResolved ? "18px" : "2px" }}
              />
            </div>
            Show resolved
          </label>

          <span className="ml-auto text-xs text-zinc-500">
            {activeAlerts.length} active · {resolvedAlerts.length} resolved
          </span>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <ERPSpinner label="Loading alerts…" />
        ) : activeAlerts.length === 0 && !showResolved ? (
          <ERPEmptyState
            icon={<CheckCircle2 size={28} />}
            title="All clear — no active alerts"
            sub="Your workspace is looking healthy. Alerts will appear here when action is needed."
          />
        ) : (
          <div className="space-y-2">
            {/* Priority groups */}
            {highAlerts.length > 0 && (
              <AlertGroup
                label="High Priority"
                color="#ef4444"
                alerts={highAlerts}
                isAdmin={isAdmin}
                resolving={resolving}
                onResolve={(a) => setModal({ alert: a, note: "" })}
                onViewUser={(id) => navigate(`/users/${id}`)}
              />
            )}
            {mediumAlerts.length > 0 && (
              <AlertGroup
                label="Medium Priority"
                color="#f59e0b"
                alerts={mediumAlerts}
                isAdmin={isAdmin}
                resolving={resolving}
                onResolve={(a) => setModal({ alert: a, note: "" })}
                onViewUser={(id) => navigate(`/users/${id}`)}
              />
            )}
            {lowAlerts.length > 0 && (
              <AlertGroup
                label="Low Priority"
                color="#6b7280"
                alerts={lowAlerts}
                isAdmin={isAdmin}
                resolving={resolving}
                onResolve={(a) => setModal({ alert: a, note: "" })}
                onViewUser={(id) => navigate(`/users/${id}`)}
              />
            )}

            {/* Resolved section */}
            {showResolved && resolvedAlerts.length > 0 && (
              <div className="mt-8">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-3">
                  Resolved ({resolvedAlerts.length})
                </p>
                {resolvedAlerts.map((a) => (
                  <AlertCard key={a.id} alert={a} isAdmin={false} resolved />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Resolve Modal ── */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[9999] flex items-center justify-center p-6"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
              style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Shield size={15} className="text-indigo-400" />
                  </div>
                  <h3 className="text-base font-bold text-white">Resolve Alert</h3>
                </div>
                <button onClick={() => setModal(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                  <X size={15} />
                </button>
              </div>

              <p className="text-sm text-zinc-400 mb-5 leading-relaxed">{modal.alert.message}</p>

              <div className="mb-5">
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                  Resolution Note <span className="text-zinc-700 normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={modal.note}
                  onChange={(e) => setModal({ ...modal, note: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
                  style={{ background: "#1a1a20", border: "1px solid rgba(255,255,255,0.07)", color: "#e5e7eb" }}
                  placeholder="e.g. User submitted update, task completed…"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => resolveAlert(modal.alert.id, modal.note)}
                  disabled={resolving === modal.alert.id}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", opacity: resolving === modal.alert.id ? 0.7 : 1 }}
                >
                  {resolving === modal.alert.id ? "Resolving…" : "Confirm Resolve"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AlertGroup
// ─────────────────────────────────────────────────────────────────────────────
function AlertGroup({ label, color, alerts, isAdmin, resolving, onResolve, onViewUser }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mb-4">
      {/* Group header */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="flex items-center gap-2.5 w-full text-left mb-2 group"
      >
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
          {label}
        </span>
        <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-full">{alerts.length}</span>
        <motion.div animate={{ rotate: collapsed ? -90 : 0 }} transition={{ duration: 0.18 }} className="ml-auto">
          <ChevronDown size={12} className="text-zinc-600" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="space-y-2"
          >
            {alerts.map((a) => (
              <AlertCard
                key={a.id}
                alert={a}
                isAdmin={isAdmin}
                resolving={resolving === a.id}
                onResolve={() => onResolve(a)}
                onViewUser={() => onViewUser(a.user_id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AlertCard
// ─────────────────────────────────────────────────────────────────────────────
function AlertCard({ alert, isAdmin, onResolve, resolving, resolved, onViewUser }) {
  const m = TYPE_META[alert.type] || TYPE_META.inactive_user;
  const p = PRIORITY_CFG[alert.priority] || PRIORITY_CFG.LOW;
  const AlertIcon = m.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.18 }}
      className="flex gap-4 px-5 py-4 rounded-xl transition-all group"
      style={{
        background: "#111115",
        border: "1px solid rgba(255,255,255,0.06)",
        borderLeft: `3px solid ${resolved ? "#374151" : m.color}`,
        opacity: resolved ? 0.6 : 1,
      }}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.color }}
      >
        <AlertIcon size={15} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          {/* Priority badge */}
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}` }}
          >
            {p.label}
          </span>
          {/* Type badge */}
          <span className="text-[10px] font-semibold" style={{ color: m.color }}>{m.label}</span>
          {/* Resolved badge */}
          {resolved && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
              ✓ Resolved
            </span>
          )}
        </div>

        <p className="text-sm text-zinc-200 leading-relaxed mb-2">{alert.message}</p>

        {/* Meta chips */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          {alert.user && (
            <span className="flex items-center gap-1">
              <User size={10} />
              {alert.user.name || `User #${alert.user_id}`}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {fmtTime(alert.created_at)}
          </span>
          {resolved && alert.resolved_at && (
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 size={10} />
              {fmtTime(alert.resolved_at)}
            </span>
          )}
          {alert.resolution_note && (
            <span className="italic text-zinc-600">"{alert.resolution_note}"</span>
          )}
        </div>
      </div>

      {/* Actions */}
      {isAdmin && !resolved && (
        <div className="flex flex-col gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onResolve}
            disabled={resolving}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)" }}
          >
            {resolving ? "…" : "Resolve"}
          </motion.button>
          {alert.user_id && (
            <button
              onClick={onViewUser}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <ExternalLink size={10} /> View
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
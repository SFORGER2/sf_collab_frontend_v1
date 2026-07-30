// src/components/pages/erp/analytics/views/DesktopAnalyticsDashboard.jsx — REDESIGNED
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  CheckSquare,
  FileText,
  Activity,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../../../utils/APIs/interceptors";
import { ERPPageHeader } from "../../../../erp/shared/ERPPageHeader";
import { ERPEmptyState } from "../../../../erp/shared/ERPEmptyState";
import { ERPSpinner, ERPCardSkeleton } from "../../../../erp/shared/ERPLoadingSkeleton";
import { ERPBanner } from "../../../../erp/shared/ERPBanner";

// ── API (unchanged) ────────────────────────────────────────────────────────────
const api = axios.create({ baseURL: "/api/erp-analytics" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const pct = (v) => (v != null ? `${Math.round(v)}%` : "—");
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString([], { month: "short", day: "numeric" }) : "—");

const PERIODS = [
  { value: "weekly",  label: "7 Days",    days: 7  },
  { value: "monthly", label: "30 Days",   days: 30 },
  { value: "quarter", label: "90 Days",   days: 90 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export default function AnalyticsDashboard() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || user?.id;

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
        const s = new Date(); s.setDate(s.getDate() - 7);
        startDate = s.toISOString().split("T")[0];
      } else if (period === "monthly") {
        const s = new Date(); s.setDate(1);
        startDate = s.toISOString().split("T")[0];
      } else {
        const s = new Date(); s.setMonth(s.getMonth() - 3);
        startDate = s.toISOString().split("T")[0];
      }
      const response = await api.get("/workspace", {
        params: { workspace_id: workspaceId, start_date: startDate, end_date: endDate },
      });
      const data = response.data?.data || response.data;
      setMetrics(data.metrics);
    } catch (err) {
      console.error("Analytics error:", err);
      setError(err?.response?.data?.error || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [workspaceId, period]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <ERPPageHeader
          icon={<BarChart2 size={20} />}
          title="Analytics"
          description="Workspace performance, engagement, and productivity metrics"
          breadcrumbs={[{ label: "ERP" }, { label: "Analytics" }]}
          actions={
            <div className="flex items-center gap-2">
              {/* Period selector */}
              <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)" }}>
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPeriod(p.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      period === p.value
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button
                onClick={loadAnalytics}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/[0.06] text-zinc-400 hover:text-white text-sm transition-all"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          }
        />

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <ERPBanner message={error} type="error" onDismiss={() => setError(null)} />
          )}
        </AnimatePresence>

        {/* KPI Cards */}
        {loading ? (
          <ERPCardSkeleton count={4} />
        ) : !metrics ? (
          <ERPEmptyState
            icon={<BarChart2 size={28} />}
            title="No analytics data"
            sub="Analytics data will appear once your workspace has activity."
            action={
              <button onClick={loadAnalytics} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white">
                <RefreshCw size={14} /> Retry
              </button>
            }
          />
        ) : (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <AnalyticsKPI
                label="Attendance Rate"
                value={pct(metrics.attendance_rate)}
                numericValue={metrics.attendance_rate}
                icon={<Calendar size={16} />}
                accent="#10b981"
                trend={metrics.attendance_rate >= 80 ? "up" : "down"}
              />
              <AnalyticsKPI
                label="Task Completion"
                value={pct(metrics.task_completion_rate)}
                numericValue={metrics.task_completion_rate}
                icon={<CheckSquare size={16} />}
                accent="#6366f1"
                trend={metrics.task_completion_rate >= 70 ? "up" : "down"}
              />
              <AnalyticsKPI
                label="Update Consistency"
                value={pct(metrics.update_consistency)}
                numericValue={metrics.update_consistency}
                icon={<FileText size={16} />}
                accent="#f59e0b"
                trend={metrics.update_consistency >= 75 ? "up" : "down"}
              />
              <AnalyticsKPI
                label="Active Members"
                value={`${metrics.active_users?.active || 0}/${metrics.active_users?.total || 0}`}
                numericValue={metrics.active_users?.rate}
                icon={<Users size={16} />}
                accent="#06b6d4"
                sub={`${Math.round(metrics.active_users?.rate || 0)}% engagement`}
              />
            </div>

            {/* Metric breakdown + Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <MetricBreakdown metrics={metrics} />
              {metrics.details && <DetailsPanel details={metrics.details} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function AnalyticsKPI({ label, value, numericValue, icon, accent, trend, sub }) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendColor = trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : "#6b7280";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ translateY: -2 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl p-5 group"
      style={{
        background: "#111115",
        border: "1px solid rgba(255,255,255,0.06)",
        borderTop: `2px solid ${accent}`,
      }}
    >
      {/* Bg glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${accent}08, transparent 70%)` }}
      />

      <div className="relative flex items-start justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}18`, color: accent }}>
          {icon}
        </div>
      </div>

      <p className="text-3xl font-bold tracking-tight mb-1" style={{ color: accent }}>{value}</p>

      {sub ? (
        <p className="text-xs text-zinc-500">{sub}</p>
      ) : (
        trend && (
          <div className="flex items-center gap-1 mt-1.5">
            <TrendIcon size={12} style={{ color: trendColor }} />
            <span className="text-xs font-medium" style={{ color: trendColor }}>
              {numericValue != null ? (numericValue >= 70 ? "On track" : "Needs attention") : ""}
            </span>
          </div>
        )
      )}
    </motion.div>
  );
}

function MetricBreakdown({ metrics }) {
  const bars = [
    { label: "Attendance Rate",    value: metrics.attendance_rate || 0,      color: "#10b981", bg: "rgba(16,185,129,0.08)" },
    { label: "Task Completion",    value: metrics.task_completion_rate || 0, color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
    { label: "Update Consistency", value: metrics.update_consistency || 0,   color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  ];

  return (
    <div className="rounded-2xl p-6" style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 mb-5">
        <Activity size={15} className="text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-200">Performance Overview</h3>
      </div>

      <div className="space-y-5">
        {bars.map((b, i) => (
          <motion.div key={b.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-zinc-400">{b.label}</span>
              <span className="text-sm font-bold" style={{ color: b.color }}>{Math.round(b.value)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(b.value, 100)}%` }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: b.color, boxShadow: `0 0 8px ${b.color}60` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick chips */}
      <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-white/[0.04]">
        <QuickChip label="Total Tasks" value={metrics.details?.tasks_total ?? "—"} accent="#6366f1" />
        <QuickChip label="Active (7d)" value={metrics.active_users?.active ?? "—"} accent="#06b6d4" />
      </div>
    </div>
  );
}

function QuickChip({ label, value, accent }) {
  return (
    <div className="text-center p-3 rounded-xl" style={{ background: `${accent}0a`, border: `1px solid ${accent}18` }}>
      <p className="text-xl font-bold" style={{ color: accent }}>{value}</p>
      <p className="text-[10px] text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}

function DetailsPanel({ details }) {
  if (!details) return null;

  const rows = [
    { label: "Period", value: `${fmtDate(details.date_start)} → ${fmtDate(details.date_end)}` },
    { label: "Attendance", value: `${details.attendance_presentish} / ${details.attendance_expected} days` },
    { label: "Tasks Done", value: `${details.tasks_done} / ${details.tasks_total}` },
    { label: "Updates", value: `${details.updates_submitted} / ${details.updates_expected}` },
  ];

  return (
    <div className="rounded-2xl p-6" style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp size={15} className="text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-200">Period Breakdown</h3>
      </div>

      <div className="space-y-3">
        {rows.map((row, i) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0"
          >
            <span className="text-xs text-zinc-500">{row.label}</span>
            <span className="text-sm font-medium text-zinc-200">{row.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Health score */}
      <div className="mt-5 pt-4 border-t border-white/[0.04]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-500 font-medium">Overall Health</span>
          <span className="text-xs font-bold text-indigo-400">
            {details.tasks_total > 0
              ? `${Math.round((details.tasks_done / details.tasks_total) * 100)}%`
              : "N/A"}
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: details.tasks_total > 0 ? `${Math.round((details.tasks_done / details.tasks_total) * 100)}%` : "0%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
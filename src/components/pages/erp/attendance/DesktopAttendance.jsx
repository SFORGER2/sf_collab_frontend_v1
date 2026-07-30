/**
 * DesktopAttendance.jsx — SFCollab ERP — REDESIGNED
 *
 * Covers: My Attendance (clock-in/out + history) + Workspace Attendance (admin)
 * API wiring: attendance.py routes at /api/attendance/*
 * Auth: uses existing JWT via interceptors.js
 *
 * DESIGN CHANGES (UI only):
 *  - Premium hero clock card with live session timer
 *  - Working hours progress ring
 *  - KPI stat cards using ERPStatCard
 *  - Fully redesigned history table
 *  - ERPPageHeader, ERPBannerManager, ERPStatusBadge
 *  - Framer Motion animations throughout
 *  - Full responsive layout
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  Timer,
  Users,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ChevronRight,
  Filter,
  Award,
} from "lucide-react";

import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../../utils/APIs/interceptors";
import { ERPPageHeader } from "../../../erp/shared/ERPPageHeader";
import { ERPStatCard } from "../../../erp/shared/ERPStatCard";
import { ERPStatusBadge } from "../../../erp/shared/ERPStatusBadge";
import { ERPEmptyState } from "../../../erp/shared/ERPEmptyState";
import { ERPTableSkeleton, ERPSpinner } from "../../../erp/shared/ERPLoadingSkeleton";
import { ERPBannerManager } from "../../../erp/shared/ERPBanner";

// ── API ────────────────────────────────────────────────────────────────────────
const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};
const fmtDuration = (seconds) => {
  if (!seconds) return "0h 0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

// ═══════════════════════════════════════════════════════════════════════════════
// MY ATTENDANCE PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export function MyAttendancePage() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || user?.id;

  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const timerRef = useRef(null);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg);
    else setNotice(msg);
    setTimeout(() => { setError(null); setNotice(null); }, 4500);
  };

  const loadToday = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const { data } = await api.get("/attendance/today-status", {
        params: { workspace_id: workspaceId },
      });
      setToday(data.data || {});
    } catch (e) {
      flash(e?.response?.data?.error || "Could not load today's status", true);
    }
  }, [workspaceId]);

  const loadHistory = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const { data } = await api.get("/attendance/history", {
        params: { workspace_id: workspaceId, limit: 30 },
      });
      setHistory(data.data?.records || []);
    } catch (e) {
      // silent
    }
  }, [workspaceId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadToday(), loadHistory()]).finally(() => setLoading(false));
  }, [loadToday, loadHistory]);

  // Live session timer
  useEffect(() => {
    const att = today?.attendance || {};
    if (att.clock_in_time && !att.clock_out_time) {
      const start = new Date(att.clock_in_time).getTime();
      const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
      tick();
      timerRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [today]);

  const clockIn = async () => {
    setActionLoading(true);
    try {
      await api.post("/attendance/clock-in", { workspace_id: workspaceId });
      flash("Clocked in successfully! Have a productive day 🚀");
      await loadToday();
    } catch (e) {
      flash(e?.response?.data?.error || "Clock-in failed", true);
    } finally { setActionLoading(false); }
  };

  const clockOut = async () => {
    setActionLoading(true);
    try {
      await api.post("/attendance/clock-out", { workspace_id: workspaceId });
      flash("Clocked out. Great work today! 🎉");
      await Promise.all([loadToday(), loadHistory()]);
    } catch (e) {
      flash(e?.response?.data?.error || "Clock-out failed", true);
    } finally { setActionLoading(false); }
  };

  if (loading) return <Spinner label="Loading attendance…" />;

  const att = today?.attendance || {};
  const isHoliday = today?.is_holiday;
  const isClockedIn = !!att.clock_in_time && !att.clock_out_time;
  const hoursWorked = att.duration_hours || (elapsed > 0 ? elapsed / 3600 : 0);
  const targetHours = 8;
  const progressPct = Math.min((hoursWorked / targetHours) * 100, 100);

  // Stats from history
  const presentCount = history.filter(r => r.status === "present").length;
  const lateCount = history.filter(r => r.status === "late").length;
  const absentCount = history.filter(r => r.status === "absent").length;

  const filteredHistory = statusFilter
    ? history.filter(r => r.status === statusFilter)
    : history;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <ERPPageHeader
          icon={<Clock size={20} />}
          title="My Attendance"
          description="Track your working hours, clock-in status and attendance history"
          breadcrumbs={[
            { label: "ERP", href: "/erp/attendance" },
            { label: "My Attendance" },
          ]}
          actions={
            <button
              onClick={() => { loadToday(); loadHistory(); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/[0.06] text-zinc-400 hover:text-white text-sm transition-all"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          }
        />

        <ERPBannerManager
          notice={notice} error={error}
          onDismissNotice={() => setNotice(null)}
          onDismissError={() => setError(null)}
        />

        {/* Holiday banner */}
        {isHoliday && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm"
            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}
          >
            <Award size={16} />
            <span><strong className="text-indigo-300">Holiday:</strong> {today?.holiday?.name} — No attendance required today. Enjoy!</span>
          </motion.div>
        )}

        {/* ── Hero Clock Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl mb-6 p-6 sm:p-8"
          style={{
            background: "linear-gradient(135deg, #111115 0%, #16161d 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-700"
            style={{
              background: isClockedIn
                ? "radial-gradient(ellipse at 0% 0%, rgba(16,185,129,0.08) 0%, transparent 70%)"
                : "radial-gradient(ellipse at 0% 0%, rgba(99,102,241,0.06) 0%, transparent 70%)",
            }}
          />

          <div className="relative flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            {/* Left: Status + Clock */}
            <div className="flex-1 text-center lg:text-left">
              {/* Status badge */}
              <div className="flex justify-center lg:justify-start mb-4">
                <ERPStatusBadge status={att.status || "not_clocked_in"} size="md" />
              </div>

              {/* Time display */}
              <div className="mb-2">
                <LiveClock />
              </div>

              <p className="text-zinc-500 text-sm mb-6">
                {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>

              {/* Clock actions */}
              <div className="flex gap-3 justify-center lg:justify-start flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={clockIn}
                  disabled={!today?.can_clock_in || actionLoading || isHoliday}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    boxShadow: today?.can_clock_in ? "0 4px 20px rgba(16,185,129,0.3)" : "none",
                  }}
                >
                  {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn size={16} />}
                  Clock In
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={clockOut}
                  disabled={!today?.can_clock_out || actionLoading || isHoliday}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "#fff",
                    boxShadow: today?.can_clock_out ? "0 4px 20px rgba(239,68,68,0.3)" : "none",
                  }}
                >
                  {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogOut size={16} />}
                  Clock Out
                </motion.button>
              </div>

              {/* Time stamps */}
              {att.clock_in_time && (
                <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500 justify-center lg:justify-start flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <LogIn size={11} className="text-emerald-500" />
                    In: <strong className="text-zinc-300">{fmt(att.clock_in_time)}</strong>
                  </span>
                  {att.clock_out_time && (
                    <span className="flex items-center gap-1.5">
                      <LogOut size={11} className="text-red-500" />
                      Out: <strong className="text-zinc-300">{fmt(att.clock_out_time)}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right: Progress ring + session timer */}
            <div className="flex flex-col items-center gap-4 lg:pl-8 lg:border-l border-white/[0.06]">
              {/* Circular progress */}
              <ProgressRing
                progress={progressPct}
                size={140}
                strokeWidth={10}
                color={isClockedIn ? "#10b981" : "#6366f1"}
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {hoursWorked > 0 ? `${hoursWorked.toFixed(1)}h` : "—"}
                  </p>
                  <p className="text-xs text-zinc-500">of {targetHours}h</p>
                </div>
              </ProgressRing>
              <p className="text-xs text-zinc-500 font-medium">Daily Progress</p>

              {/* Session timer */}
              {isClockedIn && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981" }}
                >
                  <Timer size={12} className="animate-pulse" />
                  Session: {fmtDuration(elapsed)}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── KPI Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ERPStatCard
            label="Present Days"
            value={presentCount}
            icon={<CheckCircle2 size={16} />}
            accent="#10b981"
            sub="Last 30 days"
          />
          <ERPStatCard
            label="Late Arrivals"
            value={lateCount}
            icon={<AlertTriangle size={16} />}
            accent="#f59e0b"
            sub="Last 30 days"
          />
          <ERPStatCard
            label="Absent Days"
            value={absentCount}
            icon={<XCircle size={16} />}
            accent="#ef4444"
            sub="Last 30 days"
          />
          <ERPStatCard
            label="Attendance Rate"
            value={history.length > 0 ? `${Math.round((presentCount + lateCount) / history.length * 100)}%` : "—"}
            icon={<TrendingUp size={16} />}
            accent="#6366f1"
            sub="Present + Late / Total"
          />
        </div>

        {/* ── History Table ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Table header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-200">Attendance History</h2>
              <span className="text-xs text-zinc-500 ml-1">({filteredHistory.length} records)</span>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-zinc-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-800 border border-white/[0.06] text-zinc-300 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500/50 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="not_clocked_in">Not Clocked In</option>
              </select>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <ERPEmptyState
              icon={<Calendar size={28} />}
              title="No attendance records"
              sub="Your attendance history will appear here once you start tracking."
              compact
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {["Date", "Status", "Clock In", "Clock Out", "Duration"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {filteredHistory.map((r, i) => (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-6 py-3.5 text-sm text-zinc-300 whitespace-nowrap">{fmtDate(r.date)}</td>
                        <td className="px-6 py-3.5">
                          <ERPStatusBadge status={r.status} size="sm" />
                        </td>
                        <td className="px-6 py-3.5 text-sm text-zinc-400 font-mono">{fmt(r.clock_in_time)}</td>
                        <td className="px-6 py-3.5 text-sm text-zinc-400 font-mono">{fmt(r.clock_out_time)}</td>
                        <td className="px-6 py-3.5 text-sm text-zinc-300 font-medium">
                          {r.duration_hours ? `${r.duration_hours}h` : "—"}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORKSPACE ATTENDANCE (Admin)
// ═══════════════════════════════════════════════════════════════════════════════
export function WorkspaceAttendancePage() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || user?.id;

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setNotice(msg);
    setTimeout(() => { setError(null); setNotice(null); }, 4500);
  };

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const [recs, sum] = await Promise.all([
        api.get("/attendance/workspace", { params: { workspace_id: workspaceId, date: dateFilter, limit: 100 } }),
        api.get("/attendance/workspace-summary", { params: { workspace_id: workspaceId, date: dateFilter } }),
      ]);
      setRecords(recs.data.records || []);
      setSummary(sum.data.data);
    } catch (e) {
      flash(e?.response?.data?.error || "Failed to load workspace attendance", true);
    } finally { setLoading(false); }
  }, [workspaceId, dateFilter]);

  useEffect(() => { load(); }, [load]);

  const bulkMarkAbsent = async () => {
    if (!confirm(`Mark all missing clock-ins as absent for ${dateFilter}?`)) return;
    try {
      const { data } = await api.post("/attendance/admin/bulk-mark-absent", { workspace_id: workspaceId, date: dateFilter });
      flash(data.message || "Done");
      load();
    } catch (e) {
      flash(e?.response?.data?.error || "Bulk mark failed", true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <ERPPageHeader
          icon={<Users size={20} />}
          title="Workspace Attendance"
          description="Admin view — track attendance across all workspace members"
          breadcrumbs={[
            { label: "ERP" },
            { label: "Workspace Attendance" },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/[0.06] text-zinc-400 hover:text-white text-sm transition-all">
                <RefreshCw size={14} />
              </button>
              <button
                onClick={bulkMarkAbsent}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
              >
                Bulk Mark Absent
              </button>
            </div>
          }
        />

        <ERPBannerManager
          notice={notice} error={error}
          onDismissNotice={() => setNotice(null)}
          onDismissError={() => setError(null)}
        />

        {/* Summary KPI cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ERPStatCard label="Present" value={summary.present ?? "—"} accent="#10b981" icon={<CheckCircle2 size={16} />} />
            <ERPStatCard label="Late" value={summary.late ?? "—"} accent="#f59e0b" icon={<AlertTriangle size={16} />} />
            <ERPStatCard label="Absent" value={summary.absent ?? "—"} accent="#ef4444" icon={<XCircle size={16} />} />
            <ERPStatCard label="Total Members" value={summary.total ?? "—"} accent="#6366f1" icon={<Users size={16} />} />
          </div>
        )}

        {/* Filter row */}
        <div
          className="flex flex-wrap gap-3 items-center px-5 py-4 rounded-xl mb-6"
          style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-zinc-500" />
            <label className="text-xs text-zinc-400 font-medium">Date</label>
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-zinc-800 border border-white/[0.06] text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500/50 cursor-pointer"
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-zinc-200">
              Member Attendance — {new Date(dateFilter).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
            </h2>
          </div>

          {loading ? (
            <ERPTableSkeleton rows={6} cols={6} />
          ) : records.length === 0 ? (
            <ERPEmptyState icon={<Users size={28} />} title="No attendance records" sub="No members have recorded attendance for this date." compact />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {["Member", "Status", "Clock In", "Clock Out", "Duration"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300">
                            {(r.user?.name || "U")[0].toUpperCase()}
                          </div>
                          <span className="text-sm text-zinc-200 font-medium">{r.user?.name || `User #${r.user_id}`}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5"><ERPStatusBadge status={r.status} size="sm" /></td>
                      <td className="px-6 py-3.5 text-sm text-zinc-400 font-mono">{fmt(r.clock_in_time)}</td>
                      <td className="px-6 py-3.5 text-sm text-zinc-400 font-mono">{fmt(r.clock_out_time)}</td>
                      <td className="px-6 py-3.5 text-sm text-zinc-300 font-medium">{r.duration_hours ? `${r.duration_hours}h` : "—"}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Live clock display */
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-5xl sm:text-6xl font-bold text-white tracking-tight font-mono">
      {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </div>
  );
}

/** SVG circular progress ring */
function ProgressRing({ progress, size, strokeWidth, color, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
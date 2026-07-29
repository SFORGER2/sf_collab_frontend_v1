/**
 * DesktopAttendance.jsx — SFCollab ERP
 * Personal + Workspace attendance (desktop)
 * Uses active_workspace_id from Redux user.
 */

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../../utils/APIs/interceptors";

// ── Shared UI components ──
import {
  PageHeader,
  GlassCard,
  StatCard,
  Button,
  Badge,
  Spinner,
  EmptyState,
} from "@/components/erp/ui";

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
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const STATUS_CONFIG = {
  present: { label: "Present", color: "green", icon: "✅" },
  late: { label: "Late", color: "yellow", icon: "⚠️" },
  absent: { label: "Absent", color: "red", icon: "❌" },
  not_clocked_in: { label: "Not Clocked In", color: "gray", icon: "⏰" },
};

const statusColorMap = {
  present: "#22c55e",
  late: "#f59e0b",
  absent: "#ef4444",
  not_clocked_in: "#6b7280",
};

// ── Shared sub‑components ──────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_clocked_in;
  return <Badge color={cfg.color}>{cfg.icon} {cfg.label}</Badge>;
};

const AttendanceTable = ({ records, showUser = false }) => {
  if (!records.length) {
    return (
      <EmptyState
        icon="📋"
        title="No records"
        description="No attendance records found for this period."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-zinc-400 border-b border-zinc-800">
          <tr>
            {showUser && <th className="text-left py-3 px-4 font-medium">Member</th>}
            <th className="text-left py-3 px-4 font-medium">Date</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-left py-3 px-4 font-medium">Clock In</th>
            <th className="text-left py-3 px-4 font-medium">Clock Out</th>
            <th className="text-left py-3 px-4 font-medium">Hours</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-b border-zinc-800 hover:bg-zinc-900/30 transition-colors">
              {showUser && <td className="py-3 px-4 text-zinc-300">{r.user?.name || "—"}</td>}
              <td className="py-3 px-4 text-zinc-300">{fmtDate(r.date)}</td>
              <td className="py-3 px-4">
                <StatusPill status={r.status} />
              </td>
              <td className="py-3 px-4 text-zinc-300">{fmt(r.clock_in_time)}</td>
              <td className="py-3 px-4 text-zinc-300">{fmt(r.clock_out_time)}</td>
              <td className="py-3 px-4 text-zinc-300">{r.duration_hours ? `${r.duration_hours}h` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Banner ──────────────────────────────────────────────────────────────────
const Banner = ({ type, children }) => {
  const styles = {
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    error: "bg-red-500/10 border-red-500/20 text-red-400",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-xl border ${styles[type] || styles.info} mb-4`}
    >
      {children}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MY ATTENDANCE PAGE (Personal)
// ═══════════════════════════════════════════════════════════════════════════
export function MyAttendancePage() {
  const user = useSelector((state) => state.auth.user);
  const workspaceId = user?.active_workspace_id;

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

  const clockIn = async () => {
    setActionLoading(true);
    try {
      await api.post("/attendance/clock-in", { workspace_id: workspaceId });
      flash("Clocked in successfully!");
      await loadToday();
    } catch (e) {
      flash(e?.response?.data?.error || "Clock-in failed", true);
    } finally {
      setActionLoading(false);
    }
  };

  const clockOut = async () => {
    setActionLoading(true);
    try {
      await api.post("/attendance/clock-out", { workspace_id: workspaceId });
      flash("Clocked out successfully!");
      await Promise.all([loadToday(), loadHistory()]);
    } catch (e) {
      flash(e?.response?.data?.error || "Clock-out failed", true);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Spinner label="Loading attendance…" />;

  const att = today?.attendance || {};
  const isHoliday = today?.is_holiday;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <PageHeader title="My Attendance" subtitle={new Date().toDateString()} />

        <AnimatePresence>
          {notice && <Banner type="success">{notice}</Banner>}
          {error && <Banner type="error">{error}</Banner>}
          {isHoliday && (
            <Banner type="info">
              🎉 Today is a holiday: <strong>{today.holiday?.name}</strong>. No attendance required.
            </Banner>
          )}
        </AnimatePresence>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <StatCard
            icon={Clock}
            label="Today's Status"
            value={STATUS_CONFIG[att.status]?.label || "—"}
            accent={statusColorMap[att.status] || "#6b7280"}
            sub={att.status === "late" ? "Threshold: 09:00" : undefined}
          />
          <StatCard
            icon={Clock}
            label="Hours Worked"
            value={att.duration_hours ? `${att.duration_hours}h` : "—"}
            accent="#6366f1"
            sub={att.clock_in_time ? `In: ${fmt(att.clock_in_time)}` : "Not clocked in yet"}
          />
        </div>

        {/* Clock Actions */}
        <GlassCard className="mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Clock Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="success"
              disabled={!today?.can_clock_in || actionLoading}
              onClick={clockIn}
              className="flex items-center gap-2"
            >
              <Clock size={18} /> Clock In
            </Button>
            <Button
              variant="danger"
              disabled={!today?.can_clock_out || actionLoading}
              onClick={clockOut}
              className="flex items-center gap-2"
            >
              <Clock size={18} /> Clock Out
            </Button>
          </div>
          {att.clock_in_time && (
            <p className="text-xs text-zinc-500 mt-4">
              Clocked in at <strong className="text-zinc-300">{fmt(att.clock_in_time)}</strong>
              {att.clock_out_time && (
                <> · Clocked out at <strong className="text-zinc-300">{fmt(att.clock_out_time)}</strong></>
              )}
            </p>
          )}
        </GlassCard>

        {/* History */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white mb-4">Attendance History</h3>
          <AttendanceTable records={history} />
        </GlassCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKSPACE ATTENDANCE (Admin)
// ═══════════════════════════════════════════════════════════════════════════
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
    if (isError) setError(msg);
    else setNotice(msg);
    setTimeout(() => { setError(null); setNotice(null); }, 4000);
  };

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const [recs, sum] = await Promise.all([
        api.get("/attendance/workspace", {
          params: { workspace_id: workspaceId, date: dateFilter, limit: 100 },
        }),
        api.get("/attendance/workspace-summary", {
          params: { workspace_id: workspaceId, date: dateFilter },
        }),
      ]);
      setRecords(recs.data.records || []);
      setSummary(sum.data.data);
    } catch (e) {
      flash(e?.response?.data?.error || "Failed to load workspace attendance", true);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, dateFilter]);

  useEffect(() => { load(); }, [load]);

  const bulkMarkAbsent = async () => {
    if (!confirm(`Mark all missing clock-ins as absent for ${dateFilter}?`)) return;
    try {
      const { data } = await api.post("/attendance/admin/bulk-mark-absent", {
        workspace_id: workspaceId,
        date: dateFilter,
      });
      flash(data.message || "Done");
      load();
    } catch (e) {
      flash(e?.response?.data?.error || "Bulk mark failed", true);
    }
  };

  if (loading) return <Spinner label="Loading workspace attendance…" />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <PageHeader title="Workspace Attendance" subtitle="Admin view — all members" />

        <AnimatePresence>
          {notice && <Banner type="success">{notice}</Banner>}
          {error && <Banner type="error">{error}</Banner>}
        </AnimatePresence>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Present" value={summary.present ?? "—"} accent="#22c55e" />
            <StatCard label="Late" value={summary.late ?? "—"} accent="#f59e0b" />
            <StatCard label="Absent" value={summary.absent ?? "—"} accent="#ef4444" />
            <StatCard label="Total" value={summary.total ?? "—"} accent="#6366f1" />
          </div>
        )}

        {/* Filters & Actions */}
        <GlassCard className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-zinc-400 font-medium">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
            />
            <Button variant="secondary" onClick={load}>
              Refresh
            </Button>
            <Button variant="danger" onClick={bulkMarkAbsent} className="ml-auto">
              Bulk Mark Absent
            </Button>
          </div>
        </GlassCard>

        {/* Member Table */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white mb-4">
            Member Attendance — {fmtDate(dateFilter)}
          </h3>
          <AttendanceTable records={records} showUser />
        </GlassCard>
      </div>
    </div>
  );
}
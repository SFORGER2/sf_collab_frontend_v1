"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Clock, AlertTriangle, FileText, Users,
  ArrowRight, Zap, Bell, CheckCircle,
  Circle, Loader2, CheckCircle2, ChevronRight,
} from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "@/utils/APIs/interceptors";
import BackgroundImage from "@/assets/imgs/background-image.jpg";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";

const mk = (base) => {
  const a = axios.create({ baseURL: base });
  a.interceptors.request.use(requestInterceptor);
  a.interceptors.response.use(responseInterceptor, responseErrorInterceptor);
  return a;
};

const attendanceApi = mk("/api/attendance");
const updatesApi    = mk("/api/daily-updates");
const alertsApi     = mk("/api/erp-alerts");
const activityApi   = mk("/api/activity");
const tasksApi      = mk("/api/erp-tasks");
const membersApi    = mk("/api/startup-members");

// ── Status badge helper ──────────────────────────────────────────────────────
const STATUS_META = {
  todo:        { label: "To Do",       icon: Circle,       color: "text-zinc-400",  bg: "bg-zinc-800" },
  in_progress: { label: "In Progress", icon: Loader2,      color: "text-blue-400",  bg: "bg-blue-950" },
  done:        { label: "Done",        icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-950" },
  approved:    { label: "Approved",    icon: CheckCircle2, color: "text-green-400", bg: "bg-green-950" },
  rejected:    { label: "Rejected",    icon: AlertTriangle,color: "text-red-400",   bg: "bg-red-950" },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.todo;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
}

function TaskRow({ task }) {
  const isOverdue = task.is_overdue;
  const deadline  = task.deadline ? new Date(task.deadline) : null;

  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-zinc-800/60 last:border-0">
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isOverdue ? "text-red-300" : "text-white"}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.assignee && (
            <span className="text-xs text-zinc-500">
              {task.assignee.name}
            </span>
          )}
          {deadline && (
            <span className={`text-xs ${isOverdue ? "text-red-400" : "text-zinc-500"}`}>
              {isOverdue ? "⚠ Overdue · " : "Due "}
              {deadline.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>
      <StatusBadge status={task.status} />
    </div>
  );
}

export default function DesktopERPDashboard() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const [role, setRole] = useState("builder");

  const [attendance,     setAttendance]     = useState(null);
  const [alertCount,     setAlertCount]     = useState(null);
  const [pendingUpdates, setPendingUpdates] = useState(null);
  const [activeUsers,    setActiveUsers]    = useState(null);
  const [recentAlerts,   setRecentAlerts]   = useState([]);
  const [tasks,          setTasks]          = useState([]);
  const [tasksLoading,   setTasksLoading]   = useState(true);
  const [loading,        setLoading]        = useState(true);

  // B8 FIX: derive role from real startup membership data
  useEffect(() => {
    if (!user?.id || !workspaceId) return;
    membersApi
      .get("", { params: { user_id: user.id, startup_id: workspaceId } })
      .then((res) => {
        const members = res?.data?.data?.members || res?.data?.members || [];
        const mine = members.find(m => m.userId === user.id || m.user_id === user.id);
        if (mine?.role) {
          const raw = (mine.role || "").toLowerCase();
          setRole(["founder", "owner", "admin"].includes(raw) ? "founder" : "builder");
        }
      })
      .catch(() => {}); // keep default "builder" on error
  }, [user?.id, workspaceId]);

  // ── Load tasks separately so task errors don't break the rest ──────────────
  const loadTasks = useCallback(async () => {
    if (!workspaceId) return;
    setTasksLoading(true);
    try {
      const res = await tasksApi.get("/list", { params: { workspace_id: workspaceId } });
      // interceptor returns full axios response; backend uses success_response which wraps in {data: {tasks:[...]}}
      const payload = res?.data?.data ?? res?.data ?? res;
      const list = payload?.tasks || [];
      // Show up to 5 most recent, prioritise overdue + in_progress
      const sorted = [...list].sort((a, b) => {
        if (a.is_overdue && !b.is_overdue) return -1;
        if (!a.is_overdue && b.is_overdue) return 1;
        const order = { in_progress: 0, todo: 1, done: 2, approved: 3, rejected: 4 };
        return (order[a.status] ?? 9) - (order[b.status] ?? 9);
      });
      setTasks(sorted.slice(0, 5));
    } catch {
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, [workspaceId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = { workspace_id: workspaceId };

      const attendanceEndpoint = role === "founder" ? "/workspace-summary" : "/today-status";

      const [attRes, alertRes, updRes, actRes] = await Promise.all([
        attendanceApi.get(attendanceEndpoint, { params: p }).catch(() => null),
        alertsApi.get("", { params: { ...p, limit: 5 } }).catch(() => null),
        updatesApi.get("/mine", { params: { ...p, limit: 50 } }).catch(() => null),
        null,
      ]);

      if (attRes?.data) {
        const d = attRes.data?.data ?? attRes.data;
        if (role === "founder") {
          setAttendance({
            present:  d.present ?? 0,
            total:    d.total   ?? 0,
            on_leave: d.absent  ?? 0,
          });
        } else {
          const att = d.attendance;
          const clocked = att?.clock_in_time != null;
          const status  = att?.status ?? "not_clocked_in";
          setAttendance({
            present:  clocked ? 1 : 0,
            total:    1,
            on_leave: 0,
            status,
            clock_in:  att?.clock_in_time,
            clock_out: att?.clock_out_time,
            hours:     att?.duration_hours ?? 0,
          });
        }
      }

      if (alertRes?.data) {
        const alertPayload = alertRes.data?.data ?? alertRes.data;
        const alerts = alertPayload?.alerts || [];
        const active = (Array.isArray(alerts) ? alerts : []).filter((a) => !a.resolved && !a.archived);
        setAlertCount(active.length);
        setRecentAlerts(active.slice(0, 3));
      }

      if (updRes?.data) {
        const updPayload = updRes.data?.data ?? updRes.data;
        const mine = updPayload?.updates || updPayload || [];
        const arr = Array.isArray(mine) ? mine : [];
        const now = new Date();
        const startOfWeek = new Date(now);
        const dow = now.getDay();
        const daysSinceMon = dow === 0 ? 6 : dow - 1;
        startOfWeek.setDate(now.getDate() - daysSinceMon);
        startOfWeek.setHours(0, 0, 0, 0);
        const thisWeeksUpdates = arr.filter((u) => {
          const d = u.created_at ? new Date(u.created_at) : null;
          return d && d >= startOfWeek;
        });
        setPendingUpdates(thisWeeksUpdates.length);
      }

      if (actRes?.data) {
        setActiveUsers(actRes.data.active_count ?? actRes.data.online ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, [workspaceId, role]);

  useEffect(() => { load(); },      [load]);
  useEffect(() => { loadTasks(); }, [loadTasks]);

  const fmtTime = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const cardBg = {
    backgroundImage: `url('${BackgroundImage}')`,
    backgroundSize: "cover", backgroundPosition: "bottom right", backgroundRepeat: "no-repeat",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
        <ERPPageHeader
          icon={<Zap size={20} />}
          title="ERP Dashboard"
          description={role === "founder" ? "Strategic overview of your organization" : "Your daily builder workspace"}
          breadcrumbs={[{ label: "ERP" }, { label: "Dashboard" }]}
        />

        <div className={`grid grid-cols-1 md:grid-cols-2 ${role === "builder" ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-6 mt-6 mb-8`}>

          {/* Attendance */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="relative bg-[#121215] border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-7 hover:border-gray-600 transition-all overflow-hidden"
            style={cardBg}>
            <div className="absolute inset-0 bg-black/75" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-200 rounded-2xl"><Clock className="w-6 h-6 text-gray-800" /></div>
                <div><p className="text-xs uppercase tracking-widest text-zinc-300">Attendance</p><p className="text-sm font-medium text-white">Today</p></div>
              </div>
              {loading || !attendance
                ? <div className="text-6xl font-semibold text-zinc-600">—</div>
                : role === "founder"
                ? <>
                    <div className="text-6xl font-semibold tracking-tighter mb-1 bg-gradient-to-br from-white to-gray-900 bg-clip-text text-transparent">
                      {attendance.present}<span className="text-3xl text-zinc-500">/{attendance.total}</span>
                    </div>
                    <p className="text-zinc-300">{attendance.on_leave} absent • {attendance.present} present</p>
                  </>
                : <>
                    <div className="text-3xl font-semibold tracking-tight mb-2 bg-gradient-to-br from-white to-gray-900 bg-clip-text text-transparent capitalize">
                      {attendance.status === "not_clocked_in" ? "Not Clocked In" : attendance.status}
                    </div>
                    <p className="text-zinc-300 text-sm">
                      {attendance.clock_in
                        ? `Clocked in • ${new Date(attendance.clock_in).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
                        : "Haven't clocked in yet today"}
                    </p>
                    {attendance.hours > 0 && (
                      <p className="text-zinc-400 text-xs mt-1">{attendance.hours}h worked</p>
                    )}
                  </>
              }
            </div>
          </motion.div>

          {/* Alerts */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="relative bg-[#121215] border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-7 hover:border-gray-600 transition-all overflow-hidden"
            style={cardBg}>
            <div className="absolute inset-0 bg-black/80" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-200 rounded-2xl"><AlertTriangle className="w-6 h-6 text-gray-900" /></div>
                <div><p className="text-xs uppercase tracking-widest text-zinc-300">Alerts</p><p className="text-sm font-medium text-white">Active</p></div>
              </div>
              <div className="text-6xl font-semibold tracking-tighter bg-gradient-to-br from-white to-gray-900 bg-clip-text text-transparent mb-1">
                {loading ? "—" : alertCount ?? 0}
              </div>
              <p className="text-zinc-300">{alertCount === 0 ? "All clear" : `${alertCount} requiring attention`}</p>
            </div>
          </motion.div>

          {/* Pending Updates */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="relative bg-[#121215] border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-7 hover:border-gray-600 transition-all overflow-hidden"
            style={cardBg}>
            <div className="absolute inset-0 bg-black/75" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 rounded-2xl"><FileText className="w-6 h-6 text-gray-900" /></div>
                  <div><p className="text-xs uppercase tracking-widest text-zinc-300">Updates</p><p className="text-sm font-medium text-white">This Week</p></div>
                </div>
                <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="/erp/updates"
                  className="px-5 py-2 text-white text-sm font-semibold rounded-2xl flex items-center gap-2 bg-gradient-to-r from-gray-400 to-gray-900">
                  Submit <ArrowRight className="w-4 h-4" />
                </motion.a>
              </div>
              <div className="text-6xl font-semibold tracking-tighter bg-gradient-to-br from-white to-gray-900 bg-clip-text text-transparent mb-1">
                {loading ? "—" : pendingUpdates ?? 0}
              </div>
              <p className="text-gray-300">Updates logged this week</p>
            </div>
          </motion.div>

          {/* Active Users — founder only */}
          {role === "founder" && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="relative bg-[#121215] border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-7 hover:border-gray-600 transition-all overflow-hidden"
              style={cardBg}>
              <div className="absolute inset-0 bg-black/75" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-gray-200 rounded-2xl"><Users className="w-6 h-6 text-gray-900" /></div>
                  <div><p className="text-xs uppercase tracking-widest text-zinc-300">Live</p><p className="text-sm font-medium">Active Users</p></div>
                </div>
                <div className="text-6xl font-semibold tracking-tighter bg-gradient-to-br from-white to-gray-900 bg-clip-text text-transparent mb-1">
                  {loading ? "—" : activeUsers ?? 0}
                </div>
                <p className="text-zinc-300">currently working</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Tasks Overview (was placeholder) ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="lg:col-span-7 bg-[#121215] border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                Tasks Overview
              </h2>
              <a
                href="/erp/tasks"
                className="text-sm text-blue-500 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                View Tasks <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {tasksLoading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-zinc-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading tasks…
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-600 text-sm">
                <CheckCircle2 className="w-8 h-8 text-zinc-700" />
                <p>No tasks yet for this workspace.</p>
                <a href="/erp/tasks" className="text-blue-500 hover:text-blue-300 text-xs mt-1 underline underline-offset-2">
                  Go to Task Board →
                </a>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/0">
                {tasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            )}

            {/* Summary bar */}
            {!tasksLoading && tasks.length > 0 && (
              <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Circle className="w-3 h-3 text-zinc-400" />
                  {tasks.filter(t => t.status === "todo").length} To Do
                </span>
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 text-blue-400" />
                  {tasks.filter(t => t.status === "in_progress").length} In Progress
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {tasks.filter(t => t.status === "done" || t.status === "approved").length} Done
                </span>
                {tasks.some(t => t.is_overdue) && (
                  <span className="flex items-center gap-1 text-red-400">
                    <AlertTriangle className="w-3 h-3" />
                    {tasks.filter(t => t.is_overdue).length} Overdue
                  </span>
                )}
              </div>
            )}
          </motion.div>

          <div className="lg:col-span-5 space-y-6">
            {/* Alerts panel */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-[#121215] border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-red-400" />
                  <h2 className="text-2xl font-semibold">Alerts</h2>
                </div>
                <a href="/erp/alerts" className="text-xs text-zinc-500 hover:text-white">View all →</a>
              </div>
              {loading ? (
                <p className="text-zinc-600 text-sm">Loading...</p>
              ) : recentAlerts.length === 0 ? (
                <div className="flex items-center gap-3 text-emerald-400 text-sm">
                  <CheckCircle className="w-5 h-5" /> No active alerts
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  {recentAlerts.map((a) => (
                    <div key={a.id} className="flex gap-4">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{a.message}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {a.type?.replace(/_/g, " ")} • {new Date(a.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Daily Update Reminder */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-violet-950 via-purple-950 to-black rounded-3xl p-8 overflow-hidden min-h-[280px] flex flex-col justify-between border border-violet-500/20 relative">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-semibold tracking-tight text-white">Daily Update Reminder</h2>
                  <div className="text-xs bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-3xl border border-white/10 text-white">{fmtTime()}</div>
                </div>
                <p className="mt-6 text-lg text-zinc-200 max-w-[290px] leading-relaxed mb-6">
                  Consistent logging accelerates delivery. What did your team build today?
                </p>
                <div className="mt-auto">
                  <motion.a href="/erp/updates" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="w-full bg-white text-purple-950 font-semibold py-4 rounded-3xl flex items-center justify-center gap-2 shadow-2xl hover:bg-white/95 transition-colors">
                    Log Today's Progress <Zap className="w-5 h-5" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
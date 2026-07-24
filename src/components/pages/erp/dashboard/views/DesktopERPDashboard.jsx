"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Clock, AlertTriangle, FileText, Users,
  ArrowRight, Zap, Bell, CheckCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../../../utils/APIs/interceptors";
import BackgroundImage from "../../../../../assets/imgs/background-image.jpg";

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

export default function ERPDashboard() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.id;
  const [role, setRole] = useState("builder");

  const [attendance,    setAttendance]    = useState(null);
  const [alertCount,    setAlertCount]    = useState(null);
  const [pendingUpdates,setPendingUpdates]= useState(null);
  const [activeUsers,   setActiveUsers]   = useState(null);
  const [recentAlerts,  setRecentAlerts]  = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem("activeRole");
    if (storedRole) setRole(storedRole);
    else localStorage.setItem("activeRole", "builder");
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = { workspace_id: workspaceId };

      // founders get workspace-summary, everyone else gets personal today-status
      const attendanceEndpoint = role === "founder" ? "/workspace-summary" : "/today-status";

      const [attRes, alertRes, updRes, actRes] = await Promise.all([
        attendanceApi.get(attendanceEndpoint, { params: p }).catch(() => null),
        alertsApi.get("", { params: { ...p, limit: 5 } }).catch(() => null),
        updatesApi.get("/mine", { params: { ...p, limit: 50 } }).catch(() => null),
        role === "founder" ? activityApi.get("/status-summary", { params: p }).catch(() => null) : null,
      ]);

      if (attRes?.data) {
        const d = attRes.data;
        if (role === "founder") {
          // workspace-summary shape: { present, late, absent, total }
          setAttendance({
            present:  d.present ?? 0,
            total:    d.total   ?? 0,
            on_leave: d.absent  ?? 0,
          });
        } else {
          // today-status shape: { attendance: { status, clock_in_time, ... } }
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
        const alerts = alertRes.data.alerts || alertRes.data || [];
        const active = (Array.isArray(alerts) ? alerts : []).filter((a) => !a.resolved && !a.archived);
        setAlertCount(active.length);
        setRecentAlerts(active.slice(0, 3));
      }

      if (updRes?.data) {
        const mine = updRes.data.updates || updRes.data || [];
        const arr = Array.isArray(mine) ? mine : [];
        // Count updates submitted this week (Mon–today)
        const now = new Date();
        const startOfWeek = new Date(now);
        const dow = now.getDay(); // 0=Sun
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

  useEffect(() => { load(); }, [load]);

  const fmtTime = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const cardBg = {
    backgroundImage: `url('${BackgroundImage}')`,
    backgroundSize: "cover", backgroundPosition: "bottom right", backgroundRepeat: "no-repeat",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4 md:px-8 overflow-auto font-sans">
      <div className="mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
            ERP Dashboard
          </h1>
          <p className="text-zinc-400 mt-1">
            {role === "founder" ? "Strategic overview of your organization" : "Your daily builder workspace"}
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 ${role === "builder" ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-6 mb-8`}>

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
          <div className="lg:col-span-7 bg-[#121215] border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">Tasks Overview</h2>
              <button className="text-sm text-blue-500 hover:text-blue-300 flex items-center gap-1">View Tasks <ArrowRight className="w-4 h-4" /></button>
            </div>
            <p className="text-zinc-600 text-sm text-center py-8">Task integration coming soon.</p>
          </div>

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
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, Flame, BarChart } from "lucide-react";

import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { workspaceAPI } from "../../../services/workspaceAPI";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPStatCard } from "../../erp/shared/ERPStatCard";
import { ERPLoadingSkeleton } from "../../erp/shared/ERPLoadingSkeleton";
import { ERPBannerManager } from "../../erp/shared/ERPBanner";
import { ERPStatusBadge } from "../../erp/shared/ERPStatusBadge";
import { ERPEmptyState } from "../../erp/shared/ERPEmptyState";

const analyticsApi = axios.create({ baseURL: "/api/erp-analytics" });
analyticsApi.interceptors.request.use(requestInterceptor);
analyticsApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const tasksApi = axios.create({ baseURL: "/api/erp-tasks" });
tasksApi.interceptors.request.use(requestInterceptor);
tasksApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const updatesApi = axios.create({ baseURL: "/api/daily-update" });
updatesApi.interceptors.request.use(requestInterceptor);
updatesApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const pct = (v) => (v != null ? `${Math.round(v)}%` : "—");
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

const calculateStreak = (updateDates) => {
  if (!updateDates.length) return 0;
  const today = new Date().toISOString().split("T")[0];
  let streak = 0;
  let currentDate = new Date(today);
  while (true) {
    const dateStr = currentDate.toISOString().split("T")[0];
    if (updateDates.includes(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

export default function MemberAnalyticsPage() {
  const { user } = useSelector((s) => s.auth);
  const userId = user?.id;

  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [workspacesLoading, setWorkspacesLoading] = useState(true);

  const [metrics, setMetrics] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const data = await workspaceAPI.getMyWorkspaces();
        setWorkspaces(data);
      } catch (e) {
        setError("Could not load workspaces");
      } finally {
        setWorkspacesLoading(false);
      }
    };
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (user?.active_workspace_id) {
      setWorkspaceId(user.active_workspace_id);
    } else if (workspaces.length > 0) {
      setWorkspaceId(workspaces[0].id);
    } else {
      setWorkspaceId(null);
    }
  }, [user, workspaces]);

  const loadData = useCallback(async () => {
    if (!userId || !workspaceId) return;
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date();
      startDate.setDate(1);
      const analyticsRes = await analyticsApi.get(`/user/${userId}`, {
        params: { workspace_id: workspaceId, start_date: startDate.toISOString().split("T")[0], end_date: endDate },
      });
      const analyticsData = analyticsRes.data?.data || analyticsRes.data;
      setMetrics(analyticsData.metrics || analyticsData);

      const tasksRes = await tasksApi.get("/list", { params: { workspace_id: workspaceId, assigned_to: userId } });
      const tasksData = tasksRes.data?.data?.tasks || tasksRes.data?.tasks || [];
      setTasks(tasksData);

      const updatesRes = await updatesApi.get("/my", { params: { workspace_id: workspaceId, limit: 30 } });
      const records = updatesRes.data?.data?.records || updatesRes.data?.records || [];
      const updateDates = records.map(r => r.date);
      setStreak(calculateStreak(updateDates));
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [userId, workspaceId]);

  useEffect(() => {
    if (workspaceId) loadData();
    else if (!workspacesLoading) setLoading(false);
  }, [workspaceId, workspacesLoading, loadData]);

  if (loading || workspacesLoading) return <div className="min-h-screen bg-[#0a0a0b]"><ERPLoadingSkeleton /></div>;

  if (!workspaceId) return <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center"><ERPEmptyState icon={<BarChart />} title="No workspace" sub="Please create or join a workspace to see your analytics." /></div>;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done" || t.status === "approved").length;
  const overdueTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== "done" && t.status !== "approved").length;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ERPPageHeader
          icon={<BarChart size={20} />}
          title="My Analytics"
          description="Personal performance, task execution, and attendance statistics."
          breadcrumbs={[{ label: "ERP" }, { label: "My Analytics" }]}
        />

        {error && <ERPBannerManager error={error} onDismissError={() => setError(null)} />}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 mb-8">
          <ERPStatCard title="Attendance Rate" value={metrics ? pct(metrics.attendance_rate) : "—"} icon={<CheckCircle size={18} className="text-emerald-500" />} accentColor="#10b981" />
          <ERPStatCard title="Task Completion" value={metrics ? pct(metrics.task_completion_rate) : "—"} icon={<CheckCircle size={18} className="text-indigo-500" />} accentColor="#6366f1" />
          <ERPStatCard title="Update Consistency" value={metrics ? pct(metrics.update_consistency) : "—"} icon={<Clock size={18} className="text-amber-500" />} accentColor="#f59e0b" />
          <ERPStatCard title="Current Streak" value={`${streak} day${streak !== 1 ? 's' : ''}`} subValue={streak === 0 ? "Submit an update!" : "Keep it up!"} icon={<Flame size={18} className="text-orange-500" />} accentColor="#f97316" />
        </div>

        {metrics?.details && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111115] border border-white/5 rounded-3xl p-8 mb-8 flex flex-wrap gap-10 items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white mb-2">Period Details</h2>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <CalendarIcon className="w-3 h-3" /> {fmtDate(metrics.details.date_start)} → {fmtDate(metrics.details.date_end)}
              </div>
            </div>
            <div className="flex flex-wrap gap-8">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Attendance</p>
                <p className="text-xl font-bold text-white">{metrics.details.attendance_presentish} <span className="text-sm text-zinc-500">/ {metrics.details.attendance_expected}</span></p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Tasks Done</p>
                <p className="text-xl font-bold text-white">{metrics.details.tasks_done} <span className="text-sm text-zinc-500">/ {metrics.details.tasks_total}</span></p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Updates</p>
                <p className="text-xl font-bold text-white">{metrics.details.updates_submitted} <span className="text-sm text-zinc-500">/ {metrics.details.updates_expected}</span></p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#111115] border border-white/5 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-base font-bold text-white flex items-center gap-2"><CheckCircle size={18} className="text-indigo-400" /> Task History</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <StatBadge label="Total Tasks" value={totalTasks} color="#6366f1" />
            <StatBadge label="Completed" value={completedTasks} color="#10b981" />
            <StatBadge label="Overdue" value={overdueTasks} color="#ef4444" />
          </div>
          {tasks.length === 0 ? (
            <ERPEmptyState icon={<CheckCircle size={24} />} title="No tasks assigned" sub="You don't have any tasks in your history yet." compact />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-white/10">
                  <tr>
                    <th className="pb-3 px-4">Task</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4">Deadline</th>
                    <th className="pb-3 px-4">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tasks.slice(0, 20).map(task => (
                    <motion.tr whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }} key={task.id} className="transition-colors">
                      <td className="py-4 px-4 font-semibold text-white">{task.title}</td>
                      <td className="py-4 px-4"><ERPStatusBadge status={task.status} /></td>
                      <td className="py-4 px-4 text-xs font-semibold text-zinc-400">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}</td>
                      <td className="py-4 px-4 font-bold text-emerald-400">+{task.approved_points || 0}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {tasks.length > 20 && <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-6 text-center">Showing first 20 tasks</p>}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <div className="bg-[#1a1a20] border border-white/5 rounded-2xl p-4 text-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
      <p className="text-3xl font-black tracking-tighter" style={{ color }}>{value}</p>
    </div>
  );
}

function CalendarIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
}
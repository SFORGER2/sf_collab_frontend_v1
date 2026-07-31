import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Clock, AlertTriangle, CheckCircle, FileText, DollarSign, Star, LayoutDashboard } from "lucide-react";

import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPStatCard } from "../../erp/shared/ERPStatCard";
import { ERPLoadingSkeleton } from "../../erp/shared/ERPLoadingSkeleton";
import AssistantFAB from "@/components/common/AssistantFAB";

// ── API instances ──────────────────────────────────────────────────────────
const tasksApi = axios.create({ baseURL: "/api/erp-tasks" });
tasksApi.interceptors.request.use(requestInterceptor);
tasksApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const updatesApi = axios.create({ baseURL: "/api/daily-update" });
updatesApi.interceptors.request.use(requestInterceptor);
updatesApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const alertsApi = axios.create({ baseURL: "/api/erp-alerts" });
alertsApi.interceptors.request.use(requestInterceptor);
alertsApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ── Main Component ──────────────────────────────────────────────────────────
export default function MemberDashboard() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const userId = user?.id;

  const [tasks, setTasks] = useState([]);
  const [todayUpdate, setTodayUpdate] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [points, setPoints] = useState(0);
  const [estimatedPayout, setEstimatedPayout] = useState(null);
  const [totalPaid, setTotalPaid] = useState(0);
  const [loading, setLoading] = useState(true);

  // ── Data loading (unchanged) ──────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!workspaceId || !userId) return;
    setLoading(true);
    try {
      const tasksRes = await tasksApi.get("/list", {
        params: { workspace_id: workspaceId, assigned_to: userId },
      });
      const tasksData = tasksRes.data?.data?.tasks || tasksRes.data?.tasks || [];
      setTasks(tasksData);

      const updatesRes = await updatesApi.get("/my", {
        params: { workspace_id: workspaceId, limit: 1 },
      });
      const updates = updatesRes.data?.data?.records || updatesRes.data?.records || [];
      const todayStr = new Date().toISOString().split("T")[0];
      const today = updates.find((u) => u.date === todayStr);
      setTodayUpdate(today || null);

      const alertsRes = await alertsApi.get("/list", {
        params: { workspace_id: workspaceId, resolved: false },
      });
      const alertsData = alertsRes.data?.data?.alerts || alertsRes.data?.alerts || [];
      setWarnings(alertsData);

      const totalPoints = tasksData.reduce((sum, t) => sum + (t.approved_points || 0), 0);
      setPoints(totalPoints);

      const payoutApi = axios.create({ baseURL: "/api/payout" });
      payoutApi.interceptors.request.use(requestInterceptor);
      payoutApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);
      try {
        const payoutRes = await payoutApi.get(`/workspaces/${workspaceId}/payouts/me`);
        const payouts = payoutRes.data?.data || [];
        const current = payouts.find(
          (p) =>
            p.status === "approved" ||
            p.status === "pending" ||
            p.status === "pending_review"
        );
        if (current) setEstimatedPayout(current.final_payout_amount);
        const paidSum = payouts.reduce(
          (sum, p) => sum + (p.status === "paid" ? p.final_payout_amount || 0 : 0),
          0
        );
        setTotalPaid(paidSum);
      } catch (err) {
        // ignore
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, userId]);

  useEffect(() => { loadData(); }, [loadData]);

  const todoTasks = tasks.filter(t => t.status === "todo");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const doneTasks = tasks.filter(t => t.status === "done" || t.status === "approved");

  if (loading) return <div className="min-h-screen bg-[#0a0a0b]"><ERPLoadingSkeleton /></div>;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-[#0a0a0b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ERPPageHeader
            icon={<LayoutDashboard size={20} />}
            title="Member Dashboard"
            description="Your personal workspace overview, tasks, and alerts."
            breadcrumbs={[{ label: "ERP" }, { label: "My Dashboard" }]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6 mb-8">
            <ERPStatCard title="Total Points" value={points.toLocaleString()} icon={<CheckCircle size={18} className="text-emerald-500" />} accentColor="#10b981" />
            <ERPStatCard title="Est. Payout" value={`$${estimatedPayout?.toFixed(2) || "0.00"}`} icon={<DollarSign size={18} className="text-amber-500" />} accentColor="#f59e0b" />
            <ERPStatCard title="Total Paid" value={`$${totalPaid.toFixed(2)}`} icon={<DollarSign size={18} className="text-cyan-500" />} accentColor="#06b6d4" />
            <ERPStatCard title="Open Warnings" value={warnings.length} icon={<AlertTriangle size={18} className="text-red-500" />} accentColor="#ef4444" />
            <ERPStatCard title="Tasks Done" value={doneTasks.length} icon={<Clock size={18} className="text-indigo-500" />} accentColor="#6366f1" />
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-[#111115] border border-white/5 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold flex items-center gap-2"><CheckCircle size={18} className="text-indigo-400" /> My Tasks</h2>
              <Link to="/erp/tasks" className="text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">View All →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TaskColumn title="To Do" tasks={todoTasks} color="#3b82f6" />
              <TaskColumn title="In Progress" tasks={inProgressTasks} color="#f59e0b" />
              <TaskColumn title="Done / Approved" tasks={doneTasks} color="#10b981" />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-2xl bg-[#111115] border border-white/5">
              <h2 className="text-base font-bold mb-6 flex items-center gap-2"><FileText size={18} className="text-amber-400" /> Today's Update</h2>
              {todayUpdate ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-semibold">Progress: {todayUpdate.progress_rating}/5</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">What I Did Today</h4>
                      <p className="text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded-xl border border-white/5">{todayUpdate.today_work}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Next Plan</h4>
                      <p className="text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded-xl border border-white/5">{todayUpdate.next_plan}</p>
                    </div>
                    {todayUpdate.blockers && (
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1.5">Blockers</h4>
                        <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{todayUpdate.blockers}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500 font-semibold mb-4">No update yet today.</p>
                  <Link to="/erp/updates" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm font-semibold transition-colors">Log Update</Link>
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-2xl bg-[#111115] border border-white/5">
              <h2 className="text-base font-bold mb-6 flex items-center gap-2"><AlertTriangle size={18} className="text-red-400" /> Open Warnings</h2>
              {warnings.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle className="w-12 h-12 text-green-500/20 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500 font-semibold">No active warnings</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {warnings.slice(0, 5).map(w => (
                    <div key={w.id} className="flex gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0 shadow-[0_0_8px_#ef4444]" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-0.5">{w.type?.replace(/_/g, " ")}</p>
                        <p className="text-sm text-zinc-300">{w.message}</p>
                      </div>
                    </div>
                  ))}
                  {warnings.length > 5 && <Link to="/erp/alerts" className="text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 mt-4 inline-block">+{warnings.length - 5} more →</Link>}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <AssistantFAB workspaceId={workspaceId} label="Ask SF Assistant" />
    </>
  );
}

function TaskColumn({ title, tasks, color }) {
  return (
    <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{title}</h3>
        <span className="text-xs font-bold bg-[#1a1a20] px-2 py-0.5 rounded-full border border-white/10">{tasks.length}</span>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-6 font-semibold">No tasks</p>
        ) : (
          tasks.map(task => (
            <motion.div whileHover={{ scale: 1.02 }} key={task.id} className="bg-[#1a1a20] border border-white/5 rounded-xl p-3 text-sm">
              <p className="font-semibold text-white mb-1.5">{task.title}</p>
              {task.deadline && <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1"><Clock size={10} /> {new Date(task.deadline).toLocaleDateString()}</p>}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
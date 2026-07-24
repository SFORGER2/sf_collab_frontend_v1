import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { Clock, AlertTriangle, CheckCircle, FileText, DollarSign, Star } from "lucide-react";
import AssistantFAB from "@/components/common/AssistantFAB";

const tasksApi = axios.create({ baseURL: "/api/erp-tasks" });
tasksApi.interceptors.request.use(requestInterceptor);
tasksApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const updatesApi = axios.create({ baseURL: "/api/daily-update" });
updatesApi.interceptors.request.use(requestInterceptor);
updatesApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const alertsApi = axios.create({ baseURL: "/api/erp-alerts" });
alertsApi.interceptors.request.use(requestInterceptor);
alertsApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

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

  const loadData = useCallback(async () => {
    if (!workspaceId || !userId) return;
    setLoading(true);
    try {
      // 1. Fetch tasks assigned to the user
      const tasksRes = await tasksApi.get("/list", {
        params: { workspace_id: workspaceId, assigned_to: userId }
      });
      const tasksData = tasksRes.data?.data?.tasks || tasksRes.data?.tasks || [];
      setTasks(tasksData);

      // 2. Fetch today's daily update
      const updatesRes = await updatesApi.get("/my", {
        params: { workspace_id: workspaceId, limit: 1 }
      });
      const updates = updatesRes.data?.data?.records || updatesRes.data?.records || [];
      const todayStr = new Date().toISOString().split("T")[0];
      const today = updates.find(u => u.date === todayStr);
      setTodayUpdate(today || null);

      // 3. Fetch unresolved warnings
      const alertsRes = await alertsApi.get("/list", {
        params: { workspace_id: workspaceId, resolved: false }
      });
      const alertsData = alertsRes.data?.data?.alerts || alertsRes.data?.alerts || [];
      setWarnings(alertsData);

      // 4. Calculate points from approved tasks
      const totalPoints = tasksData.reduce((sum, t) => sum + (t.approved_points || 0), 0);
      setPoints(totalPoints);

      // 5. Fetch all payouts for the user
      const payoutApi = axios.create({ baseURL: "/api/payout" });
      payoutApi.interceptors.request.use(requestInterceptor);
      payoutApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);
      try {
        const payoutRes = await payoutApi.get(`/workspaces/${workspaceId}/payouts/me`);
        const payouts = payoutRes.data?.data || [];
        // Current estimated payout (pending or approved)
        const current = payouts.find(p => p.status === "approved" || p.status === "pending" || p.status === "pending_review");
        if (current) setEstimatedPayout(current.final_payout_amount);
        // Total amount paid (sum of all paid payouts)
        const paidSum = payouts.reduce((sum, p) => sum + (p.status === "paid" ? (p.final_payout_amount || 0) : 0), 0);
        setTotalPaid(paidSum);
      } catch (err) {
        // No payouts yet – ignore
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Task counts
  const todoTasks = tasks.filter(t => t.status === "todo");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const doneTasks = tasks.filter(t => t.status === "done" || t.status === "approved");

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading...</div>;

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Member Dashboard</h1>
        <p className="text-zinc-400 mb-8">Your workspace overview</p>

        {/* Stats Row – now 5 cards, responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={CheckCircle} label="Points" value={points} accent="#22c55e" />
          <StatCard icon={DollarSign} label="Est. Payout" value={`$${estimatedPayout?.toFixed(2) || "0.00"}`} accent="#f59e0b" />
          <StatCard icon={DollarSign} label="Total Paid" value={`$${totalPaid.toFixed(2)}`} accent="#06b6d4" />
          <StatCard icon={AlertTriangle} label="Open Warnings" value={warnings.length} accent="#ef4444" />
          <StatCard icon={Clock} label="Tasks Done" value={doneTasks.length} accent="#6366f1" />
        </div>

        {/* Tasks Section (unchanged) */}
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Tasks</h2>
            <Link to="/erp/tasks" className="text-sm text-blue-400 hover:text-blue-300">View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TaskColumn title="To Do" tasks={todoTasks} color="#3b82f6" />
            <TaskColumn title="In Progress" tasks={inProgressTasks} color="#f59e0b" />
            <TaskColumn title="Done" tasks={doneTasks} color="#22c55e" />
          </div>
        </div>

        {/* Daily Update & Warnings Side by Side (unchanged) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Update Card */}
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Today's Update</h2>
            {todayUpdate ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">Progress: {todayUpdate.progress_rating}/5</span>
                </div>
                <p className="text-zinc-300 mb-2">{todayUpdate.today_work}</p>
                <p className="text-sm text-zinc-500">Next: {todayUpdate.next_plan}</p>
                {todayUpdate.blockers && <p className="text-sm text-red-400 mt-2">Blockers: {todayUpdate.blockers}</p>}
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-500">No update yet today.</p>
                <Link to="/erp/updates" className="inline-block mt-3 text-blue-400 hover:text-blue-300">Log Update →</Link>
              </div>
            )}
          </div>

          {/* Warnings Card */}
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Open Warnings</h2>
            {warnings.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-zinc-500">No active warnings</p>
              </div>
            ) : (
              <div className="space-y-3">
                {warnings.slice(0, 5).map(w => (
                  <div key={w.id} className="border-l-4 border-red-500 bg-zinc-900/50 p-3 rounded-r-lg">
                    <p className="text-sm font-medium text-red-400">{w.type?.replace(/_/g, " ")}</p>
                    <p className="text-xs text-zinc-400">{w.message}</p>
                  </div>
                ))}
                {warnings.length > 5 && <Link to="/erp/alerts" className="text-xs text-blue-400">+{warnings.length - 5} more</Link>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    <AssistantFAB workspaceId={workspaceId} label="Ask SF Assistant" />
    </>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-5" style={{ borderTop: `3px solid ${accent}` }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" style={{ color: accent }} />
        <span className="text-xs uppercase tracking-widest text-zinc-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function TaskColumn({ title, tasks, color }) {
  return (
    <div className="bg-zinc-900/40 rounded-xl p-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium" style={{ color }}>{title}</h3>
        <span className="text-xs text-zinc-500">{tasks.length}</span>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-4">No tasks</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-black/30 rounded-lg p-2 text-sm">
              <p className="font-medium truncate">{task.title}</p>
              {task.deadline && <p className="text-xs text-zinc-500">Due: {new Date(task.deadline).toLocaleDateString()}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
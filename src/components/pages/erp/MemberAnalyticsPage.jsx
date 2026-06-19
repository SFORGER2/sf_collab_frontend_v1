// src/components/pages/erp/MemberAnalyticsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { workspaceAPI } from "../../../services/workspaceAPI";
import { CheckCircle, Clock, Flame } from "lucide-react";

const analyticsApi = axios.create({ baseURL: "/api/erp-analytics" });
analyticsApi.interceptors.request.use(requestInterceptor);
analyticsApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const tasksApi = axios.create({ baseURL: "/api/erp-tasks" });
tasksApi.interceptors.request.use(requestInterceptor);
tasksApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const updatesApi = axios.create({ baseURL: "/api/daily-updates-new" });
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

  // ── Load workspaces ──────────────────────────────────────────────────────
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const data = await workspaceAPI.getMyWorkspaces();
        setWorkspaces(data);
      } catch (e) {
        console.error("Failed to load workspaces", e);
        setError("Could not load workspaces");
      } finally {
        setWorkspacesLoading(false);
      }
    };
    loadWorkspaces();
  }, []);

  // ── Compute workspaceId ──────────────────────────────────────────────────
  useEffect(() => {
    if (user?.active_workspace_id) {
      setWorkspaceId(user.active_workspace_id);
    } else if (workspaces.length > 0) {
      setWorkspaceId(workspaces[0].id);
    } else {
      setWorkspaceId(null);
    }
  }, [user, workspaces]);

  // ── Load analytics data ──────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!userId || !workspaceId) {
      console.log("⏭️ Skipping load: missing userId or workspaceId", { userId, workspaceId });
      return;
    }
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date();
      startDate.setDate(1);
      console.log("📡 Fetching analytics for user", userId, "workspace", workspaceId);
      const analyticsRes = await analyticsApi.get(`/user/${userId}`, {
        params: {
          workspace_id: workspaceId,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate,
        },
      });
      console.log("✅ Analytics response:", analyticsRes.data);
      const analyticsData = analyticsRes.data?.data || analyticsRes.data;
      setMetrics(analyticsData.metrics || analyticsData);

      // Task history
      const tasksRes = await tasksApi.get("/list", {
        params: { workspace_id: workspaceId, assigned_to: userId },
      });
      const tasksData = tasksRes.data?.data?.tasks || tasksRes.data?.tasks || [];
      setTasks(tasksData);

      // Daily updates for streak
      const updatesRes = await updatesApi.get("/my", {
        params: { workspace_id: workspaceId, limit: 30 },
      });
      const records = updatesRes.data?.data?.records || updatesRes.data?.records || [];
      const updateDates = records.map(r => r.date);
      const currentStreak = calculateStreak(updateDates);
      setStreak(currentStreak);
    } catch (err) {
      console.error("❌ Analytics load error:", err);
      setError(err?.response?.data?.error || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [userId, workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      loadData();
    } else if (!workspacesLoading) {
      // No workspace available
      setLoading(false);
    }
  }, [workspaceId, workspacesLoading, loadData]);

  if (loading || workspacesLoading) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading...</div>;
  }

  if (!workspaceId) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">No workspace available.</p>
          <p className="text-sm text-zinc-500 mt-2">Please create or join a workspace to see your analytics.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done" || t.status === "approved").length;
  const overdueTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== "done" && t.status !== "approved").length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent mb-8">
          My Analytics
        </h1>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Attendance Rate"
            value={metrics ? pct(metrics.attendance_rate) : "—"}
            accent="#22c55e"
            icon={<CheckCircle size={20} />}
          />
          <MetricCard
            label="Task Completion"
            value={metrics ? pct(metrics.task_completion_rate) : "—"}
            accent="#6366f1"
            icon={<CheckCircle size={20} />}
          />
          <MetricCard
            label="Update Consistency"
            value={metrics ? pct(metrics.update_consistency) : "—"}
            accent="#f59e0b"
            icon={<Clock size={20} />}
          />
          <MetricCard
            label="Current Streak"
            value={`${streak} day${streak !== 1 ? 's' : ''}`}
            accent="#f97316"
            icon={<Flame size={20} />}
            sub={streak === 0 ? "Submit an update to start your streak!" : "Keep it up!"}
          />
        </div>

        {/* Period details */}
        {metrics?.details && (
          <div className="bg-[#121215] border border-zinc-800/80 rounded-3xl p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">Period Details</h2>
            <div className="space-y-2 text-sm text-zinc-400">
              <div>📅 {fmtDate(metrics.details.date_start)} → {fmtDate(metrics.details.date_end)}</div>
              <div>✅ Attendance: {metrics.details.attendance_presentish} / {metrics.details.attendance_expected} days</div>
              <div>📋 Tasks completed: {metrics.details.tasks_done} / {metrics.details.tasks_total}</div>
              <div>📝 Updates submitted: {metrics.details.updates_submitted} / {metrics.details.updates_expected}</div>
            </div>
          </div>
        )}

        {/* Task History */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-3xl p-8">
          <h2 className="text-xl font-semibold mb-4">Task History</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatBadge label="Total Tasks" value={totalTasks} color="#6366f1" />
            <StatBadge label="Completed" value={completedTasks} color="#22c55e" />
            <StatBadge label="Overdue" value={overdueTasks} color="#ef4444" />
          </div>
          {tasks.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No tasks assigned yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="text-left py-2">Task</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Deadline</th>
                    <th className="text-left py-2">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.slice(0, 20).map(task => (
                    <tr key={task.id} className="border-b border-zinc-800">
                      <td className="py-2">{task.title}</td>
                      <td className="py-2 capitalize">{task.status}</td>
                      <td className="py-2">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}</td>
                      <td className="py-2">{task.approved_points || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tasks.length > 20 && <p className="text-xs text-zinc-500 mt-4">Showing first 20 tasks.</p>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub‑components
// ─────────────────────────────────────────────────────────────────────────────

function MetricCard({ label, value, accent, icon, sub }) {
  return (
    <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6" style={{ borderTop: `2px solid ${accent}` }}>
      <div className="flex items-center gap-2 mb-2">
        <div style={{ color: accent }}>{icon}</div>
        <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
      </div>
      <p className="text-3xl font-semibold" style={{ color: accent }}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-2">{sub}</p>}
    </div>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <div className="bg-zinc-900/40 rounded-xl p-3 text-center">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}
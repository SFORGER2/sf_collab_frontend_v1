import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../utils/APIs/interceptors";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  DollarSign,
  Star,
  TrendingUp,
  Award,
} from "lucide-react";
import AssistantFAB from "@/components/common/AssistantFAB";

// ── Shared UI components ─────────────────────────────────────────────────
import {
  PageHeader,
  GlassCard,
  StatCard,
  Badge,
  Button,
  Spinner,
  EmptyState,
} from "@/components/erp/ui";

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

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Derived counts ────────────────────────────────────────────────────────
  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const doneTasks = tasks.filter((t) => t.status === "done" || t.status === "approved");

  if (loading) return <Spinner label="Loading your workspace…" />;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Member Dashboard"
            subtitle="Your workspace overview"
          />

          {/* ── Stats Row ────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          >
            <EnhancedStatCard
              icon={Award}
              label="Points"
              value={points}
              accent="#22c55e"
              delay={0.05}
            />
            <EnhancedStatCard
              icon={DollarSign}
              label="Est. Payout"
              value={`$${estimatedPayout?.toFixed(2) || "0.00"}`}
              accent="#f59e0b"
              delay={0.10}
            />
            <EnhancedStatCard
              icon={TrendingUp}
              label="Total Paid"
              value={`$${totalPaid.toFixed(2)}`}
              accent="#06b6d4"
              delay={0.15}
            />
            <EnhancedStatCard
              icon={AlertTriangle}
              label="Open Warnings"
              value={warnings.length}
              accent="#ef4444"
              delay={0.20}
            />
            <EnhancedStatCard
              icon={CheckCircle}
              label="Tasks Done"
              value={doneTasks.length}
              accent="#6366f1"
              delay={0.25}
            />
          </motion.div>

          {/* ── Tasks Section ────────────────────────────────────────────────── */}
          <GlassCard className="p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                My Tasks
              </h2>
              <Button variant="outline" size="sm" asChild>
                <Link to="/erp/tasks">View All →</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TaskColumn title="To Do" tasks={todoTasks} color="#3b82f6" />
              <TaskColumn title="In Progress" tasks={inProgressTasks} color="#f59e0b" />
              <TaskColumn title="Done" tasks={doneTasks} color="#22c55e" />
            </div>
          </GlassCard>

          {/* ── Daily Update & Warnings ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Update Card */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-4">
                Today's Update
              </h2>
              {todayUpdate ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-zinc-300">
                      Progress: {todayUpdate.progress_rating}/5
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    {todayUpdate.today_work}
                  </p>
                  <p className="text-sm text-zinc-500">
                    Next: {todayUpdate.next_plan || "—"}
                  </p>
                  {todayUpdate.blockers && (
                    <p className="text-sm text-red-400">
                      Blockers: {todayUpdate.blockers}
                    </p>
                  )}
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-500">No update yet today.</p>
                  <Button variant="primary" size="sm" className="mt-4" asChild>
                    <Link to="/erp/updates">Log Update →</Link>
                  </Button>
                </div>
              )}
            </GlassCard>

            {/* Warnings Card */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-4">
                Open Warnings
              </h2>
              {warnings.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-zinc-500">No active warnings</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {warnings.slice(0, 5).map((w, idx) => (
                    <motion.div
                      key={w.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="border-l-4 border-red-500 bg-zinc-900/50 p-3 rounded-r-lg hover:bg-zinc-800/50 transition-colors"
                    >
                      <p className="text-sm font-medium text-red-400">
                        {w.type?.replace(/_/g, " ") || "Warning"}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">{w.message}</p>
                    </motion.div>
                  ))}
                  {warnings.length > 5 && (
                    <Button variant="ghost" size="sm" className="mt-2" asChild>
                      <Link to="/erp/alerts">+{warnings.length - 5} more</Link>
                    </Button>
                  )}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
      <AssistantFAB workspaceId={workspaceId} label="Ask SF Assistant" />
    </>
  );
}

// ── Enhanced Stat Card with animation ──────────────────────────────────────
function EnhancedStatCard({ icon: Icon, label, value, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 transition-all duration-200 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-indigo-500/5"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" style={{ color: accent }} />
        <span className="text-xs uppercase tracking-widest text-zinc-500">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </motion.div>
  );
}

// ── Task Column ─────────────────────────────────────────────────────────────
function TaskColumn({ title, tasks, color }) {
  return (
    <div className="bg-zinc-900/30 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium" style={{ color }}>
          {title}
        </h3>
        <Badge color="gray">{tasks.length}</Badge>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {tasks.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-4">No tasks</p>
        ) : (
          tasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-black/30 hover:bg-black/50 rounded-lg p-2 text-sm transition-colors cursor-pointer"
            >
              <p className="font-medium truncate text-white">{task.title}</p>
              {task.deadline && (
                <p className="text-xs text-zinc-500 mt-1">
                  Due: {new Date(task.deadline).toLocaleDateString()}
                </p>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
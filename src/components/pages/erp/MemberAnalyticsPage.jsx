/**
 * MemberAnalyticsPage.jsx — SFCollab ERP
 * Member-facing analytics: performance trend, task history, consistency streak
 *
 * API wiring (expected routes in analytics.py):
 *   GET /erp/analytics/member/overview   → { score, score_change, streak, longest_streak, consistency_pct }
 *   GET /erp/analytics/member/trend      → [{ week_label, score }]  (last 8 weeks)
 *   GET /erp/analytics/member/tasks      → [{ id, title, status, completed_at, points }]
 *
 * Route to add in App.jsx:
 *   import MemberAnalyticsPage from "./components/pages/erp/MemberAnalyticsPage.jsx";
 *   <Route path="erp/my-analytics" element={<MemberAnalyticsPage />} />
 */

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../utils/APIs/interceptors";
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  Clock,
  XCircle,
  Target,
  Zap,
  BarChart2,
  ListChecks,
} from "lucide-react";

const api = axios.create({ baseURL: "" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ── Helpers ───────────────────────────────────────────────────────────────────
const pct = (v) => (v != null ? `${Math.round(v)}%` : "—");
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

const TASK_STATUS_META = {
  completed: { label: "Completed", color: "#22c55e", bg: "rgba(34,197,94,0.12)",  icon: CheckCircle },
  in_progress:{ label: "In Progress",color: "#f59e0b",bg: "rgba(245,158,11,0.12)", icon: Clock },
  overdue:   { label: "Overdue",    color: "#ef4444", bg: "rgba(239,68,68,0.12)",  icon: XCircle },
  pending:   { label: "Pending",    color: "#6b7280", bg: "rgba(107,114,128,0.12)",icon: Clock },
};

const TASK_FILTERS = ["all", "completed", "in_progress", "overdue"];

// ── Mock data (remove when API is ready) ─────────────────────────────────────
const MOCK_OVERVIEW = {
  score: 87,
  score_change: 4.5,
  streak: 11,
  longest_streak: 18,
  consistency_pct: 82,
};

const MOCK_TREND = [
  { week_label: "Mar 10", score: 62 },
  { week_label: "Mar 17", score: 70 },
  { week_label: "Mar 24", score: 68 },
  { week_label: "Mar 31", score: 75 },
  { week_label: "Apr 7",  score: 79 },
  { week_label: "Apr 14", score: 83 },
  { week_label: "Apr 21", score: 80 },
  { week_label: "Apr 28", score: 87 },
];

const MOCK_TASKS = [
  { id: 1, title: "Finalize investor deck",   status: "completed",  completed_at: "2025-04-29", points: 20 },
  { id: 2, title: "Deploy staging environment", status: "completed",  completed_at: "2025-04-27", points: 15 },
  { id: 3, title: "Weekly update log",         status: "completed",  completed_at: "2025-04-25", points: 10 },
  { id: 4, title: "Code review for auth PR",   status: "in_progress",completed_at: null,          points: 12 },
  { id: 5, title: "Update team wiki",          status: "overdue",    completed_at: null,          points: 8  },
  { id: 6, title: "Prepare Q2 roadmap",        status: "completed",  completed_at: "2025-04-20", points: 25 },
  { id: 7, title: "Bug fix: login redirect",   status: "completed",  completed_at: "2025-04-18", points: 10 },
  { id: 8, title: "Design review session",     status: "pending",    completed_at: null,          points: 10 },
];

// ═════════════════════════════════════════════════════════════════════════════
export default function MemberAnalyticsPage() {
  const { user } = useSelector((s) => s.auth);

  const [overview, setOverview]   = useState(null);
  const [trend, setTrend]         = useState([]);
  const [tasks, setTasks]         = useState([]);
  const [filter, setFilter]       = useState("all");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovRes, trendRes, taskRes] = await Promise.all([
        api.get("/erp/analytics/member/overview"),
        api.get("/erp/analytics/member/trend"),
        api.get("/erp/analytics/member/tasks"),
      ]);
      setOverview(ovRes.data);
      setTrend(Array.isArray(trendRes.data) ? trendRes.data : trendRes.data?.trend || []);
      const rawTasks = taskRes.data;
      setTasks(Array.isArray(rawTasks) ? rawTasks : rawTasks?.tasks || rawTasks?.data || []);
    } catch {
      // Fallback to mock data while API is being built
      setOverview(MOCK_OVERVIEW);
      setTrend(MOCK_TREND);
      setTasks(MOCK_TASKS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const filteredTasks = filter === "all"
    ? safeTasks
    : safeTasks.filter((t) => t.status === filter);

  const totalPoints = safeTasks
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + (t.points || 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4 md:px-8 font-sans overflow-auto">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
            My Analytics
          </h1>
          <p className="text-zinc-400 mt-1">Your performance, tasks, and consistency</p>
        </motion.div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <Banner type="error">{error}</Banner>
        ) : (
          <>
            {/* ── KPI Strip ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatChip
                icon={Target}
                label="Performance Score"
                value={overview?.score ?? "—"}
                change={overview?.score_change}
                accent="#6366f1"
              />
              <StatChip
                icon={Flame}
                label="Current Streak"
                value={`${overview?.streak ?? 0}d`}
                sub={`Best: ${overview?.longest_streak ?? 0}d`}
                accent="#f97316"
              />
              <StatChip
                icon={BarChart2}
                label="Consistency"
                value={pct(overview?.consistency_pct)}
                accent="#22c55e"
              />
              <StatChip
                icon={Zap}
                label="Points Earned"
                value={totalPoints}
                sub="this period"
                accent="#f59e0b"
              />
            </div>

            {/* ── Performance Trend ── */}
            {trend.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#121215] border border-zinc-800/80 rounded-3xl p-8 mb-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                    Performance Trend
                  </h2>
                  <span className="text-xs text-zinc-500 uppercase tracking-widest">Last 8 Weeks</span>
                </div>
                <TrendLineChart data={trend} />
              </motion.div>
            )}

            {/* ── Streak Heatmap ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[#121215] border border-zinc-800/80 rounded-3xl p-8 mb-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Flame className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-semibold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                  Consistency Streak
                </h2>
              </div>
              <StreakHeatmap streak={overview?.streak ?? 0} consistency={overview?.consistency_pct ?? 0} />
            </motion.div>

            {/* ── Task History ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#121215] border border-zinc-800/80 rounded-3xl p-8"
            >
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <ListChecks className="w-5 h-5 text-zinc-400" />
                  <h2 className="text-xl font-semibold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                    Task History
                  </h2>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-1">
                  {TASK_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className="px-3 py-1.5 text-xs rounded-xl transition-all font-medium capitalize"
                      style={
                        filter === f
                          ? { background: "#1e1b4b", color: "#a5b4fc" }
                          : { color: "#6b7280" }
                      }
                    >
                      {f === "in_progress" ? "In Progress" : f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                {filteredTasks.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-8">No tasks found.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((task, i) => (
                      <TaskRow key={task.id} task={task} index={i} />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Stat Chip ─────────────────────────────────────────────────────────────────
function StatChip({ icon: Icon, label, value, change, accent, sub }) {
  const isUp = change > 0;
  const isDown = change < 0;
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  return (
    <div
      className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-5"
      style={{ borderTop: `2px solid ${accent}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-xl" style={{ background: `${accent}18` }}>
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
        {change != null && (
          <div
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: isUp ? "#22c55e" : isDown ? "#ef4444" : "#6b7280" }}
          >
            <TrendIcon className="w-3 h-3" />
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

// ── Trend Line Chart (SVG) ────────────────────────────────────────────────────
function TrendLineChart({ data }) {
  const W = 560, H = 110, PAD = 12;
  const n = data.length;
  if (n < 2) return null;

  const vals = data.map((d) => d.score ?? 0);
  const minV = Math.min(...vals) - 5;
  const maxV = Math.max(...vals) + 5;
  const xStep = (W - PAD * 2) / (n - 1);

  const pt = (i) => {
    const x = PAD + i * xStep;
    const y = H - PAD - ((vals[i] - minV) / (maxV - minV || 1)) * (H - PAD * 2);
    return [x, y];
  };

  const linePath = vals.map((_, i) => {
    const [x, y] = pt(i);
    return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
  }).join(" ");

  const areaPath = [
    ...vals.map((_, i) => {
      const [x, y] = pt(i);
      return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
    }),
    `L ${PAD + (n - 1) * xStep},${H - PAD}`,
    `L ${PAD},${H - PAD}`,
    "Z",
  ].join(" ");

  const last = pt(n - 1);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 20}`} style={{ width: "100%", minWidth: 300, overflow: "visible" }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = PAD + f * (H - PAD * 2);
          return <line key={i} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#1f2937" strokeWidth={1} />;
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#6366f1" strokeWidth={2.5}
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Dots */}
        {vals.map((_, i) => {
          const [x, y] = pt(i);
          return (
            <circle key={i} cx={x} cy={y} r={3}
              fill={i === n - 1 ? "#818cf8" : "#3730a3"}
              stroke={i === n - 1 ? "#c7d2fe" : "none"}
              strokeWidth={i === n - 1 ? 2 : 0}
            />
          );
        })}

        {/* Latest value tooltip */}
        <text x={last[0]} y={last[1] - 10} textAnchor="middle" fontSize={10}
          fill="#a5b4fc" fontWeight="700">
          {vals[n - 1]}
        </text>

        {/* X labels */}
        {data.map((d, i) => {
          if (i % 2 !== 0 && i !== n - 1) return null;
          const [x] = pt(i);
          return (
            <text key={i} x={x} y={H + 14} textAnchor="middle" fontSize={9} fill="#6b7280">
              {d.week_label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ── Streak Heatmap ────────────────────────────────────────────────────────────
function StreakHeatmap({ streak, consistency }) {
  // Show 28 days, colored by simulated activity
  const days = Array.from({ length: 28 }, (_, i) => {
    const dayFromEnd = 27 - i;
    // Active if within streak from end, with some gaps based on consistency
    const active = dayFromEnd < streak || (consistency > 50 && i % 3 !== 0);
    return { active, dayFromEnd };
  });

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {days.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.01 * i }}
            className="w-7 h-7 rounded-lg"
            style={{
              background: d.active
                ? d.dayFromEnd < 7
                  ? "#6366f1"
                  : d.dayFromEnd < 14
                  ? "#4338ca"
                  : "#312e81"
                : "#1f2937",
            }}
            title={d.active ? "Active" : "No activity"}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>4 weeks ago</span>
        <div className="flex items-center gap-2">
          <span>Less</span>
          {["#1f2937", "#312e81", "#4338ca", "#6366f1"].map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
          ))}
          <span>More</span>
        </div>
        <span>Today</span>
      </div>
    </div>
  );
}

// ── Task Row ──────────────────────────────────────────────────────────────────
function TaskRow({ task, index }) {
  const m = TASK_STATUS_META[task.status] || TASK_STATUS_META.pending;
  const Icon = m.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: 0.03 * index }}
      className="flex items-center gap-4 p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-colors"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: m.bg }}
      >
        <Icon className="w-4 h-4" style={{ color: m.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-white truncate">{task.title}</p>
        <p className="text-xs text-zinc-500 mt-0.5">
          {task.completed_at ? `Completed ${fmtDate(task.completed_at)}` : m.label}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {task.points != null && task.status === "completed" && (
          <span className="text-xs font-semibold text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-full">
            +{task.points}pts
          </span>
        )}
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full hidden sm:block"
          style={{ color: m.color, background: m.bg }}
        >
          {m.label}
        </span>
      </div>
    </motion.div>
  );
}

// ── Misc ──────────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className="w-8 h-8 rounded-full border-2 border-zinc-800"
        style={{ borderTopColor: "#6366f1", animation: "spin 0.8s linear infinite" }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Banner({ type, children }) {
  const styles = {
    error: { background: "#450a0a", border: "1px solid #991b1b" },
  };
  return (
    <div className="rounded-2xl p-4 text-sm text-white mb-4" style={styles[type] || styles.error}>
      {children}
    </div>
  );
}
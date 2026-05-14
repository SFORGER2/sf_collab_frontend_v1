/**
 * AdminAnalyticsPage.jsx — SFCollab ERP
 * Admin-only analytics: task completion rate, warning trends, contributor rankings
 *
 * API wiring (expected routes in analytics.py):
 *   GET /erp/analytics/admin/overview      → { task_completion_rate, task_completion_change, warning_count, warning_change }
 *   GET /erp/analytics/admin/warnings      → [{ week_label, count }]
 *   GET /erp/analytics/admin/contributors  → [{ user_id, name, score, tasks_done, streak, rank }]
 *
 * Route in App.jsx:
 *   import AdminAnalyticsPage from "./components/pages/erp/AdminAnalyticsPage.jsx";
 *   <Route path="erp/admin-analytics" element={<AdminAnalyticsPage />} />
 */

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import axios from "axios";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../utils/APIs/interceptors";
import {
  CheckSquare,
  AlertTriangle,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Medal,
  Award,
} from "lucide-react";

const api = axios.create({ baseURL: "" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ── Helpers ───────────────────────────────────────────────────────────────────
const pct = (v) => (v != null ? `${Math.round(v)}%` : "—");
const toArr = (v, ...keys) => {
  if (Array.isArray(v)) return v;
  for (const k of keys) if (Array.isArray(v?.[k])) return v[k];
  return [];
};

const PERIODS = [
  { value: "weekly",  label: "This Week" },
  { value: "monthly", label: "This Month" },
  { value: "all",     label: "All Time" },
];

const RANK_ICONS  = [Crown, Medal, Award];

// ═════════════════════════════════════════════════════════════════════════════
const RANK_COLORS = ["#f59e0b", "#9ca3af", "#b45309"];

// ═════════════════════════════════════════════════════════════════════════════
export default function AdminAnalyticsPage() {
  const { user } = useSelector((s) => s.auth);

  const [period, setPeriod]             = useState("weekly");
  const [overview, setOverview]         = useState(null);
  const [warnings, setWarnings]         = useState([]);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { period };
      const [ovRes, warnRes, contribRes] = await Promise.all([
        api.get("/erp/analytics/admin/overview",     { params }),
        api.get("/erp/analytics/admin/warnings",     { params }),
        api.get("/erp/analytics/admin/contributors", { params }),
      ]);
      setOverview(ovRes.data);
      setWarnings(toArr(warnRes.data, "warnings", "data"));
      setContributors(toArr(contribRes.data, "contributors", "data"));
    } catch (e) {
      setError(e?.response?.data?.error || "Could not load analytics. Routes may not be set up yet.");
      setOverview(null);
      setWarnings([]);
      setContributors([]);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const safeWarnings     = Array.isArray(warnings)     ? warnings     : [];
  const safeContributors = Array.isArray(contributors) ? contributors : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4 md:px-8 font-sans overflow-auto">
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-start justify-between gap-4 mb-10"
        >
          <div>
            <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
              Admin Analytics
            </h1>
            <p className="text-zinc-400 mt-1">Workspace performance &amp; contributor insights</p>
          </div>

          <div className="flex gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className="px-4 py-2 text-sm rounded-xl transition-all font-medium"
                style={
                  period === p.value
                    ? { background: "#1e1b4b", color: "#a5b4fc", border: "1px solid #4338ca" }
                    : { color: "#6b7280" }
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <Banner type="error">{error}</Banner>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <KPICard
                icon={CheckSquare}
                label="Task Completion Rate"
                value={pct(overview?.task_completion_rate)}
                change={overview?.task_completion_change}
                accent="#6366f1"
                description="Tasks completed vs assigned"
              />
              <KPICard
                icon={AlertTriangle}
                label="Active Warnings"
                value={overview?.warning_count ?? "—"}
                change={overview?.warning_change}
                accent="#ef4444"
                invertChange
                description="Members flagged this period"
              />
            </div>

            {safeWarnings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-[#121215] border border-zinc-800/80 rounded-3xl p-8 mb-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                    Warning Trends
                  </h2>
                  <span className="text-xs text-zinc-500 uppercase tracking-widest">Last 8 Weeks</span>
                </div>
                <WarningBarChart data={safeWarnings} />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[#121215] border border-zinc-800/80 rounded-3xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                  Contributor Rankings
                </h2>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>

              {safeContributors.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-8">No contributor data yet.</p>
              ) : (
                <div className="space-y-3">
                  {safeContributors.map((c, i) => (
                    <ContributorRow key={c.user_id} contributor={c} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, change, accent, description, invertChange }) {
  const isPositive = invertChange ? change < 0 : change > 0;
  const isNegative = invertChange ? change > 0 : change < 0;
  const TrendIcon  = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const trendColor = isPositive ? "#22c55e" : isNegative ? "#ef4444" : "#6b7280";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121215] border border-zinc-800/80 rounded-3xl p-8"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl" style={{ background: `${accent}18` }}>
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
        {change != null && (
          <div className="flex items-center gap-1.5" style={{ color: trendColor }}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">{label}</p>
      <p className="text-5xl font-semibold tracking-tighter bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent mb-2">
        {value}
      </p>
      <p className="text-xs text-zinc-500">{description}</p>
    </motion.div>
  );
}

function WarningBarChart({ data }) {
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const BAR_H  = 120;

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 400 }}>
        <svg viewBox={`0 0 ${data.length * 60} ${BAR_H + 32}`} style={{ width: "100%", overflow: "visible" }}>
          {[0, 0.25, 0.5, 0.75, 1].map((f) => {
            const y = BAR_H * (1 - f);
            return <line key={f} x1={0} y1={y} x2={data.length * 60} y2={y} stroke="#1f2937" strokeWidth={1} />;
          })}
          {data.map((d, i) => {
            const barH   = (d.count / maxVal) * (BAR_H - 8);
            const x      = i * 60 + 12;
            const y      = BAR_H - barH;
            const isHigh = d.count === maxVal;
            return (
              <g key={i}>
                <rect x={x} y={y} width={36} height={barH} rx={6} fill={isHigh ? "#ef4444" : "#27272a"} />
                <text x={x + 18} y={y - 6} textAnchor="middle" fontSize={10}
                  fill={isHigh ? "#fca5a5" : "#6b7280"} fontWeight={isHigh ? "700" : "400"}>
                  {d.count}
                </text>
                <text x={x + 18} y={BAR_H + 18} textAnchor="middle" fontSize={9} fill="#6b7280">
                  {d.week_label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function ContributorRow({ contributor: c, index }) {
  const RankIcon  = index < 3 ? RANK_ICONS[index]  : null;
  const rankColor = index < 3 ? RANK_COLORS[index] : "#6b7280";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.04 * index }}
      className="flex items-center gap-4 p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-colors"
    >
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-xl text-xs font-bold"
        style={{ color: rankColor, background: `${rankColor}18` }}>
        {RankIcon ? <RankIcon className="w-4 h-4" /> : `#${c.rank || index + 1}`}
      </div>
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
        {c.name?.charAt(0) ?? "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-white truncate">{c.name}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{c.tasks_done} tasks · {c.streak}d streak</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden hidden sm:block">
          <div className="h-full rounded-full"
            style={{
              width: `${c.score}%`,
              background: index === 0
                ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                : index === 1
                ? "linear-gradient(90deg,#6b7280,#9ca3af)"
                : "linear-gradient(90deg,#6366f1,#818cf8)",
            }}
          />
        </div>
        <span className="text-sm font-semibold text-white w-8 text-right">{c.score}</span>
      </div>
    </motion.div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-2 border-zinc-800"
        style={{ borderTopColor: "#6366f1", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Banner({ type, children }) {
  return (
    <div className="rounded-2xl p-4 text-sm text-white mb-4"
      style={{ background: "#450a0a", border: "1px solid #991b1b" }}>
      {children}
    </div>
  );
}
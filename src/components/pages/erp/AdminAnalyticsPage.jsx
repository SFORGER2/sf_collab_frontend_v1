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

// ── Shared UI components ──
import {
  PageHeader,
  GlassCard,
  StatCard,
  Badge,
  Spinner,
  Button,
  EmptyState,
} from "@/components/erp/ui";

const api = axios.create({ baseURL: "" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ── Helpers ────────────────────────────────────────────────────────────────
const pct = (v) => (v != null ? `${Math.round(v)}%` : "—");
const toArr = (v, ...keys) => {
  if (Array.isArray(v)) return v;
  for (const k of keys) if (Array.isArray(v?.[k])) return v[k];
  return [];
};

const PERIODS = [
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
  { value: "all", label: "All Time" },
];

const RANK_ICONS = [Crown, Medal, Award];
const RANK_COLORS = ["#f59e0b", "#9ca3af", "#b45309"];

// ═══════════════════════════════════════════════════════════════════════════
export default function AdminAnalyticsPage() {
  const { user } = useSelector((s) => s.auth);

  const [period, setPeriod] = useState("weekly");
  const [overview, setOverview] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Data loading ──────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const workspaceId = user?.active_workspace_id;

      if (!workspaceId) {
        throw new Error("No active workspace selected");
      }

      const today = new Date();

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      let startDate = null;
      let endDate = formatDate(today);

      if (period === "weekly") {
        const start = new Date(today);
        const day = start.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        start.setDate(start.getDate() + diff);
        startDate = formatDate(start);
      }

      if (period === "monthly") {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = formatDate(start);
      }

      const params = { workspace_id: workspaceId };

      // All Time: send a very early start date
      if (period === "all") {
        params.start_date = "2000-01-01";
        params.end_date = endDate;
      } else {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const res = await api.get("/api/erp-analytics/workspace", { params });
      const payload = res.data?.data || res.data || {};

      const metrics = payload.metrics || {};
      const warningTrendData = Array.isArray(payload.warning_trends)
        ? payload.warning_trends
        : [];
      const contributorData = Array.isArray(payload.contributors)
        ? payload.contributors
        : [];

      const activeWarnings = warningTrendData.reduce(
        (total, item) => total + Number(item.count || 0),
        0
      );

      setOverview({
        task_completion_rate: metrics.task_completion_rate ?? 0,
        attendance_rate: metrics.attendance_rate ?? 0,
        update_consistency: metrics.update_consistency ?? 0,
        active_users: metrics.active_users ?? {
          active: 0,
          total: 0,
          rate: 0,
        },
        active_warnings: activeWarnings,
        details: metrics.details || {},
      });

      setWarnings(warningTrendData);
      setContributors(contributorData);
    } catch (e) {
      console.error("Admin analytics load failed:", e);
      setError(
        e?.response?.data?.error ||
          e?.message ||
          "Could not load analytics."
      );
      setOverview(null);
      setWarnings([]);
      setContributors([]);
    } finally {
      setLoading(false);
    }
  }, [user?.active_workspace_id, period]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return <Spinner />;
  if (error) return <div className="text-red-400 text-center py-20">{error}</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Admin Analytics"
          subtitle="Workspace performance & contributor insights"
          actions={
            <div className="flex gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-1">
              {PERIODS.map((p) => (
                <Button
                  key={p.value}
                  variant={period === p.value ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setPeriod(p.value)}
                  className={`px-4 ${
                    period === p.value
                      ? "bg-[#1e1b4b] text-[#a5b4fc] border border-[#4338ca]"
                      : ""
                  }`}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          }
        />

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <StatCard
            icon={CheckSquare}
            label="Task Completion Rate"
            value={pct(overview?.task_completion_rate)}
            accent="#6366f1"
            sub={`${overview?.details?.tasks_done ?? 0} completed of ${
              overview?.details?.tasks_total ?? 0
            } tasks`}
          />
          <StatCard
            icon={AlertTriangle}
            label="Warnings This Period"
            value={overview?.active_warnings ?? 0}
            accent="#ef4444"
            sub="Warnings created during selected period"
          />
        </div>

        {/* Warning Trends */}
        {warnings.length > 0 && (
          <GlassCard className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                Warning Trends
              </h2>
              <Badge color="gray">Selected Period</Badge>
            </div>
            <WarningBarChart data={warnings} />
          </GlassCard>
        )}

        {/* Contributor Rankings */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
              Contributor Rankings
            </h2>
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          {contributors.length === 0 ? (
            <EmptyState
              icon={<Trophy className="w-12 h-12 text-zinc-600" />}
              title="No data yet"
              description="No contributor data available for this period."
            />
          ) : (
            <div className="space-y-3">
              {contributors.map((c, i) => (
                <ContributorRow key={c.user_id} contributor={c} index={i} />
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

// ── Sub‑components ──────────────────────────────────────────────────────────

function WarningBarChart({ data }) {
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const BAR_H = 120;
  const chartWidth = Math.max(data.length * 60, 400);

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 400 }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${BAR_H + 32}`}
          width="100%"
          height="170"
          preserveAspectRatio="xMidYMid meet"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((f) => {
            const y = BAR_H * (1 - f);
            return (
              <line
                key={f}
                x1={0}
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="#1f2937"
                strokeWidth={1}
              />
            );
          })}

          {data.map((d, i) => {
            const barH = (d.count / maxVal) * (BAR_H - 8);
            const x = i * 60 + 12;
            const y = BAR_H - barH;
            const isHigh = d.count === maxVal;

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={36}
                  height={barH}
                  rx={6}
                  fill={isHigh ? "#ef4444" : "#27272a"}
                />
                <text
                  x={x + 18}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fill={isHigh ? "#fca5a5" : "#6b7280"}
                  fontWeight={isHigh ? "700" : "400"}
                >
                  {d.count}
                </text>
                <text
                  x={x + 18}
                  y={BAR_H + 18}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#6b7280"
                >
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
  const RankIcon = index < 3 ? RANK_ICONS[index] : null;
  const rankColor = index < 3 ? RANK_COLORS[index] : "#6b7280";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.04 * index }}
      className="flex items-center gap-4 p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-colors"
    >
      <div
        className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-xl text-xs font-bold"
        style={{ color: rankColor, background: `${rankColor}18` }}
      >
        {RankIcon ? <RankIcon className="w-4 h-4" /> : `#${c.rank || index + 1}`}
      </div>
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
        {c.name?.charAt(0) ?? "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-white truncate">{c.name}</p>
        <p className="text-xs text-zinc-500 mt-0.5">
          {c.tasks_done} tasks · {c.streak}d streak
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden hidden sm:block">
          <div
            className="h-full rounded-full"
            style={{
              width: `${c.score}%`,
              background:
                index === 0
                  ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                  : index === 1
                  ? "linear-gradient(90deg,#6b7280,#9ca3af)"
                  : "linear-gradient(90deg,#6366f1,#818cf8)",
            }}
          />
        </div>
        <span className="text-sm font-semibold text-white w-8 text-right">
          {c.score}
        </span>
      </div>
    </motion.div>
  );
}
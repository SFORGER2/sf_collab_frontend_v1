import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { CheckSquare, AlertTriangle, Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Award, BarChart3 } from "lucide-react";

import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPLoadingSkeleton } from "../../erp/shared/ERPLoadingSkeleton";
import { ERPBannerManager } from "../../erp/shared/ERPBanner";
import { ERPEmptyState } from "../../erp/shared/ERPEmptyState";

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

const pct = (v) => (v != null ? `${Math.round(v)}%` : "—");
const PERIODS = [{ value: "weekly", label: "This Week" }, { value: "monthly", label: "This Month" }, { value: "all", label: "All Time" }];
const RANK_ICONS = [Crown, Medal, Award];
const RANK_COLORS = ["#f59e0b", "#9ca3af", "#b45309"];

export default function AdminAnalyticsPage() {
  const { user } = useSelector((s) => s.auth);
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
      if (!workspaceId) throw new Error("No active workspace selected");

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

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="min-h-screen bg-[#0a0a0b]"><ERPLoadingSkeleton /></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ERPPageHeader
          icon={<BarChart3 size={20} />}
          title="Admin Analytics"
          description="Workspace performance, telemetry, and contributor insights."
          breadcrumbs={[{ label: "ERP" }, { label: "Admin" }, { label: "Analytics" }]}
          actions={
            <div className="flex bg-[#111115] border border-white/5 rounded-xl p-1">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded-lg transition-all ${
                    period === p.value ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {p.label}
                </button>
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

        {error && <ERPBannerManager error={error} onDismissError={() => setError(null)} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 mb-8">
          <KPICard
            icon={CheckSquare}
            label="Task Completion Rate"
            value={pct(overview?.task_completion_rate)}
            accent="#6366f1"
            description={`${overview?.details?.tasks_done ?? 0} completed of ${overview?.details?.tasks_total ?? 0} tasks`}
          />
          <KPICard
            icon={AlertTriangle}
            label="Warnings This Period"
            value={overview?.active_warnings ?? 0}
            accent="#ef4444"
            description="Warnings created during selected period"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {warnings.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-8 bg-[#111115] border border-white/5 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-base font-bold text-white flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500" /> Warning Trends</h2>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Selected Period</span>
              </div>
              <WarningBarChart data={warnings} />
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`bg-[#111115] border border-white/5 rounded-3xl p-8 ${warnings.length > 0 ? 'lg:col-span-4' : 'lg:col-span-12'}`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-base font-bold text-white flex items-center gap-2"><Trophy size={18} className="text-yellow-500" /> Contributor Rankings</h2>
            </div>
            {contributors.length === 0 ? (
              <ERPEmptyState icon={<Trophy size={24} />} title="No data yet" sub="No contributor data found for this period." compact />
            ) : (
              <div className="space-y-3">
                {contributors.map((c, i) => <ContributorRow key={c.user_id} contributor={c} index={i} />)}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, accent, description }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111115] border border-white/5 rounded-3xl p-8 relative overflow-hidden" style={{ borderTop: `2px solid ${accent}` }}>
      <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none">
        <Icon size={140} style={{ color: accent }} />
      </div>
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="p-3 rounded-2xl" style={{ background: `linear-gradient(135deg, ${accent}22, ${accent}11)` }}>
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 relative z-10">{label}</p>
      <p className="text-5xl font-black tracking-tighter text-white mb-2 relative z-10">{value}</p>
      <p className="text-xs text-zinc-400 font-medium relative z-10">{description}</p>
    </motion.div>
  );
}

function WarningBarChart({ data }) {
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const BAR_H = 120;
  const chartWidth = Math.max(data.length * 60, 400);

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 400 }}>
        <svg viewBox={`0 0 ${chartWidth} ${BAR_H + 32}`} width="100%" height="170" preserveAspectRatio="xMidYMid meet">
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
            const isHigh = d.count === maxVal && maxVal > 0;
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
  const rankColor = index < 3 ? RANK_COLORS[index] : "#71717a";

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * index }} className="flex items-center gap-4 p-4 bg-[#1a1a20] border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
      <div className="w-8 h-8 flex items-center justify-center shrink-0 rounded-xl text-xs font-bold" style={{ color: rankColor, background: `${rankColor}20` }}>
        {RankIcon ? <RankIcon className="w-4 h-4" /> : `#${c.rank || index + 1}`}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-white truncate">{c.name}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">{c.tasks_done} tasks · {c.streak}d streak</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-base font-black text-white">{c.score}</span>
      </div>
    </motion.div>
  );
}
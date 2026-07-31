// src/components/pages/erp/PayoutPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../utils/APIs/interceptors";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertTriangle,
  Inbox,
  RefreshCcw,
} from "lucide-react";

const api = axios.create({ baseURL: "/api/payout" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const fmt = (v) =>
  v != null
    ? `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const STATUS_META = {
  paid: { label: "Paid", color: "#22c55e", bg: "rgba(34,197,94,0.12)", ring: "rgba(34,197,94,0.25)", icon: CheckCircle },
  approved: { label: "Approved", color: "#6366f1", bg: "rgba(99,102,241,0.12)", ring: "rgba(99,102,241,0.25)", icon: CheckCircle },
  pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", ring: "rgba(245,158,11,0.25)", icon: Clock },
  held: { label: "On Hold", color: "#9ca3af", bg: "rgba(156,163,175,0.12)", ring: "rgba(156,163,175,0.25)", icon: AlertCircle },
  cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.12)", ring: "rgba(239,68,68,0.25)", icon: XCircle },
};

export default function PayoutPage() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const loadPayouts = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const response = await api.get(`/workspaces/${workspaceId}/payouts/me`);
      const data = response.data?.data || response.data || [];
      setPayouts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadPayouts();
  }, [loadPayouts]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={loadPayouts} />;

  const totalEarned = payouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.final_payout_amount || 0), 0);
  const currentPayout = payouts.find((p) => p.status === "approved" || p.status === "pending") || null;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200 sm:px-6 md:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">Payouts</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track what you&apos;ve earned, what&apos;s in progress, and your full payout history.
          </p>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard icon={DollarSign} label="Total Earned" value={fmt(totalEarned)} accent="#22c55e" />
          <SummaryCard
            icon={CheckCircle}
            label="Payouts Received"
            value={payouts.filter((p) => p.status === "paid").length}
            accent="#6366f1"
          />
          <SummaryCard
            icon={Calendar}
            label="Current Period"
            value={currentPayout ? fmtDate(currentPayout.created_at) : "—"}
            accent="#f59e0b"
          />
        </div>

        {currentPayout && (
          <CurrentPayoutCard
            payout={currentPayout}
            expanded={expanded === currentPayout.id}
            onToggle={() => setExpanded(expanded === currentPayout.id ? null : currentPayout.id)}
          />
        )}

        <PayoutHistoryCard payouts={payouts} expanded={expanded} onToggle={setExpanded} />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------

function SummaryCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-white/5 bg-[#151B2B] p-5 shadow-sm transition-all hover:border-white/10 hover:shadow-md">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
        style={{ background: `${accent}18` }}
      >
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status, size = "md" }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  const Icon = m.icon;
  const sizing = size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3.5 py-1.5 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-widest ${sizing}`}
      style={{ color: m.color, background: m.bg, borderColor: m.ring }}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {m.label}
    </span>
  );
}

function ProgressBar({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  const width = status === "paid" ? "100%" : "60%";
  return (
    <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width, background: m.color, boxShadow: `0 0 10px ${m.color}80` }}
      />
    </div>
  );
}

function BreakdownRow({ label, value, emphasize }) {
  return (
    <div className={`flex items-center justify-between py-2 ${emphasize ? "font-semibold text-white" : "text-slate-300"}`}>
      <span className={emphasize ? "text-white" : "text-slate-500"}>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function CurrentPayoutCard({ payout, expanded, onToggle }) {
  return (
    <div className="mb-6 rounded-2xl border border-white/5 bg-[#151B2B] p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Current Payout</p>
          <p className="bg-gradient-to-br from-white to-slate-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            {fmt(payout.final_payout_amount)}
          </p>
        </div>
        <StatusBadge status={payout.status} />
      </div>

      <ProgressBar status={payout.status} />

      <button
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
      >
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {expanded ? "Hide breakdown" : "Show breakdown"}
      </button>

      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <div className="divide-y divide-white/5 border-t border-white/5 pt-2 text-sm">
            <BreakdownRow
              label="Execution points"
              value={`${payout.execution_points} / ${payout.team_total_points}`}
            />
            <BreakdownRow label="Contribution" value={`${Math.round(payout.contribution_percentage * 100)}%`} />
            <BreakdownRow label="Total" value={fmt(payout.final_payout_amount)} emphasize />
          </div>
        </div>
      </div>
    </div>
  );
}

function PayoutHistoryCard({ payouts, expanded, onToggle }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#151B2B] shadow-sm">
      <div className="border-b border-white/5 p-6 sm:p-8 sm:pb-6">
        <h2 className="bg-gradient-to-br from-white to-slate-400 bg-clip-text text-lg font-semibold text-transparent sm:text-xl">
          Payout History
        </h2>
      </div>

      <div className="p-6 sm:p-8 sm:pt-6">
        {payouts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {payouts.map((p) => (
              <PayoutHistoryRow
                key={p.id}
                payout={p}
                expanded={expanded === p.id}
                onToggle={() => onToggle(expanded === p.id ? null : p.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PayoutHistoryRow({ payout: p, expanded, onToggle }) {
  const m = STATUS_META[p.status] || STATUS_META.pending;
  const Icon = m.icon;
  const hasBreakdown = p.execution_points != null && p.team_total_points != null;

  return (
    <div className="group rounded-xl border border-white/5 bg-slate-900/40 transition-all hover:border-white/10 hover:bg-white/[0.03]">
      <button
        type="button"
        onClick={hasBreakdown ? onToggle : undefined}
        className={`flex w-full flex-wrap items-center justify-between gap-4 p-4 text-left sm:p-5 ${
          hasBreakdown ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
            style={{ background: m.bg }}
          >
            <Icon className="h-5 w-5" style={{ color: m.color }} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-100">
              Payout {fmtDate(p.paid_at || p.approved_at || p.created_at)}
            </p>
            <p className="text-xs text-slate-500">{m.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-white">{fmt(p.final_payout_amount)}</span>
          <StatusBadge status={p.status} size="sm" />
          {hasBreakdown &&
            (expanded ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ))}
        </div>
      </button>

      {hasBreakdown && (
        <div
          className={`grid overflow-hidden px-4 transition-all duration-300 ease-in-out sm:px-5 ${
            expanded ? "grid-rows-[1fr] pb-4 opacity-100 sm:pb-5" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0">
            <div className="divide-y divide-white/5 border-t border-white/5 pt-2 text-sm">
              <BreakdownRow
                label="Execution points"
                value={`${p.execution_points} / ${p.team_total_points}`}
              />
              {p.contribution_percentage != null && (
                <BreakdownRow label="Contribution" value={`${Math.round(p.contribution_percentage * 100)}%`} />
              )}
              <BreakdownRow label="Total" value={fmt(p.final_payout_amount)} emphasize />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5">
        <Inbox className="h-5 w-5 text-slate-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-300">No payout history yet</p>
        <p className="mt-1 text-xs text-slate-500">Completed and pending payouts will show up here.</p>
      </div>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-950 px-4 py-16">
      <div className="flex w-full max-w-lg items-start gap-3 rounded-xl border border-red-900/60 bg-red-950/40 p-5 text-sm text-red-300">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
        <div className="flex-1">
          <p className="font-medium text-red-200">Couldn&apos;t load payouts</p>
          <p className="mt-0.5 text-red-400/90">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-red-800 px-2.5 py-1.5 text-xs font-medium text-red-200 transition-colors hover:bg-red-900/50"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500" />
        <p className="text-sm">Loading payouts…</p>
      </div>
    </div>
  );
}

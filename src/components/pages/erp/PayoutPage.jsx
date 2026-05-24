// src/components/pages/erp/PayoutPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../utils/APIs/interceptors";
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Calendar } from "lucide-react";

const api = axios.create({ baseURL: "/api/payout" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const fmt = (v) => (v != null ? `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—");
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—");

const STATUS_META = {
  paid:       { label: "Paid",       color: "#22c55e", bg: "rgba(34,197,94,0.12)",   icon: CheckCircle },
  approved:   { label: "Approved",   color: "#6366f1", bg: "rgba(99,102,241,0.12)",  icon: CheckCircle },
  pending:    { label: "Pending",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  held:       { label: "On Hold",    color: "#9ca3af", bg: "rgba(156,163,175,0.12)", icon: AlertCircle },
  cancelled:  { label: "Cancelled",  color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: XCircle },
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
  if (error) return <Banner type="error">{error}</Banner>;

  const totalEarned = payouts.filter(p => p.status === "paid").reduce((sum, p) => sum + (p.final_payout_amount || 0), 0);
  const currentPayout = payouts.find(p => p.status === "approved" || p.status === "pending") || null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent mb-10">Payouts</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <SummaryChip icon={DollarSign} label="Total Earned" value={fmt(totalEarned)} accent="#22c55e" />
          <SummaryChip icon={CheckCircle} label="Payouts Received" value={payouts.filter(p => p.status === "paid").length} accent="#6366f1" />
          <SummaryChip icon={Calendar} label="Current Period" value={currentPayout ? `${fmtDate(currentPayout.created_at)}` : "—"} accent="#f59e0b" small />
        </div>

        {currentPayout && (
          <div className="bg-[#121215] border border-zinc-800/80 rounded-3xl p-8 mb-6">
            <div className="flex justify-between flex-wrap gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Current Payout</p>
                <p className="text-5xl font-semibold tracking-tighter bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">{fmt(currentPayout.final_payout_amount)}</p>
              </div>
              <StatusBadge status={currentPayout.status} />
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-6 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: currentPayout.status === "paid" ? "100%" : "60%", background: STATUS_META[currentPayout.status]?.color || "#6366f1" }} />
            </div>
            <button onClick={() => setExpanded(expanded === currentPayout.id ? null : currentPayout.id)} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
              {expanded === currentPayout.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Show breakdown
            </button>
            {expanded === currentPayout.id && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <div className="flex justify-between py-2"><span className="text-zinc-400">Execution points</span><span>{currentPayout.execution_points} / {currentPayout.team_total_points}</span></div>
                <div className="flex justify-between py-2"><span className="text-zinc-400">Contribution</span><span>{Math.round(currentPayout.contribution_percentage * 100)}%</span></div>
                <div className="flex justify-between py-2 font-semibold"><span>Total</span><span>{fmt(currentPayout.final_payout_amount)}</span></div>
              </div>
            )}
          </div>
        )}

        <div className="bg-[#121215] border border-zinc-800/80 rounded-3xl p-8">
          <h2 className="text-xl font-semibold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-6">Payout History</h2>
          {payouts.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">No payout history yet.</p>
          ) : (
            <div className="space-y-3">
              {payouts.map((p, i) => {
                const m = STATUS_META[p.status] || STATUS_META.pending;
                const Icon = m.icon;
                return (
                  <div key={p.id} className="flex justify-between p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: m.bg }}><Icon className="w-5 h-5" style={{ color: m.color }} /></div>
                      <div><p className="font-medium">Payout {fmtDate(p.paid_at || p.approved_at || p.created_at)}</p><p className="text-xs text-zinc-500">{m.label}</p></div>
                    </div>
                    <div className="flex items-center gap-4"><span className="text-base font-semibold">{fmt(p.final_payout_amount)}</span><span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ color: m.color, background: m.bg }}>{m.label}</span></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryChip({ icon: Icon, label, value, accent, small }) {
  return (
    <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 flex gap-4">
      <div className="p-2.5 rounded-xl" style={{ background: `${accent}18` }}><Icon className="w-5 h-5" style={{ color: accent }} /></div>
      <div><p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p><p className={`font-semibold mt-0.5 ${small ? "text-sm" : "text-lg"}`}>{value}</p></div>
    </div>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  const Icon = m.icon;
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border" style={{ color: m.color, background: m.bg, borderColor: `${m.color}40` }}>
      <Icon className="w-4 h-4" /><span className="text-sm font-semibold">{m.label}</span>
    </div>
  );
}

function Banner({ type, children }) {
  return <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-sm text-white mb-4">{children}</div>;
}

function Spinner() {
  return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin" /></div>;
}
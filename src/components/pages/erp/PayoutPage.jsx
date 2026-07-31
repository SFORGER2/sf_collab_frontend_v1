import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Calendar, Wallet } from "lucide-react";

import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPStatCard } from "../../erp/shared/ERPStatCard";
import { ERPLoadingSkeleton } from "../../erp/shared/ERPLoadingSkeleton";
import { ERPBannerManager } from "../../erp/shared/ERPBanner";
import { ERPStatusBadge } from "../../erp/shared/ERPStatusBadge";
import { ERPEmptyState } from "../../erp/shared/ERPEmptyState";

const api = axios.create({ baseURL: "/api/payout" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const fmt = (v) => (v != null ? `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—");
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—");

const STATUS_META = {
  paid:       { label: "Paid",       color: "#22c55e", bg: "rgba(34,197,94,0.12)",   icon: CheckCircle },
  approved:   { label: "Approved",   color: "#6366f1", bg: "rgba(99,102,241,0.12)",  icon: CheckCircle },
  pending:    { label: "Pending",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  held:       { label: "On Hold",    color: "var(--color-dim)", bg: "rgba(156,163,175,0.12)", icon: AlertCircle },
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

  useEffect(() => { loadPayouts(); }, [loadPayouts]);

  if (loading) return <div className="min-h-screen bg-[#0a0a0b]"><ERPLoadingSkeleton /></div>;

  const totalEarned = payouts.filter(p => p.status === "paid").reduce((sum, p) => sum + (p.final_payout_amount || 0), 0);
  const currentPayout = payouts.find(p => p.status === "approved" || p.status === "pending") || null;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ERPPageHeader
          icon={<Wallet size={20} />}
          title="My Payouts"
          description="View your payout history and pending distributions."
          breadcrumbs={[{ label: "ERP" }, { label: "My Payouts" }]}
        />

        {error && <ERPBannerManager error={error} onDismissError={() => setError(null)} />}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 mb-8">
          <ERPStatCard title="Total Earned" value={fmt(totalEarned)} icon={<DollarSign size={18} className="text-emerald-500" />} accentColor="#10b981" />
          <ERPStatCard title="Payouts Received" value={payouts.filter(p => p.status === "paid").length} icon={<CheckCircle size={18} className="text-indigo-500" />} accentColor="#6366f1" />
          <ERPStatCard title="Current Period" value={currentPayout ? `${fmtDate(currentPayout.created_at)}` : "—"} icon={<Calendar size={18} className="text-amber-500" />} accentColor="#f59e0b" />
        </div>

        {currentPayout && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111115] border border-white/5 rounded-3xl p-8 mb-8">
            <div className="flex justify-between flex-wrap gap-4 mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Current Payout</p>
                <p className="text-6xl font-black tracking-tighter bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">{fmt(currentPayout.final_payout_amount)}</p>
              </div>
              <div><ERPStatusBadge status={currentPayout.status} /></div>
            </div>
            
            <div className="w-full h-2 bg-[#1a1a20] rounded-full mb-8 overflow-hidden shadow-inner">
              <motion.div initial={{ width: 0 }} animate={{ width: currentPayout.status === "paid" ? "100%" : "60%" }} className="h-full rounded-full" style={{ background: STATUS_META[currentPayout.status]?.color || "#6366f1" }} />
            </div>

            <button onClick={() => setExpanded(expanded === currentPayout.id ? null : currentPayout.id)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
              {expanded === currentPayout.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {expanded === currentPayout.id ? "Hide breakdown" : "Show breakdown"}
            </button>
            
            <AnimatePresence>
              {expanded === currentPayout.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                    <div className="flex justify-between text-sm font-semibold text-zinc-400"><span>Execution points</span><span className="text-white">{currentPayout.execution_points} / {currentPayout.team_total_points}</span></div>
                    <div className="flex justify-between text-sm font-semibold text-zinc-400"><span>Contribution</span><span className="text-white">{Math.round(currentPayout.contribution_percentage * 100)}%</span></div>
                    <div className="flex justify-between text-sm font-black text-white pt-2"><span>Total Amount</span><span className="text-emerald-400">{fmt(currentPayout.final_payout_amount)}</span></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="bg-[#111115] border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Payout History</h3>
          </div>
          {payouts.length === 0 ? (
            <ERPEmptyState icon={<Wallet size={24} />} title="No payout history" sub="Payouts generated by admins will appear here." compact />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-black/20">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payouts.map((p) => (
                    <motion.tr whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }} key={p.id} className="transition-colors">
                      <td className="px-6 py-5 font-semibold text-white">Payout {fmtDate(p.paid_at || p.approved_at || p.created_at)}</td>
                      <td className="px-6 py-5"><ERPStatusBadge status={p.status} /></td>
                      <td className="px-6 py-5 text-right font-bold text-emerald-400">{fmt(p.final_payout_amount)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
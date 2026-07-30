// src/components/pages/erp/AdminPayouts.jsx — REDESIGNED
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Filter,
  RefreshCw,
  X,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";

import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPStatusBadge } from "../../erp/shared/ERPStatusBadge";
import { ERPEmptyState } from "../../erp/shared/ERPEmptyState";
import { ERPTableSkeleton } from "../../erp/shared/ERPLoadingSkeleton";
import { ERPBanner } from "../../erp/shared/ERPBanner";

const api = axios.create({ baseURL: "/api/payout" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const revenuePoolApi = axios.create({ baseURL: "/api/revenue-pool" });
revenuePoolApi.interceptors.request.use(requestInterceptor);
revenuePoolApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const STATUS_META = {
  paid:       { label: "Paid",       color: "#10b981", bg: "rgba(16,185,129,0.1)",   icon: CheckCircle2 },
  approved:   { label: "Approved",   color: "#6366f1", bg: "rgba(99,102,241,0.1)",   icon: CheckCircle2 },
  pending:    { label: "Pending",    color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   icon: Clock },
  held:       { label: "On Hold",    color: "#9ca3af", bg: "rgba(156,163,175,0.1)",  icon: AlertCircle },
  cancelled:  { label: "Cancelled",  color: "#ef4444", bg: "rgba(239,68,68,0.1)",    icon: XCircle },
};

const fmt$ = (v) => `$${Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AdminPayouts() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;

  const [payouts, setPayouts] = useState([]);
  const [pools, setPools] = useState([]);
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);

  const loadPools = useCallback(async () => {
    try {
      const res = await revenuePoolApi.get(`/workspaces/${workspaceId}/revenue-pools`);
      const data = res.data?.data || res.data;
      setPools(data.pools || []);
    } catch (err) { console.error("Failed to load pools", err); }
  }, [workspaceId]);

  const loadPayouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedPoolId) params.revenue_pool_id = selectedPoolId;
      const res = await api.get(`/workspaces/${workspaceId}/payouts`, { params });
      const data = res.data?.data || res.data;
      setPayouts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load payouts");
    } finally { setLoading(false); }
  }, [workspaceId, selectedPoolId]);

  useEffect(() => { loadPools(); }, [loadPools]);
  useEffect(() => { loadPayouts(); }, [loadPayouts]);

  const handleAction = async (payoutId, action, reason = "") => {
    setActionLoading(true);
    try {
      const payload = action === "hold" ? { reason } : {};
      await api.post(`/workspaces/${workspaceId}/payouts/${payoutId}/${action}`, payload);
      setModal(null);
      loadPayouts();
    } catch (err) {
      setError(err?.response?.data?.error || `${action} failed`);
    } finally { setActionLoading(false); }
  };

  const getPoolName = (poolId) => {
    const pool = pools.find((p) => p.id === poolId);
    return pool
      ? `${new Date(pool.period_start).toLocaleDateString([], { month: "short", day: "numeric" })} – ${new Date(pool.period_end).toLocaleDateString([], { month: "short", day: "numeric" })}`
      : `Pool #${poolId}`;
  };

  // Summary metrics
  const totalPaid = payouts.filter(p => p.status === "paid").reduce((s, p) => s + (p.final_payout_amount || 0), 0);
  const pendingCount = payouts.filter(p => p.status === "pending").length;
  const approvedCount = payouts.filter(p => p.status === "approved").length;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <ERPPageHeader
          icon={<Wallet size={20} />}
          title="Payouts"
          description="Manage, approve, hold, or mark payouts as paid across all revenue pools"
          breadcrumbs={[{ label: "ERP" }, { label: "Admin" }, { label: "Payouts" }]}
          actions={
            <button
              onClick={loadPayouts}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/[0.06] text-zinc-400 hover:text-white text-sm transition-all"
            >
              <RefreshCw size={13} />
            </button>
          }
        />

        <AnimatePresence>
          {error && <ERPBanner message={error} type="error" onDismiss={() => setError(null)} />}
        </AnimatePresence>

        {/* Summary KPIs */}
        {!loading && payouts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Paid Out", value: fmt$(totalPaid), accent: "#10b981", icon: <TrendingUp size={14} /> },
              { label: "Pending", value: pendingCount, accent: "#f59e0b", icon: <Clock size={14} /> },
              { label: "Approved", value: approvedCount, accent: "#6366f1", icon: <CheckCircle2 size={14} /> },
              { label: "Total Payouts", value: payouts.length, accent: "#06b6d4", icon: <Users size={14} /> },
            ].map((kpi) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                whileHover={{ translateY: -2 }}
                className="p-4 rounded-2xl"
                style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)", borderTop: `2px solid ${kpi.accent}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{kpi.label}</p>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${kpi.accent}18`, color: kpi.accent }}>
                    {kpi.icon}
                  </div>
                </div>
                <p className="text-xl font-bold" style={{ color: kpi.accent }}>{kpi.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filter */}
        <div
          className="flex flex-wrap gap-3 items-center px-5 py-4 rounded-xl mb-6"
          style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Filter size={13} className="text-zinc-500 shrink-0" />
          <label className="text-xs text-zinc-400 font-medium">Pool</label>
          <select
            value={selectedPoolId}
            onChange={(e) => setSelectedPoolId(e.target.value)}
            className="bg-zinc-800 border border-white/[0.06] text-zinc-300 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500/50 cursor-pointer flex-1 max-w-xs"
          >
            <option value="">All Pools</option>
            {pools.map((pool) => (
              <option key={pool.id} value={pool.id}>
                {getPoolName(pool.id)} (#{pool.id})
              </option>
            ))}
          </select>
          {selectedPoolId && (
            <button onClick={() => setSelectedPoolId("")} className="text-zinc-500 hover:text-zinc-300 text-xs flex items-center gap-1">
              <X size={11} /> Clear
            </button>
          )}
          <span className="ml-auto text-xs text-zinc-500">{payouts.length} payouts</span>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)" }}>
          {loading ? (
            <ERPTableSkeleton rows={6} cols={6} />
          ) : payouts.length === 0 ? (
            <ERPEmptyState icon={<Wallet size={28} />} title="No payouts found" sub="Payouts will appear here once revenue pools are processed." compact />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {["ID", "Member", "Pool", "Points", "Payout Amount", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p, i) => {
                    const meta = STATUS_META[p.status] || STATUS_META.pending;
                    const StatusIcon = meta.icon;
                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.025 }}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-3.5 text-xs text-zinc-500 font-mono">#{p.id}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300">U</div>
                            <span className="text-sm text-zinc-300">#{p.user_id}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-zinc-400 whitespace-nowrap">{getPoolName(p.revenue_pool_id)}</td>
                        <td className="px-5 py-3.5 text-xs text-zinc-400 font-mono">{p.execution_points}/{p.team_total_points}</td>
                        <td className="px-5 py-3.5 text-sm font-bold text-white">{fmt$(p.final_payout_amount)}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            <StatusIcon size={10} /> {meta.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-2 flex-wrap">
                            {(p.status === "pending" || p.status === "pending_review") && (
                              <button
                                onClick={() => handleAction(p.id, "approve")}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                                style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
                              >
                                Approve
                              </button>
                            )}
                            {p.status === "approved" && (
                              <button
                                onClick={() => handleAction(p.id, "mark-paid")}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                                style={{ background: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)" }}
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Hold Modal */}
      <AnimatePresence>
        {modal?.action === "hold" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-6"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
              style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <h2 className="text-base font-bold mb-2 text-white">Hold Payout</h2>
              <p className="text-sm text-zinc-400 mb-4">Please provide a reason for holding this payout.</p>
              <textarea
                placeholder="Reason for hold…"
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                style={{ background: "#1a1a20", border: "1px solid rgba(255,255,255,0.07)", color: "#e5e7eb" }}
                onChange={(e) => setModal({ ...modal, reason: e.target.value })}
              />
              <div className="flex gap-3 mt-5">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm text-zinc-400 transition-colors" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>Cancel</button>
                <button
                  onClick={() => handleAction(modal.payoutId, "hold", modal.reason)}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", opacity: actionLoading ? 0.7 : 1 }}
                >
                  Confirm Hold
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
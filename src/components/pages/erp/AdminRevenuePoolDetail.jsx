import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calculator, Lock, Wallet, Edit3, DollarSign } from "lucide-react";

import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPStatCard } from "../../erp/shared/ERPStatCard";
import { ERPLoadingSkeleton } from "../../erp/shared/ERPLoadingSkeleton";
import { ERPBannerManager } from "../../erp/shared/ERPBanner";
import { ERPStatusBadge } from "../../erp/shared/ERPStatusBadge";
import { ERPEmptyState } from "../../erp/shared/ERPEmptyState";

const api = axios.create({ baseURL: "/api/revenue-pool" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const payoutApi = axios.create({ baseURL: "/api/payout" });
payoutApi.interceptors.request.use(requestInterceptor);
payoutApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export default function AdminRevenuePoolDetail() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const { poolId } = useParams();
  const navigate = useNavigate();
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [payouts, setPayouts] = useState([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);

  const loadPool = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/workspaces/${workspaceId}/revenue-pools`);
      const data = res.data?.data || res.data;
      const found = (data.pools || []).find(p => p.id === parseInt(poolId));
      if (!found) throw new Error("Pool not found");
      setPool(found);
      setEditForm({
        gross_revenue: found.gross_revenue,
        refunds_amount: found.refunds_amount,
        chargebacks_amount: found.chargebacks_amount,
        manual_exclusions_amount: found.manual_exclusions_amount,
        team_share_percentage: found.team_share_percentage,
      });
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, poolId]);

  const loadPayouts = useCallback(async () => {
    if (!poolId) return;
    setLoadingPayouts(true);
    try {
      const res = await payoutApi.get(`/workspaces/${workspaceId}/payouts?revenue_pool_id=${poolId}`);
      const data = res.data?.data || res.data;
      setPayouts(Array.isArray(data) ? data : []);
    } catch (err) {
      setPayouts([]);
    } finally {
      setLoadingPayouts(false);
    }
  }, [workspaceId, poolId]);

  useEffect(() => {
    loadPool();
    loadPayouts();
  }, [loadPool, loadPayouts]);

  const handleAction = async (action, payload = {}) => {
    setActionLoading(true);
    try {
      let endpoint = "";
      let method = "post";
      switch (action) {
        case "calculate":
          endpoint = `/workspaces/${workspaceId}/revenue-pools/${poolId}/calculate`;
          break;
        case "lock":
          endpoint = `/workspaces/${workspaceId}/revenue-pools/${poolId}/lock`;
          break;
        case "generate":
          await payoutApi.post(`/workspaces/${workspaceId}/payouts/generate`, { revenue_pool_id: poolId });
          loadPayouts();
          loadPool();
          return;
        case "update":
          endpoint = `/workspaces/${workspaceId}/revenue-pools/${poolId}`;
          method = "put";
          await api[method](endpoint, payload);
          setShowEdit(false);
          loadPool();
          return;
        default:
          return;
      }
      await api[method](endpoint, payload);
      loadPool();
    } catch (err) {
      setError(err?.response?.data?.error || `${action} failed`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0b]"><ERPLoadingSkeleton /></div>;
  if (!pool) return <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center"><ERPEmptyState icon={<DollarSign />} title="Pool Not Found" sub="Could not find the requested revenue pool." /></div>;

  const canCalculate = pool.status === "open";
  const canLock = pool.status === "pending_admin_review";
  const canGenerate = pool.status === "locked";

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate("/erp/admin/revenue-pools")} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Pools
        </button>

        <ERPPageHeader
          icon={<DollarSign size={20} />}
          title={`Revenue Pool #${pool.id}`}
          description={`${new Date(pool.period_start).toLocaleDateString()} – ${new Date(pool.period_end).toLocaleDateString()}`}
          breadcrumbs={[{ label: "ERP" }, { label: "Admin" }, { label: "Revenue Pools" }, { label: `Pool #${pool.id}` }]}
          actions={
            <div className="flex flex-wrap gap-3">
              {canCalculate && (
                <button onClick={() => handleAction("calculate")} disabled={actionLoading} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50">
                  <Calculator size={14} /> Calculate
                </button>
              )}
              {canLock && (
                <button onClick={() => handleAction("lock")} disabled={actionLoading} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50">
                  <Lock size={14} /> Lock
                </button>
              )}
              {canGenerate && (
                <button onClick={() => handleAction("generate")} disabled={actionLoading} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50">
                  <Wallet size={14} /> Generate Payouts
                </button>
              )}
              <button onClick={() => setShowEdit(!showEdit)} className="flex items-center gap-2 bg-[#1a1a20] border border-white/10 hover:border-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
                <Edit3 size={14} /> Edit
              </button>
            </div>
          }
        />

        {error && <ERPBannerManager error={error} onDismissError={() => setError(null)} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 mb-8">
          <ERPStatCard title="Gross Revenue" value={`$${pool.gross_revenue.toLocaleString()}`} accentColor="#3b82f6" />
          <ERPStatCard title="Refunds & CBs" value={`$${(pool.refunds_amount + pool.chargebacks_amount).toLocaleString()}`} accentColor="#ef4444" />
          <ERPStatCard title="Eligible Revenue" value={`$${pool.eligible_revenue.toLocaleString()}`} accentColor="#10b981" />
          <ERPStatCard title="Team Pool Amount" value={`$${pool.team_pool_amount.toLocaleString()}`} subValue={`${pool.team_share_percentage}% Share`} accentColor="#6366f1" />
        </div>

        <AnimatePresence>
          {showEdit && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-[#111115] border border-white/5 rounded-3xl p-8 mb-8">
                <h3 className="text-base font-bold text-white mb-6">Edit Financials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {[
                    { label: "Gross Revenue", key: "gross_revenue" },
                    { label: "Refunds", key: "refunds_amount" },
                    { label: "Chargebacks", key: "chargebacks_amount" },
                    { label: "Manual Exclusions", key: "manual_exclusions_amount" },
                    { label: "Team Share (%)", key: "team_share_percentage" }
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{field.label}</label>
                      <input
                        type="number"
                        step={field.key === "team_share_percentage" ? "1" : "0.01"}
                        value={editForm[field.key]}
                        onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                        className="w-full bg-[#1a1a20] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={() => handleAction("update", editForm)} disabled={actionLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">Save Changes</button>
                  <button onClick={() => setShowEdit(false)} className="bg-transparent border border-white/10 hover:border-white/20 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-[#111115] border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Generated Payouts</h3>
            <ERPStatusBadge status={pool.status} />
          </div>
          {loadingPayouts ? (
            <div className="p-10 flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : payouts.length === 0 ? (
            <ERPEmptyState icon={<Wallet size={24} />} title="No payouts generated" sub="Click 'Generate Payouts' after locking the pool to distribute funds." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-black/20">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Points</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payouts.map((p) => (
                    <motion.tr whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }} key={p.id} className="transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">User #{p.user_id}</td>
                      <td className="px-6 py-4 text-zinc-400 font-medium">{p.execution_points} <span className="text-zinc-600">/ {p.team_total_points}</span></td>
                      <td className="px-6 py-4 font-bold text-emerald-400">${p.final_payout_amount?.toLocaleString()}</td>
                      <td className="px-6 py-4"><ERPStatusBadge status={p.status} /></td>
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
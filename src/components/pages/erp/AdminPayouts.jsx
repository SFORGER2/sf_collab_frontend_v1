import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { CheckCircle, Clock, AlertCircle, XCircle, Eye, DollarSign, Filter } from "lucide-react";

const api = axios.create({ baseURL: "/api/payout" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const revenuePoolApi = axios.create({ baseURL: "/api/revenue-pool" });
revenuePoolApi.interceptors.request.use(requestInterceptor);
revenuePoolApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const STATUS_META = {
  paid:       { label: "Paid",       color: "#22c55e", bg: "rgba(34,197,94,0.12)",   icon: CheckCircle },
  approved:   { label: "Approved",   color: "#6366f1", bg: "rgba(99,102,241,0.12)",  icon: CheckCircle },
  pending:    { label: "Pending",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  held:       { label: "On Hold",    color: "#9ca3af", bg: "rgba(156,163,175,0.12)", icon: AlertCircle },
  cancelled:  { label: "Cancelled",  color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: XCircle },
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : "—";
const fmtAmount = (v) => `$${Number(v).toLocaleString()}`;

export default function AdminPayouts() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const [payouts, setPayouts] = useState([]);
  const [pools, setPools] = useState([]);
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // { action, payoutId, reason? }

  const loadPools = useCallback(async () => {
    try {
      const res = await revenuePoolApi.get(`/workspaces/${workspaceId}/revenue-pools`);
      const data = res.data?.data || res.data;
      setPools(data.pools || []);
    } catch (err) {
      console.error("Failed to load pools", err);
    }
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
    } finally {
      setLoading(false);
    }
  }, [workspaceId, selectedPoolId]);

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  useEffect(() => {
    loadPayouts();
  }, [loadPayouts]);

  const handleAction = async (payoutId, action, reason = "") => {
    setActionLoading(true);
    try {
      let url = `/workspaces/${workspaceId}/payouts/${payoutId}/${action}`;
      let payload = {};
      if (action === "hold") payload = { reason };
      await api.post(url, payload);
      setModal(null);
      loadPayouts();
    } catch (err) {
      alert(err?.response?.data?.error || `${action} failed`);
    } finally {
      setActionLoading(false);
    }
  };

  const getPoolName = (poolId) => {
    const pool = pools.find(p => p.id === poolId);
    return pool ? `${new Date(pool.period_start).toLocaleDateString()} – ${new Date(pool.period_end).toLocaleDateString()}` : `Pool #${poolId}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Payouts (Admin)</h1>
            <p className="text-zinc-400 mt-1">Manage, approve, hold, or mark payouts as paid</p>
          </div>
        </div>

        {/* Filter by Revenue Pool */}
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-zinc-400" />
            <span className="text-sm font-medium">Filter by pool:</span>
          </div>
          <select
            value={selectedPoolId}
            onChange={(e) => setSelectedPoolId(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm"
          >
            <option value="">All Pools</option>
            {pools.map((pool) => (
              <option key={pool.id} value={pool.id}>
                {new Date(pool.period_start).toLocaleDateString()} – {new Date(pool.period_end).toLocaleDateString()} (ID: {pool.id})
              </option>
            ))}
          </select>
          <button
            onClick={() => setSelectedPoolId("")}
            className="px-3 py-1.5 bg-zinc-700 rounded-lg text-xs hover:bg-zinc-600"
          >
            Clear
          </button>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">{error}</div>}

        {loading ? (
          <div className="text-center py-20">Loading payouts...</div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">No payouts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 border-b border-zinc-800">
                <tr className="text-left text-zinc-400">
                  <th className="p-3">ID</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Revenue Pool</th>
                  <th className="p-3">Points</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => {
                  const meta = STATUS_META[p.status] || STATUS_META.pending;
                  const Icon = meta.icon;
                  return (
                    <tr key={p.id} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                      <td className="p-3">#{p.id}</td>
                      <td className="p-3">User #{p.user_id}</td>
                      <td className="p-3">{getPoolName(p.revenue_pool_id)}</td>
                      <td className="p-3">{p.execution_points} / {p.team_total_points}</td>
                      <td className="p-3">{fmtAmount(p.final_payout_amount)}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold" style={{ background: meta.bg, color: meta.color }}>
                          <Icon size={12} /> {meta.label}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {p.status === "pending" && (
                            <button
                              onClick={() => handleAction(p.id, "approve")}
                              disabled={actionLoading}
                              className="px-3 py-1 bg-green-600 rounded text-xs hover:bg-green-700"
                            >
                              Approve
                            </button>
                          )}
                          {(p.status === "pending" || p.status === "approved") && (
                            <button
                              onClick={() => setModal({ action: "hold", payoutId: p.id })}
                              disabled={actionLoading}
                              className="px-3 py-1 bg-amber-600 rounded text-xs hover:bg-amber-700"
                            >
                              Hold
                            </button>
                          )}
                          {p.status === "approved" && (
                            <button
                              onClick={() => handleAction(p.id, "mark-paid")}
                              disabled={actionLoading}
                              className="px-3 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hold Reason Modal */}
      {modal && modal.action === "hold" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Hold Payout</h2>
            <p className="text-sm text-zinc-400 mb-4">Please provide a reason for holding this payout.</p>
            <textarea
              placeholder="Reason for hold..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm"
              rows="3"
              onChange={(e) => setModal({ ...modal, reason: e.target.value })}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2 bg-zinc-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(modal.payoutId, "hold", modal.reason)}
                disabled={actionLoading}
                className="flex-1 py-2 bg-amber-600 rounded-lg font-semibold disabled:opacity-50"
              >
                Confirm Hold
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
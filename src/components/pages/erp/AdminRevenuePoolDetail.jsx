import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { ArrowLeft, Calculator, Lock, Wallet, Edit3, DollarSign as DollarSignIcon } from "lucide-react";

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
      // Fetch all pools and find the one (inefficient but works without a single GET endpoint)
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
      // Try to fetch payouts filtered by revenue_pool_id – this endpoint may not exist yet.
      // If it fails, just show a message.
      const res = await payoutApi.get(`/workspaces/${workspaceId}/payouts?revenue_pool_id=${poolId}`);
      const data = res.data?.data || res.data;
      setPayouts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Could not fetch payouts for this pool", err);
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
        case "mark-paid":
          endpoint = `/workspaces/${workspaceId}/revenue-pools/${poolId}/mark-paid`;
          break;
        case "generate":
          await payoutApi.post(`/workspaces/${workspaceId}/payouts/generate`, { revenue_pool_id: poolId });
          alert("Payouts generated successfully!");
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
      alert(err?.response?.data?.error || `${action} failed`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = () => {
    handleAction("update", editForm);
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-20">{error}</div>;
  if (!pool) return null;

  const canCalculate = pool.status === "open";
  const canLock = pool.status === "pending_admin_review";
  const canGenerate = pool.status === "locked";
  const canMarkPaid = pool.status === "locked"; // or after generation

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate("/erp/admin/revenue-pools")} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6">
          <ArrowLeft size={18} /> Back to Pools
        </button>

        <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-8 mb-6">
          <div className="flex justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">Revenue Pool #{pool.id}</h1>
              <p className="text-zinc-400 mt-1">{new Date(pool.period_start).toLocaleDateString()} – {new Date(pool.period_end).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {canCalculate && (
                <button onClick={() => handleAction("calculate")} disabled={actionLoading} className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg">
                  <Calculator size={16} /> Calculate
                </button>
              )}
              {canLock && (
                <button onClick={() => handleAction("lock")} disabled={actionLoading} className="flex items-center gap-2 bg-amber-600 px-4 py-2 rounded-lg">
                  <Lock size={16} /> Lock
                </button>
              )}
              {canGenerate && (
                <button onClick={() => handleAction("generate")} disabled={actionLoading} className="flex items-center gap-2 bg-emerald-600 px-4 py-2 rounded-lg">
                  <Wallet size={16} /> Generate Payouts
                </button>
              )}
              {canMarkPaid && (
                <button onClick={() => handleAction("mark-paid")} disabled={actionLoading} className="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded-lg">
                  <DollarSignIcon size={16} /> Mark Paid
                </button>
              )}
              <button onClick={() => setShowEdit(!showEdit)} className="flex items-center gap-2 bg-zinc-700 px-4 py-2 rounded-lg">
                <Edit3 size={16} /> Edit
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <InfoCard label="Gross Revenue" value={`$${pool.gross_revenue.toLocaleString()}`} />
            <InfoCard label="Refunds" value={`$${pool.refunds_amount.toLocaleString()}`} />
            <InfoCard label="Chargebacks" value={`$${pool.chargebacks_amount.toLocaleString()}`} />
            <InfoCard label="Manual Exclusions" value={`$${pool.manual_exclusions_amount.toLocaleString()}`} />
            <InfoCard label="Eligible Revenue" value={`$${pool.eligible_revenue.toLocaleString()}`} />
            <InfoCard label="Team Share" value={`${pool.team_share_percentage}%`} />
            <InfoCard label="Team Pool Amount" value={`$${pool.team_pool_amount.toLocaleString()}`} />
            <InfoCard label="Status" value={pool.status} color="bg-yellow-500/20 text-yellow-400" />
          </div>

          {showEdit && (
            <div className="mt-8 p-6 border-t border-zinc-800">
              <h3 className="text-lg font-semibold mb-4">Edit Financials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400">Gross Revenue</label>
                  <input type="number" step="0.01" value={editForm.gross_revenue} onChange={(e) => setEditForm({ ...editForm, gross_revenue: e.target.value })} className="w-full bg-zinc-800 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400">Refunds</label>
                  <input type="number" step="0.01" value={editForm.refunds_amount} onChange={(e) => setEditForm({ ...editForm, refunds_amount: e.target.value })} className="w-full bg-zinc-800 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400">Chargebacks</label>
                  <input type="number" step="0.01" value={editForm.chargebacks_amount} onChange={(e) => setEditForm({ ...editForm, chargebacks_amount: e.target.value })} className="w-full bg-zinc-800 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400">Manual Exclusions</label>
                  <input type="number" step="0.01" value={editForm.manual_exclusions_amount} onChange={(e) => setEditForm({ ...editForm, manual_exclusions_amount: e.target.value })} className="w-full bg-zinc-800 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400">Team Share (%)</label>
                  <input type="number" step="1" value={editForm.team_share_percentage} onChange={(e) => setEditForm({ ...editForm, team_share_percentage: e.target.value })} className="w-full bg-zinc-800 rounded-lg px-4 py-2" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleUpdate} disabled={actionLoading} className="bg-blue-600 px-6 py-2 rounded-lg">Save Changes</button>
                <button onClick={() => setShowEdit(false)} className="bg-zinc-700 px-6 py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Payouts List for this Pool */}
        <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-xl font-semibold mb-4">Generated Payouts</h2>
          {loadingPayouts ? (
            <div className="text-center py-8">Loading payouts...</div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              No payouts generated yet. Click "Generate Payouts" after locking the pool.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="text-left py-2">User ID</th>
                    <th className="text-left">Points</th>
                    <th className="text-left">Amount</th>
                    <th className="text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b border-zinc-800">
                      <td className="py-2">User #{p.user_id}</td>
                      <td>{p.execution_points} / {p.team_total_points}</td>
                      <td>${p.final_payout_amount?.toLocaleString()}</td>
                      <td className="capitalize">{p.status}</td>
                    </tr>
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

function InfoCard({ label, value, color }) {
  return (
    <div className="bg-zinc-900/50 rounded-xl p-4">
      <p className="text-xs text-zinc-500 uppercase">{label}</p>
      <p className={`text-xl font-semibold mt-1 ${color || "text-white"}`}>{value}</p>
    </div>
  );
}
// src/components/pages/erp/AdminRevenuePools.jsx
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { Plus, Eye, Calendar, DollarSign, X } from "lucide-react";

const api = axios.create({ baseURL: "/api/revenue-pool" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export default function AdminRevenuePools() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const navigate = useNavigate();
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    period_start: "",
    period_end: "",
    gross_revenue: 0,
    refunds: 0,
    chargebacks: 0,
    manual_exclusions: 0,
    team_share_percentage: 40,
  });
  const [submitting, setSubmitting] = useState(false);

  const loadPools = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/workspaces/${workspaceId}/revenue-pools`);
      const data = res.data?.data || res.data;
      setPools(data.pools || []);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load revenue pools");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.period_start || !form.period_end) {
      alert("Period start and end are required");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/workspaces/${workspaceId}/revenue-pools`, {
        period_start: form.period_start,
        period_end: form.period_end,
        gross_revenue: parseFloat(form.gross_revenue),
        refunds: parseFloat(form.refunds),
        chargebacks: parseFloat(form.chargebacks),
        manual_exclusions: parseFloat(form.manual_exclusions),
        team_share_percentage: parseFloat(form.team_share_percentage),
      });
      setShowCreateModal(false);
      setForm({
        period_start: "",
        period_end: "",
        gross_revenue: 0,
        refunds: 0,
        chargebacks: 0,
        manual_exclusions: 0,
        team_share_percentage: 40,
      });
      loadPools();
    } catch (err) {
      alert(err?.response?.data?.error || "Creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = {
    open: "#22c55e",
    calculating: "#f59e0b",
    pending_admin_review: "#6366f1",
    locked: "#ef4444",
    paid: "#6b7280",
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showCreateModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showCreateModal]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Revenue Pools</h1>
            <p className="text-zinc-400 mt-1">Manage workspace revenue share periods</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
          >
            <Plus size={18} /> New Pool
          </button>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">{error}</div>}

        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : pools.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">No revenue pools yet. Create your first pool.</div>
        ) : (
          <div className="grid gap-4">
            {pools.map((pool) => (
              <div
                key={pool.id}
                className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition-colors cursor-pointer"
                onClick={() => navigate(`/erp/admin/revenue-pools/${pool.id}`)}
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar size={18} className="text-zinc-400" />
                      <span className="text-sm font-medium">
                        {new Date(pool.period_start).toLocaleDateString()} – {new Date(pool.period_end).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} className="text-emerald-400" />
                        <span className="text-lg font-semibold">${pool.team_pool_amount.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-zinc-500">Team pool ({(pool.team_share_percentage)}%)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: `${statusColor[pool.status]}20`, color: statusColor[pool.status] }}
                    >
                      {pool.status}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/erp/admin/revenue-pools/${pool.id}`); }}
                      className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Improved Modal – centered, with scroll lock, high z-index */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create Revenue Pool</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Period Start</label>
                <input
                  type="date"
                  value={form.period_start}
                  onChange={(e) => setForm({ ...form, period_start: e.target.value })}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Period End</label>
                <input
                  type="date"
                  value={form.period_end}
                  onChange={(e) => setForm({ ...form, period_end: e.target.value })}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Gross Revenue ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.gross_revenue}
                  onChange={(e) => setForm({ ...form, gross_revenue: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Refunds ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.refunds}
                  onChange={(e) => setForm({ ...form, refunds: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Chargebacks ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.chargebacks}
                  onChange={(e) => setForm({ ...form, chargebacks: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Manual Exclusions ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.manual_exclusions}
                  onChange={(e) => setForm({ ...form, manual_exclusions: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Team Share (%)</label>
                <input
                  type="number"
                  step="1"
                  value={form.team_share_percentage}
                  onChange={(e) => setForm({ ...form, team_share_percentage: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2 bg-zinc-700 rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2 bg-blue-600 rounded-lg font-semibold disabled:opacity-50">
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
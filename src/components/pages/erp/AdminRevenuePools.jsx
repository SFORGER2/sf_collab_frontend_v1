// src/components/pages/erp/AdminRevenuePools.jsx
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../utils/APIs/interceptors";
import { Plus, Eye, Calendar, DollarSign } from "lucide-react";

// ── Shared UI components ──
import {
  PageHeader,
  GlassCard,
  Badge,
  Button,
  Spinner,
  EmptyState,
  Modal,
} from "@/components/erp/ui";

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

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadPools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/workspaces/${workspaceId}/revenue-pools`);
      const data = res.data?.data || res.data;
      setPools(data.pools || []);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load revenue pools");
      setPools([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  // ── Create pool ──────────────────────────────────────────────────────────
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

  // ── Helpers ──────────────────────────────────────────────────────────────
  const statusColorMap = {
    open: "green",
    calculating: "yellow",
    pending_admin_review: "blue",
    locked: "red",
    paid: "gray",
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Revenue Pools"
          subtitle="Manage workspace revenue share periods"
          actions={
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus size={18} className="mr-2" /> New Pool
            </Button>
          }
        />

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : pools.length === 0 ? (
          <EmptyState
            icon={<DollarSign className="w-12 h-12 text-zinc-600" />}
            title="No revenue pools"
            description="Create your first pool to start tracking revenue share."
            action={
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus size={18} className="mr-2" /> Create Pool
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4">
            {pools.map((pool) => (
              <GlassCard
                key={pool.id}
                className="hover:border-zinc-600 transition-colors cursor-pointer p-6"
                onClick={() => navigate(`/erp/admin/revenue-pools/${pool.id}`)}
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar size={18} className="text-zinc-400" />
                      <span className="text-sm font-medium">
                        {new Date(pool.period_start).toLocaleDateString()} –{" "}
                        {new Date(pool.period_end).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} className="text-emerald-400" />
                        <span className="text-lg font-semibold">
                          ${pool.team_pool_amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500">
                        Team pool ({(pool.team_share_percentage)}%)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color={statusColorMap[pool.status] || "gray"}>
                      {pool.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/erp/admin/revenue-pools/${pool.id}`);
                      }}
                    >
                      <Eye size={16} />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Revenue Pool"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Period Start
            </label>
            <input
              type="date"
              value={form.period_start}
              onChange={(e) =>
                setForm({ ...form, period_start: e.target.value })
              }
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Period End
            </label>
            <input
              type="date"
              value={form.period_end}
              onChange={(e) =>
                setForm({ ...form, period_end: e.target.value })
              }
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Gross Revenue ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.gross_revenue}
              onChange={(e) =>
                setForm({ ...form, gross_revenue: e.target.value })
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Refunds ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.refunds}
              onChange={(e) =>
                setForm({ ...form, refunds: e.target.value })
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Chargebacks ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.chargebacks}
              onChange={(e) =>
                setForm({ ...form, chargebacks: e.target.value })
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Manual Exclusions ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.manual_exclusions}
              onChange={(e) =>
                setForm({ ...form, manual_exclusions: e.target.value })
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Team Share (%)
            </label>
            <input
              type="number"
              step="1"
              value={form.team_share_percentage}
              onChange={(e) =>
                setForm({ ...form, team_share_percentage: e.target.value })
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
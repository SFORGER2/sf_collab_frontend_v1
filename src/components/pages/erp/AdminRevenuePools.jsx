// src/components/pages/erp/AdminRevenuePools.jsx — REDESIGNED
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Plus,
  Eye,
  Calendar,
  X,
  TrendingUp,
  Lock,
  Clock,
  CheckCircle2,
  BarChart2,
  ArrowUpRight,
} from "lucide-react";

import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPStatusBadge } from "../../erp/shared/ERPStatusBadge";
import { ERPEmptyState } from "../../erp/shared/ERPEmptyState";
import { ERPSpinner } from "../../erp/shared/ERPLoadingSkeleton";
import { ERPBanner } from "../../erp/shared/ERPBanner";

const api = axios.create({ baseURL: "/api/revenue-pool" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const fmt$ = (v) => (v != null ? `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—");

const STATUS_ICONS = {
  open: <Clock size={13} />,
  calculating: <BarChart2 size={13} />,
  pending_admin_review: <Eye size={13} />,
  locked: <Lock size={13} />,
  paid: <CheckCircle2 size={13} />,
};

export default function AdminRevenuePools() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const navigate = useNavigate();

  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    period_start: "",
    period_end: "",
    gross_revenue: 0,
    refunds: 0,
    chargebacks: 0,
    manual_exclusions: 0,
    team_share_percentage: 40,
  });

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

  useEffect(() => { loadPools(); }, [loadPools]);

  // ── Create pool ──────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.period_start || !form.period_end) return;
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
      setShowModal(false);
      setForm({ period_start: "", period_end: "", gross_revenue: 0, refunds: 0, chargebacks: 0, manual_exclusions: 0, team_share_percentage: 40 });
      loadPools();
    } catch (err) {
      setError(err?.response?.data?.error || "Creation failed");
    } finally { setSubmitting(false); }
  };

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  // Summary metrics
  const totalPool = pools.reduce((sum, p) => sum + (p.team_pool_amount || 0), 0);
  const openPools = pools.filter(p => p.status === "open").length;
  const paidPools = pools.filter(p => p.status === "paid").length;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <ERPPageHeader
          icon={<DollarSign size={20} />}
          title="Revenue Pools"
          description="Manage workspace revenue share periods and team payouts"
          breadcrumbs={[{ label: "ERP" }, { label: "Admin" }, { label: "Revenue Pools" }]}
          actions={
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)", color: "#fff" }}
            >
              <Plus size={15} />
              New Pool
            </motion.button>
          }
        />

        <AnimatePresence>
          {error && <ERPBanner message={error} type="error" onDismiss={() => setError(null)} />}
        </AnimatePresence>

        {/* Summary KPIs */}
        {!loading && pools.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Team Pool", value: fmt$(totalPool), accent: "#10b981", icon: <TrendingUp size={15} /> },
              { label: "Open Pools", value: openPools, accent: "#6366f1", icon: <Clock size={15} /> },
              { label: "Paid Out", value: paidPools, accent: "#f59e0b", icon: <CheckCircle2 size={15} /> },
              { label: "Total Pools", value: pools.length, accent: "#06b6d4", icon: <BarChart2 size={15} /> },
            ].map((kpi) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                whileHover={{ translateY: -2 }}
                className="relative overflow-hidden p-5 rounded-2xl group"
                style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)", borderTop: `2px solid ${kpi.accent}` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at top left, ${kpi.accent}08, transparent 70%)` }} />
                <div className="relative flex items-start justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{kpi.label}</p>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${kpi.accent}18`, color: kpi.accent }}>
                    {kpi.icon}
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight" style={{ color: kpi.accent }}>{kpi.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pool list */}
        {loading ? (
          <ERPSpinner label="Loading pools…" />
        ) : pools.length === 0 ? (
          <ERPEmptyState
            icon={<DollarSign size={28} />}
            title="No revenue pools yet"
            sub="Create your first revenue pool to start tracking team earnings."
            action={
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white">
                <Plus size={14} /> Create First Pool
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {pools.map((pool, i) => (
              <motion.div
                key={pool.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ translateY: -1 }}
                onClick={() => navigate(`/erp/admin/revenue-pools/${pool.id}`)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 rounded-2xl cursor-pointer transition-all group"
                style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {/* Left */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    {STATUS_ICONS[pool.status] || <DollarSign size={14} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                        <Calendar size={11} />
                        {new Date(pool.period_start).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        {" — "}
                        {new Date(pool.period_end).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-white">{fmt$(pool.team_pool_amount)}</span>
                      <span className="text-xs text-zinc-500">Team pool ({pool.team_share_percentage}%)</span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3 sm:ml-auto">
                  <ERPStatusBadge status={pool.status} />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/erp/admin/revenue-pools/${pool.id}`); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <ArrowUpRight size={14} />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Create Pool Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-xl p-6"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
              style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center justify-between px-6 py-5 sticky top-0 z-10 rounded-t-2xl" style={{ background: "#111115", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <DollarSign size={15} className="text-indigo-400" />
                  </div>
                  <h2 className="text-base font-bold text-white">Create Revenue Pool</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="px-6 py-6 space-y-4">
                {[
                  { label: "Period Start", key: "period_start", type: "date" },
                  { label: "Period End",   key: "period_end",   type: "date" },
                  { label: "Gross Revenue ($)", key: "gross_revenue", type: "number", step: "0.01" },
                  { label: "Refunds ($)",       key: "refunds",       type: "number", step: "0.01" },
                  { label: "Chargebacks ($)",   key: "chargebacks",   type: "number", step: "0.01" },
                  { label: "Manual Exclusions ($)", key: "manual_exclusions", type: "number", step: "0.01" },
                  { label: "Team Share (%)", key: "team_share_percentage", type: "number", step: "1" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">{f.label}</label>
                    <input
                      type={f.type}
                      step={f.step}
                      value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      required={f.key === "period_start" || f.key === "period_end"}
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                      style={{ background: "#1a1a20", border: "1px solid rgba(255,255,255,0.07)", color: "#e5e7eb" }}
                    />
                  </div>
                ))}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-400 transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting ? "Creating…" : "Create Pool"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
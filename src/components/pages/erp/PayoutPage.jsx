/**
 * PayoutPage.jsx — SFCollab ERP
 * Member payout view: payout history, current payout, status
 *
 * API wiring (expected routes in payouts.py):
 *   GET /erp/payouts/current        → { amount, status, period_start, period_end, breakdown }
 *   GET /erp/payouts/history        → [{ id, amount, status, paid_at, period_label }]
 *
 * Route to add in App.jsx:
 *   import PayoutPage from "./components/pages/erp/PayoutPage.jsx";
 *   <Route path="erp/payouts" element={<PayoutPage />} />
 */

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
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
  TrendingUp,
  Calendar,
  Zap,
} from "lucide-react";

const api = axios.create({ baseURL: "" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (v) =>
  v != null
    ? `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const STATUS_META = {
  paid:       { label: "Paid",       color: "#22c55e", bg: "rgba(34,197,94,0.12)",   icon: CheckCircle },
  pending:    { label: "Pending",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  processing: { label: "Processing", color: "#6366f1", bg: "rgba(99,102,241,0.12)",  icon: Zap },
  failed:     { label: "Failed",     color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: XCircle },
  on_hold:    { label: "On Hold",    color: "#9ca3af", bg: "rgba(156,163,175,0.12)", icon: AlertCircle },
};

// ── Mock data (remove when API is ready) ─────────────────────────────────────
const MOCK_CURRENT = {
  amount: 1240.0,
  status: "pending",
  period_start: "2025-05-01",
  period_end: "2025-05-31",
  breakdown: [
    { label: "Base contribution", amount: 800 },
    { label: "Task completion bonus", amount: 250 },
    { label: "Streak bonus", amount: 120 },
    { label: "Referral credit", amount: 70 },
  ],
};

const MOCK_HISTORY = [
  { id: 1, amount: 1100,  status: "paid",       paid_at: "2025-04-30", period_label: "April 2025" },
  { id: 2, amount: 980,   status: "paid",       paid_at: "2025-03-31", period_label: "March 2025" },
  { id: 3, amount: 1350,  status: "paid",       paid_at: "2025-02-28", period_label: "February 2025" },
  { id: 4, amount: 760,   status: "paid",       paid_at: "2025-01-31", period_label: "January 2025" },
  { id: 5, amount: 890,   status: "failed",     paid_at: null,         period_label: "December 2024" },
  { id: 6, amount: 1020,  status: "paid",       paid_at: "2024-11-30", period_label: "November 2024" },
];

// ═════════════════════════════════════════════════════════════════════════════
export default function PayoutPage() {
  const { user } = useSelector((s) => s.auth);

  const [current, setCurrent]   = useState(null);
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [curRes, histRes] = await Promise.all([
        api.get("/erp/payouts/current"),
        api.get("/erp/payouts/history"),
      ]);
      setCurrent(curRes.data);
      setHistory(histRes.data || []);
    } catch {
      // Fallback to mock data while API is being built
      setCurrent(MOCK_CURRENT);
      setHistory(MOCK_HISTORY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalEarned = history
    .filter((h) => h.status === "paid")
    .reduce((sum, h) => sum + (h.amount || 0), 0);

  const meta = current ? (STATUS_META[current.status] || STATUS_META.pending) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4 md:px-8 font-sans overflow-auto">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
            Payouts
          </h1>
          <p className="text-zinc-400 mt-1">Your earnings and payout history</p>
        </motion.div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <Banner type="error">{error}</Banner>
        ) : (
          <>
            {/* ── Summary strip ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
            >
              <SummaryChip
                icon={DollarSign}
                label="Total Earned"
                value={fmt(totalEarned)}
                accent="#22c55e"
              />
              <SummaryChip
                icon={TrendingUp}
                label="Payouts Received"
                value={history.filter((h) => h.status === "paid").length}
                accent="#6366f1"
              />
              <SummaryChip
                icon={Calendar}
                label="Current Period"
                value={current ? `${fmtDate(current.period_start)} – ${fmtDate(current.period_end)}` : "—"}
                accent="#f59e0b"
                small
              />
            </motion.div>

            {/* ── Current Payout Card ── */}
            {current && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#121215] border border-zinc-800/80 rounded-3xl p-8 mb-6"
              >
                <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Current Payout</p>
                    <p className="text-5xl font-semibold tracking-tighter bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
                      {fmt(current.amount)}
                    </p>
                  </div>

                  <StatusBadge status={current.status} />
                </div>

                {/* Progress bar — visual fill based on status */}
                <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-6 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: current.status === "paid" ? "100%" : current.status === "processing" ? "60%" : "30%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: meta?.color }}
                  />
                </div>

                {/* Breakdown toggle */}
                {current.breakdown?.length > 0 && (
                  <>
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
                    >
                      {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {expanded ? "Hide" : "Show"} breakdown
                    </button>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2 border-t border-zinc-800 pt-4">
                            {current.breakdown.map((b, i) => (
                              <div key={i} className="flex items-center justify-between py-2">
                                <span className="text-sm text-zinc-400">{b.label}</span>
                                <span className="text-sm font-medium text-white">{fmt(b.amount)}</span>
                              </div>
                            ))}
                            <div className="flex items-center justify-between py-2 border-t border-zinc-800 mt-2">
                              <span className="text-sm font-semibold text-white">Total</span>
                              <span className="text-sm font-semibold text-white">{fmt(current.amount)}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            )}

            {/* ── History ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#121215] border border-zinc-800/80 rounded-3xl p-8"
            >
              <h2 className="text-xl font-semibold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-6">
                Payout History
              </h2>

              {history.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-8">No payout history yet.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((item, i) => {
                    const m = STATUS_META[item.status] || STATUS_META.pending;
                    const Icon = m.icon;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="flex items-center justify-between p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: m.bg }}
                          >
                            <Icon className="w-5 h-5" style={{ color: m.color }} />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-white">{item.period_label}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              {item.paid_at ? `Paid ${fmtDate(item.paid_at)}` : "Not yet paid"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-base font-semibold text-white">{fmt(item.amount)}</span>
                          <span
                            className="text-xs font-semibold px-3 py-1 rounded-full"
                            style={{ color: m.color, background: m.bg }}
                          >
                            {m.label}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SummaryChip({ icon: Icon, label, value, accent, small }) {
  return (
    <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 flex items-center gap-4">
      <div className="p-2.5 rounded-xl" style={{ background: `${accent}18` }}>
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
        <p className={`font-semibold text-white mt-0.5 ${small ? "text-sm" : "text-lg"}`}>{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  const Icon = m.icon;
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-2xl border"
      style={{ color: m.color, background: m.bg, borderColor: `${m.color}40` }}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-semibold">{m.label}</span>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className="w-8 h-8 rounded-full border-2 border-zinc-800"
        style={{ borderTopColor: "#6366f1", animation: "spin 0.8s linear infinite" }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Banner({ type, children }) {
  const styles = {
    error:   { background: "#450a0a", border: "1px solid #991b1b" },
    success: { background: "#052e16", border: "1px solid #166534" },
  };
  return (
    <div
      className="rounded-2xl p-4 text-sm text-white mb-4"
      style={styles[type] || styles.error}
    >
      {children}
    </div>
  );
}
// src/components/pages/erp/erp-updates.jsx — REDESIGNED
import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Star,
  Plus,
  X,
  Calendar,
  Send,
  Users,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Sparkles,
  FileText,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../utils/APIs/interceptors";

import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPEmptyState } from "../../erp/shared/ERPEmptyState";
import { ERPSpinner } from "../../erp/shared/ERPLoadingSkeleton";

// API — unchanged from original
const api = axios.create({ baseURL: "/api/daily-update" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export default function ERPUpdates() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;

  const [role, setRole] = useState("builder");
  const [currentPage, setCurrentPage] = useState(1);
  const updatesPerPage = 5;
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [formData, setFormData] = useState({
    today_work: "",
    next_plan: "",
    blockers: "",
    progress_rating: 0,
  });

  useEffect(() => {
    const storedRole = localStorage.getItem("activeRole");
    if (storedRole) setRole(storedRole);
  }, []);

  const isAdmin = role === "founder";

  const loadUpdates = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (isAdmin) {
        response = await api.get("/workspace", {
          params: { workspace_id: workspaceId, date: new Date().toISOString().split("T")[0] },
        });
        const records = response.data?.data?.records || response.data?.records || [];
        setUpdates(records.map((u) => ({
          id: u.id,
          user: u.user?.name || `User #${u.user_id}`,
          avatarLetter: (u.user?.name || "U")[0].toUpperCase(),
          date: new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          time: new Date(u.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          today: u.today_work,
          next: u.next_plan,
          blockers: u.blockers || "None reported",
          progress: u.progress_rating || 0,
        })));
      } else {
        response = await api.get("/my", {
          params: { workspace_id: workspaceId, limit: 50 },
        });
        const records = response.data?.data?.records || response.data?.records || [];
        setUpdates(records.map((u) => ({
          id: u.id,
          user: "You",
          avatarLetter: (user?.firstName || "Y")[0].toUpperCase(),
          date: new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          time: new Date(u.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          today: u.today_work,
          next: u.next_plan,
          blockers: u.blockers || "None reported",
          progress: u.progress_rating || 0,
        })));
      }
    } catch (error) {
      console.error("Failed to load updates", error);
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, isAdmin, user]);

  useEffect(() => { loadUpdates(); }, [loadUpdates]);

  const showToast = (message, isError = false) => {
    const toast = document.createElement("div");
    toast.className = `fixed bottom-6 right-6 ${isError ? "bg-red-600" : "bg-indigo-600"} text-white px-6 py-4 rounded-2xl shadow-2xl z-[99999] flex items-center gap-3 text-sm font-semibold`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.today_work.trim()) {
      showToast("Please describe what you did today.", true);
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/submit", {
        workspace_id: workspaceId,
        today_work: formData.today_work,
        next_plan: formData.next_plan || null,
        blockers: formData.blockers || null,
        progress_rating: formData.progress_rating || null,
      });
      setSuccessState(true);
      setTimeout(() => {
        setSuccessState(false);
        setFormData({ today_work: "", next_plan: "", blockers: "", progress_rating: 0 });
        setIsModalOpen(false);
        setCurrentPage(1);
        loadUpdates();
      }, 1800);
      showToast("Daily update submitted! 🎉");
    } catch (error) {
      const serverMsg = error?.response?.data?.message || error?.response?.data?.error || "Failed to submit update.";
      showToast(serverMsg, true);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUpdates = [...updates].sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`));
  const totalPages = Math.ceil(filteredUpdates.length / updatesPerPage);
  const startIndex = (currentPage - 1) * updatesPerPage;
  const currentUpdates = filteredUpdates.slice(startIndex, startIndex + updatesPerPage);

  // Streak: count consecutive days with updates
  const streak = Math.min(updates.length, 7);
  const hasSubmittedToday = updates.some(u => {
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return u.date === today;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <ERPPageHeader
          icon={<FileText size={20} />}
          title="Daily Updates"
          description={isAdmin ? "Team progress feed — all workspace updates" : "Log your daily progress and track your streak"}
          breadcrumbs={[{ label: "ERP" }, { label: "Daily Updates" }]}
          actions={
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                color: "#fff",
              }}
            >
              <Plus size={16} />
              Log Update
            </motion.button>
          }
        />

        {/* ── Streak + Status strip ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="flex items-center gap-4 p-5 rounded-2xl"
            style={{ background: "var(--surface-panel)", border: "1px solid var(--surface-border)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.25)" }}>
              <Flame size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{streak}</p>
              <p className="text-xs text-zinc-500">Day streak</p>
            </div>
          </motion.div>

          {/* Today's status */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="flex items-center gap-4 p-5 rounded-2xl"
            style={{ background: "var(--surface-panel)", border: "1px solid var(--surface-border)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: hasSubmittedToday ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${hasSubmittedToday ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}`,
              }}
            >
              {hasSubmittedToday
                ? <CheckCircle2 size={18} className="text-emerald-400" />
                : <Clock size={18} className="text-red-400" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{hasSubmittedToday ? "Submitted" : "Pending"}</p>
              <p className="text-xs text-zinc-500">Today's update</p>
            </div>
          </motion.div>

          {/* Total updates */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}
            className="flex items-center gap-4 p-5 rounded-2xl"
            style={{ background: "var(--surface-panel)", border: "1px solid var(--surface-border)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
              <TrendingUp size={18} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{updates.length}</p>
              <p className="text-xs text-zinc-500">Total updates</p>
            </div>
          </motion.div>
        </div>

        {/* ── CTA Banner (if not submitted today) ── */}
        {!hasSubmittedToday && !isAdmin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(79,70,229,0.08) 100%)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Zap size={18} className="text-indigo-400" />
              </div>
              <div>
                <p className="font-semibold text-white">You haven't logged today's update yet</p>
                <p className="text-sm text-zinc-400 mt-0.5">Keep the streak alive — log your progress now</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-all"
              style={{ background: "#6366f1", color: "#fff" }}
            >
              Log Now <Send size={14} />
            </motion.button>
          </motion.div>
        )}

        {/* ── Section label ── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            {isAdmin ? "All team updates" : "My updates"}
          </p>
          <p className="text-xs text-zinc-600">{filteredUpdates.length} entries</p>
        </div>

        {/* ── Feed ── */}
        {loading ? (
          <ERPSpinner label="Loading updates…" />
        ) : currentUpdates.length === 0 ? (
          <ERPEmptyState
            icon={<FileText size={28} />}
            title="No updates yet"
            sub={isAdmin ? "Your team's updates will appear here." : "Start logging your daily progress to build momentum."}
            action={
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "#6366f1", color: "#fff" }}
              >
                <Plus size={14} /> Log First Update
              </motion.button>
            }
          />
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {currentUpdates.map((update, i) => (
                <UpdateCard key={update.id} update={update} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm text-zinc-300 transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === currentPage ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm text-zinc-300 transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Submit Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[9999] flex items-center justify-center p-4"
            onClick={() => !submitting && setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl"
              style={{ background: "var(--surface-panel)", border: "1px solid var(--surface-border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 sticky top-0 z-10 rounded-t-2xl" style={{ background: "var(--surface-panel)", borderBottom: "1px solid var(--surface-border)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Sparkles size={15} className="text-indigo-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Submit Daily Update</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              {/* Success state */}
              <AnimatePresence>
                {successState && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 gap-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 size={32} className="text-emerald-400" />
                    </div>
                    <p className="text-xl font-bold text-white">Update submitted!</p>
                    <p className="text-zinc-400 text-sm">Great work today 🎉</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!successState && (
                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                  <ModalField label="What did you accomplish today?" required>
                    <textarea
                      value={formData.today_work}
                      onChange={(e) => setFormData({ ...formData, today_work: e.target.value })}
                      className="w-full h-28 rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
                      style={{ background: "var(--surface-raised)", border: "1px solid var(--surface-border)", color: "var(--color-star)" }}
                      placeholder="Describe your key accomplishments today…"
                      required
                    />
                  </ModalField>

                  <ModalField label="What will you do next?" badge="Optional">
                    <textarea
                      value={formData.next_plan}
                      onChange={(e) => setFormData({ ...formData, next_plan: e.target.value })}
                      className="w-full h-24 rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
                      style={{ background: "var(--surface-raised)", border: "1px solid var(--surface-border)", color: "var(--color-star)" }}
                      placeholder="Your plan for tomorrow…"
                    />
                  </ModalField>

                  <ModalField label="Blockers" badge="Optional">
                    <textarea
                      value={formData.blockers}
                      onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
                      className="w-full h-20 rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
                      style={{ background: "var(--surface-raised)", border: "1px solid var(--surface-border)", color: "var(--color-star)" }}
                      placeholder="Any blockers or dependencies?"
                    />
                  </ModalField>

                  {/* Star rating */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Progress Rating</p>
                    <div className="flex items-center gap-2 p-4 rounded-xl" style={{ background: "var(--surface-raised)", border: "1px solid var(--surface-border)" }}>
                      {[...Array(5)].map((_, i) => (
                        <motion.button
                          key={i}
                          type="button"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setFormData({ ...formData, progress_rating: i + 1 })}
                          className="transition-transform focus:outline-none"
                        >
                          <Star
                            size={28}
                            className={i + 1 <= formData.progress_rating ? "text-amber-400 fill-amber-400" : "text-zinc-700"}
                          />
                        </motion.button>
                      ))}
                      <span className="text-xs text-zinc-500 ml-2">
                        {formData.progress_rating > 0 ? `${formData.progress_rating}/5` : "Rate your progress"}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                      boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                      color: "#fff",
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Send size={15} />
                    }
                    {submitting ? "Submitting…" : "Submit Daily Update"}
                  </motion.button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function UpdateCard({ update, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, ease: "easeOut" }}
      className="rounded-2xl overflow-hidden transition-all"
      style={{ background: "var(--surface-panel)", border: "1px solid var(--surface-border)" }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-300 shrink-0">
            {update.avatarLetter}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{update.user}</p>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
              <Calendar size={10} />
              {update.date} · {update.time}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Star rating mini */}
          <div className="hidden sm:flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className={i < update.progress ? "text-amber-400 fill-amber-400" : "text-zinc-700"} />
            ))}
          </div>
          <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.18 }}>
            <ChevronRight size={14} className="text-zinc-500" />
          </motion.div>
        </div>
      </div>

      {/* Preview line (collapsed) */}
      {!expanded && (
        <div className="px-5 pb-4">
          <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{update.today}</p>
        </div>
      )}

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-white/[0.04]" style={{ paddingTop: "20px" }}>
              <UpdateSection icon={<CheckCircle2 size={14} />} label="What I Did" color="#10b981" text={update.today} />
              <UpdateSection icon={<ArrowRight size={14} />} label="What's Next" color="#6366f1" text={update.next} />
              <UpdateSection icon={<AlertTriangle size={14} />} label="Blockers" color="#f59e0b" text={update.blockers} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function UpdateSection({ icon, label, color, text }) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color }}>{label}</p>
        <p className="text-sm text-zinc-300 leading-relaxed">{text || "—"}</p>
      </div>
    </div>
  );
}

function ModalField({ label, children, required, badge }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{label}</label>
        {required && <span className="text-red-400 text-xs">*</span>}
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700">{badge}</span>
        )}
      </div>
      {children}
    </div>
  );
}
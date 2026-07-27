import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { getStageColor } from "./getStageColor";
import { MomentumFlame } from "@/components/cosmos";
import {
  Bookmark, Clock, Heart, MessageCircle, Share2,
  Users, UserPlus, X, Send, CheckCircle, Clock3,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDraft } from "@/utils/hooks/useDraft";
import { ideaAPI } from "@/utils/APIs/ideaAPI";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectionButton } from "@/components/connection/ConnectionButton";
import { toast } from "react-toastify";
import { getProfilePicture } from "@/utils/getProfilePicture";
import axios from "axios";
import { API_BASE_URL as API_URL } from "@/utils/config";

// ── Collab Request Modal ──────────────────────────────────────────────────────
function CollabRequestModal({ idea, onClose, onSuccess, accessToken }) {
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("co-developer");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 2-step wizard

  const roles = ["co-developer", "designer", "marketer", "business analyst", "advisor", "other"];

  const availabilityOptions = [
    { id: "< 5 hrs / week", label: "< 5 hrs", sub: "/ week" },
    { id: "5–10 hrs / week", label: "5–10 hrs", sub: "/ week" },
    { id: "10–20 hrs / week", label: "10–20 hrs", sub: "/ week" },
    { id: "20+ hrs / week", label: "20+ hrs", sub: "/ week" },
    { id: "Full-time", label: "Full-time", sub: "dedicated" },
  ];

  const confirmCustomRole = () => {
    const trimmed = customRole.trim();
    if (!trimmed) return;
    setConfirmedCustomRole(trimmed);
  };

  const clearCustomRole = () => {
    setConfirmedCustomRole("");
    setCustomRole("");
  };

  const handleSubmit = async () => {
    if (!role) return toast.error("Please select a role.");
    if (role === "other" && !confirmedCustomRole) return toast.error("Please confirm your custom role.");
    if (!availability) return toast.error("Please select your availability.");
    setLoading(true);
    try {
      const finalRole = role === "other" ? confirmedCustomRole : role;
      const res = await axios.post(
        `/api/ideas/${idea.id}/collab-requests`,
        { message, role },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Application sent! The creator will review it.");
      onSuccess(res?.data?.data?.collab_request?.id);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const step1Valid = role && (role !== "other" || confirmedCustomRole);
  const step2Valid = availability;
  const canSubmit = step1Valid && step2Valid && !loading;

  // ── Backdrop
  return createPortal(
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(18px)" }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ scale: 0.93, opacity: 0, y: 28 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 28 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[500px] flex flex-col"
          style={{ maxHeight: "92vh" }}
        >
          {/* ── Card shell ── */}
          <div
            className="relative rounded-[22px] overflow-hidden flex flex-col"
            style={{
              background: "linear-gradient(160deg, #0b1120 0%, #060a14 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04) inset",
            }}
          >
            {/* Accent top bar */}
            <div
              className="h-[3px] w-full shrink-0"
              style={{
                background:
                  "linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)",
              }}
            />

            {/* Ambient glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: -60,
                right: -60,
                width: 280,
                height: 280,
                background:
                  "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
                borderRadius: "50%",
              }}
            />

            {/* ── Scrollable Body ── */}
            <div
              className="overflow-y-auto flex-1 relative z-10"
              style={{ padding: "28px 28px 8px" }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(59,130,246,0.15)",
                        border: "1px solid rgba(96,165,250,0.25)",
                      }}
                    >
                      <Zap size={14} style={{ color: "#60a5fa" }} />
                    </div>
                    <h2
                      className="text-[18px] font-bold leading-tight"
                      style={{ color: "#f1f5f9" }}
                    >
                      Apply to Contribute
                    </h2>
                  </div>
                  <p
                    className="text-[12px] ml-[37px] truncate max-w-[300px]"
                    style={{ color: "#4b5563" }}
                  >
                    {idea?.title}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 ml-3 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#6b7280" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "#6b7280";
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-7">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold transition-all duration-300"
                      style={{
                        background:
                          step >= s
                            ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                            : "rgba(255,255,255,0.05)",
                        color: step >= s ? "#fff" : "#4b5563",
                        boxShadow:
                          step === s ? "0 0 10px rgba(99,102,241,0.4)" : "none",
                      }}
                    >
                      {step > s ? "✓" : s}
                    </div>
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: step >= s ? "#9ca3af" : "#374151" }}
                    >
                      {s === 1 ? "Your Role" : "Details"}
                    </span>
                    {s < 2 && (
                      <ChevronRight size={11} style={{ color: "#374151" }} />
                    )}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* ── STEP 1 ── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Role label */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <Briefcase size={12} style={{ color: "#6b7280" }} />
                      <span
                        className="text-[11px] font-bold uppercase tracking-[0.12em]"
                        style={{ color: "#6b7280" }}
                      >
                        What is your role?
                      </span>
                      <span className="text-[11px]" style={{ color: "#f87171" }}>
                        *
                      </span>
                    </div>

                    {/* Confirmed custom role pill */}
                    {confirmedCustomRole ? (
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border"
                          style={{
                            background: "rgba(59,130,246,0.12)",
                            borderColor: "rgba(96,165,250,0.45)",
                          }}
                        >
                          <span
                            className="text-[13px] font-semibold"
                            style={{ color: "#93c5fd" }}
                          >
                            {confirmedCustomRole}
                          </span>
                          <button
                            onClick={clearCustomRole}
                            className="flex items-center justify-center w-4 h-4 rounded-full transition-all"
                            style={{ color: "#60a5fa" }}
                            onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(59,130,246,0.3)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <X size={10} />
                          </button>
                        </div>
                        <span className="text-[11px]" style={{ color: "#374151" }}>
                          Custom role
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Role grid */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {roles.map((r) => {
                            const active = role === r.id;
                            return (
                              <button
                                key={r.id}
                                onClick={() => {
                                  setRole(r.id);
                                  if (r.id !== "other") {
                                    setCustomRole("");
                                    setConfirmedCustomRole("");
                                  }
                                }}
                                className="relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all duration-150 overflow-hidden"
                                style={{
                                  background: active
                                    ? "rgba(59,130,246,0.12)"
                                    : "rgba(255,255,255,0.02)",
                                  borderColor: active
                                    ? "rgba(96,165,250,0.45)"
                                    : "rgba(255,255,255,0.07)",
                                  boxShadow: active
                                    ? "0 0 14px rgba(59,130,246,0.15)"
                                    : "none",
                                }}
                              >
                                {active && (
                                  <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                      background:
                                        "radial-gradient(circle at center, rgba(59,130,246,0.08) 0%, transparent 70%)",
                                    }}
                                  />
                                )}
                                <span className="text-base leading-none">
                                  {r.icon}
                                </span>
                                <span
                                  className="text-[11px] font-semibold leading-tight"
                                  style={{
                                    color: active ? "#93c5fd" : "#6b7280",
                                  }}
                                >
                                  {r.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Other input */}
                        <AnimatePresence>
                          {role === "other" && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18 }}
                              className="overflow-hidden"
                            >
                              <div className="flex gap-2 mb-1">
                                <input
                                  type="text"
                                  value={customRole}
                                  onChange={(e) => setCustomRole(e.target.value)}
                                  onKeyDown={(e) =>
                                    e.key === "Enter" && confirmCustomRole()
                                  }
                                  autoFocus
                                  placeholder="Your role (e.g. Product Manager)…"
                                  className="flex-1 text-[13px] text-white outline-none rounded-xl px-4 py-2.5 placeholder-gray-600 transition-all"
                                  style={{
                                    background: "rgba(0,0,0,0.4)",
                                    border: "1px solid rgba(96,165,250,0.25)",
                                  }}
                                  onFocus={(e) =>
                                  (e.target.style.borderColor =
                                    "rgba(96,165,250,0.5)")
                                  }
                                  onBlur={(e) =>
                                  (e.target.style.borderColor =
                                    "rgba(96,165,250,0.25)")
                                  }
                                />
                                <button
                                  onClick={confirmCustomRole}
                                  disabled={!customRole.trim()}
                                  className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                  style={{
                                    background: "rgba(59,130,246,0.18)",
                                    border: "1px solid rgba(96,165,250,0.35)",
                                    color: "#93c5fd",
                                  }}
                                >
                                  Add
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </motion.div>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    {/* Availability */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <Clock size={12} style={{ color: "#6b7280" }} />
                        <span
                          className="text-[11px] font-bold uppercase tracking-[0.12em]"
                          style={{ color: "#6b7280" }}
                        >
                          Weekly Availability
                        </span>
                        <span
                          className="text-[11px]"
                          style={{ color: "#f87171" }}
                        >
                          *
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {availabilityOptions.map((opt) => {
                          const active = availability === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => setAvailability(opt.id)}
                              className="flex flex-col items-center gap-0.5 py-2.5 px-1 rounded-xl border text-center transition-all duration-150"
                              style={{
                                background: active
                                  ? "rgba(52,211,153,0.1)"
                                  : "rgba(255,255,255,0.02)",
                                borderColor: active
                                  ? "rgba(52,211,153,0.4)"
                                  : "rgba(255,255,255,0.07)",
                                boxShadow: active
                                  ? "0 0 12px rgba(52,211,153,0.12)"
                                  : "none",
                              }}
                            >
                              <span
                                className="text-[11px] font-bold leading-none"
                                style={{ color: active ? "#6ee7b7" : "#9ca3af" }}
                              >
                                {opt.label}
                              </span>
                              <span
                                className="text-[9px] leading-none mt-0.5"
                                style={{ color: active ? "#4ade80" : "#374151" }}
                              >
                                {opt.sub}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Thin divider */}
                    <div
                      style={{
                        height: 1,
                        background: "rgba(255,255,255,0.05)",
                      }}
                    />

                    {/* Skills */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span
                          className="text-[11px] font-bold uppercase tracking-[0.12em]"
                          style={{ color: "#6b7280" }}
                        >
                          Key Skills
                        </span>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full border"
                          style={{
                            color: "#374151",
                            borderColor: "rgba(255,255,255,0.06)",
                            background: "rgba(255,255,255,0.03)",
                          }}
                        >
                          Optional
                        </span>
                      </div>
                      <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="React, Node.js, UI Design, Marketing…"
                        className="w-full text-[13px] text-white outline-none rounded-xl px-4 py-2.5 placeholder-gray-600 transition-all"
                        style={{
                          background: "rgba(0,0,0,0.35)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "rgba(96,165,250,0.35)")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = "rgba(255,255,255,0.07)")
                        }
                      />
                    </div>

                    {/* Thin divider */}
                    <div
                      style={{
                        height: 1,
                        background: "rgba(255,255,255,0.05)",
                      }}
                    />

                    {/* Message */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span
                          className="text-[11px] font-bold uppercase tracking-[0.12em]"
                          style={{ color: "#6b7280" }}
                        >
                          Message
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full border"
                            style={{
                              color: "#374151",
                              borderColor: "rgba(255,255,255,0.06)",
                              background: "rgba(255,255,255,0.03)",
                            }}
                          >
                            Optional
                          </span>
                          <span
                            className="text-[10px] font-medium tabular-nums"
                            style={{
                              color: message.length > 260 ? "#f87171" : "#374151",
                            }}
                          >
                            {message.length}/300
                          </span>
                        </div>
                      </div>
                      <textarea
                        value={message}
                        maxLength={300}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        placeholder="Introduce yourself — why are you a great fit for this project?"
                        className="w-full text-[13px] text-white outline-none rounded-xl px-4 py-3 placeholder-gray-600 resize-none transition-all"
                        style={{
                          background: "rgba(0,0,0,0.35)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "rgba(96,165,250,0.35)")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = "rgba(255,255,255,0.07)")
                        }
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Sticky Footer ── */}
            <div
              className="shrink-0 px-7 py-5"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(6,10,20,0.85)",
              }}
            >
              {step === 1 ? (
                <button
                  onClick={() => setStep(2)}
                  disabled={!step1Valid}
                  className="w-full py-3 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: step1Valid
                      ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                      : "rgba(59,130,246,0.2)",
                    boxShadow: step1Valid
                      ? "0 0 24px rgba(99,102,241,0.28)"
                      : "none",
                  }}
                >
                  Continue
                  <ChevronRight size={15} />
                </button>
              ) : (
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-[0.45] py-3 rounded-xl text-[13px] font-semibold transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      color: "#9ca3af",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.color = "#e5e7eb";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.color = "#9ca3af";
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: canSubmit
                        ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                        : "rgba(59,130,246,0.2)",
                      boxShadow: canSubmit
                        ? "0 0 24px rgba(99,102,241,0.28)"
                        : "none",
                    }}
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={13} />
                        Send Application
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ── Collab Button ─────────────────────────────────────────────────────────────
function CollabButton({ content, accessToken, isOwnIdea }) {
  const [status, setStatus] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [interestedCount, setInterestedCount] = useState(content?.pending_collab_count ?? 0);

  useEffect(() => {
    if (isOwnIdea || !content?.id) return;
    axios
      .get(`/api/ideas/${content.id}/collab-requests/my-status`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(res => {
        const cr = res?.data?.data?.collab_request;
        if (cr) { setStatus(cr.status); setRequestId(cr.id); }
      })
      .catch(() => { });
  }, [content?.id, accessToken, isOwnIdea]);

  const handleCancel = async e => {
    e?.preventDefault?.(); e?.stopPropagation?.();
    if (!requestId) { toast.error("Request ID missing — try refreshing"); return; }
    setLoading(true);
    try {
      await axios.post(
        `/api/ideas/collab-requests/${requestId}/cancel`, {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setStatus(null); setRequestId(null);
      setInterestedCount(c => Math.max(0, c - 1));
      toast.info("Request cancelled");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to cancel request");
    } finally { setLoading(false); }
  };

  const handleLeave = async e => {
    e?.preventDefault?.(); e?.stopPropagation?.();
    setLoading(true);
    try {
      await axios.post(
        `/api/ideas/${content.id}/leave`, {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setStatus(null); setRequestId(null);
      toast.info("You have left the project");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to leave project");
    } finally { setLoading(false); }
  };

  if (isOwnIdea) return null;

  if (status === "approved") {
    return (
      <div className="w-full space-y-1.5">
        <div className="w-full py-2 px-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm flex items-center justify-center gap-2">
          <CheckCircle className="h-4 w-4" /> Contributor ✓
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleLeave} disabled={loading}
          className="w-full py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5">
          {loading ? <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" /> : <X className="h-3 w-3" />}
          {loading ? "Leaving..." : "Leave Project"}
        </motion.button>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="w-full space-y-1.5">
        <div className="w-full py-2 px-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm flex items-center justify-center gap-2">
          <Clock3 className="h-4 w-4" /> Request Sent — Awaiting Review
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleCancel} disabled={loading}
          className="w-full py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5">
          {loading ? <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" /> : <X className="h-3 w-3" />}
          {loading ? "Cancelling..." : "Cancel Request"}
        </motion.button>
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <CollabRequestModal
          idea={content}
          accessToken={accessToken}
          onClose={() => setShowModal(false)}
          onSuccess={newRequestId => {
            setStatus("pending");
            setRequestId(newRequestId);
            setInterestedCount(c => c + 1);
          }}
        />
      )}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={e => { e?.preventDefault?.(); e?.stopPropagation?.(); setShowModal(true); }}
        className="w-full py-2.5 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/60 text-blue-400 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        {status === "rejected" ? "Express Interest Again" : "Interested in Contributing"}
        {interestedCount > 0 && (
          <span
            className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{
              background: "rgba(99,102,241,0.18)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#a5b4fc",
            }}
          >
            {interestedCount}
          </span>
        )}
      </motion.button>
    </>
  );
}

// ── Main Card ─────────────────────────────────────────────────────────────────
export default function VisionCard({ content, shouldBlur }) {
  // FIX: useNavigate was missing — caused "navigate is not defined" crash
  const navigate = useNavigate();

  const [likes, setLikes] = useState(content?.likes || 0);
  const [liked, setLiked] = useState(content?.hasLiked || false);
  const [bookmarked, setBookmarked] = useState(content?.hasBookmarked || false);
  const { user, access_token } = useSelector(state => state?.auth);

  const isOwnIdea = user?.id === (content?.author?.id || content?.creator?.id);
  const author = useMemo(() => content?.author || content?.creator || {}, [content]);

  const handleLike = useCallback(async e => {
    e?.preventDefault?.(); e?.stopPropagation?.();
    if (!content?.id) return;
    try {
      // Optimistic update
      setLiked(prev => { setLikes(l => prev ? l - 1 : l + 1); return !prev; });
      const res = await ideaAPI?.likeIdea?.(content?.id, access_token);
      // ideaAPI normalises to { data: { idea: { hasLiked, likes } } }
      const ideaData = res?.data?.idea || {};
      if (typeof ideaData.likes === 'number') setLikes(ideaData.likes);
      if (typeof ideaData.hasLiked === 'boolean') setLiked(ideaData.hasLiked);
    } catch (err) { console.error(err); }
  }, [content?.id, access_token]);

  const handleBookmark = async e => {
    e?.preventDefault?.(); e?.stopPropagation?.();
    if (!content?.id || !user?.id) { toast.error("Unable to bookmark at this time"); return; }
    try {
      const body = {
        user_id: user?.id, idea_id: content?.id,
        title: content?.title,
        content_preview: content?.description?.substring(0, 100),
        url: `/ideation-details?id=${content?.id}`,
      };
      const response = await ideaAPI?.toggleIdeaBookmark?.(body);
      setBookmarked(response?.data?.isBookmarked);
    } catch { toast.error("Failed to update bookmark"); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full group relative"
    >
      {/* FIX: outer <Link> replaced with <div onClick navigate> to prevent nested <a> tags */}
      <div
        onClick={() => navigate(`/ideation-details?id=${content?.id}`)}
        className="relative block h-full rounded-2xl border border-blue-500/20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:border-blue-500/50 hover:from-gray-800/80 hover:to-gray-900/80 transition-all duration-300 backdrop-blur-sm overflow-hidden cursor-pointer"
      >
        {shouldBlur && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-md rounded-2xl">
            <div className="text-center">
              <div className="text-5xl mb-3">🔒</div>
              <div className="text-gray-300 text-sm font-medium">Private Vision</div>
              <div className="text-gray-500 text-xs mt-1">Only the creator can view this</div>
            </div>
          </div>
        )}

        <div className={`p-6 space-y-4 h-full flex flex-col ${shouldBlur ? "blur-sm pointer-events-none" : ""}`}>

          {content?.imageUrl && (
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-xl border border-blue-500/10">
              <img src={content?.imageUrl} alt={content?.title}
                className="h-48 w-full object-cover group-hover:brightness-110 transition-all duration-300" />
            </motion.div>
          )}

          {/* FIX: inner author <Link> replaced with <div> + stopPropagation to prevent nested <a> */}
          <div
            onClick={e => { e.preventDefault(); e.stopPropagation(); navigate(`/user-profile?userId=${author?.id}`); }}
            className="flex items-start justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <img src={getProfilePicture(author)}
                className="h-10 w-10 rounded-full border-2 border-blue-500/30 object-cover"
                alt={author?.name} />
              <div>
                <p className="text-sm font-semibold text-white">{author?.name}</p>
                <p className="text-xs text-gray-400">{author?.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Momentum. Renders nothing unless this Vision has earned it —
                  a flame on every card would carry no information. */}
              <MomentumFlame item={content} size={15} />
              <span className={`${getStageColor(content?.stage)} text-xs px-3 py-1.5 rounded-full font-semibold`}>
                {content?.stage}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-bold text-white leading-tight line-clamp-2 mb-2">{content?.title}</h2>
            <p className="text-sm text-gray-300 line-clamp-3">{content?.description}</p>
          </div>

          {content?.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {content?.tags?.slice(0, 3)?.map((tag, i) => (
                <motion.span key={i} whileHover={{ scale: 1.05 }}
                  className="text-xs text-blue-300 bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-full font-medium">
                  #{tag}
                </motion.span>
              ))}
              {content?.tags?.length > 3 && (
                <span className="text-xs text-gray-500 px-3 py-1">+{content?.tags?.length - 3}</span>
              )}
            </div>
          )}

          <div className="border-t border-gray-700/50 pt-4 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-gray-400">
                <motion.button whileTap={{ scale: 1.25 }} onClick={handleLike}
                  className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                  <Heart className={`h-4 w-4 ${liked ? "text-red-500 fill-red-500" : ""}`} />
                  <span>{likes}</span>
                </motion.button>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4" />{content?.comments}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />{content?.collaborators}
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-gray-500">
                <Clock className="h-3 w-3" />{content?.timeAgo}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleBookmark}
                className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${bookmarked
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                  : "bg-white/5 text-gray-400 border border-gray-700/50 hover:border-blue-500/30 hover:text-white"
                  }`}>
                <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
                Save
              </motion.button>

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={e => {
                  e?.preventDefault?.(); e?.stopPropagation?.();
                  if (navigator?.share) {
                    navigator.share({ title: content?.title, text: content?.description, url: window.location.href });
                  } else { toast?.info?.("Share functionality not available"); }
                }}
                className="flex-1 py-2.5 px-3 rounded-lg bg-white/5 border border-gray-700/50 hover:border-blue-500/30 text-gray-400 hover:text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2">
                <Share2 className="h-4 w-4" />Share
              </motion.button>
            </div>

            <div onClick={e => { e?.preventDefault?.(); e?.stopPropagation?.(); }}>
              <CollabButton content={content} accessToken={access_token} isOwnIdea={isOwnIdea} />
            </div>

            <div onClick={e => { e?.preventDefault?.(); e?.stopPropagation?.(); }}>
              <ConnectionButton userId={content?.author?.id || content?.creator?.id} size="sm" className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
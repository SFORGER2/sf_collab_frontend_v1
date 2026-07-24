/**
 * DeleteProjectFlow — Task 25: Delete Project Workflow
 *
 * Delete button → inline confirmation modal → loading → success state.
 * Uses react-toastify (already wired globally in App.jsx).
 *
 * API: DELETE /projects/:id
 */

import React, { useState } from "react";
import { Trash2, AlertTriangle, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import { toast } from "react-toastify";

// ── Simulated DELETE /projects/:id ────────────────────────────────────────────
function mockDeleteProject(/* projectId */) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Resolve 90% of the time for demo purposes
      Math.random() > 0.1 ? resolve() : reject(new Error("Server error"));
    }, 1200);
  });
}

export default function DeleteProjectFlow({ projectId, onDeleted } = {}) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [deleted, setDeleted]   = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await mockDeleteProject(projectId);
      setDeleted(true);
      setShowModal(false);
      toast.success("Project deleted successfully.");
      onDeleted?.();
    } catch {
      setShowModal(false);
      toast.error("Delete failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Section header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Delete Project</h3>
            <p className="text-xs text-slate-500">Task 25 · DELETE /projects/:id</p>
          </div>
        </div>

        {/* Body */}
        <AnimatePresence mode="wait">
          {deleted ? (
            /* ── Success state ── */
            <motion.div
              key="deleted"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-4 py-4 rounded-xl
                         bg-green-500/10 border border-green-500/25"
            >
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-300">Project Deleted</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Redirecting to dashboard…
                </p>
              </div>
            </motion.div>
          ) : (
            /* ── CTA state ── */
            <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Permanently remove this project and all associated data. This action
                cannot be undone.
              </p>
              <button
                id="delete-project-btn"
                type="button"
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                           text-sm font-semibold text-white transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #dc2626, #ef4444)",
                  boxShadow: "0 0 16px rgba(220,38,38,0.35)",
                }}
              >
                <Trash2 className="w-4 h-4" />
                Delete Project
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Inline confirmation modal ── */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => !loading && setShowModal(false)}
            />

            {/* Dialog */}
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/10
                           bg-[#0f1623] shadow-2xl p-6 space-y-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Delete Project?</h4>
                      <p className="text-xs text-slate-500">This action is permanent.</p>
                    </div>
                  </div>
                  {!loading && (
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      aria-label="Close"
                      className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed">
                  All project data, generated files, and linked repositories will be
                  permanently removed. This action <span className="text-red-400 font-semibold">cannot be undone</span>.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    id="delete-cancel-btn"
                    type="button"
                    disabled={loading}
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/[0.03]
                               text-sm font-medium text-slate-400 hover:text-slate-200
                               hover:border-white/20 transition-all disabled:opacity-40
                               disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>

                  <button
                    id="delete-confirm-btn"
                    type="button"
                    disabled={loading}
                    onClick={handleConfirm}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                               text-sm font-semibold text-white transition-all active:scale-95
                               disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #dc2626, #ef4444)",
                      boxShadow: "0 0 12px rgba(220,38,38,0.35)",
                    }}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="w-3.5 h-3.5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path strokeLinecap="round" d="M12 3v3m6.366.634-2.12 2.12M21 12h-3m-.634 6.366-2.12-2.12M12 21v-3m-6.366-.634 2.12-2.12M3 12h3m.634-6.366 2.12 2.12" />
                        </svg>
                        Deleting…
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

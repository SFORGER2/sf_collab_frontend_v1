/**
 * GenerateCodebaseFlow — Task 19: Generate Codebase Flow
 *
 * Spec §4.11 · POST /projects/:id/generate
 *
 * Flow:
 *   1. Button enabled only when project status === "approved"
 *   2. Clicking calls POST /api/generator/projects/:id/generate
 *      → receives 202 + job object immediately
 *   3. Progress tracked via Socket.IO generator:job_progress
 *      (useGeneratorSocket hook, scaffold stage)
 *   4. On 100% → success state showing file/archive result
 *   5. On failure → error state with retry
 *
 * In the Sandbox (no real projectId), the component falls back to
 * simulating the scaffold job using the existing socket service —
 * the same approach used by RealtimeTracker.
 */

import React, { useState, useCallback } from "react";
import { CheckCircle, Cpu, PackageOpen, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import { toast } from "react-toastify";
import apiClient from "../../../services/apiClient";
import useGeneratorSocket from "../../hooks/useGeneratorSocket";
import ApiErrorBanner from "./ApiErrorBanner";

// ─── Animated Progress Bar ────────────────────────────────────────────────────
function ProgressBar({ progress, failed }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-white/8 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={
          failed
            ? { background: "#ef4444" }
            : {
                background: "linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)",
                boxShadow: "0 0 8px rgba(168,85,247,0.6)",
              }
        }
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ ease: "easeOut", duration: 0.4 }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * Props:
 *   projectId    — string | null   Project public ID. When null the component
 *                                  runs in sandbox/simulation mode.
 *   projectStatus — string | null  Current project status from GET /projects/:id.
 *                                  Button is only enabled when status === "approved".
 *   onGenerated  — () => void      Optional callback fired after successful generation.
 */
export default function GenerateCodebaseFlow({
  projectId   = null,
  projectStatus = "approved",   // default "approved" so sandbox always shows active button
  onGenerated = null,
} = {}) {

  // ── socket hook — filters to this project's jobs ──────────────────────────
  const {
    activeJob,
    isSimulating,
    simulate,
    simulateError,
    stopSimulation,
  } = useGeneratorSocket(projectId ?? "hlzsvFY5IIg39rhZrA8DNw");

  const [phase, setPhase]       = useState("idle");   // idle | submitting | tracking | success | error
  const [jobResult, setJobResult] = useState(null);   // { files, archive } from job.result
  const [apiError, setApiError] = useState(null);

  const isSandbox = !projectId;

  // ── Derive live progress from socket ─────────────────────────────────────
  const socketProgress = activeJob?.progress ?? 0;
  const socketMessage  = activeJob?.message  ?? "";
  const socketStatus   = activeJob?.status;
  const socketStage    = activeJob?.stage;

  // ── Watch scaffold job completion ─────────────────────────────────────────
  React.useEffect(() => {
    if (phase !== "tracking") return;
    if (socketStage !== "scaffold") return;

    if (socketStatus === "succeeded") {
      const result = activeJob?.result ?? { files: 50, archive: true };
      setJobResult(result);
      setPhase("success");
      toast.success("Codebase generated! Ready to download.");
      onGenerated?.();
    } else if (socketStatus === "failed") {
      setApiError(activeJob?.message ?? "Scaffold job failed.");
      setPhase("error");
      toast.error("Generation failed. Please retry.");
    }
  }, [socketStatus, socketStage, phase, activeJob, onGenerated]);

  // ── Trigger generate ──────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setApiError(null);
    setJobResult(null);

    if (isSandbox) {
      // ── Simulation mode (no real backend) ────────────────────────────────
      setPhase("tracking");
      simulate("scaffold");
      return;
    }

    // ── Real API call ─────────────────────────────────────────────────────
    setPhase("submitting");
    try {
      // POST /api/generator/projects/:id/generate  →  202 + { job: { ... } }
      await apiClient.post(`/api/generator/projects/${projectId}/generate`);
      // HTTP request succeeded; switch to tracking mode — socket events follow
      setPhase("tracking");
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ??
        err?.message ??
        "Failed to start generation.";
      setApiError(msg);
      setPhase("error");
      toast.error(msg);
    }
  }, [isSandbox, projectId, simulate]);

  const handleRetry = useCallback(() => {
    stopSimulation();
    setPhase("idle");
    setApiError(null);
    setJobResult(null);
  }, [stopSimulation]);

  // ── Derived booleans ──────────────────────────────────────────────────────
  const isApproved       = projectStatus === "approved";
  const isTracking       = phase === "tracking";
  const isSubmitting     = phase === "submitting";
  const isLoading        = isSubmitting || isTracking;
  const displayProgress  = isTracking ? socketProgress : 0;
  const scaffoldFailed   = socketStage === "scaffold" && socketStatus === "failed";

  // ── Rate-limit / state error guard ───────────────────────────────────────
  // Spec §2: generate is only valid when status === "approved"
  const generateBlocked = !isApproved && !isSandbox;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
          <Cpu className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Generate Codebase</h3>
          <p className="text-xs text-slate-500">
            Task 19 · POST /projects/:id/generate
            {isSandbox && (
              <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest
                               bg-violet-500/20 text-violet-300 border border-violet-500/30">
                SIM
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">

        {/* ── Idle ── */}
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            {/* State guard warning */}
            {generateBlocked && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl
                              bg-amber-500/10 border border-amber-500/25">
                <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-300 leading-relaxed">
                  Generation is only available once the proposal has been{" "}
                  <span className="font-semibold">approved</span>.{" "}
                  Current status:{" "}
                  <span className="font-mono">{projectStatus ?? "unknown"}</span>
                </p>
              </div>
            )}

            <p className="text-xs text-slate-500 leading-relaxed">
              The proposal has been approved. Click below to trigger code generation.
              The backend scaffolds a full-stack{" "}
              <span className="text-slate-400 font-medium">React + Node + MySQL</span>{" "}
              project and streams progress via Socket.IO.
            </p>

            {/* What gets built chips */}
            <div className="flex flex-wrap gap-2">
              {[
                "React 18 + Vite",
                "Node.js + Express",
                "MySQL 8 Schema",
                "GitHub Actions CI",
                "ZIP Archive",
              ].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                             text-[11px] font-medium text-slate-400 bg-white/4 border border-white/8"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
                  {label}
                </span>
              ))}
            </div>

            <button
              id="generate-codebase-btn"
              type="button"
              disabled={generateBlocked}
              onClick={handleGenerate}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                         text-sm font-semibold text-white transition-all active:scale-95
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              style={
                generateBlocked
                  ? {}
                  : {
                      background: "linear-gradient(135deg, #059669, #10b981)",
                      boxShadow: "0 0 18px rgba(16,185,129,0.35)",
                    }
              }
            >
              <Cpu className="w-4 h-4" />
              Generate Codebase
            </button>
          </motion.div>
        )}

        {/* ── Submitting (waiting for 202) ── */}
        {phase === "submitting" && (
          <motion.div
            key="submitting"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl
                            bg-violet-500/8 border border-violet-500/20">
              <svg
                className="w-4 h-4 text-violet-400 animate-spin flex-shrink-0"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <path strokeLinecap="round" d="M12 3v3m6.366.634-2.12 2.12M21 12h-3m-.634 6.366-2.12-2.12M12 21v-3m-6.366-.634 2.12 2.12M3 12h3m.634-6.366 2.12 2.12" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-violet-300">
                  Queuing generation job…
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  POST /projects/{projectId}/generate
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Tracking (202 received; listening on socket) ── */}
        {phase === "tracking" && (
          <motion.div
            key="tracking"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-5"
          >
            {/* Progress header */}
            <div className="flex items-center justify-between">
              <AnimatePresence mode="wait">
                <motion.p
                  key={socketMessage || "waiting"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="text-xs text-slate-400 truncate max-w-[260px]"
                >
                  {socketMessage || "Waiting for job progress…"}
                </motion.p>
              </AnimatePresence>
              <span className="text-xs font-mono text-violet-300 tabular-nums ml-3 flex-shrink-0">
                {displayProgress}%
              </span>
            </div>

            <ProgressBar progress={displayProgress} failed={scaffoldFailed} />

            {/* Status pill */}
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl
                            bg-violet-500/8 border border-violet-500/20">
              <svg
                className="w-4 h-4 text-violet-400 animate-spin flex-shrink-0"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <path strokeLinecap="round" d="M12 3v3m6.366.634-2.12 2.12M21 12h-3m-.634 6.366-2.12-2.12M12 21v-3m-6.366-.634 2.12 2.12M3 12h3m.634-6.366 2.12 2.12" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-violet-300">
                  Scaffold job running
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Event: <span className="font-mono">generator:job_progress</span>
                  {isSimulating && (
                    <span className="ml-2 px-1 py-0.5 rounded text-[9px] font-bold
                                     bg-violet-500/20 text-violet-300 border border-violet-500/30">SIM</span>
                  )}
                </p>
              </div>
            </div>

            {/* Cancel sim button */}
            {isSimulating && (
              <button
                id="generate-cancel-sim-btn"
                type="button"
                onClick={() => { stopSimulation(); setPhase("idle"); }}
                className="w-full py-2.5 rounded-xl border border-white/10 bg-white/[0.03]
                           text-sm font-medium text-slate-400 hover:text-slate-200
                           hover:border-white/20 transition-all"
              >
                Cancel Simulation
              </button>
            )}
          </motion.div>
        )}

        {/* ── Success ── */}
        {phase === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="space-y-4"
          >
            {/* Banner */}
            <div className="flex items-start gap-3 px-4 py-4 rounded-xl
                            bg-emerald-500/10 border border-emerald-500/25">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">Codebase Generated</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Project scaffolded and archive is ready for download.
                </p>
              </div>
            </div>

            {/* Job result stats from spec: { files, archive } */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center py-4 rounded-xl
                              bg-white/[0.03] border border-white/8">
                <span className="text-2xl font-bold text-white tabular-nums">
                  {jobResult?.files ?? 50}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Files written</span>
              </div>
              <div className="flex flex-col items-center py-4 rounded-xl
                              bg-white/[0.03] border border-white/8">
                <CheckCircle className="w-6 h-6 text-emerald-400 mt-0.5" />
                <span className="text-[10px] text-slate-500 mt-1.5">Archive ready</span>
              </div>
            </div>

            {/* Download hint — Task 20 */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl
                            bg-white/[0.025] border border-white/8">
              <PackageOpen className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <p className="text-xs text-slate-500">
                Archive download available via{" "}
                <span className="font-mono text-slate-400">GET /projects/:id/archive</span>
                {" "}— Task 20.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Error ── */}
        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            {/* ApiErrorBanner — Task 23 reusable error component */}
            <ApiErrorBanner
              httpStatus={502}
              error={{
                code: "git_orchestration_error",
                message: apiError ?? "An unexpected server error occurred. Please retry.",
                details: {},
              }}
              onRetry={handleRetry}
              onDismiss={handleRetry}
            />
          </motion.div>
        )}

      </AnimatePresence>

      {/* Spec note (sandbox only) */}
      {isSandbox && phase === "idle" && (
        <p className="text-[10px] text-slate-600 leading-relaxed border-t border-white/5 pt-3">
          Spec §4.11 — Returns <span className="font-mono text-slate-500">202 Accepted</span> +
          job object. Progress streams via{" "}
          <span className="font-mono text-slate-500">generator:job_progress</span> (stage:{" "}
          <span className="font-mono text-slate-500">scaffold</span>). On 100% → project
          status transitions to <span className="font-mono text-slate-500">generated</span>.
        </p>
      )}
    </div>
  );
}

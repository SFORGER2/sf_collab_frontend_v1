import React, { useState } from "react";
import { motion } from "framer-motion";
import { generatorAPI } from "@/utils/APIs/generatorAPI";
import { useJobPolling } from "@/hooks/useJobPolling";
import { cn } from "@/lib/utils";

/**
 * Reusable JobProgressCard component.
 * Displays progress of Website Generator async jobs: harvesting, generating, pushing.
 * Professional, clean enterprise UI.
 */
export function JobProgressCard({
  projectId,
  stage,
  title,
  onComplete,
  onFail,
  onRetry,
  simulate = false,
  simulatedProgress,
  simulatedMessage,
  simulatedStatus,
  simulatedIsPolling = false,
  className,
}) {
  const [retrying, setRetrying] = useState(false);

  // Consume the Polling Hook
  const {
    progress,
    message,
    status,
    error,
    isPolling,
    triggerPolling,
    setProgress,
    setStatus,
    setMessage,
    setError
  } = useJobPolling({
    projectId,
    stage,
    onComplete,
    onFail,
    simulate,
    simulatedProgress,
    simulatedMessage,
    simulatedStatus,
    simulatedIsPolling,
  });

  const handleRetry = async () => {
    setRetrying(true);
    if (simulate) {
      setProgress(0);
      setStatus("queued");
      setMessage("Restarting simulated worker...");
      setError(null);
      setTimeout(() => {
        if (onRetry) onRetry();
        setRetrying(false);
      }, 800);
    } else {
      try {
        setError(null);
        if (stage === "harvest") {
          await generatorAPI.harvestProject(projectId);
        } else if (stage === "scaffold") {
          await generatorAPI.generateCodebase(projectId);
        } else if (stage === "delivery") {
          await generatorAPI.pushRepository(projectId);
        }
        triggerPolling();
      } catch (err) {
        console.error("Failed to re-trigger stage:", err);
        const errMsg = err.response?.data?.error?.message || err.message || "Failed to restart stage.";
        setError(errMsg);
      } finally {
        setRetrying(false);
      }
    }
  };

  const isFailed = status === "failed";
  const isSucceeded = status === "succeeded";

  // Muted, professional status colors
  const statusColor = isFailed
    ? "#ef4444" // red-500
    : isSucceeded
    ? "#10b981" // emerald-500
    : "#3b82f6"; // blue-500

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      id="job-progress-card"
      className={cn(
        "relative flex flex-col gap-5 p-6 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-white/[0.07] shadow-xl overflow-hidden",
        className
      )}
    >
      {/* Inner top-edge light line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
      {/* Colored top status bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-colors duration-700"
        style={{ backgroundColor: statusColor, opacity: 0.8 }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div>
          <h4 className="text-[16px] font-bold text-zinc-100 tracking-tight">{title}</h4>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-600 mt-1.5">
            Stage: {stage}
          </p>
        </div>

        {/* Status Indicator Pill */}
        <div
          className="flex items-center gap-2 flex-shrink-0 px-2.5 py-1 rounded-lg border transition-colors duration-700"
          style={{
            backgroundColor: `${statusColor}12`,
            borderColor: `${statusColor}30`,
          }}
        >
          <span className="relative flex h-2 w-2">
            {!isFailed && !isSucceeded && (
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
                style={{ backgroundColor: statusColor }}
              />
            )}
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: statusColor }}
            />
          </span>
          <span
            className="text-[11px] font-bold uppercase tracking-widest transition-colors duration-700"
            style={{ color: statusColor }}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] text-zinc-600 font-bold uppercase tracking-[0.12em]">Progress</span>
          <span className="text-[12px] font-mono font-bold" style={{ color: progress === 100 ? statusColor : '#71717a' }}>
            {progress}%
          </span>
        </div>

        <div className="relative w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ backgroundColor: statusColor }}
          />
        </div>
      </div>

      {/* Terminal Logs */}
      <div className="relative flex flex-col flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] text-zinc-600 font-bold uppercase tracking-[0.12em]">Terminal Logs</span>
          {isPolling && (
            <span className="text-[10px] text-amber-400 font-mono tracking-wider bg-amber-500/[0.08] px-2 py-0.5 rounded-md border border-amber-500/20 font-semibold">
              POLLING
            </span>
          )}
        </div>
        
        <div className="w-full bg-black/60 rounded-xl px-4 py-3.5 border border-white/[0.05] font-mono text-[12px] min-h-[140px] flex-1 flex flex-col shadow-inner">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            <span className="ml-auto text-[10px] text-zinc-700 tracking-wider">{stage}.log</span>
          </div>
          <div className="text-zinc-400 break-words leading-relaxed select-text flex items-start gap-2">
            <span className="text-violet-600 font-bold select-none flex-shrink-0">▸</span>
            <div className="flex-1">
              {isFailed ? (
                <span className="text-red-400">{error || message}</span>
              ) : (
                <span className="text-zinc-300">{message}</span>
              )}
              {!isFailed && !isSucceeded && (
                <span className="inline-block w-[7px] h-3.5 ml-1.5 bg-violet-500/70 animate-pulse align-middle rounded-sm" />
              )}
            </div>
          </div>

          {/* Action buttons (Retry) if failed */}
          <div className="mt-auto pt-5 flex items-center justify-end">
            {isFailed && (
              <button
                onClick={handleRetry}
                disabled={retrying}
                id="btn-retry-stage"
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                {retrying ? (
                  <>
                    <svg aria-hidden="true" className="animate-spin h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Retrying...
                  </>
                ) : (
                  <>
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                    Retry Stage
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default JobProgressCard;

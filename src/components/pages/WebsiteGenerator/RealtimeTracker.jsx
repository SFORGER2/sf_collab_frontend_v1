/**
 * RealtimeTracker — Task 9: Socket.IO Integration
 *
 * Full-featured real-time progress panel featuring:
 *   - Connection status bar with animated ping dot
 *   - Active job tracker with per-field display from spec payload
 *   - Inline progress bar (deliberately basic; Task 10 builds the reusable component)
 *   - Activity feed / log (auto-scrolling, level-colored)
 *   - Job simulator panel (Harvest, Scaffold, Delivery, Error)
 *
 * Spec reference: Section 5 — Realtime Job Progress (Socket.IO)
 */

import React, { useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useGeneratorSocket from "../../hooks/useGeneratorSocket";

// ─── Design tokens (from spec §7) ────────────────────────────────────────────

const STATUS_COLORS = {
  queued:    { bg: "bg-slate-500/15", text: "text-slate-400",  border: "border-slate-500/30" },
  running:   { bg: "bg-amber-500/15",  text: "text-amber-400",  border: "border-amber-500/30"  },
  succeeded: { bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/30" },
  failed:    { bg: "bg-red-500/15",    text: "text-red-400",    border: "border-red-500/30"    },
};

const STAGE_META = {
  harvest:  { label: "Harvest",  icon: "🌐", color: "text-sky-400",    bg: "bg-sky-500/15",    border: "border-sky-500/30"    },
  scaffold: { label: "Scaffold", icon: "⚙️",  color: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/30" },
  delivery: { label: "Delivery", icon: "🚀",  color: "text-green-400",  bg: "bg-green-500/15",  border: "border-green-500/30"  },
};

const CONN_STATUS_CONFIG = {
  disconnected: { dot: "bg-slate-500",  label: "Disconnected", pulse: false },
  connecting:   { dot: "bg-amber-400",  label: "Connecting…",  pulse: true  },
  connected:    { dot: "bg-green-400",  label: "Connected",    pulse: true  },
  simulating:   { dot: "bg-violet-400", label: "Simulating",   pulse: true  },
  reconnecting: { dot: "bg-amber-400",  label: "Reconnecting…",pulse: true  },
  error:        { dot: "bg-red-400",    label: "Error",        pulse: false },
};

const LOG_LEVEL_CONFIG = {
  info:    { icon: "ℹ",  color: "text-sky-400"   },
  success: { icon: "✓",  color: "text-green-400" },
  warning: { icon: "⚠",  color: "text-amber-400" },
  error:   { icon: "✕",  color: "text-red-400"   },
};

const COMPLETION_STATUS_LABEL = {
  proposal_ready: "Proposal Ready",
  generated:      "Generated",
  delivered:      "Delivered",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ children, className = "" }) {
  return (
    <div className={`bg-[#151B2B] border border-white/5 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,.08)] ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0 text-sm">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-[10px] text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ── Connection Status Bar ────────────────────────────────────────────────────

function ConnectionStatusBar({ connectionStatus, connectionMeta }) {
  const cfg = CONN_STATUS_CONFIG[connectionStatus] ?? CONN_STATUS_CONFIG.disconnected;

  const statusGlow = {
    connected:    "0 0 20px rgba(74,222,128,0.3)",
    simulating:   "0 0 20px rgba(167,139,250,0.3)",
    connecting:   "0 0 20px rgba(251,191,36,0.2)",
    reconnecting: "0 0 20px rgba(251,191,36,0.2)",
    error:        "0 0 20px rgba(248,113,113,0.3)",
    disconnected: "none",
  };

  return (
    <motion.div
      layout
      className="rounded-2xl border border-white/10 backdrop-blur-md overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        boxShadow: statusGlow[connectionStatus] || "none",
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 gap-4 flex-wrap">
        {/* Left: Status dot + label */}
        <div className="flex items-center gap-4">
          {/* Large animated status dot */}
          <div className="relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
            {cfg.pulse && (
              <div className={`absolute w-3 h-3 rounded-full ${cfg.dot} opacity-40 animate-ping`} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{cfg.label}</span>
              {connectionStatus === "simulating" && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-violet-500/20 text-violet-300 border border-violet-500/30">SIM</span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              {connectionMeta.socketId ? connectionMeta.socketId : "ws://localhost:5000"}
            </p>
          </div>
        </div>

        {/* Right: Event pill */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/8 font-mono text-[10px] text-slate-500">
            generator:job_progress
          </div>
          {connectionMeta.reason && connectionStatus === "disconnected" && (
            <span className="text-[10px] text-slate-600">({connectionMeta.reason})</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Active Job Tracker ───────────────────────────────────────────────────────

function ActiveJobTracker({ activeJob, projectStatus, refetchCount }) {
  const stageMeta = activeJob ? STAGE_META[activeJob.stage] : null;
  const statusCfg = activeJob ? (STATUS_COLORS[activeJob.status] ?? STATUS_COLORS.queued) : null;

  if (!activeJob) {
    return (
      <SectionCard>
        <SectionHeader icon="📊" title="Active Job" subtitle="Spec payload: { project_id, job_id, stage, status, progress, message }" />
        <div className="flex flex-col items-center justify-center gap-3 py-12 px-6">
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-xl">
            📭
          </div>
          <p className="text-sm text-slate-500 text-center">
            No active job. Start a simulation below to see real-time progress.
          </p>
        </div>
      </SectionCard>
    );
  }

  const progress = activeJob.progress ?? 0;
  const isDone   = activeJob.status === "succeeded";
  const isFailed = activeJob.status === "failed";

  return (
    <SectionCard>
      <SectionHeader
        icon="📊"
        title="Active Job"
        subtitle={`Job ID: ${activeJob.job_id}`}
        action={
          <div className="flex items-center gap-2">
            {/* Status badge */}
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest
                              border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
              {activeJob.status === "running" && (
                <svg className="w-2.5 h-2.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" d="M12 3v3m6.366.634-2.12 2.12M21 12h-3m-.634 6.366-2.12-2.12M12 21v-3m-6.366-.634 2.12-2.12M3 12h3m.634-6.366 2.12 2.12" />
                </svg>
              )}
              {activeJob.status}
            </span>

            {/* Stage badge */}
            {stageMeta && (
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border
                                ${stageMeta.bg} ${stageMeta.color} ${stageMeta.border}`}>
                {stageMeta.icon} {stageMeta.label}
              </span>
            )}
          </div>
        }
      />

      <div className="p-5 space-y-5">
        {/* Payload fields */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "project_id", value: activeJob.project_id },
            { label: "job_id",     value: activeJob.job_id     },
            { label: "stage",      value: activeJob.stage      },
            { label: "status",     value: activeJob.status     },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1">{label}</p>
              <p className="font-mono text-xs text-slate-300 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Progress bar — deliberately basic per Task 9 scope; Task 10 builds the reusable component */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">progress</span>
            <span className="font-mono text-sm font-bold text-white">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isFailed ? "bg-red-500" : isDone ? "bg-violet-500" : "bg-amber-500"}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Latest message from payload */}
        {activeJob.message && (
          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-sm mt-0.5 flex-shrink-0">
              {isFailed ? "⚠️" : isDone ? "✅" : "⏳"}
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{activeJob.message}</p>
          </div>
        )}

        {/* Re-fetch indicator at 100% — spec §5 */}
        <AnimatePresence>
          {isDone && projectStatus && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/25"
            >
              <svg className="w-4 h-4 text-violet-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-violet-300">
                  GET /projects/:id triggered ({refetchCount}×)
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Project status updated → <span className="font-mono text-violet-400">{projectStatus}</span>
                  {" "}({COMPLETION_STATUS_LABEL[projectStatus]})
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionCard>
  );
}

// ── Activity Feed ────────────────────────────────────────────────────────────

function ActivityFeed({ log, onClear }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log.length]);

  // Terminal prefix colors per level
  const LEVEL_PREFIX = {
    info:    { prefix: "[INFO]",    color: "#38bdf8" },
    success: { prefix: "[SUCCESS]", color: "#4ade80" },
    warning: { prefix: "[WARN]",   color: "#fbbf24" },
    error:   { prefix: "[ERROR]",  color: "#f87171" },
  };

  return (
    <SectionCard className="flex flex-col">
      <SectionHeader
        icon="💻"
        title="Activity Log"
        subtitle={`${log.length} event${log.length !== 1 ? "s" : ""} · terminal view`}
        action={
          <button
            id="clear-activity-log-btn"
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase
                       tracking-widest text-slate-500 hover:text-slate-300 border border-white/5
                       hover:border-white/10 transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Clear
          </button>
        }
      />

      {/* Terminal window */}
      <div
        className="h-64 overflow-y-auto px-4 py-3 space-y-0.5 font-mono text-[11px] leading-relaxed"
        style={{ background: "rgba(0,0,0,0.4)", borderRadius: "0 0 16px 16px" }}
      >
        {/* Terminal prompt line */}
        <div className="text-slate-600 mb-2 select-none">$ generator --watch --realtime</div>

        {log.length === 0 ? (
          <div className="flex items-center gap-2 text-slate-600">
            <span className="animate-pulse">▊</span>
            <span>Waiting for events…</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {log.map((entry) => {
              const lcfg = LEVEL_PREFIX[entry.level] ?? LEVEL_PREFIX.info;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-start gap-2 py-0.5 group hover:bg-white/[0.03] rounded px-1"
                >
                  <span className="text-slate-600 flex-shrink-0 select-none tabular-nums">{entry.ts}</span>
                  <span className="flex-shrink-0 font-bold select-none" style={{ color: lcfg.color }}>
                    {lcfg.prefix}
                  </span>
                  <span className="text-slate-400 group-hover:text-slate-200 transition-colors break-all">
                    {entry.msg}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>
    </SectionCard>
  );
}

// ── Job Simulator Panel ──────────────────────────────────────────────────────

const SIM_BUTTONS = [
  { stage: "harvest",  label: "Simulate Harvest",  icon: "🌐", desc: "harvest → proposal_ready",  color: "border-sky-500/30 hover:border-sky-500/60 hover:bg-sky-500/10 text-sky-300"     },
  { stage: "scaffold", label: "Simulate Scaffold",  icon: "⚙️",  desc: "approved → generated",     color: "border-violet-500/30 hover:border-violet-500/60 hover:bg-violet-500/10 text-violet-300" },
  { stage: "delivery", label: "Simulate Delivery",  icon: "🚀",  desc: "generated → delivered",    color: "border-green-500/30 hover:border-green-500/60 hover:bg-green-500/10 text-green-300"   },
];

function SimulatorPanel({ isSimulating, activeJob, onSimulate, onSimulateError, onStop }) {
  const currentStage = isSimulating ? (activeJob?.stage ?? "…") : null;

  return (
    <SectionCard>
      <SectionHeader icon="🎮" title="Job Simulator" subtitle="No backend required — fires spec-accurate socket events locally" />

      <div className="p-5 space-y-4">
        {/* Stage buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SIM_BUTTONS.map(({ stage, label, icon, desc, color }) => (
            <button
              key={stage}
              id={`sim-btn-${stage}`}
              type="button"
              disabled={isSimulating}
              onClick={() => onSimulate(stage)}
              className={`group relative flex flex-col items-start gap-1.5 px-4 py-3.5 rounded-xl border
                          text-left transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                          bg-white/[0.02] ${color}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <span className="text-xs font-semibold">{label}</span>
              </div>
              <span className="font-mono text-[10px] text-slate-600">{desc}</span>
            </button>
          ))}
        </div>

        {/* Simulate Error + Cancel row */}
        <div className="flex items-center gap-3">
          <button
            id="sim-btn-error"
            type="button"
            disabled={isSimulating}
            onClick={() => onSimulateError("harvest")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30
                       hover:border-red-500/60 hover:bg-red-500/10 text-red-300 text-xs font-semibold
                       transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Simulate Error
          </button>

          <AnimatePresence>
            {isSimulating && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex items-center gap-3 flex-1"
              >
                {/* Stage indicator */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/25 flex-1">
                  <svg className="w-3.5 h-3.5 text-violet-400 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" d="M12 3v3m6.366.634-2.12 2.12M21 12h-3m-.634 6.366-2.12-2.12M12 21v-3m-6.366-.634 2.12-2.12M3 12h3m.634-6.366 2.12 2.12" />
                  </svg>
                  <span className="text-xs text-violet-300 font-medium">
                    Running {currentStage} simulation…
                  </span>
                </div>

                <button
                  id="sim-cancel-btn"
                  type="button"
                  onClick={onStop}
                  className="px-3 py-2 rounded-xl border border-red-500/30 hover:border-red-500/60
                             hover:bg-red-500/10 text-red-400 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Spec reference note */}
        <p className="text-[10px] text-slate-600 leading-relaxed border-t border-white/5 pt-3">
          Spec §5 — Event: <span className="font-mono text-slate-500">generator:job_progress</span> ·
          Payload: <span className="font-mono text-slate-500">{"{ project_id, job_id, stage, progress, message }"}</span> ·
          At 100% → <span className="font-mono text-slate-500">GET /projects/:id</span> is triggered.
        </p>
      </div>
    </SectionCard>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RealtimeTracker() {
  const {
    connectionStatus,
    connectionMeta,
    activeJob,
    activityLog,
    isSimulating,
    simulate,
    simulateError,
    stopSimulation,
    clearLog,
    projectStatus,
    refetchCount,
  } = useGeneratorSocket();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
            Phase 4 — Real-Time System
          </p>
          <h2 className="text-xl font-semibold text-white tracking-wide">
            Socket.IO Integration
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Task 9 · Event: <span className="font-mono text-slate-400">generator:job_progress</span>
          </p>
        </div>

        {/* Deliverables pill */}
        <div className="flex items-center gap-2 flex-wrap">
          {["Socket Service", "Event Handlers", "Activity Feed", "Job Tracking"].map((label) => (
            <span
              key={label}
              className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20
                         text-violet-400 text-[10px] font-bold uppercase tracking-widest"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Connection Status */}
      <ConnectionStatusBar
        connectionStatus={connectionStatus}
        connectionMeta={connectionMeta}
      />

      {/* Two-column layout for tracker + feed */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ActiveJobTracker
          activeJob={activeJob}
          projectStatus={projectStatus}
          refetchCount={refetchCount}
        />
        <ActivityFeed log={activityLog} onClear={clearLog} />
      </div>

      {/* Simulator */}
      <SimulatorPanel
        isSimulating={isSimulating}
        activeJob={activeJob}
        onSimulate={simulate}
        onSimulateError={simulateError}
        onStop={stopSimulation}
      />
    </div>
  );
}

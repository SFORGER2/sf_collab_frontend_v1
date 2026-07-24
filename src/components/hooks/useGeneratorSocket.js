/**
 * useGeneratorSocket — Task 9: Socket.IO Integration
 *
 * React hook wrapping SocketService (generator-specific).
 * Manages connection lifecycle, prevents memory leaks, and provides
 * reactive state for components to consume.
 *
 * NOTE: This hook is for the Website Generator job-progress socket.
 *       It is distinct from useSocket.js (which handles online-user presence).
 *
 * Returns:
 *   connectionStatus  — 'disconnected' | 'connecting' | 'connected' | 'simulating' | 'reconnecting' | 'error'
 *   connectionMeta    — extra info (socketId, reason, attempt)
 *   activeJob         — current job object: { project_id, job_id, stage, status, progress, message }
 *   activityLog       — array of { id, ts, level, msg }
 *   isSimulating      — boolean
 *   simulate(stage)   — start a simulation for 'harvest' | 'scaffold' | 'delivery'
 *   simulateError(stage) — start a simulation that errors midway
 *   stopSimulation()  — cancel active simulation
 *   clearLog()        — empty the activity log
 *   projectStatus     — resolved project status after completion (proposal_ready | generated | delivered)
 *   refetchCount      — increments each time 100% triggers a project re-fetch
 */

import { useState, useEffect, useCallback } from "react";
import socketService, { COMPLETION_STATUS } from "../../services/socket";

const MAX_LOG = 100;

// Unique log entry IDs
let logSeq = 0;
function makeLogEntry(level, msg) {
  return {
    id:    ++logSeq,
    ts:    new Date().toLocaleTimeString("en-GB", { hour12: false }),
    level,
    msg,
  };
}

// Maps a connection status event to a human-readable log message
const STATUS_LOG = {
  connecting:    { level: "info",    msg: "Connecting to Socket.IO server…" },
  connected:     { level: "success", msg: (meta) => `Connected. Socket ID: ${meta.socketId}` },
  disconnected:  { level: "warning", msg: (meta) => `Disconnected. Reason: ${meta.reason ?? "unknown"}` },
  reconnecting:  { level: "warning", msg: (meta) => `Reconnecting… attempt ${meta.attempt}` },
  error:         { level: "error",   msg: (meta) => `Connection error: ${meta.message}` },
  simulating:    { level: "info",    msg: (meta) => `[SIM] Starting ${meta.stage} simulation — Job ${meta.jobId}` },
};

// Demo project ID used in simulation mode
const SIM_PROJECT_ID = "hlzsvFY5IIg39rhZrA8DNw";

export default function useGeneratorSocket(projectId = SIM_PROJECT_ID) {
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [connectionMeta, setConnectionMeta] = useState({});
  const [activeJob, setActiveJob] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [projectStatus, setProjectStatus] = useState(null);
  const [refetchCount, setRefetchCount] = useState(0);

  const appendLog = useCallback((level, msg) => {
    const entry = makeLogEntry(level, msg);
    setActivityLog((prev) => {
      const next = [...prev, entry];
      // Evict oldest entries beyond MAX_LOG
      return next.length > MAX_LOG ? next.slice(next.length - MAX_LOG) : next;
    });
  }, []);

  // ── Status change handler ────────────────────────────────────────────────

  const handleStatusChange = useCallback((status, meta = {}) => {
    setConnectionStatus(status);
    setConnectionMeta(meta);
    setIsSimulating(status === "simulating");

    const descriptor = STATUS_LOG[status];
    if (descriptor) {
      const msg = typeof descriptor.msg === "function" ? descriptor.msg(meta) : descriptor.msg;
      appendLog(descriptor.level, msg);
    }
  }, [appendLog]);

  // ── Job progress handler ─────────────────────────────────────────────────

  const handleJobProgress = useCallback((payload) => {
    // Update active job with full spec payload fields
    setActiveJob({
      project_id: payload.project_id,
      job_id:     payload.job_id,
      stage:      payload.stage,
      status:     payload.status,
      progress:   payload.progress,
      message:    payload.message,
    });

    // Append to activity log with the level hint from simulator
    const level = payload._level ?? "info";
    const prefix = payload.stage ? `[${payload.stage.toUpperCase()}] ` : "";
    appendLog(level, `${prefix}${payload.message}`);
  }, [appendLog]);

  // ── Simulation callbacks ─────────────────────────────────────────────────

  const handleSimEvent = useCallback((payload) => {
    // handleJobProgress already called via _dispatch_progress in the service
    // This is a secondary hook for any extra UI reaction
  }, []);

  const handleSimDone = useCallback(({ stage, completionStatus }) => {
    setIsSimulating(false);
    setProjectStatus(completionStatus);
    setRefetchCount((c) => c + 1);

    // Spec §5: "When progress reaches 100%, re-fetch GET /projects/:id"
    // Simulated: log the re-fetch and resolve with the completion status
    appendLog("info",    `[SIM] Progress reached 100% — triggering GET /projects/${projectId}…`);
    appendLog("success", `[SIM] Project re-fetched. New status: ${completionStatus}`);
  }, [appendLog, projectId]);

  const handleSimError = useCallback((payload) => {
    setIsSimulating(false);
    appendLog("error", `[SIM] Job failed: ${payload.message}`);
  }, [appendLog]);

  // ── Register handlers on mount, clean up on unmount ─────────────────────

  useEffect(() => {
    socketService.onStatusChange(handleStatusChange);
    socketService.onJobProgress(handleJobProgress, projectId);

    // Initial log on mount
    appendLog("info", "Socket service initialised. Use simulation or connect to backend.");

    return () => {
      // Cleanup — prevent memory leaks
      socketService.offStatusChange(handleStatusChange);
      socketService.offJobProgress(handleJobProgress);
      socketService.stopSimulation();
    };
  }, [handleStatusChange, handleJobProgress, appendLog, projectId]);

  // ── Public API ───────────────────────────────────────────────────────────

  const simulate = useCallback((stage) => {
    if (isSimulating) return;
    setActiveJob(null);
    setProjectStatus(null);
    socketService.simulate(stage, projectId, handleSimEvent, handleSimDone);
    setIsSimulating(true);
  }, [isSimulating, projectId, handleSimEvent, handleSimDone]);

  const simulateError = useCallback((stage) => {
    if (isSimulating) return;
    setActiveJob(null);
    setProjectStatus(null);
    socketService.simulateError(stage, projectId, handleSimEvent, handleSimDone, handleSimError);
    setIsSimulating(true);
  }, [isSimulating, projectId, handleSimEvent, handleSimDone, handleSimError]);

  const stopSimulation = useCallback(() => {
    socketService.stopSimulation();
    setIsSimulating(false);
    appendLog("warning", "Simulation cancelled by user.");
  }, [appendLog]);

  const clearLog = useCallback(() => {
    setActivityLog([]);
  }, []);

  return {
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
  };
}

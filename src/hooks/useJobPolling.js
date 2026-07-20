import { useState, useEffect, useCallback, useRef } from "react";
import { useAppSocket } from "@/context/SocketProvider";
import { generatorAPI } from "@/utils/APIs/generatorAPI";

/**
 * useJobPolling custom hook (Polling & Socket Service).
 * Subscribes to Socket.IO events and falls back to HTTP polling if disconnected.
 *
 * @param {object} params
 * @param {string} params.projectId - The project ID.
 * @param {string} params.stage - Job stage ("harvest" | "scaffold" | "delivery").
 * @param {function} [params.onComplete] - Callback on job success.
 * @param {function} [params.onFail] - Callback on job failure.
 * @param {boolean} [params.simulate] - Enable simulation mode.
 * @param {number} [params.simulatedProgress] - Mock progress.
 * @param {string} [params.simulatedMessage] - Mock log message.
 * @param {string} [params.simulatedStatus] - Mock status.
 */
export function useJobPolling({
  projectId,
  stage,
  onComplete,
  onFail,
  simulate = false,
  simulatedProgress,
  simulatedMessage,
  simulatedStatus,
  simulatedIsPolling = false,
}) {
  const { socket, isConnected } = useAppSocket();

  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Initializing background worker...");
  const [status, setStatus] = useState("queued"); // "queued" | "running" | "succeeded" | "failed"
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  // Use refs to avoid re-triggering polling timers if callbacks change
  const onCompleteRef = useRef(onComplete);
  const onFailRef = useRef(onFail);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onFailRef.current = onFail;
  }, [onComplete, onFail]);

  // Unified status checker for job data
  const checkJobStatus = useCallback(async () => {
    if (!projectId || !stage || simulate) return false;

    try {
      const res = await generatorAPI.getProjectJobs(projectId);
      if (res.success && Array.isArray(res.data)) {
        // Filter jobs for the active stage
        const jobsForStage = res.data.filter(j => j.stage === stage);
        if (jobsForStage.length > 0) {
          // Get the latest job (sorted by created_at desc)
          const latestJob = jobsForStage.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
          
          setProgress(latestJob.progress);
          if (latestJob.logs && latestJob.logs.length > 0) {
            const lastLog = latestJob.logs[latestJob.logs.length - 1];
            setMessage(lastLog.msg || lastLog.message || "Working...");
          }

          if (latestJob.status === "succeeded" || latestJob.progress === 100) {
            setStatus("succeeded");
            if (onCompleteRef.current) onCompleteRef.current();
            return true; // Finished
          } else if (latestJob.status === "failed") {
            setStatus("failed");
            const errReason = latestJob.error || "An error occurred during execution.";
            setError(errReason);
            if (onFailRef.current) onFailRef.current(errReason);
            return true; // Finished (with error)
          } else {
            setStatus(latestJob.status);
          }
        }
      }
    } catch (err) {
      console.error("Error checking job status in polling hook:", err);
    }
    return false; // Still running or not found
  }, [projectId, stage, simulate]);

  // Main coordinator function
  const runTracking = useCallback(() => {
    if (simulate) {
      if (simulatedProgress !== undefined) setProgress(simulatedProgress);
      if (simulatedMessage !== undefined) setMessage(simulatedMessage);
      if (simulatedStatus !== undefined) setStatus(simulatedStatus);
      setIsPolling(simulatedIsPolling);
      return () => {};
    }

    let active = true;

    // 1. WebSocket Event Listener
    let socketCleanup = null;
    if (socket && isConnected) {
      const handleProgress = (data) => {
        if (!active) return;
        if (data.project_id === projectId && data.stage === stage) {
          setProgress(data.progress);
          if (data.message) setMessage(data.message);
          
          if (data.status === "failed" || data.error) {
            setStatus("failed");
            const errReason = data.error || "An error occurred during execution.";
            setError(errReason);
            if (onFailRef.current) onFailRef.current(errReason);
          } else if (data.progress === 100) {
            setStatus("succeeded");
            setError(null);
            if (onCompleteRef.current) onCompleteRef.current();
          } else {
            setStatus(data.status || "running");
          }
        }
      };

      socket.on("generator:job_progress", handleProgress);
      socketCleanup = () => {
        socket.off("generator:job_progress", handleProgress);
      };
    }

    // 2. HTTP Polling Loop Setup
    let intervalId = null;
    setIsPolling(false);

    const initPollingFallback = async () => {
      // Immediate check
      const done = await checkJobStatus();
      if (!active || done) return;

      // Start interval if socket is unavailable/disconnected
      if (!isConnected || !socket) {
        setIsPolling(true);
        intervalId = setInterval(async () => {
          const finished = await checkJobStatus();
          if (!active) {
            if (intervalId) clearInterval(intervalId);
            return;
          }
          if (finished) {
            if (intervalId) clearInterval(intervalId);
            setIsPolling(false);
          }
        }, 2000);
      }
    };

    initPollingFallback();

    return () => {
      active = false;
      if (socketCleanup) socketCleanup();
      if (intervalId) clearInterval(intervalId);
    };
  }, [socket, isConnected, projectId, stage, simulate, simulatedProgress, simulatedMessage, simulatedStatus, simulatedIsPolling, checkJobStatus]);

  // Run automatically when dependencies update
  useEffect(() => {
    const cleanup = runTracking();
    return () => cleanup();
  }, [runTracking]);

  return {
    progress,
    message,
    status,
    error,
    isPolling,
    triggerPolling: runTracking,
    setProgress,
    setMessage,
    setStatus,
    setError,
  };
}

export default useJobPolling;

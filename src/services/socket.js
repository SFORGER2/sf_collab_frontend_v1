/**
 * SocketService — Task 9: Socket.IO Integration
 *
 * Singleton wrapper around socket.io-client.
 *
 * Real connection:
 *   socketService.connect(SOCKET_URL, jwtToken)
 *   Connects with: io(url, { auth: { token } })
 *   Listens to:    generator:job_progress
 *
 * Simulation (no backend needed):
 *   socketService.simulate(stage, projectId, onEvent, onDone)
 *   Fires spec-accurate { project_id, job_id, stage, progress, message }
 *   events at realistic intervals for harvest / scaffold / delivery stages.
 *
 * Spec reference: Section 5 — Realtime Job Progress (Socket.IO)
 *   Event payload: { project_id, job_id, stage, progress, message }
 *   Stage values:  harvest | scaffold | delivery
 *   Job statuses:  queued | running | succeeded | failed
 */

import { io } from "socket.io-client";

// ─── Simulation scripts per stage ────────────────────────────────────────────

const SIM_SCRIPTS = {
  harvest: [
    { progress: 0,   status: "queued",  level: "info",    msg: "Harvest job queued." },
    { progress: 5,   status: "running", level: "info",    msg: "Connecting to reference URLs…" },
    { progress: 15,  status: "running", level: "info",    msg: "Fetching https://example.com…" },
    { progress: 28,  status: "running", level: "info",    msg: "Extracting branding colours and meta tags…" },
    { progress: 40,  status: "running", level: "info",    msg: "Parsing social profiles…" },
    { progress: 55,  status: "running", level: "info",    msg: "Scraping content sections…" },
    { progress: 68,  status: "running", level: "info",    msg: "Downloading images and assets…" },
    { progress: 80,  status: "running", level: "info",    msg: "Analysing typography and layout patterns…" },
    { progress: 92,  status: "running", level: "info",    msg: "Writing harvest results to database…" },
    { progress: 100, status: "succeeded", level: "success", msg: "Harvest complete. Proposal is ready for review." },
  ],
  scaffold: [
    { progress: 0,   status: "queued",  level: "info",    msg: "Scaffold job queued." },
    { progress: 5,   status: "running", level: "info",    msg: "Loading approved proposal…" },
    { progress: 12,  status: "running", level: "info",    msg: "Rendering database schema (MySQL 8)…" },
    { progress: 22,  status: "running", level: "info",    msg: "Generating Entity models…" },
    { progress: 35,  status: "running", level: "info",    msg: "Scaffolding Express.js API routes…" },
    { progress: 48,  status: "running", level: "info",    msg: "Building React 18 + Vite frontend…" },
    { progress: 60,  status: "running", level: "info",    msg: "Generating page components (Home, Shop, Cart)…" },
    { progress: 72,  status: "running", level: "info",    msg: "Writing GitHub Actions CI workflow…" },
    { progress: 85,  status: "running", level: "info",    msg: "Packaging codebase into ZIP archive…" },
    { progress: 95,  status: "running", level: "info",    msg: "Finalising archive and upload…" },
    { progress: 100, status: "succeeded", level: "success", msg: "Codebase generated. 50 files written. Archive ready." },
  ],
  delivery: [
    { progress: 0,   status: "queued",  level: "info",    msg: "Git delivery job queued." },
    { progress: 8,   status: "running", level: "info",    msg: "Validating personal access token…" },
    { progress: 18,  status: "running", level: "info",    msg: "Creating repository on GitHub…" },
    { progress: 32,  status: "running", level: "info",    msg: "Initialising git repository…" },
    { progress: 48,  status: "running", level: "info",    msg: "Staging 50 files…" },
    { progress: 62,  status: "running", level: "info",    msg: "Committing initial scaffold…" },
    { progress: 78,  status: "running", level: "info",    msg: "Pushing to origin/main…" },
    { progress: 92,  status: "running", level: "info",    msg: "Setting default branch and repository visibility…" },
    { progress: 100, status: "succeeded", level: "success", msg: "Repository delivered. https://github.com/user/bloom-coffee" },
  ],
};

// Generates an opaque-looking job ID to match spec format
function makeJobId() {
  return "SIM-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

// Resolves which project status the pipeline should move to after completion
const COMPLETION_STATUS = {
  harvest: "proposal_ready",
  scaffold: "generated",
  delivery: "delivered",
};

// ─── SocketService class ──────────────────────────────────────────────────────

class SocketService {
  constructor() {
    this._socket = null;           // socket.io-client instance
    this._progressHandlers = [];   // { cb, projectId }
    this._statusHandlers = [];     // connection status change handlers
    this._simInterval = null;      // active simulation timer
    this._simJobId = null;
    this._isSimulating = false;
  }

  // ── Connection ──────────────────────────────────────────────────────────────

  /**
   * Connect to a real Socket.IO server.
   * JWT token is passed via auth handshake (spec §3).
   */
  connect(url, token) {
    if (this._socket) this.disconnect();

    this._emit_status("connecting");

    this._socket = io(url, {
      auth: { token },
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    this._socket.on("connect", () => {
      this._emit_status("connected", { socketId: this._socket.id });
    });

    this._socket.on("disconnect", (reason) => {
      this._emit_status("disconnected", { reason });
    });

    this._socket.on("connect_error", (err) => {
      this._emit_status("error", { message: err.message });
    });

    this._socket.on("reconnect_attempt", (attempt) => {
      this._emit_status("reconnecting", { attempt });
    });

    // Core event — spec §5
    this._socket.on("generator:job_progress", (payload) => {
      this._dispatch_progress(payload);
    });
  }

  disconnect() {
    if (this._socket) {
      this._socket.disconnect();
      this._socket = null;
    }
    this.stopSimulation();
    this._emit_status("disconnected", { reason: "client disconnect" });
  }

  get isConnected() {
    return this._socket?.connected ?? false;
  }

  get socketId() {
    return this._socket?.id ?? null;
  }

  // ── Event Handlers ──────────────────────────────────────────────────────────

  /**
   * Register a handler for generator:job_progress events.
   * Optional projectId filter — only fires for matching project.
   */
  onJobProgress(cb, projectId = null) {
    this._progressHandlers.push({ cb, projectId });
  }

  offJobProgress(cb) {
    this._progressHandlers = this._progressHandlers.filter((h) => h.cb !== cb);
  }

  onStatusChange(cb) {
    this._statusHandlers.push(cb);
  }

  offStatusChange(cb) {
    this._statusHandlers = this._statusHandlers.filter((h) => h !== cb);
  }

  _dispatch_progress(payload) {
    for (const { cb, projectId } of this._progressHandlers) {
      // Filter by project_id if specified (spec §5)
      if (projectId && payload.project_id && payload.project_id !== projectId) continue;
      cb(payload);
    }
  }

  _emit_status(status, meta = {}) {
    for (const cb of this._statusHandlers) {
      cb(status, meta);
    }
  }

  // ── Simulator ───────────────────────────────────────────────────────────────

  /**
   * Simulate a job stage without a backend.
   * Fires spec-accurate payloads at realistic intervals.
   *
   * @param {string} stage       - 'harvest' | 'scaffold' | 'delivery'
   * @param {string} projectId   - project_id to include in payloads
   * @param {function} onEvent   - called with each { project_id, job_id, stage, status, progress, message }
   * @param {function} onDone    - called when stage reaches 100% — trigger re-fetch GET /projects/:id
   * @param {function} onError   - called if simulation is stopped mid-way with a forced error
   */
  simulate(stage, projectId, onEvent, onDone, onError) {
    if (this._isSimulating) return;

    const script = SIM_SCRIPTS[stage];
    if (!script) {
      console.warn(`[SocketService] Unknown stage: ${stage}`);
      return;
    }

    this._isSimulating = true;
    this._simJobId = makeJobId();
    this._emit_status("simulating", { stage, jobId: this._simJobId });

    let idx = 0;
    // Spread ticks: faster early, slight pause at end for drama
    const delays = script.map((_, i) =>
      i === 0 ? 150 : i === script.length - 1 ? 800 : 400 + Math.random() * 200
    );

    const tick = () => {
      if (idx >= script.length) {
        this._isSimulating = false;
        this._simInterval = null;
        return;
      }

      const step = script[idx];
      const payload = {
        project_id: projectId,
        job_id:     this._simJobId,
        stage,
        status:     step.status,
        progress:   step.progress,
        message:    step.msg,
        _level:     step.level, // internal hint for the log
      };

      // Fire into real progress handler pipeline
      this._dispatch_progress(payload);
      onEvent(payload);

      if (step.progress === 100) {
        this._isSimulating = false;
        this._simInterval = null;
        // Spec §5: "When progress reaches 100%, re-fetch GET /projects/:id"
        onDone({ stage, completionStatus: COMPLETION_STATUS[stage] });
        return;
      }

      idx++;
      this._simInterval = setTimeout(tick, delays[idx] ?? 400);
    };

    this._simInterval = setTimeout(tick, delays[0]);
  }

  /**
   * Force-fail a simulation midway through (for testing error states).
   */
  simulateError(stage, projectId, onEvent, onDone, onError) {
    if (this._isSimulating) return;

    const script = SIM_SCRIPTS[stage];
    const halfIdx = Math.floor(script.length / 2);

    this._isSimulating = true;
    this._simJobId = makeJobId();
    this._emit_status("simulating", { stage, jobId: this._simJobId });

    let idx = 0;

    const tick = () => {
      if (idx > halfIdx) {
        // Inject failure
        const errPayload = {
          project_id: projectId,
          job_id:     this._simJobId,
          stage,
          status:     "failed",
          progress:   script[halfIdx].progress,
          message:    `Error: Connection timeout while processing ${stage}.`,
          _level:     "error",
        };
        this._dispatch_progress(errPayload);
        onEvent(errPayload);
        this._isSimulating = false;
        this._simInterval = null;
        if (onError) onError(errPayload);
        return;
      }

      const step = script[idx];
      const payload = {
        project_id: projectId,
        job_id:     this._simJobId,
        stage,
        status:     step.status,
        progress:   step.progress,
        message:    step.msg,
        _level:     step.level,
      };
      this._dispatch_progress(payload);
      onEvent(payload);

      idx++;
      this._simInterval = setTimeout(tick, 350 + Math.random() * 150);
    };

    this._simInterval = setTimeout(tick, 150);
  }

  stopSimulation() {
    if (this._simInterval) {
      clearTimeout(this._simInterval);
      this._simInterval = null;
    }
    if (this._isSimulating) {
      this._isSimulating = false;
      this._emit_status("disconnected", { reason: "simulation stopped" });
    }
  }

  get isSimulating() {
    return this._isSimulating;
  }
}

// Export singleton
const socketService = new SocketService();
export default socketService;
export { COMPLETION_STATUS, SIM_SCRIPTS };

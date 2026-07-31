/**
 * ApiErrorSandbox — Task 23: API Error Handling (Demo / Test Step)
 *
 * Interactive showcase of all 6 spec error codes.
 * Each trigger button fires a mock API call that rejects with the
 * correct error envelope shape, then renders ApiErrorBanner with the result.
 *
 * Pattern mirrors RealtimeTracker's SimulatorPanel for Task 9 —
 * fully testable without a backend.
 *
 * Spec §8 reference table:
 *   401  —                          Redirect to login
 *   404  not_found                  Return to dashboard
 *   409  state_error                Disable invalid actions
 *   422  validation_error           Show inline validation (message + details)
 *   429  —                          Rate-limit warning
 *   502  git_orchestration_error    Allow retry
 */

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { ShieldAlert } from "lucide-react";
import ApiErrorBanner from "./ApiErrorBanner";

// ─── Mock error payloads — match the API response envelope exactly ────────────
const MOCK_ERRORS = [
  {
    id: "401",
    label: "401 Unauthorized",
    httpStatus: 401,
    icon: "🔐",
    colour: "border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10 text-red-300",
    desc: "Session expired",
    error: {
      code: null,
      message: "Your session has expired. Please log in to continue.",
      details: {},
    },
    // 401 shows Log In button
    actions: { login: true },
  },
  {
    id: "404",
    label: "404 Not Found",
    httpStatus: 404,
    icon: "🔍",
    colour: "border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10 text-amber-300",
    desc: "not_found",
    error: {
      code: "not_found",
      message: "Project not found or you do not have access.",
      details: {},
    },
    // 404 shows Back to Dashboard button
    actions: { back: true },
  },
  {
    id: "409",
    label: "409 Conflict",
    httpStatus: 409,
    icon: "⚠️",
    colour: "border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10 text-amber-300",
    desc: "state_error",
    error: {
      code: "state_error",
      message: "Cannot generate — project must be in 'approved' state. Current state: 'draft'.",
      details: {},
    },
    // 409: no retry — disable invalid action (no button)
    actions: {},
  },
  {
    id: "422",
    label: "422 Validation",
    httpStatus: 422,
    icon: "📋",
    colour: "border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10 text-red-300",
    desc: "validation_error",
    error: {
      code: "validation_error",
      message: "Request body contains invalid fields.",
      details: {
        name: "Must be between 2 and 120 characters.",
        "branding.primary_color": "Must be a valid hex colour (#RRGGBB).",
        reference_urls: "Each URL must start with http:// or https://.",
      },
    },
    // 422: no action button — fix fields and resubmit
    actions: {},
  },
  {
    id: "429",
    label: "429 Rate Limited",
    httpStatus: 429,
    icon: "⏱️",
    colour: "border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10 text-amber-300",
    desc: "rate limit",
    error: {
      code: null,
      message: "Generation rate limit reached (10/hour). Please wait before retrying.",
      details: {},
    },
    // 429: no retry button — user must wait
    actions: {},
  },
  {
    id: "502",
    label: "502 Server Error",
    httpStatus: 502,
    icon: "🖥️",
    colour: "border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10 text-red-300",
    desc: "git_orchestration_error",
    error: {
      code: "git_orchestration_error",
      message: "GitHub returned an unexpected response. The repository may not have been created.",
      details: {},
    },
    // 502: allow retry (spec)
    actions: { retry: true },
  },
];

// ─── Simulate a mock API call that returns the error ──────────────────────────
function mockApiCall(mockDef) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject({ httpStatus: mockDef.httpStatus, error: mockDef.error });
    }, 600);
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ApiErrorSandbox() {
  const [active, setActive]   = useState(null); // { httpStatus, error, actions }
  const [loading, setLoading] = useState(null); // id of button currently loading

  const trigger = async (mockDef) => {
    setActive(null);
    setLoading(mockDef.id);
    try {
      await mockApiCall(mockDef);
    } catch (caught) {
      setActive({ ...caught, actions: mockDef.actions });
    } finally {
      setLoading(null);
    }
  };

  const handleRetry = () => {
    // Simulate retry clearing the error then failing again (demo)
    if (active) {
      const current = MOCK_ERRORS.find((m) => m.httpStatus === active.httpStatus);
      if (current) trigger(current);
    }
  };

  const handleDismiss = () => setActive(null);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
            Phase 9 — Error Handling
          </p>
          <h2 className="text-xl font-semibold text-white tracking-wide">
            API Error Handling
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Task 23 · Spec §8 — All 6 HTTP error codes
          </p>
        </div>
        {/* Deliverable pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {["Error State Components", "Inline Validation"].map((label) => (
            <span
              key={label}
              className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20
                         text-red-400 text-[10px] font-bold uppercase tracking-widest"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Trigger panel */}
      <div
        className="rounded-2xl border border-white/5 overflow-hidden"
        style={{ background: "var(--surface-sandbox)" }}
      >
        {/* Panel header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Error Simulator</h3>
            <p className="text-[10px] text-slate-500">Click a code to mock the API response</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* 2×3 button grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {MOCK_ERRORS.map((def) => {
              const isLoading = loading === def.id;
              return (
                <button
                  key={def.id}
                  id={`sim-error-${def.id}-btn`}
                  type="button"
                  disabled={!!loading}
                  onClick={() => trigger(def)}
                  className={`group relative flex flex-col items-start gap-1.5 px-4 py-3.5 rounded-xl border
                              text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                              bg-white/[0.02] ${def.colour}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{def.icon}</span>
                    <span className="text-xs font-semibold">{def.label}</span>
                    {isLoading && (
                      <svg className="w-3 h-3 animate-spin ml-auto opacity-70"
                           viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" d="M12 3v3m6.366.634-2.12 2.12M21 12h-3m-.634 6.366-2.12-2.12M12 21v-3m-6.366-.634 2.12 2.12M3 12h3m.634-6.366 2.12 2.12" />
                      </svg>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-slate-600 truncate max-w-full">
                    {def.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Clear button */}
          <div className="flex items-center gap-3">
            <button
              id="sim-error-clear-btn"
              type="button"
              disabled={!active}
              onClick={handleDismiss}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/8
                         hover:border-white/20 bg-white/[0.02] text-xs font-semibold text-slate-500
                         hover:text-slate-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Clear
            </button>

            {/* Active state label */}
            <AnimatePresence>
              {active && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03]
                             border border-white/8 text-xs text-slate-400"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  Showing HTTP <span className="font-mono text-white ml-1">{active.httpStatus}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live ApiErrorBanner output */}
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={`${active.httpStatus}-${active.error?.code ?? "none"}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ApiErrorBanner
                  httpStatus={active.httpStatus}
                  error={active.error}
                  onRetry={active.actions?.retry ? handleRetry : undefined}
                  onLogin={active.actions?.login ? () => alert("→ Redirect to /login") : undefined}
                  onBack={active.actions?.back ? handleDismiss : undefined}
                  onDismiss={handleDismiss}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spec reference */}
          <p className="text-[10px] text-slate-600 leading-relaxed border-t border-white/5 pt-3">
            Spec §8 — Error envelope:{" "}
            <span className="font-mono text-slate-500">
              {"{ success: false, data: null, error: { code, message, details } }"}
            </span>{" "}
            · Always display <span className="font-mono text-slate-500">error.message</span> ·
            Use <span className="font-mono text-slate-500">error.details</span> for field-level
            validation (422).
          </p>
        </div>
      </div>
    </div>
  );
}

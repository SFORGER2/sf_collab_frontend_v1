/**
 * ApiErrorBanner — Task 23: API Error Handling
 *
 * Spec §8 — handles all 6 HTTP error codes from the Website Generator API.
 *
 * Usage:
 *   <ApiErrorBanner
 *     httpStatus={422}
 *     error={{ code: "validation_error", message: "Name too short", details: { name: "..." } }}
 *     onRetry={() => {}}    // shown on 502
 *     onDismiss={() => {}}  // always available
 *   />
 *
 * Spec error.code values:
 *   401 → —                         → redirect to login
 *   404 → not_found                 → return to dashboard
 *   409 → state_error               → disable invalid actions
 *   422 → validation_error          → show inline validation (error.message + error.details)
 *   429 → —                         → rate-limit warning
 *   502 → git_orchestration_error   → allow retry
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  AlertCircle,
  AlertTriangle,
  ShieldOff,
  Clock,
  ServerCrash,
  LogIn,
  ArrowLeft,
  RefreshCw,
  X,
} from "lucide-react";

// ─── Per-variant config ───────────────────────────────────────────────────────
const VARIANT_CONFIG = {
  unauthorized: {
    // 401
    icon: ShieldOff,
    colour: "red",
    title: "Session Expired",
    defaultMessage: "Your session has expired. Please log in again to continue.",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    titleColor: "text-red-300",
    iconColor: "text-red-400",
    textColor: "text-slate-400",
  },
  not_found: {
    // 404
    icon: AlertTriangle,
    colour: "amber",
    title: "Not Found",
    defaultMessage: "This project could not be found.",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    titleColor: "text-amber-300",
    iconColor: "text-amber-400",
    textColor: "text-slate-400",
  },
  state_error: {
    // 409
    icon: AlertTriangle,
    colour: "amber",
    title: "Action Unavailable",
    defaultMessage: "This action is not valid for the current project state.",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    titleColor: "text-amber-300",
    iconColor: "text-amber-400",
    textColor: "text-slate-400",
  },
  validation_error: {
    // 422
    icon: AlertCircle,
    colour: "red",
    title: "Validation Error",
    defaultMessage: "Please fix the following errors and try again.",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    titleColor: "text-red-300",
    iconColor: "text-red-400",
    textColor: "text-slate-400",
  },
  rate_limited: {
    // 429
    icon: Clock,
    colour: "amber",
    title: "Rate Limit Reached",
    defaultMessage: "You've made too many requests. Please wait a moment before trying again.",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    titleColor: "text-amber-300",
    iconColor: "text-amber-400",
    textColor: "text-slate-400",
  },
  server_error: {
    // 502
    icon: ServerCrash,
    colour: "red",
    title: "Server Error",
    defaultMessage: "An unexpected server error occurred.",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    titleColor: "text-red-300",
    iconColor: "text-red-400",
    textColor: "text-slate-400",
  },
};

// ─── HTTP status → variant key ────────────────────────────────────────────────
function resolveVariant(httpStatus, errorCode) {
  if (httpStatus === 401) return "unauthorized";
  if (httpStatus === 404 || errorCode === "not_found") return "not_found";
  if (httpStatus === 409 || errorCode === "state_error") return "state_error";
  if (httpStatus === 422 || errorCode === "validation_error") return "validation_error";
  if (httpStatus === 429) return "rate_limited";
  if (httpStatus === 502 || errorCode === "git_orchestration_error") return "server_error";
  // Fallback
  return "server_error";
}

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * @param {object}   props
 * @param {number}   [props.httpStatus]  HTTP status code (401 | 404 | 409 | 422 | 429 | 502)
 * @param {object}   [props.error]       API error object: { code, message, details }
 * @param {string}   [props.variant]     Override variant key (skips httpStatus lookup)
 * @param {Function} [props.onRetry]     Retry callback — shows Retry button (502)
 * @param {Function} [props.onLogin]     Login callback — shows Log In button (401)
 * @param {Function} [props.onBack]      Back callback — shows Back to Dashboard button (404)
 * @param {Function} [props.onDismiss]   Dismiss callback — shows × button on all variants
 */
export default function ApiErrorBanner({
  httpStatus,
  error = {},
  variant: variantOverride,
  onRetry,
  onLogin,
  onBack,
  onDismiss,
}) {
  const variantKey = variantOverride ?? resolveVariant(httpStatus, error?.code);
  const cfg = VARIANT_CONFIG[variantKey] ?? VARIANT_CONFIG.server_error;
  const Icon = cfg.icon;

  // Spec: "Always display error.message"
  const message = error?.message || cfg.defaultMessage;

  // Spec: "Use error.details for field-level validation" (422 only)
  const details = error?.details ?? {};
  const detailEntries = Object.entries(details);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      role="alert"
      aria-live="assertive"
      className={`rounded-xl border px-4 py-4 ${cfg.bg} ${cfg.border}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.iconColor}`} aria-hidden="true" />

        {/* Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`text-sm font-semibold ${cfg.titleColor}`}>
                {cfg.title}
                {httpStatus && (
                  <span className="ml-2 text-[11px] font-mono opacity-60">
                    HTTP {httpStatus}
                  </span>
                )}
              </p>
              {/* Spec: always show error.message */}
              <p className={`text-xs mt-0.5 leading-relaxed ${cfg.textColor}`}>{message}</p>
            </div>

            {/* Dismiss × */}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss error"
                className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 422 field-level errors — spec: "Use error.details for field-level validation" */}
          {variantKey === "validation_error" && detailEntries.length > 0 && (
            <ul className="space-y-1 pl-0.5">
              {detailEntries.map(([field, msg]) => (
                <li key={field} className="flex items-start gap-1.5 text-xs text-red-300/80">
                  <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-red-400" aria-hidden="true" />
                  <span>
                    <span className="font-mono text-red-400">{field}</span>
                    {" — "}
                    {msg}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Action buttons */}
          {(onRetry || onLogin || onBack) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {/* 401: Log In */}
              {onLogin && (
                <button
                  id="api-error-login-btn"
                  type="button"
                  onClick={onLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                             font-semibold text-white transition-all active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                    boxShadow: "0 0 10px rgba(124,58,237,0.3)",
                  }}
                >
                  <LogIn className="w-3 h-3" />
                  Log In
                </button>
              )}

              {/* 404: Back to Dashboard */}
              {onBack && (
                <button
                  id="api-error-back-btn"
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                             font-semibold text-amber-300 border border-amber-500/30
                             hover:bg-amber-500/10 transition-all active:scale-95"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Dashboard
                </button>
              )}

              {/* 502: Retry — spec: "Allow retry" */}
              {onRetry && (
                <button
                  id="api-error-retry-btn"
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                             font-semibold text-red-300 border border-red-500/30
                             hover:bg-red-500/10 transition-all active:scale-95"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Named export for easy access to variant keys ─────────────────────────────
export { resolveVariant };

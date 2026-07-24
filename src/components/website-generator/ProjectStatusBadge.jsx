import React from "react";
import { motion } from "framer-motion";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";

/**
 * Status badge config — tuned to the app's dark navy palette.
 * Blues from the scrollbar theme, amber for live, green for success, red for error.
 */
const STATUS_CONFIGS = {
  draft: {
    label: "Draft",
    dot: "#94a3b8",
    bg: "rgba(148,163,184,0.08)",
    border: "rgba(148,163,184,0.15)",
    text: "#94a3b8",
    pulse: false,
  },
  harvesting: {
    label: "Harvesting",
    dot: "#fbbf24",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.22)",
    text: "#fbbf24",
    pulse: true,
  },
  proposal_ready: {
    label: "Proposal Ready",
    dot: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.22)",
    text: "#c4b5fd",
    pulse: false,
  },
  approved: {
    label: "Approved",
    dot: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.22)",
    text: "#c4b5fd",
    pulse: false,
  },
  generating: {
    label: "Generating",
    dot: "#fbbf24",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.22)",
    text: "#fbbf24",
    pulse: true,
  },
  generated: {
    label: "Generated",
    dot: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.22)",
    text: "#c4b5fd",
    pulse: false,
  },
  pushing: {
    label: "Pushing",
    dot: "#fbbf24",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.22)",
    text: "#fbbf24",
    pulse: true,
  },
  delivered: {
    label: "Delivered",
    dot: "#34d399",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.22)",
    text: "#6ee7b7",
    pulse: false,
  },
  failed: {
    label: "Failed",
    dot: "#f87171",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.22)",
    text: "#fca5a5",
    pulse: false,
  },
};

/**
 * ProjectStatusBadge — pill badge matching the app's navy ERP theme.
 *
 * @param {string} status - Pipeline status key.
 * @param {string} [lastError] - Error message shown in tooltip on "failed".
 * @param {string} [className]
 */
export function ProjectStatusBadge({ status, lastError, className = "" }) {
  const key = (status || "draft").toLowerCase();
  const cfg = STATUS_CONFIGS[key] || STATUS_CONFIGS.draft;

  const badge = (
    <motion.span
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide select-none w-fit ${className}`}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.text,
        cursor: key === "failed" ? "help" : "default",
      }}
    >
      {key === "harvesting" || key === "generating" || key === "pushing" ? (
        <svg className="animate-spin h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" style={{ color: cfg.dot }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: cfg.dot,
            flexShrink: 0,
            display: "inline-block",
            animation: cfg.pulse ? "badge-dot-pulse 1.4s ease-in-out infinite" : "none",
          }}
        />
      )}
      {cfg.label}
    </motion.span>
  );

  if (key === "failed") {
    return (
      <>
        <style>{`
          @keyframes badge-dot-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.35; transform: scale(0.8); }
          }
        `}</style>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-xs p-0 overflow-hidden rounded-2xl border-0 shadow-2xl"
          >
            <div
              style={{
                background: "#0e1521",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 16,
                padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#f87171",
                  display: "inline-block", flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fca5a5",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}>
                  Pipeline Failed
                </span>
              </div>
              <div style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "#94a3b8",
                background: "rgba(0,0,0,0.3)",
                borderRadius: 8,
                padding: "8px 10px",
                lineHeight: 1.6,
                wordBreak: "break-word",
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                {lastError || "An unexpected error occurred during execution."}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes badge-dot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.35; transform: scale(0.8); }
        }
      `}</style>
      {badge}
    </>
  );
}

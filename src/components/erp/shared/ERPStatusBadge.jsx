// src/components/erp/shared/ERPStatusBadge.jsx

/**
 * ERPStatusBadge — Consistent status/priority pill badges.
 *
 * Props:
 *   status  — string key  (present, late, absent, high, medium, low, open, etc.)
 *   size    — 'sm' | 'md' (default 'md')
 *   dot     — show leading dot
 */

const BADGE_MAP = {
  // Attendance
  present:          { label: "Present",         color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)" },
  late:             { label: "Late",            color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)" },
  absent:           { label: "Absent",          color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)" },
  not_clocked_in:   { label: "Not Clocked In",  color: "#6b7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.25)" },

  // Priority
  HIGH:   { label: "HIGH",   color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)" },
  MEDIUM: { label: "MEDIUM", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)" },
  LOW:    { label: "LOW",    color: "#6b7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.25)" },

  // Revenue pool status
  open:                  { label: "Open",            color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)" },
  calculating:           { label: "Calculating",     color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)" },
  pending_admin_review:  { label: "Pending Review",  color: "#6366f1", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.25)" },
  locked:                { label: "Locked",          color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)" },
  paid:                  { label: "Paid",            color: "#6b7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.25)" },

  // General
  active:    { label: "Active",   color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)" },
  inactive:  { label: "Inactive", color: "#6b7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.25)" },
  pending:   { label: "Pending",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)" },
  resolved:  { label: "Resolved", color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)" },
  approved:  { label: "Approved", color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)" },
  rejected:  { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)" },
  draft:     { label: "Draft",    color: "#6b7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.25)" },
};

export function ERPStatusBadge({ status, size = "md", dot = true, label: overrideLabel }) {
  const key = typeof status === "string" ? status : "";
  const cfg = BADGE_MAP[key] || {
    label: overrideLabel || key || "Unknown",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.12)",
    border: "rgba(107,114,128,0.25)",
  };

  const displayLabel = overrideLabel || cfg.label;

  const sizeClasses = size === "sm"
    ? "text-[10px] px-2 py-0.5 gap-1"
    : "text-xs px-2.5 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${sizeClasses}`}
      style={{
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: cfg.color }}
        />
      )}
      {displayLabel}
    </span>
  );
}

export default ERPStatusBadge;

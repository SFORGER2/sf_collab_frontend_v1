// src/components/erp/shared/ERPBanner.jsx
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

const TYPE_CFG = {
  success: { icon: CheckCircle2, color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
  error:   { icon: XCircle,      color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)"  },
  info:    { icon: Info,          color: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)" },
  warning: { icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
};

/**
 * ERPBanner — Animated notification banner.
 *
 * Props:
 *   message    — string to display
 *   type       — 'success' | 'error' | 'info' | 'warning'
 *   onDismiss  — optional dismiss callback
 *   autoDismiss — ms (default 0 = no auto-dismiss)
 */
export function ERPBanner({ message, type = "info", onDismiss, autoDismiss = 0 }) {
  const cfg = TYPE_CFG[type] || TYPE_CFG.info;
  const Icon = cfg.icon;

  useEffect(() => {
    if (autoDismiss && onDismiss) {
      const t = setTimeout(onDismiss, autoDismiss);
      return () => clearTimeout(t);
    }
  }, [autoDismiss, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4 text-sm"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      <Icon size={16} className="shrink-0" strokeWidth={2} />
      <span className="flex-1 font-medium" style={{ color: "#e5e7eb" }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 hover:opacity-60 transition-opacity"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      )}
    </motion.div>
  );
}

/**
 * ERPBannerManager — wraps a notice + error pair.
 *
 * Usage:
 *   const [notice, setNotice] = useState(null);
 *   const [error, setError]   = useState(null);
 *   <ERPBannerManager notice={notice} error={error}
 *     onDismissNotice={() => setNotice(null)}
 *     onDismissError={() => setError(null)} />
 */
export function ERPBannerManager({ notice, error, onDismissNotice, onDismissError }) {
  return (
    <AnimatePresence mode="popLayout">
      {notice && (
        <ERPBanner
          key="notice"
          message={notice}
          type="success"
          onDismiss={onDismissNotice}
        />
      )}
      {error && (
        <ERPBanner
          key="error"
          message={error}
          type="error"
          onDismiss={onDismissError}
        />
      )}
    </AnimatePresence>
  );
}

export default ERPBanner;

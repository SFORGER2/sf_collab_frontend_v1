// src/components/erp/shared/ERPEmptyState.jsx
import { motion } from "framer-motion";

/**
 * ERPEmptyState — Premium illustrated empty states.
 *
 * Props:
 *   icon    — Lucide icon element or emoji
 *   title   — Heading text
 *   sub     — Description text
 *   action  — React element (e.g. a button)
 *   compact — Smaller padding
 */
export function ERPEmptyState({ icon, title = "Nothing here yet", sub, action, compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center text-center ${compact ? "py-12 px-6" : "py-20 px-8"}`}
    >
      {/* Icon container */}
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full scale-150" />
        <div className="relative w-16 h-16 rounded-2xl bg-zinc-800/80 border border-white/[0.06] flex items-center justify-center">
          {typeof icon === "string" ? (
            <span className="text-3xl">{icon}</span>
          ) : (
            <span className="text-zinc-400">{icon}</span>
          )}
        </div>
      </div>

      <h3 className="text-base font-semibold text-zinc-200 mb-1.5">{title}</h3>
      {sub && <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">{sub}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

export default ERPEmptyState;

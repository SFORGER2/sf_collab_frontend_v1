// src/components/erp/shared/ERPPageHeader.jsx
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";

/**
 * ERPPageHeader — Universal page header for every ERP module.
 *
 * Props:
 *   icon        — React element (Lucide icon)
 *   title       — Page title string
 *   description — Short subtitle/description
 *   breadcrumbs — Array of { label, href? }
 *   actions     — React element(s) rendered on the right
 *   badge       — Optional badge element next to title
 */
export function ERPPageHeader({ icon, title, description, breadcrumbs = [], actions, badge }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mb-8"
    >
      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 mb-4 text-xs text-zinc-500">
          <Home size={12} className="shrink-0" />
          <ChevronRight size={10} className="text-zinc-700" />
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-zinc-300 transition-colors duration-150"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className={i === breadcrumbs.length - 1 ? "text-zinc-300 font-medium" : ""}>
                  {crumb.label}
                </span>
              )}
              {i < breadcrumbs.length - 1 && (
                <ChevronRight size={10} className="text-zinc-700" />
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Main header row */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          {/* Icon container */}
          {icon && (
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/10">
              <span className="text-indigo-400">{icon}</span>
            </div>
          )}

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white tracking-tight leading-none">
                {title}
              </h1>
              {badge && badge}
            </div>
            {description && (
              <p className="mt-1.5 text-sm text-zinc-400 leading-snug">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mt-6 h-px bg-gradient-to-r from-indigo-500/20 via-white/5 to-transparent" />
    </motion.div>
  );
}

export default ERPPageHeader;

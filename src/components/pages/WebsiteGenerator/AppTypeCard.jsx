import React from "react";
import { motion } from "framer-motion";

/* ── Icon glyphs per app type ─────────────────────────────────────────────── */
function GlobeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.5-2.07V14.5a1.5 1.5 0 013 0v1.43A6 6 0 0110 16v-.07zm-3.89-1.52A5.978 5.978 0 014 10a6 6 0 016-6v1a5 5 0 00-5 5c0 1.13.38 2.17 1.01 3.01L4.61 14.41zM16 10a6 6 0 01-1.01 3.34l-1.41-1.42A5 5 0 0015 10h1zm-3.04 5.43A5.978 5.978 0 0110 16v-1a5 5 0 005-5h1a6 6 0 01-3.04 5.43z" clipRule="evenodd" />
    </svg>
  );
}

function FileTextIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
  );
}

function ShoppingBagIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    </svg>
  );
}

function LayoutDashboardIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2 4a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm1 1v3h3V5H3zm6-1a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm1 1v1h3V5h-3zM2 12a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3zm1 1v2h3v-2H3zm6 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3zm1 1v2h3v-2h-3z" />
    </svg>
  );
}

const ICON_MAP = {
  landing:       GlobeIcon,
  blog:          FileTextIcon,
  ecommerce:     ShoppingBagIcon,
  saas_dashboard: LayoutDashboardIcon,
};

// Per-type theme config
const CARD_THEME = {
  landing: {
    icon:     "bg-sky-500/15 text-sky-400",
    glow:     "rgba(14,165,233,0.3)",
    gradient: "from-sky-500/8 to-transparent",
    border:   "#0ea5e9",
    tags:     ["Startups", "Portfolios", "Agencies"],
  },
  blog: {
    icon:     "bg-amber-500/15 text-amber-400",
    glow:     "rgba(245,158,11,0.3)",
    gradient: "from-amber-500/8 to-transparent",
    border:   "#f59e0b",
    tags:     ["Writers", "Media", "News"],
  },
  ecommerce: {
    icon:     "bg-emerald-500/15 text-emerald-400",
    glow:     "rgba(16,185,129,0.3)",
    gradient: "from-emerald-500/8 to-transparent",
    border:   "#10b981",
    tags:     ["Retail", "D2C", "Marketplace"],
  },
  saas_dashboard: {
    icon:     "bg-violet-500/15 text-violet-400",
    glow:     "rgba(124,58,237,0.3)",
    gradient: "from-violet-500/8 to-transparent",
    border:   "#7c3aed",
    tags:     ["SaaS", "B2B", "Analytics"],
  },
};

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

/**
 * AppTypeCard
 * Props: pack { key, label, description }, isSelected, onSelect
 */
export default function AppTypeCard({ pack, isSelected, onSelect }) {
  const Icon = ICON_MAP[pack.key] ?? GlobeIcon;
  const theme = CARD_THEME[pack.key] ?? CARD_THEME.landing;

  return (
    <motion.button
      type="button"
      id={`app-type-card-${pack.key}`}
      onClick={onSelect}
      aria-pressed={isSelected}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative w-full text-left rounded-2xl border p-5 overflow-hidden
                 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors duration-200"
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${theme.border}18 0%, rgba(0,0,0,0) 80%)`
          : "rgba(255,255,255,0.02)",
        borderColor: isSelected ? theme.border : "rgba(255,255,255,0.08)",
        boxShadow: isSelected
          ? `0 0 0 1px ${theme.border}60, 0 4px 24px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`
          : "none",
      }}
    >
      {/* Shimmer top border line on selected */}
      {isSelected && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${theme.border} 50%, transparent 100%)`,
          }}
        />
      )}

      {/* Background radial on hover/selected */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 transition-opacity duration-300 pointer-events-none`}
        style={{ opacity: isSelected ? 1 : 0 }}
      />

      {/* Selected check badge */}
      {isSelected && (
        <motion.span
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white"
          style={{ background: theme.border }}
          aria-label="Selected"
        >
          <CheckIcon />
        </motion.span>
      )}

      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 ${theme.icon} relative z-10`}
           style={{ boxShadow: isSelected ? `0 4px 12px ${theme.glow}` : "none" }}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Title */}
      <h3 className={`text-sm font-semibold mb-1.5 relative z-10 transition-colors
                      ${isSelected ? "text-white" : "text-slate-200"}`}>
        {pack.label}
      </h3>

      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed mb-3 relative z-10">
        {pack.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 relative z-10">
        {(theme.tags || []).map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
            style={{
              background: isSelected ? `${theme.border}25` : "rgba(255,255,255,0.05)",
              color: isSelected ? theme.border : "rgba(148,163,184,0.8)",
              border: `1px solid ${isSelected ? `${theme.border}40` : "rgba(255,255,255,0.07)"}`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.button>
  );
}

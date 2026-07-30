// src/components/erp/shared/ERPStatCard.jsx
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * ERPStatCard — Premium KPI stat card.
 *
 * Props:
 *   label        — Metric label string
 *   value        — Primary value (string | number)
 *   sub          — Secondary info below value
 *   icon         — React element (Lucide icon)
 *   accent       — CSS color for top border / icon bg tint
 *   accentClass  — Tailwind color class (overrides accent for icon bg)
 *   trend        — 'up' | 'down' | 'neutral'
 *   trendValue   — e.g. "+12%" string
 *   loading      — Show skeleton
 *   onClick      — Optional click handler
 */
export function ERPStatCard({
  label,
  value,
  sub,
  icon,
  accent = "#6366f1",
  trend,
  trendValue,
  loading = false,
  onClick,
}) {
  const trendConfig = {
    up: { icon: TrendingUp, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    down: { icon: TrendingDown, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    neutral: { icon: Minus, color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
  };

  const tc = trend ? trendConfig[trend] || trendConfig.neutral : null;
  const TrendIcon = tc?.icon;

  if (loading) {
    return (
      <div className="bg-[#111115] border border-white/[0.06] rounded-2xl p-5 animate-pulse">
        <div className="h-3 w-16 bg-zinc-800 rounded mb-4" />
        <div className="h-8 w-24 bg-zinc-800 rounded mb-2" />
        <div className="h-2.5 w-20 bg-zinc-800 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ translateY: -2, boxShadow: `0 8px 30px rgba(0,0,0,0.4), 0 0 0 1px ${accent}22` }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onClick={onClick}
      className={`relative bg-[#111115] border border-white/[0.06] rounded-2xl p-5 overflow-hidden group ${onClick ? "cursor-pointer" : ""}`}
      style={{ borderTop: `2px solid ${accent}` }}
    >
      {/* Subtle glow background */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${accent}08, transparent 70%)` }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            {label}
          </p>
          <p
            className="text-3xl font-bold leading-none mb-1 tracking-tight truncate"
            style={{ color: accent }}
          >
            {value ?? "—"}
          </p>
          {sub && (
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{sub}</p>
          )}
        </div>

        {icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: `${accent}18`,
              border: `1px solid ${accent}30`,
            }}
          >
            <span style={{ color: accent }}>{icon}</span>
          </div>
        )}
      </div>

      {tc && (
        <div className="relative mt-3 flex items-center gap-1.5">
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: tc.bg, color: tc.color }}
          >
            <TrendIcon size={10} strokeWidth={2.5} />
            {trendValue}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ERPStatCard;

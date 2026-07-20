/* eslint-disable react-refresh/only-export-components */
import React from "react";

/**
 * Generates a stable deterministic score (1-10) based on string ID/key.
 * Used as fallback if no backend database field is present.
 */
export const getDeterministicScore = (id) => {
  if (!id) return 5;
  const idStr = String(id);
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash % 10) + 1; // Range: 1 to 10
};

export default function ImpactScoreIndicator({ score, size = "md" }) {
  const parsedScore =
    typeof score === "number" ? Math.max(1, Math.min(10, score)) : 5;

  let classification = "Normal";
  let gradientId = "gradient-normal";
  let textClass = "text-cyan-400";
  let bgClass = "bg-blue-500/10 border-blue-500/20";
  let glowColor = "rgba(59, 130, 246, 0.45)";

  if (parsedScore >= 8) {
    classification = "Major";
    gradientId = "gradient-major";
    textClass = "text-rose-400";
    bgClass = "bg-rose-500/10 border-rose-500/20";
    glowColor = "rgba(244, 63, 94, 0.55)";
  } else if (parsedScore >= 5) {
    classification = "Important";
    gradientId = "gradient-important";
    textClass = "text-amber-400";
    bgClass = "bg-amber-500/10 border-amber-500/20";
    glowColor = "rgba(245, 158, 11, 0.5)";
  }

  // SVG parameters (using coordinate space of 36x36)
  const radius = 15.2;
  const strokeWidth = size === "sm" ? 3.0 : 4.0;
  const circumference = 2 * Math.PI * radius; // ~95.5
  const strokeDashoffset = circumference - (parsedScore / 10) * circumference;

  const isSmall = size === "sm";

  return (
    <div
      className="flex flex-col items-center justify-center text-center select-none group transition-all duration-300"
      style={{
        width: isSmall ? "68px" : "88px",
      }}
    >
      {/* SVG Container with Glow effect */}
      <div
        className="relative flex items-center justify-center rounded-full p-0.5 transition-all duration-300 group-hover:scale-105"
        style={{
          width: isSmall ? "48px" : "68px",
          height: isSmall ? "48px" : "68px",
        }}
      >
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 36 36"
          style={{
            filter: `drop-shadow(0 0 5px ${glowColor})`,
          }}
        >
          <defs>
            <linearGradient id="gradient-major" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="gradient-important" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="gradient-normal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          {/* Background circle track */}
          <circle
            className="text-slate-800/90"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="rgba(15, 23, 42, 0.4)"
            r={radius}
            cx="18"
            cy="18"
          />
          {/* Active progress circle */}
          <circle
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="18"
            cy="18"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Text score centered inside circle */}
        <div className="absolute flex flex-col items-center justify-center leading-none">
          <span className={`font-black text-white ${isSmall ? "text-[14px]" : "text-[18px]"} tracking-tight`}>
            {parsedScore}
          </span>
          <span className={`text-slate-400 font-extrabold mt-0.5 ${isSmall ? "text-[8px]" : "text-[10px]"}`}>
            /10
          </span>
        </div>
      </div>

      {/* Label Badge below the circle */}
      <span
        className={`mt-1.5 px-2 py-0.5 rounded-full border uppercase tracking-wider font-extrabold backdrop-blur-md transition-all duration-300 w-full truncate ${
          isSmall ? "text-[8px]" : "text-[9.5px]"
        } ${bgClass} ${textClass}`}
      >
        {classification}
      </span>
    </div>
  );
}

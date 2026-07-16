import { useEffect, useState, useRef } from "react";
import { cn } from "../../lib/utils";

/**
 * MatchScore Component
 * 
 * Renders a premium circular match score visualization.
 * Animates both the filling ring and percentage number.
 * 
 * Props:
 * @param {number} score - The match score percentage (clamped between 0 and 100)
 * @param {number} [size=120] - Outer dimension of the circular graph (in pixels)
 * @param {number} [strokeWidth=8] - Width of the progress ring stroke
 * @param {string} [className] - Optional extra class styling
 */
export function MatchScore({ score, size = 120, strokeWidth = 8, className = "" }) {
  // Clamp score: score < 0 -> 0, score > 100 -> 100
  const clampedScore = Math.min(Math.max(typeof score === "number" ? Math.round(score) : 0, 0), 100);

  // States for display score and animation
  const [displayScore, setDisplayScore] = useState(0);
  const prevScoreRef = useRef(0);

  useEffect(() => {
    const start = prevScoreRef.current;
    const end = clampedScore;
    if (start === end) {
      setDisplayScore(end);
      return;
    }

    const duration = 1000; // 1 second smooth animation
    const startTime = performance.now();
    let animationFrameId;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Cubic ease-out curve for premium feel
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const current = Math.round(start + (end - start) * easeOutCubic);
      setDisplayScore(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        prevScoreRef.current = end;
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [clampedScore]);

  // Determine tiers and styles
  let labelText = "Fair Match";
  let themeColorClass = "text-rose-400";
  let strokeColorClass = "stroke-rose-500";
  let strokeBgClass = "stroke-rose-950/20";
  let glowColor = "rgba(244, 63, 94, 0.35)"; // rose-500 glow

  if (clampedScore >= 70) {
    labelText = "Strong Match";
    themeColorClass = "text-emerald-400";
    strokeColorClass = "stroke-emerald-500";
    strokeBgClass = "stroke-emerald-950/20";
    glowColor = "rgba(16, 185, 129, 0.35)"; // emerald-500 glow
  } else if (clampedScore >= 45) {
    labelText = "Good Match";
    themeColorClass = "text-amber-400";
    strokeColorClass = "stroke-amber-500";
    strokeBgClass = "stroke-amber-950/20";
    glowColor = "rgba(245, 158, 11, 0.35)"; // amber-500 glow
  }

  // SVG calculations (viewBox is 100x100)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * displayScore) / 100;

  return (
    <div 
      className={cn("flex flex-col items-center justify-center gap-3", className)}
      role="progressbar"
      aria-valuenow={displayScore}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={`Match score: ${displayScore}% (${labelText})`}
    >
      <div 
        className="relative flex items-center justify-center select-none"
        style={{ width: size, height: size }}
      >
        {/* Glow effect matching active color */}
        <div 
          className="absolute inset-0 rounded-full transition-shadow duration-1000"
          style={{
            boxShadow: `inset 0 0 12px ${glowColor}, 0 0 16px ${glowColor.replace("0.35", "0.08")}`,
            margin: `${strokeWidth / 2}px`
          }}
        />

        {/* Circular SVG Chart */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full transform -rotate-90 drop-shadow-md"
        >
          {/* Background circle track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={cn("fill-transparent transition-all duration-500", strokeBgClass)}
            strokeWidth={strokeWidth}
          />
          {/* Active progress indicator ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={cn("fill-transparent transition-all duration-300", strokeColorClass)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Centered percentage text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none">
            {displayScore}%
          </span>
        </div>
      </div>

      {/* Title/Label below progress ring */}
      <span className={cn("text-xs md:text-sm font-bold tracking-wider uppercase transition-colors duration-500", themeColorClass)}>
        {labelText}
      </span>
    </div>
  );
}

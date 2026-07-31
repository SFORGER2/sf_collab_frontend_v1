import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { DESIGN_THEMES, type BrandingData } from "../types"

const BUTTON_STYLES: Record<string, string> = {
  square: "rounded-none",
  "slightly-rounded": "rounded-md",
  rounded: "rounded-lg",
  pill: "rounded-full",
}

const RADIUS_VALUES: Record<string, string> = {
  none: "0px",
  small: "4px",
  medium: "8px",
  large: "16px",
  full: "9999px",
}

const FONT_FAMILIES: Record<string, string> = {
  Inter: "'Inter', system-ui, sans-serif",
  Audiowide: "'Audiowide', system-ui, sans-serif",
  "System UI": "system-ui, -apple-system, sans-serif",
  Mono: "ui-monospace, 'SF Mono', monospace",
}

interface ThemePreviewProps {
  branding: BrandingData
  designTheme?: string
  buttonStyle: string
  borderRadius: string
  layout: string
  darkMode: boolean
}

export function ThemePreview({
  branding,
  designTheme,
  buttonStyle,
  borderRadius,
  layout,
  darkMode,
}: ThemePreviewProps) {
  const fontFamily = FONT_FAMILIES[branding.font] || FONT_FAMILIES.Inter
  const btnStyle = BUTTON_STYLES[buttonStyle] || BUTTON_STYLES.rounded
  const cardRadius = RADIUS_VALUES[borderRadius] || RADIUS_VALUES.medium

  // Use design theme colors for preview, fall back to branding colors
  const selectedTheme = designTheme ? DESIGN_THEMES.find((t) => t.id === designTheme) : null
  const primaryColor = selectedTheme?.primaryColor ?? branding.primaryColor
  const accentColor = selectedTheme?.accentColor ?? branding.accentColor

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-xl border overflow-hidden transition-colors duration-300",
        darkMode
          ? "bg-zinc-950 border-zinc-800"
          : "bg-white border-zinc-200"
      )}
    >
      {/* Preview header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-2 text-[10px] font-medium border-b",
        darkMode ? "text-zinc-500 border-zinc-800" : "text-zinc-400 border-zinc-200"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", darkMode ? "bg-zinc-700" : "bg-zinc-300")} />
          <span>Live Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <DeviceIndicator label="DT" active />
        </div>
      </div>

      {/* Preview content */}
      <div
        className={cn(
          "transition-all duration-300",
          layout === "boxed" ? "max-w-md mx-auto" : ""
        )}
        style={{ fontFamily }}
      >
        {/* Hero section */}
        <div
          className={cn(
            "px-6 py-8 sm:py-10 transition-colors duration-300",
            darkMode ? "bg-zinc-900" : "bg-zinc-50"
          )}
        >
          {/* Nav bar mock */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded"
                style={{ backgroundColor: primaryColor }}
              />
              <span
                className="text-xs font-semibold"
                style={{ color: darkMode ? "#fff" : "#111" }}
              >
                Brand
              </span>
            </div>
            <div className="flex items-center gap-3">
              {["Home", "About", "Contact"].map((item) => (
                <span
                  key={item}
                  className="text-[10px]"
                  style={{ color: darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Hero content */}
          <div className="text-center max-w-xs mx-auto space-y-4">
            <motion.div
              className="h-2 rounded-full mx-auto"
              style={{
                width: "60%",
                backgroundColor: primaryColor,
                borderRadius: cardRadius,
              }}
            />
            <p
              className="text-[10px] leading-relaxed"
              style={{ color: darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
            >
              Your compelling headline goes here, capturing attention instantly.
            </p>

            {/* CTA Button */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium transition-all duration-200",
                  btnStyle,
                  darkMode
                    ? "text-white shadow-sm"
                    : "text-white shadow-sm"
                )}
                style={{
                  backgroundColor: primaryColor,
                }}
              >
                Get Started
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium transition-all duration-200 border",
                  btnStyle,
                  darkMode
                    ? "border-zinc-700 text-zinc-300"
                    : "border-zinc-300 text-zinc-600"
                )}
              >
                Learn More
              </motion.div>
            </div>
          </div>
        </div>

        {/* Features grid mock */}
        <div className={cn("px-6 py-6 space-y-4", darkMode ? "bg-zinc-950" : "bg-white")}>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn("p-3 border transition-colors duration-300", darkMode ? "border-zinc-800" : "border-zinc-100")}
                style={{ borderRadius: `calc(${cardRadius} * 0.75)` }}
              >
                <div
                  className="h-1.5 w-8 rounded-full mb-2"
                  style={{
                    backgroundColor: accentColor,
                    borderRadius: cardRadius,
                  }}
                />
                <div
                  className="h-1 w-full rounded-full mb-1"
                  style={{
                    backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                    borderRadius: cardRadius,
                  }}
                />
                <div
                  className="h-1 w-3/4 rounded-full"
                  style={{
                    backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                    borderRadius: cardRadius,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function DeviceIndicator({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={cn(
        "h-4 px-1.5 rounded text-[8px] font-medium flex items-center",
        active ? "bg-primary/10 text-primary" : "text-zinc-500"
      )}
    >
      {label}
    </span>
  )
}

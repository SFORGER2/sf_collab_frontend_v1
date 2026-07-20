import { useState } from "react"
import { motion } from "framer-motion"
import {
  Palette,
  Monitor,
  Moon,
  Sun,
  Check,
  CheckCircle,
  Square,
  MoveHorizontal,
  Maximize2,
  Radius,
} from "lucide-react"
import { DESIGN_THEMES, type WizardData } from "../../types"
import { cn } from "../../lib/utils"
import { ThemePreview } from "../theme-preview"

const LAYOUTS = [
  { id: "full-width", label: "Full Width", description: "Content spans the full screen" },
  { id: "boxed", label: "Boxed", description: "Content centered with max width" },
]

const BUTTON_STYLES = [
  { id: "square", label: "Square", icon: Square, description: "Sharp edges" },
  { id: "slightly-rounded", label: "Soft", icon: MoveHorizontal, description: "Gentle curves" },
  { id: "rounded", label: "Rounded", icon: Radius, description: "Medium rounding" },
  { id: "pill", label: "Pill", icon: Maximize2, description: "Fully rounded" },
]

const RADIUS_OPTIONS = [
  { id: "none", label: "None", value: "0px" },
  { id: "small", label: "Small", value: "4px" },
  { id: "medium", label: "Medium", value: "8px" },
  { id: "large", label: "Large", value: "16px" },
  { id: "full", label: "Full", value: "9999px" },
]

interface DesignPreferencesStepProps {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
}

export function DesignPreferencesStep({ data, onChange }: DesignPreferencesStepProps) {
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(true)

  return (
    <div className="flex flex-col gap-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.05 }}
          className="mx-auto h-10 w-10 rounded-xl bg-brand/[0.08] flex items-center justify-center mb-3"
        >
          <Palette className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-base font-heading tracking-tight text-card-foreground mb-1"
        >
          Design Preferences
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="text-xs text-muted-foreground/70"
        >
          Customize your website appearance — changes reflect instantly
        </motion.p>
      </motion.div>

      {/* Live Preview */}
      {showPreview && data.designTheme && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-card-foreground/70">Live preview</span>
            <button
              onClick={() => setShowPreview(false)}
              className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
            >
              Hide
            </button>
          </div>
          <ThemePreview
            branding={data.branding}
            designTheme={data.designTheme}
            buttonStyle={data.buttonStyle}
            borderRadius={data.borderRadius}
            layout={data.layout}
            darkMode={data.darkMode}
          />
        </motion.div>
      )}

      {!showPreview && (
        <button
          onClick={() => setShowPreview(true)}
          className="text-[11px] text-brand hover:text-brand/80 transition-colors cursor-pointer text-center"
        >
          Show live preview
        </button>
      )}

      {/* Design Themes */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col gap-2"
      >
        <label className="text-xs font-medium text-card-foreground/70 flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
          Design theme <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {DESIGN_THEMES.map((theme, index) => {
            const isSelected = data.designTheme === theme.id
            const isHovered = hoveredTheme === theme.id

            return (
              <motion.button
                key={theme.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04, ease: "easeOut" }}
                onClick={() => onChange({ designTheme: theme.id })}
                onMouseEnter={() => setHoveredTheme(theme.id)}
                onMouseLeave={() => setHoveredTheme(null)}
                className={cn(
                  "relative flex flex-col gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left group",
                  isSelected
                    ? "border-brand bg-brand/[0.03] shadow-sm"
                    : "border-border bg-card hover:border-brand/30 hover:bg-card-hover"
                )}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-brand flex items-center justify-center"
                  >
                    <Check className="h-2.5 w-2.5 text-brand-foreground" strokeWidth={3} />
                  </motion.div>
                )}
                <div className="flex gap-1 h-6 rounded-lg overflow-hidden">
                  <div className="flex-1" style={{ backgroundColor: theme.primaryColor }} />
                  <div className="flex-1" style={{ backgroundColor: theme.accentColor }} />
                </div>
                <div>
                  <span className={cn("text-xs font-semibold transition-colors duration-200", isSelected ? "text-brand" : "text-card-foreground")}>
                    {theme.name}
                  </span>
                  <p className="text-[10px] text-muted-foreground/60 leading-tight mt-0.5 line-clamp-2">
                    {isHovered || isSelected ? theme.description : ""}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Button Style */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.13 }}
        className="flex flex-col gap-2"
      >
        <label className="text-xs font-medium text-card-foreground/70">Button style</label>
        <div className="grid grid-cols-4 gap-2">
          {BUTTON_STYLES.map((style) => {
            const isSelected = data.buttonStyle === style.id
            return (
              <button
                key={style.id}
                onClick={() => onChange({ buttonStyle: style.id })}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "border-brand bg-brand/[0.03]"
                    : "border-border bg-card hover:border-brand/30"
                )}
              >
                <div
                  className={cn(
                    "h-6 w-8 flex items-center justify-center border transition-colors duration-200",
                    isSelected ? "border-brand/30 bg-brand/5" : "border-border bg-secondary/50"
                  )}
                  style={{ borderRadius: style.id === "pill" ? "999px" : style.id === "rounded" ? "6px" : style.id === "slightly-rounded" ? "3px" : "0px" }}
                >
                  <span
                    className="text-[8px] font-bold"
                    style={{ color: data.branding.primaryColor }}
                  >
                    B
                  </span>
                </div>
                <span className={cn("text-[10px] font-medium", isSelected ? "text-brand" : "text-card-foreground")}>
                  {style.label}
                </span>
                <span className="text-[8px] text-muted-foreground/50 leading-tight">{style.description}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Border Radius */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.16 }}
        className="flex flex-col gap-2"
      >
        <label className="text-xs font-medium text-card-foreground/70">Border radius</label>
        <div className="flex gap-2">
          {RADIUS_OPTIONS.map((opt) => {
            const isSelected = data.borderRadius === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => onChange({ borderRadius: opt.id })}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "border-brand bg-brand/[0.03]"
                    : "border-border bg-card hover:border-brand/30"
                )}
              >
                <div
                  className={cn(
                    "h-5 w-8 border-2 transition-colors duration-200",
                    isSelected ? "border-brand/40" : "border-border"
                  )}
                  style={{ borderRadius: opt.value }}
                />
                <span className={cn("text-[10px] font-medium", isSelected ? "text-brand" : "text-card-foreground")}>
                  {opt.label}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Layout Selection */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.19 }}
        className="flex flex-col gap-2"
      >
        <label className="text-xs font-medium text-card-foreground/70 flex items-center gap-1.5">
          <Monitor className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
          Layout
        </label>
        <div className="flex gap-2.5">
          {LAYOUTS.map((layout) => {
            const isSelected = data.layout === layout.id
            return (
              <button
                key={layout.id}
                onClick={() => onChange({ layout: layout.id })}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                  isSelected ? "border-brand bg-brand/[0.03]" : "border-border bg-card hover:border-brand/30"
                )}
              >
                <div className={cn("h-8 w-12 rounded-md border-2 transition-colors duration-200 flex items-center justify-center", isSelected ? "border-brand" : "border-border")}>
                  <div className={cn("h-4 transition-all duration-200 rounded-sm", layout.id === "full-width" ? "w-10 bg-brand/20" : "w-6 bg-brand/20")} />
                </div>
                <span className={cn("text-xs font-medium", isSelected ? "text-brand" : "text-card-foreground")}>{layout.label}</span>
                <span className="text-[10px] text-muted-foreground/50 text-center leading-tight">{layout.description}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {data.designTheme && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="flex items-center justify-center gap-1.5 text-[11px] text-success font-medium"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
            <CheckCircle className="h-3.5 w-3.5" strokeWidth={2} />
          </motion.div>
          {DESIGN_THEMES.find((t) => t.id === data.designTheme)?.name} theme selected
        </motion.div>
      )}

      {/* Dark / Light Mode */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.22 }}
        className="flex flex-col gap-2"
      >
        <label className="text-xs font-medium text-card-foreground/70">Color mode</label>
        <div className="flex gap-2.5">
          {[
            { id: false, label: "Light Mode", icon: Sun },
            { id: true, label: "Dark Mode", icon: Moon },
          ].map((mode) => {
            const isSelected = data.darkMode === mode.id
            const Icon = mode.icon
            return (
              <button
                key={mode.label}
                onClick={() => onChange({ darkMode: mode.id })}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                  isSelected ? "border-brand bg-brand/[0.03]" : "border-border bg-card hover:border-brand/30"
                )}
              >
                <Icon className={cn("h-4 w-4 transition-colors duration-200", isSelected ? "text-brand" : "text-muted-foreground/50")} strokeWidth={1.5} />
                <span className={cn("text-xs font-medium", isSelected ? "text-brand" : "text-card-foreground")}>{mode.label}</span>
              </button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const PRESET_COLORS = [
  { label: "Purple", value: "#503c8c" },
  { label: "Blue", value: "#2563eb" },
  { label: "Teal", value: "#0d9488" },
  { label: "Orange", value: "#ea580c" },
  { label: "Gray", value: "#525252" },
]

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/

function isValidHex(value: string): boolean {
  return HEX_REGEX.test(value)
}

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  description?: string
}

export function ColorPicker({
  value,
  onChange,
  label,
  description,
}: ColorPickerProps) {
  const isPreset = PRESET_COLORS.some((c) => c.value === value)
  const [isCustom, setIsCustom] = useState(!isPreset)

  const isValueValid = useMemo(() => {
    if (isPreset) return true
    return isValidHex(value)
  }, [value, isPreset])

  const showError = isCustom && value.length > 0 && !isValueValid
  const showSuccess = isCustom && value.length > 0 && isValueValid

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-card-foreground/70">
            {label}
          </label>
          {value && isValueValid && (
            <span className="text-[10px] font-mono uppercase text-muted-foreground/40">
              {value}
            </span>
          )}
        </div>
      )}
      {description && (
        <p className="text-[11px] text-muted-foreground/50 -mt-1">
          {description}
        </p>
      )}
      {/* Preset swatches */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.05 } },
          hidden: {},
        }}
        className="flex flex-wrap gap-1.5"
      >
        {PRESET_COLORS.map((c) => (
          <motion.button
            key={c.value}
            variants={{
              hidden: { opacity: 0, scale: 0.5 },
              visible: { opacity: 1, scale: 1 },
            }}
            transition={{ type: "spring", stiffness: 250, damping: 15 }}
            onClick={() => {
              onChange(c.value)
              setIsCustom(false)
            }}
            className={cn(
              "h-8 w-8 rounded-lg border-2 transition-all duration-200 cursor-pointer relative",
              value === c.value
                ? "border-foreground scale-110 ring-2 ring-foreground/20"
                : "border-border hover:border-foreground/40"
            )}
            style={{ backgroundColor: c.value }}
            title={c.label}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            {value === c.value && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 12 }}
                className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
              >
                ✓
              </motion.span>
            )}
          </motion.button>
        ))}
        {/* Custom toggle */}
        <motion.button
          variants={{
            hidden: { opacity: 0, scale: 0.5 },
            visible: { opacity: 1, scale: 1 },
          }}
          transition={{ type: "spring", stiffness: 250, damping: 15 }}
          onClick={() => setIsCustom(true)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "h-8 w-8 rounded-lg border-2 transition-all duration-200 cursor-pointer flex items-center justify-center",
            isCustom
              ? "border-foreground scale-110 ring-2 ring-foreground/20"
              : "border-dashed border-border hover:border-foreground/40"
          )}
          title="Custom color"
        >
          <span className="text-xs text-muted-foreground/50 font-medium">+</span>
        </motion.button>
      </motion.div>
      {/* Custom hex input */}
      {isCustom && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-6 w-6 rounded-md border shrink-0",
                showError ? "border-destructive/50" : "border-border",
                showSuccess ? "border-success/50" : ""
              )}
              style={{
                backgroundColor: isValidHex(value) ? value : undefined,
              }}
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className={cn(
                "h-7 w-28 rounded-md border bg-background px-2 text-xs font-mono text-card-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 transition-all duration-200",
                showError && "border-destructive focus:ring-destructive",
                showSuccess && "border-success/50 focus:ring-success/30",
                !showError && !showSuccess && "border-border focus:ring-ring"
              )}
            />
            <label className="text-[11px] text-muted-foreground/40">Hex</label>
            {showSuccess && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <CheckCircle className="h-3.5 w-3.5 text-success" strokeWidth={2} />
              </motion.div>
            )}
          </div>
          {showError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] text-destructive/70 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
              Invalid hex color. Use format #RRGGBB
            </motion.p>
          )}
        </div>
      )}
    </div>
  )
}

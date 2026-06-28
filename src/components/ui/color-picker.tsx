import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

const PRESET_COLORS = [
  { label: "Purple", value: "#503c8c" },
  { label: "Blue", value: "#2563eb" },
  { label: "Teal", value: "#0d9488" },
  { label: "Orange", value: "#ea580c" },
  { label: "Gray", value: "#525252" },
]

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
  const [isCustom, setIsCustom] = useState(
    !PRESET_COLORS.some((c) => c.value === value)
  )

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-card-foreground/70">
            {label}
          </label>
          {value && (
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
        <div className="flex items-center gap-2 mt-0.5">
          <div
            className="h-6 w-6 rounded-md border border-border shrink-0"
            style={{
              backgroundColor: /^#[0-9a-fA-F]{6}$/.test(value) ? value : undefined,
            }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="h-7 w-28 rounded-md border border-border bg-background px-2 text-xs font-mono text-card-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <label className="text-[11px] text-muted-foreground/40">Hex</label>
        </div>
      )}
    </div>
  )
}

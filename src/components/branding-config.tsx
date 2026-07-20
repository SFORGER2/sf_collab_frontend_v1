import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Palette, Type, Link, Tag, CheckCircle, AlertCircle } from "lucide-react"
import { ColorPicker } from "./ui/color-picker"
import { cn } from "../lib/utils"
import type { BrandingData } from "../types"

const FONTS = ["Inter", "Audiowide", "System UI", "Mono"]

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/

function isValidUrl(s: string): boolean {
  try {
    const url = new URL(s.startsWith("http") ? s : `https://${s}`)
    return url.hostname.includes(".")
  } catch {
    return false
  }
}

interface BrandingConfigProps {
  data: BrandingData
  onChange: (data: BrandingData) => void
  compact?: boolean
}

export function BrandingConfig({
  data,
  onChange,
  compact = false,
}: BrandingConfigProps) {
  const [logoError, setLogoError] = useState<string | null>(null)
  const [logoBlurred, setLogoBlurred] = useState(false)

  const update = (partial: Partial<BrandingData>) => {
    onChange({ ...data, ...partial })
  }

  const isColorsValid = HEX_REGEX.test(data.primaryColor) && HEX_REGEX.test(data.accentColor)
  const isFontSelected = data.font !== ""

  // Validate logo URL on blur or when URL changes after blur
  useEffect(() => {
    if (!logoBlurred || !data.logoUrl) {
      setLogoError(null)
      return
    }
    if (data.logoUrl && !isValidUrl(data.logoUrl)) {
      setLogoError("Please enter a valid URL")
    } else {
      setLogoError(null)
    }
  }, [data.logoUrl, logoBlurred])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("flex flex-col", compact ? "gap-4" : "gap-6")}
    >
      {!compact && (
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
            Branding
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="text-xs text-muted-foreground/70"
          >
            Configure your brand identity, colors, and assets
          </motion.p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={cn("grid gap-5", compact ? "" : "sm:grid-cols-2")}
      >
        {/* Primary Color */}
        <ColorPicker
          value={data.primaryColor}
          onChange={(v) => update({ primaryColor: v })}
          label="Primary color"
          description="Main brand color used for headers, buttons, and accents"
        />

        {/* Accent Color */}
        <ColorPicker
          value={data.accentColor}
          onChange={(v) => update({ accentColor: v })}
          label="Accent color"
          description="Secondary accent color for highlights and interactive elements"
        />
      </motion.div>

      {/* Color preview - with validation summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-[11px] text-muted-foreground/50 font-medium w-20 shrink-0"
        >
          Preview
        </motion.span>
        <motion.div
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.22 }}
          className="flex items-center gap-1.5"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 250, damping: 15, delay: 0.25 }}
            className="h-5 w-5 rounded-md"
            style={{ backgroundColor: data.primaryColor }}
            title="Primary"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 250, damping: 15, delay: 0.28 }}
            className="h-5 w-5 rounded-md"
            style={{ backgroundColor: data.accentColor }}
            title="Accent"
          />
        </motion.div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="text-xs font-medium ml-1"
          style={{ color: data.primaryColor }}
        >
          Sample Text
        </motion.span>
        {isColorsValid && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.35 }}
            className="ml-auto"
          >
            <CheckCircle className="h-3.5 w-3.5 text-success" strokeWidth={2} />
          </motion.div>
        )}
      </motion.div>

      {/* Tagline Field */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex flex-col gap-1.5"
      >
        <div className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
          <label className="text-xs font-medium text-card-foreground/70">
            Tagline
          </label>
        </div>
        <input
          type="text"
          value={data.tagline}
          onChange={(e) => update({ tagline: e.target.value })}
          placeholder="A short description of your website..."
          className="h-9 rounded-lg border border-border bg-background px-3 text-xs text-card-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-ring transition-all duration-200"
        />
      </motion.div>

      {/* Logo URL Field */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="flex flex-col gap-1.5"
      >
        <div className="flex items-center gap-1.5">
          <Link className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
          <label className="text-xs font-medium text-card-foreground/70">
            Logo URL
          </label>
          {data.logoUrl && isValidUrl(data.logoUrl) && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <CheckCircle className="h-3 w-3 text-success" strokeWidth={2} />
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {data.logoUrl && (
            <div className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={data.logoUrl}
                alt=""
                className="h-5 w-5 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none"
                }}
              />
            </div>
          )}
          <input
            type="url"
            value={data.logoUrl}
            onChange={(e) => {
              update({ logoUrl: e.target.value })
              setLogoError(null)
            }}
            onBlur={() => setLogoBlurred(true)}
            placeholder="https://example.com/logo.png"
            className={cn(
              "flex-1 h-9 rounded-lg border bg-background px-3 text-xs font-mono text-card-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 transition-all duration-200",
              logoError ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"
            )}
          />
        </div>
        {logoError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-destructive/70 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
            {logoError}
          </motion.p>
        )}
      </motion.div>

      {/* Font */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-1.5">
          <Type className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
          <label className="text-xs font-medium text-card-foreground/70">
            Font style
          </label>
          {isFontSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <CheckCircle className="h-3 w-3 text-success" strokeWidth={2} />
            </motion.div>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FONTS.map((font) => (
            <button
              key={font}
              onClick={() => update({ font })}
              className={cn(
                "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer",
                data.font === font
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-card-foreground hover:border-foreground/40"
              )}
            >
              {font}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}


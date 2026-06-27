import { Palette } from "lucide-react"
import type { BrandingData } from "../../types"

const FONTS = ["Inter", "Audiowide", "System UI", "Serif", "Mono"]

const PRESET_COLORS = [
  { label: "Brand", value: "#503c8c" },
  { label: "Blue", value: "#2563eb" },
  { label: "Teal", value: "#0d9488" },
  { label: "Green", value: "#16a34a" },
  { label: "Red", value: "#dc2626" },
  { label: "Orange", value: "#ea580c" },
  { label: "Pink", value: "#db2777" },
  { label: "Gray", value: "#525252" },
]

interface BrandingStepProps {
  data: { branding: BrandingData }
  onChange: (data: { branding: BrandingData }) => void
}

export function BrandingStep({ data, onChange }: BrandingStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 rounded-xl bg-brand/[0.08] flex items-center justify-center mb-3">
          <Palette className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-heading tracking-tight text-card-foreground mb-1">
          Branding
        </h3>
        <p className="text-xs text-muted-foreground/70">
          Choose your brand colors and font preferences
        </p>
      </div>

      {/* Primary Color */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-card-foreground/70">
          Primary color
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => onChange({ branding: { ...data.branding, primaryColor: c.value } })}
              className={`h-8 w-8 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                data.branding.primaryColor === c.value
                  ? "border-foreground scale-110 ring-2 ring-foreground/20"
                  : "border-border hover:border-foreground/40"
              }`}
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}
        </div>
        {/* Custom color input */}
        <div className="flex items-center gap-2 mt-1">
          <input
            type="text"
            value={data.branding.primaryColor}
            onChange={(e) => onChange({ branding: { ...data.branding, primaryColor: e.target.value } })}
            className="h-8 w-28 rounded-lg border border-border bg-background px-2.5 text-xs font-mono text-card-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <label className="text-[11px] text-muted-foreground/50">Custom hex</label>
        </div>
      </div>

      {/* Font */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-card-foreground/70">
          Font style
        </label>
        <div className="flex flex-wrap gap-2">
          {FONTS.map((font) => (
            <button
              key={font}
              onClick={() => onChange({ branding: { ...data.branding, font } })}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer ${
                data.branding.font === font
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-card-foreground hover:border-foreground/40"
              }`}
            >
              {font}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

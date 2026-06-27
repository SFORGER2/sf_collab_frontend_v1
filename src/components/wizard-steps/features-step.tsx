import { useState } from "react"
import { Check, Plus, X } from "lucide-react"
import type { WizardData } from "../../types"

const ALL_FEATURES = [
  "Hero section with CTA",
  "Features grid",
  "Testimonials carousel",
  "Contact form",
  "SEO optimized",
  "Rich text editor",
  "Categories & tags",
  "Author profiles",
  "RSS feed",
  "Comment system",
  "Product catalog",
  "Shopping cart",
  "Secure checkout",
  "Payment gateway",
  "Order management",
  "Analytics charts",
  "User management",
  "Subscription billing",
  "API keys",
  "Team collaboration",
]

interface FeaturesStepProps {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
}

export function FeaturesStep({ data, onChange }: FeaturesStepProps) {
  const [customFeature, setCustomFeature] = useState("")

  const toggleFeature = (feature: string) => {
    const next = data.features.includes(feature)
      ? data.features.filter((f) => f !== feature)
      : [...data.features, feature]
    onChange({ features: next })
  }

  const addCustom = () => {
    const trimmed = customFeature.trim()
    if (!trimmed || data.features.includes(trimmed)) return
    onChange({ features: [...data.features, trimmed] })
    setCustomFeature("")
  }

  const removeCustom = (feature: string) => {
    onChange({ features: data.features.filter((f) => f !== feature) })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 rounded-xl bg-brand/[0.08] flex items-center justify-center mb-3">
          <Check className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-heading tracking-tight text-card-foreground mb-1">
          Features
        </h3>
        <p className="text-xs text-muted-foreground/70">
          Select the features you want for your website
        </p>
      </div>

      {/* Feature tags */}
      <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-1">
        {ALL_FEATURES.map((feature) => {
          const selected = data.features.includes(feature)
          return (
            <button
              key={feature}
              onClick={() => toggleFeature(feature)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer ${
                selected
                  ? "border-brand bg-brand/[0.08] text-brand"
                  : "border-border bg-card text-card-foreground hover:border-foreground/40"
              }`}
            >
              {feature}
            </button>
          )
        })}
      </div>

      {/* Custom feature */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Add a custom feature..."
          value={customFeature}
          onChange={(e) => setCustomFeature(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
          className="flex-1 h-9 rounded-xl border border-border bg-background px-3 text-sm placeholder:text-muted-foreground/40 text-card-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={addCustom}
          disabled={!customFeature.trim()}
          className="shrink-0 h-9 w-9 rounded-xl bg-brand text-brand-foreground flex items-center justify-center disabled:opacity-40 transition-opacity cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Selected features */}
      {data.features.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.features.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-brand/[0.08] text-[11px] font-medium text-brand"
            >
              {f}
              <button onClick={() => removeCustom(f)} className="cursor-pointer hover:text-brand/70">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

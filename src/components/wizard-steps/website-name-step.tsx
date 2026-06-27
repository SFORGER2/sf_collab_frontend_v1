import { useState, useEffect } from "react"
import { Type } from "lucide-react"
import type { WizardData, WizardErrors } from "../../types"

interface WebsiteNameStepProps {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
  errors: WizardErrors
  onErrors: (errors: WizardErrors) => void
}

export function WebsiteNameStep({ data, onChange, errors, onErrors }: WebsiteNameStepProps) {
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    const newErrors: WizardErrors = {}
    if (touched || data.name.length > 0) {
      if (!data.name.trim()) {
        newErrors.name = "Website name is required"
      } else if (data.name.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters"
      }
    }
    onErrors(newErrors)
  }, [data.name, touched, onErrors])

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 rounded-xl bg-brand/[0.08] flex items-center justify-center mb-3">
          <Type className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-heading tracking-tight text-card-foreground mb-1">
          Name your website
        </h3>
        <p className="text-xs text-muted-foreground/70">
          Give your project a clear name and description
        </p>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="wiz-name" className="text-xs font-medium text-card-foreground/70">
          Website name <span className="text-destructive">*</span>
        </label>
        <input
          id="wiz-name"
          type="text"
          placeholder="e.g. My Portfolio"
          value={data.name}
          onChange={(e) => {
            setTouched(true)
            onChange({ name: e.target.value })
          }}
          autoFocus
          className={`h-10 rounded-xl border bg-background px-3.5 text-sm placeholder:text-muted-foreground/40 text-card-foreground focus:outline-none focus:ring-1 transition-all duration-200 ${
            errors.name ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"
          }`}
        />
        {errors.name && (
          <p className="text-[11px] text-destructive/80">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="wiz-desc" className="text-xs font-medium text-card-foreground/70">
          Description{" "}
          <span className="text-muted-foreground/40 font-normal">(optional)</span>
        </label>
        <textarea
          id="wiz-desc"
          placeholder="What's this website about?"
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          className="h-20 resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/40 text-card-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent transition-all duration-200"
        />
      </div>
    </div>
  )
}

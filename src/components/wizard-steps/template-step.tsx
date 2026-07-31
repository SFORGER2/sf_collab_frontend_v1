import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  Rocket,
  Palette,
  ShoppingCart,
  Briefcase,
  LayoutDashboard,
  Check,
  CheckCircle,
  type LucideIcon,
} from "lucide-react"
import { TEMPLATES, type WizardData, type WizardErrors } from "../../types"
import { cn } from "@/lib/utils"

const templateIcons: Record<string, LucideIcon> = {
  Building2,
  Rocket,
  Palette,
  ShoppingCart,
  Briefcase,
  LayoutDashboard,
}

interface TemplateStepProps {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
  errors: WizardErrors
  onErrors: (errors: WizardErrors) => void
}

export function TemplateStep({ data, onChange, errors, onErrors }: TemplateStepProps) {
  const selected = data.template
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    onChange({ template: id })
    onErrors({ ...errors, template: undefined })
  }

  const selectedTemplate = TEMPLATES.find((t) => t.id === selected)

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
          <LayoutDashboard className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-base font-heading tracking-tight text-card-foreground mb-1"
        >
          Choose a template
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="text-xs text-muted-foreground/70"
        >
          Select a starting point for your website
        </motion.p>
      </motion.div>

      {/* Template cards grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        {TEMPLATES.map((template, index) => {
          const Icon = templateIcons[template.icon] || Building2
          const isSelected = selected === template.id
          const isHovered = hoveredId === template.id

          return (
            <motion.button
              key={template.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05, ease: "easeOut" }}
              onClick={() => handleSelect(template.id)}
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                "relative flex flex-col gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer group",
                isSelected
                  ? "border-brand bg-brand/[0.03] shadow-sm"
                  : "border-border bg-card hover:border-brand/30 hover:bg-card-hover"
              )}
            >
              {/* Selection checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute top-2 right-2 h-5 w-5 rounded-full bg-brand flex items-center justify-center z-10"
                >
                  <Check className="h-3 w-3 text-brand-foreground" strokeWidth={3} />
                </motion.div>
              )}

              {/* Preview bar - visual representation of the template */}
              <motion.div
                animate={{ height: isHovered || isSelected ? 48 : 36 }}
                className={cn(
                  "rounded-lg overflow-hidden transition-all duration-300 flex items-end",
                )}
              >
                <div className="w-full h-full rounded-lg flex flex-col overflow-hidden">
                  {/* Simulated layout preview */}
                  <div
                    className="h-2 w-full rounded-t-lg"
                    style={{ backgroundColor: template.previewColor }}
                  />
                  <div className="flex-1 bg-secondary/50 p-2 flex flex-col gap-1">
                    <div
                      className="h-1.5 w-16 rounded-full"
                      style={{ backgroundColor: template.previewColor }}
                    />
                    <div className="h-1 w-24 rounded-full bg-muted-foreground/20" />
                    <div className="flex gap-1 mt-1">
                      <div className="h-6 flex-1 rounded bg-muted-foreground/10" />
                      <div className="h-6 flex-1 rounded bg-muted-foreground/10" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Icon + Name */}
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                    isSelected
                      ? "bg-brand text-brand-foreground"
                      : "bg-secondary text-muted-foreground group-hover:bg-brand/10 group-hover:text-brand"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <span
                    className={cn(
                      "text-sm font-semibold transition-colors duration-200",
                      isSelected ? "text-brand" : "text-card-foreground"
                    )}
                  >
                    {template.name}
                  </span>
                  <p className="text-[11px] text-muted-foreground/60 leading-tight mt-0.5 line-clamp-1">
                    {template.description}
                  </p>
                </div>
              </div>

              {/* Features - shown on hover or when selected */}
              <AnimatePresence>
                {(isHovered || isSelected) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/50">
                      {template.features.map((feature, fi) => (
                        <motion.span
                          key={feature}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.15, delay: fi * 0.04 }}
                          className="inline-flex px-2 py-0.5 rounded-md bg-brand/[0.06] text-[10px] font-medium text-brand"
                        >
                          {feature}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>

      {errors.template && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] text-destructive/80 text-center flex items-center justify-center gap-1"
        >
          {errors.template}
        </motion.p>
      )}

      {selected && !errors.template && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="flex items-center justify-center gap-1.5 text-[11px] text-success font-medium"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <CheckCircle className="h-3.5 w-3.5" strokeWidth={2} />
          </motion.div>
          {selectedTemplate?.name} template selected
        </motion.div>
      )}
    </div>
  )
}

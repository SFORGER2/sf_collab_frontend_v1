import { motion } from "framer-motion"
import {
  Monitor,
  ShoppingCart,
  HeartPulse,
  GraduationCap,
  Landmark,
  Building2,
  Palette,
  UtensilsCrossed,
  Heart,
  Briefcase,
  Film,
  Plane,
  MoreHorizontal,
  Check,
  AlertCircle,
  CheckCircle,
  type LucideIcon,
} from "lucide-react"
import { INDUSTRIES, type WizardData, type WizardErrors } from "../../types"
import { cn } from "../../lib/utils"

const industryIcons: Record<string, LucideIcon> = {
  Monitor,
  ShoppingCart,
  HeartPulse,
  GraduationCap,
  Landmark,
  Building2,
  Palette,
  UtensilsCrossed,
  Heart,
  Briefcase,
  Film,
  Plane,
  MoreHorizontal,
}

interface IndustryStepProps {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
  errors: WizardErrors
  onErrors: (errors: WizardErrors) => void
}

export function IndustryStep({ data, onChange, errors, onErrors }: IndustryStepProps) {
  const selected = data.industry

  const handleSelect = (id: string) => {
    onChange({ industry: id })
    onErrors({ ...errors, industry: undefined })
  }

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
          <Briefcase className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-base font-heading tracking-tight text-card-foreground mb-1"
        >
          Select your industry
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="text-xs text-muted-foreground/70"
        >
          Choose the industry that best describes your business
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {INDUSTRIES.map((industry, index) => {
          const Icon = industryIcons[industry.icon] || MoreHorizontal
          const isSelected = selected === industry.id

          return (
            <motion.button
              key={industry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03, ease: "easeOut" }}
              onClick={() => handleSelect(industry.id)}
              className={cn(
                "relative flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer group",
                isSelected
                  ? "border-brand bg-brand/[0.03] shadow-sm"
                  : "border-border bg-card hover:border-brand/30 hover:bg-card-hover"
              )}
            >
              {/* Checkmark */}
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

              {/* Icon */}
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

              {/* Label */}
              <span
                className={cn(
                  "text-xs font-medium leading-tight transition-colors duration-200",
                  isSelected ? "text-brand" : "text-card-foreground"
                )}
              >
                {industry.label}
              </span>
            </motion.button>
          )
        })}
      </div>

      {errors.industry && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] text-destructive/80 text-center flex items-center justify-center gap-1"
        >
          <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
          {errors.industry}
        </motion.p>
      )}

      {selected && !errors.industry && (
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
          {getIndustryLabel(selected)} selected
        </motion.div>
      )}
    </div>
  )
}

function getIndustryLabel(id: string): string {
  const industry = INDUSTRIES.find((i) => i.id === id)
  return industry?.label ?? id
}

import { motion } from "framer-motion"
import {
  Search,
  Upload,
  FileText,
  Zap,
  Rocket,
  Check,
  Loader2,
  AlertCircle,
  type LucideIcon,
} from "lucide-react"
import type { WorkspaceStep } from "../../types"
import { cn } from "@/lib/utils"

const STEP_ICONS: Record<string, LucideIcon> = {
  Search,
  Upload,
  FileText,
  Zap,
  Rocket,
}

interface StepperProps {
  steps: WorkspaceStep[]
  activeStep: string
  onStepClick: (stepId: string) => void
}

export function Stepper({ steps, activeStep, onStepClick }: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-0">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[step.icon] || FileText
          const isActive = step.id === activeStep
          const isCompleted = step.status === "completed"
          const isError = step.status === "error"
          const isInProgress = step.status === "in-progress"
          const isClickable = isCompleted || isInProgress || step.id === activeStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className={cn("flex items-center", isLast ? "" : "flex-1")}>
              {/* Step indicator + label */}
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-2 relative group",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                {/* Circle */}
                <motion.div
                  layout
                  className={cn(
                    "relative h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isCompleted && "border-success bg-success text-success-foreground",
                    isInProgress && "border-brand bg-brand/10 text-brand",
                    isActive && isInProgress && "ring-2 ring-brand/20",
                    isError && "border-destructive bg-destructive/10 text-destructive",
                    !isCompleted && !isInProgress && !isError && "border-border bg-card text-muted-foreground/40"
                  )}
                >
                  {isCompleted && <Check className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={2.5} />}
                  {isInProgress && !isActive && (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" strokeWidth={2} />
                  )}
                  {isActive && isInProgress && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    >
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={1.5} />
                    </motion.div>
                  )}
                  {isError && <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={2} />}
                  {!isCompleted && !isInProgress && !isError && (
                    <span className="text-[10px] sm:text-xs font-medium tabular-nums">{index + 1}</span>
                  )}

                  {/* Active pulse ring */}
                  {isActive && isInProgress && (
                    <motion.span
                      initial={{ scale: 1, opacity: 0.4 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full border-2 border-brand"
                    />
                  )}
                </motion.div>

                {/* Label */}
                <div className="text-center hidden sm:block">
                  <motion.span
                    layout
                    className={cn(
                      "block text-xs font-medium transition-colors duration-200",
                      isActive && "text-foreground",
                      isCompleted && "text-success",
                      isError && "text-destructive",
                      !isActive && !isCompleted && !isError && "text-muted-foreground/50"
                    )}
                  >
                    {step.label}
                  </motion.span>
                </div>
              </button>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-1.5 sm:mx-3 mb-0 sm:mb-8">
                  <div className="h-[2px] rounded-full bg-border relative overflow-hidden">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isCompleted ? 1 : 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute inset-0 bg-success origin-left"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

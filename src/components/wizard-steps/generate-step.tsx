import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Loader2, Check, Sparkles } from "lucide-react"
import { cn } from "../../lib/utils"

const GENERATION_STEPS = [
  { label: "Generating Layout", icon: "📐", duration: 1200 },
  { label: "Writing Content", icon: "✍️", duration: 1200 },
  { label: "Creating Design", icon: "🎯", duration: 1000 },
  { label: "Optimizing Images", icon: "🖼️", duration: 900 },
  { label: "Finalizing Website", icon: "✨", duration: 1100 },
]

interface GenerateStepProps {
  onComplete: () => void
}

export function GenerateStep({ onComplete }: GenerateStepProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const advance = useCallback(() => {
    if (currentStep < GENERATION_STEPS.length - 1) {
      setCompletedSteps((prev) => [...prev, currentStep])
      setTimeout(() => setCurrentStep((prev) => prev + 1), 300)
    } else {
      setCompletedSteps((prev) => [...prev, currentStep])
      setTimeout(onComplete, 800)
    }
  }, [currentStep, onComplete])

  useEffect(() => {
    if (currentStep >= GENERATION_STEPS.length) return
    const timer = setTimeout(advance, GENERATION_STEPS[currentStep].duration)
    return () => clearTimeout(timer)
  }, [currentStep, advance])

  const progress = ((completedSteps.length) / GENERATION_STEPS.length) * 100

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Animated logo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="relative"
      >
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand to-brand/60 flex items-center justify-center shadow-lg shadow-brand/20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          >
            <Sparkles className="h-7 w-7 text-white" strokeWidth={1.5} />
          </motion.div>
        </div>
        {/* Pulse ring */}
        <motion.span
          initial={{ scale: 1, opacity: 0.4 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-2xl border-2 border-brand/30"
        />
      </motion.div>

      {/* Title */}
      <div className="text-center">
        <motion.h3
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-heading tracking-tight text-card-foreground mb-1"
        >
          Generating your website
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xs text-muted-foreground/70"
        >
          Creating your custom site with AI
        </motion.p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="h-1.5 rounded-full bg-border/50 overflow-hidden">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-brand origin-left rounded-full"
          />
        </div>
      </div>

      {/* Generation steps */}
      <div className="w-full max-w-sm flex flex-col gap-2">
        {GENERATION_STEPS.map((step, index) => {
          const isActive = index === currentStep
          const isDone = completedSteps.includes(index)

          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{
                opacity: isDone || isActive ? 1 : 0.4,
                x: 0,
              }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300",
                isActive && "bg-brand/[0.05] border border-brand/10",
                isDone && "opacity-60"
              )}
            >
              {/* Status icon */}
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                  isDone && "bg-success/10 text-success",
                  isActive && "bg-brand/10 text-brand",
                  !isDone && !isActive && "bg-border/50 text-muted-foreground/30"
                )}
              >
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </motion.div>
                ) : isActive ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                ) : (
                  <span className="text-[10px] font-medium">{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-xs transition-colors duration-200",
                  isDone && "text-success",
                  isActive && "text-card-foreground font-medium",
                  !isDone && !isActive && "text-muted-foreground/50"
                )}
              >
                {step.label}
              </span>

              {/* Emoji */}
              <motion.span
                className="ml-auto text-sm"
                animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
              >
                {step.icon}
              </motion.span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

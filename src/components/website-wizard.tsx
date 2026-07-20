import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Modal } from "./ui/modal"
import { Button } from "./ui/button"
import { BusinessInfoStep } from "./wizard-steps/business-info-step"
import { TemplateStep } from "./wizard-steps/template-step"
import { IndustryStep } from "./wizard-steps/industry-step"
import { BrandDetailsStep } from "./wizard-steps/brand-details-step"
import { DesignPreferencesStep } from "./wizard-steps/design-preferences-step"
import { ReviewStep } from "./wizard-steps/review-step"
import { GenerateStep } from "./wizard-steps/generate-step"
import { useCreateProject } from "../hooks/use-create-project"
import { useToast } from "../hooks/use-toast"
import {
  STEP_ORDER,
  STEP_LABELS,
  getDefaultWizardData,
  type WizardData,
  type WizardErrors,
  type Project,
} from "../types"
import { cn } from "../lib/utils"

const WIZARD_STORAGE_KEY = "sfcollab_wizard_progress"

interface WebsiteWizardProps {
  open: boolean
  onClose: () => void
  onCreateProject?: (project: Project) => void
}

function loadWizardProgress(): Partial<WizardData> | null {
  try {
    const raw = localStorage.getItem(WIZARD_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Ensure only valid fields from WizardData are loaded
      if (parsed && typeof parsed === "object") {
        return parsed
      }
    }
  } catch {
    // corrupted data
  }
  return null
}

function saveWizardProgress(data: WizardData) {
  try {
    localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // storage full
  }
}

function clearWizardProgress() {
  try {
    localStorage.removeItem(WIZARD_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function WebsiteWizard({
  open,
  onClose,
  onCreateProject,
}: WebsiteWizardProps) {
  const { addToast } = useToast()
  const { createProject, isCreating } = useCreateProject()
  const [stepIndex, setStepIndex] = useState(0)
  const [data, setData] = useState<WizardData>(() => {
    const defaults = getDefaultWizardData()
    const saved = loadWizardProgress()
    return saved ? { ...defaults, ...saved } : defaults
  })
  const [errors, setErrors] = useState<WizardErrors>({})
  const [isGenerating, setIsGenerating] = useState(false)

  const currentStep = STEP_ORDER[stepIndex]
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === STEP_ORDER.length - 1
  const isReviewStep = currentStep === "review"

  // Persist wizard progress to localStorage whenever data changes
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (open) {
      // Debounce saves to avoid excessive writes
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
      persistTimerRef.current = setTimeout(() => saveWizardProgress(data), 300)
    }
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    }
  }, [data, open])

  const handleClose = useCallback(() => {
    setStepIndex(0)
    setData(getDefaultWizardData())
    setErrors({})
    setIsGenerating(false)
    clearWizardProgress()
    onClose()
  }, [onClose])

  const updateData = useCallback((partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }, [])

  const updateErrors = useCallback((newErrors: WizardErrors) => {
    setErrors(newErrors)
  }, [])

  const handleEditStep = useCallback((stepIdx: number) => {
    setStepIndex(stepIdx)
    setIsGenerating(false)
  }, [])

  const handleNext = () => {
    if (isReviewStep) {
      // From review, we go to the generate step (not create yet)
      setStepIndex((i) => Math.min(i + 1, STEP_ORDER.length - 1))
      return
    }

    if (isLastStep) {
      // Generate step - already handled by GenerateStep onComplete
      return
    }

    setStepIndex((i) => Math.min(i + 1, STEP_ORDER.length - 1))
  }

  const handleBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  const handleGenerateComplete = useCallback(async () => {
    setIsGenerating(true)
    try {
      const project = await createProject({
        name: data.websiteName.trim(),
        description: data.description.trim() || undefined,
        packId: data.template || undefined,
        branding: data.branding,
        features: data.features.length > 0 ? data.features : undefined,
        referenceUrls: data.referenceUrls.length > 0 ? data.referenceUrls : undefined,
        designTheme: data.designTheme,
      })

      onCreateProject?.(project)

      addToast({
        title: "Website generated!",
        description: `${data.websiteName} has been created successfully.`,
        variant: "success",
      })

      handleClose()
    } catch {
      addToast({
        title: "Failed to create website",
        description: "An error occurred. Please check your connection and try again.",
        variant: "destructive",
      })
      setIsGenerating(false)
    }
  }, [data, createProject, onCreateProject, addToast, handleClose])

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case "business-info":
        return data.businessName.trim().length >= 2 && data.websiteName.trim().length >= 2
      case "template":
        return data.template !== ""
      case "industry":
        return data.industry !== ""
      case "brand-details": {
        const hexRegex = /^#[0-9a-fA-F]{6}$/
        const colorsValid = hexRegex.test(data.branding.primaryColor) && hexRegex.test(data.branding.accentColor)
        const fontValid = data.branding.font !== ""
        return colorsValid && fontValid
      }
      case "design-preferences":
        return data.designTheme !== ""
      case "review":
        return true
      case "generate":
        return true
      default:
        return true
    }
  }, [currentStep, data])

  const nextLabel = useMemo(() => {
    if (currentStep === "review") return "Generate Website"
    return "Continue"
  }, [currentStep])

  return (
    <Modal open={open} onClose={handleClose} title="Create Website">
      {/* Progress bar - only show before generate step */}
      {currentStep !== "generate" && (
        <div className="mb-5 px-0.5">
          {/* Step circles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center mb-3"
          >
            {STEP_ORDER.map((step, i) => {
              const isComplete = i < stepIndex
              const isCurrent = i === stepIndex

              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  {/* Circle */}
                  <div className="flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className={cn(
                        "h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        isComplete && "border-success bg-success text-success-foreground",
                        isCurrent && "border-brand bg-brand/10 text-brand",
                        !isComplete && !isCurrent && "border-border bg-card text-muted-foreground/40"
                      )}
                    >
                      {isComplete ? (
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      ) : (
                        <span className="text-[10px] font-medium tabular-nums">{i + 1}</span>
                      )}
                    </motion.div>
                  </div>

                  {/* Connector line */}
                  {i < STEP_ORDER.length - 1 && (
                    <div className="flex-1 mx-1">
                      <div className="h-[2px] rounded-full bg-border relative overflow-hidden">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: isComplete ? 1 : 0 }}
                          transition={{ duration: 0.4 }}
                          className="absolute inset-0 bg-success origin-left"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </motion.div>

          {/* Step label */}
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex items-center justify-between px-0.5"
          >
            <motion.span
              key={currentStep}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[11px] font-medium text-brand"
            >
              {STEP_LABELS[currentStep]}
            </motion.span>
            <span className="text-[11px] text-muted-foreground/50 tabular-nums">
              Step {stepIndex + 1} of {STEP_ORDER.length}
            </span>
          </motion.div>
        </div>
      )}

      {/* Step content */}
      <div className="min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {currentStep === "business-info" && (
              <BusinessInfoStep data={data} onChange={updateData} errors={errors} onErrors={updateErrors} />
            )}
            {currentStep === "template" && (
              <TemplateStep data={data} onChange={updateData} errors={errors} onErrors={updateErrors} />
            )}
            {currentStep === "industry" && (
              <IndustryStep data={data} onChange={updateData} errors={errors} onErrors={updateErrors} />
            )}
            {currentStep === "brand-details" && (
              <BrandDetailsStep
                data={{ branding: data.branding }}
                onChange={(partial) => updateData({ branding: partial.branding })}
              />
            )}
            {currentStep === "design-preferences" && (
              <DesignPreferencesStep data={data} onChange={updateData} />
            )}
            {currentStep === "review" && (
              <ReviewStep data={data} onEditStep={handleEditStep} />
            )}
            {currentStep === "generate" && (
              <GenerateStep onComplete={handleGenerateComplete} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions - only show before generate step */}
      {currentStep !== "generate" && (
        <div className="flex items-center justify-between gap-2 mt-5 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={isFirstStep ? handleClose : handleBack}
            disabled={isCreating || isGenerating}
            className="gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {isFirstStep ? "Cancel" : "Back"}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleNext}
            disabled={!canProceed || isCreating || isGenerating}
            className="gap-1.5"
          >
            {isCreating || isGenerating ? (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
            {isCreating || isGenerating ? "Processing..." : nextLabel}
          </Button>
        </div>
      )}
    </Modal>
  )
}

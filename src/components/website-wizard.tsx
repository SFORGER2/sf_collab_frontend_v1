import { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Modal } from "./ui/modal"
import { Button } from "./ui/button"
import { WebsiteNameStep } from "./wizard-steps/website-name-step"
import { AppTypeStep } from "./wizard-steps/app-type-step"
import { BrandingStep } from "./wizard-steps/branding-step"
import { FeaturesStep } from "./wizard-steps/features-step"
import { ReferenceUrlsStep } from "./wizard-steps/reference-urls-step"
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

interface WebsiteWizardProps {
  open: boolean
  onClose: () => void
  onCreateProject?: (project: Project) => void
}

export function WebsiteWizard({
  open,
  onClose,
  onCreateProject,
}: WebsiteWizardProps) {
  const { addToast } = useToast()
  const { createProject, isCreating } = useCreateProject()
  const [stepIndex, setStepIndex] = useState(0)
  const [data, setData] = useState<WizardData>(getDefaultWizardData())
  const [errors, setErrors] = useState<WizardErrors>({})

  const currentStep = STEP_ORDER[stepIndex]
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === STEP_ORDER.length - 1

  const handleClose = useCallback(() => {
    setStepIndex(0)
    setData(getDefaultWizardData())
    setErrors({})
    onClose()
  }, [onClose])

  const updateData = useCallback((partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }, [])

  const updateErrors = useCallback((newErrors: WizardErrors) => {
    setErrors(newErrors)
  }, [])

  const handleNext = () => {
    // Inline validation — read from data directly, not from stale errors state
    if (currentStep === "name") {
      if (!data.name.trim()) {
        setErrors((prev) => ({ ...prev, name: "Website name is required" }))
        return
      }
      if (data.name.trim().length < 2) {
        setErrors((prev) => ({ ...prev, name: "Name must be at least 2 characters" }))
        return
      }
    }

    if (isLastStep) {
      handleCreate()
    } else {
      setStepIndex((i) => Math.min(i + 1, STEP_ORDER.length - 1))
    }
  }

  const handleBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  const handleCreate = async () => {
    const project = await createProject({
      name: data.name.trim(),
      description: data.description.trim() || undefined,
      packId: data.packId ?? undefined,
      branding: data.branding,
      features: data.features.length > 0 ? data.features : undefined,
      referenceUrls: data.referenceUrls.length > 0 ? data.referenceUrls : undefined,
    })

    onCreateProject?.(project)

    addToast({
      title: "Website created!",
      description: `${data.name} has been created as a draft.`,
      variant: "success",
    })

    handleClose()
  }

  const canProceed = useMemo(() => {
    if (currentStep === "name") return data.name.trim().length >= 2
    if (currentStep === "app-type") return data.packId !== null
    if (currentStep === "features") return true // features are optional
    if (currentStep === "urls") return true // urls are optional
    return true
  }, [currentStep, data])

  return (
    <Modal open={open} onClose={handleClose} title="Create Website">
      {/* Progress bar */}
      <div className="mb-5 px-0.5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-1.5 mb-2"
        >
          {STEP_ORDER.map((step, i) => (
            <motion.div
              key={step}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
              className="flex-1 flex items-center gap-0 origin-left"
            >
              <div
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  i <= stepIndex ? "bg-brand" : "bg-border"
                }`}
              />
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
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
            {stepIndex + 1} / {STEP_ORDER.length}
          </span>
        </motion.div>
      </div>

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
            {currentStep === "name" && (
              <WebsiteNameStep data={data} onChange={updateData} errors={errors} onErrors={updateErrors} />
            )}
            {currentStep === "app-type" && (
              <AppTypeStep data={data} onChange={updateData} errors={errors} onErrors={updateErrors} />
            )}
            {currentStep === "branding" && (
              <BrandingStep
                data={{ branding: data.branding }}
                onChange={(partial) => updateData({ branding: partial.branding })}
              />
            )}
            {currentStep === "features" && (
              <FeaturesStep data={data} onChange={updateData} />
            )}
            {currentStep === "urls" && (
              <ReferenceUrlsStep data={data} onChange={updateData} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 mt-5 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={isFirstStep ? handleClose : handleBack}
          disabled={isCreating}
          className="gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {isFirstStep ? "Cancel" : "Back"}
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={handleNext}
          disabled={!canProceed || isCreating}
          className="gap-1.5"
        >
          {isCreating ? (
            <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : !isLastStep ? (
            <ArrowRight className="h-3.5 w-3.5" />
          ) : null}
          {isCreating ? "Creating..." : isLastStep ? "Create Website" : "Continue"}
        </Button>
      </div>
    </Modal>
  )
}

import { useState, useCallback, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Search,
  Upload,
  FileText,
  Zap,
  Rocket,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Circle,
} from "lucide-react"
import { Stepper } from "./ui/stepper"
import { Button } from "./ui/button"
import { useProject } from "../hooks/use-project"
import { cn } from "../lib/utils"
import { scaleFadeIn, getScaleFadeTransition } from "../lib/animations"
import type { WorkspaceStepId, FullProject } from "../types"

interface WorkspaceProps {
  projectId: string | null
  onBack: () => void
}

interface StepItem {
  label: string
  description: string
}

const STEP_ITEMS: Record<WorkspaceStepId, { icon: typeof Search; title: string; items: StepItem[] }> = {
  discovery: {
    icon: Search,
    title: "Discovery",
    items: [
      { label: "Project Brief", description: "Define the project scope and objectives" },
      { label: "Target Audience", description: "Define who the website is for" },
      { label: "Competitor Analysis", description: "Research competing websites in the same space" },
      { label: "Goal Definition", description: "Clarify primary objectives and KPIs" },
    ],
  },
  harvest: {
    icon: Upload,
    title: "Harvest",
    items: [
      { label: "Content Collection", description: "Gather text, images, and media assets" },
      { label: "Brand Assets", description: "Branding colors and design tokens" },
      { label: "Reference URLs", description: "Collect reference website URLs" },
      { label: "Feature Requests", description: "Document requested features" },
    ],
  },
  proposal: {
    icon: FileText,
    title: "Proposal",
    items: [
      { label: "Site Architecture", description: "Define page structure and navigation" },
      { label: "Design Mockups", description: "Preview layout and styling" },
      { label: "Content Strategy", description: "Plan content hierarchy and SEO" },
      { label: "Timeline Estimate", description: "Estimated completion time" },
    ],
  },
  generate: {
    icon: Zap,
    title: "Generate",
    items: [
      { label: "Page Generation", description: "AI-powered page creation" },
      { label: "Content Population", description: "Insert collected content" },
      { label: "Style Application", description: "Apply branding and theming" },
      { label: "Quality Check", description: "Review and polish output" },
    ],
  },
  deliver: {
    icon: Rocket,
    title: "Deliver",
    items: [
      { label: "Build", description: "Final build and compilation" },
      { label: "Deploy", description: "Push to production" },
      { label: "Domain Setup", description: "Configure custom domain" },
      { label: "Launch", description: "Website is live!" },
    ],
  },
}

function getItemDescription(
  stepId: WorkspaceStepId,
  itemLabel: string,
  project: FullProject
): string {
  const base = STEP_ITEMS[stepId].items.find((i) => i.label === itemLabel)?.description || ""

  if (stepId === "harvest") {
    if (itemLabel === "Brand Assets") {
      return project.branding
        ? `Primary: ${project.branding.primaryColor}, Accent: ${project.branding.accentColor}`
        : "No branding configured"
    }
    if (itemLabel === "Reference URLs") {
      return project.referenceUrls?.length
        ? `${project.referenceUrls.length} URLs collected`
        : "No reference URLs provided"
    }
    if (itemLabel === "Feature Requests") {
      return project.features?.length
        ? `${project.features.length} features defined`
        : "No features defined"
    }
  }

  if (stepId === "discovery" && itemLabel === "Project Brief") {
    return project.description || "No description provided"
  }

  return base
}

function StepContent({
  stepId,
  project,
  completedItems,
  onToggleItem,
}: {
  stepId: WorkspaceStepId
  project: FullProject
  completedItems: Record<string, boolean>
  onToggleItem: (stepId: WorkspaceStepId, label: string) => void
}) {
  const step = project.workspaceSteps.find((s) => s.id === stepId)
  const section = STEP_ITEMS[stepId]
  const Icon = section.icon

  const completedCount = section.items.filter(
    (item) => completedItems[`${stepId}:${item.label}`]
  ).length
  const totalCount = section.items.length

  return (
    <motion.div
      key={stepId}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="space-y-3"
    >
      {/* Step header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="h-9 w-9 rounded-xl bg-brand/[0.08] flex items-center justify-center"
        >
          <Icon className="h-4.5 w-4.5 text-brand" strokeWidth={1.5} />
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading tracking-tight text-card-foreground">{section.title}</h3>
            <span className="text-[11px] tabular-nums text-muted-foreground/50 font-medium">
              {completedCount}/{totalCount}
            </span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-0.5">{step?.description}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-border/50 overflow-hidden mb-3">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: completedCount / totalCount }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="h-full bg-brand origin-left rounded-full"
        />
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {section.items.map((item, index) => {
          const itemKey = `${stepId}:${item.label}`
          const isComplete = completedItems[itemKey]
          const description = getItemDescription(stepId, item.label, project)

          return (
            <motion.button
              key={item.label}
              {...scaleFadeIn}
              transition={getScaleFadeTransition(index)}
              onClick={() => onToggleItem(stepId, item.label)}
              className="w-full flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-card-hover transition-all duration-200 text-left cursor-pointer group"
            >
              <div
                className={cn(
                  "shrink-0 h-5 w-5 rounded-full flex items-center justify-center mt-0.5 transition-all duration-200",
                  isComplete
                    ? "bg-success/10 text-success group-hover:bg-success/15"
                    : "bg-border/50 text-muted-foreground/30 group-hover:bg-border group-hover:text-muted-foreground/50"
                )}
              >
                {isComplete ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </motion.div>
                ) : (
                  <Circle className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn(
                  "text-xs font-medium transition-colors duration-200",
                  isComplete ? "text-success" : "text-card-foreground"
                )}>
                  {item.label}
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5 leading-relaxed">
                  {description}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

const PROGRESS_KEY = "sfcollab_workspace_progress"

function loadProgress(projectId: string): Record<string, boolean> | null {
  try {
    const raw = localStorage.getItem(`${PROGRESS_KEY}_${projectId}`)
    if (raw) return JSON.parse(raw)
  } catch {
    // corrupted data
  }
  return null
}

function saveProgress(projectId: string, items: Record<string, boolean>) {
  try {
    localStorage.setItem(`${PROGRESS_KEY}_${projectId}`, JSON.stringify(items))
  } catch {
    // storage full
  }
}

function getInitialCompleted(project: FullProject | null): Record<string, boolean> {
  if (!project) return {}
  const completed: Record<string, boolean> = {}
  for (const step of project.workspaceSteps) {
    for (const item of STEP_ITEMS[step.id]?.items || []) {
      const key = `${step.id}:${item.label}`
      // Auto-complete items that have data from the project
      if (step.id === "harvest") {
        if (item.label === "Brand Assets" && project.branding) completed[key] = true
        if (item.label === "Reference URLs" && project.referenceUrls?.length) completed[key] = true
        if (item.label === "Feature Requests" && project.features?.length) completed[key] = true
      }
      if (step.id === "discovery" && item.label === "Project Brief" && project.description) {
        completed[key] = true
      }
    }
  }
  return completed
}

function mergeCompleted(
  defaults: Record<string, boolean>,
  persisted: Record<string, boolean> | null
): Record<string, boolean> {
  if (!persisted) return defaults
  return { ...defaults, ...persisted }
}

function isStepComplete(stepId: WorkspaceStepId, items: Record<string, boolean>): boolean {
  return STEP_ITEMS[stepId].items.every((item) => items[`${stepId}:${item.label}`])
}

export function Workspace({ projectId, onBack }: WorkspaceProps) {
  const { project, isLoading, error, refetch, updateStepStatus, updateProjectStatus } = useProject(projectId)
  const [activeStep, setActiveStep] = useState<WorkspaceStepId>("discovery")
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>(() => {
    const defaults = project ? getInitialCompleted(project) : {}
    const persisted = projectId ? loadProgress(projectId) : null
    const merged = mergeCompleted(defaults, persisted)
    return merged
  })

  // Sync completed items when navigating to a different project
  const initializedRef = useRef<string | null>(null)
  useEffect(() => {
    if (project && initializedRef.current !== projectId) {
      initializedRef.current = projectId
      const defaults = getInitialCompleted(project)
      const persisted = loadProgress(projectId!)
      setCompletedItems(mergeCompleted(defaults, persisted))
    }
  }, [projectId, project])

  // Persist completed items to localStorage on every change
  useEffect(() => {
    if (projectId) {
      saveProgress(projectId, completedItems)
    }
  }, [projectId, completedItems])

  // Auto-advance project status when all 5 workspace steps are completed
  useEffect(() => {
    if (!project || project.status === "delivered") return
    const stepIds: WorkspaceStepId[] = ["discovery", "harvest", "proposal", "generate", "deliver"]
    const allDone = stepIds.every((id) => isStepComplete(id, completedItems))
    if (allDone) {
      updateProjectStatus("delivered")
    }
  }, [project, completedItems, updateProjectStatus])

  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggleItem = useCallback(
    (stepId: WorkspaceStepId, label: string) => {
      const key = `${stepId}:${label}`
      setCompletedItems((prev) => {
        const next = { ...prev, [key]: !prev[key] }

        // Check if all items in this step are now complete
        const items = STEP_ITEMS[stepId].items
        const allComplete = items.every((item) => next[`${stepId}:${item.label}`])

        // Update step status and auto-advance
        if (allComplete) {
          updateStepStatus(stepId, "completed")
          const steps: WorkspaceStepId[] = ["discovery", "harvest", "proposal", "generate", "deliver"]
          const currentIndex = steps.indexOf(stepId)
          if (currentIndex >= 0 && currentIndex < steps.length - 1) {
            clearTimeout(autoAdvanceRef.current)
            autoAdvanceRef.current = setTimeout(() => {
              setActiveStep(steps[currentIndex + 1])
            }, 600)
          }
        } else {
          updateStepStatus(stepId, "in-progress")
        }

        return next
      })
    },
    [updateStepStatus]
  )

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="sticky top-0 z-10 border-b border-nav-border bg-nav shadow-sm"
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Project name */}
          {project && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <motion.h1
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-sm font-medium text-foreground"
              >
                {project.name}
              </motion.h1>
              {project.description && (
                <p className="text-[11px] text-muted-foreground/60 leading-none mt-0.5">
                  {project.description}
                </p>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={refetch}
              disabled={isLoading}
              className="h-8 w-8"
              title="Refresh"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
            </Button>
          </motion.div>
        </div>
      </motion.header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-36 gap-3">
            <div className="h-12 w-12 rounded-xl border border-border bg-card flex items-center justify-center">
              <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
            <p className="text-xs text-muted-foreground/60">Loading workspace...</p>
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-28 gap-5"
          >
            <div className="h-12 w-12 rounded-xl border border-destructive/20 bg-destructive/5 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive/60" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h2 className="text-sm font-medium mb-1">Failed to load workspace</h2>
              <p className="text-xs text-muted-foreground/70">{error}</p>
            </div>
            <Button onClick={refetch} variant="outline" size="sm" className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </Button>
          </motion.div>
        )}

        {/* Workspace content */}
        {!isLoading && !error && project && (
          <div className="space-y-6">
            {/* Stepper */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="bg-card border border-border rounded-xl p-5 sm:p-6"
            >
              <Stepper
                steps={project.workspaceSteps}
                activeStep={activeStep}
                onStepClick={(stepId) => {
                  // Only allow navigating to completed steps or back
                  if (isStepComplete(stepId as WorkspaceStepId, completedItems) || stepId === activeStep) {
                    setActiveStep(stepId as WorkspaceStepId)
                    return
                  }
                  // Allow navigating back to earlier steps
                  const currentIdx = project.workspaceSteps.findIndex((s) => s.id === activeStep)
                  const targetIdx = project.workspaceSteps.findIndex((s) => s.id === stepId)
                  if (targetIdx < currentIdx) {
                    setActiveStep(stepId as WorkspaceStepId)
                  }
                }}
              />
            </motion.div>

            {/* Step content */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-5 sm:p-6"
            >
              <StepContent
                stepId={activeStep}
                project={project}
                completedItems={completedItems}
                onToggleItem={toggleItem}
              />
            </motion.div>

            {/* Back to Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Dashboard
              </Button>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}

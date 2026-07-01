export type ProjectStatus =
  | "draft"
  | "harvesting"
  | "proposal_ready"
  | "approved"
  | "generating"
  | "generated"
  | "pushing"
  | "delivered"
  | "failed"

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  lastUpdated: string
  url?: string
  description?: string
  packId?: string
}

export type WorkspaceStepId = "discovery" | "harvest" | "proposal" | "generate" | "deliver"

export type WorkspaceStepStatus = "pending" | "in-progress" | "completed" | "error"

export interface WorkspaceStep {
  id: WorkspaceStepId
  label: string
  description: string
  status: WorkspaceStepStatus
  icon: string
}

export const WORKSPACE_STEPS: WorkspaceStep[] = [
  {
    id: "discovery",
    label: "Discovery",
    description: "Research goals, audience, and competitors",
    status: "in-progress",
    icon: "Search",
  },
  {
    id: "harvest",
    label: "Harvest",
    description: "Collect content, assets, and references",
    status: "pending",
    icon: "Upload",
  },
  {
    id: "proposal",
    label: "Proposal",
    description: "Review site architecture and design",
    status: "pending",
    icon: "FileText",
  },
  {
    id: "generate",
    label: "Generate",
    description: "Build the website with AI",
    status: "pending",
    icon: "Zap",
  },
  {
    id: "deliver",
    label: "Deliver",
    description: "Deploy and share your site",
    status: "pending",
    icon: "Rocket",
  },
]

export interface FullProject extends Project {
  workspaceSteps: WorkspaceStep[]
  branding?: BrandingData
  features?: string[]
  referenceUrls?: string[]
}

export interface AppPack {
  id: string
  name: string
  description: string
  icon: string
  features: string[]
}

export type WizardStep = "app-type" | "name" | "branding" | "features" | "urls"

export const STEP_LABELS: Record<WizardStep, string> = {
  "app-type": "App Type",
  name: "Website Name",
  branding: "Branding",
  features: "Features",
  urls: "Reference URLs",
}

export const STEP_ORDER: WizardStep[] = ["app-type", "name", "branding", "features", "urls"]

export interface BrandingData {
  primaryColor: string
  accentColor: string
  tagline: string
  logoUrl: string
  font: string
}

export interface WizardData {
  name: string
  description: string
  packId: string | null
  branding: BrandingData
  features: string[]
  referenceUrls: string[]
}

export interface WizardErrors {
  name?: string
  description?: string
  packId?: string
  features?: string
  referenceUrls?: string
}

export interface CreateProjectRequest {
  name: string
  description?: string
  packId?: string
  branding?: BrandingData
  features?: string[]
  referenceUrls?: string[]
}

export function getDefaultWizardData(): WizardData {
  return {
    name: "",
    description: "",
    packId: null,
    branding: {
      primaryColor: "#503c8c",
      accentColor: "#2563eb",
      tagline: "",
      logoUrl: "",
      font: "Inter",
    },
    features: [],
    referenceUrls: [],
  }
}

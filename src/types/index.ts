export type ProjectStatus = "draft" | "building" | "deployed" | "error"

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  lastUpdated: string
  url?: string
  description?: string
  packId?: string
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

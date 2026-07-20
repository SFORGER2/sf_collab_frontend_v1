export type ProjectStatus =
  | "draft"
  | "harvesting"
  | "proposal_ready"
  | "approved"
  | "generating"
  | "generated"
  | "pushing"
  | "delivered"
  | "archived"
  | "failed"

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  createdAt: string
  lastUpdated: string
  url?: string
  description?: string
  packId?: string
  designTheme?: string
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

export type WizardStep = "business-info" | "template" | "industry" | "brand-details" | "design-preferences" | "review" | "generate"

export const STEP_LABELS: Record<WizardStep, string> = {
  "business-info": "Business Info",
  template: "Template",
  industry: "Industry",
  "brand-details": "Brand Details",
  "design-preferences": "Design Preferences",
  review: "Review",
  generate: "Generate",
}

export const STEP_ORDER: WizardStep[] = [
  "business-info",
  "template",
  "industry",
  "brand-details",
  "design-preferences",
  "review",
  "generate",
]

export const INDUSTRIES = [
  { id: "technology", label: "Technology / SaaS", icon: "Monitor" },
  { id: "ecommerce", label: "E-commerce / Retail", icon: "ShoppingCart" },
  { id: "healthcare", label: "Healthcare", icon: "HeartPulse" },
  { id: "education", label: "Education", icon: "GraduationCap" },
  { id: "finance", label: "Finance / Banking", icon: "Landmark" },
  { id: "real-estate", label: "Real Estate", icon: "Building2" },
  { id: "creative", label: "Creative / Design", icon: "Palette" },
  { id: "food", label: "Food & Hospitality", icon: "UtensilsCrossed" },
  { id: "nonprofit", label: "Non-profit", icon: "Heart" },
  { id: "professional", label: "Professional Services", icon: "Briefcase" },
  { id: "entertainment", label: "Entertainment / Media", icon: "Film" },
  { id: "travel", label: "Travel / Tourism", icon: "Plane" },
  { id: "other", label: "Other", icon: "MoreHorizontal" },
] as const

export interface DesignTheme {
  id: string
  name: string
  description: string
  primaryColor: string
  accentColor: string
}

export const DESIGN_THEMES: DesignTheme[] = [
  {
    id: "lumen",
    name: "Lumen",
    description: "Clean, bright, and minimal — perfect for modern brands",
    primaryColor: "#1a1a2e",
    accentColor: "#e94560",
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Vibrant gradients and bold colors for creative projects",
    primaryColor: "#0f0c29",
    accentColor: "#302b63",
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Serif elegance for content-focused sites and publications",
    primaryColor: "#1c1c1c",
    accentColor: "#c9a96e",
  },
  {
    id: "neobrutal",
    name: "Neo Brutal",
    description: "Bold borders, high contrast, and unapologetic presence",
    primaryColor: "#000000",
    accentColor: "#ff3366",
  },
  {
    id: "terra",
    name: "Terra",
    description: "Earthy tones and warm contrasts for organic brands",
    primaryColor: "#2d1b00",
    accentColor: "#8b5e3c",
  },
]

export interface Template {
  id: string
  name: string
  description: string
  icon: string
  features: string[]
  previewColor: string
}

export const TEMPLATES: Template[] = [
  {
    id: "business",
    name: "Business",
    description: "A professional corporate site with service pages, about section, and contact forms",
    icon: "Building2",
    features: ["Service pages", "About section", "Contact form", "Team gallery", "Testimonials"],
    previewColor: "#2563eb",
  },
  {
    id: "startup",
    name: "Startup",
    description: "A modern landing page for startups with hero, features, and investor updates",
    icon: "Rocket",
    features: ["Hero with CTA", "Features section", "Pricing table", "Blog", "Newsletter signup"],
    previewColor: "#7c3aed",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "A creative portfolio to showcase your work, projects, and personal brand",
    icon: "Palette",
    features: ["Project gallery", "About me", "Skills & tools", "Client logos", "Contact form"],
    previewColor: "#ec4899",
  },
  {
    id: "ecommerce",
    name: "Ecommerce",
    description: "A full online store with product listings, cart, checkout, and order management",
    icon: "ShoppingCart",
    features: ["Product catalog", "Shopping cart", "Secure checkout", "Order tracking", "Reviews"],
    previewColor: "#f59e0b",
  },
  {
    id: "agency",
    name: "Agency",
    description: "A sleek agency website showcasing services, case studies, and client work",
    icon: "Briefcase",
    features: ["Services showcase", "Case studies", "Team profiles", "Process timeline", "Testimonials"],
    previewColor: "#06b6d4",
  },
  {
    id: "saas",
    name: "SaaS",
    description: "A SaaS product site with feature highlights, integrations, and subscription plans",
    icon: "LayoutDashboard",
    features: ["Feature highlights", "Integrations", "Pricing tiers", "API docs", "Changelog"],
    previewColor: "#10b981",
  },
]

export interface BrandingData {
  primaryColor: string
  accentColor: string
  tagline: string
  logoUrl: string
  font: string
}

export interface WizardData {
  // Step 1 - Business Information
  businessName: string
  businessEmail: string
  websiteName: string
  description: string

  // Step 2 - Template Selection
  template: string

  // Step 3 - Industry Selection
  industry: string

  // Step 4 - Brand Details
  branding: BrandingData

  // Step 5 - Design Preferences
  designTheme: string
  buttonStyle: string
  borderRadius: string
  layout: string
  darkMode: boolean

  // Kept from previous flow
  features: string[]
  referenceUrls: string[]
}

export interface WizardErrors {
  businessName?: string
  businessEmail?: string
  websiteName?: string
  template?: string
  industry?: string
  designTheme?: string
}

export interface CreateProjectRequest {
  name: string
  description?: string
  packId?: string
  branding?: BrandingData
  features?: string[]
  referenceUrls?: string[]
  designTheme?: string
}

export function getDefaultWizardData(): WizardData {
  return {
    businessName: "",
    businessEmail: "",
    websiteName: "",
    description: "",
    template: "",
    industry: "",
    branding: {
      primaryColor: "#503c8c",
      accentColor: "#2563eb",
      tagline: "",
      logoUrl: "",
      font: "Inter",
    },
    designTheme: "lumen",
    buttonStyle: "rounded",
    borderRadius: "medium",
    layout: "full-width",
    darkMode: false,
    features: [],
    referenceUrls: [],
  }
}

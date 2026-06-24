export type ProjectStatus = "draft" | "building" | "deployed" | "error"

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  lastUpdated: string
  url?: string
  description?: string
}

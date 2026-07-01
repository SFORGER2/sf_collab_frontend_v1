import { useState, useEffect, useCallback } from "react"
import { WORKSPACE_STEPS, type FullProject, type Project, type WorkspaceStepStatus } from "../types"
import type { ProjectStatus } from "../types"

const STORAGE_KEY = "sfcollab_projects"

function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch {
    // storage full
  }
}

interface UseProjectReturn {
  project: FullProject | null
  isLoading: boolean
  error: string | null
  refetch: () => void
  updateStepStatus: (stepId: string, status: WorkspaceStepStatus) => void
  updateProjectStatus: (status: ProjectStatus) => void
}

function loadProject(id: string): FullProject | null {
  try {
    const raw = localStorage.getItem("sfcollab_projects")
    if (raw) {
      const projects: Project[] = JSON.parse(raw)
      const found = projects.find((p) => p.id === id)
      if (found) {
        return {
          ...found,
          workspaceSteps: WORKSPACE_STEPS.map((s, i) => ({
            ...s,
            status: i === 0 ? ("in-progress" as WorkspaceStepStatus) : ("pending" as WorkspaceStepStatus),
          })),
        }
      }
    }
  } catch {
    // corrupted data
  }
  return null
}

export function useProject(id: string | null): UseProjectReturn {
  const [project, setProject] = useState<FullProject | null>(() => (id ? loadProject(id) : null))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/projects/${id}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.statusText}`)
      }
      const data: FullProject = await response.json()
      setProject(data)
    } catch {
      // API not available — fall back to localStorage mock
      const cached = loadProject(id)
      if (cached) {
        setProject(cached)
      } else {
        setError("Project not found")
      }
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) refetch()
  }, [id, refetch])

  const persistProject = useCallback((updated: FullProject) => {
    // Save the project status/name/etc back to the main projects list
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const projects: Project[] = JSON.parse(raw)
        const index = projects.findIndex((p) => p.id === updated.id)
        if (index >= 0) {
          projects[index] = {
            id: updated.id,
            name: updated.name,
            status: updated.status,
            lastUpdated: new Date().toISOString(),
            url: updated.url,
            description: updated.description,
            packId: updated.packId,
          }
          saveProjects(projects)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const updateStepStatus = useCallback((stepId: string, status: WorkspaceStepStatus) => {
    setProject((prev) => {
      if (!prev) return prev
      const updated = {
        ...prev,
        workspaceSteps: prev.workspaceSteps.map((s) =>
          s.id === stepId ? { ...s, status } : s
        ),
      }
      persistProject(updated)
      return updated
    })
  }, [persistProject])

  const updateProjectStatus = useCallback((newStatus: ProjectStatus) => {
    setProject((prev) => {
      if (!prev) return prev
      const updated = {
        ...prev,
        status: newStatus,
      }
      persistProject(updated)
      return updated
    })
  }, [persistProject])

  return { project, isLoading, error, refetch, updateStepStatus, updateProjectStatus }
}

import { useState, useEffect, useCallback } from "react"
import type { Project } from "../types"

const STORAGE_KEY = "sfcollab_projects"

const STATUS_MIGRATION: Record<string, Project["status"]> = {
  building: "generating",
  deployed: "delivered",
  error: "failed",
}

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: Project[] = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Migrate old status values from previous versions
        const migrated = parsed.map((p) => ({
          ...p,
          status: STATUS_MIGRATION[p.status] ?? p.status,
        }))
        saveProjects(migrated)
        return migrated
      }
    }
  } catch {
    // corrupted data
  }
  return []
}

function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch {
    // storage full or unavailable — silently ignore
  }
}

interface UseProjectsReturn {
  projects: Project[]
  isLoading: boolean
  error: string | null
  refetch: () => void
  addProject: (project: Project) => void
  removeProject: (id: string) => void
  updateProject: (id: string, updates: Partial<Project>) => void
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const syncProjects = useCallback((updated: Project[]) => {
    setProjects(updated)
    saveProjects(updated)
  }, [])

  const addProject = useCallback(
    (project: Project) => {
      setProjects((prev) => {
        const updated = [project, ...prev]
        saveProjects(updated)
        return updated
      })
    },
    []
  )

  const removeProject = useCallback(
    (id: string) => {
      setProjects((prev) => {
        const updated = prev.filter((p) => p.id !== id)
        saveProjects(updated)
        return updated
      })
    },
    []
  )

  const updateProject = useCallback(
    (id: string, updates: Partial<Project>) => {
      setProjects((prev) => {
        const updated = prev.map((p) =>
          p.id === id
            ? { ...p, ...updates, lastUpdated: new Date().toISOString() }
            : p
        )
        saveProjects(updated)
        return updated
      })
    },
    []
  )

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/projects")
      if (response.ok) {
        const contentType = response.headers.get("content-type") || ""
        if (contentType.includes("application/json")) {
          const data: Project[] = await response.json()
          syncProjects(data)
        } else {
          // Server returned non-JSON (e.g. Vite SPA fallback) — API not available
          setError("Server is not available. Showing projects from local storage.")
        }
      } else if (response.status === 404) {
        setError("Website API is not connected. Showing projects from local storage.")
      } else {
        throw new Error(`Server returned an error: ${response.statusText}`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load projects'
      setError(`Unable to reach the server. ${message}. Using local data.`)
    } finally {
      setIsLoading(false)
    }
  }, [syncProjects])

  useEffect(() => {
    // Attempt API fetch on mount; localStorage data is already loaded
    refetch()
  }, [refetch])

  return { projects, isLoading, error, refetch, addProject, removeProject, updateProject }
}

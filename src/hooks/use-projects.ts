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
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects())
  const [isLoading, setIsLoading] = useState(true)
  const [error] = useState<string | null>(null)

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

  const refetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/projects")
      if (response.ok) {
        const data: Project[] = await response.json()
        syncProjects(data)
      }
    } catch {
      // API not available — use what's in localStorage
    } finally {
      setIsLoading(false)
    }
  }, [syncProjects])

  useEffect(() => {
    // Attempt API fetch on mount; localStorage data is already loaded
    refetch()
  }, [refetch])

  return { projects, isLoading, error, refetch, addProject, removeProject }
}

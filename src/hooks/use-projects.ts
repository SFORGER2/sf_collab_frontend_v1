import { useState, useEffect, useCallback } from "react"
import type { Project } from "../types"

const STORAGE_KEY = "sfcollab_projects"

const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    name: "My Portfolio",
    status: "deployed",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    url: "https://my-portfolio.example.com",
    description: "Personal portfolio website",
  },
  {
    id: "2",
    name: "Company Blog",
    status: "building",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    description: "Company blog with CMS",
  },
  {
    id: "3",
    name: "E-commerce Store",
    status: "draft",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    description: "Online store frontend",
  },
  {
    id: "4",
    name: "API Documentation",
    status: "deployed",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    url: "https://docs.example.com",
    description: "API reference site",
  },
  {
    id: "5",
    name: "Marketing Landing Page",
    status: "error",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    description: "Product launch landing page",
  },
  {
    id: "6",
    name: "Admin Dashboard",
    status: "draft",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    description: "Internal admin panel",
  },
]

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: Project[] = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // corrupted data — fall through to seed
  }
  // Seed with mock data on first load
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PROJECTS))
  return MOCK_PROJECTS
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

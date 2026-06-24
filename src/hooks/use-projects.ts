import { useState, useEffect, useCallback } from "react"
import type { Project } from "../types"

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

interface UseProjectsReturn {
  projects: Project[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/projects")

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`)
      }

      const data: Project[] = await response.json()
      setProjects(data)
    } catch {
      // API not available — use mock data for development
      setProjects(MOCK_PROJECTS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return { projects, isLoading, error, refetch: fetchProjects }
}

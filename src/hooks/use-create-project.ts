import { useState, useCallback } from "react"
import type { Project, CreateProjectRequest } from "../types"

interface UseCreateProjectReturn {
  createProject: (data: CreateProjectRequest) => Promise<Project>
  isCreating: boolean
}

export function useCreateProject(): UseCreateProjectReturn {
  const [isCreating, setIsCreating] = useState(false)

  const createProject = useCallback(async (data: CreateProjectRequest): Promise<Project> => {
    setIsCreating(true)

    try {
      const response = await fetch("/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.statusText}`)
      }

      const project: Project = await response.json()
      setIsCreating(false)
      return project
    } catch {
      // API not available — create mock project
      const newProject: Project = {
        id: `new-${Date.now()}`,
        name: data.name,
        status: "draft",
        lastUpdated: new Date().toISOString(),
        description: data.description,
        packId: data.packId,
      }

      setIsCreating(false)
      return newProject
    }
  }, [])

  return { createProject, isCreating }
}

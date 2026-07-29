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
        throw new Error("Unable to create website. Please check your connection and try again.")
      }

      return await response.json() as Project
    } finally {
      setIsCreating(false)
    }
  }, [])

  return { createProject, isCreating }
}

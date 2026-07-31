import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return "just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

export function formatCurrency(amount: number | string | null | undefined): string {
  const value = Number(amount)
  if (!Number.isFinite(value)) return "$0"
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
  return `$${value}`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export type StatusFilter = "all" | "draft" | "in-progress" | "completed" | "failed" | "archived"

export function getFilterLabel(filter: StatusFilter): string {
  const labels: Record<StatusFilter, string> = {
    all: "All",
    draft: "Draft",
    "in-progress": "In Progress",
    completed: "Completed",
    failed: "Failed",
    archived: "Archived",
  }
  return labels[filter]
}

export function matchesStatusFilter(status: string, filter: StatusFilter): boolean {
  if (filter === "all") return true
  if (filter === "draft") return status === "draft"
  if (filter === "in-progress")
    return ["harvesting", "proposal_ready", "approved", "generating", "generated", "pushing"].includes(status)
  if (filter === "completed") return status === "delivered"
  if (filter === "failed") return status === "failed"
  if (filter === "archived") return status === "archived"
  return true
}

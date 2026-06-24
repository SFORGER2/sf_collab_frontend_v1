import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ExternalLink, MoreHorizontal, Globe, Trash2 } from "lucide-react"
import { StatusBadge } from "./status-badge"
import type { Project } from "../types"

interface ProjectCardProps {
  project: Project
  index: number
  onDelete?: (project: Project) => void
}

function formatRelativeTime(dateString: string): string {
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

export function ProjectCard({ project, index, onDelete }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ y: -3 }}
      layout
    >
      <div className="group relative rounded-xl border border-border bg-card hover:bg-card-hover transition-all duration-200 cursor-pointer h-full hover:shadow-sm">
        {/* Subtle top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="p-4 flex flex-col gap-3">
          {/* Top row: icon + name + menu */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center ring-1 ring-border group-hover:ring-primary/20 group-hover:shadow-sm transition-all duration-300">
                <Globe className="h-4 w-4 text-primary/60" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors duration-200">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            <div ref={menuRef} className="relative">
              <button
                className="shrink-0 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(!menuOpen)
                }}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>

              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-border bg-card shadow-lg z-50 py-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      onDelete?.(project)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/5 transition-colors duration-150 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Status + Timestamp */}
          <div className="flex items-center justify-between">
            <StatusBadge status={project.status} />
            <span className="text-[11px] text-muted-foreground/70 tabular-nums">
              {formatRelativeTime(project.lastUpdated)}
            </span>
          </div>

          {/* URL */}
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-primary transition-colors duration-200"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="truncate max-w-[200px]">{project.url}</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

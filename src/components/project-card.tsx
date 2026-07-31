import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ExternalLink, MoreHorizontal, Globe, Trash2, Calendar, Eye, Copy, Edit, Archive, UploadCloud, CloudOff, FileEdit } from "lucide-react"
import { StatusBadge } from "./status-badge"
import { formatRelativeTime, formatDate, cn } from "@/lib/utils"
import { useToast } from "../hooks/use-toast"
import type { Project } from "../types"

interface ProjectCardProps {
  project: Project
  index: number
  onDelete?: (project: Project) => void
  onOpenWorkspace?: (projectId: string) => void
  onDuplicate?: (project: Project) => void
  onPublish?: (project: Project) => void
  onUnpublish?: (project: Project) => void
  onArchive?: (project: Project) => void
}
	export function ProjectCard({ project, index, onDelete, onOpenWorkspace, onDuplicate, onPublish, onUnpublish, onArchive }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { addToast } = useToast()

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

  const handleAction = (
    e: React.MouseEvent,
    action: string,
    callback?: (project: Project) => void
  ) => {
    e.stopPropagation()
    setMenuOpen(false)
    if (callback) {
      callback(project)
    } else {
      addToast({
        title: `${action} unavailable`,
        description: `This feature requires an API connection.`,
        variant: "info",
      })
    }
  }

  const isPublished = project.status === "delivered"
  const isArchived = project.status === "archived"

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
      <div
        onClick={() => onOpenWorkspace?.(project.id)}
        className={cn(
          "group relative rounded-xl border bg-card hover:bg-card-hover transition-all duration-200 cursor-pointer h-full hover:shadow-sm",
          isArchived ? "border-dashed border-border/50 opacity-60" : "border-border"
        )}
      >
        {/* Subtle top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="p-4 flex flex-col gap-2.5">
          {/* Top row: icon + name + menu */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="flex items-start justify-between gap-2"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 250, damping: 15, delay: 0.08 }}
                className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center ring-1 ring-border group-hover:ring-primary/20 group-hover:shadow-sm transition-all duration-300"
              >
                <Globe className="h-4 w-4 text-primary/60" strokeWidth={1.5} />
              </motion.div>
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
                className="shrink-0 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(!menuOpen)
                }}
                title="Manage"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>

              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-border bg-card shadow-lg z-50 py-1 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Edit */}
                  <button
                    onClick={(e) => handleAction(e, "Edit", onOpenWorkspace ? () => onOpenWorkspace(project.id) : undefined)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-card-foreground hover:bg-accent transition-colors duration-150 cursor-pointer"
                  >
                    <FileEdit className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                    Edit
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={(e) => handleAction(e, "Duplicate", onDuplicate)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-card-foreground hover:bg-accent transition-colors duration-150 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                    Duplicate
                  </button>

                  <div className="h-px bg-border/50 mx-2" />

                  {/* Publish / Unpublish */}
                  {isPublished ? (
                    <button
                      onClick={(e) => handleAction(e, "Unpublish", onUnpublish)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-card-foreground hover:bg-accent transition-colors duration-150 cursor-pointer"
                    >
                      <CloudOff className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                      Unpublish
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleAction(e, "Publish", onPublish)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-card-foreground hover:bg-accent transition-colors duration-150 cursor-pointer"
                    >
                      <UploadCloud className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                      Publish
                    </button>
                  )}

                  {/* Archive */}
                  <button
                    onClick={(e) => handleAction(e, "Archive", onArchive)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-card-foreground hover:bg-accent transition-colors duration-150 cursor-pointer"
                  >
                    <Archive className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                    {isArchived ? "Unarchive" : "Archive"}
                  </button>

                  <div className="h-px bg-border/50 mx-2" />

                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(project); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/5 transition-colors duration-150 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Status + Timestamp */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.12 }}
            className="flex items-center justify-between"
          >
            <StatusBadge status={project.status} />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="text-[11px] text-muted-foreground/70 tabular-nums"
            >
              {formatRelativeTime(project.lastUpdated)}
            </motion.span>
          </motion.div>

          {/* Creation date */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.16 }}
            className="flex items-center gap-1.5"
          >
            <Calendar className="h-3 w-3 text-muted-foreground/40" strokeWidth={1.5} />
            <span className="text-[11px] text-muted-foreground/50">
              Created {formatDate(project.createdAt)}
            </span>
            {project.designTheme && (
              <span className="text-[11px] text-muted-foreground/30">
                &middot; {project.designTheme}
              </span>
            )}
          </motion.div>

          {/* URL + Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.18 }}
            className="flex items-center gap-2 flex-wrap"
          >
            {project.url && (
              <motion.a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.18 }}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-primary transition-colors duration-200"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="truncate max-w-[160px]">{project.url}</span>
              </motion.a>
            )}
            {project.status === "delivered" && project.url && (
              <motion.a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.2 }}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium",
                  "bg-brand/[0.08] text-brand hover:bg-brand/[0.12] transition-colors duration-200"
                )}
              >
                <Eye className="h-3 w-3" strokeWidth={1.5} />
                Preview
              </motion.a>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

import { motion } from "framer-motion"
import {
  Clock,
  Search,
  FileText,
  ThumbsUp,
  Loader2,
  CheckCheck,
  Upload,
  Globe,
  Archive,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react"
import { cn } from "../lib/utils"
import type { ProjectStatus } from "../types"

const statusConfig: Record<
  ProjectStatus,
  { label: string; icon: LucideIcon; dot: string; bg: string; text: string }
> = {
  draft: {
    label: "Draft",
    icon: Clock,
    dot: "bg-amber-500",
    bg: "bg-amber-500/8",
    text: "text-amber-600 dark:text-amber-400",
  },
  harvesting: {
    label: "Harvesting",
    icon: Search,
    dot: "bg-blue-500",
    bg: "bg-blue-500/8",
    text: "text-blue-600 dark:text-blue-400",
  },
  proposal_ready: {
    label: "Proposal Ready",
    icon: FileText,
    dot: "bg-violet-500",
    bg: "bg-violet-500/8",
    text: "text-violet-600 dark:text-violet-400",
  },
  approved: {
    label: "Approved",
    icon: ThumbsUp,
    dot: "bg-emerald-500",
    bg: "bg-emerald-500/8",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  generating: {
    label: "Generating",
    icon: Loader2,
    dot: "bg-brand",
    bg: "bg-brand/8",
    text: "text-brand",
  },
  generated: {
    label: "Generated",
    icon: CheckCheck,
    dot: "bg-emerald-500",
    bg: "bg-emerald-500/8",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  pushing: {
    label: "Pushing",
    icon: Upload,
    dot: "bg-sky-500",
    bg: "bg-sky-500/8",
    text: "text-sky-600 dark:text-sky-400",
  },
  delivered: {
    label: "Delivered",
    icon: Globe,
    dot: "bg-success",
    bg: "bg-success/8",
    text: "text-success",
  },
  archived: {
    label: "Archived",
    icon: Archive,
    dot: "bg-muted-foreground",
    bg: "bg-muted/50",
    text: "text-muted-foreground",
  },
  failed: {
    label: "Failed",
    icon: AlertTriangle,
    dot: "bg-destructive",
    bg: "bg-destructive/8",
    text: "text-destructive",
  },
}

const spinningStatuses: ProjectStatus[] = ["harvesting", "generating", "pushing"]

interface StatusBadgeProps {
  status: ProjectStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    icon: AlertTriangle,
    dot: "bg-muted-foreground",
    bg: "bg-muted/50",
    text: "text-muted-foreground",
  }
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium leading-none tracking-wide",
        config.bg,
        config.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)} />
      <span className="flex items-center gap-1">
        {spinningStatuses.includes(status) ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="flex"
          >
            <Icon className="h-3 w-3" />
          </motion.span>
        ) : (
          <Icon className="h-3 w-3" />
        )}
        {config.label}
      </span>
    </motion.div>
  )
}

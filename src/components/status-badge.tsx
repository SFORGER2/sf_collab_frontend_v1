import { motion } from "framer-motion"
import { Clock, Loader2, Globe, AlertTriangle, type LucideIcon } from "lucide-react"
import { cn } from "../lib/utils"
import type { ProjectStatus } from "../types"

const statusConfig: Record<
  ProjectStatus,
  { label: string; icon: LucideIcon; dot: string }
> = {
  draft: {
    label: "Draft",
    icon: Clock,
    dot: "bg-warning",
  },
  building: {
    label: "Building",
    icon: Loader2,
    dot: "bg-building",
  },
  deployed: {
    label: "Deployed",
    icon: Globe,
    dot: "bg-success",
  },
  error: {
    label: "Error",
    icon: AlertTriangle,
    dot: "bg-destructive",
  },
}

interface StatusBadgeProps {
  status: ProjectStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium leading-none tracking-wide",
        {
          "bg-warning/8 text-warning": status === "draft",
          "bg-building/8 text-building": status === "building",
          "bg-success/8 text-success": status === "deployed",
          "bg-destructive/8 text-destructive": status === "error",
        },
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      <span className="flex items-center gap-1">
        {status === "building" ? (
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
    </div>
  )
}

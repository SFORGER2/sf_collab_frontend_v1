import { motion } from "framer-motion"
import {
  Globe,
  FileText,
  ShoppingCart,
  LayoutDashboard,
  Check,
} from "lucide-react"
import { cn } from "../lib/utils"
import type { AppPack } from "../types"

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Globe,
  FileText,
  ShoppingCart,
  LayoutDashboard,
}

interface AppTypeCardProps {
  pack: AppPack
  selected: boolean
  onSelect: () => void
}

export function AppTypeCard({
  pack,
  selected,
  onSelect,
}: AppTypeCardProps) {
  const Icon = iconMap[pack.icon] || Globe

  return (
    <motion.button
      onClick={onSelect}
      className={cn(
        "relative w-full flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 transition-all duration-200 cursor-pointer group",
        "hover:shadow-sm",
        selected
          ? "border-brand bg-brand/[0.03] shadow-sm"
          : "border-border bg-card hover:border-brand/30 hover:bg-card-hover",
      )}
    >
      {/* Selection checkmark */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 h-5 w-5 sm:h-6 w-6 rounded-full bg-brand flex items-center justify-center"
        >
          <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-foreground" strokeWidth={3} />
        </motion.div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200",
          selected
            ? "bg-brand text-brand-foreground"
            : "bg-secondary text-muted-foreground group-hover:bg-brand/10 group-hover:text-brand",
        )}
      >
        {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />}
      </div>

      {/* Name */}
      <h3
        className={cn(
          "text-xs sm:text-sm font-semibold tracking-tight transition-colors duration-200",
          selected ? "text-brand" : "text-foreground",
        )}
      >
        {pack.name}
      </h3>
    </motion.button>
  )
}

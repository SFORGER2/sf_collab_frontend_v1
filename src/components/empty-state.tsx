import { motion } from "framer-motion"
import { Plus, LayoutTemplate } from "lucide-react"
import { Button } from "./ui/button"

interface EmptyStateProps {
  onCreateNew: () => void
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-32 px-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        className="relative mb-6"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/[0.07] to-transparent ring-1 ring-border flex items-center justify-center">
          <LayoutTemplate className="h-8 w-8 text-primary/40" strokeWidth={1.2} />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 400, damping: 15 }}
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="text-xl font-semibold tracking-tight mb-1.5"
      >
        No websites yet
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.35 }}
        className="text-sm text-muted-foreground/80 text-center max-w-xs leading-relaxed mb-8"
      >
        Create your first site and it'll show up here. Deploy static sites, apps,
        and more in seconds.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.35 }}
      >
        <Button onClick={onCreateNew} size="default" className="gap-2 shadow-sm px-6">
          <Plus className="h-4 w-4" />
          Create your first website
        </Button>
      </motion.div>
    </motion.div>
  )
}

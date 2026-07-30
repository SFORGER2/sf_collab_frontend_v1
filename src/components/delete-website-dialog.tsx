import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Trash2 } from "lucide-react"
import { Modal } from "./ui/modal"
import { Button } from "./ui/button"
import { useToast } from "../hooks/use-toast"
import type { Project } from "../types"

interface DeleteWebsiteDialogProps {
  open: boolean
  onClose: () => void
  project: Project | null
  onConfirmDelete: (project: Project) => void
}

export function DeleteWebsiteDialog({
  open,
  onClose,
  project,
  onConfirmDelete,
}: DeleteWebsiteDialogProps) {
  const { addToast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (open) setIsDeleting(false)
  }, [open])

  const handleDelete = async () => {
    if (!project) return
    setIsDeleting(true)

    // Simulate API call delay
    await new Promise((r) => setTimeout(r, 600))

    onConfirmDelete(project)

    addToast({
      title: "Website deleted",
      description: `${project.name} has been permanently deleted.`,
      variant: "destructive",
    })

    setIsDeleting(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete Website">
      <div className="flex flex-col items-center gap-5">
        {/* Warning icon */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="h-14 w-14 rounded-2xl bg-destructive/10 ring-1 ring-destructive/20 flex items-center justify-center"
        >
          <AlertTriangle className="h-7 w-7 text-destructive/70" strokeWidth={1.3} />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="text-sm text-card-foreground/80 leading-relaxed"
          >
            Are you sure you want to delete{" "}
            <span className="font-semibold text-card-foreground">
              {project?.name}
            </span>
            ?
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-xs text-muted-foreground/60 mt-1.5"
          >
            This action cannot be undone. The website and all its data will be
            permanently removed.
          </motion.p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="flex items-center gap-2 pt-1 w-full"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting || !project}
            className="flex-1 gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm"
          >
            {isDeleting ? (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </motion.div>
      </div>
    </Modal>
  )
}

import { useState } from "react"
import { motion } from "framer-motion"
import { Globe, Plus } from "lucide-react"
import { Modal } from "./ui/modal"
import { Button } from "./ui/button"
import { useToast } from "../hooks/use-toast"
import type { Project } from "../types"

interface CreateWebsiteModalProps {
  open: boolean
  onClose: () => void
  onCreateProject?: (project: Project) => void
}

export function CreateWebsiteModal({
  open,
  onClose,
  onCreateProject,
}: CreateWebsiteModalProps) {
  const { addToast } = useToast()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)

    // Simulate API call delay
    await new Promise((r) => setTimeout(r, 800))

    const newProject: Project = {
      id: `new-${Date.now()}`,
      name: name.trim(),
      status: "draft",
      lastUpdated: new Date().toISOString(),
      description: description.trim() || undefined,
    }

    onCreateProject?.(newProject)

    addToast({
      title: "Website created",
      description: `${name.trim()} has been created as a draft.`,
      variant: "success",
    })

    setName("")
    setDescription("")
    setIsSubmitting(false)
    onClose()
  }

  const isValid = name.trim().length > 0

  return (
    <Modal open={open} onClose={onClose} title="New Website">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent ring-1 ring-border flex items-center justify-center"
        >
          <Globe className="h-6 w-6 text-primary/50" strokeWidth={1.2} />
        </motion.div>

        {/* Name field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="website-name"
            className="text-xs font-medium text-card-foreground/70"
          >
            Website name
          </label>
          <input
            id="website-name"
            type="text"
            placeholder="My Awesome Site"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="h-10 rounded-xl border border-border bg-background px-3.5 text-sm placeholder:text-muted-foreground/40 text-card-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Description field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="website-desc"
            className="text-xs font-medium text-card-foreground/70"
          >
            Description{" "}
            <span className="text-muted-foreground/40 font-normal">
              (optional)
            </span>
          </label>
          <textarea
            id="website-desc"
            placeholder="What's this website about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="h-20 resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/40 text-card-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!isValid || isSubmitting}
            className="gap-1.5"
          >
            {isSubmitting ? (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            {isSubmitting ? "Creating..." : "Create Website"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

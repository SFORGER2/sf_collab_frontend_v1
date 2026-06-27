import { WebsiteWizard } from "./website-wizard"
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
  return (
    <WebsiteWizard
      open={open}
      onClose={onClose}
      onCreateProject={onCreateProject}
    />
  )
}

import { useMemo } from "react";

const STATUS_METADATA = {
  draft: {
    label: "Draft Spec",
    description: "Website specifications defined. Ready to begin data acquisition.",
    stepIndex: 0,
    color: "#6b7280",
  },
  harvesting: {
    label: "Harvesting Data",
    description: "Crawling and extracting branding profiles, color palettes, and copy from reference URLs...",
    stepIndex: 1,
    color: "#d97706",
  },
  proposal_ready: {
    label: "Proposal Ready",
    description: "Data acquisition completed. Review the proposed database schema, entities, and file tree.",
    stepIndex: 2,
    color: "#7c3aed",
  },
  approved: {
    label: "Proposal Approved",
    description: "Architecture approved. The project is ready to generate the codebase.",
    stepIndex: 2,
    color: "#7c3aed",
  },
  generating: {
    label: "Generating Codebase",
    description: "Building database migrations, API controllers, and rendering frontend components...",
    stepIndex: 3,
    color: "#d97706",
  },
  generated: {
    label: "Codebase Ready",
    description: "Codebase generated successfully. Ready to download the ZIP or push to a remote repository.",
    stepIndex: 3,
    color: "#7c3aed",
  },
  pushing: {
    label: "Delivering to Git",
    description: "Initializing repository and pushing generated codebase to your remote Git provider...",
    stepIndex: 4,
    color: "#d97706",
  },
  delivered: {
    label: "Completed & Delivered",
    description: "Codebase successfully delivered to your remote repository. Build completed!",
    stepIndex: 4,
    color: "#16a34a",
  },
  failed: {
    label: "Execution Failed",
    description: "An error occurred during pipeline execution. Hover/click on the badge to review details.",
    stepIndex: 4,
    color: "#dc2626",
  },
};

/**
 * Upgraded custom hook to manage project status flags, step indices, and metadata.
 * Supports both a full project object or a raw status string.
 * 
 * @param {object|string} projectOrStatus - The project object or raw status string.
 * @returns {object} status flags, label, description, color, and stepIndex.
 */
export function useProjectStatus(projectOrStatus) {
  const status = typeof projectOrStatus === "string"
    ? projectOrStatus
    : projectOrStatus?.status || "draft";

  const lastError = typeof projectOrStatus === "object"
    ? projectOrStatus?.last_error || projectOrStatus?.error || ""
    : "";

  return useMemo(() => {
    const normStatus = status.toLowerCase();
    const meta = STATUS_METADATA[normStatus] || STATUS_METADATA.draft;

    return {
      status,
      lastError,
      label: meta.label,
      description: meta.description,
      stepIndex: meta.stepIndex,
      color: meta.color,
      isProcessing: ["harvesting", "generating", "pushing"].includes(normStatus),
      canEdit: normStatus === "draft",
      canHarvest: ["draft", "proposal_ready"].includes(normStatus),
      canApprove: normStatus === "proposal_ready",
      canGenerate: normStatus === "approved",
      canDownload: ["generated", "delivered"].includes(normStatus),
      canPush: normStatus === "generated",
      hasError: normStatus === "failed",
    };
  }, [status, lastError]);
}

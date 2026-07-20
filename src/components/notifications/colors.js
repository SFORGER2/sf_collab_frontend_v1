/**
 * SF Collab Notification Colors - FIXED VERSION
 * Color and style configurations for notification components
 */

// Colors by notification type
export const notificationColors = {
  success: {
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    text: "text-green-400",
    icon: "text-green-400",
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
    icon: "text-blue-400",
  },
  warning: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    text: "text-yellow-400",
    icon: "text-yellow-400",
  },
  error: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-400",
    icon: "text-red-400",
  },
};

// Styles by priority
export const priorityStyles = {
  critical: "ring-2 ring-red-500/30",
  high: "ring-1 ring-orange-500/20",
  medium: "",
  low: "opacity-90",
};

// Category colors
export const categoryColors = {
  account: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
  },
  social: {
    bg: "bg-pink-500/10",
    text: "text-pink-400",
  },
  idea: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
  },
  startup: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
  },
  task: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
  },
  message: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
  },
  file: {
    bg: "bg-gray-500/10",
    text: "text-gray-400",
  },
  reward: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
  },
  governance: {
    bg: "bg-teal-500/10",
    text: "text-teal-400",
  },
  funding: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
  },
  ai: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
  },
  event: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
  },
  system: {
    bg: "bg-gray-500/10",
    text: "text-gray-400",
  },
};

export default {
  notificationColors,
  priorityStyles,
  categoryColors,
};
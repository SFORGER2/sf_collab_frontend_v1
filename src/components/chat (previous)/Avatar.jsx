/**
 * Avatar Component - Fixed Version
 * 
 * Status Colors:
 * - Online = Green (emerald-500)
 * - Idle = Grey (gray-400)
 * - Offline = Red (red-500)
 * 
 * FIXES:
 * - Properly resolves profile picture URLs from various backend formats
 * - Better fallback handling when images fail to load
 * - Consistent image error handling
 */

import React, { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Remove /api suffix to get server base URL
const getServerBaseUrl = () => API_BASE_URL.replace(/\/api\/?$/, '');

// Status color mapping
const STATUS_COLORS = {
  online: "bg-emerald-500",   // Green
  idle: "bg-gray-400",        // Grey  
  offline: "bg-red-500",      // Red
};

/**
 * Resolve avatar source URL
 * Handles various backend response formats
 */
const resolveAvatarSrc = (value) => {
  if (!value) return null;

  const v = String(value).trim();
  
  // Already a full URL or data URI
  if (/^https?:\/\//i.test(v) || v.startsWith("data:") || v.startsWith("blob:")) {
    return v;
  }

  // Local public asset (not an uploads path)
  if (v.startsWith("/") && !v.startsWith("/uploads/")) {
    return v;
  }
  
  // Default avatar
  if (v === '/default-user.jpeg' || v === '/default-avatar.png') {
    return v;
  }

  // Handle uploads paths and filenames
  let filename = v;
  if (filename.startsWith('/')) {
    filename = filename.slice(1);
  }
  if (filename.startsWith('uploads/')) {
    filename = filename.slice(8);
  }
  
  // Build full URL using avatars endpoint
  return `${API_BASE_URL}/users/avatars/${filename}`;
};

/**
 * Extract initials from name
 */
const getInitials = (name) => {
  if (!name) return "?";
  
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
};

export default function Avatar({
  src,
  name,
  size = "md",
  // Backwards compatible: existing callers pass isOnline
  isOnline = false,

  // New: "online" | "idle" | "offline"
  presenceStatus = null,
  showStatus = true,
  className = "",
}) {
  const [imageError, setImageError] = useState(false);
  
  const sizes = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-14 h-14 text-lg",
    "2xl": "w-16 h-16 text-xl",
  };

  const statusSizes = {
    xs: "w-2 h-2 border",
    sm: "w-2.5 h-2.5 border-[1.5px]",
    md: "w-3 h-3 border-2",
    lg: "w-3.5 h-3.5 border-2",
    xl: "w-4 h-4 border-2",
    "2xl": "w-4 h-4 border-2",
  };

  const initials = getInitials(name);
  const resolvedSrc = resolveAvatarSrc(src);
  const showImage = resolvedSrc && !imageError;

  // Determine final status
  const status = presenceStatus || (isOnline ? "online" : "offline");
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.offline;

  // Status title for hover tooltip
  const statusTitle = {
    online: "Online",
    idle: "Away",
    offline: "Offline",
  }[status] || "Offline";

  const handleImageError = () => {
    setImageError(true);
  };
  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      {showImage ? (
        <img loading="lazy" 
          src={resolvedSrc} 
          alt={name || "User"} 
          className={`${sizes[size]} rounded-full object-cover bg-zinc-700`}
          onError={handleImageError}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-semibold text-white`}
        >
          {initials}
        </div>
      )}
      {showStatus && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${statusSizes[size]} rounded-full border-zinc-900 ${statusColor}`}
          title={statusTitle}
        />
      )}
    </div>
  );
}

// Export status colors for use in other components
export { STATUS_COLORS };
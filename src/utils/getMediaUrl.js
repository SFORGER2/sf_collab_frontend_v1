// src/utils/getMediaUrl.js

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Convert a media URL to a fully qualified URL.
 * - If absolute (http), return as-is.
 * - If relative (starts with /), prepend the base host (without /api).
 * - Otherwise treat as relative and add leading slash before prepending.
 */
export function getMediaUrl(url) {
  if (!url) return null;

  // Already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Remove trailing /api from API_BASE_URL to get the base host
  const base = API_BASE_URL.replace(/\/api\/?$/, '');

  // If it starts with /, just prepend the base (no extra slash)
  if (url.startsWith('/')) {
    return `${base}${url}`;
  }

  // Otherwise, add a slash
  return `${base}/${url}`;
}

/**
 * Get avatar URL from user object – handles common field names.
 */
export function getAvatarUrl(user) {
  if (!user) return null;
  const pic =
    user.profile_picture ||
    user.profile?.picture ||
    user.avatar_url ||
    user.avatar ||
    user.profilePicture ||
    null;
  return pic ? getMediaUrl(pic) : null;
}
/**
 * getProfilePicture.js
 *
 * Resolves a user object's profile picture to a URL the browser can load.
 *
 * The backend has stored profile_picture in several formats over time:
 *   1. /uploads/user_avatars/filename.jpg       (new local format)
 *   2. /api/users/avatars/filename.jpg          (old local format)
 *   3. https://cdn.example.com/...              (S3/CDN — already absolute)
 *   4. null / undefined                         (no picture set)
 *
 * API_BASE_URL = "/api"  in dev (Vite proxy strips nothing; backend is at :5001)
 * The Vite proxy forwards /api/* → http://localhost:5001/api/*
 * The Vite proxy forwards /uploads/* → http://localhost:5001/uploads/*  (via the catch-all)
 * The backend serves /api/users/avatars/<filename> via users_bp
 * The backend serves /uploads/user_avatars/<filename> via main_bp (new static route)
 */

export function getProfilePicture(user) {
  if (!user) return "/default-user.jpeg";

  const raw =
    user?.profile?.picture ??
    user?.profile?.photo ??
    user?.profilePicture ??
    user?.profile_picture ??
    user?.avatar ??
    user?.avatarUrl ??
    user?.avatar_url ??
    user?.photo ??
    user?.photoUrl ??
    user?.image ??
    null;

  if (!raw) return "/default-user.jpeg";

  // Already an absolute URL (S3, CDN, etc.) — use as-is
  if (typeof raw === "string" && (raw.startsWith("http://") || raw.startsWith("https://"))) {
    return raw;
  }

  // data: URI (base64 preview) — use as-is
  if (typeof raw === "string" && raw.startsWith("data:")) {
    return raw;
  }

  const path = String(raw);

  // Already a usable relative path starting with /api or /uploads — use as-is.
  // The Vite proxy will forward it to the backend correctly.
  if (path.startsWith("/api/") || path.startsWith("/uploads/")) {
    return path;
  }

  // Bare filename or partial path — attach to the avatars endpoint
  const filename = path.replace(/^\/+/, "");
  return `/api/users/avatars/${filename}`;
}
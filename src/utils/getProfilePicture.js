/**
 * getProfilePicture.js
 *
 * Vite proxies /api → http://localhost:5001, so root-relative paths like
 * "/api/users/avatars/file.png" work directly in <img src> without any
 * host prepending. Just return the path as-is.
 */
export function resolveBackendUrl(path) {
  if (!path) return null;
  if (typeof path !== "string") return null;
  // Already absolute — use as-is
  if (path.startsWith("http")) return path;
  // Root-relative /api/... paths work via Vite proxy — use as-is
  return path;
}

export function getProfilePicture(user) {
  if (!user) return null;
  const raw =
    user?.profile?.picture   ??
    user?.profile?.photo     ??
    user?.profilePicture     ??
    user?.profile_picture    ??
    user?.avatar             ??
    user?.avatarUrl          ??
    user?.avatar_url         ??
    user?.photo              ??
    user?.image              ??
    null;
  return resolveBackendUrl(raw);
}
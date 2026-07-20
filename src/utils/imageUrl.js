/**
 * imageUrl.js
 *
 * Resolves backend image paths to URLs the browser can load.
 *
 * Dev setup:
 *   Frontend: http://localhost:5173  (Vite)
 *   Backend:  http://localhost:5001  (Flask)
 *   Vite proxies /api/* and /uploads/* and /startups/* to :5001
 *
 * Backend stores these path formats:
 *   /uploads/user_avatars/filename.jpg    → served via Vite proxy /uploads/*
 *   /api/users/avatars/filename.jpg       → served via Vite proxy /api/*
 *   /startups/2/logo                      → needs /api prefix → /api/startups/2/logo
 *   https://cdn.example.com/...           → absolute, use as-is
 *
 * Strategy: keep paths relative (no host prefix) so Vite proxy handles routing.
 * The only transform needed is adding /api prefix to /startups/* and /visions/* paths.
 */

export function resolveImageUrl(path) {
  if (!path) return null;

  // Already absolute
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  // base64 data URI
  if (path.startsWith('data:')) return path;

  // Paths that already have the right prefix — return as-is (Vite proxy handles them)
  if (path.startsWith('/api/') || path.startsWith('/uploads/')) return path;

  // /startups/* and /visions/* are served by Flask blueprints under /api/
  // so they need the /api prefix for Vite proxy to route them correctly
  if (path.startsWith('/startups/') || path.startsWith('/visions/')) {
    return `/api${path}`;
  }

  // Anything else — return as-is and let Vite try
  return path;
}

export function resolveImageUrlWithFallback(path, fallback = 'https://via.placeholder.com/150') {
  return resolveImageUrl(path) || fallback;
}
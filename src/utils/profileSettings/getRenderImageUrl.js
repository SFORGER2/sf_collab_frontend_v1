/**
 * getRenderImageUrl.js
 *
 * Converts a backend-relative image path to an absolute URL.
 *
 * The backend stores paths in two forms:
 *   - Relative paths:   /uploads/user_avatars/20240101_1_photo.jpg
 *   - API paths:        /api/users/avatars/20240101_1_photo.jpg
 *   - Already absolute: https://cdn.example.com/...
 *
 * In dev the frontend runs on :5173 and the backend on :5001, so
 * relative paths must be prefixed with the backend base URL.
 * VITE_API_URL should be set to http://localhost:5001 (no /api suffix).
 */

// Strip any trailing /api or / so we always get a clean base like http://localhost:5001
const RAW = (import.meta.env.VITE_API_URL || 'http://localhost:5001').trim();
const BACKEND_BASE = RAW.replace(/\/api$/, '').replace(/\/$/, '');

export const getRenderImageUrl = (imagePath) => {
  if (!imagePath) return '';
  // Already absolute — return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // base64 data URI — return as-is
  if (imagePath.startsWith('data:')) return imagePath;
  // Relative path — prefix with backend base
  const sep = imagePath.startsWith('/') ? '' : '/';
  return `${BACKEND_BASE}${sep}${imagePath}`;
};

export default getRenderImageUrl;
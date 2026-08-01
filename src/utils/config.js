export const API_URL = (import.meta.env.VITE_API_URL || "https://backend-sigma-pied-40.vercel.app/api").trim();
export const API_URL_AUTH = (import.meta.env.VITE_API_URL_AUTH || "/api/auth").trim();
export const API_BASE_URL_NO_API = API_URL.replace("/api", "");
export const SOCKET_API_URL = (import.meta.env.VITE_SOCKET_API_URL || API_BASE_URL_NO_API).trim();
export const STRIPE_PUBLIC_KEY = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "").trim();
export const API_BASE_URL = API_URL;
export const getApiUrl = () => API_URL;
export const getSocketUrl = () => SOCKET_API_URL;

// AI tools temporary lock configuration
// Lock window: 14 days starting from 27 Feb 2026
const AI_TOOLS_LOCK_START = new Date("2026-02-27T00:00:00Z").getTime();
const AI_TOOLS_LOCK_DURATION_DAYS = 14;
const AI_TOOLS_LOCK_DURATION_MS = AI_TOOLS_LOCK_DURATION_DAYS * 24 * 60 * 60 * 1000;

export const AI_TOOLS_UNLOCK_AT = AI_TOOLS_LOCK_START + AI_TOOLS_LOCK_DURATION_MS;

export const isAiToolsLocked = () => Date.now() < AI_TOOLS_UNLOCK_AT;

export const getAiToolsLockRemainingDays = () => {
  const remainingMs = AI_TOOLS_UNLOCK_AT - Date.now();
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
};

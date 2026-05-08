import { io } from "socket.io-client";
import { SOCKET_API_URL } from "./config";

/**
 * Singleton socket — one connection shared across all components.
 *
 * FIXES:
 * 1. Accepts a live `token` arg so callers (NotificationContext etc.) can pass
 *    the Redux auth token, avoiding the race where the module loads before
 *    Redux Persist has written the token to localStorage.
 * 2. If a stale unauthenticated socket exists but we now have a token, it is
 *    destroyed and rebuilt with proper auth so real-time events flow correctly.
 */
let _instance = null;

export const getSocketInstance = (liveToken = null) => {
  // Resolve the best available token
  const token =
    liveToken ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    null;

  if (_instance) {
    // If the existing socket has no auth but we now have a token, rebuild it
    const hasAuth = !!_instance.auth?.token;
    if (hasAuth || !token) return _instance;
    _instance.disconnect();
    _instance = null;
  }

  _instance = io(SOCKET_API_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  return _instance;
};

// Call this on logout so the next login gets a fresh authenticated connection
export const destroySocketInstance = () => {
  if (_instance) {
    _instance.disconnect();
    _instance = null;
  }
};
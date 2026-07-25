import axios from "axios";
import { API_BASE_URL } from "../config";

// Local helper to dispatch toast events and prevent circular dependencies with NotificationContext
const triggerToast = ({ type = "info", title, message, data }) => {
  window.dispatchEvent(
    new CustomEvent("showToast", { detail: { type, title, message, data } })
  );
};
const logErrorToBackend = (error) => {
  console.error("API Error:", error);
};

export const requestInterceptor = (config) => {
  const token = localStorage.getItem("access_token");

  if (!config.headers.Authorization && !!token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

export const requestErrorInterceptor = (error) => {
  return Promise.reject(error);
};

export const responseInterceptor = (response) => response;

export const responseErrorInterceptor = (error) => {
  if (error.code === "ECONNREFUSED") {
    console.error("❌ Cannot connect to backend at", API_BASE_URL);
    return Promise.reject(error);
  }

  const status = error.response?.status;
  const data = error.response?.data;
  const path = window.location.pathname;

  if (![401, 403, 404].includes(status)) {
    logErrorToBackend(error);
  }

  // ─── 401 handling ────────────────────────────────────────────────────────
  // DO NOT wipe auth data just because one endpoint returned 401.
  // Many endpoints return 401 for reasons unrelated to the user's session
  // (e.g. cookie-based JWT misconfiguration, missing permissions on a specific
  // route, etc.). Wiping localStorage on any 401 causes the user to be logged
  // out while their token is still perfectly valid.
  //
  // The only safe logout trigger is when the *token itself* is rejected —
  // i.e. when the backend explicitly says the token is expired or invalid.
  // We detect that by checking the error message from the backend.
  if (status === 401) {
    const msg = data?.msg || data?.message || "";
    const isTokenExpired =
      msg.includes("token has expired") ||
      msg.includes("Token has expired") ||
      msg.includes("expired") ||
      msg.includes("invalid token") ||
      msg.includes("Invalid token") ||
      msg.includes("signature verification failed");

    // Only force logout when the JWT itself is genuinely expired/invalid,
    // not for cookie-missing errors or other 401s from unrelated endpoints
    const isCookieError = msg.includes("cookie");

    if (isTokenExpired && !isCookieError) {
      const isAuthRoute =
        path.startsWith("/login") ||
        path.startsWith("/signup") ||
        path.startsWith("/auth") ||
        path === "/";

      if (!isAuthRoute) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        console.warn("🔐 Token expired — redirecting to login");
        window.location.href = "/login";
      }
    }
    // For all other 401s (cookie errors, permission issues, etc.)
    // just reject silently — do NOT wipe auth or redirect
    return Promise.reject(error);
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Trigger Toast Notification on API Errors (excluding auth redirect paths)
  if (status && status !== 401 && status !== 403) {
    const apiError = data?.error;
    const message = apiError?.message || error.message || "An unexpected error occurred.";
    const code = apiError?.code;

    if (status === 404) {
      triggerToast({
        type: "error",
        title: "Not Found",
        message: message || "Requested resource was not found."
      });
    } else if (status === 409) {
      triggerToast({
        type: "warning",
        title: "State Warning",
        message: message || "Action invalid for current status."
      });
    } else if (status === 422) {
      triggerToast({
        type: "error",
        title: "Validation Error",
        message: message || "Please verify your inputs."
      });
    } else if (status === 429) {
      triggerToast({
        type: "warning",
        title: "Rate Limit Reached",
        message: "Try again shortly."
      });
    } else if (status === 502 || code === "git_orchestration_error") {
      triggerToast({
        type: "error",
        title: "Delivery Error",
        message: message || "Git push failed."
      });
    } else if (status >= 500) {
      triggerToast({
        type: "error",
        title: "Server Error",
        message: message || "An internal server error occurred."
      });
    } else {
      triggerToast({
        type: "error",
        title: "Error",
        message: message
      });
    }
  }

  if (data) {
    console.error("API Error:", status, data);
    // ⚠️ Always reject with the original axios error, NOT the data object.
    // Rejecting with `data` strips error.response.status from catch blocks,
    // making it impossible to distinguish 404 vs 500 vs network errors.
    return Promise.reject(error);
  }

  if (error.response) {
    console.error("API Error:", status, error.response.data);
  }

  return Promise.reject(error);
};

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
};

// ─── ✅ CREATE AND CONFIGURE AXIOS INSTANCE ─────────────────────────────

const api = axios.create(API_CONFIG);

api.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

api.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);

export default api;
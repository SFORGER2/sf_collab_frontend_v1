/**
 * parseApiError.js
 * Translates raw Axios/network errors into user-friendly messages.
 * Used by ErrorState component and useApiRequest hook.
 */

/**
 * @typedef {Object} ParsedError
 * @property {string} title       - Short, capitalised error heading
 * @property {string} message     - Full, human-readable explanation
 * @property {'network'|'auth'|'forbidden'|'api'|'server'|'unknown'} type
 */

/**
 * Maps an Axios (or fetch) error to a structured, user-friendly object.
 *
 * @param {unknown} error - The caught error value
 * @returns {ParsedError}
 */
export function parseApiError(error) {
  // ── Network / offline ──────────────────────────────────────────────────────
  if (
    !error?.response &&
    (error?.code === 'ERR_NETWORK' ||
      error?.code === 'ECONNREFUSED' ||
      error?.code === 'ECONNABORTED' ||
      !navigator.onLine)
  ) {
    return {
      type: 'network',
      title: 'No Internet Connection',
      message:
        "Looks like you're offline. Please check your connection and try again.",
    };
  }

  const status = error?.response?.status;

  // ── 401 Unauthorized ───────────────────────────────────────────────────────
  if (status === 401) {
    return {
      type: 'auth',
      title: 'Session Expired',
      message:
        "You don't have permission to view this. Please log in or check your account settings.",
    };
  }

  // ── 403 Forbidden ──────────────────────────────────────────────────────────
  if (status === 403) {
    return {
      type: 'forbidden',
      title: 'Access Denied',
      message:
        "You don't have permission to view this content. Please log in or check your account settings.",
    };
  }

  // ── 4xx API errors (excluding 401/403 which are handled above) ──────────────
  if (status >= 400 && status < 500) {
    return {
      type: 'api',
      title: 'Request Failed',
      message:
        error?.response?.data?.error ||
        "Something went wrong with that request. Please try again.",
    };
  }

  // ── 5xx Server errors ───────────────────────────────────────────────────────
  if (status >= 500) {
    return {
      type: 'server',
      title: 'Server Error',
      message:
        "Oops! Something went wrong on our servers. We're looking into it.",
    };
  }

  // ── Unknown / fallback ─────────────────────────────────────────────────────
  return {
    type: 'unknown',
    title: 'Something Went Wrong',
    message:
      "We couldn't load this right now. Give it another shot.",
  };
}

/**
 * components/notifications/ToastNotification.jsx
 *
 * Drop-in replacement for the existing ToastNotification.
 * Keeps the same CSS class names (toast-container, toast, toast-{type}, etc.)
 * so existing ToastNotification.css still applies.
 *
 * Enhancements over original:
 *  - Deduplication: identical title+type within 2s are collapsed
 *  - Priority-aware duration (critical = 8s, high = 6s, default = 5s)
 *  - Click-to-navigate if notification carries a link_url
 *  - Accessible: role="alert", aria-live="polite"
 *  - Max 5 toasts visible at once (oldest auto-dismissed)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle, Info, AlertTriangle, AlertCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ToastNotification.css";

const MAX_TOASTS = 5;

const DURATIONS = {
  critical: 8000,
  high:     6000,
  default:  5000,
};

export default function ToastNotification() {
  const [toasts, setToasts]   = useState([]);
  const navigate              = useNavigate();
  const recentKeys            = useRef(new Set());  // dedup window

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const handle = (event) => {
      const { type, title, message, data } = event.detail ?? {};

      // Dedup: same title+type within 2s
      const key = `${type}::${title}`;
      if (recentKeys.current.has(key)) return;
      recentKeys.current.add(key);
      setTimeout(() => recentKeys.current.delete(key), 2000);

      const id       = Date.now() + Math.random();
      const priority = data?.priority ?? "medium";
      const duration = DURATIONS[priority] ?? DURATIONS.default;

      const newToast = { id, type: type ?? "info", title, message, data, duration };

      setToasts(prev => {
        const next = [newToast, ...prev];
        // Dismiss oldest if over limit
        if (next.length > MAX_TOASTS) {
          const removed = next.splice(MAX_TOASTS);
          removed.forEach(t => {
            setTimeout(() => removeToast(t.id), 0);
          });
        }
        return next;
      });

      setTimeout(() => removeToast(id), duration);
    };

    window.addEventListener("showToast", handle);
    return () => window.removeEventListener("showToast", handle);
  }, [removeToast]);

  const handleClick = useCallback((toast) => {
    const link = toast.data?.link_url ?? toast.data?.linkUrl;
    if (link) navigate(link);
    removeToast(toast.id);
  }, [navigate, removeToast]);

  if (!toasts.length) return null;

  return (
    <div
      className="toast-container"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="alert"
          className={`toast toast-${toast.type}`}
          onClick={() => handleClick(toast)}
          style={{ cursor: toast.data?.link_url || toast.data?.linkUrl ? "pointer" : "default" }}
        >
          <div className="toast-content">
            <div className="toast-icon-wrapper">
              <ToastIcon type={toast.type} />
            </div>

            <div className="toast-text">
              <h4 className="toast-title">{toast.title}</h4>
              {toast.message && (
                <p className="toast-message">{toast.message}</p>
              )}
            </div>

            <button
              className="toast-close"
              aria-label="Dismiss"
              onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
            >
              <X size={16} />
            </button>
          </div>

          <div
            className="toast-progress"
            style={{ animationDuration: `${toast.duration}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

function ToastIcon({ type }) {
  const cls = "toast-icon";
  switch (type) {
    case "success": return <CheckCircle   className={cls} size={20} />;
    case "warning": return <AlertTriangle className={cls} size={20} />;
    case "error":   return <AlertCircle   className={cls} size={20} />;
    default:        return <Info          className={cls} size={20} />;
  }
}
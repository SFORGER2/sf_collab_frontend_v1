/**
 * hooks/useNotificationAlerts.js
 *
 * Four specialised hooks that listen to custom DOM events fired by
 * NotificationContext when real-time notifications arrive.
 *
 * Events fired by NotificationContext:
 *   sfcollab:warning_alert   — moderation/critical/warning/error notifications
 *   sfcollab:payout_alert    — payment/marketplace/mentorship payout notifications
 *   sfcollab:task_reminder   — task-category / deadline notifications
 *   sfcollab:mention         — mention notifications
 *
 * Usage — mount once in a layout component (e.g. Layout.jsx or App.jsx):
 *
 *   import { useWarningAlerts, usePayoutAlerts,
 *            useTaskReminders, useMentionAlerts } from '@/hooks/useNotificationAlerts';
 *
 *   function Layout() {
 *     useWarningAlerts();
 *     usePayoutAlerts();
 *     useTaskReminders();
 *     useMentionAlerts();
 *     ...
 *   }
 *
 * Each hook fires a window 'showToast' event AND returns the latest alert
 * so components can react if needed.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─── Internal: listen to a custom DOM event ────────────────────────────────────
function useCustomEvent(eventName, handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const listener = (e) => handlerRef.current(e.detail);
    window.addEventListener(eventName, listener);
    return () => window.removeEventListener(eventName, listener);
  }, [eventName]);
}

// ─── Internal: fire a toast ────────────────────────────────────────────────────
function fireToast({ type, title, message, data }) {
  window.dispatchEvent(
    new CustomEvent("showToast", { detail: { type, title, message, data } })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  1. Warning Alerts
//     Triggered by: moderation, critical-priority, warning/error type
// ─────────────────────────────────────────────────────────────────────────────
export function useWarningAlerts({ onWarning } = {}) {
  const [latestWarning, setLatestWarning] = useState(null);

  useCustomEvent("sfcollab:warning_alert", (notification) => {
    setLatestWarning(notification);

    // Show persistent toast for critical items
    fireToast({
      type:    notification.priority === "critical" ? "error" : "warning",
      title:   notification.title ?? "Alert",
      message: notification.message ?? "",
      data:    notification,
    });

    // Vibrate on mobile for critical alerts
    if (notification.priority === "critical" && navigator?.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }

    if (onWarning) onWarning(notification);
  });

  const dismissWarning = useCallback(() => setLatestWarning(null), []);

  return { latestWarning, dismissWarning };
}

// ─────────────────────────────────────────────────────────────────────────────
//  2. Payout Alerts
//     Triggered by: payment, marketplace, mentorship payout notifications
// ─────────────────────────────────────────────────────────────────────────────
export function usePayoutAlerts({ onPayout } = {}) {
  const [latestPayout, setLatestPayout] = useState(null);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const navigate = useNavigate();

  useCustomEvent("sfcollab:payout_alert", (notification) => {
    setLatestPayout(notification);
    setPayoutHistory(prev => [notification, ...prev].slice(0, 20));

    fireToast({
      type:    "success",
      title:   notification.title ?? "Payment Update",
      message: notification.message ?? "",
      data:    notification,
    });

    if (onPayout) onPayout(notification);
  });

  const navigateToWallet = useCallback(() => navigate("/wallet"), [navigate]);
  const dismissPayout    = useCallback(() => setLatestPayout(null), []);

  return { latestPayout, payoutHistory, navigateToWallet, dismissPayout };
}

// ─────────────────────────────────────────────────────────────────────────────
//  3. Task Reminders
//     Triggered by: task category, TASK_DEADLINE_APPROACHING, TASK_OVERDUE
// ─────────────────────────────────────────────────────────────────────────────
export function useTaskReminders({ onReminder } = {}) {
  const [pendingReminders, setPendingReminders] = useState([]);
  const navigate = useNavigate();

  useCustomEvent("sfcollab:task_reminder", (notification) => {
    setPendingReminders(prev => {
      // Deduplicate by entity_id (task id)
      const filtered = prev.filter(r => r.entity_id !== notification.entity_id);
      return [notification, ...filtered].slice(0, 10);
    });

    const isOverdue = (notification.data?.template_key || "").includes("OVERDUE");

    fireToast({
      type:    isOverdue ? "error" : "warning",
      title:   notification.title ?? "Task Reminder",
      message: notification.message ?? "",
      data:    notification,
    });

    if (onReminder) onReminder(notification);
  });

  const dismissReminder = useCallback((entityId) => {
    setPendingReminders(prev => prev.filter(r => r.entity_id !== entityId));
  }, []);

  const navigateToTask = useCallback((taskId) => {
    navigate(taskId ? `/projects?task=${taskId}` : "/projects");
  }, [navigate]);

  return { pendingReminders, dismissReminder, navigateToTask };
}

// ─────────────────────────────────────────────────────────────────────────────
//  4. Mention Alerts
//     Triggered by: USER_MENTIONED, MENTION_IN_CHAT templates
// ─────────────────────────────────────────────────────────────────────────────
export function useMentionAlerts({ onMention } = {}) {
  const [mentions, setMentions] = useState([]);
  const [unreadMentions, setUnreadMentions] = useState(0);
  const navigate = useNavigate();

  useCustomEvent("sfcollab:mention", (notification) => {
    setMentions(prev => [notification, ...prev].slice(0, 50));
    setUnreadMentions(c => c + 1);

    fireToast({
      type:    "info",
      title:   notification.title ?? "You were mentioned",
      message: notification.message ?? "",
      data:    notification,
    });

    if (onMention) onMention(notification);
  });

  const clearUnreadMentions = useCallback(() => setUnreadMentions(0), []);
  const dismissMention = useCallback((id) => {
    setMentions(prev => prev.filter(m => m.id !== id));
  }, []);

  const navigateToMention = useCallback((notification) => {
    const key = notification?.data?.template_key ?? "";
    if (key.includes("CHAT") || notification?.category === "message") {
      navigate("/chat");
    } else if (notification?.entity_type === "idea") {
      navigate("/ideation");
    } else {
      navigate("/posts");
    }
  }, [navigate]);

  return {
    mentions,
    unreadMentions,
    clearUnreadMentions,
    dismissMention,
    navigateToMention,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  5. Composite hook — mount all four at once
//     Usage: useAllNotificationAlerts() in Layout.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function useAllNotificationAlerts(callbacks = {}) {
  const warnings  = useWarningAlerts({ onWarning:  callbacks.onWarning  });
  const payouts   = usePayoutAlerts ({ onPayout:   callbacks.onPayout   });
  const reminders = useTaskReminders({ onReminder: callbacks.onReminder });
  const mentions  = useMentionAlerts({ onMention:  callbacks.onMention  });

  return { warnings, payouts, reminders, mentions };
}

export default useAllNotificationAlerts;
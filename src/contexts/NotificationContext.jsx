/**
 * contexts/NotificationContext.jsx
 *
 * Central notification context. Powers:
 *  - NotificationBell, NotificationPage, NotificationItem
 *  - ToastNotification (via window.showToast events)
 *  - Real-time delivery via Socket.IO (new_notification, notification_read,
 *    notifications_marked_read, notification_count)
 *  - Warning alerts, payout alerts, task reminders, mention system
 *  - Notification preferences
 *
 * Socket events consumed (emitted by socket_events.py):
 *   new_notification          → prepend to list, increment unread, show toast
 *   notification_read         → mark single as read in local state
 *   notifications_marked_read → mark all as read in local state
 *   notification_count        → sync unread count on reconnect
 *
 * Socket events emitted (handled by socket_events.py):
 *   mark_notification_read        → { notification_id }
 *   mark_all_notifications_read   → { category? }
 */

import React, {
  createContext, useContext, useCallback,
  useEffect, useRef, useState, useMemo,
} from "react";
import notificationAPI from "@/utils/APIs/notificationAPI";

// ─── Toast helper ─────────────────────────────────────────────────────────────
export function showToast({ type = "info", title, message, data }) {
  window.dispatchEvent(
    new CustomEvent("showToast", { detail: { type, title, message, data } })
  );
}

// ─── Preference defaults ──────────────────────────────────────────────────────
const DEFAULT_PREFS = {
  realtime:          true,
  toastEnabled:      true,
  // Per-category toasts
  toastCategories:   ["task", "mention", "payment", "warning", "account"],
  // Quiet hours
  quietHours:        { enabled: false, start: "22:00", end: "08:00" },
  // Per-category mutes
  mutedCategories:   [],
};

// ─── Context ──────────────────────────────────────────────────────────────────
const NotificationContext = createContext(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}

// ─── Quiet-hours check ────────────────────────────────────────────────────────
function inQuietHours(prefs) {
  if (!prefs?.quietHours?.enabled) return false;
  const now   = new Date();
  const mins  = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = (prefs.quietHours.start || "22:00").split(":").map(Number);
  const [eh, em] = (prefs.quietHours.end   || "08:00").split(":").map(Number);
  const start = sh * 60 + sm;
  const end   = eh * 60 + em;
  return start < end
    ? mins >= start && mins < end
    : mins >= start || mins < end;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [hasMore,       setHasMore]       = useState(false);
  const [error,         setError]         = useState(null);
  const [isConnected,   setIsConnected]   = useState(true);
  const [prefs,         setPrefs]         = useState(DEFAULT_PREFS);
  const [activeFilters, setActiveFilters] = useState({});

  const pageRef    = useRef(1);
  const socketRef  = useRef(null);   // Socket.IO instance
  const mountedRef = useRef(true);

  // ─────────────────────────────────────────────────────────────────────────
  //  Socket: get from SocketProvider via the global singleton
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Retry until SocketProvider has initialised the socket
    const tryAttach = () => {
      // Works with the standard getSocketInstance pattern used across this project
      try {
        const { getSocketInstance } = require("@/utils/getSocketInstance");
        const sock = getSocketInstance();
        if (sock) { socketRef.current = sock; return true; }
      } catch {}
      return false;
    };
    if (!tryAttach()) {
      const id = setInterval(() => { if (tryAttach()) clearInterval(id); }, 500);
      return () => clearInterval(id);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  //  Fetch notifications (REST)
  // ─────────────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async (filters = {}, page = 1) => {
    if (!mountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const data = await notificationAPI.getAll({ ...filters, page, per_page: 20 });
      const list  = data?.notifications ?? [];
      const total = data?.pagination?.total ?? list.length;
      const shown = page * 20;

      if (!mountedRef.current) return;

      if (page === 1) {
        setNotifications(list);
      } else {
        setNotifications(prev => {
          const ids = new Set(prev.map(n => n.id));
          return [...prev, ...list.filter(n => !ids.has(n.id))];
        });
      }
      setHasMore(shown < total);
    } catch (e) {
      if (mountedRef.current) setError("Could not load notifications.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationAPI.getUnreadCount();
      if (mountedRef.current) setUnreadCount(data?.unreadCount ?? data?.unread_count ?? 0);
    } catch {}
  }, []);

  // Initial load
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    return () => { mountedRef.current = false; };
  }, []); // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────────────
  //  Socket.IO real-time events
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const attach = () => {
      const sock = socketRef.current;
      if (!sock) return;

      // ── new_notification ────────────────────────────────────────────────
      const onNew = (payload) => {
        const n = payload?.notification ?? payload;
        if (!n?.id) return;

        setNotifications(prev => {
          if (prev.some(x => x.id === n.id)) return prev;
          return [n, ...prev];
        });
        setUnreadCount(c => c + (n.is_read ? 0 : 1));

        // Toast — respect prefs + quiet hours + category mutes
        if (
          prefs.toastEnabled
          && !inQuietHours(prefs)
          && !(prefs.mutedCategories || []).includes(n.category)
        ) {
          const wantToast = !prefs.toastCategories?.length
            || prefs.toastCategories.includes(n.category)
            || n.priority === "critical"
            || n.priority === "high";

          if (wantToast) {
            showToast({
              type:    n.notification_type ?? n.type ?? "info",
              title:   n.title,
              message: n.message,
              data:    n,
            });
          }
        }

        // Warn alert — warning/error priority and category
        if (
          n.category === "moderation" ||
          n.priority  === "critical"   ||
          n.notification_type === "warning" ||
          n.notification_type === "error"
        ) {
          window.dispatchEvent(new CustomEvent("sfcollab:warning_alert", { detail: n }));
        }

        // Payout alert
        if (n.category === "payment" || n.category === "marketplace" || n.category === "mentorship") {
          window.dispatchEvent(new CustomEvent("sfcollab:payout_alert", { detail: n }));
        }

        // Task reminder
        if (
          n.category === "task" ||
          (n.data?.template_key || "").includes("TASK_") ||
          (n.data?.template_key || "").includes("DEADLINE")
        ) {
          window.dispatchEvent(new CustomEvent("sfcollab:task_reminder", { detail: n }));
        }

        // Mention
        if (
          (n.data?.template_key || "").includes("MENTION") ||
          (n.data?.template_key || "").includes("mention")
        ) {
          window.dispatchEvent(new CustomEvent("sfcollab:mention", { detail: n }));
        }
      };

      // ── notification_read (single) ──────────────────────────────────────
      const onRead = ({ notification_id, unread_count }) => {
        setNotifications(prev =>
          prev.map(n => n.id === notification_id ? { ...n, is_read: true } : n)
        );
        if (unread_count !== undefined) setUnreadCount(unread_count);
      };

      // ── notifications_marked_read (bulk) ────────────────────────────────
      const onAllRead = ({ unread_count, category }) => {
        setNotifications(prev =>
          prev.map(n =>
            (!category || n.category === category) ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(unread_count ?? 0);
      };

      // ── notification_count (initial sync on connect) ─────────────────────
      const onCount = ({ unread_count }) => {
        setUnreadCount(unread_count ?? 0);
        setIsConnected(true);
      };

      const onConnect    = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);

      sock.on("new_notification",          onNew);
      sock.on("notification_read",         onRead);
      sock.on("notifications_marked_read", onAllRead);
      sock.on("notification_count",        onCount);
      sock.on("connect",                   onConnect);
      sock.on("disconnect",                onDisconnect);

      return () => {
        sock.off("new_notification",          onNew);
        sock.off("notification_read",         onRead);
        sock.off("notifications_marked_read", onAllRead);
        sock.off("notification_count",        onCount);
        sock.off("connect",                   onConnect);
        sock.off("disconnect",                onDisconnect);
      };
    };

    // Retry if socket not yet ready
    if (socketRef.current) {
      return attach();
    }
    const id = setInterval(() => {
      if (socketRef.current) { clearInterval(id); attach(); }
    }, 500);
    return () => clearInterval(id);
  }, [prefs]); // re-bind when prefs change so toast logic is fresh

  // ─────────────────────────────────────────────────────────────────────────
  //  Actions
  // ─────────────────────────────────────────────────────────────────────────

  const markAsRead = useCallback(async (id) => {
    // Optimistic
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
    // Socket (fastest) + REST (persistent)
    if (socketRef.current?.connected) {
      socketRef.current.emit("mark_notification_read", { notification_id: id });
    }
    try { await notificationAPI.markAsRead(id); } catch {}
  }, []);

  const markAsUnread = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: false } : n));
    setUnreadCount(c => c + 1);
    try { await notificationAPI.markAsUnread(id); } catch {}
  }, []);

  const markAllAsRead = useCallback(async (category = null) => {
    setNotifications(prev =>
      prev.map(n => (!category || n.category === category) ? { ...n, is_read: true } : n)
    );
    setUnreadCount(0);
    if (socketRef.current?.connected) {
      socketRef.current.emit("mark_all_notifications_read", { category });
    }
    try { await notificationAPI.markAllRead(category); } catch {}
  }, []);

  const deleteNotification = useCallback(async (id) => {
    const n = notifications.find(x => x.id === id);
    setNotifications(prev => prev.filter(x => x.id !== id));
    if (n && !n.is_read) setUnreadCount(c => Math.max(0, c - 1));
    try { await notificationAPI.delete(id); } catch {}
  }, [notifications]);

  const deleteAllRead = useCallback(async () => {
    setNotifications(prev => prev.filter(n => !n.is_read));
    try { await notificationAPI.deleteAllRead(); } catch {}
  }, []);

  const clearAllNotifications = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);
    try { await notificationAPI.clearAll(); } catch {}
  }, []);

  const refresh = useCallback(() => {
    pageRef.current = 1;
    fetchNotifications(activeFilters, 1);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount, activeFilters]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const next = pageRef.current + 1;
    pageRef.current = next;
    fetchNotifications(activeFilters, next);
  }, [hasMore, loading, fetchNotifications, activeFilters]);

  const applyFilters = useCallback((filters) => {
    setActiveFilters(filters);
    pageRef.current = 1;
    fetchNotifications(filters, 1);
  }, [fetchNotifications]);

  const copyToNotes = useCallback(async (notification) => {
    await notificationAPI.copyToNotes({
      title:     notification.title,
      content:   notification.message,
      source:    "notification",
      source_id: notification.id,
    });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  //  Preferences
  // ─────────────────────────────────────────────────────────────────────────
  const loadPrefs = useCallback(async () => {
    try {
      const p = await notificationAPI.getPreferences();
      if (p) setPrefs(prev => ({ ...prev, ...p }));
    } catch {}
  }, []);

  const updatePrefs = useCallback(async (updates) => {
    setPrefs(prev => ({ ...prev, ...updates }));
    try { await notificationAPI.updatePreferences(updates); } catch {}
  }, []);

  useEffect(() => { loadPrefs(); }, []); // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────────────
  //  Expose
  // ─────────────────────────────────────────────────────────────────────────
  const value = useMemo(() => ({
    // State
    notifications,
    unreadCount,
    loading,
    hasMore,
    error,
    isConnected,
    prefs,
    // Actions
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    clearAllNotifications,
    refresh,
    loadMore,
    applyFilters,
    copyToNotes,
    // Preferences
    updatePrefs,
    loadPrefs,
    // Util
    showToast,
  }), [
    notifications, unreadCount, loading, hasMore, error,
    isConnected, prefs,
    markAsRead, markAsUnread, markAllAsRead,
    deleteNotification, deleteAllRead, clearAllNotifications,
    refresh, loadMore, applyFilters, copyToNotes,
    updatePrefs, loadPrefs,
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationContext;
/**
 * SF Collab Notification Context - FIXED VERSION
 * 
 * FIXES APPLIED ON TOP OF YOUR ORIGINAL:
 * 1. markAllAsRead() is now OPTIMISTIC — badge drops to 0 BEFORE the API call
 * 2. Added `notifications_marked_read` socket listener so all open tabs/windows
 *    sync instantly when any component calls mark-all-read
 * 3. All other original code preserved exactly
 */

import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useMemo, 
  useState, 
  useCallback
} from "react";
import { useSelector } from "react-redux";
import { notificationAPI } from "@/utils/APIs/notificationAPI";
import { getSocketInstance } from "@/utils/getSocketInstance";

// Create context
const NotificationContext = createContext(null);

/**
 * Normalize notification object to have consistent field names
 * Backend sends camelCase (isRead), frontend expects snake_case (is_read)
 */
const normalizeNotification = (notif) => {
  if (!notif) return notif;
  
  return {
    ...notif,
    // Normalize read status - support both conventions
    is_read: notif.is_read ?? notif.isRead ?? false,
    isRead: notif.isRead ?? notif.is_read ?? false,
    // Normalize type
    type: notif.type || notif.notification_type || 'info',
    notification_type: notif.notification_type || notif.type || 'info',
    // Normalize timestamps
    created_at: notif.created_at || notif.createdAt,
    createdAt: notif.createdAt || notif.created_at,
    // Normalize other fields
    user_id: notif.user_id || notif.userId,
    actor_id: notif.actor_id || notif.actorId,
    link_url: notif.link_url || notif.linkUrl,
  };
};

/**
 * Custom hook to use notification context
 */
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
};

/**
 * Notification Provider Component
 */
export const NotificationProvider = ({ children }) => {
  const { user, access_token } = useSelector((state) => state.auth);

  // State
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({});
  const [isConnected, setIsConnected] = useState(false);



  // -----------------------------
  // SOCKET.IO CONNECTION
  // -----------------------------
  useEffect(() => {
    if (!access_token || !user?.id) return;

    const socketInstance = getSocketInstance(access_token);

    const onConnect = async () => {
      setIsConnected(true);
      socketInstance.emit("join_notifications", { user_id: user.id });
      // Fetch fresh unread count from server now that we are in the notification room
      // (Call API directly here — avoids stale-closure / ref timing issues)
      try {
        const data = await notificationAPI.getUnreadCount();
        setUnreadCount(Number(data?.unreadCount ?? data?.unread_count ?? 0));
      } catch (e) {
        // non-critical — count will be correct from initial load
      }
    };

    socketInstance.on("connect", onConnect);

    // If socket is already connected when this effect runs (e.g. hot reload, lazy route),
    // fire the connect logic immediately so we don't miss the join
    if (socketInstance.connected) {
      onConnect();
    }

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket.IO disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err?.message || err);
      setIsConnected(false);
    });

    // Handle new notifications
    socketInstance.on("new_notification", (data) => {
      console.log("📬 New notification received:", data);
      const rawNotif = data?.notification ?? data;
      if (!rawNotif) return;

      // Normalize the notification
      const notif = normalizeNotification(rawNotif);

      // Add to notifications list (avoid duplicates — use String() for type-safe comparison)
      setNotifications((prev) => {
        if (prev.some(n => String(n.id) === String(notif.id))) {
          return prev;
        }
        return [notif, ...prev];
      });
      
      // Increment unread count
      if (!notif.is_read) {
        setUnreadCount((prev) => prev + 1);
      }

      // Dispatch toast event for ToastNotification component
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            type: notif.type || 'info',
            title: notif.title,
            message: notif.message,
            data: notif.data,
          },
        })
      );
    });

    // Handle user status updates
    socketInstance.on("user_status", (data) => {
      console.log("User status update:", data);
    });

    // Handle single notification read sync — use server's authoritative count
    socketInstance.on("notification_read", (data) => {
      const notifId = data?.notificationId ?? data?.notification_id;
      if (notifId !== undefined) {
        setNotifications((prev) =>
          prev.map((n) =>
            String(n.id) === String(notifId) ? { ...n, is_read: true, isRead: true } : n
          )
        );
      }
      // Prefer the authoritative count from server to avoid drift
      if (data?.unread_count !== undefined) {
        setUnreadCount(Math.max(0, Number(data.unread_count)));
      } else {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    });

    // ✅ FIX: Handle mark-ALL-read sync across tabs/windows.
    // The backend emits this event from service.py after mark_all_as_read() succeeds.
    // This means if you open the Notifications page in one tab and the Bell is open
    // in another, both zero out instantly without any polling.
    socketInstance.on("notifications_marked_read", () => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, isRead: true }))
      );
      setUnreadCount(0);
    });

    setSocket(socketInstance);

    return () => {
      // Remove listeners but do NOT destroy the singleton socket.
      // The singleton lives until logout (destroySocketInstance).
      socketInstance.off("connect", onConnect);
      socketInstance.off("new_notification");
      socketInstance.off("notification_read");
      socketInstance.off("notifications_marked_read");
      socketInstance.off("user_status");
      socketInstance.off("disconnect");
      socketInstance.off("connect_error");
      setSocket(null);
      setIsConnected(false);
    };
  }, [access_token, user?.id]);

  // -----------------------------
  // API METHODS
  // -----------------------------
  
  /**
   * Load notifications from API
   */
  const loadNotifications = useCallback(
    async (pageNum = 1, newFilters = filters) => {
      if (!access_token) return;

      try {
        setLoading(true);

        const data = await notificationAPI.getAll({
          page: pageNum,
          per_page: 20,
          ...newFilters,
        });

        // Normalize all notifications
        const rawList = data?.notifications ?? [];
        const list = rawList.map(normalizeNotification);

        if (pageNum === 1) {
          setNotifications(list);
        } else {
          setNotifications((prev) => {
            const existingIds = new Set(prev.map(n => n.id));
            const newItems = list.filter(n => !existingIds.has(n.id));
            return [...prev, ...newItems];
          });
        }

        setPage(pageNum);

        const pagination = data?.pagination;
        if (pagination?.page != null && pagination?.pages != null) {
          setHasMore(pagination.page < pagination.pages);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Error loading notifications:", err);
      } finally {
        setLoading(false);
      }
    },
    [access_token, filters]
  );

  /**
   * Load unread count from API
   */
  const loadUnreadCount = useCallback(async () => {
    if (!access_token) return;
    try {
      const data = await notificationAPI.getUnreadCount();
      setUnreadCount(Number(data?.unreadCount ?? data?.unread_count ?? 0));
    } catch (err) {
      console.error("Error loading unread count:", err);
    }
  }, [access_token]);



  /**
   * Load notification stats
   */
  const loadStats = useCallback(async () => {
    if (!access_token) return;
    try {
      const data = await notificationAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }, [access_token]);

  /**
   * Mark a notification as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    // OPTIMISTIC: update local state immediately, revert on failure
    setNotifications((prev) =>
      prev.map((n) =>
        String(n.id) === String(notificationId) ? { ...n, is_read: true, isRead: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationAPI.markAsRead(notificationId);
      // Backend emits notification_read socket → other tabs sync via onNotificationRead above
    } catch (err) {
      console.error("Error marking notification as read:", err);
      // Revert optimistic update on failure
      setNotifications((prev) =>
        prev.map((n) =>
          String(n.id) === String(notificationId) ? { ...n, is_read: false, isRead: false } : n
        )
      );
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  /**
   * Mark a notification as unread
   */
  const markAsUnread = useCallback(async (notificationId) => {
    try {
      await notificationAPI.markAsUnread(notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: false, isRead: false } : n
        )
      );

      setUnreadCount((prev) => prev + 1);
    } catch (err) {
      console.error("Error marking notification as unread:", err);
    }
  }, []);

  /**
   * Mark all notifications as read
   * 
   * ✅ FIX: Now OPTIMISTIC — unreadCount drops to 0 and all notifications are
   * marked read in local state IMMEDIATELY, before the API call resolves.
   * This means the badge zeroes out the instant you click, with no waiting.
   * If the API call fails, we re-fetch to restore accurate state.
   */
  const markAllAsRead = useCallback(async (category = null) => {
    // --- OPTIMISTIC UPDATE (instant, no flicker) ---
    setUnreadCount(0);
    setNotifications((prev) =>
      prev.map((n) => {
        if (category && n.category !== category) return n;
        return { ...n, is_read: true, isRead: true };
      })
    );

    // --- BACKGROUND API CALL ---
    try {
      await notificationAPI.markAllRead(category);
      // Backend will also emit `notifications_marked_read` via socket,
      // which syncs any other open tabs/windows automatically.
    } catch (err) {
      console.error("Error marking all as read:", err);
      // On failure: revert by reloading real state from server
      loadUnreadCount();
      loadNotifications(1);
    }
  }, [loadUnreadCount, loadNotifications]);

  /**
   * Delete a notification - FIXED
   */
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationAPI.delete(notificationId);
      
      // Find the notification to check if it was unread
      const notification = notifications.find(n => n.id === notificationId);
      
      // Remove from list
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      
      // Update unread count if it was unread
      if (notification && !notification.is_read && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (err) {
      console.error("Error deleting notification:", err);
      throw err;
    }
  }, [notifications]);

  /**
   * Delete all read notifications
   */
  const deleteAllRead = useCallback(async () => {
    try {
      await notificationAPI.deleteAllRead();
      setNotifications((prev) => prev.filter((n) => !n.is_read && !n.isRead));
    } catch (err) {
      console.error("Error deleting read notifications:", err);
      throw err;
    }
  }, []);

  /**
   * Clear ALL notifications - ADDED
   */
  const clearAllNotifications = useCallback(async () => {
    try {
      await notificationAPI.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Error clearing all notifications:", err);
      throw err;
    }
  }, []);

  /**
   * Copy notification to notes
   */
  const copyToNotes = useCallback(async (notification) => {
    try {
      const payload = {
        title: notification?.title || "Notification",
        content: notification?.message || "",
        meta: {
          notification_id: notification?.id,
          category: notification?.category,
          type: notification?.type,
          created_at: notification?.created_at || notification?.createdAt,
          data: notification?.data,
        },
      };

      return await notificationAPI.copyToNotes(payload);
    } catch (err) {
      console.error("Error copying notification to notes:", err);
      throw err;
    }
  }, []);

  // Initial load when authenticated
  useEffect(() => {
    if (!access_token) return;
    loadNotifications(1);
    loadUnreadCount();
  }, [access_token]);

  /**
   * Load more notifications (pagination)
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadNotifications(page + 1);
    }
  }, [loading, hasMore, page, loadNotifications]);

  /**
   * Apply filters and reload
   */
  const applyFilters = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      loadNotifications(1, newFilters);
    },
    [loadNotifications]
  );

  /**
   * Refresh all notification data
   */
  const refresh = useCallback(() => {
    loadNotifications(1);
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  // Context value
  const value = useMemo(
    () => ({
      // State
      notifications,
      unreadCount,
      stats,
      isLoading: loading,
      loading,
      hasMore,
      filters,
      socket,
      isConnected,

      // Actions
      loadMore,
      applyFilters,
      refresh,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      deleteNotification,
      deleteAllRead,
      clearAllNotifications,
      copyToNotes,
      loadStats,
    }),
    [
      notifications,
      unreadCount,
      stats,
      loading,
      hasMore,
      filters,
      socket,
      isConnected,
      loadMore,
      applyFilters,
      refresh,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      deleteNotification,
      deleteAllRead,
      clearAllNotifications,
      copyToNotes,
      loadStats,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
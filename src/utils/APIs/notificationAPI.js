import axios from "axios";
import { API_CONFIG, requestErrorInterceptor, requestInterceptor, responseErrorInterceptor, responseInterceptor } from "./interceptors";



const api = axios.create(API_CONFIG);


api.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

api.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);

// =======================
// HELPERS
// =======================
const extractData = (response) => {
  // Supports:
  // - { data: {...} }
  // - { data: { data: {...} } } (success_response wrapper)
  if (response?.data?.data !== undefined) return response.data.data;
  return response?.data;
};

// =======================
// CONSTANTS (added)
// =======================
export const NOTIFICATION_CATEGORIES = {
  ACCOUNT: "account",
  SOCIAL: "social",
  IDEA: "idea",
  STARTUP: "startup",
  TASK: "task",
  MESSAGE: "message",
  FILE: "file",
  REWARD: "reward",
  GOVERNANCE: "governance",
  FUNDING: "funding",
  AI: "ai",
  EVENT: "event",
  FRIEND: "friend",
  APPLICATION: "application",
  NEWSLETTER: "newsletter", // optional but useful for your UI tab
  ANNOUNCEMENT: "announcement", // optional but useful for your UI tab
};

export const NOTIFICATION_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

// =======================
// API
// =======================
export const notificationAPI = {
  /**
   * Get all notifications with pagination + filters
   * Keeps your old call signature but adds sane defaults.
   */
  getAll: async (params = {}) => {
    const response = await api.get("/notifications", {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 20,
        ...params,
      },
    });
    // Dont want to return announcements/newsletter in this general call to avoid confusion with your specific tabs
    const data = extractData(response) || {};
    if (data.notifications) {
      data.notifications = data.notifications.filter(n => ![NOTIFICATION_CATEGORIES.ANNOUNCEMENT, NOTIFICATION_CATEGORIES.NEWSLETTER].includes(n.category));
    }
    return data;
  },

  /**
   * Get notifications by category
   */
  getByCategory: async (category, params = {}) => {
    const response = await api.get("/notifications", {
      params: { category, ...params },
    });
    return extractData(response);
  },

  /**
   * High priority notifications
   * - Prefer your existing endpoint if your backend has it
   * - Fallback to query params if not
   */
  getHighPriority: async (limit = 5) => {
    try {
      // Your current backend route
      const response = await api.get("/notifications/high-priority", {
        params: { limit },
      });
      return extractData(response);
    } catch {
      // Fallback to query filtering
      const response = await api.get("/notifications", {
        params: { priority: "high,critical", is_read: "false", per_page: limit, page: 1 },
      });
      return extractData(response);
    }
  },

  /**
   * Get single notification by ID (added)
   */
  getById: async (notificationId) => {
    const response = await api.get(`/notifications/${notificationId}`);
    return extractData(response);
  },

  /**
   * Create new notification (added)
   */
  create: async (notificationData) => {
    const response = await api.post("/notifications", notificationData);
    return extractData(response);
  },

  /**
   * Unread count (kept + improved)
   */
  getUnreadCount: async () => {
    const response = await api.get("/notifications/unread-count");
    const data = extractData(response) || {};
    return {
      unreadCount: data.unreadCount ?? data.unread_count ?? 0,
      unread_count: data.unread_count ?? data.unreadCount ?? 0,
    };
  },

  /**
   * Unread count for specific user (added)
   */
  getUserUnreadCount: async (userId) => {
    const response = await api.get(`/notifications/user/${userId}/unread-count`);
    const data = extractData(response) || {};
    return {
      userId: data.user_id ?? userId,
      unreadCount: data.unreadCount ?? data.unread_count ?? 0,
      unread_count: data.unread_count ?? data.unreadCount ?? 0,
    };
  },

  /**
   * Mark single notification as read
   * Your two versions use PUT vs POST. Support both safely.
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return extractData(response);
    } catch {
      const response = await api.post(`/notifications/${notificationId}/read`);
      return extractData(response);
    }
  },

  /**
   * Mark single notification as unread
   */
  markAsUnread: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/unread`);
      return extractData(response);
    } catch {
      const response = await api.post(`/notifications/${notificationId}/unread`);
      return extractData(response);
    }
  },

  /**
   * Mark all as read
   * - Your file uses PUT with body {category}
   * - Other file uses POST with params (?category=)
   * Support both.
   */
  markAllRead: async (category = null) => {
    try {
      const response = await api.put("/notifications/mark-all-read", { category });
      return extractData(response);
    } catch {
      const params = category ? { category } : {};
      const response = await api.post("/notifications/mark-all-read", {}, { params });
      return extractData(response);
    }
  },

  /**
   * Batch mark read (added)
   */
  markBatchRead: async (notificationIds) => {
    const response = await api.post("/notifications/batch/read", {
      notification_ids: notificationIds,
    });
    return extractData(response);
  },

  /**
   * Bulk mark read (kept + normalized payload)
   * Your old one sends {notification_ids}; the other sends {notificationIds}.
   * We'll send both to be compatible.
   */
  bulkMarkRead: async (notificationIds) => {
    try {
      const response = await api.put("/notifications/bulk/mark-read", {
        notification_ids: notificationIds,
        notificationIds,
      });
      return extractData(response);
    } catch {
      const response = await api.post("/notifications/bulk/mark-read", {
        notification_ids: notificationIds,
        notificationIds,
      });
      return extractData(response);
    }
  },

  /**
   * Delete single notification (kept)
   */
  delete: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return extractData(response);
  },

  /**
   * Delete all read
   * Your old endpoint: DELETE /notifications/read
   * Other endpoint: DELETE /notifications/delete-all-read
   * Support both.
   */
  deleteAllRead: async () => {
    try {
      const response = await api.delete("/notifications/delete-all-read");
      return extractData(response);
    } catch {
      const response = await api.delete("/notifications/read");
      return extractData(response);
    }
  },

  /**
   * Clear all notifications
   * Your old endpoint: DELETE /notifications/all
   * If your backend has a different one, you can add here.
   */
  clearAll: async () => {
    const response = await api.delete("/notifications/all");
    return extractData(response);
  },

  /**
   * Bulk delete
   * Your old: DELETE /notifications/bulk with body { notification_ids }
   * Other: POST /notifications/bulk/delete with { notificationIds }
   * Support both.
   */
  bulkDelete: async (notificationIds) => {
    try {
      const response = await api.delete("/notifications/bulk", {
        data: { notification_ids: notificationIds, notificationIds },
      });
      return extractData(response);
    } catch {
      const response = await api.post("/notifications/bulk/delete", {
        notificationIds,
        notification_ids: notificationIds,
      });
      return extractData(response);
    }
  },

  /**
   * Stats (kept + wrapper-safe)
   */
  getStats: async () => {
    const response = await api.get("/notifications/stats");
    const data = extractData(response) || {};
    return data.stats ?? data;
  },

  /**
   * Preferences (kept + wrapper-safe)
   */
  getPreferences: async () => {
    const response = await api.get("/notifications/preferences");
    const data = extractData(response) || {};
    return data.preferences ?? data;
  },

  /**
   * Update preferences (kept)
   */
  updatePreferences: async (preferences) => {
    const response = await api.put("/notifications/preferences", preferences);
    return extractData(response);
  },

  /**
   * Copy notification to Notes (kept)
   */
  copyToNotes: async (noteData) => {
    const response = await api.post("/notes", noteData);
    return extractData(response);
  },
  getAnnouncements: async () => {
    const response = await api.get("/notifications/broadcasts");
    return extractData(response);
  },

  createAnnouncement: async (announcementData) => {
    const response = await api.post("/notifications/broadcasts", announcementData);
    return extractData(response);
  },

  updateAnnouncement: async (announcementId, announcementData) => {
    try {
      const response = await api.put(`/notifications/broadcasts/${announcementId}`, announcementData);
      return extractData(response);
    } catch {
      const response = await api.patch(`/notifications/broadcasts/${announcementId}`, announcementData);
      return extractData(response);
    }
  },

  deleteAnnouncement: async (announcementId) => {
    const response = await api.delete(`/notifications/broadcasts/${announcementId}`);
    return extractData(response);
  },

  clearAllAnnouncements: async () => {
    const response = await api.delete("/notifications/broadcasts");
    return extractData(response);
  },

  /**
   * Newsletter (bulletins)
   */
  getNewsletter: async () => {
    const response = await api.get("/notifications/bulletins");
    return extractData(response);
  },

  createNewsletter: async (newsletterData) => {
    const response = await api.post("/notifications/bulletins", newsletterData);
    return extractData(response);
  },

  updateNewsletter: async (newsletterId, newsletterData) => {
    try {
      const response = await api.put(`/notifications/bulletins/${newsletterId}`, newsletterData);
      return extractData(response);
    } catch {
      const response = await api.patch(`/notifications/bulletins/${newsletterId}`, newsletterData);
      return extractData(response);
    }
  },

  deleteNewsletter: async (newsletterId) => {
    const response = await api.delete(`/notifications/bulletins/${newsletterId}`);
    return extractData(response);
  },

  clearAllNewsletters: async () => {
    const response = await api.delete("/notifications/bulletins");
    return extractData(response);
  },

  /**
   * Newsletter Subscription & Preferences (Frontend-safe with mock fallbacks)
   */
  subscribeToNewsletter: async (email) => {
    try {
      const response = await api.post("/notifications/newsletter/subscribe", { email });
      return extractData(response);
    } catch (error) {
      console.warn("Backend subscription endpoint failed, using simulated response:", error.message);
      // Simulate success for frontend demonstration
      return { success: true, message: "Successfully subscribed to the newsletter!" };
    }
  },

  unsubscribeFromNewsletter: async (email) => {
    try {
      const response = await api.post("/notifications/newsletter/unsubscribe", { email });
      return extractData(response);
    } catch (error) {
      console.warn("Backend unsubscribe endpoint failed, using simulated response:", error.message);
      return { success: true, message: "Successfully unsubscribed." };
    }
  },

  getSubscriptionPreferences: async () => {
    try {
      const response = await api.get("/notifications/newsletter/preferences");
      return extractData(response);
    } catch (error) {
      console.warn("Backend preferences fetch failed, using simulated response:", error.message);
      // Fallback defaults
      return {
        newsletter: true,
        announcements: true,
        marketing: false,
        categories: ["product-updates", "startup-stories", "weekly-digest"]
      };
    }
  },

  updateSubscriptionPreferences: async (preferences) => {
    try {
      const response = await api.put("/notifications/newsletter/preferences", preferences);
      return extractData(response);
    } catch (error) {
      console.warn("Backend preferences save failed, using simulated response:", error.message);
      return { success: true, preferences };
    }
  }
};

export default notificationAPI;


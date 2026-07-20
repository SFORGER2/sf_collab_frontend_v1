/**
 * Notification Service - Enhanced Version
 * Supports category filtering and enhanced notification model
 */

import axios from 'axios';
import { getApiUrl } from '../utils/config';
import { requestErrorInterceptor, requestInterceptor, responseErrorInterceptor, responseInterceptor } from '@/utils/APIs/interceptors';

const API_BASE_URL = getApiUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

// Handle response errors
api.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);

/**
 * Notification categories (from SF Collab Documentation 4.1-4.12)
 */
export const NOTIFICATION_CATEGORIES = {
  ACCOUNT: 'account',      // 4.1 Account & System
  SOCIAL: 'social',        // 4.2 Social & Engagement
  IDEA: 'idea',            // 4.3 Ideas & Innovation
  STARTUP: 'startup',      // 4.4 Startup & Projects
  TASK: 'task',            // 4.5 Tasks & Productivity
  MESSAGE: 'message',      // 4.6 Messaging
  FILE: 'file',            // 4.7 Files & Documents
  REWARD: 'reward',        // 4.7 Rewards & Payments
  GOVERNANCE: 'governance', // 4.8 Governance & Moderation
  FUNDING: 'funding',      // 4.9 Funding & Investment
  AI: 'ai',                // 4.10 AI & Automation
  EVENT: 'event',          // 4.12 Events & Reminders
  FRIEND: 'friend',        // 4.11 Friends & Connections
  APPLICATION: 'application', // 4.13 Applications
};

/**
 * Notification priorities
 */
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Notification Service
 */
export const notificationService = {
  /**
   * Get notifications with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.per_page - Items per page
   * @param {string} params.type - Filter by type (success, info, warning, error)
   * @param {string} params.category - Filter by category (account, social, task, etc.)
   * @param {string} params.priority - Filter by priority (low, medium, high, critical)
   * @param {boolean} params.is_read - Filter by read status
   * @returns {Promise} Notifications data
   */
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get('/notifications', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get notifications by category
   * @param {string} category - Category to filter by
   * @param {Object} additionalParams - Additional query parameters
   * @returns {Promise} Notifications data
   */
  getByCategory: async (category, additionalParams = {}) => {
    try {
      const response = await api.get('/notifications', {
        params: { category, ...additionalParams }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching notifications by category:', error);
      throw error;
    }
  },

  /**
   * Get high priority notifications
   * @returns {Promise} High/critical priority notifications
   */
  getHighPriority: async () => {
    try {
      const response = await api.get('/notifications', {
        params: { priority: 'high,critical', is_read: false }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching high priority notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise<number>} Unread count
   */
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.data.unreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  /**
   * Get notification statistics (enhanced with category breakdown)
   * @returns {Promise} Statistics data
   */
  getStats: async () => {
    try {
      const response = await api.get('/notifications/stats');
      console.log("Notification stats response:", response);
      return response.data.data.stats;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  },

  /**
   * Get single notification by ID
   * @param {number} id - Notification ID
   * @returns {Promise} Notification data
   */
  getNotification: async (id) => {
    try {
      const response = await api.get(`/notifications/${id}`);
      return response.data.data.notification;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   * @param {number} id - Notification ID
   * @returns {Promise}
   */
  markAsRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark notification as unread
   * @param {number} id - Notification ID
   * @returns {Promise}
   */
  markAsUnread: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/unread`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * @param {string} category - Optional: only mark notifications of this category
   * @returns {Promise}
   */
  markAllAsRead: async (category = null) => {
    try {
      const params = category ? { category } : {};
      const response = await api.put('/notifications/mark-all-read', {}, { params });
      return response.data;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  /**
   * Delete notification
   * @param {number} id - Notification ID
   * @returns {Promise}
   */
  deleteNotification: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  /**
   * Delete all read notifications
   * @returns {Promise}
   */
  deleteAllRead: async () => {
    try {
      const response = await api.delete('/notifications/delete-all-read');
      return response.data;
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      throw error;
    }
  },

  /**
   * Bulk mark notifications as read
   * @param {number[]} notificationIds - Array of notification IDs
   * @returns {Promise}
   */
  bulkMarkAsRead: async (notificationIds) => {
    try {
      const response = await api.post('/notifications/bulk/mark-read', {
        notificationIds,
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk marking as read:', error);
      throw error;
    }
  },

  /**
   * Bulk delete notifications
   * @param {number[]} notificationIds - Array of notification IDs
   * @returns {Promise}
   */
  bulkDelete: async (notificationIds) => {
    try {
      const response = await api.post('/notifications/bulk/delete', {
        notificationIds,
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting:', error);
      throw error;
    }
  },

  /**
   * Get notification preferences
   * @returns {Promise} Preferences data
   */
  getPreferences: async () => {
    try {
      const response = await api.get('/notifications/preferences');
      return response.data.data.preferences;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      throw error;
    }
  },

  /**
   * Update notification preferences
   * @param {Object} preferences - Updated preferences
   * @returns {Promise}
   */
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  },

  /**
   * Subscribe to real-time notifications via WebSocket
   * @param {function} onNotification - Callback for new notifications
   * @returns {function} Unsubscribe function
   */
  subscribeToRealtime: (onNotification) => {
    // This would integrate with your SocketProvider
    // Return unsubscribe function
    return () => {};
  },
};

export default notificationService;
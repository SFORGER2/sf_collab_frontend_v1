// contexts/AnnouncementContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { notificationAPI } from "@/utils/APIs/notificationAPI";

const AnnouncementContext = createContext(null);

export const useAnnouncements = () => {
  const ctx = useContext(AnnouncementContext);
  if (!ctx) throw new Error("useAnnouncements must be used within AnnouncementProvider");
  return ctx;
};

export const AnnouncementProvider = ({ children }) => {
  const { access_token } = useSelector((state) => state.auth);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const loadAnnouncements = useCallback(async (pageNum = 1) => {
    if (!access_token) return;
    setLoading(true);
    try {
      const data = await notificationAPI.getAnnouncements({ page: pageNum, per_page: 20 });
      const list = data?.announcements || [];
      if (pageNum === 1) {
        setAnnouncements(list);
      } else {
        setAnnouncements(prev => [...prev, ...list]);
      }
      setPage(pageNum);
      // Assume pagination info from response (if available)
      setHasMore(!!data?.pagination?.hasMore);
      // Calculate unread count locally
      const unread = list.filter(a => !a.is_read).length;
      setUnreadCount(prev => pageNum === 1 ? unread : prev + unread);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoading(false);
    }
  }, [access_token]);

  const refresh = useCallback(() => {
    loadAnnouncements(1);
  }, [loadAnnouncements]);

  const markAsRead = useCallback(async (announcementId) => {
    // Optimistic update
    setAnnouncements(prev =>
      prev.map(a => a.id === announcementId ? { ...a, is_read: true } : a)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await notificationAPI.markAsRead(announcementId);
    } catch (err) {
      // Revert on error
      setAnnouncements(prev =>
        prev.map(a => a.id === announcementId ? { ...a, is_read: false } : a)
      );
      setUnreadCount(prev => prev + 1);
      console.error("Failed to mark announcement as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic: zero out
    setUnreadCount(0);
    setAnnouncements(prev => prev.map(a => ({ ...a, is_read: true })));
    try {
      await notificationAPI.markAllRead('announcement');
    } catch (err) {
      // Revert by reloading from server
      console.error("Failed to mark all announcements as read:", err);
      refresh();
    }
  }, [refresh]);

  // Load on mount and when access_token changes
  useEffect(() => {
    if (access_token) {
      loadAnnouncements(1);
    }
  }, [access_token]);

  const value = useMemo(() => ({
    announcements,
    unreadCount,
    loading,
    hasMore,
    refresh,
    markAsRead,
    markAllAsRead,
  }), [announcements, unreadCount, loading, hasMore, refresh, markAsRead, markAllAsRead]);

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  );
};
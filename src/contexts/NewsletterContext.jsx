// contexts/NewsletterContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { notificationAPI } from "@/utils/APIs/notificationAPI";

const NewsletterContext = createContext(null);

export const useNewsletter = () => {
  const ctx = useContext(NewsletterContext);
  if (!ctx) throw new Error("useNewsletter must be used within NewsletterProvider");
  return ctx;
};

export const NewsletterProvider = ({ children }) => {
  const { access_token } = useSelector((state) => state.auth);
  const [newsletters, setNewsletters] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const loadNewsletters = useCallback(async (pageNum = 1) => {
    if (!access_token) return;
    setLoading(true);
    try {
      const data = await notificationAPI.getNewsletter({ page: pageNum, per_page: 20 });
      const list = data?.newsletter || data?.data?.newsletter || [];
      if (pageNum === 1) {
        setNewsletters(list);
      } else {
        setNewsletters(prev => [...prev, ...list]);
      }
      setPage(pageNum);
      setHasMore(!!data?.pagination?.hasMore);
      const unread = list.filter(n => !n.is_read).length;
      setUnreadCount(prev => pageNum === 1 ? unread : prev + unread);
    } catch (err) {
      console.error("Failed to load newsletters:", err);
    } finally {
      setLoading(false);
    }
  }, [access_token]);

  const refresh = useCallback(() => {
    loadNewsletters(1);
  }, [loadNewsletters]);

  const markAsRead = useCallback(async (newsletterId) => {
    setNewsletters(prev =>
      prev.map(n => n.id === newsletterId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await notificationAPI.markAsRead(newsletterId);
    } catch (err) {
      setNewsletters(prev =>
        prev.map(n => n.id === newsletterId ? { ...n, is_read: false } : n)
      );
      setUnreadCount(prev => prev + 1);
      console.error("Failed to mark newsletter as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setUnreadCount(0);
    setNewsletters(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await notificationAPI.markAllRead('newsletter');
    } catch (err) {
      console.error("Failed to mark all newsletters as read:", err);
      refresh();
    }
  }, [refresh]);

  useEffect(() => {
    if (access_token) {
      loadNewsletters(1);
    }
  }, [access_token]);

  const value = useMemo(() => ({
    newsletters,
    unreadCount,
    loading,
    hasMore,
    refresh,
    markAsRead,
    markAllAsRead,
  }), [newsletters, unreadCount, loading, hasMore, refresh, markAsRead, markAllAsRead]);

  return (
    <NewsletterContext.Provider value={value}>
      {children}
    </NewsletterContext.Provider>
  );
};
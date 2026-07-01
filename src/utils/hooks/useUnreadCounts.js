// src/utils/hooks/useUnreadCounts.js
// Unified hook that polls all unread counts (notifications, messages, announcements)
// and exposes them in one place for the nav/sidebar to consume.
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "@/utils/APIs/interceptors";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const POLL_MS = 30_000; // 30 seconds

export function useUnreadCounts() {
  const [notifications, setNotifications] = useState(0);
  const [messages,      setMessages]      = useState(0);
  const [friends,       setFriends]       = useState(0);
  const [total,         setTotal]         = useState(0);

  const fetchCounts = useCallback(async () => {
    try {
      const [notifRes, msgRes, friendRes] = await Promise.allSettled([
        api.get("/notifications/unread-count"),
        api.get("/chat/unread-count"),
        api.get("/friend-requests/pending-count"),
      ]);

      const n = notifRes.status === "fulfilled"
        ? (notifRes.value?.data?.data?.unread_count ?? notifRes.value?.data?.data?.unreadCount ?? 0)
        : 0;
      const m = msgRes.status === "fulfilled"
        ? (msgRes.value?.data?.data?.unread_count ?? msgRes.value?.data?.data?.unreadCount ?? 0)
        : 0;
      const f = friendRes.status === "fulfilled"
        ? (friendRes.value?.data?.data?.pending_count ?? friendRes.value?.data?.data?.pendingCount ?? 0)
        : 0;

      setNotifications(n);
      setMessages(m);
      setFriends(f);
      setTotal(n + m + f);
    } catch {}
  }, []);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  return { notifications, messages, friends, total, refresh: fetchCounts };
}

export default useUnreadCounts;
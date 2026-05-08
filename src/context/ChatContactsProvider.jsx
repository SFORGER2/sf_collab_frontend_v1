/**
 * ChatContactsProvider - Fixed Version
 * 
 * FIXES:
 * 1. Uses correct endpoint: /api/friend-requests/friends
 * 2. Only shows accepted connections (mutual friends)
 * 3. Does NOT fall back to all users
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ChatContactsContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export function ChatContactsProvider({ token, children }) {
  const [friends, setFriends] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [error, setError] = useState(null);

  const currentUserId = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null")?.id ?? null;
    } catch {
      return null;
    }
  }, []);

  const fetchFriends = useCallback(async () => {
    if (!token) return;

    setIsLoadingFriends(true);
    setError(null);

    try {
      // Your backend endpoint for getting accepted friends
      const response = await fetch(`${API_BASE_URL}/friend-requests/friends`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data?.friends) {
        // Filter out current user just in case
        const friendsList = data.data.friends.filter(
          (f) => String(f.id) !== String(currentUserId)
        );
        
        console.log(`✅ Found ${friendsList.length} connections from /api/friend-requests/friends`);
        setFriends(friendsList);
      } else {
        console.warn('No friends data in response:', data);
        setFriends([]);
      }
    } catch (e) {
      console.error("Failed to fetch friends:", e);
      setError(e.message);
      setFriends([]);
    } finally {
      setIsLoadingFriends(false);
    }
  }, [token, currentUserId]);

  // Fetch on mount and when token changes
  useEffect(() => {
    if (token) {
      fetchFriends();
    }
  }, [token, fetchFriends]);

  const value = useMemo(
    () => ({ 
      friends, 
      isLoadingFriends, 
      error,
      refetchFriends: fetchFriends 
    }),
    [friends, isLoadingFriends, error, fetchFriends]
  );

  return (
    <ChatContactsContext.Provider value={value}>
      {children}
    </ChatContactsContext.Provider>
  );
}

export function useChatContacts() {
  const ctx = useContext(ChatContactsContext);
  if (!ctx) {
    throw new Error("useChatContacts must be used within ChatContactsProvider");
  }
  return ctx;
}
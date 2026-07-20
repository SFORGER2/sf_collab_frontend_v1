import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { connectionAPI } from '@/utils/APIs/connectionAPI';

export function useConnectionNotifications() {
  const { user, access_token } = useSelector((state) => state.auth);
  
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [counts, setCounts] = useState({ connections: 0, incoming: 0, outgoing: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  
  // Track if we've shown notifications for specific requests
  const notifiedRequestsRef = useRef(new Set());

  /**
   * Fetch counts from API
   */
  const fetchCounts = useCallback(async () => {
    if (!access_token) return;
    
    try {
      const response = await connectionAPI.getCounts(access_token);
      const data = response.data || response;
      setCounts({
        connections: data.connections || 0,
        incoming: data.incoming || 0,
        outgoing: data.outgoing || 0,
      });
    } catch (err) {
      console.error('Failed to fetch connection counts:', err);
    }
  }, [access_token]);

  /**
   * Fetch incoming requests
   */
  const fetchIncomingRequests = useCallback(async () => {
    if (!access_token) return;
    
    setIsLoading(true);
    try {
      const response = await connectionAPI.getIncomingRequests(access_token, { per_page: 10 });
      const data = response.data || response;
      setIncomingRequests(data.requests || []);
      setLastFetch(Date.now());
      
      // Update incoming count
      setCounts(prev => ({
        ...prev,
        incoming: data.pagination?.total || data.requests?.length || 0,
      }));
    } catch (err) {
      console.error('Failed to fetch incoming requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [access_token]);

  /**
   * Accept a request from notifications
   */
  const acceptRequest = useCallback(async (requestId) => {
    if (!access_token) return { success: false };
    
    try {
      await connectionAPI.acceptRequest(requestId, access_token);
      
      // Remove from local list
      setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
      setCounts(prev => ({
        ...prev,
        incoming: Math.max(0, prev.incoming - 1),
        connections: prev.connections + 1,
      }));
      
      return { success: true };
    } catch (err) {
      console.error('Failed to accept request:', err);
      return { success: false, error: err.response?.data?.message };
    }
  }, [access_token]);

  /**
   * Decline a request from notifications
   */
  const declineRequest = useCallback(async (requestId) => {
    if (!access_token) return { success: false };
    
    try {
      await connectionAPI.declineRequest(requestId, access_token);
      
      // Remove from local list
      setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
      setCounts(prev => ({
        ...prev,
        incoming: Math.max(0, prev.incoming - 1),
      }));
      
      return { success: true };
    } catch (err) {
      console.error('Failed to decline request:', err);
      return { success: false, error: err.response?.data?.message };
    }
  }, [access_token]);

  /**
   * Mark a request as "notified" (to prevent duplicate toasts)
   */
  const markAsNotified = useCallback((requestId) => {
    notifiedRequestsRef.current.add(requestId);
  }, []);

  /**
   * Check if a request has been notified
   */
  const hasBeenNotified = useCallback((requestId) => {
    return notifiedRequestsRef.current.has(requestId);
  }, []);

  /**
   * Refresh all data
   */
  const refresh = useCallback(() => {
    fetchCounts();
    fetchIncomingRequests();
  }, [fetchCounts, fetchIncomingRequests]);

  // Initial fetch
  useEffect(() => {
    if (access_token && user) {
      refresh();
    }
  }, [access_token, user]);

  // Listen for real-time connection events (custom events from WebSocket)
  useEffect(() => {
    const handleNewRequest = (event) => {
      const data = event.detail;
      if (!data) return;
      
      // Add to incoming requests if not already there
      setIncomingRequests(prev => {
        const exists = prev.some(r => r.id === data.request?.id);
        if (exists) return prev;
        return [data.request, ...prev].slice(0, 10);
      });
      
      setCounts(prev => ({
        ...prev,
        incoming: prev.incoming + 1,
      }));
    };

    const handleRequestAccepted = (event) => {
      const data = event.detail;
      if (!data) return;
      
      // Someone accepted our request
      setCounts(prev => ({
        ...prev,
        outgoing: Math.max(0, prev.outgoing - 1),
        connections: prev.connections + 1,
      }));
    };

    const handleRequestDeclined = (event) => {
      const data = event.detail;
      if (!data) return;
      
      // Someone declined our request
      setCounts(prev => ({
        ...prev,
        outgoing: Math.max(0, prev.outgoing - 1),
      }));
    };

    const handleConnectionRemoved = () => {
      setCounts(prev => ({
        ...prev,
        connections: Math.max(0, prev.connections - 1),
      }));
    };

    // Listen for custom events dispatched from WebSocket handler
    window.addEventListener('connection:new_request', handleNewRequest);
    window.addEventListener('connection:request_accepted', handleRequestAccepted);
    window.addEventListener('connection:request_declined', handleRequestDeclined);
    window.addEventListener('connection:removed', handleConnectionRemoved);

    return () => {
      window.removeEventListener('connection:new_request', handleNewRequest);
      window.removeEventListener('connection:request_accepted', handleRequestAccepted);
      window.removeEventListener('connection:request_declined', handleRequestDeclined);
      window.removeEventListener('connection:removed', handleConnectionRemoved);
    };
  }, []);

  // Poll for updates every 60 seconds (fallback for WebSocket)
  useEffect(() => {
    if (!access_token) return;
    
    const interval = setInterval(() => {
      fetchCounts();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [access_token, fetchCounts]);

  return {
    incomingRequests,
    counts,
    incomingCount: counts.incoming,
    isLoading,
    lastFetch,
    actions: {
      acceptRequest,
      declineRequest,
      refresh,
      fetchIncomingRequests,
      fetchCounts,
      markAsNotified,
      hasBeenNotified,
    },
  };
}

export default useConnectionNotifications;

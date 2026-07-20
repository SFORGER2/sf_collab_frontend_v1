

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { connectionAPI } from '@/utils/APIs/connectionAPI';

export const ConnectionStatus = {
  NONE: 'none',
  REQUEST_SENT: 'request_sent',
  REQUEST_RECEIVED: 'request_received',
  CONNECTED: 'connected',
  SELF: 'self',
  LOADING: 'loading',
};

const resolveRequestId = (fr) =>
  fr?.id ?? fr?.request_id ?? fr?.friend_request_id ?? fr?.friendRequestId ?? null;

const extractErrorMessage = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.response?.data?.msg ||
  err?.response?.data?.detail ||
  err?.message ||
  fallback;


export function useConnectionStatus(targetUserId) {
  const { user: currentUser, access_token } = useSelector((state) => state.auth);
  
  const [status, setStatus] = useState(ConnectionStatus.LOADING);
  const [requestId, setRequestId] = useState(null);
  const [friendRequest, setFriendRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current status
  const fetchStatus = useCallback(async () => {
    if (!targetUserId || !currentUser?.id) {
      setStatus(ConnectionStatus.LOADING);
      return;
    }
    
    // Self check
    if (Number(targetUserId) === Number(currentUser.id)) {
      setStatus(ConnectionStatus.SELF);
      return;
    }
    
    if (!access_token) {
      setStatus(ConnectionStatus.NONE);
      return;
    }

    try {
      setError(null);
      const response = await connectionAPI.getStatus(targetUserId, access_token);
      const data = response.data || response;
      
      console.log('Status response:', data); // Debug
      
      const backendStatus = data.status;
      const fr = data.request;
      setRequestId(fr.id);
      setFriendRequest(fr);

      
      //setFriendRequest(fr);
      //setRequestId(resolveRequestId(fr));

      if (backendStatus === 'accepted' || backendStatus === 'friends') {
        setStatus(ConnectionStatus.CONNECTED);
      } else if (backendStatus === 'pending' && fr) {
        // Check if we sent it or received it
        if (Number(fr.sender_id) === Number(currentUser.id)) {
          setStatus(ConnectionStatus.REQUEST_SENT);
        } else {
          setStatus(ConnectionStatus.REQUEST_RECEIVED);
        }
      } else {
        setStatus(ConnectionStatus.NONE);
      }
    } catch (err) {
      console.error('Failed to fetch connection status:', err);
      setError('Failed to load status');
      setStatus(ConnectionStatus.NONE);
    }
  }, [targetUserId, currentUser?.id, access_token]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // SEND REQUEST
  const sendRequest = useCallback(async () => {
    if (!access_token || !targetUserId) return { success: false, error: 'Not authenticated' };
    
    setIsLoading(true);
    try {
      const response = await connectionAPI.sendRequest(targetUserId, access_token);
      const data = response.data || response;
      
      setStatus(ConnectionStatus.REQUEST_SENT);
      const fr = data.friend_request || data.request || data.friendRequest;
      setRequestId(resolveRequestId(fr));
      setFriendRequest(fr);

      
      return { success: true, data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send request';
      setError(errorMsg);
      await fetchStatus();
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [access_token, targetUserId, fetchStatus]);

  // ACCEPT REQUEST
  const acceptRequest = useCallback(
  async (overrideRequestId) => {
    const idToUse = overrideRequestId ?? requestId;

    if (!idToUse) {
      return { success: false, error: "Missing request ID" };
    }

    try {
      await connectionAPI.acceptRequest(idToUse, access_token);
      setStatus(ConnectionStatus.CONNECTED);
      setRequestId(null);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to accept request",
      };
    }
  },
  [access_token, requestId]
);



  // DECLINE REQUEST
  const declineRequest = useCallback(
  async (overrideRequestId) => {
    const idToUse = overrideRequestId ?? requestId;

    if (!idToUse) {
      return { success: false, error: "Missing request ID" };
    }

    try {
      await connectionAPI.declineRequest(idToUse, access_token);
      setStatus(ConnectionStatus.NONE);
      setRequestId(null);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to decline request",
      };
    }
  },
  [access_token, requestId]
);

  // CANCEL REQUEST
  const cancelRequest = useCallback(async () => {
    if (!access_token || !requestId) {
      return { success: false, error: 'Missing request ID' };
    }
    
    setIsLoading(true);
    try {
      await connectionAPI.cancelRequest(requestId, access_token);
      setStatus(ConnectionStatus.NONE);
      setRequestId(null);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to cancel';
      await fetchStatus();
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [access_token, requestId, fetchStatus]);

  // REMOVE CONNECTION
  const removeConnection = useCallback(
  async (otherUserId) => {
    if (!access_token || !otherUserId) {
      return { success: false, error: "Missing user ID" };
    }

    setIsLoading(true);
    try {
      await connectionAPI.removeConnection(otherUserId, access_token);
      setStatus(ConnectionStatus.NONE);
      setRequestId(null);
      return { success: true };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to remove connection";
      await fetchStatus();
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  },
  [access_token, fetchStatus]
);


  return {
    status,
    requestId,
    friendRequest,
    isLoading,
    error,
    actions: {
      sendRequest,
      acceptRequest,
      declineRequest,
      cancelRequest,
      removeConnection,
      refresh: fetchStatus,
    },
  };
}

export default useConnectionStatus;
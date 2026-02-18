

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

export function useConnectionStatus(targetUserId) {
  const { user: currentUser, access_token } = useSelector((state) => state.auth);
  
  const [status, setStatus] = useState(ConnectionStatus.LOADING);
  const [requestId, setRequestId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  /**
   * Fetch current status from backend
   */
  const fetchStatus = useCallback(async () => {
    if (!targetUserId || !currentUser?.id) {
      setStatus(ConnectionStatus.LOADING);
      return;
    }
    
    if (Number(targetUserId) === Number(currentUser.id)) {
      setStatus(ConnectionStatus.SELF);
      setRequestId(null);
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
      
      // Map backend status to frontend status
      const backendStatus = data.status;
      if (backendStatus === 'connected') {
        setStatus(ConnectionStatus.CONNECTED);
      } else if (backendStatus === 'request_sent') {
        setStatus(ConnectionStatus.REQUEST_SENT);
      } else if (backendStatus === 'request_received') {
        setStatus(ConnectionStatus.REQUEST_RECEIVED);
      } else {
        setStatus(ConnectionStatus.NONE);
      }
      
      setRequestId(data.request_id || null);
    } catch (err) {
      console.error('Failed to fetch connection status:', err);
      setError('Failed to load status');
      setStatus(ConnectionStatus.NONE);
    }
  }, [targetUserId, currentUser?.id, access_token]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  /**
   * SEND REQUEST
   */
  const sendRequest = useCallback(async () => {
    if (!access_token || !targetUserId) return { success: false, error: 'Not authenticated' };
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await connectionAPI.sendRequest(targetUserId, access_token);
      const data = response.data || response;
      
      setStatus(ConnectionStatus.REQUEST_SENT);
      setRequestId(data.request?.id || null);
      
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

  /**
   * ACCEPT REQUEST
   */
  const acceptRequest = useCallback(async () => {
    if (!access_token || !requestId) {
      console.error('Cannot accept: missing token or requestId', { access_token: !!access_token, requestId });
      return { success: false, error: 'Missing request ID' };
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await connectionAPI.acceptRequest(requestId, access_token);
      
      setStatus(ConnectionStatus.CONNECTED);
      
      return { success: true, data: response.data || response };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to accept request';
      console.error('Accept request error:', err);
      setError(errorMsg);
      await fetchStatus();
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [access_token, requestId, fetchStatus]);

  /**
   * DECLINE REQUEST
   */
  const declineRequest = useCallback(async () => {
    if (!access_token || !requestId) {
      console.error('Cannot decline: missing token or requestId', { access_token: !!access_token, requestId });
      return { success: false, error: 'Missing request ID' };
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await connectionAPI.declineRequest(requestId, access_token);
      
      setStatus(ConnectionStatus.NONE);
      setRequestId(null);
      
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to decline request';
      console.error('Decline request error:', err);
      setError(errorMsg);
      await fetchStatus();
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [access_token, requestId, fetchStatus]);

  /**
   * CANCEL REQUEST (sender only)
   */
  const cancelRequest = useCallback(async () => {
    if (!access_token || !requestId) {
      console.error('Cannot cancel: missing token or requestId', { access_token: !!access_token, requestId });
      return { success: false, error: 'Missing request ID' };
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await connectionAPI.cancelRequest(requestId, access_token);
      
      setStatus(ConnectionStatus.NONE);
      setRequestId(null);
      
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to cancel request';
      console.error('Cancel request error:', err);
      setError(errorMsg);
      await fetchStatus();
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [access_token, requestId, fetchStatus]);

  /**
   * REMOVE CONNECTION
   */
  const removeConnection = useCallback(async () => {
    if (!access_token || !targetUserId) {
      return { success: false, error: 'Not authenticated' };
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await connectionAPI.removeConnection(targetUserId, access_token);
      
      setStatus(ConnectionStatus.NONE);
      setRequestId(null);
      
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to remove connection';
      console.error('Remove connection error:', err);
      setError(errorMsg);
      await fetchStatus();
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [access_token, targetUserId, fetchStatus]);

  return {
    status,
    requestId,
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

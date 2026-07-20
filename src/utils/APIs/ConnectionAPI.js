import axios from 'axios';
import { API_CONFIG, requestErrorInterceptor, requestInterceptor, responseErrorInterceptor, responseInterceptor } from './interceptors';

const api = axios.create(API_CONFIG);

api.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

api.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);


/**
 * Connection API Functions
 */
export const connectionAPI = {
  
  // ===========================================================================
  // SEND CONNECTION REQUEST
  // ===========================================================================
  
  /**
   * Send a connection request to another user.
   * @param {number} receiverId - ID of the user to connect with
   * @param {string} accessToken - JWT token
   * @returns {Promise} - The created request
   */
  sendRequest: async (receiverId, accessToken) => {
    const response = await api.post('/connections/request', 
      { receiver_id: receiverId },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  },

  // ===========================================================================
  // ACCEPT CONNECTION REQUEST
  // ===========================================================================
  
  /**
   * Accept an incoming connection request.
   * @param {number} requestId - ID of the connection request
   * @param {string} accessToken - JWT token
   * @returns {Promise} - The accepted connection
   */
  acceptRequest: async (requestId, accessToken) => {
    const response = await api.post(`/connections/request/${requestId}/accept`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  },

  // ===========================================================================
  // DECLINE CONNECTION REQUEST
  // ===========================================================================
  
  /**
   * Decline an incoming connection request.
   * Request is removed, sender can re-request later.
   * @param {number} requestId - ID of the connection request
   * @param {string} accessToken - JWT token
   * @returns {Promise}
   */
  declineRequest: async (requestId, accessToken) => {
    const response = await api.post(`/connections/request/${requestId}/decline`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  },

  // ===========================================================================
  // CANCEL SENT REQUEST
  // ===========================================================================
  
  /**
   * Cancel a connection request you sent.
   * @param {number} requestId - ID of the connection request
   * @param {string} accessToken - JWT token
   * @returns {Promise}
   */
  cancelRequest: async (requestId, accessToken) => {
    const response = await api.post(`/connections/request/${requestId}/cancel`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  },

  // ===========================================================================
  // REMOVE CONNECTION
  // ===========================================================================
  
  /**
   * Remove a connection with another user.
   * Deletes the relationship for both users.
   * @param {number} userId - ID of the connected user
   * @param {string} accessToken - JWT token
   * @returns {Promise}
   */
  removeConnection: async (userId, accessToken) => {
    const response = await api.delete(`/connections/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  },

  // ===========================================================================
  // GET ALL CONNECTIONS
  // ===========================================================================
  
  /**
   * Get all accepted connections for current user.
   * @param {string} accessToken - JWT token
   * @param {object} params - Query params (page, per_page, search)
   * @returns {Promise} - List of connections with pagination
   */
  getConnections: async (accessToken, params = {}) => {
    const response = await api.get('/connections', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        page: params.page || 1,
        per_page: params.per_page || 20,
        search: params.search || '',
      }
    });
    return response.data;
  },

  // ===========================================================================
  // GET INCOMING REQUESTS
  // ===========================================================================
  
  /**
   * Get pending connection requests sent TO current user.
   * @param {string} accessToken - JWT token
   * @param {object} params - Query params (page, per_page)
   * @returns {Promise} - List of incoming requests
   */
  getIncomingRequests: async (accessToken, params = {}) => {
    const response = await api.get('/connections/requests/incoming', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        page: params.page || 1,
        per_page: params.per_page || 20,
      }
    });
    return response.data;
  },

  // ===========================================================================
  // GET OUTGOING REQUESTS
  // ===========================================================================
  
  /**
   * Get pending connection requests sent BY current user.
   * @param {string} accessToken - JWT token
   * @param {object} params - Query params (page, per_page)
   * @returns {Promise} - List of outgoing requests
   */
  getOutgoingRequests: async (accessToken, params = {}) => {
    const response = await api.get('/connections/requests/outgoing', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        page: params.page || 1,
        per_page: params.per_page || 20,
      }
    });
    return response.data;
  },

  // ===========================================================================
  // GET CONNECTION STATUS
  // ===========================================================================
  
  /**
   * Get connection status between current user and another user.
   * Used to determine button state.
   * 
   * Returns status:
   *   - 'none' → Show "Connect" button
   *   - 'request_sent' → Show "Request Sent" (disabled)
   *   - 'request_received' → Show "Accept" / "Decline"
   *   - 'connected' → Show "Connected" / "Remove Connection"
   * 
   * @param {number} userId - ID of the other user
   * @param {string} accessToken - JWT token
   * @returns {Promise} - { status, request_id }
   */
  getStatus: async (userId, accessToken) => {
    const response = await api.get(`/connections/status/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  },

  // ===========================================================================
  // GET COUNTS (for badges)
  // ===========================================================================
  
  /**
   * Get counts for notification badges.
   * @param {string} accessToken - JWT token
   * @returns {Promise} - { connections, incoming, outgoing }
   */
  getCounts: async (accessToken) => {
    const response = await api.get('/connections/counts', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  },
};

export default connectionAPI;

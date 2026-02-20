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

// ============================================================================
// PERMISSIONS API
// ============================================================================

export const permissionsAPI = {
  // Get all permissions
  getAll: async (params = {}) => {
    const response = await api.get('/permissions', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 50,
        ...params,
      },
    });
    return response.data;
  },

  // Get single permission by ID
  getById: async (permissionId) => {
    const response = await api.get(`/permissions/${permissionId}`);
    return response.data;
  },

  // Create new permission
  create: async (permissionData) => {
    const response = await api.post('/permissions', permissionData);
    return response.data;
  },

  // Update permission
  update: async (permissionId, permissionData) => {
    const response = await api.put(`/permissions/${permissionId}`, permissionData);
    return response.data;
  },

  // Delete permission
  delete: async (permissionId) => {
    const response = await api.delete(`/permissions/${permissionId}`);
    return response.data;
  },
};

// ============================================================================
// USER PERMISSIONS API
// ============================================================================

export const userPermissionsAPI = {
  // Get all user permissions with filters
  getAll: async (params = {}) => {
    const response = await api.get('/user-permissions', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 50,
        user_id: params.userId,
        permission_id: params.permissionId,
        ...params,
      },
    });
    return response.data;
  },

  // Get single user permission by ID
  getById: async (userPermissionId) => {
    const response = await api.get(`/user-permissions/${userPermissionId}`);
    return response.data;
  },

  // Grant permission to user
  create: async (userPermissionData) => {
    const response = await api.post('/user-permissions', userPermissionData);
    return response.data;
  },

  // Update user permission
  update: async (userPermissionId, userPermissionData) => {
    const response = await api.put(`/user-permissions/${userPermissionId}`, userPermissionData);
    return response.data;
  },

  // Revoke permission from user
  delete: async (userPermissionId) => {
    const response = await api.delete(`/user-permissions/${userPermissionId}`);
    return response.data;
  },
};

// ============================================================================
// ACCESS REQUESTS API
// ============================================================================

export const accessRequestsAPI = {
  // Get all access requests with filters
  getAll: async (params = {}) => {
    const response = await api.get('/access-requests', {
      params: {
        status: params.status || 'pending',
        page: params.page || 1,
        per_page: params.per_page || 50,
        ...params,
      },
    });
    return response.data;
  },

  // Get single access request by ID
  getById: async (requestId) => {
    const response = await api.get(`/access-requests/${requestId}`);
    return response.data;
  },

  // Create new access request
  create: async (requestData) => {
    const response = await api.post('/access-requests', requestData);
    return response.data;
  },

  // Approve access request
  approve: async (requestId) => {
    const response = await api.post(`/access-requests/${requestId}/approve`, {});
    return response.data;
  },

  // Reject access request
  reject: async (requestId, rejectionReason = '') => {
    const response = await api.post(`/access-requests/${requestId}/reject`, {
      rejection_reason: rejectionReason,
    });
    return response.data;
  },

  // Cancel own access request
  cancel: async (requestId) => {
    const response = await api.post(`/access-requests/${requestId}/cancel`, {});
    return response.data;
  },
};

export default api;
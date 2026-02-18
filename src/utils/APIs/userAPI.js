import { API_BASE_URL } from '@/utils/config'
import axios from 'axios'
import { userSocialAPI } from './socialAPI'

import { requestErrorInterceptor, requestInterceptor, responseErrorInterceptor, responseInterceptor } from './interceptors';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

api.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);
// Users API
export const usersAPI = {
  // Now these functions will automatically use the token from the interceptor!
  getAll: async (params = {}, accessToken = '') => {
    const response = await api.get("/users", {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        ...params
      },
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {}
    });
    return response.data;
  },

  getById: async (userId, params = {}) => {
    const response = await api.get(`/users/${userId}`, {
      params: {
        include_stats: params.include_stats || false,
        ...params
      }
    });
    return response.data;
  },

  updateProfile: async (userId, profileData, accessToken, dType = 'multipart/form-data') => {
    const response = await api.put(`/users/${userId}`, profileData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': dType,
      },
    });
    return response.data;
  },
  
  getActivity: async (userId) => {
    const response = await api.get(`/users/${userId}/activity`);
    return response.data.data;
  },
  getCurrentPlan : async () => {
    const response = await api.get('/users/my-current-plan');
    console.log("CURRENT PLAN:", response);
    return response.data;
  },
  getMyRoles: async () => {
    const response = await api.get('/user-roles/my-roles');
    return response.data;
  },

  submitContactForm: async (contactForm) => {
    const response = await api.post('/users/contact', contactForm, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAllRoles: async () => {
    const response = await api.get('/users/roles');
    return response.data.data;
  },

  addRole: async (userId, roles, accessToken) => {
    const response = await api.put(`/user-roles/${userId}`, { roles }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data;
  },

  getFollowersCount: async (userId, accessToken) => {
    try {
      const response = await userSocialAPI.getFollowers(userId);
      return { data: { followersCount: response.pagination?.totalCount || 0 } };
    } catch (error) {
      console.error('Error fetching followers:', error);
      return { data: { followersCount: 0 } };
    }
  },

  getFollowingCount: async (userId, accessToken) => {
    try {
      const response = await userSocialAPI.getFollowing(userId);
      return { data: { followingCount: response.pagination?.totalCount || 0 } };
    } catch (error) {
      console.error('Error fetching following:', error);
      return { data: { followingCount: 0 } };
    }
  },
  updateActivity: async (userId, accessToken) => {
    const response = await api.post(`/users/${userId}/activity`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  addXP: async (userId, points, accessToken) => {
    const response = await api.post(`/users/${userId}/xp`, { points }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  verifyEmail: async (userId, accessToken) => {
    const response = await api.post(`/users/${userId}/verify-email`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  updateStatus: async (userId, status, accessToken) => {
    const response = await api.put(`/users/${userId}/status`, { status }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  create: async (userData, accessToken) => {
    const response = await api.post('/users', userData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  delete: async (userId, accessToken) => {
    const response = await api.delete(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  completeProfile: async (profileData, accessToken) => {
    const response = await api.post('/users/complete-profile', profileData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },
};

export default api;
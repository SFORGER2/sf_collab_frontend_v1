/**
 * userAPI.js — fixed
 *
 * ROOT CAUSE of followers/following always showing 0:
 *
 * The backend returns (via success_response):
 *   { success: true, data: { followers: [...], pagination: { total: N } } }
 *
 * The axios interceptor returns response.data, so userSocialAPI.getFollowers()
 * gives callers: { success, data: { followers, pagination } }
 *
 * The old getFollowersCount read:
 *   response.pagination?.totalCount   ← DOUBLE WRONG:
 *     1. `pagination` is nested inside `response.data`, not `response`
 *     2. The field is called `total`, not `totalCount`
 *
 * Fix: read response.data.pagination.total
 *
 * Better fix used here: the UserSocial model's to_dict() already includes
 * followersCount and followingCount as integers — so we call getSocialProfile
 * once instead of two separate paginated requests just to count them.
 */
import axios from 'axios';
import { API_CONFIG, requestInterceptor, requestErrorInterceptor, responseInterceptor, responseErrorInterceptor } from './interceptors';
import { userSocialAPI } from './socialAPI';

const api = axios.create(API_CONFIG);
api.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export const usersAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  getMyRoles: async () => {
    // FIX: route lives in user_roles_bp registered at /api/user-roles,
    // not /api/users. Was returning 405 Method Not Allowed.
    const response = await api.get('/user-roles/my-roles');
    return response.data;
  },

  updateProfile: async (userId, profileData, accessToken, dType = 'multipart/form-data') => {
    const headers = {
      'Content-Type': dType,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
    const response = await api.put(`/users/${userId}`, profileData, { headers });
    return response.data;
  },

  /**
   * FIX: was reading response.pagination?.totalCount — wrong path, wrong key.
   * Backend shape: { success, data: { followers, pagination: { total } } }
   * After axios unwrap: response = { success, data: { ... } }
   * So pagination lives at response.data.pagination.total
   *
   * Better approach: read from UserSocial.to_dict() via getSocialProfile,
   * which gives followersCount directly without a paginated query.
   */
  getFollowersCount: async (userId) => {
    try {
      const response = await userSocialAPI.getSocialProfile(userId);
      // response = { success, data: { social: { followersCount, followingCount, ... } } }
      const social = response?.data?.social ?? response?.social;
      return { data: { followersCount: social?.followersCount ?? 0 } };
    } catch (error) {
      // Fallback: paginated followers endpoint
      try {
        const res = await userSocialAPI.getFollowers(userId, { per_page: 1 });
        // res = { success, data: { followers, pagination: { total } } }
        const total = res?.data?.pagination?.total ?? res?.pagination?.total ?? 0;
        return { data: { followersCount: total } };
      } catch {
        return { data: { followersCount: 0 } };
      }
    }
  },

  getFollowingCount: async (userId) => {
    try {
      const response = await userSocialAPI.getSocialProfile(userId);
      const social = response?.data?.social ?? response?.social;
      return { data: { followingCount: social?.followingCount ?? 0 } };
    } catch (error) {
      try {
        const res = await userSocialAPI.getFollowing(userId, { per_page: 1 });
        const total = res?.data?.pagination?.total ?? res?.pagination?.total ?? 0;
        return { data: { followingCount: total } };
      } catch {
        return { data: { followingCount: 0 } };
      }
    }
  },

  /**
   * Get both counts in one request (preferred — avoids two round trips).
   * Returns { followersCount, followingCount }
   */
  getFollowCounts: async (userId) => {
    try {
      const response = await userSocialAPI.getSocialProfile(userId);
      const social = response?.data?.social ?? response?.social;
      return {
        followersCount: social?.followersCount ?? 0,
        followingCount: social?.followingCount ?? 0,
      };
    } catch {
      return { followersCount: 0, followingCount: 0 };
    }
  },

  updateActivity: async (userId, accessToken) => {
    const response = await api.post(`/users/${userId}/activity`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  updateStatus: async (userId, status, accessToken) => {
    const response = await api.put(`/users/${userId}/status`, { status }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  completeProfile: async (profileData, accessToken) => {
    const response = await api.post('/users/complete-profile', profileData, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  getCurrentPlan: async () => {
    const response = await api.get('/users/my-current-plan');
    return response.data;
  },

  getTopUsers: async () => {
    const response = await api.get('/users/top');
    return response.data;
  },
};

export default api;
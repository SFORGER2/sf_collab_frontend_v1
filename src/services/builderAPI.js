/**
 * Builder API Service
 * Handles all API calls related to builder functionality
 */

import { API_BASE_URL } from '@/utils/config';
import axios from 'axios';
import { requestErrorInterceptor, requestInterceptor, responseErrorInterceptor, responseInterceptor } from '../utils/APIs/interceptors';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

api.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);

/**
 * Builder Profile APIs
 */
export const builderProfileAPI = {
  getProfile: async (accessToken) => {
    const response = await api.get('/users/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  updateProfile: async (profileData, accessToken) => {
    const response = await api.put('/users/profile', profileData, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  addSkill: async (skillData, accessToken) => {
    const response = await api.post('/skills', skillData, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  removeSkill: async (skillId, accessToken) => {
    const response = await api.delete(`/skills/${skillId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  getPortfolio: async (accessToken) => {
    const response = await api.get('/portfolio', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  addPortfolioItem: async (itemData, accessToken) => {
    const response = await api.post('/portfolio', itemData, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  removePortfolioItem: async (itemId, accessToken) => {
    const response = await api.delete(`/portfolio/${itemId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },
};

/**
 * Applications APIs
 */
export const builderApplicationsAPI = {
  getApplications: async (accessToken, filters = {}) => {
    const response = await api.get('/applications', {
      params: filters,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  getApplication: async (applicationId, accessToken) => {
    const response = await api.get(`/applications/${applicationId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  applyToStartup: async (startupId, applicationData, accessToken) => {
    const response = await api.post('/applications', { startup_id: startupId, ...applicationData }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  withdrawApplication: async (applicationId, accessToken) => {
    const response = await api.delete(`/applications/${applicationId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  updateApplicationStatus: async (applicationId, status, accessToken) => {
    const response = await api.patch(`/applications/${applicationId}/status`, { status }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },
};

/**
 * Saved Startups APIs
 */
export const builderSavedStartupsAPI = {
  getSavedStartups: async (accessToken, filters = {}) => {
    const response = await api.get('/saved-startups', {
      params: filters,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  saveStartup: async (startupId, accessToken) => {
    const response = await api.post('/saved-startups', { startup_id: startupId }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  unsaveStartup: async (startupId, accessToken) => {
    const response = await api.delete(`/saved-startups/${startupId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  isStartupSaved: async (startupId, accessToken) => {
    const response = await api.get(`/saved-startups/${startupId}/check`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },
};

/**
 * Tasks APIs
 */
export const builderTasksAPI = {
  getActiveTasks: async (accessToken, filters = {}) => {
    const response = await api.get('/tasks', {
      params: filters,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("Active tasks:", response.data);
    return response.data;
  },

  getTaskDetails: async (taskId, accessToken) => {
    const response = await api.get(`/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  updateTaskProgress: async (taskId, progress, accessToken) => {
    const response = await api.patch(`/tasks/${taskId}/progress`, { progress }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  submitDeliverable: async (taskId, deliverableData, accessToken) => {
    const response = await api.post(`/tasks/${taskId}/deliverables`, deliverableData, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },
};

/**
 * Rewards APIs
 */
export const builderRewardsAPI = {
  getRewardsSummary: async (accessToken) => {
    const response = await api.get('/rewards', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  getEarningsHistory: async (accessToken, filters = {}) => {
    const response = await api.get('/earnings', {
      params: filters,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  getEquityHoldings: async (accessToken) => {
    const response = await api.get('/equity', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  requestPayout: async (amount, method, accessToken) => {
    const response = await api.post('/payouts', { amount, method }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  getPaymentMethods: async (accessToken) => {
    const response = await api.get('/payment-methods', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  addPaymentMethod: async (methodData, accessToken) => {
    const response = await api.post('/payment-methods', methodData, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },
};

/**
 * Discovery APIs
 */
export const builderDiscoveryAPI = {
  getRecommendedStartups: async (accessToken, limit = 10) => {
    const response = await api.get('/recommended-startups', {
      params: { limit },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },

  searchStartups: async (query, filters = {}, accessToken) => {
    const response = await api.get('/startups/search', {
      params: { q: query, ...filters },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  },
};

export default api;

/**
 * Mentorship API Service — SF Collab
 * All mentorship endpoints
 *
 * Payment method: Balance (paid sessions only)
 * Free mentorship: no payment required
 */

import axios from 'axios';
import { API_BASE_URL } from '@/utils/config';
import { requestErrorInterceptor, requestInterceptor, responseErrorInterceptor, responseInterceptor } from './interceptors';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

api.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);

const handleError = (error, defaultMsg) => {
  if (error.response) {
    const data = error.response.data;
    return { success: false, error: data?.error || data?.message || defaultMsg };
  }
  return { success: false, error: defaultMsg };
};

// ── MENTOR DISCOVERY ──────────────────────────────────────────────────────────
export const mentorDiscoveryAPI = {
  getMentors: async (params = {}) => {
    try {
      const res = await api.get('/mentorship/mentors', { params });
      return res.data;
    } catch (e) { return handleError(e, 'Failed to load mentors'); }
  },

  getMentor: async (mentorId) => {
    try {
      const res = await api.get(`/mentorship/mentors/${mentorId}`);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to load mentor'); }
  },
};

// ── MENTOR REGISTRATION & PROFILE ─────────────────────────────────────────────
export const mentorProfileAPI = {
  register: async (data) => {
    try {
      const res = await api.post('/mentorship/register', data);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to register as mentor'); }
  },

  getMyProfile: async () => {
    try {
      const res = await api.get('/mentorship/my-profile');
      return res.data;
    } catch (e) { return handleError(e, 'Failed to load mentor profile'); }
  },

  updateMyProfile: async (data) => {
    try {
      const res = await api.put('/mentorship/my-profile', data);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to update profile'); }
  },

  getMyRequests: async (params = {}) => {
    try {
      const res = await api.get('/mentorship/my-requests', { params });
      return res.data;
    } catch (e) { return handleError(e, 'Failed to load requests'); }
  },

  acceptRequest: async (reqId) => {
    try {
      const res = await api.post(`/mentorship/requests/${reqId}/accept`);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to accept request'); }
  },

  declineRequest: async (reqId, reason = '') => {
    try {
      const res = await api.post(`/mentorship/requests/${reqId}/decline`, { reason });
      return res.data;
    } catch (e) { return handleError(e, 'Failed to decline request'); }
  },

  completeSession: async (reqId, data) => {
    try {
      const res = await api.post(`/mentorship/requests/${reqId}/complete`, data);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to complete session'); }
  },

  getMyEarnings: async () => {
    try {
      const res = await api.get('/mentorship/my-earnings');
      return res.data;
    } catch (e) { return handleError(e, 'Failed to load earnings'); }
  },

  requestPayout: async () => {
    try {
      const res = await api.post('/mentorship/payout');
      return res.data;
    } catch (e) { return handleError(e, 'Failed to request payout'); }
  },
};

// ── FOUNDER — SENDING REQUESTS ────────────────────────────────────────────────
export const mentorRequestAPI = {
  sendRequest: async (data) => {
    try {
      const res = await api.post('/mentorship/request', data);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to send request'); }
  },

  getMySentRequests: async (params = {}) => {
    try {
      const res = await api.get('/mentorship/my-sent-requests', { params });
      return res.data;
    } catch (e) { return handleError(e, 'Failed to load sent requests'); }
  },

  cancelRequest: async (reqId) => {
    try {
      const res = await api.post(`/mentorship/requests/${reqId}/cancel`);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to cancel request'); }
  },

  rateSession: async (sessionId, rating, review = '') => {
    try {
      const res = await api.post(`/mentorship/sessions/${sessionId}/rate`, { rating, review });
      return res.data;
    } catch (e) { return handleError(e, 'Failed to submit rating'); }
  },
};

export default api;
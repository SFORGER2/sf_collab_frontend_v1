/**
 * Marketplace API Service — SF Collab
 * Handles all marketplace operations
 *
 * Payment method: Balance (real money only)
 * Crystals: listing promotion / boosts only — NOT payments
 * Platform fee: 10% on all transactions
 */

import axios from 'axios';
import { API_BASE_URL } from '@/utils/config';

const getAuthToken = () =>
  localStorage.getItem('accessToken') ||
  localStorage.getItem('token') ||
  localStorage.getItem('access_token') ||
  sessionStorage.getItem('accessToken') ||
  sessionStorage.getItem('token');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401)
      console.error('[MarketplaceAPI] 401 - Token missing or expired');
    return Promise.reject(err);
  }
);

const handleError = (error, defaultMsg) => {
  if (error.response) {
    const data = error.response.data;
    return { success: false, error: data?.error || data?.message || defaultMsg };
  }
  return { success: false, error: defaultMsg };
};

// ============================================================================
// CATEGORIES
// ============================================================================
export const categoryAPI = {
  getAll: async () => {
    try {
      const res = await api.get('/marketplace/categories');
      return res.data;
    } catch (e) { return handleError(e, 'Failed to load categories'); }
  },
};

// ============================================================================
// LISTINGS (BROWSE)
// ============================================================================
export const listingAPI = {
  getListings: async (params = {}) => {
    try {
      const res = await api.get('/marketplace/listings', { params });
      return res.data;
    } catch (e) { return handleError(e, 'Failed to load listings'); }
  },

  getListing: async (id) => {
    try {
      const res = await api.get(`/marketplace/listings/${id}`);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to load listing'); }
  },
};

// ============================================================================
// SELLER
// ============================================================================
export const sellerAPI = {
  register: async (data) => {
    try {
      const res = await api.post('/marketplace/seller/register', data);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to register as seller'); }
  },

  getMyProfile: async () => {
    try {
      const res = await api.get('/marketplace/seller/me');
      return res.data;
    } catch (e) { return handleError(e, 'Failed to load seller profile'); }
  },
};

// ============================================================================
// MY LISTINGS (SELLER)
// ============================================================================
// ============================================================================
// PURCHASE API
// ============================================================================
export const purchaseAPI = {
  purchase: async (listingId) => {
    try {
      const res = await api.post(`/marketplace/listings/${listingId}/purchase`);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to purchase listing'); }
  },

  getDownloadUrl: async (listingId) => {
    try {
      const res = await api.get(`/marketplace/listings/${listingId}/download`);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to get download link'); }
  },

  getMyPurchases: async () => {
    try {
      const res = await api.get('/marketplace/my-purchases');
      return res.data;
    } catch (e) { return handleError(e, 'Failed to load purchases'); }
  },

  rate: async (purchaseId, rating, reviewText = '') => {
    try {
      const res = await api.post(`/marketplace/purchases/${purchaseId}/rate`, {
        rating, review_text: reviewText
      });
      return res.data;
    } catch (e) { return handleError(e, 'Failed to submit rating'); }
  },
};

// ============================================================================
// SELLER EARNINGS & PAYOUT API
// ============================================================================
export const earningsAPI = {
  getEarnings: async () => {
    try {
      const res = await api.get('/marketplace/seller/earnings');
      return res.data;
    } catch (e) { return handleError(e, 'Failed to load earnings'); }
  },

  requestPayout: async () => {
    try {
      const res = await api.post('/marketplace/seller/payout');
      return res.data;
    } catch (e) { return handleError(e, 'Failed to request payout'); }
  },
};

// ============================================================================
// CRYSTAL BOOST API
// ============================================================================
export const boostAPI = {
  boostListing: async (listingId, durationUnits = 1) => {
    try {
      const res = await api.post(`/marketplace/listings/${listingId}/boost`, {
        duration_units: durationUnits
      });
      return res.data;
    } catch (e) { return handleError(e, 'Failed to boost listing'); }
  },

  getBoostStatus: async (listingId) => {
    try {
      const res = await api.get(`/marketplace/listings/${listingId}/boost`);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to get boost status'); }
  },
};

// ============================================================================
// MY LISTINGS (SELLER)
// ============================================================================
export const myListingsAPI = {  getAll: async (params = {}) => {
    try {
      const res = await api.get('/marketplace/my-listings', { params });
      return res.data;
    } catch (e) { return handleError(e, 'Failed to load your listings'); }
  },

  create: async (data) => {
    try {
      const res = await api.post('/marketplace/listings', data);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to create listing'); }
  },

  update: async (id, data) => {
    try {
      const res = await api.put(`/marketplace/listings/${id}`, data);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to update listing'); }
  },

  publish: async (id) => {
    try {
      const res = await api.post(`/marketplace/listings/${id}/publish`);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to publish listing'); }
  },

  archive: async (id) => {
    try {
      const res = await api.post(`/marketplace/listings/${id}/archive`);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to archive listing'); }
  },

  uploadFile: async (id, file, onProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/marketplace/listings/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      return res.data;
    } catch (e) { return handleError(e, 'Failed to upload file'); }
  },

  uploadPreviews: async (id, files) => {
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      const res = await api.post(`/marketplace/listings/${id}/previews`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (e) { return handleError(e, 'Failed to upload preview images'); }
  },

  deletePreview: async (listingId, previewIndex) => {
    try {
      const res = await api.delete(`/marketplace/listings/${listingId}/previews/${previewIndex}`);
      return res.data;
    } catch (e) { return handleError(e, 'Failed to delete preview'); }
  },
};

export default api;
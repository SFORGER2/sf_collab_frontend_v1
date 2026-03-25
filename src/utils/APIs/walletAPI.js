/**
 * Wallet & Store API Service for SF Collab
 * Handles all virtual economy operations
 * 
 * FIXED: Manually adds auth token to requests
 */

import { API_BASE_URL } from '@/utils/config';
import axios from 'axios';

// Helper function to get the auth token from storage
const getAuthToken = () => {
  // Try multiple storage locations where token might be stored
  const token = localStorage.getItem('accessToken') 
    || localStorage.getItem('token')
    || localStorage.getItem('access_token')
    || sessionStorage.getItem('accessToken')
    || sessionStorage.getItem('token');
  
  return token;
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[WalletAPI] ${config.method?.toUpperCase()} ${config.url}`, token ? '(with token)' : '(NO TOKEN!)');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[WalletAPI] 401 - Token missing or expired');
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// HELPER FUNCTION FOR ERROR HANDLING
// ============================================================================

const handleApiError = (error, defaultMessage) => {
  console.error(`[WalletAPI] Error:`, error);
  
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    if (status === 401) {
      console.error('[WalletAPI] 401 - Authentication error');
      return { success: false, error: 'Authentication required. Please log in again.' };
    }
    
    if (status === 403) {
      return { success: false, error: 'Access denied' };
    }
    
    if (status === 404) {
      return { success: false, error: 'Resource not found' };
    }
    
    if (status === 500) {
      console.error('[WalletAPI] 500 - Server error:', data);
      return { success: false, error: data?.error || 'Server error. Please try again.' };
    }
    
    return { success: false, error: data?.error || data?.message || defaultMessage };
  }
  
  if (error.request) {
    console.error('[WalletAPI] No response from server');
    return { success: false, error: 'Unable to connect to server.' };
  }
  
  return { success: false, error: defaultMessage };
};

// ============================================================================
// WALLET API
// ============================================================================

export const walletAPI = {
  getBalance: async () => {
    try {
      console.log('[WalletAPI] GET /wallet/balance');
      const response = await api.get('/wallet/balance');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load wallet balance');
    }
  },

  getUserBalance: async (userId) => {
    try {
      const response = await api.get(`/wallet/balance/${userId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load user balance');
    }
  },

  getHistory: async (params = {}) => {
    try {
      const response = await api.get('/wallet/history', {
        params: { page: params.page || 1, per_page: params.per_page || 10, ...params }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load history');
    }
  },

  earnCoins: async (data) => {
    try {
      const response = await api.post('/wallet/earn', data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to earn coins');
    }
  },

  spendCoins: async (data) => {
    try {
      const response = await api.post('/wallet/spend', data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to spend coins');
    }
  },

  addCrystals: async (data) => {
    try {
      const response = await api.post('/wallet/crystals/add', data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to add crystals');
    }
  },

  spendCrystals: async (data) => {
    try {
      const response = await api.post('/wallet/crystals/spend', data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to spend crystals');
    }
  },

  addEventTokens: async (data) => {
    try {
      const response = await api.post('/wallet/event-tokens/add', data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to add event tokens');
    }
  },

  transfer: async (data) => {
    try {
      const response = await api.post('/wallet/transfer', data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to transfer coins');
    }
  },

  getLeaderboard: async (params = {}) => {
    try {
      console.log('[WalletAPI] GET /wallet/leaderboard');
      const response = await api.get('/wallet/leaderboard', {
        params: { limit: params.limit || 10, period: params.period || 'all', ...params }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load leaderboard');
    }
  },

  getStats: async () => {
    try {
      console.log('[WalletAPI] GET /wallet/stats');
      const response = await api.get('/wallet/stats');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load stats');
    }
  },

  awardBonus: async (data, accessToken) => {
    try {
      const response = await api.post('/wallet/bonus', data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to award bonus');
    }
  },
};


// ============================================================================
// STORE API
// ============================================================================

export const storeAPI = {
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/store/products', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load products');
    }
  },

  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/store/products/featured');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load featured products');
    }
  },

  getProduct: async (productId) => {
    try {
      const response = await api.get(`/store/products/${productId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load product');
    }
  },

  purchaseProduct: async (productId) => {
    try {
      const response = await api.post(`/store/products/${productId}/purchase`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to purchase product');
    }
  },

  getInventory: async (params = {}) => {
    try {
      const response = await api.get('/store/inventory', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load inventory');
    }
  },

  equipItem: async (itemId) => {
    try {
      const response = await api.post(`/store/inventory/${itemId}/equip`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to equip item');
    }
  },

  useItem: async (itemId) => {
    try {
      const response = await api.post(`/store/inventory/${itemId}/use`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to use item');
    }
  },

  getPurchases: async (params = {}) => {
    try {
      const response = await api.get('/store/purchases', {
        params: { page: params.page || 1, per_page: params.per_page || 10, ...params }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load purchases');
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/store/categories');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load categories');
    }
  },

  createProduct: async (data, accessToken) => {
    try {
      const response = await api.post('/store/admin/products', data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to create product');
    }
  },

  updateProduct: async (productId, data, accessToken) => {
    try {
      const response = await api.put(`/store/admin/products/${productId}`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to update product');
    }
  },
};

// ============================================================================
// BALANCE API  (real-money wallet)
// ============================================================================

export const balanceAPI = {
  getBalance: async () => {
    try {
      const response = await api.get('/balance');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load balance');
    }
  },

  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/balance/transactions', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load balance transactions');
    }
  },

  deposit: async (amountDollars) => {
    try {
      const response = await api.post('/balance/deposit', { amount: amountDollars });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to deposit');
    }
  },

  withdraw: async (amountDollars) => {
    try {
      const response = await api.post('/balance/withdraw', { amount: amountDollars });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to withdraw');
    }
  },

  pay: async (data) => {
    try {
      const response = await api.post('/balance/pay', data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to process payment');
    }
  },

  // Escrow
  createEscrow: async (data) => {
    try {
      const response = await api.post('/balance/escrow', data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to create escrow');
    }
  },

  listEscrows: async (params = {}) => {
    try {
      const response = await api.get('/balance/escrow', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load escrows');
    }
  },

  approveEscrow: async (id) => {
    try {
      const response = await api.post(`/balance/escrow/${id}/approve`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to approve escrow');
    }
  },

  cancelEscrow: async (id, reason) => {
    try {
      const response = await api.post(`/balance/escrow/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to cancel escrow');
    }
  },
};


// ============================================================================
// CRYSTALS API  (visibility acceleration — NOT money)
// ============================================================================

export const crystalsAPI = {
  getWallet: async () => {
    try {
      const response = await api.get('/crystals');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load crystal wallet');
    }
  },

  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/crystals/transactions', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load crystal transactions');
    }
  },

  getBoosts: async (params = {}) => {
    try {
      const response = await api.get('/crystals/boosts', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load boosts');
    }
  },

  getPricing: async () => {
    try {
      const response = await api.get('/crystals/pricing');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to load crystal pricing');
    }
  },

  applyBoost: async (data) => {
    try {
      const response = await api.post('/crystals/boost', data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to apply boost');
    }
  },
};


export default api;
import { API_BASE_URL } from '@/utils/config'
import axios from 'axios'
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

// Payment API
export const paymentAPI = {
  // Get all plans with optional type filter
  getPlans: async (type = null) => {
    const response = await api.get('/payments/plans', {
      params: type ? { type } : {},
    })
    return response.data
  },

  // Get specific plan by ID
  getPlanById: async (planId) => {
    const response = await api.get(`/payments/plans/${planId}`)
    return response.data
  },

  // Create payment intent
  createPaymentIntent: async (priceId) => {
    const response = await api.post('/payments/create-payment-intent', {
      priceId,
    })
    return response.data
  },

  // Create checkout session
  createCheckoutSession: async (checkoutData) => {
    const response = await api.post('/payments/create-checkout-session', checkoutData)
    return response.data
  },

  // Get checkout session details
  getCheckoutSession: async (sessionId) => {
    const response = await api.get(`/payments/checkout-session/${sessionId}`)
    return response.data
  },

  // Record transaction
  recordTransaction: async (transactionData) => {
    const response = await api.post('/payments/record-transaction', transactionData)
    return response.data
  },

  // Create donation session
  createDonationSession: async (donationData) => {
    const response = await api.post('/payments/create-donation-session', donationData)
    return response.data
  },

  // Get total donations
  getTotalDonations: async (params) => {
    const response = await api.get('/payments/donations', { params })
    return response.data
  },

  // Get total crowdfunding
  getTotalCrowdfunding: async (params) => {
    const response = await api.get('/payments/crowdfunding', { ...params })
    return response.data
  },

  getCredits: async () => {
    const response = await api.get('/payments/credits');
    return response.data;
  },
  getAITools: async () => {
    const response = await api.get('/payments/ai-tools');
    return response.data;
  }
}

export default api
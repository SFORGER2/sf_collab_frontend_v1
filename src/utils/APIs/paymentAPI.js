import axios from 'axios'
import { API_CONFIG, requestErrorInterceptor, requestInterceptor, responseErrorInterceptor, responseInterceptor } from './interceptors';

const api = axios.create(API_CONFIG)

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
  getTotalDonations: async () => {
    const response = await api.get('/payments/total-donations')
    return response.data
  },

  // Get donations list
  getDonations: async (params) => {
    const response = await api.get('/payments/donations', { params })
    return response.data
  },

  // Get total crowdfunding
  getTotalCrowdfunding: async () => {
    const response = await api.get('/payments/total-crowdfunding')
    return response.data
  },

  // Get crowdfunding transactions
  getCrowdfundingTransactions: async (params) => {
    const response = await api.get('/payments/crowdfunding', { params })
    return response.data
  },

  // Register crowdfunding interest
  registerCrowdfundingInterest: async () => {
    const response = await api.post('/payments/crowdfunding-interest')
    return response.data
  },

  // Get credits
  getCredits: async () => {
    const response = await api.get('/payments/credits')
    return {
      data: {
        credits: 100
      },
      success: true,
    }
    return response.data
  },

  // Get AI tools
  getAITools: async () => {
    const response = await api.get('/payments/ai-tools')
    return response.data
  },

  // Deposit funds
  depositFunds: async (amount) => {
    const response = await api.post('/payments/deposit', { amount })
    return response.data
  },

  // Get wallet balance
  getWalletBalance: async () => {
    const response = await api.get('/payments/wallet-balance')
    return response.data
  },

  // Withdraw funds
  withdrawFunds: async (amount) => {
    const response = await api.post('/payments/withdraw', { amount })
    return response.data
  },

  // Get wallet transactions
  getWalletTransactions: async (params) => {
    const response = await api.get('/payments/wallet-transactions', { params })
    return response.data
  },
}

export default api
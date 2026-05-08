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

export const authAPI = {
  loginRequest: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  loginGoogleRequest: async (credentials) => {
    const response = await api.post('/auth/google/login', credentials);
    return response.data;
  },

  registerRequest: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  refreshTokenRequest: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  getProfileRequest: async (token) => {
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  logoutRequest: async () => {
    const response = await api.post('/auth/logout', {});
    return response.data;
  },

  sendVerificationCodeRequest: async () => {
    const response = await api.post('/auth/send-verification-code', {});
    return response.data;
  },

  verifyEmailRequest: async (code, token) => {
    const response = await api.post('/auth/verify-code', { code }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  setupProfileRequest: async (profileData, token) => {
    const response = await api.post('/users/profile-setup', profileData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;

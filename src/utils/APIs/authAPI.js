import axios from 'axios';
import { API_CONFIG, requestInterceptor, requestErrorInterceptor, responseInterceptor, responseErrorInterceptor } from './interceptors';

const api = axios.create(API_CONFIG);

api.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

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

  getProfileRequest: async () => {
    // No manual token needed — interceptor handles it
    const response = await api.get('/auth/me');
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

  verifyEmailRequest: async (arg1, arg2, arg3) => {
    // Robustly handle both signatures:
    // 1. verifyEmailRequest(email, code, token)
    // 2. verifyEmailRequest(code, token)
    let email, code, token;
    if (arg3 !== undefined) {
      email = arg1;
      code = arg2;
      token = arg3;
    } else {
      code = arg1;
      token = arg2;
    }

    const payload = email ? { email, code } : { code };
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    const response = await api.post('/auth/verify-code', payload, headers);
    return response.data;
  },

  // FIX: correct endpoint is /auth/setup-profile (not /users/profile-setup)
  // FIX: no manual token arg — requestInterceptor reads from localStorage automatically
  setupProfileRequest: async (profileData) => {
    const response = await api.post('/auth/setup-profile', profileData, {
      headers: {
        // Let axios set Content-Type automatically for FormData so the
        // multipart boundary is included correctly
        'Content-Type': undefined,
      },
    });
    return response.data;
  },
};

export default api;
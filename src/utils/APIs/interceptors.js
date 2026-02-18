import { API_BASE_URL } from "../config";

export const requestInterceptor = (config) => {
  const token = localStorage.getItem('access_token');
  
  if (!config.headers.Authorization && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

export const requestErrorInterceptor = (error) => {
  return Promise.reject(error);
}

export const responseInterceptor = (response) => response;

export const responseErrorInterceptor = (error) => {
  if (error.code === 'ECONNREFUSED') {
    console.error('❌ Cannot connect to backend at', API_BASE_URL);
    return Promise.reject(error);
  }

  const status = error.response?.status;
  const data = error.response?.data;
  const path = window.location.pathname;

  const isAuthRoute =
    path.startsWith('/login') ||
    path.startsWith('/signup') ||
    path.startsWith('/auth') ||
    path === '/';

  // Only hard-logout if NOT already on auth pages
  if (status === 401 && !isAuthRoute) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    console.warn('🔐 Unauthorized — redirecting to login');
    window.location.href = '/login';
    return Promise.reject(error);
  }

  // Auth pages should receive the error normally
  if (data) {
    console.error('API Error:', status, data);
    return Promise.reject(data);
  }

  if (error.response) {
    console.error('API Error:', status, error.response.data);
  }

  return Promise.reject(error);
};
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
}
// src/services/apiClient.js
import axios from 'axios';
import { API_URL } from '@/utils/config';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  // We check BOTH common names just in case
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  console.log("Token", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
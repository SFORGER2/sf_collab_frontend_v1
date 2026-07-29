import axios from 'axios';
import {
  API_CONFIG,
  requestErrorInterceptor,
  requestInterceptor,
  responseErrorInterceptor,
  responseInterceptor,
} from './interceptors';

const api = axios.create(API_CONFIG);

api.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export const matchmakingAPI = {
  getForMe: async (params = {}) => {
    const response = await api.get('/matchmaking/for-me', { params });
    return response.data;
  },

  getMatchingStartups: async (params = {}) => {
    const response = await api.get('/matchmaking/startups', { params });
    return response.data;
  },

  getCoFounders: async (params = {}) => {
    const response = await api.get('/matchmaking/cofounders', { params });
    return response.data;
  },

  getCofounderSuggestions: async (params = {}) => {
    const response = await api.get('/matchmaking/cofounders', { params });
    return response.data;
  },
};

export default matchmakingAPI;

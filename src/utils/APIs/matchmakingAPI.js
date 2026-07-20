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
  // GET /matchmaking/startups
  getMatchingStartups: async () => {
    const res = await api.get('/matchmaking/startups');
    return res.data;
  },
  getCofounderSuggestions: async () => {
    try {
      // Exact response shape is unconfirmed because no other consumer of this endpoint exists yet.
      // The UI mapping layer should tolerate missing or differently named fields gracefully.
      const response = await api.get('/matchmaking/cofounders');
      const payload = response.data;

      if (payload?.success === false) return payload;
      return payload;
    } catch (error) {
      console.error('Error fetching cofounder suggestions:', error);
      throw error;
    }
  },
};

export default matchmakingAPI;

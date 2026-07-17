import axios from 'axios';
import {
  API_CONFIG,
  requestInterceptor,
  requestErrorInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from './interceptors';

const api = axios.create(API_CONFIG);

api.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export const matchmakingAPI = {
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

export default api;

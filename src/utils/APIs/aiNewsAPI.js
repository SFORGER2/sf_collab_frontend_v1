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

export const aiNewsAPI = {
  /**
   * Fetch available categories dynamically from the backend.
   * GET /api/ai-news/ainews/categories
   */
  getCategories: async () => {
    const response = await api.get('/ai-news/ainews/categories');
    return response.data;
  },

  /**
   * Fetch available news sources dynamically from the backend.
   * GET /api/ai-news/ainews/sources
   */
  getSources: async () => {
    const response = await api.get('/ai-news/ainews/sources');
    return response.data;
  },
};

export default aiNewsAPI;

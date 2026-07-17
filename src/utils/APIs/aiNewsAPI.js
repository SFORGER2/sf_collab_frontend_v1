import axios from 'axios';
import { API_CONFIG, requestInterceptor, requestErrorInterceptor, responseInterceptor, responseErrorInterceptor } from './interceptors';

const api = axios.create(API_CONFIG);
api.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export const aiNewsAPI = {
  /**
   * Fetch AI news articles.
   * GET /api/ai-news/ainews
   */
  getAINews: async (params = {}) => {
    const response = await api.get('/ai-news/ainews', { params });
    return response.data;
  },
};

export default aiNewsAPI;

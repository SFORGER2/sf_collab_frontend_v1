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
  getDigest: async () => {
    const response = await api.get('/ai-news/ainews/digest');
    return response.data;
  },
};

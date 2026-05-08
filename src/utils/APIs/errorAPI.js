import { API_BASE_URL } from '@/utils/config';
import axios from 'axios';
import { requestErrorInterceptor, requestInterceptor, responseErrorInterceptor, responseInterceptor } from './interceptors';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

api.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);

export const errorAPI = {
  // Log client-side error
  logClientError: async (errorData) => {
    const response = await api.post('/log-client-error', {
      errorMessage: errorData.errorMessage,
      errorFromBackend: errorData.errorFromBackend || false,
      stack: errorData.stack,
      page: errorData.page,
      component: errorData.component || 'Unknown Component',
      timestamp: errorData.timestamp || new Date().toISOString(),
    });
    return response.data;
  },

  // Get all logged errors (admin only, requires JWT)
  getAllErrors: async (params) => {
    const response = await api.get('/errors', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 20,
      },
    });
    return response.data;
  },
  deleteError: async (errorId) => {
    const response = await api.delete(`/errors/${errorId}`);
    return response.data;
  }
};

export default api;
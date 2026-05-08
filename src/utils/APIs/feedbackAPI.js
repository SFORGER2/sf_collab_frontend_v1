import axios from 'axios'
import { API_CONFIG, requestErrorInterceptor, requestInterceptor, responseErrorInterceptor, responseInterceptor } from './interceptors';

const api = axios.create(API_CONFIG)

api.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

api.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);

// Feedback API
export const feedbackAPI = {
  create: async (userId, content) => {
    const response = await api.post("/feedback", { userId, content });
    return response.data.data;
  },

  getAll: async (params) => {
    const response = await api.get("/feedback", {
      params: params
    });
    return response.data;
  },

  getById: async (feedbackId) => {
    const response = await api.get(`/feedback/${feedbackId}`);
    return response.data;
  },

  update: async (feedbackId, content, accessToken) => {
    const response = await api.put(`/feedback/${feedbackId}`, { content }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  delete: async (userId) => {
    const response = await api.delete(`/feedback/${userId}`);
    return response.data;
  },
};

export default api;
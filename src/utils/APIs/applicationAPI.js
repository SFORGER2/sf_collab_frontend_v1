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


// Application API
export const applicationAPI = {
  
  getAll: async (params) => {
    const response = await api.get("/applications", {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        type: params.type,
        search: params.search,
      },
    });
    return response.data;
  },

  getJobApplications: async (_, params) => {
    const response = await api.get("/applications/jobs", {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        search: params.search,
      },
    });
    return response.data;
  },

  getInfluencerApplications: async (_, params) => {
    const response = await api.get("/applications/influencers", {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        search: params.search,
      },
    });
    return response.data;
  },

  getById: async (applicationId) => {
    const response = await api.get(`/applications/${applicationId}`);
    return response.data;
  },

  createJobApplication: async (applicationData) => {
    const response = await api.post("/applications/jobs", applicationData);
    return response.data;
  },

  createInfluencerApplication: async (applicationData) => {
    const response = await api.post("/applications/influencers", applicationData);
    return response.data;
  },

  delete: async (applicationId) => {
    const response = await api.delete(`/applications/${applicationId}`);
    return response.data;
  },
};

export default api
import axios from 'axios';
import {
  API_CONFIG,
  requestErrorInterceptor,
  requestInterceptor,
  responseErrorInterceptor,
  responseInterceptor
} from './interceptors';

const api = axios.create(API_CONFIG);

api.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

api.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);

export const generatorAPI = {
  // Get all jobs for a project
  getProjectJobs: async (projectId) => {
    const response = await api.get(`/generator/projects/${projectId}/jobs`);
    return response.data;
  },

  // Get details and logs of a single job
  getProjectJobDetails: async (projectId, jobId) => {
    const response = await api.get(`/generator/projects/${projectId}/jobs/${jobId}`);
    return response.data;
  },

  // Get a single project (status, details)
  getProject: async (projectId) => {
    const response = await api.get(`/generator/projects/${projectId}`);
    return response.data;
  },

  // Trigger / Retry harvesting
  harvestProject: async (projectId, urls) => {
    const body = urls ? { urls } : {};
    const response = await api.post(`/generator/projects/${projectId}/harvest`, body);
    return response.data;
  },

  // Trigger / Retry generating codebase
  generateCodebase: async (projectId) => {
    const response = await api.post(`/generator/projects/${projectId}/generate`);
    return response.data;
  },

  // Trigger / Retry pushing to git repository
  pushRepository: async (projectId, payload) => {
    const response = await api.post(`/generator/projects/${projectId}/repository`, payload);
    return response.data;
  },

  // Get delivery records (git repositories)
  getRepositories: async (projectId) => {
    const response = await api.get(`/generator/projects/${projectId}/repositories`);
    return response.data;
  }
};

export default generatorAPI;

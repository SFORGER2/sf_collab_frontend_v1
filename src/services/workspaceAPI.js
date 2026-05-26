// src/services/workspaceAPI.js
import apiClient from './apiClient';

export const workspaceAPI = {
  // Get user's workspaces
  getMyWorkspaces: async () => {
    const response = await apiClient.get('/workspaces/my');  // Removed /api
    return response.data.data?.workspaces || response.data.workspaces || [];
  },

  // Create a new workspace
  createWorkspace: async (name, slug) => {
    const response = await apiClient.post('/workspaces/create', { name, slug });  // Removed /api
    return response.data.data?.workspace || response.data.workspace;
  },

  // Switch active workspace
  switchWorkspace: async (workspaceId) => {
    const response = await apiClient.post(`/workspaces/switch/${workspaceId}`);  // Removed /api
    return response.data;
  },

  // Get workspace details (optional)
  getWorkspace: async (workspaceId) => {
    const response = await apiClient.get(`/workspaces/${workspaceId}`);  // Removed /api
    return response.data.data?.workspace || response.data.workspace;
  },

  // src/services/workspaceAPI.js – add this at the end
  deleteWorkspace: async (workspaceId) => {
    const response = await apiClient.delete(`/workspaces/${workspaceId}`);
    return response.data;
  },

};
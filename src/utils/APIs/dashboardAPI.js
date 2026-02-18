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


// Dashboard API
export const dashboardAPI = {
  // Get founder dashboard
  getFounderDashboard: async () => {
    const response = await api.get('/dashboard/founder')
    console.log("Response:", response);
    return response.data
  },

  // Get builder dashboard
  getBuilderDashboard: async () => {
    const response = await api.get('/dashboard/builder')
    return response.data
  },

  // Get dashboard overview
  getOverview: async () => {
    const response = await api.get('/dashboard/overview')
    return response.data
  },
}

export default api
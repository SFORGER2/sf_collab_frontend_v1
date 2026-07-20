import { API_CONFIG, requestInterceptor, requestErrorInterceptor, responseInterceptor, responseErrorInterceptor } from './interceptors';
import axios from 'axios';

const api = axios.create(API_CONFIG);
api.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export const discoveryFeedAPI = {
  getFeed: async (params = {}) => {
    try {
      // Backend returns { data: { startups: [...], pagination: {...} }, success: true }
      // DiscoverStartups.jsx expects { success: true, sections: { startups, fastGrowing, visions, milestones } }
      // We reshape the flat list into the sections structure here.
      const response = await api.get('/startups', { params });
      const payload = response.data;

      if (!payload.success) return payload;

      const allStartups = payload.data?.startups || [];

      // Split into sections based on startup properties
      const recruiting   = allStartups.filter(s => s.positions > 0 || s.lifecycleState === 'recruiting');
      const fastGrowing  = allStartups.filter(s => (s.executionScore || 0) >= 5 || s.lifecycleState === 'active');
      // If recruiting is empty, fall back to showing all startups in the main section
      const startupsSection = recruiting.length > 0 ? recruiting : allStartups;

      return {
        success: true,
        sections: {
          startups:    startupsSection,
          fastGrowing: fastGrowing.slice(0, 6),
          visions:     [],       // visions come from a separate endpoint if available
          milestones:  [],
        },
        pagination: payload.data?.pagination,
      };
    } catch (error) {
      console.error('Error fetching discovery feed:', error);
      throw error;
    }
  },
};
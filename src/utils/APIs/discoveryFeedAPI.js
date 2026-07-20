import { API_CONFIG, requestInterceptor, requestErrorInterceptor, responseInterceptor, responseErrorInterceptor } from './interceptors';
import axios from 'axios';

const api = axios.create(API_CONFIG);
api.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export const discoveryFeedAPI = {
  getFeed: async (params = {}) => {
    try {
      // 1. Try to fetch from the unified discovery-feed endpoint first
      const response = await api.get('/discovery-feed', { params });
      const payload = response.data;
      if (payload.success && payload.sections && Array.isArray(payload.sections.visions) && payload.sections.visions.length > 0) {
        return payload;
      }
    } catch (error) {
      console.warn('Direct /discovery-feed failed, trying fallback merge:', error);
    }

    // 2. Fallback: Query startups and ideas (visions) separately and merge
    try {
      const [startupsRes, ideasRes] = await Promise.allSettled([
        api.get('/startups', { params }),
        api.get('/ideas', { params: { page: 1, per_page: 20 } })
      ]);

      let startupsList = [];
      let pagination = undefined;
      if (startupsRes.status === 'fulfilled' && startupsRes.value.data?.success) {
        const payload = startupsRes.value.data;
        startupsList = payload.data?.startups || payload.startups || [];
        pagination = payload.data?.pagination;
      }

      let visionsList = [];
      if (ideasRes.status === 'fulfilled' && ideasRes.value.data?.success) {
        const payload = ideasRes.value.data;
        const ideasArray = payload.data?.ideas || payload.ideas || [];
        visionsList = ideasArray.map(idea => ({
          id: idea.id || idea._id,
          original_id: idea.id || idea._id,
          name: idea.title || idea.name,
          description: idea.description,
          sector: idea.industry || idea.category || 'General',
          readinessScore: idea.readinessScore || idea.readiness_score || 0,
          teamSize: idea.teamSize || 0,
          interestedBuilders: idea.interestedBuilders || 0,
          rolesNeeded: idea.rolesNeeded || idea.roles || [],
          imageUrl: idea.imageUrl
        }));
      }

      // Split into sections based on startup properties
      const recruiting   = startupsList.filter(s => s.positions > 0 || s.lifecycleState === 'recruiting');
      const fastGrowing  = startupsList.filter(s => (s.executionScore || 0) >= 5 || s.lifecycleState === 'active');
      const startupsSection = recruiting.length > 0 ? recruiting : startupsList;

      return {
        success: true,
        sections: {
          startups:    startupsSection,
          fastGrowing: fastGrowing.slice(0, 6),
          visions:     visionsList,
          milestones:  [],
        },
        pagination,
      };
    } catch (error) {
      console.error('Error fetching discovery feed in fallback:', error);
      throw error;
    }
  },
};
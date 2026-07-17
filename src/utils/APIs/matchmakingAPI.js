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

// ─────────────────────────────────────────────────────────────
// Matchmaking API — wraps matchmaking related endpoints
// ─────────────────────────────────────────────────────────────
export const matchmakingAPI = {
  // GET /matchmaking/startups
  getMatchingStartups: async () => {
    const res = await api.get('/matchmaking/startups');
    return res.data;
  },
};

export default matchmakingAPI;

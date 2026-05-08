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

// Waitlist API
export const waitlistAPI = {
  register: async (email, name, id, accessToken) => {
    const response = await api.post("/waitlist/register", { email, name, id }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data;
  },

  getTotalCount: async () => {
    const response = await api.get("/waitlist/count");
    return response.data.data;
  },

  isOnWaitlist: async (email) => {
    const response = await api.post("/waitlist/check", { email });
    return {
      on_waitlist: response.data.data.is_on_waitlist,
      position: response.data.data.position,
    };
  },

  getLeaderboard: async (limit = 10) => {
    const response = await api.get(
      `/waitlist/leaderboard?limit=${limit}`
    );
    return response.data.data;
  },
  getMyRanking: async (userId, accessToken) => {
    const response = await api.get(`/waitlist/me/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data;
  },

  addPoints: async ({ category, points }, accessToken) => {
    const response = await api.post(
      "/waitlist/add-points",
      {
        category, // referral | contribution | activity | new_startup | custom | (small|medium|large)_contribution
        points,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.data;
  },
  givePoints: async (userId, category) => {
    const response = await api.post(
      "/waitlist/give-points",
      {
        user_id: userId,
        category, // referral | contribution | activity | new_startup | (small|medium|large)_contribution
      }
    );
    return response.data.data;
  },
  heartbeat: async (userId, accessToken) => {
    const response = await api.get(
      `/waitlist/heartbeat/${userId}`,
      {
        headers: {  
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.data;
  },
  sendPhoneVerificationCode: async (userId, email, phone, extension, accessToken) => {

    const response = await api.post("/waitlist/send-verification-code", {
      email,
      phone,
      extension,
      user_id: userId,
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data;
  },
  getFeedback: async (params = {}, accessToken) => {
    const response = await api.get("/waitlist/feedback", {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        ...params
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }
};



export default api


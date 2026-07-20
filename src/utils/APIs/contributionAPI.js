import axios from 'axios';
import { API_CONFIG, requestErrorInterceptor, requestInterceptor, responseErrorInterceptor, responseInterceptor } from './interceptors';

const api = axios.create(API_CONFIG);

api.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

api.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);


// Contribution API
export const contributionAPI = {
  createIdea: async (ideaData, accessToken) => {
    const response = await api.post('/contribution-ideas', ideaData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  getAllIdeas: async (params) => {
    const response = await api.get('/contribution-ideas', { 
      params
    });
    return response.data;
  },

  getIdeaById: async (ideaId) => {
    const response = await api.get(`/contribution-ideas/${ideaId}`);
    return response.data;
  },

  updateIdea: async (ideaId, ideaData, accessToken) => {
    const response = await api.put(`/contribution-ideas/${ideaId}`, ideaData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  deleteIdea: async (ideaId, accessToken) => {
    const response = await api.delete(`/contribution-ideas/${ideaId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  getUserIdeas: async (userId, params) => {
    const response = await api.get(`/contribution-ideas/user/${userId}`, { params });
    return response.data;
  },
  createPoll: async (pollData, accessToken) => {
    const response = await api.post('/contribution-polls', pollData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  getAllPolls: async (params, accessToken) => {
    const response = await api.get('/contribution-polls', { 
      params,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  },

  getPollById: async (pollId) => {
    const response = await api.get(`/contribution-polls/${pollId}`);
    return response.data;
  },

  updatePoll: async (pollId, pollData, accessToken) => {
    const response = await api.put(`/contribution-polls/${pollId}`, pollData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  deletePoll: async (pollId, accessToken) => {
    const response = await api.delete(`/contribution-polls/${pollId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  autoDeletePolls: async () => {
    const response = await api.post('/contribution-polls/auto-delete');
    return response.data;
  },
  voteInPoll: async (pollId, optionIndex, accessToken) => {
    const response = await api.post(`/contribution-polls/${pollId}/vote`, 
      { option_index: optionIndex },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  }
};

export default api;
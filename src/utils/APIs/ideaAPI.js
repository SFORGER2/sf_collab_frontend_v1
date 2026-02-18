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

// Idea API
export const ideaAPI = {
  getAllIdeas: async (accessToken, params) => {
    const response = await api.get("/ideas", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: params,
    });
    return response.data;
  },

  getIdeaById: async (ideaId, accessToken) => {
    const response = await api.get(`/ideas/${ideaId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  createIdea: async (ideaData, accessToken, headers) => {
    const response = await api.post('/ideas', ideaData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...headers,
      },
    });
    return response.data;
  },

  updateIdea: async (ideaId, ideaData, accessToken) => {
    const response = await api.put(`/ideas/${ideaId}`, ideaData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  deleteIdea: async (ideaId, accessToken) => {
    const response = await api.delete(`/ideas/${ideaId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },
  likeIdea: async (ideaId, accessToken) => {
    const response = await api.post(`/ideas/${ideaId}/like`, {}, {
      headers: {
      Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
    },

    addTeamMember: async (ideaId, memberData) => {
    const response = await api.post(`/ideas/${ideaId}/team-members`, memberData);
    return response.data;
    },
  // Idea Comments API
  getIdeaComments: async (accessToken, params) => {
    const response = await api.get("/idea-comments", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: params,
    });
    return response.data;
  },

  createIdeaComment: async (commentData, accessToken) => {
    const response = await api.post('/idea-comments', commentData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  updateIdeaComment: async (commentId, commentData, accessToken) => {
    const response = await api.put(`/idea-comments/${commentId}`, commentData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  deleteIdeaComment: async (commentId, accessToken) => {
    const response = await api.delete(`/idea-comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },
  // Idea Bookmarks API
  getIdeaBookmarks: async (accessToken, params) => {
    const response = await api.get("/idea-bookmarks", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: params,
    });
    return response.data;
  },

  getIdeaBookmark: async (bookmarkId, accessToken) => {
    const response = await api.get(`/idea-bookmarks/${bookmarkId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  toggleIdeaBookmark: async (bookmarkData) => {
    const response = await api.post('/idea-bookmarks/toggle', bookmarkData);
    return response.data;
  },
  updateIdeaBookmark: async (bookmarkId, bookmarkData, accessToken) => {
    const response = await api.put(`/idea-bookmarks/${bookmarkId}`, bookmarkData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  checkIdeaBookmark: async (userId, ideaId, accessToken) => {
    const response = await api.get(`/idea-bookmarks/user/${userId}/idea/${ideaId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },



  deleteIdeaBookmark: async (bookmarkId, accessToken) => {
    const response = await api.delete(`/idea-bookmarks/${bookmarkId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },
};

export default api;
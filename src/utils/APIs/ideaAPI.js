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
  getAllIdeas: async (params) => {
    const response = await api.get("/ideas", {
      params: params,
    });
    return response.data;
  },

  getIdeaById: async (ideaId) => {
    const response = await api.get(`/ideas/${ideaId}`);
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
  getIdeaComments: async (params) => {
    const response = await api.get("/idea-comments", {
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
  getIdeaBookmarks: async (params) => {
    const response = await api.get("/idea-bookmarks", {
      params: params,
    });
      console.log("Saved ideas:", response.data);
    
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
  toggleIdeaCommentLike: async (commentId) => {
    const response = await api.post(`/idea-comments/${commentId}/like`, {});
    return response.data;
  },
  getTopIdeas: async (params = {}) => {
    const response = await api.get('/ideas/top', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        limit: 10
      },
    });
    return response.data;
  }
};

export default api;
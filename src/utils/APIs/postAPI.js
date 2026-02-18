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

// Posts API
export const postAPI = {
  getAll: async (accessToken, params) => {
    const response = await api.get('/posts', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        search: params.search,
      },
    })
    return response.data.data
  },

  getById: async (postId, accessToken) => {
    const response = await api.get(`/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data.data
  },

  create: async (postData, accessToken) => {
    const response = await api.post('/posts', postData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  update: async (postId, postData, accessToken) => {
    const response = await api.put(`/posts/${postId}`, postData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  delete: async (postId, accessToken) => {
    const response = await api.delete(`/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },

  like: async (postId, accessToken) => {
    const response = await api.post(`/posts/${postId}/like`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data.data
  },

  unlike: async (postId, accessToken) => {
    const response = await api.post(`/posts/${postId}/unlike`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data.data
  },

  getTags: async (postId, accessToken) => {
    const response = await api.get(`/posts/${postId}/tags`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data.data
  },

  getComments: async (postId, accessToken, params) => {
    const response = await api.get(`/post-comments`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        post_id: postId,
        page: params.page || 1,
        per_page: params.per_page || 10,
      },
    })
    return response.data.data
  },

  addComment: async (postId, content, accessToken) => {
    const response = await api.post('/post-comments', { post_id: postId, content }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data.data
  },

  deleteComment: async (commentId, accessToken) => {
    const response = await api.delete(`/post-comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },

  getLikes: async (postId, accessToken) => {
    const response = await api.get(`/post-likes/post/${postId}/count`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data.data
  },

  getMedia: async (postId, accessToken) => {
    const response = await api.get(`/post-media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        post_id: postId,
      },
    })
    return response.data.data
  },

  addMedia: async (postId, mediaData, accessToken) => {
    const response = await api.post('/post-media', { post_id: postId, ...mediaData }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  deleteMedia: async (mediaId, accessToken) => {
    const response = await api.delete(`/post-media/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },
}

export default api
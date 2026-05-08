import axios from 'axios'
import { API_CONFIG, requestErrorInterceptor, requestInterceptor, responseErrorInterceptor, responseInterceptor } from './interceptors';

const api = axios.create(API_CONFIG)

api.interceptors.request.use((config) => {
  // Let axios set Content-Type automatically for FormData (multipart/form-data + boundary).
  // For plain objects, default to application/json.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  return requestInterceptor(config);
}, requestErrorInterceptor);

api.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);

// Posts API
export const postAPI = {
  getAll: async (params) => {
    const response = await api.get('/posts', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        search: params.search,
      },
    })
    return response.data
  },

  getById: async (postId) => {
    const response = await api.get(`/posts/${postId}`)
    return response.data
  },

  create: async (postData) => {
    const response = await api.post('/posts', postData)
    return response.data
  },

  update: async (postId, postData) => {
    const response = await api.put(`/posts/${postId}`, postData)
    return response.data
  },

  delete: async (postId) => {
    const response = await api.delete(`/posts/${postId}`)
    return response.data
  },

  like: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`, {})
    return response.data
  },

  unlike: async (postId) => {
    const response = await api.post(`/posts/${postId}/unlike`, {})
    return response.data
  },

  getTags: async (postId) => {
    const response = await api.get(`/posts/${postId}/tags`)
    return response.data
  },

  // Comments API (backend uses /api/post-comments)
  getComments: async (postId, params) => {
    const response = await api.get('/post-comments', {
      params: {
        post_id: postId,
        page: params?.page || 1,
        per_page: params?.per_page || 10,
      },
    })
    return response.data
  },

  addComment: async (postId, content, author) => {
    const payload = {
      post_id: postId,
      content,
      author_id: author?.author_id,
      author_first_name: author?.author_first_name,
      author_last_name: author?.author_last_name,
    }
    const response = await api.post('/post-comments', payload)
    return response.data
  },

  deleteComment: async (_postId, commentId) => {
    const response = await api.delete(`/post-comments/${commentId}`)
    return response.data
  },

  getLikes: async (postId) => {
    const response = await api.get(`/posts/${postId}/likes`)
    return response.data
  },

  getMedia: async (postId) => {
    const response = await api.get(`/posts/${postId}`)
    return response.data
  },

  addMedia: async (postId, mediaData) => {
    const response = await api.post(`/posts/${postId}`, mediaData)
    return response.data
  },

  deleteMedia: async (postId, mediaId) => {
    const response = await api.delete(`/posts/${postId}`)
    return response.data
  },

  // Stories API (backend uses /api/stories)
  getStories: async (params) => {
    const response = await api.get('/stories', {
      params: {
        page: params?.page || 1,
        per_page: params?.per_page || 20,
      },
    })
    return response.data
  },

  getStoryById: async (storyId, params) => {
    const response = await api.get(`/stories/${storyId}`)
    return response.data
  },

  createStory: async (storyData) => {
    // storyData should be FormData with a "media" file and related fields.
    // Let axios set the correct multipart headers automatically.
    const response = await api.post('/stories', storyData, {
      headers: {
        "Content-Type": undefined
      }
    })
    return response.data
  },

  updateStory: async (storyId, storyData) => {
    const response = await api.put(`/stories/${storyId}`, storyData)
    return response.data
  },

  viewStory: async (storyId, userId) => {
    const response = await api.post(`/stories/${storyId}/view`, { user_id: userId })
    return response.data
  },

  getActiveStories: async (userIds, currentUserId) => {
    const response = await api.get('/stories', {
      params: { page: 1, limit: 50 },
    })
    return response.data
  },

  deleteStory: async (storyId) => {
    const response = await api.delete(`/stories/${storyId}`)
    return response.data
  },
}

export default api

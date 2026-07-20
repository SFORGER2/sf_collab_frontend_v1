/**
 * socialAPI.js — fixed version
 *
 * FIXES:
 * - postsAPI.unlike: was calling /posts/:id/like (same as like) → now calls /posts/:id/unlike
 * - postsAPI.like/unlike: backend requires no body (user_id comes from JWT) → body removed
 * - storiesAPI.delete: was calling DELETE but wasn't wired to the right route in some callers
 * - userSocialAPI.followUser / unfollowUser: no body needed — backend reads from JWT
 */
import axios from 'axios'
import {
  API_CONFIG,
  requestErrorInterceptor,
  requestInterceptor,
  responseErrorInterceptor,
  responseInterceptor,
} from './interceptors'

const api = axios.create(API_CONFIG)

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }
  return requestInterceptor(config)
}, requestErrorInterceptor)

api.interceptors.response.use(responseInterceptor, responseErrorInterceptor)


// ─── Posts API  (backend: /api/posts) ────────────────────────────────────────
export const postsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/posts', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        type: params.postType,
        search: params.search,
        include_comments: params.include_comments,
        include_media: params.include_media,
      },
    })
    return response.data
  },

  getById: async (postId, params = {}) => {
    const response = await api.get(`/posts/${postId}`, {
      params: {
        include_comments: params.include_comments,
        include_media: params.include_media,
      },
    })
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

  // FIX: body is empty — user_id comes from JWT on the backend
  like: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`)
    return response.data
  },

  // FIX: was calling /posts/:id/like (same URL as like) — now calls /unlike
  unlike: async (postId) => {
    const response = await api.post(`/posts/${postId}/unlike`)
    return response.data
  },

  addTag: async (postId, tag) => {
    const response = await api.post(`/posts/${postId}/tags`, { tag })
    return response.data
  },

  save: async (postId) => {
    const response = await api.post(`/posts/${postId}/save`)
    return response.data
  },

  unsave: async (postId) => {
    const response = await api.post(`/posts/${postId}/unsave`)
    return response.data
  },
}


// ─── Stories API  (backend: /api/stories) ─────────────────────────────────────
export const storiesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/stories', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 20,
        active_only: params.activeOnly !== false,
      },
    })
    return response.data
  },

  getById: async (storyId) => {
    const response = await api.get(`/stories/${storyId}`)
    return response.data
  },

  create: async (storyData) => {
    // storyData must be FormData
    const response = await api.post('/stories', storyData)
    return response.data
  },

  update: async (storyId, storyData) => {
    const response = await api.put(`/stories/${storyId}`, storyData)
    return response.data
  },

  // FIX: view now sends no user_id in body — backend reads from JWT
  view: async (storyId) => {
    const response = await api.post(`/stories/${storyId}/view`)
    return response.data
  },

  // Get viewer list + count for a story you own
  getViewers: async (storyId) => {
    const response = await api.get(`/stories/${storyId}/viewers`)
    return response.data
  },

  getActive: async (userIds = [], params = {}) => {
    const response = await api.get('/stories', {
      params: {
        page: 1,
        per_page: 50,
        active_only: true,
      },
    })
    return response.data
  },

  delete: async (storyId) => {
    const response = await api.delete(`/stories/${storyId}`)
    return response.data
  },
}


// ─── User Social API  (backend: /api/user-social) ─────────────────────────────
export const userSocialAPI = {
  // FIX: no request body needed — backend reads current_user_id from JWT
  followUser: async (userId) => {
    const response = await api.post(`/user-social/${userId}/follow`)
    return response.data
  },

  unfollowUser: async (userId) => {
    const response = await api.post(`/user-social/${userId}/unfollow`)
    return response.data
  },

  getFollowers: async (userId, params = {}) => {
    const response = await api.get(`/user-social/${userId}/followers`, {
      params: { page: params.page || 1, per_page: params.per_page || 10 },
    })
    return response.data
  },

  getFollowing: async (userId, params = {}) => {
    const response = await api.get(`/user-social/${userId}/following`, {
      params: { page: params.page || 1, per_page: params.per_page || 10 },
    })
    return response.data
  },

  likePost: async (userId, postId) => {
    const response = await api.post(`/user-social/${userId}/like-post`, { post_id: postId })
    return response.data
  },

  unlikePost: async (userId, postId) => {
    const response = await api.post(`/user-social/${userId}/unlike-post`, { post_id: postId })
    return response.data
  },

  savePost: async (_userId, postId) => {
    const response = await api.post(`/posts/${postId}/save`)
    return response.data
  },

  unsavePost: async (_userId, postId) => {
    const response = await api.post(`/posts/${postId}/unsave`)
    return response.data
  },

  blockUser: async (userId, blockedUserId) => {
    const response = await api.post(`/user-social/${userId}/block/${blockedUserId}`)
    return response.data
  },

  unblockUser: async (userId, blockedUserId) => {
    const response = await api.post(`/user-social/${userId}/unblock/${blockedUserId}`)
    return response.data
  },

  muteUser: async (userId, mutedUserId) => {
    const response = await api.post(`/user-social/${userId}/mute/${mutedUserId}`)
    return response.data
  },

  unmuteUser: async (userId, mutedUserId) => {
    const response = await api.post(`/user-social/${userId}/unmute/${mutedUserId}`)
    return response.data
  },

  updatePreferences: async (userId, preferences) => {
    const response = await api.put(`/user-social/${userId}/preferences`, preferences)
    return response.data
  },

  updateInterestTags: async (userId, tags) => {
    const response = await api.put(`/user-social/${userId}/interest-tags`, { tags })
    return response.data
  },

  updateMatchPreferences: async (userId, preferences) => {
    const response = await api.put(`/user-social/${userId}/match-preferences`, { preferences })
    return response.data
  },

  getSocialProfile: async (userId) => {
    const response = await api.get(`/user-social/${userId}`)
    return response.data
  },

  createSocialProfile: async (userId) => {
    const response = await api.post(`/user-social/${userId}`)
    return response.data
  },

  updatePrivacySettings: async (userId, settings) => {
    const response = await api.put(`/user-social/${userId}/privacy`, settings)
    return response.data
  },

  getEngagementRate: async (userId) => {
    const response = await api.get(`/user-social/${userId}/engagement-rate`)
    return response.data
  },

  getSuggestions: async (limit = 5) => {
    const response = await api.get('/user-social/suggestions', { params: { limit } })
    return response.data
  },

  searchUsers: async (query, params = {}) => {
    const response = await api.get('/users', {
      params: { search: query, page: params.page || 1, per_page: params.per_page || 10, ...params },
    })
    return response.data
  },
}

export default api
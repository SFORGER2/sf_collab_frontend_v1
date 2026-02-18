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
export const postsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/posts', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        user_id: params.userId,
        author_id: params.authorId,
        type: params.postType,
        search: params.search,
        include_comments: params.includeComments || false,
        include_media: params.includeMedia || false,
        current_user_id: params.currentUserId,
        ...params,
      },
    })
    return response.data
  },

  getById: async (postId, params = {}) => {
    const response = await api.get(`/api/posts/${postId}`, {
      params: {
        include_comments: params.includeComments || false,
        include_media: params.includeMedia || false,
        current_user_id: params.currentUserId,
      },
    })
    return response.data
  },

  create: async (postData) => {
    const response = await api.post('/api/posts', postData)
    return response.data
  },

  update: async (postId, postData) => {
    const response = await api.put(`/api/posts/${postId}`, postData)
    return response.data
  },

  delete: async (postId) => {
    const response = await api.delete(`/api/posts/${postId}`)
    return response.data
  },

  like: async (postId, userId) => {
    const response = await api.post(`/api/posts/${postId}/like`, { user_id: userId })
    return response.data
  },

  unlike: async (postId, userId) => {
    const response = await api.post(`/api/posts/${postId}/unlike`, { user_id: userId })
    return response.data
  },

  addTag: async (postId, tag) => {
    const response = await api.post(`/api/posts/${postId}/tags`, { tag })
    return response.data
  },
}

// Post Comments API
export const postCommentsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/post-comments', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 20,
        post_id: params.postId,
        author_id: params.authorId,
        ...params,
      },
    })
    return response.data
  },

  getById: async (commentId) => {
    const response = await api.get(`/api/post-comments/${commentId}`)
    return response.data
  },

  create: async (commentData) => {
    const response = await api.post('/api/post-comments', commentData)
    return response.data
  },

  update: async (commentId, content) => {
    const response = await api.put(`/api/post-comments/${commentId}`, { content })
    return response.data
  },

  delete: async (commentId) => {
    const response = await api.delete(`/api/post-comments/${commentId}`)
    return response.data
  },
}

// Post Media API
export const postMediaAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/post-media', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 20,
        post_id: params.postId,
        media_type: params.mediaType,
        ...params,
      },
    })
    return response.data
  },

  getById: async (mediaId) => {
    const response = await api.get(`/api/post-media/${mediaId}`)
    return response.data
  },

  create: async (mediaData) => {
    const response = await api.post('/api/post-media', mediaData)
    return response.data
  },

  updateCaption: async (mediaId, caption) => {
    const response = await api.put(`/api/post-media/${mediaId}/caption`, { caption })
    return response.data
  },

  delete: async (mediaId) => {
    const response = await api.delete(`/api/post-media/${mediaId}`)
    return response.data
  },
}
// User Social API
export const userSocialAPI = {
  followUser: async (userId) => {
    const response = await api.post(`/api/user-social/${userId}/follow`)
    return response.data
  },

  unfollowUser: async (userId) => {
    const response = await api.post(`/api/user-social/${userId}/unfollow`)
    return response.data
  },

  getFollowers: async (userId, params = {}) => {
    const response = await api.get(`/api/user-social/${userId}/followers`, {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        ...params,
      },
    })
    return response.data
  },

  getFollowing: async (userId, params = {}) => {
    const response = await api.get(`/api/user-social/${userId}/following`, {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        ...params,
      },
    })
    return response.data
  },

  likePost: async (userId, postId) => {
    const response = await api.post(`/api/user-social/${userId}/like-post`, { post_id: postId })
    return response.data
  },

  unlikePost: async (userId, postId) => {
    const response = await api.post(`/api/user-social/${userId}/unlike-post`, { post_id: postId })
    return response.data
  },

  savePost: async (userId, postId) => {
    const response = await api.post(`/api/user-social/${userId}/save-post`, { post_id: postId })
    return response.data
  },

  unsavePost: async (userId, postId) => {
    const response = await api.post(`/api/user-social/${userId}/unsave-post`, { post_id: postId })
    return response.data
  },

  blockUser: async (userId, blockedUserId) => {
    const response = await api.post(`/api/user-social/${userId}/block/${blockedUserId}`)
    return response.data
  },

  unblockUser: async (userId, blockedUserId) => {
    const response = await api.post(`/api/user-social/${userId}/unblock/${blockedUserId}`)
    return response.data
  },

  muteUser: async (userId, mutedUserId) => {
    const response = await api.post(`/api/user-social/${userId}/mute/${mutedUserId}`)
    return response.data
  },

  unmuteUser: async (userId, mutedUserId) => {
    const response = await api.post(`/api/user-social/${userId}/unmute/${mutedUserId}`)
    return response.data
  },

  updatePreferences: async (userId, preferences) => {
    const response = await api.put(`/api/user-social/${userId}/preferences`, preferences)
    return response.data
  },

  updateInterestTags: async (userId, tags) => {
    const response = await api.put(`/api/user-social/${userId}/interest-tags`, { tags })
    return response.data
  },

  updateMatchPreferences: async (userId, preferences) => {
    const response = await api.put(`/api/user-social/${userId}/match-preferences`, { preferences })
    return response.data
  },

  getSocialProfile: async (userId) => {
    const response = await api.get(`/api/user-social/${userId}`)
    return response.data
  },

  updatePrivacySettings: async (userId, settings) => {
    const response = await api.put(`/api/user-social/${userId}/privacy`, settings)
    return response.data
  },

  getEngagementRate: async (userId) => {
    const response = await api.get(`/api/user-social/${userId}/engagement-rate`)
    return response.data
  },

  getUserSocialData: async (userId) => {
    const response = await api.get(`/api/user-social/${userId}/data`)
    return response.data
  },


  isFollowing: async (userId) => {
    const response = await api.get(`/api/profile/${userId}/is-following`)
    return response.data
  },

  // Explore and feed endpoints
  getExplorePosts: async (params = {}) => {
    const response = await api.get('/api/profile/explore', {
      params: {
        page: params.page || 1,
        per_page: params.limit || 10,
        ...params,
      },
    })
    return response.data
  },

  getFeedPosts: async (params = {}) => {
    const response = await api.get('/api/profile/posts', {
      params: {
        page: params.page || 1,
        per_page: params.limit || 10,
        ...params,
      },
    })
    return response.data
  },

  getSuggestions: async (limit = 5) => {
    const response = await api.get('/api/profile/suggestions', {
      params: { limit },
    })
    return response.data
  },

  createStory: async (payload = {}) => {
    const response = await api.post('/api/profile/stories', payload)
    return response.data
  },
  getStories: async (params = {}) => {
    const response = await api.get('/api/profile/stories', { params })
    return response.data
  },

  // Delete post
  deletePost: async (postId) => {
    const response = await api.delete(`/api/profile/posts/${postId}`)
    return response.data
  },

  // Edit post
  editPost: async (postId, { caption }) => {
    const response = await api.patch(`/api/profile/posts/${postId}`, { caption })
    return response.data
  },

  // Get saved posts
  getSavedPosts: async (params = {}) => {
    const response = await api.get('/api/profile/saved-posts', { params })
    return response.data
  },

  // Comments
  addComment: async (postId, { text }) => {
    const response = await api.post(`/api/profile/posts/${postId}/comments`, { text })
    return response.data
  },

  getComments: async (postId, params = {}) => {
    const response = await api.get(`/api/profile/posts/${postId}/comments`, { params })
    return response.data
  },

  deleteComment: async (postId, commentId) => {
    const response = await api.delete(`/api/profile/posts/${postId}/comments/${commentId}`)
    return response.data
  },

  // Search users
  searchUsers: async (q) => {
    const response = await api.get('/api/profile/search', { params: { q } })
    return response.data
  },
}

export default api
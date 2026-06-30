import api from './interceptors';

const followAPI = {
  follow: (userId) => api.post(`/user_social/${userId}/follow`, {}),
  unfollow: (userId) => api.post(`/user_social/${userId}/unfollow`, {}),
  getFollowers: (userId, params) => api.get(`/user_social/${userId}/followers`, { params }),
  getFollowing: (userId, params) => api.get(`/user_social/${userId}/following`, { params }),
  getFollowStatus: (userId) => api.get(`/user_social/${userId}/follow-status`),
};

export default followAPI;
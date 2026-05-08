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

// Chat API
export const chatAPI = {
  // Conversations
  getAllChats: async () => {
    const response = await api.get("/chat/conversations");
    return response.data;
  },

  getConversationById: async (conversationId) => {
    const response = await api.get(`/chat/conversations/${conversationId}`);
    return response.data;
  },
  createConversation: async ({ participantIds, name = null, conversationType = "group", description = null, avatarUrl = null }) => {
    const response = await api.post("/chat/conversations", {
      participant_ids: participantIds,
      name,
      conversation_type: conversationType,
      description,
      avatar_url: avatarUrl
    });
    return response.data;
  },
  createDirectConversation: async (otherUserId) => {
    const response = await api.post("/chat/conversations/with-user", {
      other_user_id: otherUserId
    });
    return response.data;
  },

  createGroupConversation: async (name, participantUserIds) => {
    const response = await api.post("/chat/conversations/group", {
      name,
      participant_user_ids: participantUserIds
    });
    return response.data;
  },

  markConversationRead: async (conversationId) => {
    const response = await api.post(`/chat/conversations/${conversationId}/mark-read`);
    return response.data;
  },
  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  // Messages
  getMessages: async (conversationId, limit = 50, offset = 0) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
      params: { limit, offset },
    });
    return response.data;
  },

  sendMessage: async (conversationId, content, replyToId = null) => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
      content,
      message_type: "text",
      reply_to_id: replyToId,
    });
    return response.data;
  },

  sendDirectMessage: async (recipientUserId, content) => {
    const response = await api.post("/chat/direct", {
      recipient_user_id: recipientUserId,
      content
    });
    return response.data;
  },

  sendFileMessage: async (conversationId, file, messageContent = null, contentType) => {
    const formData = new FormData();
    formData.append('content', messageContent || 'Sent a file');
    formData.append('message_type', 'file');
    formData.append('file', file);

    const response = await api.post(
      `/chat/conversations/${conversationId}/messages`,
      formData,
      {
        headers: {
          'Content-Type': contentType,
        },
      }
    );
    return response.data;
  },

  editMessage: async (conversationId, messageId, content) => {
    const response = await api.put(`/chat/conversations/${conversationId}/messages/${messageId}`, {
      content
    });
    return response.data;
  },

  deleteMessage: async (conversationId, messageId, deleteType = 'everyone') => {
    const response = await api.delete(`/chat/conversations/${conversationId}/messages/${messageId}`, {
      data: { delete_type: deleteType }
    });
    return response.data;
  },

  reactToMessage: async (conversationId, messageId, emoji) => {
    const response = await api.post(
      `/chat/conversations/${conversationId}/messages/${messageId}/reactions`,
      { emoji }
    );
    return response.data;
  },

  // Files
  uploadFile: async (conversationId, file, content = "") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("content", content);
    formData.append("message_type", file.type.startsWith('image/') ? 'image' : 'file');

    const response = await api.post(`/chat/conversations/${conversationId}/messages`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getConversationFiles: async (conversationId) => {
    const response = await api.get(`/chat/conversations/${conversationId}/files`);
    return response.data;
  },

  // Participants
  addParticipant: async (conversationId, userId, role = "member") => {
    const response = await api.post(`/chat/conversations/${conversationId}/participants`, {
      user_id: userId,
      role
    });
    return response.data;
  },

  removeParticipant: async (conversationId, userId) => {
    const response = await api.delete(`/chat/conversations/${conversationId}/participants/${userId}`);
    return response.data;
  },

  // General Chat
  getGeneralChat: async () => {
    const response = await api.get("/chat/general");
    return response.data;
  },

  setupGeneralChat: async () => {
    const response = await api.post("/chat/setup-general-chat");
    return response.data;
  },

  // Leave a group conversation
  leaveConversation: async (conversationId) => {
    const response = await api.post(`/chat/conversations/${conversationId}/leave`);
    return response.data;
  },

  // Archive a conversation (hide from list)
  archiveConversation: async (conversationId) => {
    const response = await api.post(`/chat/conversations/${conversationId}/archive`);
    return response.data;
  },

  // Unarchive a conversation
  unarchiveConversation: async (conversationId) => {
    const response = await api.post(`/chat/conversations/${conversationId}/unarchive`);
    return response.data;
  },

  // Get archived conversations
  getArchivedConversations: async () => {
    const response = await api.get("/chat/conversations?include_archived=true");
    return response.data;
  },

  // Pin a conversation (persists per-user in DB, like WhatsApp)
  pinConversation: async (conversationId) => {
    const response = await api.post(`/chat/conversations/${conversationId}/pin`);
    return response.data;
  },

  // Unpin a conversation
  unpinConversation: async (conversationId) => {
    const response = await api.delete(`/chat/conversations/${conversationId}/pin`);
    return response.data;
  },

};

export default api;
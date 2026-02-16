import apiClient from './api';

export const messageService = {
  getMessages: async (conversationId) => {
    const response = await apiClient.get(`/messages?conversationId=${conversationId}`);
    return response.data;
  },

  sendMessage: async (conversationId, text, attachments = []) => {
    const payload = {
      conversationId,
    };
    
    if (text && text.trim()) {
      payload.text = text;
    }
    
    if (attachments && attachments.length > 0) {
      payload.attachments = attachments;
    }
    
    const response = await apiClient.post('/messages', payload);
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await apiClient.delete(`/messages/${messageId}`);
    return response.data;
  },
  clearConversation: async (conversationId) => {
    const response = await apiClient.delete(`/messages/conversation/${conversationId}`);
    return response.data;
  },

  markMessageAsRead: async (messageId) => {
    const response = await apiClient.put(`/messages/${messageId}/read`);
    return response.data;
  },

  markConversationAsRead: async (conversationId) => {
    const response = await apiClient.put(`/messages/mark-read/${conversationId}`);
    return response.data;
  },
};

export default messageService;

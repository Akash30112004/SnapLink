import apiClient from './api';

export const conversationService = {
  getConversations: async () => {
    const response = await apiClient.get('/conversations');
    return response.data;
  },

  startConversation: async (members, isGroup = false) => {
    const response = await apiClient.post('/conversations/start', {
      members,
      isGroup,
    });
    return response.data;
  },

  createGroup: async (name, memberIds, description = '') => {
    const response = await apiClient.post('/conversations/create-group', {
      name,
      memberIds,
      description,
    });
    return response.data;
  },

  getUserGroups: async (userId) => {
    const response = await apiClient.get(`/conversations/groups/${userId}`);
    return response.data;
  },

  getGroupById: async (groupId) => {
    const response = await apiClient.get(`/conversations/group/${groupId}`);
    return response.data;
  },

  addGroupMembers: async (groupId, memberIds) => {
    const response = await apiClient.post(`/conversations/add-members/${groupId}`, {
      memberIds,
    });
    return response.data;
  },

  removeGroupMember: async (groupId, memberId) => {
    const response = await apiClient.delete(`/conversations/member/${groupId}/${memberId}`);
    return response.data;
  },

  updateGroup: async (groupId, updates) => {
    const response = await apiClient.put(`/conversations/update/${groupId}`, updates);
    return response.data;
  },

  deleteGroup: async (groupId) => {
    const response = await apiClient.delete(`/conversations/${groupId}`);
    return response.data;
  },

  leaveGroup: async (groupId) => {
    const response = await apiClient.put(`/conversations/leave/${groupId}`);
    return response.data;
  },
};

export default conversationService;

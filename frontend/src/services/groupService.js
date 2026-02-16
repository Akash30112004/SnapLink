import apiClient from './api';
import { STORAGE_KEYS } from '../utils/constants';

export const groupService = {
  createGroup: async (name, members, avatar = '') => {
    const response = await apiClient.post('/groups', {
      name,
      members,
      avatar,
    });
    return response.data;
  },

  getGroups: async () => {
    // Get current user from localStorage
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (!storedUser) {
      throw new Error('User not authenticated');
    }
    const userData = JSON.parse(storedUser);
    const userId = userData._id || userData.id;
    
    // Fetch groups from conversations endpoint (uses Conversation model)
    const response = await apiClient.get(`/conversations/groups/${userId}`);
    return response.data;
  },

  getGroupById: async (id) => {
    const response = await apiClient.get(`/groups/${id}`);
    return response.data;
  },
};

export default groupService;

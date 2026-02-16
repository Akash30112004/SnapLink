import apiClient from './api';

export const userService = {
  getUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await apiClient.get(`/users/search?query=${query}`);
    return response.data;
  },

  blockUser: async (userId) => {
    const response = await apiClient.post('/users/block', { userId });
    return response.data;
  },

  unblockUser: async (userId) => {
    const response = await apiClient.post('/users/unblock', { userId });
    return response.data;
  },

  checkBlockStatus: async (userId) => {
    const response = await apiClient.get(`/users/block-status/${userId}`);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  toggleFavoriteUser: async (userId) => {
    const response = await apiClient.post('/users/favorite-user', { userId });
    return response.data;
  },

  toggleFavoriteConversation: async (conversationId) => {
    const response = await apiClient.post('/users/favorite-conversation', { conversationId });
    return response.data;
  },

  uploadProfilePic: async (file) => {
    const formData = new FormData();
    formData.append('profilePic', file);

    const response = await apiClient.put('/users/profile-pic', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  removeProfilePic: async () => {
    const response = await apiClient.delete('/users/profile-pic');
    return response.data;
  },
};

export default userService;

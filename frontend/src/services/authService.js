import apiClient from './api';

export const authService = {
  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('snaplink_token', response.data.token);
      localStorage.setItem('snaplink_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (data) => {
    const response = await apiClient.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('snaplink_token', response.data.token);
      localStorage.setItem('snaplink_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  me: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('snaplink_token');
    localStorage.removeItem('snaplink_user');
  },

  // Forgot Password API methods
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await apiClient.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', { 
      email, 
      otp, 
      newPassword 
    });
    return response.data;
  },

  // Change Password (for logged-in users)
  changePassword: async (newPassword) => {
    const response = await apiClient.post('/auth/change-password', { newPassword });
    return response.data;
  },
};

export default authService;

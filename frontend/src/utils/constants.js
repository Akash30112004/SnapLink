// API endpoint constants
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Route constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHAT: '/chat',
  FORGOT_PASSWORD: '/forgot-password',
};

// Socket events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'snaplink_token',
  USER: 'snaplink_user',
  THEME: 'snaplink_theme',
  SETTINGS: 'snaplink_settings',
  MUTED_CONVERSATIONS: 'snaplink_muted_conversations',
};

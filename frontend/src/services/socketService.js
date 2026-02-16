import io from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from '../utils/constants';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.disconnectTimer = null; // For handling React Strict Mode
  }

  connect(userId) {
    if (this.socket?.connected) {
      console.log('🔌 Socket already connected:', this.socket.id);
      return this.socket;
    }

    if (!userId) {
      console.error('Cannot connect socket: userId is required');
      return null;
    }

    console.log('🔌 Connecting socket for user:', userId);
    this.socket = io(SOCKET_URL, {
      auth: { userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      this.isConnected = true;
      console.log('Socket connected:', this.socket?.id || 'unknown');
    });

    this.socket.on('connected', (data) => {
      console.log('Server confirmed connection:', data);
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      this.isConnected = false;
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer);
      this.disconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  emit(event, data, callback) {
    if (this.socket) {
      this.socket.emit(event, data, callback);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Conversation events
  joinConversation(conversationId) {
    console.log('🔌 Joining conversation room:', conversationId);
    console.log('   Socket connected?', !!this.socket?.connected);
    console.log('   Socket ID:', this.socket?.id);
    this.emit('join_conversation', conversationId);
  }

  // Message events
  sendMessage(payload) {
    this.emit('send_message', payload);
  }

  onReceiveMessage(callback) {
    console.log('👂 Registering receive_message listener');
    console.log('   Socket exists?', !!this.socket);
    console.log('   Socket connected?', !!this.socket?.connected);
    this.on('receive_message', callback);
  }

  offReceiveMessage() {
    this.off('receive_message');
  }

  // Typing events
  sendTyping(payload) {
    this.emit(SOCKET_EVENTS.TYPING, payload);
  }

  sendStopTyping(payload) {
    this.emit(SOCKET_EVENTS.STOP_TYPING, payload);
  }

  onTyping(callback) {
    this.on(SOCKET_EVENTS.TYPING, callback);
  }

  onStopTyping(callback) {
    this.on(SOCKET_EVENTS.STOP_TYPING, callback);
  }

  // User presence events
  onUserOnline(callback) {
    this.on(SOCKET_EVENTS.USER_ONLINE, callback);
  }

  onUserOffline(callback) {
    this.on(SOCKET_EVENTS.USER_OFFLINE, callback);
  }

  offUserOnline() {
    this.off(SOCKET_EVENTS.USER_ONLINE);
  }

  offUserOffline() {
    this.off(SOCKET_EVENTS.USER_OFFLINE);
  }

  getOnlineUsers(callback) {
    this.emit('get_online_users');
    this.on('online_users', callback);
  }

  // Profile update events
  emitProfileUpdate(payload) {
    this.emit('profile_updated', payload);
  }

  onProfileUpdate(callback) {
    this.on('user_profile_updated', callback);
  }

  offProfileUpdate() {
    this.off('user_profile_updated');
  }

  // Emoji reaction events
  emitAddReaction(payload) {
    this.emit('add_reaction', payload);
  }

  emitRemoveReaction(payload) {
    this.emit('remove_reaction', payload);
  }

  onReactionAdded(callback) {
    this.on('reaction_added', callback);
  }

  onReactionRemoved(callback) {
    this.on('reaction_removed', callback);
  }

  offReactionAdded() {
    this.off('reaction_added');
  }

  offReactionRemoved() {
    this.off('reaction_removed');
  }

  // Messages seen events
  emitMarkAsRead(payload) {
    this.emit('mark_as_read', payload);
  }

  onMessagesSeen(callback) {
    this.on('messages_seen', callback);
  }

  offMessagesSeen() {
    this.off('messages_seen');
  }
}

export default new SocketService();

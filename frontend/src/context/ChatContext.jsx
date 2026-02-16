import { createContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSocket } from '../hooks/useSocket';

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { socket, socketService } = useSocket();
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  // Set active chat
  const selectChat = useCallback((userId) => {
    setActiveChat(userId);
    // Mark messages as read
    if (unreadCounts[userId]) {
      setUnreadCounts(prev => ({
        ...prev,
        [userId]: 0,
      }));
    }
  }, [unreadCounts]);

  // Add message to a chat
  const addMessage = useCallback((userId, message) => {
    setMessages(prev => ({
      ...prev,
      [userId]: [...(prev[userId] || []), message],
    }));

    // Increment unread count if not active chat
    if (activeChat !== userId && message.senderId !== 'me') {
      setUnreadCounts(prev => ({
        ...prev,
        [userId]: (prev[userId] || 0) + 1,
      }));
    }
  }, [activeChat]);

  // Set all messages for a chat
  const setMessagesForChat = useCallback((userId, chatMessages) => {
    setMessages(prev => ({
      ...prev,
      [userId]: chatMessages,
    }));
  }, []);

  // Get messages for a chat
  const getMessagesForChat = useCallback((userId) => {
    return messages[userId] || [];
  }, [messages]);

  // Typing indicators
  const setUserTyping = useCallback((userId, isTyping) => {
    setTypingUsers(prev => ({
      ...prev,
      [userId]: isTyping,
    }));
  }, []);

  const isUserTyping = useCallback((userId) => {
    return typingUsers[userId] || false;
  }, [typingUsers]);

  // Clear chat
  const clearChat = useCallback((userId) => {
    setMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[userId];
      return newMessages;
    });
  }, []);

  // Clear all chats
  const clearAllChats = useCallback(() => {
    setMessages({});
    setActiveChat(null);
    setTypingUsers({});
    setUnreadCounts({});
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      const chatId = message.senderId || message.from || message.userId;
      if (!chatId) return;
      const normalized = {
        ...message,
        senderId: message.senderId || message.from || message.userId,
        timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
      };
      addMessage(chatId, normalized);
    };

    const handleTyping = (data) => {
      const userId = data?.userId || data?.from;
      if (!userId) return;
      setUserTyping(userId, true);
    };

    const handleStopTyping = (data) => {
      const userId = data?.userId || data?.from;
      if (!userId) return;
      setUserTyping(userId, false);
    };

    socketService.onMessage(handleMessage);
    socketService.onTyping(handleTyping);
    socketService.onStopTyping(handleStopTyping);

    return () => {
      socketService.off('message', handleMessage);
      socketService.off('typing', handleTyping);
      socketService.off('stop_typing', handleStopTyping);
    };
  }, [socket, socketService, addMessage, setUserTyping]);

  const value = {
    activeChat,
    messages,
    typingUsers,
    unreadCounts,
    selectChat,
    addMessage,
    setMessagesForChat,
    getMessagesForChat,
    setUserTyping,
    isUserTyping,
    clearChat,
    clearAllChats,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

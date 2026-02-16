import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import socketService from '../services/socketService';
import { useAuth } from '../hooks/useAuth';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to socket
      const socketInstance = socketService.connect(token);
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });
    } else {
      // Disconnect if not authenticated
      if (socket) {
        socketService.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }

    return () => {
      // Cleanup listeners
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, [isAuthenticated, token, socket]);

  const value = {
    socket,
    isConnected,
    socketService,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

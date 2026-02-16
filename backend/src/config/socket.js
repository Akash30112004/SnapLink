const { Server } = require('socket.io');
const socketHandlers = require('../socket/socket.handlers');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;

    if (userId) {
      // Store userId as string to ensure consistent lookups
      const userIdStr = userId.toString();
      onlineUsers.set(userIdStr, socket.id);
      console.log(`✅ User connected: ${userIdStr} -> Socket: ${socket.id}`);
      io.emit('user_online', { userId: userIdStr });
    }

    socket.emit('connected', { message: 'Socket connected' });
    socketHandlers(io, socket, onlineUsers);

    socket.on('disconnect', () => {
      if (userId) {
        const userIdStr = userId.toString();
        onlineUsers.delete(userIdStr);
        console.log(`❌ User disconnected: ${userIdStr}`);
        io.emit('user_offline', { userId: userIdStr });
      }
    });
  });

  // Store onlineUsers Map on io instance for access in controllers
  io.onlineUsers = onlineUsers;

  return io;
};

module.exports = initSocket;

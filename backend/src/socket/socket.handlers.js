const Message = require('../models/Message');

const socketHandlers = async (io, socket, onlineUsers) => {
  socket.on('join_conversation', (conversationId) => {
    if (!conversationId) return;
    console.log(`✅ Socket ${socket.id} joined room: ${conversationId}`);
    socket.join(conversationId);
  });

  socket.on('send_message', async (payload = {}) => {
    if (!payload.conversationId) return;
    
    console.log('📤 Broadcasting message to room:', payload.conversationId);
    
    // Emit to all clients in that conversation room (including sender)
    io.to(payload.conversationId).emit('receive_message', payload);
    
    // Also verify message is in database
    if (payload.message?._id) {
      try {
        const savedMsg = await Message.findById(payload.message._id)
          .populate('sender', 'name email avatar');
        if (savedMsg) {
          console.log('✓ Message verified in database:', savedMsg._id);
        }
      } catch (error) {
        console.error('Error verifying message:', error.message);
      }
    }
  });

  socket.on('typing', (payload = {}) => {
    if (!payload.conversationId) return;
    socket.to(payload.conversationId).emit('typing', payload);
  });

  socket.on('stop_typing', (payload = {}) => {
    if (!payload.conversationId) return;
    socket.to(payload.conversationId).emit('stop_typing', payload);
  });

  socket.on('get_online_users', () => {
    const users = Array.from(onlineUsers.keys());
    socket.emit('online_users', { users });
  });

  socket.on('profile_updated', (payload = {}) => {
    console.log('📢 Broadcasting profile update:', payload.userId);
    // Broadcast to all connected clients except sender
    socket.broadcast.emit('user_profile_updated', payload);
  });

  // Emoji reaction events
  socket.on('add_reaction', (payload = {}) => {
    const { messageId, conversationId, emoji, userId } = payload;
    if (!messageId || !conversationId) return;
    
    console.log('😊 Reaction added event:', { messageId, emoji, userId });
    // Broadcast reaction to all users in the conversation
    io.to(conversationId).emit('reaction_added', payload);
  });

  socket.on('remove_reaction', (payload = {}) => {
    const { messageId, conversationId, emoji, userId } = payload;
    if (!messageId || !conversationId) return;
    
    console.log('😒 Reaction removed event:', { messageId, emoji, userId });
    // Broadcast reaction removal to all users in the conversation
    io.to(conversationId).emit('reaction_removed', payload);
  });

  // Mark conversation as read
  socket.on('mark_as_read', async (payload = {}) => {
    const { conversationId, userId } = payload;
    if (!conversationId || !userId) return;

    console.log(`📖 Mark as read event: conversation=${conversationId}, user=${userId}`);
    
    try {
      // Update all messages in conversation to mark as read by this user
      const result = await Message.updateMany(
        {
          conversationId,
          sender: { $ne: userId } // Don't update own messages
        },
        {
          $addToSet: { readBy: userId }
        }
      );

      // Fetch all updated messages
      const messages = await Message.find({ conversationId })
        .populate('sender', 'name email avatar');

      // Emit back to the conversation room that messages have been seen
      io.to(conversationId).emit('messages_seen', {
        conversationId,
        userId,
        modifiedCount: result.modifiedCount,
        messages
      });

      console.log(`✅ Marked ${result.modifiedCount} messages as read`);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  });
};

module.exports = socketHandlers;

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Group = require('../models/Group');
const User = require('../models/User');
const { generateAIReply } = require('../services/aiService');
const ensureBotUser = require('../utils/ensureBotUser');

const BOT_EMAIL = 'snaplinkai@bot.com';
const MAX_AI_MESSAGES_PER_DAY = 20;
const MAX_AI_PROMPT_LENGTH = 1000; // Increased for Llama 3

const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.query;

    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId is required' });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email avatar');
    return res.status(200).json({ messages });
  } catch (error) {
    return next(error);
  }
};

const createMessage = async (req, res, next) => {
  try {
    const { conversationId, text, attachments } = req.body;
    const sender = req.user.id;

    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId is required' });
    }

    // Validate that either text or attachments are provided
    if (!text && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: 'Either text or attachments are required' });
    }

    // Check if this is a one-on-one conversation and verify block status
    const conversation = await Conversation.findById(conversationId);
    if (conversation && !conversation.isGroup && conversation.members) {
      // Find the recipient (the other member in the conversation)
      const recipient = conversation.members.find(
        (memberId) => memberId.toString() !== sender
      );

      if (recipient) {
        // Check if sender has blocked the recipient
        const senderUser = await User.findById(sender).select('blockedUsers');
        const hasBlockedRecipient = senderUser.blockedUsers.some(
          (id) => id.toString() === recipient.toString()
        );

        if (hasBlockedRecipient) {
          return res.status(403).json({ 
            message: 'You have blocked this user. Unblock them to send messages.',
            isBlocked: true,
            blockedByYou: true
          });
        }

        // Check if recipient has blocked the sender
        const recipientUser = await User.findById(recipient).select('blockedUsers');
        const isBlockedByRecipient = recipientUser.blockedUsers.some(
          (id) => id.toString() === sender
        );

        if (isBlockedByRecipient) {
          return res.status(403).json({ 
            message: 'You cannot send messages to this user.',
            isBlocked: true,
            blockedByThem: true
          });
        }
      }
    }

    const messageData = {
      sender,
      conversationId,
      readBy: [sender],
    };

    // Add text if provided
    if (text) {
      messageData.text = text;
    }

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      messageData.attachments = attachments;
    }

    const message = await Message.create(messageData);

    // Populate sender info before returning
    await message.populate('sender', 'name email avatar');

    // Check if this is a group message to set proper fields
    const group = await Group.findById(conversationId);
    
    // Create last message preview
    let lastMessagePreview = text || '';
    if (attachments && attachments.length > 0) {
      const attachmentTypes = attachments.map(a => a.type);
      const imageCount = attachmentTypes.filter(t => t === 'image').length;
      const videoCount = attachmentTypes.filter(t => t === 'video').length;
      
      if (imageCount > 0 && videoCount > 0) {
        lastMessagePreview = `📎 ${imageCount} photo(s), ${videoCount} video(s)${text ? ': ' + text : ''}`;
      } else if (imageCount > 0) {
        lastMessagePreview = `📷 ${imageCount} photo${imageCount > 1 ? 's' : ''}${text ? ': ' + text : ''}`;
      } else if (videoCount > 0) {
        lastMessagePreview = `🎥 ${videoCount} video${videoCount > 1 ? 's' : ''}${text ? ': ' + text : ''}`;
      }
    }

    const updateData = {
      lastMessage: lastMessagePreview,
      lastMessageTime: message.createdAt,
      lastMessageSender: message.sender?.name || 'Someone',
    };

    // If it's a group, ensure the conversation has proper group data
    if (group) {
      updateData.isGroup = true;
      updateData.members = group.members;
    }

    // Update or create conversation with last message info (upsert for groups)
    await Conversation.findByIdAndUpdate(
      conversationId,
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // If recipient is bot, generate AI reply and store it
    if (conversation && !conversation.isGroup && conversation.members) {
      const recipientId = conversation.members.find(
        (memberId) => memberId.toString() !== sender
      );

      if (recipientId && text && text.trim()) {
        const recipientUser = await User.findById(recipientId).select('isBot email');
        const isBotRecipient = Boolean(recipientUser?.isBot || recipientUser?.email === BOT_EMAIL);

        if (isBotRecipient) {
          let botUser = await User.findOne({ email: BOT_EMAIL })
            .select('_id name email avatar');

          if (!botUser) {
            botUser = await ensureBotUser();
          }

          if (botUser) {
            const sendBotMessage = async (replyText) => {
              const trimmedReply = replyText.trim();
              if (!trimmedReply) return;

              const aiMessage = await Message.create({
                sender: botUser._id,
                conversationId,
                text: trimmedReply,
                readBy: [botUser._id],
              });

              await aiMessage.populate('sender', 'name email avatar');

              await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: trimmedReply,
                lastMessageTime: aiMessage.createdAt,
                lastMessageSender: botUser.name || 'SnapLink AI',
              });

              const io = req.app.get('io');
              if (io) {
                console.log('🤖 Emitting bot message via Socket.IO');
                console.log('   Room:', conversationId.toString());
                console.log('   Message ID:', aiMessage._id);
                console.log('   Text:', trimmedReply.substring(0, 50) + '...');
                console.log('   Socket.IO instance exists:', !!io);
                console.log('   Number of sockets in room:', io.sockets.adapter.rooms.get(conversationId.toString())?.size || 0);
                
                io.to(conversationId.toString()).emit('receive_message', {
                  conversationId: conversationId.toString(),
                  message: aiMessage,
                });
                console.log('✅ Bot message emitted successfully');
              } else {
                console.error('❌ Socket.IO instance not found!');
              }
            };

            const trimmedPrompt = text.trim();

            if (trimmedPrompt.length > MAX_AI_PROMPT_LENGTH) {
              console.warn('AI prompt too long, sending warning');
              await sendBotMessage(`Your message is too long. Please keep it under ${MAX_AI_PROMPT_LENGTH} characters.`);
              return res.status(201).json({ message });
            }

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const aiCountToday = await Message.countDocuments({
              conversationId,
              sender: botUser._id,
              createdAt: { $gte: startOfDay },
            });

            if (aiCountToday >= MAX_AI_MESSAGES_PER_DAY) {
              console.warn('Daily AI limit reached for conversation:', conversationId);
              await sendBotMessage('Daily AI limit reached. Please try again tomorrow.');
              return res.status(201).json({ message });
            }

            // Generate AI reply using Ollama (non-blocking)
            // Send response immediately, process AI in background
            setImmediate(async () => {
              try {
                console.log('🤖 Requesting AI reply from Ollama...');
                const aiReply = await generateAIReply(trimmedPrompt);

                if (aiReply && aiReply.trim()) {
                  await sendBotMessage(aiReply);
                } else {
                  await sendBotMessage('I am not sure how to respond to that.');
                }
              } catch (aiError) {
                console.error('❌ AI reply failed:', aiError.message || aiError);
                
                // Send user-friendly error messages based on error type
                if (aiError.message.includes('unavailable') || aiError.message.includes('ECONNREFUSED')) {
                  await sendBotMessage('AI is currently unavailable. The local AI service may not be running.');
                } else if (aiError.message.includes('timeout') || aiError.message.includes('took too long')) {
                  await sendBotMessage('AI took too long to respond. Please try a shorter message.');
                } else {
                  await sendBotMessage('AI is temporarily unavailable. Please try again later.');
                }
              }
            });
          } else {
            console.warn('Bot user not found; AI reply skipped.');
          }
        }
      }
    }

    return res.status(201).json({ message });
  } catch (error) {
    return next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find message and verify sender
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: 'Cannot delete message sent by another user' });
    }

    const conversationId = message.conversationId;

    // Delete message
    await Message.findByIdAndDelete(id);

    // Find the new last message after deletion
    const lastMessage = await Message.findOne({ conversationId })
      .sort({ createdAt: -1 })
      .select('text attachments createdAt sender')
      .populate('sender', 'name');

    let lastMessagePreview = '';
    let lastMessageSender = '';
    if (lastMessage) {
      lastMessageSender = lastMessage.sender?.name || 'Someone';
      if (lastMessage.text) {
        lastMessagePreview = lastMessage.text;
      } else if (lastMessage.attachments && lastMessage.attachments.length > 0) {
        const imageCount = lastMessage.attachments.filter(a => a.type === 'image').length;
        const videoCount = lastMessage.attachments.filter(a => a.type === 'video').length;
        if (imageCount > 0 && videoCount > 0) {
          lastMessagePreview = `📎 ${imageCount} photo${imageCount > 1 ? 's' : ''}, ${videoCount} video${videoCount > 1 ? 's' : ''}`;
        } else if (imageCount > 0) {
          lastMessagePreview = `📷 ${imageCount} photo${imageCount > 1 ? 's' : ''}`;
        } else if (videoCount > 0) {
          lastMessagePreview = `🎥 ${videoCount} video${videoCount > 1 ? 's' : ''}`;
        }
      }
    }

    // Update conversation's lastMessage
    const Conversation = require('../models/Conversation');
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: lastMessagePreview,
      lastMessageSender: lastMessageSender,
      lastMessageTime: lastMessage ? lastMessage.createdAt : new Date(),
    });

    // Emit socket event to notify all users in the conversation
    const io = req.app.get('io');
    if (io) {
      io.to(conversationId.toString()).emit('message_deleted', {
        messageId: id,
        conversationId: conversationId.toString(),
        lastMessage: lastMessagePreview,
        lastMessageSender: lastMessageSender,
        lastMessageTime: lastMessage ? lastMessage.createdAt : new Date(),
      });
    }

    return res.status(200).json({ message: 'Message deleted' });
  } catch (error) {
    return next(error);
  }
};

const clearConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId is required' });
    }

    const conversation = await Conversation.findById(conversationId).select('members');
    let isMember = false;

    if (conversation) {
      isMember = conversation.members.some((member) => member.toString() === userId);
    } else {
      const group = await Group.findById(conversationId).select('members');
      if (!group) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      isMember = group.members.some((member) => member.toString() === userId);
    }

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to clear this chat' });
    }

    await Message.deleteMany({ conversationId });

    if (conversation) {
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: '',
        lastMessageTime: null,
      });
    }

    return res.status(200).json({ message: 'Chat cleared' });
  } catch (error) {
    return next(error);
  }
};

const markMessageAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    if (!messageId) {
      return res.status(400).json({ message: 'messageId is required' });
    }

    // Add user to readBy if not already there
    const message = await Message.findByIdAndUpdate(
      messageId,
      { 
        $addToSet: { readBy: userId }
      },
      { new: true }
    ).populate('sender', 'name email avatar');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    console.log('✅ Message marked as read:', messageId, 'readBy count:', message.readBy.length);
    return res.status(200).json({ message });
  } catch (error) {
    return next(error);
  }
};

const markConversationAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId is required' });
    }

    // Mark all messages in conversation as read by this user, excluding own messages
    const result = await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId } // Don't update own messages
      },
      {
        $addToSet: { readBy: userId }
      }
    );

    console.log(`✅ Marked ${result.modifiedCount} messages as read in conversation ${conversationId}`);
    
    // Fetch updated messages to send back
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email avatar');

    return res.status(200).json({ 
      message: 'Conversation marked as read',
      modifiedCount: result.modifiedCount,
      messages
    });
  } catch (error) {
    return next(error);
  }
};

// Add emoji reaction to message
const addReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    if (!messageId || !emoji) {
      return res.status(400).json({ message: 'messageId and emoji are required' });
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // First, remove this user's reaction from ALL other emojis (each user can only have 1 reaction)
    message.reactions = message.reactions
      .map(reaction => ({
        ...reaction,
        users: reaction.users.filter(id => id.toString() !== userId),
      }))
      .filter(reaction => reaction.users.length > 0);

    // Now handle the new emoji reaction
    const existingReaction = message.reactions.find(r => r.emoji === emoji);
    
    if (existingReaction) {
      // If user already reacted with this emoji, remove their reaction (toggle)
      if (existingReaction.users.includes(userId)) {
        existingReaction.users = existingReaction.users.filter(id => id.toString() !== userId);
        // If no users left, remove the reaction
        if (existingReaction.users.length === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        // Add user to existing reaction
        existingReaction.users.push(userId);
      }
    } else {
      // Create new reaction with this emoji
      message.reactions.push({
        emoji,
        users: [userId],
      });
    }

    // Save and populate
    await message.save();
    await message.populate('sender', 'name email avatar');

    // Emit Socket.IO event to all clients in this conversation
    const io = req.app.get('io');
    if (io && message.conversationId) {
      io.to(message.conversationId.toString()).emit('reaction_added', {
        messageId: message._id,
        conversationId: message.conversationId,
        emoji,
        userId,
        reactions: message.reactions,
      });
    }

    console.log('😊 Reaction added:', { messageId, emoji, userId });
    return res.status(200).json({ message });
  } catch (error) {
    return next(error);
  }
};

// Remove emoji reaction from message
const removeReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    if (!messageId || !emoji) {
      return res.status(400).json({ message: 'messageId and emoji are required' });
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Find and update the reaction
    const reaction = message.reactions.find(r => r.emoji === emoji);
    if (reaction) {
      reaction.users = reaction.users.filter(id => id.toString() !== userId);
      // If no users left, remove the reaction entirely
      if (reaction.users.length === 0) {
        message.reactions = message.reactions.filter(r => r.emoji !== emoji);
      }
    }

    // Save and populate
    await message.save();
    await message.populate('sender', 'name email avatar');

    // Emit Socket.IO event to all clients in this conversation
    const io = req.app.get('io');
    if (io && message.conversationId) {
      io.to(message.conversationId.toString()).emit('reaction_removed', {
        messageId: message._id,
        conversationId: message.conversationId,
        emoji,
        userId,
        reactions: message.reactions,
      });
    }

    console.log('😒 Reaction removed:', { messageId, emoji, userId });
    return res.status(200).json({ message });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMessages,
  createMessage,
  deleteMessage,
  clearConversationMessages,
  markMessageAsRead,
  markConversationAsRead,
  addReaction,
  removeReaction,
};

const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Message = require('../models/Message');

const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get current user's favorite conversations
    const currentUser = await User.findById(userId).select('favoriteConversations');
    const favoriteConvIds = currentUser ? currentUser.favoriteConversations.map(id => id.toString()) : [];

    const conversations = await Conversation.find({ members: userId })
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Enrich each conversation with the latest message if not already set
    const conversationsWithData = await Promise.all(
      conversations.map(async (conv) => {
        const convObj = conv.toObject();
        
        // If lastMessage is empty or null, fetch the latest message
        if (!convObj.lastMessage) {
          try {
            const latestMessage = await Message.findOne({ conversationId: conv._id })
              .sort({ createdAt: -1 })
              .select('text createdAt');
            
            if (latestMessage) {
              convObj.lastMessage = latestMessage.text;
              convObj.lastMessageTime = latestMessage.createdAt;
            }
          } catch (err) {
            console.error('Error fetching latest message:', err);
          }
        }
        
        return {
          ...convObj,
          isFavorite: favoriteConvIds.includes(conv._id.toString()),
        };
      })
    );

    return res.status(200).json({ conversations: conversationsWithData });
  } catch (error) {
    return next(error);
  }
};

const startConversation = async (req, res, next) => {
  try {
    const { members, isGroup = false } = req.body;

    if (!Array.isArray(members) || members.length < 2) {
      return res.status(400).json({ message: 'At least two members are required' });
    }

    if (!isGroup && members.length !== 2) {
      return res.status(400).json({ message: 'One-to-one conversations require exactly two members' });
    }

    if (!isGroup) {
      const existingConversation = await Conversation.findOne({
        isGroup: false,
        members: { $all: members, $size: 2 },
      });

      if (existingConversation) {
        return res.status(200).json({ conversation: existingConversation });
      }
    }

    const conversation = await Conversation.create({
      members,
      isGroup,
      admin: isGroup ? req.user.id : null,
      lastMessage: '',
      lastMessageTime: null,
    });

    return res.status(201).json({ conversation });
  } catch (error) {
    return next(error);
  }
};

const getUserGroups = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get current user's favorite conversations
    const User = require('../models/User');
    const currentUser = await User.findById(currentUserId).select('favoriteConversations');
    const favoriteConversationIds = currentUser ? currentUser.favoriteConversations.map(id => id.toString()) : [];

    // Get all group conversations where the user is a member
    const groups = await Conversation.find({
      members: userId,
      isGroup: true,
    })
      .populate('members', 'name email avatar status')
      .populate('admin', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Add isFavorite flag to each group
    const groupsWithFavorite = groups.map(group => ({
      ...group.toObject(),
      isFavorite: favoriteConversationIds.includes(group._id.toString()),
    }));

    return res.status(200).json({ groups: groupsWithFavorite });
  } catch (error) {
    return next(error);
  }
};

const leaveGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    // Find the group conversation
    const group = await Conversation.findOne({
      _id: groupId,
      isGroup: true,
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    // Remove user from members array
    group.members = group.members.filter(
      (memberId) => memberId.toString() !== userId
    );

    // If no members left, delete the group
    if (group.members.length === 0) {
      await Conversation.findByIdAndDelete(groupId);
      return res.status(200).json({ 
        message: 'Group deleted (no members remaining)',
        deleted: true,
      });
    }

    await group.save();

    return res.status(200).json({ 
      message: 'Successfully left the group',
      group,
    });
  } catch (error) {
    return next(error);
  }
};

const getGroupById = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    // Get the group conversation with populated members and admin
    const group = await Conversation.findOne({
      _id: groupId,
      isGroup: true,
    }).populate('members', 'name email avatar status').populate('admin', 'name email avatar');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    return res.status(200).json({ group });
  } catch (error) {
    return next(error);
  }
};

const createGroup = async (req, res, next) => {
  try {
    const { name, memberIds, description } = req.body;
    const adminId = req.user.id;

    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: 'At least one member must be added to the group' });
    }

    // Ensure admin is included in members list
    const uniqueMemberIds = memberIds.includes(adminId)
      ? memberIds
      : [adminId, ...memberIds];

    // Create the group conversation
    const conversation = await Conversation.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      isGroup: true,
      admin: adminId,
      members: uniqueMemberIds,
      lastMessage: '',
      lastMessageTime: null,
    });

    // Populate members and admin for response
    const populatedGroup = await Conversation.findById(conversation._id)
      .populate('members', 'name email avatar status')
      .populate('admin', 'name email avatar');

    // Emit socket event to all members about new group creation
    const io = req.app.get('io');
    if (io) {
      const onlineUsers = io.onlineUsers;
      
      uniqueMemberIds.forEach(memberId => {
        const memberIdStr = memberId.toString();
        // Try to send to specific socket if user is online
        const socketId = onlineUsers?.get(memberIdStr);
        if (socketId) {
          io.to(socketId).emit('group_created', {
            group: populatedGroup,
            recipientId: memberIdStr
          });
          console.log(`✅ Sent group_created to user ${memberIdStr} (socket: ${socketId})`);
        } else {
          // User is offline, broadcast anyway
          io.emit('group_created', {
            group: populatedGroup,
            recipientId: memberIdStr
          });
          console.log(`⚠️ User ${memberIdStr} is offline, broadcasted event`);
        }
      });
    }

    return res.status(201).json({ 
      group: populatedGroup,
      message: 'Group created successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const addGroupMembers = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;
    const adminId = req.user.id;

    // Validate input
    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: 'At least one member must be added' });
    }

    // Find the group
    const group = await Conversation.findOne({
      _id: groupId,
      isGroup: true,
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (group.admin.toString() !== adminId) {
      return res.status(403).json({ message: 'Only group admin can add members' });
    }

    // Add new members to the group (avoid duplicates)
    const currentMemberIds = group.members.map(m => m.toString());
    const newMemberIds = memberIds.filter(id => !currentMemberIds.includes(id.toString()));

    if (newMemberIds.length === 0) {
      return res.status(400).json({ message: 'All selected members are already in the group' });
    }

    // Get admin and members info for system messages
    const admin = await User.findById(adminId).select('name');

    group.members = [...group.members, ...newMemberIds];
    await group.save();

    // Create system message for member addition
    const newMembers = await User.find({ _id: { $in: newMemberIds } }).select('name');
    
    // Create a single system message listing all added members
    const memberNames = newMembers.map(m => m.name).join(', ');
    const systemMessage = await Message.create({
      sender: adminId,
      conversationId: groupId,
      type: 'system',
      text: `${admin.name} added ${memberNames}`,
    });

    // Populate sender for the system message
    await systemMessage.populate('sender', 'name email avatar');

    // Emit socket event to all members in the group
    const io = req.app.get('io');
    if (io) {
      io.to(groupId).emit('member_added', {
        systemMessage: systemMessage,
        addedMemberIds: newMemberIds,
        groupId: groupId,
      });
      console.log(`✅ Emitted member_added for group ${groupId} with ${newMemberIds.length} members`);
    } else {
      console.warn('⚠️ IO instance not found in app for member_added event');
    }

    // Populate and return updated group
    const updatedGroup = await Conversation.findById(group._id)
      .populate('members', 'name email avatar status')
      .populate('admin', 'name email avatar');

    return res.status(200).json({
      group: updatedGroup,
      message: `${newMemberIds.length} member(s) added successfully`
    });
  } catch (error) {
    return next(error);
  }
};

const deleteGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const adminId = req.user.id;

    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    // Find the group
    const group = await Conversation.findOne({
      _id: groupId,
      isGroup: true,
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (group.admin.toString() !== adminId) {
      return res.status(403).json({ message: 'Only group admin can delete the group' });
    }

    // Store member list before deletion for socket notification
    const memberIds = group.members.map(m => m.toString());

    // Delete all messages in this group
    await Message.deleteMany({ conversationId: groupId });

    // Delete the group
    const deletedGroup = await Conversation.findByIdAndDelete(groupId);
    
    if (!deletedGroup) {
      return res.status(500).json({ message: 'Failed to delete group' });
    }

    console.log('✅ Group deleted from database:', groupId);
    console.log('📋 Notifying members:', memberIds);

    // Emit socket event to all members about group deletion
    const io = req.app.get('io');
    if (io) {
      const onlineUsers = io.onlineUsers;
      console.log('👥 Online users:', Array.from(onlineUsers.keys()));
      
      memberIds.forEach(memberId => {
        // Ensure memberId is string for lookup
        const memberIdStr = memberId.toString();
        const socketId = onlineUsers?.get(memberIdStr);
        
        if (socketId) {
          io.to(socketId).emit('group_deleted', {
            groupId: groupId,
            recipientId: memberIdStr
          });
          console.log(`✅ Sent group_deleted to user ${memberIdStr} (socket: ${socketId})`);
        } else {
          // User is offline, broadcast to all sockets
          io.emit('group_deleted', {
            groupId: groupId,
            recipientId: memberIdStr
          });
          console.log(`⚠️ User ${memberIdStr} is offline, broadcasted event`);
        }
      });
    }

    return res.status(200).json({
      message: 'Group deleted successfully',
      deleted: true,
    });
  } catch (error) {
    return next(error);
  }
};

const removeGroupMember = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;
    const adminId = req.user.id;

    // Validate input
    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    if (!memberId) {
      return res.status(400).json({ message: 'Member ID is required' });
    }

    // Find the group
    const group = await Conversation.findOne({
      _id: groupId,
      isGroup: true,
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (group.admin.toString() !== adminId) {
      return res.status(403).json({ message: 'Only group admin can remove members' });
    }

    // Check if member is in the group
    const isMember = group.members.some(
      m => m.toString() === memberId || m === memberId
    );

    if (!isMember) {
      return res.status(400).json({ message: 'User is not a member of this group' });
    }

    // Prevent removing the admin from the group
    if (group.admin.toString() === memberId) {
      return res.status(400).json({ message: 'Cannot remove the group admin. Transfer admin rights first.' });
    }

    // Get admin and member info for the system message
    const admin = await User.findById(adminId).select('name');
    const member = await User.findById(memberId).select('name');

    // Remove the member
    group.members = group.members.filter(
      m => m.toString() !== memberId && m !== memberId
    );

    await group.save();

    // Create system message
    const systemMessage = await Message.create({
      sender: adminId,
      conversationId: groupId,
      type: 'system',
      text: `${admin.name} removed ${member.name}`,
    });

    // Populate sender for the system message
    await systemMessage.populate('sender', 'name email avatar');

    // Emit socket event to all members in the group
    const io = req.app.get('io');
    if (io) {
      console.log(`📡 Emitting member_removed event to room ${groupId}`);
      io.to(groupId).emit('member_removed', {
        systemMessage: systemMessage,
        removedMemberId: memberId,
        groupId: groupId,
      });
      console.log(`✅ Emitted member_removed for group ${groupId}`);
    } else {
      console.warn('⚠️ IO instance not found in app for member_removed event');
    }

    // Populate and return updated group
    const updatedGroup = await Conversation.findById(group._id)
      .populate('members', 'name email avatar status')
      .populate('admin', 'name email avatar');

    return res.status(200).json({
      group: updatedGroup,
      message: 'Member removed from group successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const updateGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;
    const adminId = req.user.id;

    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    // Find the group
    const group = await Conversation.findOne({
      _id: groupId,
      isGroup: true,
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (group.admin.toString() !== adminId) {
      return res.status(403).json({ message: 'Only group admin can update group details' });
    }

    // Update fields if provided
    if (name !== undefined && name.trim() !== '') {
      group.name = name.trim();
    }
    
    if (description !== undefined) {
      group.description = description.trim();
    }

    await group.save();

    // Populate and return updated group
    const updatedGroup = await Conversation.findById(group._id)
      .populate('members', 'name email avatar status')
      .populate('admin', 'name email avatar');

    return res.status(200).json({
      group: updatedGroup,
      message: 'Group updated successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getConversations,
  startConversation,
  getUserGroups,
  getGroupById,
  leaveGroup,
  createGroup,
  addGroupMembers,
  deleteGroup,
  removeGroupMember,
  updateGroup,
};

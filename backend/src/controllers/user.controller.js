const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

const getUsers = async (req, res, next) => {
  try {
    // Get current user's favorites
    const currentUser = await User.findById(req.user.id).select('favoriteUsers favoriteConversations');
    const favoriteUserIds = currentUser ? currentUser.favoriteUsers.map(id => id.toString()) : [];

    // Exclude the current user from the list
    const users = await User.find({ _id: { $ne: req.user.id } }).select('-password');
    
    // Add isFavorite flag to each user
    const usersWithFavorite = users.map(user => ({
      ...user.toObject(),
      isFavorite: favoriteUserIds.includes(user._id.toString()),
    }));

    return res.status(200).json({ users: usersWithFavorite });
  } catch (error) {
    return next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const query = (req.query.query || '').trim();
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const regex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }],
    }).select('-password');

    return res.status(200).json({ users });
  } catch (error) {
    return next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (currentUserId === userId) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    // Add user to blocked list
    const user = await User.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { blockedUsers: userId } },
      { new: true }
    ).select('-password');

    // Emit socket event to notify blocked user
    const io = req.app.get('io');
    if (io) {
      const onlineUsers = io.onlineUsers;
      const userSocketId = onlineUsers?.get(userId.toString());
      const blockerSocketId = onlineUsers?.get(currentUserId.toString());
      
      // Notify both users
      if (userSocketId) {
        io.to(userSocketId).emit('user_blocked', {
          blockerId: currentUserId,
          blockedUserId: userId,
        });
        console.log(`✅ Sent user_blocked event to ${userId}`);
      }
      
      if (blockerSocketId) {
        io.to(blockerSocketId).emit('user_blocked', {
          blockerId: currentUserId,
          blockedUserId: userId,
        });
        console.log(`✅ Sent user_blocked event to ${currentUserId}`);
      }
    }

    return res.status(200).json({ message: 'User blocked', user });
  } catch (error) {
    return next(error);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Remove user from blocked list
    const user = await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { blockedUsers: userId } },
      { new: true }
    ).select('-password');

    // Emit socket event to notify unblocked user
    const io = req.app.get('io');
    if (io) {
      const onlineUsers = io.onlineUsers;
      const userSocketId = onlineUsers?.get(userId.toString());
      const unblockerSocketId = onlineUsers?.get(currentUserId.toString());
      
      // Notify both users
      if (userSocketId) {
        io.to(userSocketId).emit('user_unblocked', {
          unblockerId: currentUserId,
          unblockedUserId: userId,
        });
        console.log(`✅ Sent user_unblocked event to ${userId}`);
      }
      
      if (unblockerSocketId) {
        io.to(unblockerSocketId).emit('user_unblocked', {
          unblockerId: currentUserId,
          unblockedUserId: userId,
        });
        console.log(`✅ Sent user_unblocked event to ${currentUserId}`);
      }
    }

    return res.status(200).json({ message: 'User unblocked', user });
  } catch (error) {
    return next(error);
  }
};

const checkBlockStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Check if current user has blocked the target user
    const currentUser = await User.findById(currentUserId).select('blockedUsers');
    const hasBlockedThem = currentUser.blockedUsers.some(
      (id) => id.toString() === userId
    );

    // Check if target user has blocked the current user
    const targetUser = await User.findById(userId).select('blockedUsers');
    const isBlockedByThem = targetUser ? targetUser.blockedUsers.some(
      (id) => id.toString() === currentUserId
    ) : false;

    return res.status(200).json({
      isBlocked: hasBlockedThem || isBlockedByThem,
      hasBlockedThem,
      isBlockedByThem,
    });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { name, about } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (about !== undefined) updateFields.about = about.trim();

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const user = await User.findByIdAndUpdate(
      currentUserId,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Profile updated', user });
  } catch (error) {
    return next(error);
  }
};

const toggleFavoriteUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (currentUserId === userId) {
      return res.status(400).json({ message: 'Cannot favorite yourself' });
    }

    // Check if user is already favorited
    const currentUser = await User.findById(currentUserId);
    const isFavorited = currentUser.favoriteUsers.includes(userId);

    if (isFavorited) {
      // Remove from favorites
      await User.findByIdAndUpdate(
        currentUserId,
        { $pull: { favoriteUsers: userId } },
        { new: true }
      );
      return res.status(200).json({ message: 'Removed from favorites', isFavorited: false });
    } else {
      // Add to favorites
      await User.findByIdAndUpdate(
        currentUserId,
        { $addToSet: { favoriteUsers: userId } },
        { new: true }
      );
      return res.status(200).json({ message: 'Added to favorites', isFavorited: true });
    }
  } catch (error) {
    return next(error);
  }
};

const toggleFavoriteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    const currentUserId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId is required' });
    }

    // Check if conversation is already favorited
    const currentUser = await User.findById(currentUserId);
    const isFavorited = currentUser.favoriteConversations.includes(conversationId);

    if (isFavorited) {
      // Remove from favorites
      await User.findByIdAndUpdate(
        currentUserId,
        { $pull: { favoriteConversations: conversationId } },
        { new: true }
      );
      return res.status(200).json({ message: 'Removed from favorites', isFavorited: false });
    } else {
      // Add to favorites
      await User.findByIdAndUpdate(
        currentUserId,
        { $addToSet: { favoriteConversations: conversationId } },
        { new: true }
      );
      return res.status(200).json({ message: 'Added to favorites', isFavorited: true });
    }
  } catch (error) {
    return next(error);
  }
};

const uploadProfilePic = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    console.log('📸 Upload request received:', {
      userId: currentUserId,
      hasFile: !!req.file,
      fileSize: req.file?.size,
      fileType: req.file?.mimetype
    });

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary using stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'profile_pics',
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto' },
        ],
      },
      async (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          console.error('Error details:', {
            message: error.message,
            http_code: error.http_code,
            name: error.name
          });
          return res.status(500).json({ 
            message: 'Failed to upload image', 
            error: error.message 
          });
        }

        try {
          console.log('✅ Cloudinary upload successful:', result.secure_url);

          // Update user's avatar field with the secure URL
          const user = await User.findByIdAndUpdate(
            currentUserId,
            { avatar: result.secure_url },
            { new: true }
          ).select('-password');

          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          console.log('✅ Profile picture uploaded successfully:', result.secure_url);
          return res.status(200).json({ 
            message: 'Profile picture updated successfully', 
            user,
            profilePic: result.secure_url 
          });
        } catch (dbError) {
          console.error('❌ Database update error:', dbError);
          return res.status(500).json({ message: 'Failed to update profile picture' });
        }
      }
    );

    // Pipe the file buffer to Cloudinary
    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error('❌ Upload profile pic error:', error);
    return next(error);
  }
};

const removeProfilePic = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    console.log('🗑️ Remove profile picture request:', { userId: currentUserId });

    // Update user's avatar field to empty string
    const user = await User.findByIdAndUpdate(
      currentUserId,
      { avatar: '' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ Profile picture removed successfully');
    return res.status(200).json({ 
      message: 'Profile picture removed successfully', 
      user
    });
  } catch (error) {
    console.error('❌ Remove profile pic error:', error);
    return next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  searchUsers,
  blockUser,
  unblockUser,
  checkBlockStatus,
  updateProfile,
  toggleFavoriteUser,
  toggleFavoriteConversation,
  uploadProfilePic,
  removeProfilePic,
};

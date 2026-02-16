const express = require('express');
const { getUsers, getUserById, searchUsers, blockUser, unblockUser, checkBlockStatus, updateProfile, toggleFavoriteUser, toggleFavoriteConversation, uploadProfilePic, removeProfilePic } = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', authMiddleware, getUsers);
router.get('/search', authMiddleware, searchUsers);
router.post('/favorite-user', authMiddleware, toggleFavoriteUser);
router.post('/favorite-conversation', authMiddleware, toggleFavoriteConversation);
router.put('/profile', authMiddleware, updateProfile);
router.put('/profile-pic', authMiddleware, upload.single('profilePic'), uploadProfilePic);
router.delete('/profile-pic', authMiddleware, removeProfilePic);
router.post('/block', authMiddleware, blockUser);
router.post('/unblock', authMiddleware, unblockUser);
router.get('/block-status/:userId', authMiddleware, checkBlockStatus);
router.get('/:id', authMiddleware, getUserById);

module.exports = router;

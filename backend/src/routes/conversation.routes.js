const express = require('express');
const { getConversations, startConversation, getUserGroups, getGroupById, leaveGroup, createGroup, addGroupMembers, deleteGroup, removeGroupMember, updateGroup } = require('../controllers/conversation.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware, getConversations);
router.post('/start', authMiddleware, startConversation);
router.post('/create-group', authMiddleware, createGroup);
router.get('/groups/:userId', authMiddleware, getUserGroups);
router.get('/group/:groupId', authMiddleware, getGroupById);
router.post('/add-members/:groupId', authMiddleware, addGroupMembers);
router.put('/update/:groupId', authMiddleware, updateGroup);
router.delete('/member/:groupId/:memberId', authMiddleware, removeGroupMember);
router.delete('/:groupId', authMiddleware, deleteGroup);
router.put('/leave/:groupId', authMiddleware, leaveGroup);

module.exports = router;


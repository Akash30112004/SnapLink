const express = require('express');
const { getMessages, createMessage, deleteMessage, clearConversationMessages, markMessageAsRead, markConversationAsRead, addReaction, removeReaction } = require('../controllers/message.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware, getMessages);
router.post('/', authMiddleware, createMessage);
router.put('/:messageId/read', authMiddleware, markMessageAsRead);
router.put('/mark-read/:conversationId', authMiddleware, markConversationAsRead);
router.post('/:messageId/reactions', authMiddleware, addReaction);
router.delete('/:messageId/reactions', authMiddleware, removeReaction);
router.delete('/:id', authMiddleware, deleteMessage);
router.delete('/conversation/:conversationId', authMiddleware, clearConversationMessages);

module.exports = router;

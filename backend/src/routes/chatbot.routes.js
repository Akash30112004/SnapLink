const express = require('express');
const { getAIReply, testAI, checkAIStatus } = require('../controllers/chatbot.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authMiddleware, getAIReply);
router.get('/test', testAI);
router.get('/status', checkAIStatus);

module.exports = router;

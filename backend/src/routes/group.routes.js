const express = require('express');
const { createGroup, getGroups, getGroupById } = require('../controllers/group.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authMiddleware, createGroup);
router.get('/', authMiddleware, getGroups);
router.get('/:id', authMiddleware, getGroupById);

module.exports = router;

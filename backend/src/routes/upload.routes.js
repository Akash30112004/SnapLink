const express = require('express');
const { upload, uploadFile, uploadMultipleFiles, deleteFile } = require('../controllers/upload.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Upload single file
router.post('/single', authMiddleware, upload.single('file'), uploadFile);

// Upload multiple files (max 5)
router.post('/multiple', authMiddleware, upload.array('files', 5), uploadMultipleFiles);

// Delete file
router.delete('/', authMiddleware, deleteFile);

module.exports = router;

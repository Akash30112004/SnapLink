const express = require('express');
const { register, login, me, forgotPassword, verifyOtp, resetPassword, changePassword } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);

// Forgot Password Routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Change Password Route (requires authentication)
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;

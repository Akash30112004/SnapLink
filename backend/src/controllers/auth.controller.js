const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const transporter = require('../config/mailer');

const register = async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password, avatar });
    const token = generateToken({ id: user._id });

    const userPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    return res.status(201).json({ token, user: userPayload });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user._id });
    const userPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    return res.status(200).json({ token, user: userPayload });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    return res.status(200).json({ user: userPayload });
  } catch (error) {
    return next(error);
  }
};

// PHASE 3: Forgot Password - Generate & Send OTP
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email input
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Security: Don't reveal if email exists or not
    if (!user) {
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive an OTP shortly' 
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiry (10 minutes from now)
    user.resetOtp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Send OTP via email
    const mailOptions = {
      from: `"SnapLink" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'SnapLink Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">SnapLink Password Reset</h2>
          <p style="font-size: 16px; color: #333;">Hello ${user.name},</p>
          <p style="font-size: 16px; color: #333;">You requested to reset your password. Use the OTP below:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #10B981; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #666;">This OTP is valid for <strong>10 minutes</strong>.</p>
          <p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">SnapLink - Secure Messaging</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ OTP sent to ${user.email}: ${otp}`);

    return res.status(200).json({ 
      message: 'If an account exists with this email, you will receive an OTP shortly' 
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return res.status(500).json({ 
      message: 'An error occurred while processing your request' 
    });
  }
};

// PHASE 4: Verify OTP
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Security: Don't reveal if email exists
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if OTP matches
    if (user.resetOtp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if OTP has expired
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      // Clear expired OTP
      user.resetOtp = null;
      user.otpExpiry = null;
      await user.save();
      
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid
    console.log(`✅ OTP verified for ${user.email}`);

    return res.status(200).json({ 
      message: 'OTP verified successfully',
      email: user.email 
    });
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    return res.status(500).json({ 
      message: 'An error occurred while verifying OTP' 
    });
  }
};

// PHASE 5: Reset Password
const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword, otp } = req.body;

    // Validate inputs
    if (!email || !newPassword || !otp) {
      return res.status(400).json({ 
        message: 'Email, OTP, and new password are required' 
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid request' 
      });
    }

    // Verify OTP one more time before allowing password reset
    if (user.resetOtp !== otp.trim()) {
      return res.status(400).json({ 
        message: 'Invalid or expired OTP' 
      });
    }

    // Check if OTP has expired
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      // Clear expired OTP
      user.resetOtp = null;
      user.otpExpiry = null;
      await user.save();
      
      return res.status(400).json({ 
        message: 'OTP has expired. Please request a new one' 
      });
    }

    // Update password (will be hashed automatically by pre-save hook)
    user.password = newPassword;

    // Clear OTP fields after successful password reset
    user.resetOtp = null;
    user.otpExpiry = null;

    await user.save();

    console.log(`✅ Password reset successful for ${user.email}`);

    return res.status(200).json({ 
      message: 'Password reset successfully. You can now login with your new password' 
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    return res.status(500).json({ 
      message: 'An error occurred while resetting password' 
    });
  }
};

// Change Password (for authenticated users)
const changePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate new password
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password (will be hashed automatically by pre-save hook)
    user.password = newPassword;
    await user.save();

    console.log(`✅ Password changed successfully for user: ${user.email}`);

    return res.status(200).json({ 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    return res.status(500).json({ 
      message: 'An error occurred while changing password' 
    });
  }
};

module.exports = {
  register,
  login,
  me,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
};

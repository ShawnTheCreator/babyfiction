import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { body } from 'express-validator';
import User from '../models/User.js';
import { createError } from '../utils/errorUtils.js';
import { sendEmail } from '../utils/email.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { isRateLimited, trackFailedAttempt, clearFailedAttempts } from '../middleware/recaptcha.js';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError('User already exists with this email', 400));
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    await user.save();

    // Send verification email (non-blocking)
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify your email address',
        text: `Hi ${user.firstName}, please verify your email: ${verificationUrl}`,
        html: `<p>Hi ${user.firstName},</p><p>Please verify your email by clicking the link below:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`
      });
    } catch (e) {
      // Do not block signup if email sending fails
      console.error('Email send failed:', e?.message || e);
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check rate limiting
    if (isRateLimited(email, 5)) {
      return next(createError('Too many failed login attempts. Please try again in 15 minutes.', 429));
    }

    // Check if user exists and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      trackFailedAttempt(email);
      return next(createError('Invalid credentials', 401));
    }

    // Check if account is active
    if (!user.isActive) {
      return next(createError('Account is deactivated', 401));
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      trackFailedAttempt(email);
      return next(createError('Invalid credentials', 401));
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(email);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?._id);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        firstName,
        lastName,
        phone,
        address
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user?._id).select('+password');
    if (!user) {
      return next(createError('User not found', 404));
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return next(createError('Current password is incorrect', 400));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(createError('User not found with this email', 404));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email using new email service
    try {
      await sendPasswordResetEmail(
        user.email,
        resetToken,
        user.firstName
      );
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue anyway - token is saved
    }

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(createError('Invalid or expired reset token', 400));
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return next(createError('Invalid verification token', 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
export const validateRegister = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

export const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

export const validateForgotPassword = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
];

export const validateResetPassword = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];
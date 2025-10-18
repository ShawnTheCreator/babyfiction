import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// Public routes
router.post('/register', authLimiter, validate(validateRegister), register);
router.post('/login', authLimiter, validate(validateLogin), login);
router.post('/forgot-password', passwordResetLimiter, validate(validateForgotPassword), forgotPassword);
router.put('/reset-password', validate(validateResetPassword), resetPassword);
router.get('/verify-email', verifyEmail);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, validate(validateChangePassword), changePassword);

export default router;
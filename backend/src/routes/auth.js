// Router setup
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
  deleteMe,
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  verifyOtp
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validation.js';
import { recaptchaV2Middleware } from '../middleware/recaptcha.js';

const router = Router();

// Public routes
router.post('/register', authLimiter, recaptchaV2Middleware(), validate(validateRegister), register);
router.post('/login', authLimiter, recaptchaV2Middleware(), validate(validateLogin), login);
router.post('/forgot-password', passwordResetLimiter, recaptchaV2Middleware(), validate(validateForgotPassword), forgotPassword);
router.put('/reset-password', validate(validateResetPassword), resetPassword);
router.get('/verify-email', verifyEmail);

// New: Verify PIN for signup/login
router.post('/verify-otp', verifyOtp);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, validate(validateChangePassword), changePassword);
router.delete('/me', authenticate, deleteMe);

export default router;
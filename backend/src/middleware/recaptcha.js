import fetch from 'node-fetch';
import { createError } from '../utils/errorUtils.js';

/**
 * Verify Google reCAPTCHA v3 token
 * @param {string} token - reCAPTCHA token from frontend
 * @param {string} action - Expected action name
 * @returns {Promise<Object>} Verification result
 */
export const verifyRecaptcha = async (token, action = 'submit') => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  // Skip verification in development if not configured
  if (!secretKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  reCAPTCHA not configured - skipping verification in development');
      return { success: true, score: 1.0, action, hostname: 'localhost' };
    }
    throw new Error('reCAPTCHA secret key not configured');
  }
  
  if (!token) {
    throw createError('reCAPTCHA token is required', 400);
  }
  
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      throw createError('reCAPTCHA verification failed', 400);
    }
    
    // Verify action matches
    if (data.action !== action) {
      console.error(`reCAPTCHA action mismatch: expected ${action}, got ${data.action}`);
      throw createError('Invalid reCAPTCHA action', 400);
    }
    
    // Check score threshold (0.0 to 1.0, higher is better)
    const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');
    if (data.score < minScore) {
      console.warn(`reCAPTCHA score too low: ${data.score} < ${minScore}`);
      throw createError('reCAPTCHA verification failed - suspicious activity detected', 403);
    }
    
    return data;
  } catch (error) {
    if (error.status) throw error; // Re-throw our custom errors
    console.error('reCAPTCHA verification error:', error);
    throw createError('Failed to verify reCAPTCHA', 500);
  }
};

/**
 * Express middleware to verify reCAPTCHA token
 * @param {string} action - Expected action name
 */
export const recaptchaMiddleware = (action = 'submit') => {
  return async (req, res, next) => {
    try {
      const token = req.body.recaptchaToken || req.headers['x-recaptcha-token'];
      
      // Skip in development if not configured
      if (!process.env.RECAPTCHA_SECRET_KEY && process.env.NODE_ENV === 'development') {
        console.warn('⚠️  reCAPTCHA middleware: skipping in development (not configured)');
        return next();
      }
      
      const result = await verifyRecaptcha(token, action);
      
      // Attach verification result to request for logging
      req.recaptchaVerification = result;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Rate limiting helper - track failed attempts
 */
const failedAttempts = new Map();

export const trackFailedAttempt = (identifier) => {
  const key = identifier.toLowerCase();
  const now = Date.now();
  const attempts = failedAttempts.get(key) || [];
  
  // Remove attempts older than 15 minutes
  const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000);
  recentAttempts.push(now);
  
  failedAttempts.set(key, recentAttempts);
  
  return recentAttempts.length;
};

export const isRateLimited = (identifier, maxAttempts = 5) => {
  const key = identifier.toLowerCase();
  const attempts = failedAttempts.get(key) || [];
  const now = Date.now();
  
  // Count attempts in last 15 minutes
  const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000);
  
  return recentAttempts.length >= maxAttempts;
};

export const clearFailedAttempts = (identifier) => {
  const key = identifier.toLowerCase();
  failedAttempts.delete(key);
};

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, attempts] of failedAttempts.entries()) {
    const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000);
    if (recentAttempts.length === 0) {
      failedAttempts.delete(key);
    } else {
      failedAttempts.set(key, recentAttempts);
    }
  }
}, 60 * 60 * 1000);

export default {
  verifyRecaptcha,
  recaptchaMiddleware,
  trackFailedAttempt,
  isRateLimited,
  clearFailedAttempts
};

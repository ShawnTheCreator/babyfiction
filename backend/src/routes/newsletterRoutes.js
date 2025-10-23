import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import {
  subscribe,
  unsubscribe,
  updatePreferences,
  getSubscribers,
  getStats,
  exportSubscribers,
  deleteSubscriber,
  validateSubscribe
} from '../controllers/newsletterController.js';

const router = express.Router();

// Public routes
router.post('/subscribe', validate(validateSubscribe), subscribe);
router.get('/unsubscribe/:token', unsubscribe);
router.put('/preferences/:token', updatePreferences);

// Admin routes
router.use(protect);
router.use(restrictTo('admin'));

router.get('/subscribers', getSubscribers);
router.get('/stats', getStats);
router.get('/export', exportSubscribers);
router.delete('/subscribers/:id', deleteSubscriber);

export default router;

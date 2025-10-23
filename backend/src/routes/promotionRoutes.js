import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import {
  getPromotions,
  getActivePromotions,
  getPromotion,
  validatePromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotion,
  getPromotionStats,
  validateCreatePromotion
} from '../controllers/promotionController.js';

const router = express.Router();

// Public routes
router.get('/active', getActivePromotions);

// Protected routes (require authentication)
router.post('/validate', protect, validatePromotion);

// Admin routes
router.use(protect);
router.use(restrictTo('admin'));

router.route('/')
  .get(getPromotions)
  .post(validate(validateCreatePromotion), createPromotion);

router.route('/:id')
  .get(getPromotion)
  .put(updatePromotion)
  .delete(deletePromotion);

router.put('/:id/toggle', togglePromotion);
router.get('/:id/stats', getPromotionStats);

export default router;

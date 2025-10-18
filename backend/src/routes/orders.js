import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getOrderStats,
  validateCreateOrder,
  validateUpdateOrderStatus
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// User routes
router.post('/', authenticate, validate(validateCreateOrder), createOrder);
router.get('/', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrder);
router.put('/:id/cancel', authenticate, cancelOrder);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), getAllOrders);
router.get('/admin/stats', authenticate, authorize('admin'), getOrderStats);
router.put('/:id/status', authenticate, authorize('admin'), validate(validateUpdateOrderStatus), updateOrderStatus);

export default router;
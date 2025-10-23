import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  getDriverOrders,
  getActiveDeliveries,
  getCompletedDeliveries,
  updateDeliveryStatus,
  markOutForDelivery,
  getDriverStats,
  addDeliveryNote
} from '../controllers/driverController.js';

const router = express.Router();

// All routes require authentication and driver role
router.use(protect);
router.use(restrictTo('driver'));

// Driver dashboard routes
router.get('/orders', getDriverOrders);
router.get('/active', getActiveDeliveries);
router.get('/completed', getCompletedDeliveries);
router.get('/stats', getDriverStats);

// Order management routes
router.put('/orders/:id/status', updateDeliveryStatus);
router.put('/orders/:id/out-for-delivery', markOutForDelivery);
router.post('/orders/:id/note', addDeliveryNote);

export default router;

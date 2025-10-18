import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getFeaturedProducts,
  searchProducts,
  validateCreateProduct,
  validateUpdateProduct
} from '../controllers/productController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public routes
router.get('/', apiLimiter, optionalAuth, getProducts);
router.get('/categories', getCategories);
router.get('/featured', getFeaturedProducts);
router.get('/search', apiLimiter, searchProducts);
router.get('/:id', getProduct);

// Admin routes
router.post('/', authenticate, authorize('admin'), validate(validateCreateProduct), createProduct);
router.put('/:id', authenticate, authorize('admin'), validate(validateUpdateProduct), updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;
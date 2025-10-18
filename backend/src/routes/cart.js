import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  validateAddToCart,
  validateUpdateCartItem
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', getCart);
router.get('/count', getCartCount);
router.post('/items', validate(validateAddToCart), addToCart);
router.put('/items/:itemId', validate(validateUpdateCartItem), updateCartItem);
router.delete('/items/:itemId', removeFromCart);
router.delete('/', clearCart);

export default router;
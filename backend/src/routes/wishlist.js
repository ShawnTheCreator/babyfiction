import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import {
  getWishlist,
  getWishlistCount,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  validateAddToWishlist,
} from '../controllers/wishlistController.js';

const router = Router();

router.use(authenticate);

router.get('/', getWishlist);
router.get('/count', getWishlistCount);
router.post('/items', validate(validateAddToWishlist), addToWishlist);
router.delete('/items/:productId', removeFromWishlist);
router.delete('/', clearWishlist);

export default router;

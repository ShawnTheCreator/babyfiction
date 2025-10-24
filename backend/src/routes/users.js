import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { 
  listUsers, 
  deactivateUser, 
  reactivateUser, 
  deleteUser 
} from '../controllers/userController.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), apiLimiter, listUsers);
router.put('/:id/deactivate', authenticate, authorize('admin'), deactivateUser);
router.put('/:id/reactivate', authenticate, authorize('admin'), reactivateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

export default router;

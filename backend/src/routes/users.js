import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { listUsers } from '../controllers/userController.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), apiLimiter, listUsers);

export default router;

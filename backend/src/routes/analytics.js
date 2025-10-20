import { Router } from 'express';
import { ingestEvent, getSummary } from '../controllers/analyticsController.js';
import { optionalAuth, authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Ingest events (auth optional)
router.post('/events', optionalAuth, ingestEvent);

// Admin-only summary
router.get('/summary', authenticate, authorize('admin'), getSummary);

export default router;

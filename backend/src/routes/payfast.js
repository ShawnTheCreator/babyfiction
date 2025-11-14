import { Router } from 'express';
import { initiatePayFast, handleITN } from '../controllers/payfastController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Initiate payment (requires auth)
router.post('/initiate', authenticate, initiatePayFast);

// ITN callback (public)
router.post('/itn', handleITN);

export default router;
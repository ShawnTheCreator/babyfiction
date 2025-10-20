import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload, uploadImage } from '../controllers/mediaController.js';

const router = Router();

// Only authenticated admins can upload media
router.post('/upload', authenticate, authorize('admin'), upload.single('file'), uploadImage);

export default router;

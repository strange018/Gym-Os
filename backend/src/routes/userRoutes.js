import express from 'express';
import { getStats, logWeight, getWeightHistory } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getStats);
router.post('/weight', protect, logWeight);
router.get('/weight-history', protect, getWeightHistory);

export default router;

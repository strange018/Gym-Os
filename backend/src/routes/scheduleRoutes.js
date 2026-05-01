import express from 'express';
import { getSchedule, updateSchedule } from '../controllers/scheduleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getSchedule);
router.put('/', protect, updateSchedule);

export default router;

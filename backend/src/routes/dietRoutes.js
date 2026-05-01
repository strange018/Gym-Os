import express from 'express';
import { getDailyDiet, getMeals, logMeal, getDailyIntake } from '../controllers/dietController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getDailyDiet);
router.get('/meals', protect, getMeals);
router.post('/log', protect, logMeal);
router.get('/intake', protect, getDailyIntake);

export default router;

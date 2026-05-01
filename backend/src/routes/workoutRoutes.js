import express from 'express';
import { 
  getExercises, 
  getDailyWorkout, 
  logWorkout,
  getWorkoutHistory,
  getDailyInsights
} from '../controllers/workoutController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/exercises', getExercises);
router.get('/daily', protect, getDailyWorkout);
router.post('/log', protect, logWorkout);
router.get('/history', protect, getWorkoutHistory);
router.get('/insights', protect, getDailyInsights);

export default router;

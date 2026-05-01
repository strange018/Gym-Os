import WeeklySchedule from '../models/WeeklySchedule.js';
import { emitToUser } from '../utils/socket.js';

export const getSchedule = async (req, res) => {
  try {
    let schedule = await WeeklySchedule.findOne({ userId: req.user._id });
    if (!schedule) {
      // Create a default schedule based on user request
      const defaultDays = {
        Monday: { 
          type: 'workout', 
          planName: 'Chest + Triceps', 
          exercises: [
            { name: 'Incline Bench Press', sets: 4, reps: '10', reason: 'Chest - Upper mass' },
            { name: 'Flat Dumbbell Press', sets: 4, reps: '10', reason: 'Chest - Mid mass' },
            { name: 'Cable Flyes', sets: 3, reps: '15', reason: 'Chest - Inner squeeze' },
            { name: 'Pushups', sets: 3, reps: 'Max', reason: 'Chest - Burnout' },
            { name: 'Tricep Pushdowns', sets: 4, reps: '12', reason: 'Triceps - Lateral head' },
            { name: 'Skull Crushers', sets: 3, reps: '12', reason: 'Triceps - Long head' },
            { name: 'Overhead Extension', sets: 3, reps: '12', reason: 'Triceps - Stretch' },
            { name: 'Dips', sets: 3, reps: 'Max', reason: 'Triceps - Compound' }
          ] 
        },
        Tuesday: { 
          type: 'workout', 
          planName: 'Back + Biceps', 
          exercises: [
            { name: 'Deadlifts', sets: 4, reps: '5', reason: 'Back - Thickness' },
            { name: 'Lat Pulldowns', sets: 4, reps: '12', reason: 'Back - Width' },
            { name: 'Seated Cable Rows', sets: 4, reps: '12', reason: 'Back - Mid row' },
            { name: 'Single Arm Rows', sets: 3, reps: '12', reason: 'Back - Isolation' },
            { name: 'Barbell Curls', sets: 4, reps: '10', reason: 'Biceps - Mass' },
            { name: 'Hammer Curls', sets: 3, reps: '12', reason: 'Biceps - Width' },
            { name: 'Preacher Curls', sets: 3, reps: '12', reason: 'Biceps - Peak' },
            { name: 'Concentration Curls', sets: 3, reps: '15', reason: 'Biceps - Pump' }
          ] 
        },
        Wednesday: { 
          type: 'workout', 
          planName: 'Shoulders + Abs', 
          exercises: [
            { name: 'Overhead Press', sets: 4, reps: '8', reason: 'Shoulders - Power' },
            { name: 'Lateral Raises', sets: 4, reps: '15', reason: 'Shoulders - Width' },
            { name: 'Front Raises', sets: 3, reps: '12', reason: 'Shoulders - Front delt' },
            { name: 'Face Pulls', sets: 4, reps: '15', reason: 'Shoulders - Rear delt' },
            { name: 'Hanging Leg Raises', sets: 4, reps: '15', reason: 'Abs - Lower' },
            { name: 'Crunches', sets: 4, reps: '20', reason: 'Abs - Upper' },
            { name: 'Russian Twists', sets: 3, reps: '30', reason: 'Abs - Obliques' },
            { name: 'Plank', sets: 3, reps: '60s', reason: 'Abs - Core' }
          ] 
        },
        Thursday: { 
          type: 'workout', 
          planName: 'Chest + Triceps', 
          exercises: [
            { name: 'Decline Press', sets: 4, reps: '10', reason: 'Chest - Lower focus' },
            { name: 'Chest Press Machine', sets: 4, reps: '12', reason: 'Chest - Stability' },
            { name: 'Pec Deck Flyes', sets: 3, reps: '15', reason: 'Chest - Stretch' },
            { name: 'Cable Crossover', sets: 3, reps: '15', reason: 'Chest - Definition' },
            { name: 'Rope Pushdowns', sets: 4, reps: '15', reason: 'Triceps - Focus' },
            { name: 'Kickbacks', sets: 3, reps: '15', reason: 'Triceps - Peak' },
            { name: 'Close Grip Bench', sets: 4, reps: '8', reason: 'Triceps - Power' },
            { name: 'Diamond Pushups', sets: 3, reps: 'Max', reason: 'Triceps - Burn' }
          ] 
        },
        Friday: { 
          type: 'workout', 
          planName: 'Back + Biceps', 
          exercises: [
            { name: 'Pullups', sets: 4, reps: 'Max', reason: 'Back - Width' },
            { name: 'T-Bar Rows', sets: 4, reps: '10', reason: 'Back - Power' },
            { name: 'Pullover', sets: 3, reps: '12', reason: 'Back - Serratus' },
            { name: 'Back Extensions', sets: 3, reps: '15', reason: 'Back - Lower' },
            { name: 'Incline Curls', sets: 4, reps: '12', reason: 'Biceps - Stretch' },
            { name: 'EZ Bar Curls', sets: 4, reps: '10', reason: 'Biceps - Inner' },
            { name: 'Spider Curls', sets: 3, reps: '12', reason: 'Biceps - Isolation' },
            { name: 'Cable Curls', sets: 3, reps: '15', reason: 'Biceps - Constant tension' }
          ] 
        },
        Saturday: { 
          type: 'workout', 
          planName: 'Shoulders + Legs', 
          exercises: [
            { name: 'Squats', sets: 5, reps: '8', reason: 'Legs - Compound' },
            { name: 'Leg Extensions', sets: 4, reps: '15', reason: 'Legs - Quads' },
            { name: 'Leg Curls', sets: 4, reps: '15', reason: 'Legs - Hams' },
            { name: 'Calf Raises', sets: 4, reps: '20', reason: 'Legs - Calves' },
            { name: 'Military Press', sets: 4, reps: '8', reason: 'Shoulders - Mass' },
            { name: 'Upright Rows', sets: 3, reps: '12', reason: 'Shoulders - Traps' },
            { name: 'Shrugs', sets: 4, reps: '15', reason: 'Shoulders - Traps' },
            { name: 'Arnold Press', sets: 3, reps: '12', reason: 'Shoulders - Range' }
          ] 
        },
        Sunday: { type: 'rest', planName: 'Rest Day', exercises: [] }
      };
      schedule = await WeeklySchedule.create({ 
        userId: req.user._id,
        days: defaultDays
      });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const { days } = req.body;
    const schedule = await WeeklySchedule.findOneAndUpdate(
      { userId: req.user._id },
      { days, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    
    // Notify all client instances for this user
    emitToUser(req.user._id, 'SCHEDULE_UPDATED', {
      message: 'Your weekly workout schedule has been updated!',
      schedule
    });

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

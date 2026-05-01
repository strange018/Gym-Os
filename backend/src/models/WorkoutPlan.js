import mongoose from 'mongoose';

const workoutPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['prebuilt', 'ai_generated', 'custom'] },
  exercises: [{
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
    sets: Number,
    reps: String,
    weight: Number,
    restTime: Number
  }],
  frequency: [String], // Days of the week
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
export default WorkoutPlan;

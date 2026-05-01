import mongoose from 'mongoose';

const workoutSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  calories: { type: Number, default: 0 },
  volume: { type: Number, default: 0 }, // in kg
  exercises: [{
    name: String,
    sets: Number,
    reps: Number,
    weight: Number
  }],
  date: { type: Date, default: Date.now }
});

const WorkoutSession = mongoose.model('WorkoutSession', workoutSessionSchema);
export default WorkoutSession;

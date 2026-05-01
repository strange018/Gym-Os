import mongoose from 'mongoose';

const workoutLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  duration: Number, // in minutes
  exercises: [{
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
    sets: [{
      reps: Number,
      weight: Number,
      difficulty: Number // 1-10 RPE
    }]
  }],
  aiFeedback: String,
  mood: String,
  soreness: Number // 1-10
});

const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);
export default WorkoutLog;

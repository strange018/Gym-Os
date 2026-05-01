import mongoose from 'mongoose';

const weeklyScheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  days: {
    Monday: { 
      type: { type: String, enum: ['workout', 'rest'], default: 'rest' },
      planName: String,
      exercises: [{
        name: String,
        sets: Number,
        reps: String,
        reason: String
      }]
    },
    Tuesday: { 
      type: { type: String, enum: ['workout', 'rest'], default: 'rest' },
      planName: String,
      exercises: [{
        name: String,
        sets: Number,
        reps: String,
        reason: String
      }]
    },
    Wednesday: { 
      type: { type: String, enum: ['workout', 'rest'], default: 'rest' },
      planName: String,
      exercises: [{
        name: String,
        sets: Number,
        reps: String,
        reason: String
      }]
    },
    Thursday: { 
      type: { type: String, enum: ['workout', 'rest'], default: 'rest' },
      planName: String,
      exercises: [{
        name: String,
        sets: Number,
        reps: String,
        reason: String
      }]
    },
    Friday: { 
      type: { type: String, enum: ['workout', 'rest'], default: 'rest' },
      planName: String,
      exercises: [{
        name: String,
        sets: Number,
        reps: String,
        reason: String
      }]
    },
    Saturday: { 
      type: { type: String, enum: ['workout', 'rest'], default: 'rest' },
      planName: String,
      exercises: [{
        name: String,
        sets: Number,
        reps: String,
        reason: String
      }]
    },
    Sunday: { 
      type: { type: String, enum: ['workout', 'rest'], default: 'rest' },
      planName: String,
      exercises: [{
        name: String,
        sets: Number,
        reps: String,
        reason: String
      }]
    }
  },
  updatedAt: { type: Date, default: Date.now }
});

const WeeklySchedule = mongoose.model('WeeklySchedule', weeklyScheduleSchema);
export default WeeklySchedule;

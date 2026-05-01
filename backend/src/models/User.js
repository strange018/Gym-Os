import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    age: Number,
    weight: Number,
    height: Number,
    goal: { type: String, enum: ['muscle_gain', 'fat_loss', 'maintenance', 'athleticism'] },
    experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    availableEquipment: [String],
    gender: { type: String, enum: ['male', 'female', 'other'] }
  },
  stats: {
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    activeTime: { type: Number, default: 0 }, // in minutes
    lastWorkoutDate: Date,
    achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }]
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
export default User;

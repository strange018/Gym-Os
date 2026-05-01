import mongoose from 'mongoose';

const mealLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
  type: { type: String, enum: ['Breakfast', 'Lunch', 'Evening', 'Dinner', 'Snack'] },
  date: { type: Date, default: Date.now }
});

const MealLog = mongoose.model('MealLog', mealLogSchema);
export default MealLog;

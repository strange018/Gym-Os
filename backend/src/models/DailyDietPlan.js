import mongoose from 'mongoose';

const mealItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  image: { type: String },
  type: { type: String }
});

const dailyDietPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  meals: [mealItemSchema],
  insight: { type: String }
});

const DailyDietPlan = mongoose.model('DailyDietPlan', dailyDietPlanSchema);
export default DailyDietPlan;

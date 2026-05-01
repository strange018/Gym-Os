import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Breakfast', 'Lunch', 'Evening', 'Dinner'], required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  cost: { type: Number, required: true },
  image: { type: String },
  isVegetarian: { type: Boolean, default: false }
});

const Meal = mongoose.model('Meal', mealSchema);
export default Meal;

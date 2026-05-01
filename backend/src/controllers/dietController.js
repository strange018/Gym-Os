import Meal from '../models/Meal.js';
import MealLog from '../models/MealLog.js';
import DailyDietPlan from '../models/DailyDietPlan.js';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const getDailyDiet = async (req, res) => {
  try {
    const { budget, goal, vegOnly } = req.query;
    const isVegOnly = vegOnly === 'true';
    const user = req.user;
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Check if a plan already exists for today
    const existingPlan = await DailyDietPlan.findOne({ userId: user._id, date: todayStr });
    if (existingPlan && !req.query.refresh) {
      return res.json(existingPlan);
    }

    // 2. Otherwise generate a new one
    let allMeals = await Meal.find({});
    if (isVegOnly) {
      allMeals = allMeals.filter(m => m.isVegetarian);
    }

    if (allMeals.length === 0) {
      return res.status(404).json({ message: 'No meals found in database.' });
    }

    const prompt = `
      User Profile: ${JSON.stringify(user.profile)}
      Available Meals: ${JSON.stringify(allMeals.map(m => ({ id: m._id, name: m.name, type: m.type, cost: m.cost, protein: m.protein, calories: m.calories, isVeg: m.isVegetarian })))}
      Daily Budget: ₹${budget || 500}
      User Goal: ${goal || 'muscle_gain'}
      Preference: ${isVegOnly ? 'VEGETARIAN ONLY' : 'ANY'}
      
      Generate a daily diet plan (Breakfast, Lunch, Evening, Dinner).
      Return ONLY JSON: { "meals": [{ "id": "meal_mongodb_id", "type": "Breakfast" }, ...], "insight": "..." }
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const recommendation = JSON.parse(response.choices[0].message.content);
    const finalMeals = recommendation.meals.map(rec => {
      const fullMeal = allMeals.find(m => m._id.toString() === rec.id);
      if (!fullMeal) return null;
      return {
        name: fullMeal.name,
        calories: fullMeal.calories,
        protein: fullMeal.protein,
        carbs: fullMeal.carbs,
        fats: fullMeal.fats,
        cost: fullMeal.cost,
        image: fullMeal.image,
        type: rec.type
      };
    }).filter(m => m !== null);

    // 3. Save for today
    const newPlan = await DailyDietPlan.findOneAndUpdate(
      { userId: user._id, date: todayStr },
      { meals: finalMeals, insight: recommendation.insight },
      { upsert: true, new: true, runValidators: true }
    );

    res.json(newPlan);
  } catch (error) {
    console.error("Diet Planning Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getMeals = async (req, res) => {
  try {
    const { vegOnly } = req.query;
    let query = {};
    if (vegOnly === 'true') {
      query.isVegetarian = true;
    }
    const meals = await Meal.find(query);
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logMeal = async (req, res) => {
  try {
    const { name, calories, protein, carbs, fats, type } = req.body;
    const log = await MealLog.create({
      userId: req.user._id,
      name,
      calories,
      protein,
      carbs,
      fats,
      type
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyIntake = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const logs = await MealLog.find({
      userId: req.user._id,
      date: { $gte: today }
    });
    
    const summary = logs.reduce((acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fats: acc.fats + (log.fats || 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

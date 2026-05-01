import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Meal from '../models/Meal.js';
import Exercise from '../models/Exercise.js';

dotenv.config();

const meals = [
  // BREAKFAST (20 items)
  { name: "6 Egg Whites + Oats", type: "Breakfast", calories: 450, protein: 35, carbs: 45, fats: 8, cost: 60, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=2080", isVegetarian: false },
  { name: "Paneer Bhurji (100g) + 2 Brown Bread", type: "Breakfast", calories: 380, protein: 24, carbs: 30, fats: 18, cost: 80, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080", isVegetarian: true },
  { name: "Oatmeal with Whey & Banana", type: "Breakfast", calories: 420, protein: 30, carbs: 55, fats: 6, cost: 70, image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?q=80&w=2080", isVegetarian: true },
  { name: "Moong Dal Chilla (3) + Curd", type: "Breakfast", calories: 350, protein: 18, carbs: 40, fats: 10, cost: 40, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=2080", isVegetarian: true },
  { name: "Peanut Butter Toast (2) + Milk", type: "Breakfast", calories: 480, protein: 20, carbs: 50, fats: 22, cost: 50, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=2080", isVegetarian: true },
  { name: "Scrambled Tofu + Multigrain Toast", type: "Breakfast", calories: 360, protein: 22, carbs: 35, fats: 12, cost: 90, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2080", isVegetarian: true },
  { name: "Greek Yogurt with Berries & Nuts", type: "Breakfast", calories: 320, protein: 25, carbs: 25, fats: 12, cost: 120, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=2080", isVegetarian: true },
  { name: "Chicken Sausage (3) + 2 Eggs", type: "Breakfast", calories: 410, protein: 28, carbs: 5, fats: 30, cost: 110, image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=2080", isVegetarian: false },
  { name: "Poha with Roasted Peanuts", type: "Breakfast", calories: 340, protein: 10, carbs: 50, fats: 12, cost: 30, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=2080", isVegetarian: true },
  { name: "Besan Chilla with Paneer Stuffing", type: "Breakfast", calories: 390, protein: 20, carbs: 35, fats: 18, cost: 55, image: "https://images.unsplash.com/photo-1601050690597-df056fb04791?q=80&w=2080", isVegetarian: true },
  { name: "Sprouted Salad with Lemon & Masala", type: "Breakfast", calories: 280, protein: 15, carbs: 45, fats: 4, cost: 35, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2080", isVegetarian: true },
  { name: "Idli (4) + Sambar", type: "Breakfast", calories: 320, protein: 12, carbs: 65, fats: 2, cost: 45, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=2080", isVegetarian: true },
  { name: "Upma with Mixed Veggies", type: "Breakfast", calories: 310, protein: 8, carbs: 55, fats: 7, cost: 40, image: "https://images.unsplash.com/photo-1601050690597-df056fb04791?q=80&w=2080", isVegetarian: true },
  { name: "Veg Cheese Sandwich", type: "Breakfast", calories: 420, protein: 15, carbs: 45, fats: 20, cost: 65, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=2080", isVegetarian: true },
  { name: "Boiled Eggs (4) + 1 Apple", type: "Breakfast", calories: 360, protein: 24, carbs: 20, fats: 20, cost: 60, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=2080", isVegetarian: false },
  { name: "Avocado Toast with Sourdough", type: "Breakfast", calories: 450, protein: 12, carbs: 40, fats: 28, cost: 180, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=2080", isVegetarian: true },
  { name: "Ragi Malt with Milk & Jaggery", type: "Breakfast", calories: 340, protein: 10, carbs: 60, fats: 6, cost: 40, image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?q=80&w=2080", isVegetarian: true },
  { name: "Chicken Breast Sandwich", type: "Breakfast", calories: 440, protein: 35, carbs: 35, fats: 15, cost: 130, image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=2080", isVegetarian: false },
  { name: "Muesli with Cold Milk & Fruits", type: "Breakfast", calories: 380, protein: 12, carbs: 65, fats: 8, cost: 75, image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?q=80&w=2080", isVegetarian: true },
  { name: "Whole Wheat Pancakes (2) + Honey", type: "Breakfast", calories: 350, protein: 10, carbs: 60, fats: 8, cost: 90, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=2080", isVegetarian: true },

  // LUNCH (20 items)
  { name: "Grilled Chicken (200g) + Brown Rice", type: "Lunch", calories: 650, protein: 50, carbs: 60, fats: 12, cost: 180, image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?q=80&w=2080", isVegetarian: false },
  { name: "Dal Tadka + 2 Roti + Mix Veg", type: "Lunch", calories: 480, protein: 18, carbs: 70, fats: 14, cost: 90, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080", isVegetarian: true },
  { name: "Soya Chunks Curry + White Rice", type: "Lunch", calories: 520, protein: 35, carbs: 65, fats: 12, cost: 70, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2080", isVegetarian: true },
  { name: "Paneer Tikka (150g) + 1 Naan", type: "Lunch", calories: 580, protein: 28, carbs: 50, fats: 25, cost: 150, image: "https://images.unsplash.com/photo-1567184109411-b2861c049950?q=80&w=2080", isVegetarian: true },
  { name: "Fish Curry + Steamed Rice", type: "Lunch", calories: 540, protein: 30, carbs: 60, fats: 18, cost: 200, image: "https://images.unsplash.com/photo-1534939561126-302120098f9a?q=80&w=2080", isVegetarian: false },
  { name: "Rajma Chawal + Salad", type: "Lunch", calories: 510, protein: 18, carbs: 85, fats: 10, cost: 80, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=2080", isVegetarian: true },
  { name: "Chole Bhature (2)", type: "Lunch", calories: 750, protein: 20, carbs: 95, fats: 35, cost: 100, image: "https://images.unsplash.com/photo-1601050690597-df056fb04791?q=80&w=2080", isVegetarian: true },
  { name: "Chicken Biryani + Raita", type: "Lunch", calories: 850, protein: 45, carbs: 90, fats: 28, cost: 250, image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=2080", isVegetarian: false },
  { name: "Tofu Stir Fry with Quinoa", type: "Lunch", calories: 480, protein: 28, carbs: 55, fats: 14, cost: 220, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2080", isVegetarian: true },
  { name: "Kadhi Pakora + Rice", type: "Lunch", calories: 560, protein: 15, carbs: 80, fats: 20, cost: 85, image: "https://images.unsplash.com/photo-1601050690597-df056fb04791?q=80&w=2080", isVegetarian: true },
  { name: "Mutton Curry (150g) + 2 Roti", type: "Lunch", calories: 680, protein: 40, carbs: 40, fats: 32, cost: 350, image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2080", isVegetarian: false },
  { name: "Egg Curry (3) + Rice", type: "Lunch", calories: 540, protein: 25, carbs: 65, fats: 22, cost: 95, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080", isVegetarian: false },
  { name: "Aloo Gobhi + 3 Roti + Curd", type: "Lunch", calories: 490, protein: 15, carbs: 75, fats: 16, cost: 80, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2080", isVegetarian: true },
  { name: "Bhindi Masala + 3 Roti", type: "Lunch", calories: 420, protein: 12, carbs: 70, fats: 14, cost: 70, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2080", isVegetarian: true },
  { name: "Lentil Soup with Whole Wheat Bread", type: "Lunch", calories: 400, protein: 22, carbs: 60, fats: 6, cost: 60, image: "https://images.unsplash.com/photo-1547592115-3850027732a6?q=80&w=2080", isVegetarian: true },
  { name: "Stuffed Paratha (2) + Pickle + Curd", type: "Lunch", calories: 620, protein: 16, carbs: 85, fats: 28, cost: 90, image: "https://images.unsplash.com/photo-1601050690597-df056fb04791?q=80&w=2080", isVegetarian: true },
  { name: "Pasta with Veggies in Red Sauce", type: "Lunch", calories: 520, protein: 15, carbs: 85, fats: 12, cost: 110, image: "https://images.unsplash.com/photo-1533777419517-3e4017e2e15a?q=80&w=2080", isVegetarian: true },
  { name: "Beef Steak (150g) + Mashed Potatoes", type: "Lunch", calories: 720, protein: 45, carbs: 45, fats: 35, cost: 450, image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2080", isVegetarian: false },
  { name: "Masoor Dal + Rice + Fish Fry", type: "Lunch", calories: 640, protein: 35, carbs: 70, fats: 22, cost: 160, image: "https://images.unsplash.com/photo-1534939561126-302120098f9a?q=80&w=2080", isVegetarian: false },
  { name: "Black Eyed Peas Curry + 2 Roti", type: "Lunch", calories: 460, protein: 20, carbs: 65, fats: 12, cost: 75, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2080", isVegetarian: true },

  // EVENING (20 items)
  { name: "Whey Protein + 1 Banana", type: "Evening", calories: 250, protein: 26, carbs: 30, fats: 2, cost: 65, image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=2080", isVegetarian: true },
  { name: "Roasted Chana (50g)", type: "Evening", calories: 180, protein: 9, carbs: 28, fats: 4, cost: 20, image: "https://images.unsplash.com/photo-1601050690597-df056fb04791?q=80&w=2080", isVegetarian: true },
  { name: "Boiled Chickpeas with Onion & Tomato", type: "Evening", calories: 210, protein: 12, carbs: 35, fats: 3, cost: 25, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2080", isVegetarian: true },
  { name: "Greek Yogurt (1 cup)", type: "Evening", calories: 150, protein: 15, carbs: 10, fats: 4, cost: 80, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=2080", isVegetarian: true },
  { name: "Almonds & Walnuts (Handful)", type: "Evening", calories: 190, protein: 6, carbs: 5, fats: 18, cost: 50, image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?q=80&w=2080", isVegetarian: true },
  { name: "Hard Boiled Eggs (2)", type: "Evening", calories: 150, protein: 12, carbs: 1, fats: 10, cost: 20, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=2080", isVegetarian: false },
  { name: "Peanut Butter Celery Sticks", type: "Evening", calories: 220, protein: 8, carbs: 12, fats: 16, cost: 45, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=2080", isVegetarian: true },
  { name: "Fruit Salad (Mix)", type: "Evening", calories: 120, protein: 1, carbs: 30, fats: 0, cost: 50, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2080", isVegetarian: true },
  { name: "Cottage Cheese (100g)", type: "Evening", calories: 100, protein: 12, carbs: 4, fats: 4, cost: 60, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=2080", isVegetarian: true },
  { name: "Hummus with Carrot Sticks", type: "Evening", calories: 180, protein: 6, carbs: 20, fats: 10, cost: 70, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2080", isVegetarian: true },
  { name: "Protein Bar", type: "Evening", calories: 220, protein: 20, carbs: 25, fats: 7, cost: 100, image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=2080", isVegetarian: true },
  { name: "Roasted Makhana (Lotus Seeds)", type: "Evening", calories: 160, protein: 5, carbs: 30, fats: 2, cost: 40, image: "https://images.unsplash.com/photo-1601050690597-df056fb04791?q=80&w=2080", isVegetarian: true },
  { name: "Coffee + 2 Digestive Biscuits", type: "Evening", calories: 180, protein: 3, carbs: 25, fats: 8, cost: 30, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2080", isVegetarian: true },
  { name: "Soy Milk (250ml)", type: "Evening", calories: 110, protein: 8, carbs: 10, fats: 4, cost: 55, image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=2080", isVegetarian: true },
  { name: "Chicken Soup (1 bowl)", type: "Evening", calories: 180, protein: 15, carbs: 10, fats: 8, cost: 90, image: "https://images.unsplash.com/photo-1547592115-3850027732a6?q=80&w=2080", isVegetarian: false },
  { name: "Green Tea + Steamed Corn", type: "Evening", calories: 140, protein: 4, carbs: 30, fats: 1, cost: 35, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2080", isVegetarian: true },
  { name: "Peanut Salad", type: "Evening", calories: 240, protein: 10, carbs: 15, fats: 18, cost: 45, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2080", isVegetarian: true },
  { name: "Oatmeal Cookie (2)", type: "Evening", calories: 200, protein: 4, carbs: 30, fats: 8, cost: 40, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=2080", isVegetarian: true },
  { name: "Bhelpuri (Dry)", type: "Evening", calories: 220, protein: 6, carbs: 40, fats: 5, cost: 30, image: "https://images.unsplash.com/photo-1601050690597-df056fb04791?q=80&w=2080", isVegetarian: true },
  { name: "Tender Coconut Water + Malai", type: "Evening", calories: 150, protein: 2, carbs: 20, fats: 8, cost: 60, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2080", isVegetarian: true },

  // DINNER (20 items)
  { name: "Grilled Fish (200g) + Asparagus", type: "Dinner", calories: 450, protein: 45, carbs: 10, fats: 25, cost: 300, image: "https://images.unsplash.com/photo-1534939561126-302120098f9a?q=80&w=2080", isVegetarian: false },
  { name: "Paneer Steak + Sautéed Veggies", type: "Dinner", calories: 420, protein: 25, carbs: 15, fats: 30, cost: 160, image: "https://images.unsplash.com/photo-1567184109411-b2861c049950?q=80&w=2080", isVegetarian: true },
  { name: "Chicken Stir Fry + Broccoli", type: "Dinner", calories: 480, protein: 50, carbs: 12, fats: 22, cost: 190, image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?q=80&w=2080", isVegetarian: false },
  { name: "Lentil Pasta with Mushrooms", type: "Dinner", calories: 440, protein: 25, carbs: 65, fats: 8, cost: 140, image: "https://images.unsplash.com/photo-1533777419517-3e4017e2e15a?q=80&w=2080", isVegetarian: true },
  { name: "Turkey Breast (200g) + Salad", type: "Dinner", calories: 380, protein: 55, carbs: 5, fats: 12, cost: 400, image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=2080", isVegetarian: false },
  { name: "Mix Vegetable Soup + Tofu", type: "Dinner", calories: 320, protein: 20, carbs: 25, fats: 14, cost: 120, image: "https://images.unsplash.com/photo-1547592115-3850027732a6?q=80&w=2080", isVegetarian: true },
  { name: "Quinoa Bowl with Avocado & Chickpeas", type: "Dinner", calories: 550, protein: 18, carbs: 65, fats: 28, cost: 250, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2080", isVegetarian: true },
  { name: "Grilled Shrimp (150g) + Zucchini Noodles", type: "Dinner", calories: 350, protein: 35, carbs: 10, fats: 18, cost: 350, image: "https://images.unsplash.com/photo-1534939561126-302120098f9a?q=80&w=2080", isVegetarian: false },
  { name: "Moong Dal Khichdi + Curd", type: "Dinner", calories: 420, protein: 15, carbs: 70, fats: 10, cost: 60, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=2080", isVegetarian: true },
  { name: "Soya Chaap Curry + 1 Missi Roti", type: "Dinner", calories: 580, protein: 30, carbs: 55, fats: 28, cost: 130, image: "https://images.unsplash.com/photo-1601050690597-df056fb04791?q=80&w=2080", isVegetarian: true },
  { name: "Palak Paneer + 2 Bajra Roti", type: "Dinner", calories: 520, protein: 22, carbs: 60, fats: 22, cost: 110, image: "https://images.unsplash.com/photo-1567184109411-b2861c049950?q=80&w=2080", isVegetarian: true },
  { name: "Lemon Garlic Chicken + Green Beans", type: "Dinner", calories: 460, protein: 48, carbs: 10, fats: 22, cost: 200, image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?q=80&w=2080", isVegetarian: false },
  { name: "Stir Fried Mix Veggies with Cashews", type: "Dinner", calories: 380, protein: 10, carbs: 30, fats: 25, cost: 140, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2080", isVegetarian: true },
  { name: "Pumpkin Soup + Whole Grain Crackers", type: "Dinner", calories: 290, protein: 8, carbs: 45, fats: 10, cost: 80, image: "https://images.unsplash.com/photo-1547592115-3850027732a6?q=80&w=2080", isVegetarian: true },
  { name: "Baked Salmon + Steamed Broccoli", type: "Dinner", calories: 520, protein: 40, carbs: 8, fats: 35, cost: 500, image: "https://images.unsplash.com/photo-1534939561126-302120098f9a?q=80&w=2080", isVegetarian: false },
  { name: "Yellow Moong Dal + 2 Bran Roti", type: "Dinner", calories: 380, protein: 16, carbs: 60, fats: 8, cost: 65, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080", isVegetarian: true },
  { name: "Scrambled Eggs (3) + Spinach Salad", type: "Dinner", calories: 320, protein: 22, carbs: 10, fats: 20, cost: 75, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=2080", isVegetarian: false },
  { name: "Tofu & Mushroom Curry", type: "Dinner", calories: 360, protein: 20, carbs: 20, fats: 22, cost: 130, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2080", isVegetarian: true },
  { name: "Mashed Sweet Potato + Grilled Chicken", type: "Dinner", calories: 580, protein: 45, carbs: 55, fats: 15, cost: 180, image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?q=80&w=2080", isVegetarian: false },
  { name: "Spaghetti Squash with Marinara", type: "Dinner", calories: 310, protein: 8, carbs: 45, fats: 12, cost: 160, image: "https://images.unsplash.com/photo-1533777419517-3e4017e2e15a?q=80&w=2080", isVegetarian: true }
];

const exercises = [
  { name: "Bench Press", muscleGroup: "Chest", equipment: ["Barbell"], difficulty: "intermediate" },
  { name: "Squats", muscleGroup: "Legs", equipment: ["Barbell"], difficulty: "intermediate" },
  { name: "Deadlifts", muscleGroup: "Back", equipment: ["Barbell"], difficulty: "advanced" },
  { name: "Overhead Press", muscleGroup: "Shoulders", equipment: ["Dumbbells"], difficulty: "intermediate" },
  { name: "Pull Ups", muscleGroup: "Back", equipment: ["Bodyweight"], difficulty: "advanced" },
  { name: "Push Ups", muscleGroup: "Chest", equipment: ["Bodyweight"], difficulty: "beginner" },
  { name: "Lunges", muscleGroup: "Legs", equipment: ["Bodyweight"], difficulty: "beginner" },
  { name: "Plank", muscleGroup: "Core", equipment: ["Bodyweight"], difficulty: "beginner" },
  { name: "Bicep Curls", muscleGroup: "Arms", equipment: ["Dumbbells"], difficulty: "beginner" },
  { name: "Tricep Dips", muscleGroup: "Arms", equipment: ["Bench"], difficulty: "beginner" }
];

export async function seedDB() {
  try {
    console.log('🌱 Checking if database needs seeding...');
    
    // Check if meals already exist
    const mealCount = await Meal.countDocuments();
    if (mealCount > 0) {
      console.log('✅ Database already has meals. Skipping seed.');
      return;
    }

    console.log('🚀 Seeding database...');
    await Meal.deleteMany({});
    await Exercise.deleteMany({});
    await Meal.insertMany(meals);
    await Exercise.insertMany(exercises);
    console.log('✅ Auto-Seeded 80 meals and 10 exercises.');
  } catch (error) {
    console.error('❌ Seeding Error:', error);
  }
}

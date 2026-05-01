import WorkoutSession from '../models/WorkoutSession.js';
import Exercise from '../models/Exercise.js';
import WorkoutPlan from '../models/WorkoutPlan.js';
import User from '../models/User.js';
import { generateWorkoutRecommendation } from '../utils/aiService.js';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find({});
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyWorkout = async (req, res) => {
  try {
    const user = req.user;
    const history = await WorkoutSession.find({ userId: user._id }).sort({ date: -1 }).limit(5);

    const recommendation = await generateWorkoutRecommendation(user.profile, history);
    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logWorkout = async (req, res) => {
  try {
    const { name, exercises, duration, calories, volume } = req.body;
    const session = await WorkoutSession.create({
      userId: req.user._id,
      name: name || 'Custom Workout',
      exercises,
      duration,
      calories,
      volume,
      date: new Date()
    });
    
    // Update user XP, streak and activeTime
    const user = await User.findById(req.user._id);
    if (user) {
      const xpEarned = Math.floor((duration * 2) + (volume / 100));
      user.stats.xp += xpEarned;
      user.stats.activeTime += duration;
      
      // Streak Logic
      const now = new Date();
      const last = user.stats.lastWorkoutDate;
      if (last) {
        const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          user.stats.streak += 1;
        } else if (diffDays > 1) {
          user.stats.streak = 1;
        }
      } else {
        user.stats.streak = 1;
      }
      
      user.stats.lastWorkoutDate = now;
      
      // Simple level calculation
      user.stats.level = Math.floor(user.stats.xp / 1000) + 1;
      
      await user.save();
    }

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkoutHistory = async (req, res) => {
  try {
    const sessions = await WorkoutSession.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyInsights = async (req, res) => {
  try {
    const history = await WorkoutSession.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(5);
    
    const user = await User.findById(req.user._id);
    
    const prompt = `
      User Stats: ${JSON.stringify(user.stats)}
      Recent History: ${JSON.stringify(history)}
      Goal: ${user.profile?.goal}
      
      Provide a brief (1 sentence) motivating AI coach insight for today.
    `;
    
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });
    
    res.json({ insight: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

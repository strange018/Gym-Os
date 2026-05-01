import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Strict gym-only system prompt ────────────────────────────────────────
const SYSTEM_PROMPT = `You are an elite AI Fitness Coach specializing exclusively in gym, fitness, and nutrition.

STRICT RULES:
1. ONLY answer questions about: workouts, exercises, gym equipment, training programs, 
   sports nutrition, recovery, fitness goals, body composition, form/technique, 
   injury prevention, supplements, and healthy lifestyle habits related to fitness.
2. If the user asks ANYTHING outside fitness/gym/nutrition — politics, coding, 
   general knowledge, etc. — respond ONLY with:
   "I'm your gym-focused coach! I can only help with fitness, workouts, and nutrition. 
   Ask me anything about training or health! 💪"
3. Never break character. Never pretend to be a general assistant.
4. Keep answers clear, concise, science-based, and motivating.
5. Use bullet points or numbered steps for workout plans.
6. When suggesting exercises, always mention sets, reps, and form cues.`;

// ─── Main chat function ────────────────────────────────────────────────────
export const chatWithCoach = async (messages) => {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages   // full conversation history for context
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    return {
      success: true,
      message: response.choices[0].message.content
    };
  } catch (error) {
    console.error("Groq Chat Error:", error);
    return {
      success: false,
      message: "I'm having a quick breather 😅 Try again in a moment!"
    };
  }
};

// ─── Workout plan generator (kept for other uses) ─────────────────────────
export const generateWorkoutRecommendation = async (userData, history) => {
  try {
    const prompt = `
      User Profile: ${JSON.stringify(userData)}
      Workout History: ${JSON.stringify(history)}
      Generate a comprehensive personalized workout plan for today with 4-6 exercises. 
      Return ONLY JSON in this format: 
      { 
        "plan": [
          { "name": "Exercise Name", "sets": 3, "reps": "10-12", "reason": "Why this is included" },
          ...
        ] 
      }
    `;
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024,
    });
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    return {
      plan: [
        { name: "Push Ups", sets: 3, reps: "15", reason: "Maintain chest volume" },
        { name: "Air Squats", sets: 3, reps: "20", reason: "Lower body activation" }
      ]
    };
  }
};
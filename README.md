# AI Gym OS 🚀

AI Gym OS is a production-ready, AI-powered fitness platform designed to provide a personalized, gamified, and intelligent workout experience.

## ✨ Key Features

- **Adaptive AI Engine**: Workouts that evolve based on your performance, fatigue, and recovery.
- **Webcam AI Trainer**: Real-time pose detection and rep counting using MediaPipe/TensorFlow.js.
- **AI Coach**: A conversational interface for 24/7 fitness guidance and motivation.
- **Indian Diet AI**: Budget-friendly meal planning focused on Indian cuisine.
- **Gamification**: XP, Levels, and Streaks to keep you motivated.
- **Progress Tracking**: Advanced charts and insights into your fitness journey.

## 🛠 Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, Socket.io.
- **Database**: MongoDB (Mongoose).
- **AI/ML**: Groq Cloud (Llama 3.3), MediaPipe Pose Detection.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Running locally or via Atlas)
- Groq API Key (for ultra-fast AI inference)


### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your credentials:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ai-gym-os
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_key
   ```
4. Seed the database with initial exercises:
   ```bash
   npm run seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Folder Structure

- `frontend/src/app`: Next.js App Router pages and layouts.
- `frontend/src/components`: Reusable UI components (Sidebar, etc.).
- `backend/src/models`: Mongoose schemas for Users, Workouts, etc.
- `backend/src/controllers`: Business logic for API endpoints.
- `backend/src/routes`: Express API route definitions.
- `backend/src/utils`: AI services and utility functions.

## 🛡 License

MIT License

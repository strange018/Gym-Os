import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';

import authRoutes from './routes/authRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import dietRoutes from './routes/dietRoutes.js';
import coachRoutes from './routes/coachRoutes.js';
import userRoutes from './routes/userRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import { initSocket, emitToUser } from './utils/socket.js';
import { seedDB } from './utils/seed.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/user', userRoutes);
app.use('/api/schedule', scheduleRoutes);




const PORT = process.env.PORT || 5000;
const MONGO_URI = (process.env.MONGO_URI || 'mongodb://localhost:27017/ai-gym-os')
  .trim()
  .replace(/^MONGO_URI=/, '')
  .replace(/^["']|["']$/g, '');

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    await seedDB(); // Automatically seed if DB is empty
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

initSocket(io);

// Socket.io for real-time AI feedback and coaching
io.on('connection', (socket) => {
  console.log('🔌 New Client Connected:', socket.id);

  // Join user-specific room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
    
    // Send a welcome update
    socket.emit('live_update', {
      type: 'SYSTEM',
      message: 'Connection established with AI Training Core',
      timestamp: new Date()
    });
  });

  // Handle live workout progress
  socket.on('workout_progress', (data) => {
    const { userId, exercise, rep, set } = data;
    // Broadcast back to the user's room (so other tabs/dashboard can see it)
    emitToUser(userId, 'WORKOUT_PROGRESS', {
      message: `Completed ${rep} reps of ${exercise} (Set ${set})`,
      exercise,
      rep,
      set
    });
  });

  // Handle workout completion
  socket.on('workout_complete', (data) => {
    const { userId, stats } = data;
    emitToUser(userId, 'WORKOUT_COMPLETE', {
      message: 'Workout Session Finished! Stats synchronized.',
      stats
    });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client Disconnected');
  });
});

// Simulate real-time data updates (Social & AI)
setInterval(() => {
  const updates = [
    {
      type: 'XP_EARNED',
      message: `A fellow athlete just earned ${Math.floor(Math.random() * 10) + 5} XP!`,
    },
    {
      type: 'AI_INSIGHT',
      message: `AI Coach: Your form on Squats is improving. Try increasing depth by 2 inches.`,
    },
    {
      type: 'SYSTEM',
      message: `New community challenge: 500 Pushups this week!`,
    }
  ];
  
  const update = updates[Math.floor(Math.random() * updates.length)];
  io.emit('live_update', {
    ...update,
    timestamp: new Date()
  });
}, 20000); // Every 20 seconds

app.get('/', (req, res) => {
  res.send('AI Gym OS API is running...');
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('📡 Attempting to connect to MongoDB Atlas...');
});

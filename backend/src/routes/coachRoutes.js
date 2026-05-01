import express from 'express';
import { chatWithCoach } from '../utils/aiService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: 'Messages are required' });
  }

  const result = await chatWithCoach(messages);

  if (result.success) {
    res.json({ message: result.message });
  } else {
    res.status(500).json({ message: result.message });
  }
});

export default router;

import User from '../models/User.js';
import WeightLog from '../models/WeightLog.js';

export const getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('stats profile');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Return both stats and current profile weight
    res.json({
      ...user.stats.toObject(),
      weight: user.profile.weight
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logWeight = async (req, res) => {
  try {
    const { weight } = req.body;
    
    // Create log entry
    await WeightLog.create({
      userId: req.user._id,
      weight
    });
    
    // Update user profile
    const user = await User.findById(req.user._id);
    user.profile.weight = weight;
    await user.save();
    
    res.json({ message: 'Weight logged successfully', weight });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWeightHistory = async (req, res) => {
  try {
    const history = await WeightLog.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

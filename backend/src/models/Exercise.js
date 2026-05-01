import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  muscleGroup: { type: String, required: true },
  equipment: [String],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  instructions: [String],
  image: String,
  videoUrl: String,
  alternativeExercises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }]
});

const Exercise = mongoose.model('Exercise', exerciseSchema);
export default Exercise;

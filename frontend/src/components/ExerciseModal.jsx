"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Dumbbell, 
  Target, 
  Flame, 
  Play, 
  CheckCircle2,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ExerciseModal({ exercise, isOpen, onClose, onStart, onAddToRoutine }) {
  if (!exercise) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-4xl glass rounded-[2.5rem] border border-white/10 overflow-hidden relative z-10 flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Image/Video Section */}
            <div className="md:w-1/2 h-64 md:h-auto relative overflow-hidden">
              <img 
                src={exercise.image || "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop"} 
                className="w-full h-full object-cover" 
                alt={exercise.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute top-6 left-6">
                <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest shadow-lg">
                  {exercise.muscleGroup}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-between overflow-y-auto custom-scrollbar">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all z-20"
              >
                <X size={20} />
              </button>

              <div>
                <h2 className="text-4xl font-bold mb-2">{exercise.name}</h2>
                <div className="flex items-center gap-6 mb-8 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Dumbbell size={16} className="text-primary" />
                    <span className="text-sm font-medium">{exercise.difficulty || 'Intermediate'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <span className="text-sm font-medium">12 mins</span>
                  </div>
                </div>

                <div className="space-y-6 mb-10">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {exercise.description || "Master this movement with precision. This exercise targets your primary muscle groups while building functional strength and stability. AI tracking is recommended for optimal form."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Target Muscle</h4>
                      <p className="font-bold">{exercise.muscleGroup}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Equipment</h4>
                      <p className="font-bold">{exercise.equipment || "Standard"}</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-3xl bg-primary/5 border border-primary/20 flex items-start gap-3">
                    <Info className="text-primary w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-primary uppercase tracking-widest">AI Performance Tip</p>
                      <p className="text-xs leading-relaxed text-foreground/80 italic">
                        "Ensure full range of motion. For {exercise.name}, focus on the eccentric phase to maximize hypertrophy."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 sticky bottom-0 bg-transparent">
                <button 
                  onClick={() => {
                    onStart(exercise);
                    onClose();
                  }}
                  className="flex-1 bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,242,254,0.4)] hover:scale-[1.02] transition-all"
                >
                  <Play size={20} fill="currentColor" />
                  Start Now
                </button>
                <button 
                  onClick={() => {
                    onAddToRoutine(exercise);
                    onClose();
                  }}
                  className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-sm hover:bg-white/10 transition-all"
                >
                  Add to Routine
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

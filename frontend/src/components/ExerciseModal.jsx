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
            className="w-full max-w-4xl glass rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 overflow-hidden relative z-10 flex flex-col md:flex-row h-full max-h-[95vh] md:max-h-[90vh]"
          >
            {/* Image/Video Section */}
            <div className="md:w-1/2 h-48 sm:h-64 md:h-auto relative overflow-hidden shrink-0">
              <img 
                src={exercise.image || "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop"} 
                className="w-full h-full object-cover" 
                alt={exercise.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent md:hidden" />
              <div className="absolute top-4 left-4 md:top-6 md:left-6">
                <span className="px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-lg">
                  {exercise.muscleGroup}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 md:p-12 flex flex-col justify-between overflow-y-auto custom-scrollbar relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all z-20"
              >
                <X className="w-4.5 h-4.5 md:w-5 md:h-5" />
              </button>

              <div>
                <h2 className="text-2xl md:text-4xl font-bold mb-2 pr-10">{exercise.name}</h2>
                <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8 text-muted-foreground">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Dumbbell className="text-primary w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm font-medium">{exercise.difficulty || 'Intermediate'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Clock className="text-primary w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm font-medium">12 mins</span>
                  </div>
                </div>

                <div className="space-y-6 mb-8 md:mb-10">
                  <div>
                    <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary mb-2 md:mb-3">Description</h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {exercise.description || "Master this movement with precision. This exercise targets your primary muscle groups while building functional strength and stability."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5">
                      <h4 className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5 md:mb-1">Target</h4>
                      <p className="text-xs md:text-base font-bold truncate">{exercise.muscleGroup}</p>
                    </div>
                    <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5">
                      <h4 className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5 md:mb-1">Equipment</h4>
                      <p className="text-xs md:text-base font-bold truncate">{exercise.equipment || "Standard"}</p>
                    </div>
                  </div>

                  <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-primary/5 border border-primary/20 flex items-start gap-3">
                    <Info className="text-primary w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">AI Performance Tip</p>
                      <p className="text-[10px] md:text-xs leading-relaxed text-foreground/80 italic">
                        "Focus on the eccentric phase to maximize hypertrophy for {exercise.name}."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 pt-4 sticky bottom-0 bg-background/50 backdrop-blur-md -mx-6 md:-mx-12 px-6 md:px-12 pb-4">
                <button 
                  onClick={() => {
                    onStart(exercise);
                    onClose();
                  }}
                  className="w-full sm:flex-1 bg-primary text-primary-foreground py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(245, 158, 11,0.4)] hover:scale-[1.02] transition-all text-sm md:text-base order-1 sm:order-1"
                >
                  <Play fill="currentColor" className="w-4.5 h-4.5 md:w-5 md:h-5" />
                  Start Now
                </button>
                <button 
                  onClick={() => {
                    onAddToRoutine(exercise);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 font-bold text-xs md:text-sm hover:bg-white/10 transition-all order-2 sm:order-2"
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

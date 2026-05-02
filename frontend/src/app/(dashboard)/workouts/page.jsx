"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Dumbbell, 
  Zap, 
  Clock, 
  ChevronRight,
  Plus,
  Loader2,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import ExerciseModal from '@/components/ExerciseModal';
import { useRouter } from 'next/navigation';

const muscleGroups = [
  "All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"
];

const muscleImages = {
  "Chest": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070",
  "Back": "https://images.unsplash.com/photo-1603287611837-f2139f99335a?q=80&w=2071",
  "Legs": "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=2069",
  "Shoulders": "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?q=80&w=2070",
  "Arms": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070",
  "Core": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070",
  "All": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070"
};

const exerciseImages = {
  "Incline Bench Press": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069",
  "Cable Flyes": "https://images.unsplash.com/photo-1590487988256-9ed24133863e?q=80&w=2070",
  "Squats": "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=2069",
  "Deadlifts": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070"
};

const getExerciseImage = (ex) => {
  return exerciseImages[ex.name] || muscleImages[ex.muscleGroup] || muscleImages["All"];
};

const getExerciseDescription = (ex) => {
  if (ex.description && !ex.description.includes("Optimize your form")) return ex.description;
  
  const exerciseDescriptions = {
    "Incline Bench Press": "Target the upper pectorals and anterior deltoids for a fuller chest profile.",
    "Cable Flyes": "Isolate the chest fibers with constant tension to improve inner-chest definition.",
    "Squats": "The king of all leg exercises, building massive strength in quads and glutes.",
    "Deadlifts": "A powerhouse movement for the entire posterior chain and core stability."
  };

  if (exerciseDescriptions[ex.name]) return exerciseDescriptions[ex.name];
  
  const descriptions = {
    "Chest": "Engage your pectorals with targeted resistance to build strength and definition.",
    "Back": "Strengthen your posterior chain and improve posture through controlled pulling movements.",
    "Legs": "Focus on quad and hamstring engagement to build explosive lower body power.",
    "Shoulders": "Isolate the deltoids for broader shoulders and improved upper body stability.",
    "Arms": "Concentrated bicep and tricep isolation to maximize muscle volume and peak.",
    "Core": "Stabilize your midsection and build functional strength through abdominal tension.",
    "Default": "Master the movement with AI-guided form correction and real-time biomechanical analysis."
  };
  return descriptions[ex.muscleGroup] || descriptions["Default"];
};

export default function Workouts() {
  const [activeMuscle, setActiveMuscle] = useState("All");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data } = await api.get('/workouts/exercises');
        setExercises(data);
      } catch (err) {
        console.error("Failed to fetch exercises", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  const handleGenerateAIWorkout = async () => {
    setIsGenerating(true);
    try {
      const { data } = await api.get('/workouts/daily');
      if (data && data.plan) {
        localStorage.setItem('current_workout_plan', JSON.stringify(data.plan));
        router.push('/live-workout');
      }
    } catch (err) {
      console.error("Failed to generate AI workout", err);
    }
  };

  const handleAddToRoutine = (ex) => {
    const savedPlan = localStorage.getItem('current_workout_plan');
    const currentPlan = savedPlan ? JSON.parse(savedPlan) : [];
    
    const newExercise = {
      name: ex.name,
      sets: 3,
      reps: "12",
      reason: "Custom addition from library"
    };
    
    localStorage.setItem('current_workout_plan', JSON.stringify([...currentPlan, newExercise]));
    alert(`${ex.name} added to your daily routine!`);
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesMuscle = activeMuscle === "All" || ex.muscleGroup === activeMuscle;
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2 md:px-0">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Exercise <span className="text-gradient">Library</span></h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Explore {exercises.length} high-intensity movements verified by AI.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search exercises..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all w-full"
            />
          </div>
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all w-full sm:w-auto flex items-center justify-center gap-2">
            <Filter className="w-4.5 h-4.5 md:w-5 md:h-5" />
            <span className="sm:hidden text-sm font-medium">Filter</span>
          </button>
        </div>
      </header>

      {/* Muscle Group Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {muscleGroups.map((m) => (
          <button
            key={m}
            onClick={() => setActiveMuscle(m)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
              activeMuscle === m 
                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(245, 158, 11,0.3)]" 
                : "bg-white/5 text-muted-foreground border-white/5 hover:border-white/10"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Custom Builder Callout */}
      <div className="glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-primary/20 relative overflow-hidden group mx-2 md:mx-0">
        <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 group-hover:opacity-30 transition-all duration-500">
          <Zap className="text-primary rotate-12 w-24 h-24 md:w-32 md:h-32" />
        </div>
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Build a Custom Session</h2>
          <p className="text-xs md:text-sm text-muted-foreground max-w-lg mb-6 md:mb-8 leading-relaxed mx-auto md:mx-0">
            Our AI analyzes your fatigue, equipment, and recent PRs to build the perfect workout for your current state.
          </p>
          <button 
            onClick={handleGenerateAIWorkout}
            disabled={isGenerating}
            className="bg-primary text-primary-foreground px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-[0_0_30px_rgba(245, 158, 11,0.4)] disabled:opacity-50 w-full sm:w-auto mx-auto md:mx-0 text-sm md:text-base"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin w-4.5 h-4.5 md:w-5 md:h-5" />
                Analyzing...
              </>
            ) : (
              <>
                <Plus className="w-4.5 h-4.5 md:w-5 md:h-5" />
                Generate AI Workout
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recommended Plans */}
      <div className="px-2 md:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-white/5 pb-6 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Featured Exercises</h2>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Verified movements for optimal hypertrophy</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10 text-muted-foreground w-fit">
              {filteredExercises.length} results
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse" />
              <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gradient animate-pulse">Syncing AI Database...</p>
              <p className="text-xs text-muted-foreground mt-1">Fetching biomechanical movement data</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredExercises.map((ex, i) => (
              <motion.div
                key={ex._id}
                onClick={() => setSelectedExercise(ex)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -10 }}
                className="glass rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/5 group cursor-pointer"
              >
                <div className="h-48 md:h-56 overflow-hidden relative">
                  <img 
                    src={getExerciseImage(ex)} 
                    alt={ex.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-2.5 py-0.5 md:px-3 md:py-1 rounded-full bg-primary/20 backdrop-blur-md text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20">
                      {ex.muscleGroup}
                    </span>
                  </div>
                </div>
                <div className="p-5 md:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Trophy className="text-orange-500 w-3 h-3 md:w-3.5 md:h-3.5" />
                      <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {ex.difficulty || 'Intermediate'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      <span className="text-[10px] md:text-xs font-medium">10-12 mins</span>
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{ex.name}</h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2 mb-4 md:mb-6 leading-relaxed min-h-[30px] md:min-h-[32px]">
                    {getExerciseDescription(ex)}
                  </p>
                  <button className="w-full py-3 md:py-3.5 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all font-bold flex items-center justify-center gap-2 text-xs md:text-sm">
                    Start Exercise
                    <ChevronRight className="w-4 h-4 md:w-4.5 md:h-4.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ExerciseModal 
        exercise={selectedExercise}
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onAddToRoutine={handleAddToRoutine}
        onStart={(ex) => {
          localStorage.setItem('current_workout_plan', JSON.stringify([{
            name: ex.name,
            sets: 3,
            reps: "12",
            reason: "Targeted focus from library"
          }]));
          router.push('/live-workout');
        }}
      />
    </div>
  );
}

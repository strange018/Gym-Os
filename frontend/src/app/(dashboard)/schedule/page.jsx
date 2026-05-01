"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, 
  Dumbbell, 
  Coffee, 
  Plus, 
  X, 
  Save, 
  Loader2,
  Trash2,
  CheckCircle2,
  Info,
  PlayCircle,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Schedule() {
  const [schedule, setSchedule] = useState({});
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startingDay, setStartingDay] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduleRes, exercisesRes] = await Promise.all([
          api.get('/schedule'),
          api.get('/workouts/exercises')
        ]);
        setSchedule(scheduleRes.data.days || {});
        setExercises(exercisesRes.data);
      } catch (err) {
        console.error("Failed to fetch schedule data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleDay = (day) => {
    const current = schedule[day] || { type: 'rest' };
    const newType = current.type === 'rest' ? 'workout' : 'rest';
    setSchedule(prev => ({
      ...prev,
      [day]: { 
        ...current, 
        type: newType,
        planName: newType === 'workout' ? 'Custom Session' : 'Rest Day',
        exercises: []
      }
    }));
  };

  const handlePlanNameChange = (day, name) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], planName: name }
    }));
  };

  const handleResetToDefault = async () => {
    if (confirm("This will reset your entire weekly schedule to the default split. Continue?")) {
      const defaultDays = {
        Monday: { 
          type: 'workout', 
          planName: 'Chest + Triceps', 
          exercises: [
            { name: 'Incline Bench Press', sets: 4, reps: '10', reason: 'Chest - Upper mass' },
            { name: 'Flat Dumbbell Press', sets: 4, reps: '10', reason: 'Chest - Mid mass' },
            { name: 'Cable Flyes', sets: 3, reps: '15', reason: 'Chest - Inner squeeze' },
            { name: 'Pushups', sets: 3, reps: 'Max', reason: 'Chest - Burnout' },
            { name: 'Tricep Pushdowns', sets: 4, reps: '12', reason: 'Triceps - Lateral head' },
            { name: 'Skull Crushers', sets: 3, reps: '12', reason: 'Triceps - Long head' },
            { name: 'Overhead Extension', sets: 3, reps: '12', reason: 'Triceps - Stretch' },
            { name: 'Dips', sets: 3, reps: 'Max', reason: 'Triceps - Compound' }
          ] 
        },
        Tuesday: { 
          type: 'workout', 
          planName: 'Back + Biceps', 
          exercises: [
            { name: 'Deadlifts', sets: 4, reps: '5', reason: 'Back - Thickness' },
            { name: 'Lat Pulldowns', sets: 4, reps: '12', reason: 'Back - Width' },
            { name: 'Seated Cable Rows', sets: 4, reps: '12', reason: 'Back - Mid row' },
            { name: 'Single Arm Rows', sets: 3, reps: '12', reason: 'Back - Isolation' },
            { name: 'Barbell Curls', sets: 4, reps: '10', reason: 'Biceps - Mass' },
            { name: 'Hammer Curls', sets: 3, reps: '12', reason: 'Biceps - Width' },
            { name: 'Preacher Curls', sets: 3, reps: '12', reason: 'Biceps - Peak' },
            { name: 'Concentration Curls', sets: 3, reps: '15', reason: 'Biceps - Pump' }
          ] 
        },
        Wednesday: { 
          type: 'workout', 
          planName: 'Shoulders + Abs', 
          exercises: [
            { name: 'Overhead Press', sets: 4, reps: '8', reason: 'Shoulders - Power' },
            { name: 'Lateral Raises', sets: 4, reps: '15', reason: 'Shoulders - Width' },
            { name: 'Front Raises', sets: 3, reps: '12', reason: 'Shoulders - Front delt' },
            { name: 'Face Pulls', sets: 4, reps: '15', reason: 'Shoulders - Rear delt' },
            { name: 'Hanging Leg Raises', sets: 4, reps: '15', reason: 'Abs - Lower' },
            { name: 'Crunches', sets: 4, reps: '20', reason: 'Abs - Upper' },
            { name: 'Russian Twists', sets: 3, reps: '30', reason: 'Abs - Obliques' },
            { name: 'Plank', sets: 3, reps: '60s', reason: 'Abs - Core' }
          ] 
        },
        Thursday: { 
          type: 'workout', 
          planName: 'Chest + Triceps', 
          exercises: [
            { name: 'Decline Press', sets: 4, reps: '10', reason: 'Chest - Lower focus' },
            { name: 'Chest Press Machine', sets: 4, reps: '12', reason: 'Chest - Stability' },
            { name: 'Pec Deck Flyes', sets: 3, reps: '15', reason: 'Chest - Stretch' },
            { name: 'Cable Crossover', sets: 3, reps: '15', reason: 'Chest - Definition' },
            { name: 'Rope Pushdowns', sets: 4, reps: '15', reason: 'Triceps - Focus' },
            { name: 'Kickbacks', sets: 3, reps: '15', reason: 'Triceps - Peak' },
            { name: 'Close Grip Bench', sets: 4, reps: '8', reason: 'Triceps - Power' },
            { name: 'Diamond Pushups', sets: 3, reps: 'Max', reason: 'Triceps - Burn' }
          ] 
        },
        Friday: { 
          type: 'workout', 
          planName: 'Back + Biceps', 
          exercises: [
            { name: 'Pullups', sets: 4, reps: 'Max', reason: 'Back - Width' },
            { name: 'T-Bar Rows', sets: 4, reps: '10', reason: 'Back - Power' },
            { name: 'Pullover', sets: 3, reps: '12', reason: 'Back - Serratus' },
            { name: 'Back Extensions', sets: 3, reps: '15', reason: 'Back - Lower' },
            { name: 'Incline Curls', sets: 4, reps: '12', reason: 'Biceps - Stretch' },
            { name: 'EZ Bar Curls', sets: 4, reps: '10', reason: 'Biceps - Inner' },
            { name: 'Spider Curls', sets: 3, reps: '12', reason: 'Biceps - Isolation' },
            { name: 'Cable Curls', sets: 3, reps: '15', reason: 'Biceps - Constant tension' }
          ] 
        },
        Saturday: { 
          type: 'workout', 
          planName: 'Shoulders + Legs', 
          exercises: [
            { name: 'Squats', sets: 5, reps: '8', reason: 'Legs - Compound' },
            { name: 'Leg Extensions', sets: 4, reps: '15', reason: 'Legs - Quads' },
            { name: 'Leg Curls', sets: 4, reps: '15', reason: 'Legs - Hams' },
            { name: 'Calf Raises', sets: 4, reps: '20', reason: 'Legs - Calves' },
            { name: 'Military Press', sets: 4, reps: '8', reason: 'Shoulders - Mass' },
            { name: 'Upright Rows', sets: 3, reps: '12', reason: 'Shoulders - Traps' },
            { name: 'Shrugs', sets: 4, reps: '15', reason: 'Shoulders - Traps' },
            { name: 'Arnold Press', sets: 3, reps: '12', reason: 'Shoulders - Range' }
          ] 
        },
        Sunday: { type: 'rest', planName: 'Rest Day', exercises: [] }
      };
      setSchedule(defaultDays);
    }
  };

  const handleStartSession = (day) => {
    const config = schedule[day];
    if (!config || !config.exercises?.length) {
      alert("Please add some exercises to this day first!");
      return;
    }
    setStartingDay(day);
    setCurrentExerciseIndex(0);
  };

  const startCountdown = () => {
    setIsStarting(true);
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to live workout after countdown
          const config = schedule[startingDay];
          localStorage.setItem('current_workout_plan', JSON.stringify(config.exercises));
          window.location.href = '/live-workout';
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAddExercise = (day, exercise) => {
    const current = schedule[day] || { type: 'rest', exercises: [] };
    const newExercises = [
      ...(current.exercises || []),
      { name: exercise.name, sets: 3, reps: "12", reason: "Scheduled workout" }
    ];
    setSchedule(prev => ({
      ...prev,
      [day]: { ...current, type: 'workout', exercises: newExercises }
    }));
  };

  const handleRemoveExercise = (day, index) => {
    const current = schedule[day];
    const newExercises = current.exercises.filter((_, i) => i !== index);
    setSchedule(prev => ({
      ...prev,
      [day]: { ...current, exercises: newExercises }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/schedule', { days: schedule });
      alert("Weekly schedule saved successfully! Your dashboard will now reflect these plans.");
    } catch (err) {
      console.error("Failed to save schedule", err);
    } finally {
      setSaving(false);
    }
  };

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading your weekly plan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Weekly <span className="text-gradient">Scheduler</span></h1>
          <p className="text-muted-foreground mt-1">Design your ideal training week and sync it with your AI coach.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleResetToDefault}
            className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-bold transition-all"
          >
            Reset to Defaults
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] disabled:opacity-50"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Save Schedule
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DAYS.map((day) => {
          const config = schedule[day] || { type: 'rest' };
          const isWorkout = config.type === 'workout';

          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "glass rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col h-[380px]",
                isWorkout ? "border-primary/20 bg-primary/5" : "border-white/5 opacity-80"
              )}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl">{day}</h3>
                    <input 
                      type="text" 
                      value={config.planName || ''} 
                      onChange={(e) => handlePlanNameChange(day, e.target.value)}
                      placeholder={isWorkout ? "Workout Name" : "Rest"}
                      className="bg-transparent border-none text-[10px] text-primary uppercase font-bold tracking-widest focus:ring-0 p-0 w-full"
                    />
                  </div>
                  <button 
                    onClick={() => handleToggleDay(day)}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      isWorkout ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    )}
                  >
                    {isWorkout ? <Dumbbell size={18} /> : <Coffee size={18} />}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 mb-4">
                  {isWorkout ? (
                    <>
                      {config.exercises?.length > 0 ? (
                        config.exercises.map((ex, i) => (
                          <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between group">
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate">{ex.name}</p>
                              <p className="text-[10px] text-muted-foreground uppercase">{ex.sets} Sets • {ex.reps} Reps</p>
                            </div>
                            <button 
                              onClick={() => handleRemoveExercise(day, i)}
                              className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 opacity-40 italic text-xs">
                          No exercises added
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <Coffee size={32} className="text-muted-foreground mb-2 opacity-20" />
                      <p className="text-xs text-muted-foreground">Rest Day</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Recovery is key to growth</p>
                    </div>
                  )}
                </div>

                {isWorkout && (
                  <div className="space-y-2">
                    <button 
                      onClick={() => setEditingDay(day)}
                      className="w-full py-2.5 rounded-xl bg-white/5 text-muted-foreground text-xs font-bold border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={14} />
                      Add Exercise
                    </button>
                    <button 
                      onClick={() => handleStartSession(day)}
                      className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                      <PlayCircle size={14} />
                      Start Session
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Exercise Selection Modal */}
      <AnimatePresence>
        {editingDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingDay(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-dark border border-white/10 rounded-[2.5rem] w-full max-w-lg p-8 relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Add to {editingDay}</h2>
                  <p className="text-sm text-muted-foreground">Select an exercise from the library</p>
                </div>
                <button onClick={() => setEditingDay(null)} className="p-2 hover:bg-white/5 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="relative mb-6">
                <input 
                  type="text" 
                  placeholder="Search exercises..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-12 text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2">
                {filteredExercises.map((ex) => (
                  <button
                    key={ex._id}
                    onClick={() => {
                      handleAddExercise(editingDay, ex);
                      setEditingDay(null);
                    }}
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 transition-all text-left flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-bold">{ex.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{ex.muscleGroup}</p>
                    </div>
                    <Plus size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Start Workout Modal */}
      <AnimatePresence>
        {startingDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isStarting && setStartingDay(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-dark border border-primary/30 rounded-[3rem] w-full max-w-2xl p-10 relative z-10 shadow-[0_0_50px_rgba(0,242,254,0.2)] overflow-hidden"
            >
              {countdown !== null ? (
                <div className="h-[400px] flex flex-col items-center justify-center">
                  <motion.h1 
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    className="text-9xl font-black text-primary"
                  >
                    {countdown}
                  </motion.h1>
                  <p className="text-xl font-bold mt-8 uppercase tracking-[0.5em] animate-pulse">Get Ready</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold">Session Overview</h2>
                      <p className="text-primary font-bold uppercase tracking-widest text-xs mt-1">
                        {startingDay} • {schedule[startingDay]?.exercises?.length} Exercises
                      </p>
                    </div>
                    <button onClick={() => setStartingDay(null)} className="p-2 hover:bg-white/5 rounded-full">
                      <X size={24} />
                    </button>
                  </div>

                  {/* Exercise Carousel */}
                  <div className="relative group">
                    <div className="aspect-video rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden flex flex-col">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentExerciseIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="absolute inset-0 flex flex-col"
                        >
                          {/* Placeholder for tutorial animation */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 animate-pulse" />
                          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
                              <PlayCircle size={32} className="text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                              {schedule[startingDay]?.exercises[currentExerciseIndex]?.name}
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                              {schedule[startingDay]?.exercises[currentExerciseIndex]?.reason || "Watch the AI form correction tutorial."}
                            </p>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    {schedule[startingDay]?.exercises?.length > 1 && (
                      <div className="absolute top-1/2 -translate-y-1/2 -left-4 -right-4 flex justify-between pointer-events-none">
                        <button 
                          onClick={() => setCurrentExerciseIndex(prev => Math.max(0, prev - 1))}
                          disabled={currentExerciseIndex === 0}
                          className="w-10 h-10 rounded-full bg-glass border border-white/10 flex items-center justify-center pointer-events-auto hover:bg-primary hover:text-white transition-all disabled:opacity-0"
                        >
                          <ChevronRight className="rotate-180" size={20} />
                        </button>
                        <button 
                          onClick={() => setCurrentExerciseIndex(prev => Math.min((schedule[startingDay]?.exercises?.length || 1) - 1, prev + 1))}
                          disabled={currentExerciseIndex === (schedule[startingDay]?.exercises?.length || 1) - 1}
                          className="w-10 h-10 rounded-full bg-glass border border-white/10 flex items-center justify-center pointer-events-auto hover:bg-primary hover:text-white transition-all disabled:opacity-0"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-1.5">
                    {schedule[startingDay]?.exercises?.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "h-1 rounded-full transition-all duration-300",
                          idx === currentExerciseIndex ? "w-6 bg-primary" : "w-1.5 bg-white/10"
                        )}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-4 rounded-2xl border-white/5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Target</p>
                      <p className="text-sm font-bold uppercase tracking-widest">{schedule[startingDay]?.planName}</p>
                    </div>
                    <div className="glass p-4 rounded-2xl border-white/5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Estimated Intensity</p>
                      <p className="text-sm font-bold text-orange-500 uppercase">High Performance</p>
                    </div>
                  </div>

                  <button 
                    onClick={startCountdown}
                    className="w-full py-5 rounded-[2rem] bg-primary text-primary-foreground text-lg font-black shadow-[0_0_30px_rgba(0,242,254,0.4)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                  >
                    Begin Session
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

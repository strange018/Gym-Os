"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Trophy, 
  Target, 
  Clock, 
  Play, 
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Loader2,
  X,
  RotateCcw,
  Coffee,
  PlayCircle,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ExerciseModal from '@/components/ExerciseModal';
import { useSocket } from '@/hooks/useSocket';

const StatCard = ({ icon: Icon, label, value, subtext, color, onClick }) => (
  <motion.div 
    onClick={onClick}
    className={cn(
      "glass p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 relative overflow-hidden group transition-all",
      onClick && "cursor-pointer hover:border-primary/30"
    )}
  >
    <div className={cn("absolute top-0 right-0 w-20 md:w-24 h-20 md:h-24 blur-3xl -z-10 opacity-20", color)} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-muted-foreground text-xs md:text-sm font-medium mb-1">{label}</p>
        <h3 className="text-2xl md:text-3xl font-bold">{value}</h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[10px] md:text-xs text-muted-foreground">{subtext}</p>
          {onClick && <ArrowRight className="text-primary opacity-0 group-hover:opacity-100 transition-opacity w-2.5 h-2.5 md:w-3 md:h-3" />}
        </div>
      </div>
      <div className={cn("p-2.5 md:p-3 rounded-xl md:rounded-2xl", color.replace('bg-', 'bg-opacity-20 bg-'))}>
        <Icon className={cn("w-5 h-5 md:w-6 md:h-6", color.replace('bg-', 'text-'))} />
      </div>
    </div>
  </motion.div>
);

const getExerciseAnimation = (name) => {
  const animations = {
    "Incline Bench Press": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHpiazR2Y3RndjJ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKpxC97u8lV9pT2/giphy.gif",
    "Deadlifts": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHpiazR2Y3RndjJ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlS7eF0y9kL4U0w/giphy.gif",
    "Squats": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHpiazR2Y3RndjJ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKpGv6T8j7jUv0A/giphy.gif",
    "Pushups": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHpiazR2Y3RndjJ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKpGv6T8j7jUv0A/giphy.gif",
    "Default": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHpiazR2Y3RndjJ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKpGv6T8j7jUv0A/giphy.gif"
  };
  const normalized = name?.toLowerCase() || '';
  if (normalized.includes('bench')) return animations["Incline Bench Press"];
  if (normalized.includes('deadlift')) return animations["Deadlifts"];
  if (normalized.includes('squat')) return animations["Squats"];
  if (normalized.includes('pushup')) return animations["Pushups"];
  return "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHpiazR2Y3RndjJ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6bmZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKpGv6T8j7jUv0A/giphy.gif";
};

export default function Dashboard() {
  const [showSessionOverview, setShowSessionOverview] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [userName, setUserName] = useState('Athlete');
  const [dailyWorkout, setDailyWorkout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ xp: 0, level: 1, streak: 0, activeTime: 0, weight: 70 });
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [todayScheduleInfo, setTodayScheduleInfo] = useState({ day: '', planName: '', isRest: false });

  const [aiInsight, setAiInsight] = useState("Based on your performance trend, you should increase the weight for Bench Press by 2.5kg today. Your recovery score is high (88%).");
  const [nutrition, setNutrition] = useState([
    { label: 'Protein', current: 0, target: 160, color: 'bg-primary' },
    { label: 'Carbs', current: 0, target: 220, color: 'bg-purple-500' },
    { label: 'Fats', current: 0, target: 65, color: 'bg-orange-500' },
  ]);
  const [progressData, setProgressData] = useState([40, 60, 45, 70, 85, 65, 90]);
  const router = useRouter();

  const { lastUpdate } = useSocket(user?._id);

  useEffect(() => {
    if (lastUpdate) {
      setNotifications(prev => [lastUpdate, ...prev].slice(0, 3));
      
      // Real-time data sync based on update type
      switch (lastUpdate.type) {
        case 'WORKOUT_PROGRESS':
          // Update stats in real-time
          if (lastUpdate.activeTime || lastUpdate.calories) {
            setStats(prev => ({ 
              ...prev, 
              activeTime: Math.floor((lastUpdate.activeTime || 0) / 60), // Convert to minutes
              calories: Math.floor(lastUpdate.calories || 0)
            }));
          }
          break;
        case 'WORKOUT_COMPLETE':
          // Refresh everything when a workout completes
          window.refreshWorkout && window.refreshWorkout();
          break;
        case 'XP_EARNED':
          // If it's for this user (we could check userId if we added it to the broadcast)
          // For now, let's just refresh stats if it's a generic XP update or if we want to be safe
          api.get('/user/stats').then(res => setStats(prev => ({ ...prev, ...res.data })));
          break;
        case 'SCHEDULE_UPDATED':
          window.refreshWorkout && window.refreshWorkout();
          break;
        case 'AI_INSIGHT':
          setAiInsight(lastUpdate.message);
          break;
        case 'DIET_UPDATED':
          setNutrition(lastUpdate.nutrition);
          break;
      }

      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n !== lastUpdate));
      }, 5000);
    }
  }, [lastUpdate]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      if (storedUser.name) {
        setUserName(storedUser.name.split(' ')[0]);
      }
    }

    const fetchDashboardData = async (forceRefresh = false) => {
      setLoading(true);
      try {
        // Fetch User Stats
        const statsRes = await api.get('/user/stats');
        setStats(prev => ({ ...prev, ...statsRes.data }));

        // Fetch Weekly Schedule
        const scheduleRes = await api.get('/schedule');
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todaySchedule = scheduleRes.data.days?.[today];

        // Fetch Workout History for Progress Chart
        const historyRes = await api.get('/workouts/history');
        const history = historyRes.data;
        // Map last 7 days volume to percentage (max volume as 100%)
        const maxVol = Math.max(...history.map(h => h.volume), 1000);
        const chartData = history.slice(0, 7).reverse().map(h => (h.volume / maxVol) * 100);
        while (chartData.length < 7) chartData.unshift(0);
        setProgressData(chartData);

        // Fetch Diet for Nutrition
        try {
          const [dietRes, intakeRes] = await Promise.all([
            api.get('/diet'),
            api.get('/diet/intake')
          ]);
          
          if (dietRes.data.meals) {
             const totalProtein = dietRes.data.meals.reduce((sum, m) => sum + (m.protein || 0), 0);
             const totalCarbs = dietRes.data.meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
             const totalFats = dietRes.data.meals.reduce((sum, m) => sum + (m.fats || 0), 0);
             
             const intake = intakeRes.data;
             
             setNutrition([
               { label: 'Protein', current: intake.protein || 0, target: totalProtein, color: 'bg-primary' },
               { label: 'Carbs', current: intake.carbs || 0, target: totalCarbs, color: 'bg-purple-500' },
               { label: 'Fats', current: intake.fats || 0, target: totalFats, color: 'bg-orange-500' },
             ]);
          }
        } catch (e) {
          console.warn("Could not fetch diet or intake for dashboard", e);
        }

        // Fetch AI Insights
        try {
          const insightRes = await api.get('/workouts/insights');
          setAiInsight(insightRes.data.insight);
        } catch (e) {
          console.warn("Could not fetch AI insights", e);
        }

        // Load custom plan from storage first
        const savedPlan = localStorage.getItem('current_workout_plan');
        const savedPlanDate = localStorage.getItem('current_workout_date');
        const todayString = new Date().toDateString();

        // Always update today's schedule info from schedule data
        if (todaySchedule) {
          setTodayScheduleInfo({
            day: today,
            planName: todaySchedule.planName || (todaySchedule.type === 'rest' ? 'Rest Day' : 'Custom Session'),
            isRest: todaySchedule.type === 'rest'
          });
        } else {
          setTodayScheduleInfo({ day: today, planName: 'AI Generated Plan', isRest: false });
        }

        if (!forceRefresh && savedPlan && savedPlanDate === todayString && JSON.parse(savedPlan).length > 0) {
          setDailyWorkout(JSON.parse(savedPlan));
        } else if (todaySchedule && todaySchedule.type === 'workout' && todaySchedule.exercises?.length > 0) {
          // Use scheduled workout if it exists
          setDailyWorkout(todaySchedule.exercises);
          localStorage.setItem('current_workout_plan', JSON.stringify(todaySchedule.exercises));
          localStorage.setItem('current_workout_date', todayString);
        } else if (todaySchedule && todaySchedule.type === 'rest') {
          // If it's a rest day, set to empty but can still generate if forced
          setDailyWorkout([]);
          localStorage.removeItem('current_workout_plan');
          localStorage.removeItem('current_workout_date');
        } else {
          // If no custom plan or forced refresh, fetch AI recommendations
          const { data } = await api.get('/workouts/daily');
          const aiPlan = data.plan || [];
          setDailyWorkout(aiPlan);
          localStorage.setItem('current_workout_plan', JSON.stringify(aiPlan));
          localStorage.setItem('current_workout_date', todayString);
        }

      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();

    // Expose for refresh
    window.refreshWorkout = () => fetchDashboardData(true);
  }, []);

  const handleStartWorkoutClick = () => {
    if (dailyWorkout && dailyWorkout.length > 0) {
      setShowSessionOverview(true);
      setCurrentExerciseIndex(0);
      setIsPlayingDemo(false);
    } else {
      window.refreshWorkout && window.refreshWorkout();
    }
  };

  const startCountdown = () => {
    setIsStarting(true);
    setCountdown(3);
    let current = 3;
    const timer = setInterval(() => {
      current -= 1;
      if (current <= 0) {
        clearInterval(timer);
        setCountdown(null);
        localStorage.setItem('current_workout_plan', JSON.stringify(dailyWorkout));
        localStorage.setItem('current_workout_date', new Date().toDateString());
        router.push('/live-workout');
      } else {
        setCountdown(current);
      }
    }, 1000);
  };

  const handleAddToRoutine = (ex) => {
    const newExercise = {
      name: ex.name,
      sets: 3,
      reps: "12",
      reason: "Manually added to routine"
    };
    const updatedPlan = [...dailyWorkout, newExercise];
    setDailyWorkout(updatedPlan);
    localStorage.setItem('current_workout_plan', JSON.stringify(updatedPlan));
    localStorage.setItem('current_workout_date', new Date().toDateString());
  };

  const handleRemoveExercise = (e, index) => {
    e.stopPropagation(); // Prevent opening the modal
    const updatedPlan = dailyWorkout.filter((_, i) => i !== index);
    setDailyWorkout(updatedPlan);
    localStorage.setItem('current_workout_plan', JSON.stringify(updatedPlan));
    localStorage.setItem('current_workout_date', new Date().toDateString());
  };

  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!newWeight) return;
    try {
      await api.post('/user/weight', { weight: parseFloat(newWeight) });
      setStats(prev => ({ ...prev, weight: parseFloat(newWeight) }));
      setShowWeightModal(false);
      setNewWeight("");
      setNotifications(prev => [{ id: Date.now(), message: `Weight updated to ${newWeight}kg!` }, ...prev]);
    } catch (err) {
      console.error("Failed to log weight", err);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Weight Modal */}
      <AnimatePresence>
        {showWeightModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWeightModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm glass rounded-[2.5rem] border border-white/10 p-8 relative z-10"
            >
              <h3 className="text-xl font-bold mb-2">Log Current Weight</h3>
              <p className="text-xs text-muted-foreground mb-6">Tracking your weight helps AI optimize your diet.</p>
              
              <form onSubmit={handleLogWeight} className="space-y-4">
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder="Enter weight in kg"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xl font-bold focus:outline-none focus:border-primary transition-all"
                    autoFocus
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">KG</span>
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowWeightModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-[0_0_20px_rgba(245, 158, 11,0.3)] hover:shadow-[0_0_30px_rgba(245, 158, 11,0.5)] transition-all"
                  >
                    Save Log
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2 md:px-0">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome back, <span className="text-gradient">{userName}</span> 👋</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Your AI coach has prepared your plan for today.</p>
        </div>
        <button 
          onClick={handleStartWorkoutClick}
          disabled={loading || !dailyWorkout || dailyWorkout.length === 0}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245, 158, 11,0.3)] hover:shadow-[0_0_30px_rgba(245, 158, 11,0.5)] disabled:opacity-50 w-full lg:w-auto text-sm md:text-base"
        >
          <Play fill="currentColor" className="w-4.5 h-4.5 md:w-5 md:h-5" />
          Start Today's Workout
        </button>
      </header>

      {/* Notifications overlay */}
      <div className="fixed top-24 right-4 md:right-8 z-50 flex flex-col gap-3 pointer-events-none w-[calc(100%-2rem)] md:w-auto">
        {notifications.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="glass-dark border border-primary/30 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-2xl flex items-center gap-3 w-full md:min-w-[300px]"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <BrainCircuit className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] md:text-[10px] uppercase font-bold text-primary tracking-widest">Real-time Update</p>
              <p className="text-xs md:text-sm font-medium truncate">{n.message}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2 md:px-0">
        <StatCard 
          icon={Flame} 
          label="Streak" 
          value={`${stats.streak}d`} 
          subtext="Keep it up!" 
          color="bg-orange-500" 
        />
        <StatCard 
          icon={Trophy} 
          label="Level" 
          value={`Lvl ${stats.level}`} 
          subtext={`${stats.xp} XP`} 
          color="bg-purple-500" 
        />
        <StatCard 
          icon={Target} 
          label="Weight" 
          value={`${stats.weight || 70}kg`} 
          subtext="Update" 
          color="bg-blue-500" 
          onClick={() => setShowWeightModal(true)}
        />
        <StatCard 
          icon={Clock} 
          label="Active" 
          value={`${stats.activeTime || 0}m`} 
          subtext="This week" 
          color="bg-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Today's Plan */}
          <section className="glass rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-white/10 relative overflow-hidden mx-2 md:mx-0">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Today's Focus</h2>
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">
                  {todayScheduleInfo.day
                    ? <>{todayScheduleInfo.day} &bull; <span className={todayScheduleInfo.isRest ? 'text-amber-400' : 'text-primary'}>{todayScheduleInfo.planName}</span></>
                    : 'AI Generated Plan'
                  }
                </p>
              </div>

              <div className="flex items-center gap-2 md:gap-4">
                <button 
                  onClick={handleStartWorkoutClick}
                  disabled={!dailyWorkout || dailyWorkout.length === 0}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold flex items-center gap-2 text-xs hover:scale-105 transition-all shadow-[0_0_15px_rgba(245, 158, 11,0.3)] disabled:opacity-50"
                >
                  <Play size={14} /> Start
                </button>
                <button 
                  onClick={() => window.refreshWorkout && window.refreshWorkout()}
                  className="p-2 rounded-lg md:rounded-xl bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/50 text-muted-foreground hover:text-primary transition-all group/refresh"
                  title="Refresh AI Plan"
                >
                  <RotateCcw className={cn(loading && "animate-spin", "w-3.5 h-3.5 md:w-4 md:h-4")} />
                </button>
                <Link href="/workouts" className="text-xs md:text-sm text-primary font-semibold flex items-center gap-1 cursor-pointer hover:underline relative z-20">
                  View All <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Consulting AI Coach...</p>
                </div>
              ) : dailyWorkout.length > 0 ? (
                dailyWorkout.map((ex, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedExercise(ex)}
                    className="flex items-center justify-between p-4 md:p-5 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 md:gap-5 min-w-0">
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-muted flex items-center justify-center font-bold text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all text-base md:text-xl shrink-0">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm md:text-lg truncate">{ex.name}</h4>
                        <p className="text-[10px] md:text-xs text-muted-foreground">{ex.sets} Sets • {ex.reps} Reps</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                      <div className="hidden lg:block text-right mr-3">
                         <p className="text-[8px] uppercase font-bold text-primary mb-0.5">Reasoning</p>
                         <p className="text-[10px] text-muted-foreground italic max-w-[150px] truncate">{ex.reason}</p>
                      </div>
                      <button 
                        onClick={(e) => handleRemoveExercise(e, i)}
                        className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 flex flex-col items-center justify-center gap-4 opacity-50">
                  <Coffee size={48} className="text-muted-foreground" />
                  <div>
                    <p className="text-lg font-bold">It's Rest Day!</p>
                    <p className="text-sm text-muted-foreground mt-1">Recovery is where the magic happens. See you tomorrow!</p>
                  </div>
                  <button 
                    onClick={() => window.refreshWorkout && window.refreshWorkout()}
                    className="mt-4 px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/20 text-xs font-bold transition-all"
                  >
                    Train Anyway (AI Suggestion)
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Progress Overview */}
          <section className="glass rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-white/10 mx-2 md:mx-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Progress Overview</h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Strength gains over the last 7 days</p>
              </div>
              <Link href="/progress" className="text-xs md:text-sm text-primary font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                View All <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </Link>
            </div>
            <div className="h-48 md:h-64 flex items-end justify-between gap-1 md:gap-2 pt-4">
              {progressData.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 md:gap-2 group">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="w-full bg-gradient-to-t from-primary/40 to-primary rounded-t-sm md:rounded-t-lg relative group-hover:to-blue-400 transition-all"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-popover text-[8px] md:text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      +{Math.round(h)}%
                    </div>
                  </motion.div>
                  <span className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-semibold">D{i + 1}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6 md:space-y-8 px-2 md:px-0">
          {/* AI Insights */}
          <section className="glass rounded-[1.5rem] md:rounded-[2rem] p-6 border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="text-primary w-5 h-5" />
              <h3 className="font-bold text-primary uppercase tracking-wider text-[10px]">AI Insights</h3>
            </div>
            <p className="text-xs md:text-sm leading-relaxed mb-4 italic">
              "{aiInsight}"
            </p>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>Recovery</span>
              <span className="text-primary">88%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '88%' }}
                className="h-full bg-primary" 
              />
            </div>
          </section>

          {/* Diet Overview */}
          <section className="glass rounded-[1.5rem] md:rounded-[2rem] p-6 border border-white/10">
            <h3 className="font-bold mb-4 text-sm md:text-base">Nutrition Today</h3>
            <div className="space-y-4">
              {nutrition.map((macro) => (
                <div key={macro.label}>
                  <div className="flex justify-between text-[10px] md:text-xs mb-1">
                    <span className="font-medium">{macro.label}</span>
                    <span className="text-muted-foreground">{macro.current}g / {macro.target}g</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(macro.current / macro.target) * 100}%` }}
                      className={cn("h-full", macro.color)} 
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] md:text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-widest">
              Log Meal
            </button>
          </section>

          {/* Upcoming Achievements */}
          <section className="glass rounded-[1.5rem] md:rounded-[2rem] p-6 border border-white/10">
            <h3 className="font-bold mb-4 text-sm md:text-base">Achievements</h3>
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted border border-white/5 flex items-center justify-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                  <TrendingUp className="text-primary w-4 h-4 md:w-5 md:h-5" />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">Next: Complete 15 workouts in a month</p>
          </section>
        </div>
      </div>

      <ExerciseModal 
        exercise={selectedExercise}
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onAddToRoutine={handleAddToRoutine}
        onStart={(ex) => {
          localStorage.setItem('current_workout_plan', JSON.stringify([ex]));
          localStorage.setItem('current_workout_date', new Date().toDateString());
          router.push('/live-workout');
        }}
      />

      {/* Start Workout Modal */}
      <AnimatePresence>
        {showSessionOverview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isStarting && setShowSessionOverview(false)}
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass border border-primary/30 rounded-[1.5rem] md:rounded-[2rem] w-full max-w-xl p-4 md:p-6 relative z-10 shadow-[0_0_50px_rgba(245, 158, 11,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {countdown !== null ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                  <motion.h1
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    className="text-7xl md:text-9xl font-black text-primary"
                  >
                    {countdown}
                  </motion.h1>
                  <p className="text-lg md:text-xl font-bold mt-8 uppercase tracking-[0.5em] animate-pulse">Get Ready</p>
                </div>
              ) : (
                <>
                  {/* Scrollable content */}
                  <div className="space-y-3 md:space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold">Session Overview</h2>
                      <p className="text-primary font-bold uppercase tracking-widest text-[10px] md:text-xs mt-1">
                        {todayScheduleInfo.planName} • {dailyWorkout.length} Exercises
                      </p>
                    </div>
                    <button onClick={() => setShowSessionOverview(false)} className="p-2 hover:bg-white/5 rounded-full">
                      <X size={20} />
                    </button>
                  </div>

                  {/* Exercise Carousel */}
                  <div className="relative group">
                    <div className="aspect-video rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden flex flex-col">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${currentExerciseIndex}-${isPlayingDemo}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex flex-col"
                        >
                          {/* Tutorial Animation / Placeholder */}
                          {isPlayingDemo ? (
                            <div className="absolute inset-0 bg-black">
                              <img
                                src={getExerciseAnimation(dailyWorkout[currentExerciseIndex]?.name)}
                                className="w-full h-full object-cover opacity-80"
                                alt="Exercise Tutorial"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                              <button
                                onClick={() => setIsPlayingDemo(false)}
                                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-all border border-white/10"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 animate-pulse" />
                              <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-3 md:p-6 text-center">
                                <button
                                  onClick={() => setIsPlayingDemo(true)}
                                  className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2 md:mb-4 border border-primary/30 hover:scale-110 hover:bg-primary/30 transition-all cursor-pointer group/play shadow-[0_0_30px_rgba(245, 158, 11,0.2)]"
                                >
                                  <PlayCircle size={24} className="text-primary group-hover/play:scale-110 transition-transform md:w-8 md:h-8" />
                                </button>
                                <h3 className="text-base md:text-xl font-bold text-white mb-1 line-clamp-1">
                                  {dailyWorkout[currentExerciseIndex]?.name}
                                </h3>
                                <p className="text-[10px] md:text-xs text-muted-foreground max-w-sm mb-1 line-clamp-2">
                                  {dailyWorkout[currentExerciseIndex]?.reason || "Watch the AI form correction tutorial."}
                                </p>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-primary/60">Click play to preview form</span>
                              </div>
                            </>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    {dailyWorkout.length > 1 && (
                      <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 flex justify-between pointer-events-none z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentExerciseIndex(prev => Math.max(0, prev - 1));
                            setIsPlayingDemo(false);
                          }}
                          disabled={currentExerciseIndex === 0}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center pointer-events-auto hover:bg-primary hover:text-white transition-all disabled:opacity-0"
                        >
                          <ChevronRight className="rotate-180" size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentExerciseIndex(prev => Math.min(dailyWorkout.length - 1, prev + 1));
                            setIsPlayingDemo(false);
                          }}
                          disabled={currentExerciseIndex === dailyWorkout.length - 1}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center pointer-events-auto hover:bg-primary hover:text-white transition-all disabled:opacity-0"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-1.5">
                    {dailyWorkout.map((_, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "h-1 rounded-full transition-all duration-300",
                          idx === currentExerciseIndex ? "w-6 bg-primary" : "w-1.5 bg-white/10"
                        )}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="glass p-3 md:p-4 rounded-2xl border-white/5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Target</p>
                      <p className="text-xs md:text-sm font-bold uppercase tracking-widest truncate">{todayScheduleInfo.planName}</p>
                    </div>
                    <div className="glass p-3 md:p-4 rounded-2xl border-white/5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Estimated Intensity</p>
                      <p className="text-xs md:text-sm font-bold text-orange-500 uppercase">High Performance</p>
                    </div>
                  </div>
                  </div>

                  {/* Sticky Begin Session button */}
                  <div className="pt-3 border-t border-white/5 shrink-0 mt-3 md:mt-4">
                    <button
                      onClick={startCountdown}
                      className="w-full py-3 md:py-4 rounded-xl md:rounded-2xl bg-primary text-primary-foreground text-sm md:text-base font-black shadow-[0_0_30px_rgba(245, 158, 11,0.4)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                    >
                      Begin Session
                    </button>
                  </div>
                </>
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

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
  Coffee
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ExerciseModal from '@/components/ExerciseModal';
import { useSocket } from '@/hooks/useSocket';

const StatCard = ({ icon: Icon, label, value, subtext, color, onClick }) => (
  <motion.div 
    whileHover={onClick ? { y: -5, scale: 1.02 } : { y: -5 }}
    onClick={onClick}
    className={cn(
      "glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group transition-all",
      onClick && "cursor-pointer hover:border-primary/30"
    )}
  >
    <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl -z-10 opacity-20", color)} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-muted-foreground text-sm font-medium mb-1">{label}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">{subtext}</p>
          {onClick && <ArrowRight size={12} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
      </div>
      <div className={cn("p-3 rounded-2xl", color.replace('bg-', 'bg-opacity-20 bg-'))}>
        <Icon className={cn("w-6 h-6", color.replace('bg-', 'text-'))} />
      </div>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [userName, setUserName] = useState('Athlete');
  const [dailyWorkout, setDailyWorkout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ xp: 0, level: 1, streak: 0, activeTime: 0, weight: 70 });
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
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
        
        if (!forceRefresh && savedPlan && JSON.parse(savedPlan).length > 0) {
          setDailyWorkout(JSON.parse(savedPlan));
        } else if (todaySchedule && todaySchedule.type === 'workout' && todaySchedule.exercises?.length > 0) {
          // Use scheduled workout if it exists
          setDailyWorkout(todaySchedule.exercises);
          localStorage.setItem('current_workout_plan', JSON.stringify(todaySchedule.exercises));
        } else if (todaySchedule && todaySchedule.type === 'rest') {
          // If it's a rest day, set to empty but can still generate if forced
          setDailyWorkout([]);
          localStorage.removeItem('current_workout_plan');
        } else {
          // If no custom plan or forced refresh, fetch AI recommendations
          const { data } = await api.get('/workouts/daily');
          const aiPlan = data.plan || [];
          setDailyWorkout(aiPlan);
          localStorage.setItem('current_workout_plan', JSON.stringify(aiPlan));
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

  const handleStartWorkout = () => {
    console.log("Starting workout with plan:", dailyWorkout);
    if (dailyWorkout && dailyWorkout.length > 0) {
      localStorage.setItem('current_workout_plan', JSON.stringify(dailyWorkout));
      router.push('/live-workout');
    } else {
      // Fallback: try to fetch AI plan if none exists
      window.refreshWorkout && window.refreshWorkout();
    }
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
  };

  const handleRemoveExercise = (e, index) => {
    e.stopPropagation(); // Prevent opening the modal
    const updatedPlan = dailyWorkout.filter((_, i) => i !== index);
    setDailyWorkout(updatedPlan);
    localStorage.setItem('current_workout_plan', JSON.stringify(updatedPlan));
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
                    className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] transition-all"
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Welcome back, <span className="text-gradient">{userName}</span> 👋</h1>
          <p className="text-muted-foreground mt-1">Your AI coach has prepared your plan for today.</p>
        </div>
        <button 
          onClick={handleStartWorkout}
          disabled={loading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] disabled:opacity-50"
        >
          <Play size={20} fill="currentColor" />
          Start Today's Workout
        </button>
      </header>

      {/* Notifications overlay */}
      <div className="fixed top-24 right-8 z-50 flex flex-col gap-3 pointer-events-none">
        {notifications.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="glass-dark border border-primary/30 p-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <BrainCircuit size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-primary tracking-widest">Real-time Update</p>
              <p className="text-sm font-medium">{n.message}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Flame} 
          label="Current Streak" 
          value={`${stats.streak} Days`} 
          subtext="Keep it up!" 
          color="bg-orange-500" 
        />
        <StatCard 
          icon={Trophy} 
          label="Your Level" 
          value={`Lvl ${stats.level}`} 
          subtext={`${stats.xp} Total XP`} 
          color="bg-purple-500" 
        />
        <StatCard 
          icon={Target} 
          label="Current Weight" 
          value={`${stats.weight || 70} kg`} 
          subtext="Click to update" 
          color="bg-blue-500" 
          onClick={() => setShowWeightModal(true)}
        />
        <StatCard 
          icon={Clock} 
          label="Active Time" 
          value={`${stats.activeTime || 0} min`} 
          subtext="This week" 
          color="bg-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Plan */}
          <section className="glass rounded-3xl p-8 border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Today's Focus</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">AI Generated Plan</p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => window.refreshWorkout && window.refreshWorkout()}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/50 text-muted-foreground hover:text-primary transition-all group/refresh"
                  title="Refresh AI Plan"
                >
                  <RotateCcw size={16} className={cn(loading && "animate-spin")} />
                </button>
                <Link href="/workouts" className="text-sm text-primary font-semibold flex items-center gap-1 cursor-pointer hover:underline relative z-20">
                  View All <ArrowRight size={16} />
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
                    className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center font-bold text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all text-xl">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{ex.name}</h4>
                        <p className="text-xs text-muted-foreground">{ex.sets} Sets • {ex.reps} Reps</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden md:block text-right mr-3">
                         <p className="text-[10px] uppercase font-bold text-primary mb-1">Reasoning</p>
                         <p className="text-xs text-muted-foreground italic max-w-[200px]">{ex.reason}</p>
                      </div>
                      <button 
                        onClick={(e) => handleRemoveExercise(e, i)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
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
          <section className="glass rounded-3xl p-8 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Progress Tracking</h2>
                <p className="text-sm text-muted-foreground mt-1">Strength gains over the last 30 days</p>
              </div>
              <Link href="/progress" className="text-sm text-primary font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="h-64 flex items-end justify-between gap-2 pt-4">
              {progressData.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="w-full bg-gradient-to-t from-primary/40 to-primary rounded-t-lg relative group-hover:to-blue-400 transition-all"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      +{h}%
                    </div>
                  </motion.div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Day {i + 1}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* AI Insights */}
          <section className="glass rounded-3xl p-6 border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="text-primary w-5 h-5" />
              <h3 className="font-bold text-primary uppercase tracking-wider text-xs">AI Insights</h3>
            </div>
            <p className="text-sm leading-relaxed mb-4 italic">
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
          <section className="glass rounded-3xl p-6 border border-white/10">
            <h3 className="font-bold mb-4">Nutrition Today</h3>
            <div className="space-y-4">
              {nutrition.map((macro) => (
                <div key={macro.label}>
                  <div className="flex justify-between text-xs mb-1">
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
            <button className="w-full mt-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">
              Log Meal
            </button>
          </section>

          {/* Upcoming Achievements */}
          <section className="glass rounded-3xl p-6 border border-white/10">
            <h3 className="font-bold mb-4">Achievements</h3>
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full bg-muted border border-white/5 flex items-center justify-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                  <TrendingUp size={20} className="text-primary" />
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
          router.push('/live-workout');
        }}
      />
    </div>
  );
}

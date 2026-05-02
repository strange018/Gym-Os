"use client";
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, 
  IndianRupee, 
  Info, 
  ChevronDown,
  Scale,
  Beef,
  Flame,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Wind,
  RotateCcw,
  X,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

// Diet options for selection
const dietOptions = [
  { id: 'muscle-building', name: 'Muscle Building', icon: TrendingUp, description: 'High protein and moderate carbs for growth.' },
  { id: 'fat-loss', name: 'Fat Loss', icon: Flame, description: 'Low calorie, high fiber to shred fat.' },
  { id: 'budget-veg', name: 'Budget Vegetarian', icon: IndianRupee, description: 'Affordable plant-based protein sources.' },
  { id: 'maintenance', name: 'Maintenance', icon: Wind, description: 'Balanced nutrition to stay fit.' }
];

export default function Diet() {
  const [budget, setBudget] = useState(200);
  const [selectedDietId, setSelectedDietId] = useState(dietOptions[0].id);
  const [currentMeals, setCurrentMeals] = useState([]);
  const [allMeals, setAllMeals] = useState([]);
  const [aiInsight, setAiInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(null);
  const [vegOnly, setVegOnly] = useState(false);

  const fetchDietPlan = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/diet?budget=${budget}&goal=${selectedDietId}&vegOnly=${vegOnly}${forceRefresh ? '&refresh=true' : ''}`);
      setCurrentMeals(data.meals || []);
      setAiInsight(data.insight || "");
      
      // Also fetch all available meals for swapping
      const mealsRes = await api.get(`/diet/meals?vegOnly=${vegOnly}`);
      setAllMeals(mealsRes.data);
    } catch (err) {
      console.error("Failed to fetch diet data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDietPlan();
  }, [selectedDietId, vegOnly]);

  const totalCost = useMemo(() => 
    currentMeals.reduce((acc, meal) => acc + meal.cost, 0),
  [currentMeals]);

  const totalMacros = useMemo(() => ({
    calories: currentMeals.reduce((a, b) => a + b.calories, 0),
    protein: currentMeals.reduce((a, b) => a + b.protein, 0),
    carbs: currentMeals.reduce((a, b) => a + b.carbs, 0),
    fats: currentMeals.reduce((a, b) => a + b.fats, 0),
  }), [currentMeals]);

  const isOverBudget = totalCost > budget;

  const handleSwapMeal = (category, newMeal) => {
    const updated = [...currentMeals];
    updated[activeSlotIndex] = { ...newMeal, type: category };
    setCurrentMeals(updated);
    setShowSwapModal(false);
  };

  const handleLogMeal = async (meal) => {
    try {
      await api.post('/diet/log', {
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        type: meal.type
      });
      alert(`${meal.name} logged successfully! Check your dashboard for updated nutrition.`);
    } catch (err) {
      console.error("Failed to log meal", err);
      alert("Failed to log meal. Please try again.");
    }
  };

  const optimizeForBudget = () => {
    let optimizedMeals = [...currentMeals];
    let currentTotal = optimizedMeals.reduce((acc, m) => acc + m.cost, 0);

    // Keep swapping the most expensive meal until we are within budget
    // or until no more swaps are possible.
    while (currentTotal > budget) {
      // Find the most expensive meal that still has a cheaper alternative
      let mostExpensiveIdx = -1;
      let maxCost = -1;

      optimizedMeals.forEach((meal, idx) => {
        const pool = allMeals.filter(m => m.type === meal.type);
        const minPoolCost = Math.min(...pool.map(p => p.cost));
        
        if (meal.cost > minPoolCost && meal.cost > maxCost) {
          maxCost = meal.cost;
          mostExpensiveIdx = idx;
        }
      });

      if (mostExpensiveIdx === -1) break; 

      const category = optimizedMeals[mostExpensiveIdx].type;
      const pool = allMeals.filter(m => m.type === category);
      const cheapestMeal = pool.reduce((prev, curr) => prev.cost < curr.cost ? prev : curr);
      
      optimizedMeals[mostExpensiveIdx] = { ...cheapestMeal, type: category };
      currentTotal = optimizedMeals.reduce((acc, m) => acc + m.cost, 0);
    }

    setCurrentMeals(optimizedMeals);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2 md:px-0">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">Smart Diet Planner</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Optimize your nutrition based on your wallet and your goals.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="glass p-4 rounded-2xl border border-white/10 flex items-center gap-4 w-full sm:min-w-[300px]">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <IndianRupee className="text-primary" size={20} />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Daily Budget</label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">₹</span>
                <input 
                  type="number" 
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="bg-transparent text-xl font-bold focus:outline-none w-full"
                />
              </div>
            </div>
            <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />
            <div className="text-right shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Cost</p>
              <p className={cn("text-lg md:text-xl font-bold", isOverBudget ? "text-destructive" : "text-emerald-400")}>
                ₹{totalCost}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {isOverBudget && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl flex items-center gap-3 text-destructive animate-pulse"
              >
                <AlertTriangle size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">Budget Exceeded by ₹{totalCost - budget}!</span>
              </motion.div>
            )}
            {!isOverBudget && (
               <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-500"
             >
               <CheckCircle2 size={20} />
               <span className="text-xs font-bold uppercase tracking-wider">Within Budget</span>
             </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dietOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedDietId(option.id)}
            className={cn(
              "glass p-4 md:p-6 rounded-2xl md:rounded-3xl border transition-all text-left group",
              selectedDietId === option.id 
                ? "border-primary bg-primary/5 ring-1 ring-primary/50" 
                : "border-white/5 hover:border-white/20"
            )}
          >
            <div className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 transition-colors",
              selectedDietId === option.id ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground group-hover:text-foreground"
            )}>
              <option.icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="font-bold text-sm md:text-lg">{option.name}</h3>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 line-clamp-1 md:line-clamp-2">{option.description}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 glass rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
             <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
              <Scale className="text-primary" />
              Nutritional Profile
            </h2>
            <div className="px-4 py-1.5 bg-primary/10 rounded-lg text-primary text-[10px] font-bold uppercase tracking-widest w-fit">
              Total Day Breakdown
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest">Calories</span>
                <span className="text-xl md:text-2xl font-bold">{totalMacros.calories}</span>
              </div>
              <div className="h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  className="h-full bg-primary shadow-[0_0_10px_rgba(245, 158, 11,0.5)]" 
                />
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest">Protein</span>
                <span className="text-xl md:text-2xl font-bold">{totalMacros.protein}g</span>
              </div>
              <div className="h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  className="h-full bg-red-400" 
                />
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest">Carbs</span>
                <span className="text-xl md:text-2xl font-bold">{totalMacros.carbs}g</span>
              </div>
              <div className="h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '60%' }}
                  className="h-full bg-orange-400" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 border border-primary/20 bg-primary/5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Info className="text-primary w-5 h-5" />
            <h3 className="font-bold text-xs uppercase tracking-widest text-primary">AI Coach Advice</h3>
          </div>
          <p className="text-sm leading-relaxed mb-6 flex-1">
            {isOverBudget 
              ? `You are over budget by ₹${totalCost - budget}. Click below to automatically swap high-cost items for budget-friendly alternatives that still hit your macros.`
              : `Your diet is perfectly balanced. Total cost is ₹${totalCost}, giving you ₹${budget - totalCost} room for extra hydration or supplements.`}
          </p>
          <button 
            onClick={isOverBudget ? optimizeForBudget : null}
            className={cn(
              "w-full py-4 rounded-xl md:rounded-2xl font-bold text-sm transition-all",
              isOverBudget 
                ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(245, 158, 11,0.3)] hover:scale-[1.02]" 
                : "bg-white/5 text-muted-foreground border border-white/10 cursor-default"
            )}
          >
            {isOverBudget ? "Optimize for Budget" : "Generate Shopping List"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Daily Meal Breakdown</h2>
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
            <span className={cn("text-xs font-bold uppercase tracking-widest transition-colors", vegOnly ? "text-primary" : "text-muted-foreground")}>Veg Only</span>
            <button 
              onClick={() => setVegOnly(!vegOnly)}
              className={cn(
                "w-12 h-6 rounded-full relative transition-all duration-300",
                vegOnly ? "bg-primary" : "bg-white/10"
              )}
            >
              <motion.div 
                animate={{ x: vegOnly ? 24 : 2 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg"
              />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {currentMeals.length > 0 ? (
            currentMeals.map((meal, i) => (
              <motion.div
                key={`${meal.type}-${i}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-[1.5rem] md:rounded-[2rem] border border-white/5 overflow-hidden flex flex-col md:flex-row group hover:border-primary/20 transition-all"
              >
                <div className="md:w-64 lg:w-72 h-48 md:h-auto overflow-hidden relative shrink-0">
                  <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                    {meal.type}
                  </div>
                </div>
                
                <div className="flex-1 p-5 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                      <h3 className="text-xl md:text-2xl font-bold group-hover:text-primary transition-colors line-clamp-1">{meal.name}</h3>
                      <div className="flex items-center gap-1 text-emerald-400 font-bold text-lg md:text-xl">
                        <IndianRupee size={18} />
                        {meal.cost}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                      {[
                        { label: 'Calories', val: meal.calories, color: 'text-primary' },
                        { label: 'Protein', val: `${meal.protein}g`, color: 'text-red-400' },
                        { label: 'Carbs', val: `${meal.carbs}g`, color: 'text-orange-400' },
                        { label: 'Fats', val: `${meal.fats}g`, color: 'text-blue-400' },
                      ].map((m) => (
                        <div key={m.label} className="bg-white/5 p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{m.label}</p>
                          <p className={cn("font-bold text-xs md:text-base", m.color)}>{m.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center gap-3 md:gap-4">
                    <button 
                      onClick={() => {
                        setActiveSlotIndex(i);
                        setShowSwapModal(true);
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500 hover:text-white px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      <RotateCcw size={14} />
                      Choose Other
                    </button>
                    <button 
                      onClick={() => handleLogMeal(meal)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      <CheckCircle2 size={14} />
                      Log Meal
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : !loading && (
            <div className="text-center py-20 glass rounded-[2rem] border border-dashed border-white/10 opacity-50">
              <p className="text-lg font-bold">No meals generated yet.</p>
              <p className="text-sm">Try adjusting your budget or goal to get a new plan.</p>
              <button 
                onClick={() => fetchDietPlan(true)}
                className="mt-6 px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl font-bold hover:bg-primary hover:text-primary-foreground transition-all"
              >
                Retry Generation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Swap Meal Modal */}
      <AnimatePresence>
        {showSwapModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSwapModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-4xl glass rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 overflow-hidden relative z-10 flex flex-col max-h-[90vh] md:max-h-[80vh]"
            >
              <div className="p-5 md:p-8 border-b border-white/10 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-xl z-20">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Choose Other {currentMeals[activeSlotIndex]?.type}</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">Select a meal to replace your current plan.</p>
                </div>
                <button 
                  onClick={() => setShowSwapModal(false)}
                  className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-colors"
                >
                  <X className="w-4.5 h-4.5 md:w-5 md:h-5" />
                </button>
              </div>

              <div className="p-5 md:p-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {allMeals
                    .filter(m => m.type === currentMeals[activeSlotIndex]?.type)
                    .map((meal, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSwapMeal(currentMeals[activeSlotIndex].type, meal)}
                      className="flex gap-4 p-3 md:p-4 rounded-[1.25rem] md:rounded-3xl bg-white/5 border border-white/5 hover:border-primary/50 transition-all text-left group"
                    >
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl overflow-hidden shrink-0">
                        <img src={meal.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <h4 className="font-bold text-base md:text-lg truncate">{meal.name}</h4>
                          <span className="text-emerald-400 font-bold shrink-0">₹{meal.cost}</span>
                        </div>
                        <div className="flex gap-3 text-[9px] md:text-[10px] uppercase font-bold text-muted-foreground">
                          <span>{meal.calories} Cal</span>
                          <span>{meal.protein}g Prot</span>
                        </div>
                        <div className="mt-2 md:mt-3 flex items-center gap-1 text-primary text-[10px] md:text-xs font-bold">
                          Select Meal <ArrowRight size={12} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.4);
        }
      `}</style>
    </div>
  );
}

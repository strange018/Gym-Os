"use client";
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  TrendingUp, 
  Calendar, 
  Target, 
  ArrowUpRight, 
  Scale,
  Activity,
  History,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

const ChartCard = ({ title, value, change, icon: Icon, color, children }) => (
  <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col h-full">
    <div className="flex items-start justify-between mb-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className={cn("p-2 rounded-lg", color.replace('bg-', 'bg-opacity-10 bg-'))}>
            <Icon size={18} className={cn(color.replace('bg-', 'text-'))} />
          </div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold">{value}</span>
          <span className="text-emerald-500 text-xs font-bold flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <ArrowUpRight size={14} />
            {change}
          </span>
        </div>
      </div>
      <div className="text-xs text-muted-foreground font-medium">Last 30 Days</div>
    </div>
    <div className="flex-1 min-h-[150px] relative">
      {children}
    </div>
  </div>
);



export default function Progress() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/workouts/history');
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const workoutVolumeData = useMemo(() => {
    // Return last 12 sessions volume or zeros if none
    const data = history.slice(0, 12).reverse().map(h => h.volume / 100); // normalized for chart
    while (data.length < 12) data.unshift(0);
    return data;
  }, [history]);

  const latestStats = useMemo(() => {
    if (history.length === 0) return { volume: '0 kg', weight: '75 kg', prs: [] };
    const latest = history[0];
    return {
      volume: `${latest.volume.toLocaleString()} kg`,
      weight: '75 kg', // Placeholder as weight isn't tracked in session yet
      prs: history.reduce((acc, sess) => {
         sess.exercises.forEach(ex => {
           const existing = acc.find(p => p.label === ex.name);
           if (!existing || ex.weight > parseInt(existing.value)) {
             if (existing) {
               existing.value = `${ex.weight} kg`;
               existing.date = new Date(sess.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
             } else {
               acc.push({ label: ex.name, value: `${ex.weight} kg`, date: new Date(sess.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) });
             }
           }
         });
         return acc;
      }, []).slice(0, 3)
    };
  }, [history]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground">Analyzing your performance...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Performance <span className="text-gradient">Analytics</span></h1>
        <p className="text-muted-foreground mt-1">Detailed breakdown of your fitness journey and AI insights.</p>
      </header>

      {/* Grid for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard 
          title="Workout Volume" 
          value={latestStats.volume} 
          change="+12.5%" 
          icon={Activity} 
          color="bg-primary"
        >
          <div className="absolute inset-0 flex items-end justify-between gap-1">
            {workoutVolumeData.map((v, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${v}%` }}
                transition={{ delay: i * 0.05 }}
                className="flex-1 bg-gradient-to-t from-primary/20 to-primary rounded-t-md hover:opacity-80 transition-all cursor-pointer relative group"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {Math.round(v * 100)} kg
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>

        <ChartCard 
          title="Body Weight" 
          value={latestStats.weight} 
          change="Stable" 
          icon={Scale} 
          color="bg-purple-500"
        >
           <div className="absolute inset-0 flex items-end justify-center">
             <p className="text-muted-foreground text-xs italic">Weight tracking integration coming soon...</p>
           </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Achievements */}
        <section className="glass p-8 rounded-3xl border border-white/10 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-primary w-5 h-5" />
            <h2 className="text-xl font-bold">Personal Records</h2>
          </div>
          <div className="space-y-6">
            {latestStats.prs.length > 0 ? latestStats.prs.map((pr, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{pr.label}</p>
                  <p className="text-lg font-bold">{pr.value}</p>
                </div>
                <div className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-lg font-bold">
                  {pr.date}
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground italic text-center py-10">Complete workouts to set PRs!</p>
            )}
          </div>
        </section>

        {/* History */}
        <section className="glass p-8 rounded-3xl border border-white/10 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History className="text-primary w-5 h-5" />
              <h2 className="text-xl font-bold">Training History</h2>
            </div>
          </div>
          <div className="space-y-4">
            {history.length > 0 ? history.map((log, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Calendar size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold">{log.name}</h4>
                    <p className="text-xs text-muted-foreground">{log.duration} min • {log.volume.toLocaleString()} kg</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-muted-foreground uppercase">
                  {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground italic text-center py-10">No sessions recorded yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

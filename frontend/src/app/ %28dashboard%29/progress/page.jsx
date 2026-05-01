"use client";
import { motion } from 'framer-motion';
import { 
  LineChart, 
  TrendingUp, 
  Calendar, 
  Target, 
  ArrowUpRight, 
  Scale,
  Activity,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const workoutData = [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 90];
  const weightData = [82, 81.5, 81.2, 80.8, 80.5, 80.1, 79.8, 79.5, 79.2, 78.8];

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
          value="42,500 kg" 
          change="+12.5%" 
          icon={Activity} 
          color="bg-primary"
        >
          <div className="absolute inset-0 flex items-end justify-between gap-1">
            {workoutData.map((v, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${v}%` }}
                transition={{ delay: i * 0.05 }}
                className="flex-1 bg-gradient-to-t from-primary/20 to-primary rounded-t-md hover:opacity-80 transition-all cursor-pointer relative group"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {v}k
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>

        <ChartCard 
          title="Body Weight" 
          value="78.8 kg" 
          change="-3.2%" 
          icon={Scale} 
          color="bg-purple-500"
        >
           <div className="absolute inset-0 flex items-end justify-between gap-2">
            {weightData.map((v, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${((v - 75) / 10) * 100}%` }}
                transition={{ delay: i * 0.05 }}
                className="flex-1 bg-gradient-to-t from-purple-500/20 to-purple-500 rounded-t-md hover:opacity-80 transition-all cursor-pointer relative group"
              >
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {v} kg
                </div>
              </motion.div>
            ))}
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
            {[
              { label: 'Deadlift', value: '180 kg', date: 'Oct 24' },
              { label: 'Bench Press', value: '110 kg', date: 'Oct 20' },
              { label: 'Squat', value: '145 kg', date: 'Oct 15' },
            ].map((pr, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{pr.label}</p>
                  <p className="text-lg font-bold">{pr.value}</p>
                </div>
                <div className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-lg font-bold">
                  {pr.date}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* History */}
        <section className="glass p-8 rounded-3xl border border-white/10 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History className="text-primary w-5 h-5" />
              <h2 className="text-xl font-bold">Training History</h2>
            </div>
            <button className="text-sm text-primary font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Push Day - A', duration: '65 min', volume: '8,200 kg', date: 'Today' },
              { name: 'Pull Day - B', duration: '58 min', volume: '7,500 kg', date: 'Yesterday' },
              { name: 'Leg Day - A', duration: '72 min', volume: '12,400 kg', date: '2 days ago' },
              { name: 'Full Body AI', duration: '45 min', volume: '5,100 kg', date: '3 days ago' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Calendar size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold">{log.name}</h4>
                    <p className="text-xs text-muted-foreground">{log.duration} • {log.volume}</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-muted-foreground uppercase">
                  {log.date}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

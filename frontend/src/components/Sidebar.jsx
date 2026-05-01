"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Utensils, 
  LineChart, 
  MessageSquare, 
  Settings, 
  Zap,
  ChevronRight,
  CalendarDays
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Dumbbell, label: 'Workouts', href: '/workouts' },
  { icon: Utensils, label: 'Diet AI', href: '/diet' },
  { icon: LineChart, label: 'Progress', href: '/progress' },
  { icon: MessageSquare, label: 'AI Coach', href: '/coach' },
  { icon: CalendarDays, label: 'Schedule', href: '/schedule' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 glass border-r border-border h-full flex flex-col">
      <div className="p-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.5)]">
            <Zap className="text-primary-foreground w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gradient">AI GYM OS</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={cn(
                    "transition-colors",
                    isActive ? "text-primary" : "group-hover:text-foreground"
                  )} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Premium Member</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Unlock advanced AI analysis and posture correction.
          </p>
        </div>
        
        <div className="mt-6 flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-muted border border-border" />
          <div className="flex-1">
            <p className="text-sm font-semibold">User Name</p>
            <p className="text-xs text-muted-foreground">Level 12 • Warrior</p>
          </div>
          <Settings size={18} className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
        </div>
      </div>
    </div>
  );
}

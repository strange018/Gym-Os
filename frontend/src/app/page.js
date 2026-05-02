"use client";
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  Zap, ArrowRight, Activity, Cpu, Shield, Brain,
  CheckCircle2, Star, Play, Dumbbell,
  TrendingUp, Camera, MessageSquare
} from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: "Real-Time Pose Detection",
    desc: "Your webcam becomes a personal trainer. AI tracks every joint, counts every rep, and corrects your form instantly — with zero lag.",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
  },
  {
    icon: Brain,
    title: "Adaptive AI Coach",
    desc: "Your workout adapts in real-time to your fatigue level, recovery, and progress. It's like having an Olympic coach in your pocket.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
  {
    icon: TrendingUp,
    title: "Smart Progress Engine",
    desc: "Deep analytics on every session — volume, consistency, streaks, and muscle activation heatmaps to keep you progressing.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
  {
    icon: MessageSquare,
    title: "24/7 AI Chat Coach",
    desc: "Ask about nutrition, form, recovery, or programming. Your AI coach never sleeps, never judges, and always has an answer.",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
  },
  {
    icon: Dumbbell,
    title: "Smart Diet Planner",
    desc: "AI-optimized meal plans tuned to your budget, goals, and dietary preferences. Updated daily based on your training load.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
  {
    icon: Activity,
    title: "Weekly Scheduler",
    desc: "A science-backed training split auto-generated for you. Edit, swap, and start any session with a single tap.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
];

const stats = [
  { value: "98%", label: "Rep Accuracy" },
  { value: "12+", label: "Exercises Tracked" },
  { value: "50ms", label: "Detection Latency" },
  { value: "24/7", label: "AI Availability" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="min-h-screen w-full bg-background text-foreground overflow-x-hidden">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 glass border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245, 158, 11,0.5)]">
            <Zap className="text-primary-foreground w-5 h-5 fill-current" />
          </div>
          <span className="text-lg font-black tracking-tight text-gradient">AI GYM OS</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#stats" className="hover:text-foreground transition-colors">Performance</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:scale-105 transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-20 overflow-hidden">
        {/* Animated background blobs */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-red-600/8 rounded-full blur-[180px]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-amber-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-500/8 rounded-full blur-[100px]" />
        </motion.div>

        {/* Grid overlay */}
        <div className="absolute inset-0 -z-10 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />

        <motion.div style={{ opacity: heroOpacity }} className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-widest mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Next-Generation AI Fitness Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[1.05] mb-8"
          >
            Train Smarter.<br />
            <span className="text-gradient">Not Harder.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            AI Gym OS uses real-time pose detection, adaptive AI coaching, and smart nutrition planning to make every workout count — on any device.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              href="/register"
              className="group w-full sm:w-auto bg-primary text-primary-foreground px-10 py-4 rounded-2xl text-base font-bold shadow-[0_0_40px_rgba(239,68,68,0.35)] hover:shadow-[0_0_55px_rgba(239,68,68,0.55)] flex items-center justify-center gap-3 transition-all hover:scale-105"
            >
              Start for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="group w-full sm:w-auto glass px-10 py-4 rounded-2xl text-base font-bold border border-white/10 hover:border-white/20 hover:bg-white/5 flex items-center justify-center gap-3 transition-all"
            >
              <Play className="w-4 h-4 text-primary fill-primary" />
              Live Demo
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground font-medium"
          >
            {["No credit card required", "Free to get started", "Cancel anytime"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>


      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={itemVariants}
              className="glass rounded-2xl md:rounded-3xl p-6 md:p-8 text-center border border-white/5 hover:border-primary/20 transition-all"
            >
              <p className="text-4xl md:text-5xl font-black text-gradient mb-2">{s.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground font-semibold uppercase tracking-widest">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              Everything You Need
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Built for <span className="text-gradient">Serious Athletes</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every feature is designed to close the gap between you and your peak performance.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={itemVariants}
                className={`glass rounded-3xl p-7 border ${f.border} hover:scale-[1.02] transition-all duration-300 group`}
              >
                <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`${f.color} w-6 h-6`} />
                </div>
                <h3 className="text-lg font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass rounded-[2.5rem] md:rounded-[3rem] border border-primary/20 p-10 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-red-600/5 -z-0 rounded-[2.5rem] md:rounded-[3rem]" />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Your Best Workout<br />
              <span className="text-gradient">Starts Today.</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg mb-10 max-w-xl mx-auto">
              Join thousands of athletes already training with AI precision. No equipment, no excuses.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group w-full sm:w-auto bg-primary text-primary-foreground px-12 py-5 rounded-2xl text-lg font-black shadow-[0_0_50px_rgba(239,68,68,0.4)] hover:shadow-[0_0_70px_rgba(239,68,68,0.6)] flex items-center justify-center gap-3 transition-all hover:scale-105 uppercase tracking-wider"
              >
                Begin Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                Already have an account? Sign in →
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="text-primary-foreground w-4 h-4 fill-current" />
          </div>
          <span className="text-sm font-black text-gradient">AI GYM OS</span>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 AI Gym OS. Built for the modern athlete.</p>
        <div className="flex items-center gap-6">
          <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
          <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
          <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Support</Link>
        </div>
      </footer>
    </div>
  );
}

"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Shield, Cpu, Activity, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col w-full h-full">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 glass sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.5)]">
            <Zap className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gradient">AI GYM OS</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold hover:text-primary transition-colors">Sign In</Link>
          <Link href="/register" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:scale-105 transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            The Future of Fitness is Here
          </span>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight">
            Level Up Your Body with <span className="text-gradient">Real-Time AI</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            AI Gym OS uses advanced pose detection and adaptive intelligence to create the most personalized workout experience ever built.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/register" className="group bg-primary text-primary-foreground px-10 py-5 rounded-2xl text-lg font-bold shadow-[0_0_30px_rgba(0,242,254,0.4)] hover:shadow-[0_0_40px_rgba(0,242,254,0.6)] flex items-center gap-3 transition-all">
              Start Free Trial
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/dashboard" className="glass px-10 py-5 rounded-2xl text-lg font-bold border border-white/10 hover:bg-white/5 transition-all">
              Live Demo
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-6xl mx-auto pb-20"
        >
          {[
            { icon: Activity, title: "Pose Detection", desc: "Real-time form correction using your webcam." },
            { icon: Cpu, title: "Adaptive AI", desc: "Workouts that evolve based on your fatigue and progress." },
            { icon: Shield, title: "Elite Coaching", desc: "Conversational AI coach available 24/7." }
          ].map((feature, i) => (
            <div key={i} className="glass p-10 rounded-3xl border border-white/5 text-left card-hover">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="text-primary w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Zap className="text-primary w-4 h-4" />
          <span className="text-sm font-bold text-gradient">AI GYM OS</span>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 AI Gym OS. Built for the modern athlete.</p>
        <div className="flex items-center gap-6">
          <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">Privacy</Link>
          <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">Terms</Link>
          <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">Support</Link>
        </div>
      </footer>
    </div>
  );
}

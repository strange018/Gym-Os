"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', formData);
      localStorage.setItem('user', JSON.stringify(data));
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.5)]">
              <Zap className="text-primary-foreground w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gradient">AI GYM OS</span>
          </Link>
          <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-muted-foreground">Sign in to continue your training</p>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium">Password</label>
                <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] disabled:opacity-70 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

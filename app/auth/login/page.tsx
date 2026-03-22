'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Sparkles, ChevronLeft } from 'lucide-react';
import { AuthBackground } from '@/components/auth/AuthBackground';

const containerVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      ease: "easeOut"
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      <AuthBackground />

      {/* Back to Home */}
      <Link 
        href="/" 
        className="absolute top-10 left-10 flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors group"
      >
        <div className="w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center group-hover:bg-bg-overlay transition-all">
          <ChevronLeft size={16} />
        </div>
        <span className="text-sm font-bold uppercase tracking-widest pt-0.5">Back to site</span>
      </Link>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo Section */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-brand-gradient rounded-3xl p-[1.5px] shadow-2xl shadow-brand-primary/20 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="w-full h-full bg-bg-base rounded-[22px] flex items-center justify-center overflow-hidden">
               <Sparkles className="text-brand-primary" size={32} />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-text-primary mb-2">Welcome Back.</h1>
          <p className="text-text-muted font-medium">Continue your elite preparation journey.</p>
        </motion.div>

        {/* Login Card */}
        <motion.div 
          variants={itemVariants}
          className="glass-card p-10 bg-bg-surface/40 backdrop-blur-2xl border border-border-subtle shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem]"
        >
          <form onSubmit={handleLogin} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Secure Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@placementintel.com"
                    className="w-full pl-12 pr-4 py-4 bg-bg-overlay/50 border border-border-subtle rounded-2xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Password</label>
                  <Link href="/auth/forgot-password" className="text-[9px] font-black uppercase tracking-widest text-brand-primary hover:underline">Forgot Intel?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-bg-overlay/50 border border-border-subtle rounded-2xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-text-primary text-bg-base py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-brand-primary hover:text-white transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Infiltrate Dashboard
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p variants={itemVariants} className="text-center mt-10 text-sm font-medium text-text-muted">
          New operative?{' '}
          <Link href="/auth/signup" className="text-text-primary font-bold hover:text-brand-primary transition-colors underline underline-offset-4 decoration-border-strong">
            Request Access
          </Link>
        </motion.p>
      </motion.div>
    </main>
  );
}
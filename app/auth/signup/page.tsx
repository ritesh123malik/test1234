'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Rocket, ChevronLeft } from 'lucide-react';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { toast } from 'sonner';

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

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        setError('Security Protocol: Too many attempts. Please wait before retrying.');
        setCooldown(60);
      } else if (error.message.toLowerCase().includes('email') || error.message.toLowerCase().includes('smtp')) {
        setError('Connection Error: The mail server is currently unresponsive. Please check your Supabase Auth SMTP settings.');
      } else {
        setError(error.message);
      }
      toast.error('Access Denied: ' + error.message);
    } else {
      setMessage('Verification link deployed to your inbox.');
      toast.success('Clearance Requested: Check your email');
      setCooldown(60); // Standard cooldown after success
      setTimeout(() => router.push('/auth/login'), 4000);
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
        className="w-full max-w-[480px] relative z-10"
      >
        {/* Logo Section */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-brand-gradient rounded-3xl p-[1.5px] shadow-2xl shadow-brand-primary/20 mb-6 rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
            <div className="w-full h-full bg-bg-base rounded-[22px] flex items-center justify-center overflow-hidden">
               <Rocket className="text-brand-tertiary" size={32} />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-text-primary mb-2">Initialize Protocol.</h1>
          <p className="text-text-muted font-medium max-w-[320px]">Join the high-performance network for elite placement readiness.</p>
        </motion.div>

        {/* Signup Card */}
        <motion.div 
          variants={itemVariants}
          className="glass-card p-10 bg-bg-surface/40 backdrop-blur-2xl border border-border-subtle shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[3rem]"
        >
          <form onSubmit={handleSignup} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-brand-success/10 border border-brand-success/20 text-brand-success px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider overflow-hidden"
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Operative Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-12 pr-4 py-4 bg-bg-overlay/50 border border-border-subtle rounded-2xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-medium"
                  />
                </div>
              </div>

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
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-bg-overlay/50 border border-border-subtle rounded-2xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-medium"
                  />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-2">Complexity Requirement: 6+ Characters</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full group bg-text-primary text-bg-base py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-brand-tertiary hover:text-white transition-all disabled:opacity-50 shadow-xl shadow-bg-surface/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : cooldown > 0 ? (
                <>Retry in {cooldown}s</>
              ) : (
                <>
                  Establish Connection
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p variants={itemVariants} className="text-center mt-10 text-sm font-medium text-text-muted">
          Active operative?{' '}
          <Link href="/auth/login" className="text-text-primary font-bold hover:text-brand-primary transition-colors underline underline-offset-4 decoration-border-strong">
            Re-authenticate
          </Link>
        </motion.p>
      </motion.div>
    </main>
  );
}
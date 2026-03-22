'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, Loader2, Shield, CheckCircle2 } from 'lucide-react';
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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      toast.error('Identity Protocol Failure: ' + error.message);
    } else {
      setSubmitted(true);
      toast.success('Access Restored: New credentials activated');
      setTimeout(() => router.push('/auth/login'), 4000);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      <AuthBackground />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo Section */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-brand-gradient rounded-3xl p-[1.5px] shadow-2xl shadow-brand-primary/20 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="w-full h-full bg-bg-base rounded-[22px] flex items-center justify-center overflow-hidden">
               <Shield className="text-brand-success" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-text-primary mb-2">Initialize New Key.</h1>
          <p className="text-text-muted font-medium max-w-[300px]">Define your new high-security credentials to regain access.</p>
        </motion.div>

        {/* Card */}
        <motion.div 
          variants={itemVariants}
          className="glass-card p-10 bg-bg-surface/40 backdrop-blur-2xl border border-border-subtle shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[3rem]"
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleResetPassword} 
                className="space-y-6"
              >
                {error && (
                  <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">New Password</label>
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
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Confirm New Key</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={18} />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-4 bg-bg-overlay/50 border border-border-subtle rounded-2xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group bg-text-primary text-bg-base py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-brand-success hover:text-white transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      Update Credentials
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 bg-brand-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="text-brand-success" size={32} />
                </div>
                <h3 className="text-xl font-black text-text-primary uppercase tracking-tight mb-2">Protocol Complete</h3>
                <p className="text-sm text-text-muted font-medium mb-8">
                  Your new credentials have been synchronized. Redirecting to authentication terminal...
                </p>
                <div className="w-full bg-bg-overlay/30 h-1 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4 }}
                    className="h-full bg-brand-success"
                   />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </main>
  );
}

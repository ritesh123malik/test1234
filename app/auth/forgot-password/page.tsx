'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2, KeyRound, ChevronLeft, CheckCircle2 } from 'lucide-react';
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      toast.error('Protocol Error: ' + error.message);
    } else {
      setSubmitted(true);
      toast.success('Recovery Intel Deployed');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      <AuthBackground />

      {/* Back to Login */}
      <Link 
        href="/auth/login" 
        className="absolute top-10 left-10 flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors group"
      >
        <div className="w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center group-hover:bg-bg-overlay transition-all">
          <ChevronLeft size={16} />
        </div>
        <span className="text-sm font-bold uppercase tracking-widest pt-0.5">Return to Login</span>
      </Link>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo Section */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-brand-gradient rounded-3xl p-[1.5px] shadow-2xl shadow-brand-primary/20 mb-6 rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
            <div className="w-full h-full bg-bg-base rounded-[22px] flex items-center justify-center overflow-hidden">
               <KeyRound className="text-brand-primary" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-text-primary mb-2">Recover Access.</h1>
          <p className="text-text-muted font-medium max-w-[300px]">Enter your operative email to receive recovery instructions.</p>
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
                onSubmit={handleResetRequest} 
                className="space-y-6"
              >
                {error && (
                  <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider">
                    {error}
                  </div>
                )}

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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group bg-text-primary text-bg-base py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-brand-primary hover:text-white transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      Send Recovery Link
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
                <h3 className="text-xl font-black text-text-primary uppercase tracking-tight mb-2">Transmission Sent</h3>
                <p className="text-sm text-text-muted font-medium mb-8">
                  Check your secure inbox for the recovery link to finalize the protocol.
                </p>
                <div className="p-4 bg-bg-overlay/30 border border-border-subtle rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Link expires in 1 hour
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.p variants={itemVariants} className="text-center mt-10 text-sm font-medium text-text-muted">
          Need assistance?{' '}
          <Link href="mailto:support@placementintel.com" className="text-text-primary font-bold hover:text-brand-primary transition-colors underline underline-offset-4 decoration-border-strong">
            Contact High Command
          </Link>
        </motion.p>
      </motion.div>
    </main>
  );
}

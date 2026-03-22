'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import QuizEngine from '@/components/quiz/QuizEngine';
import {
    Zap,
    Target,
    Trophy,
    Clock,
    Brain,
    ArrowLeft,
    ChevronRight,
    Search,
    Dna,
    Activity,
    ShieldAlert,
    BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MockTestPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [userProgress, setUserProgress] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        checkUser();
    }, []);

    useEffect(() => {
        if (userId) {
            loadData();
        }
    }, [userId]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/auth/login');
            return;
        }
        setUserId(user.id);
    };

    const loadData = async () => {
        setLoading(true);
        // Load categories
        const { data: cats } = await supabase
            .from('subject_categories')
            .select('*')
            .order('order_index');

        setCategories(cats || []);

        // Load user progress
        if (userId) {
            const { data: progress } = await supabase
                .from('user_subject_progress')
                .select('*')
                .eq('user_id', userId);

            setUserProgress(progress || []);
        }

        setLoading(false);
    };

    const getSubjectProgress = (subject: string) => {
        const prog = userProgress.find(p => p.subject === subject);
        return prog || { accuracy: 0, questions_attempted: 0 };
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-primary)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)] rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] animate-pulse">Synchronizing_Segment_Data</p>
                </div>
            </div>
        );
    }

    const [quizMode, setQuizMode] = useState<'standard' | 'timed'>('standard');
    const [timerActive, setTimerActive] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        let interval: any;
        if (timerActive) {
            interval = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive]);

    const handleStartSimulation = (catId: string) => {
        const category = categories.find(c => c.id === catId);
        if (category) {
            router.push(`/practice/simulation?topic=${category.slug || category.id}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-primary)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)] rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] animate-pulse">Synchronizing_Segment_Data</p>
                </div>
            </div>
        );
    }

    if (selectedCategory && userId) {
        const category = categories.find(c => c.id === selectedCategory);
        return (
            <div className="min-h-screen bg-[var(--bg-base)] py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedCategory(null);
                                setTimerActive(false);
                            }}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Abort Simulation & Return
                        </button>
                        
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl">
                            <Clock size={14} className="text-brand-primary" />
                            <span className="font-mono text-sm font-bold text-white">
                                {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="mb-12">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{category?.name}</h2>
                                <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg border ${quizMode === 'timed' ? 'bg-brand-primary/20 border-brand-primary text-brand-primary' : 'bg-white/5 border-white/10 text-text-muted'}`}>
                                    {quizMode === 'timed' ? 'Timed_Tactical' : 'Standard_Simulation'}
                                </span>
                            </div>
                            <p className="text-[var(--text-muted)] text-[11px] font-black uppercase tracking-widest tracking-[0.3em]">Operational_Deployment_Active</p>
                        </div>

                        <QuizEngine
                            categoryId={selectedCategory}
                            subject={category?.name || ''}
                            userId={userId}
                            isTimed={quizMode === 'timed'}
                            totalTimeSeconds={timeElapsed}
                            onComplete={() => {
                                setTimerActive(false);
                                // We'll handle showTacticalReport inside QuizEngine or here
                                setSelectedCategory(null);
                                loadData();
                            }}
                        />
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-base)] py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border border-[var(--brand-primary)]/20 shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.1)]">Sim_Module_v4.2</span>
                            <div className="h-px w-10 bg-[var(--border-subtle)]" />
                            <span className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.3em] font-mono">Status: Optimal</span>
                        </div>
                        <h1 className="text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4">Mock Simulations</h1>
                        <p className="max-w-2xl text-[var(--text-secondary)] text-lg font-medium leading-relaxed">
                            Deploy into high-fidelity technical simulations. Analyze your behavioral and logic patterns against top-tier industry benchmarks.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex bg-[var(--bg-surface)] p-1.5 rounded-2xl border border-[var(--border-subtle)]">
                            <button
                                onClick={() => setQuizMode('standard')}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${quizMode === 'standard' ? 'bg-brand-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                            >
                                Standard
                            </button>
                            <button
                                onClick={() => setQuizMode('timed')}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${quizMode === 'timed' ? 'bg-brand-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                            >
                                Timed_Test
                            </button>
                        </div>
                        <div className="relative w-full sm:w-80 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search simulation sectors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-16 pr-8 py-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-[var(--brand-primary)] transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Performance HUD */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: 'Attempts_Logged', value: userProgress.reduce((sum, p) => sum + p.questions_attempted, 0), icon: Activity, color: 'var(--brand-primary)' },
                        { label: 'Avg_Precision', value: `${Math.round(userProgress.reduce((sum, p) => sum + (p.accuracy || 0), 0) / Math.max(userProgress.length, 1))}%`, icon: Target, color: 'var(--brand-success)' },
                        { label: 'Segment_Sync', value: categories.length, icon: Brain, color: 'var(--brand-secondary)' },
                        { label: 'Operational_Time', value: '2.5h', icon: Clock, color: 'var(--brand-tertiary)' }
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--brand-primary)]/5 blur-[40px] rounded-full group-hover:bg-[var(--brand-primary)]/10 transition-all" />
                            <stat.icon size={24} style={{ color: stat.color }} className="mb-4 opacity-50" />
                            <div>
                                <div className="text-4xl font-black text-white mb-2 tracking-tighter">{stat.value}</div>
                                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Simulation Sectors */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCategories.map((category) => {
                        const progress = getSubjectProgress(category.name);

                        return (
                            <motion.button
                                whileHover={{ y: -5 }}
                                key={category.id}
                                onClick={() => handleStartSimulation(category.id)}
                                className="glass-card p-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[3rem] text-left group relative overflow-hidden flex flex-col min-h-[400px]"
                            >
                                <div className="absolute top-0 right-0 p-8">
                                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/5 group-hover:bg-[var(--brand-primary)] group-hover:rotate-12 transition-all duration-500">
                                        <Dna className="text-[var(--text-muted)] group-hover:text-white transition-colors" size={32} />
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <div className="flex flex-wrap items-center gap-2 mb-6">
                                        <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Sector_{category.id.slice(-4)}</span>
                                        {progress.questions_attempted > 0 && (
                                            <span className="px-3 py-1 bg-[var(--brand-success)]/10 border border-[var(--brand-success)]/10 rounded-full text-[9px] font-black uppercase tracking-widest text-[var(--brand-success)] animate-pulse">
                                                {Math.round(progress.accuracy)}% Precision
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-none">{category.name}</h3>
                                    <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed mb-8 opacity-80 line-clamp-2">
                                        {category.description || 'Access high-fidelity simulations for this critical operational segment. Recommended for senior agents.'}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-8 border-t border-[var(--border-subtle)]">
                                        <div className="flex items-center gap-3">
                                            <BarChart3 size={16} className="text-[var(--brand-primary)]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{progress.questions_attempted} attempts</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:text-[var(--brand-primary)] transition-colors">
                                            Initiate <ChevronRight size={14} className="group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}

                    {filteredCategories.length === 0 && (
                        <div className="col-span-full py-40 flex flex-col items-center justify-center text-center">
                            <ShieldAlert size={64} className="text-[var(--brand-danger)] mb-6 opacity-20" />
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Segment Not Found</h3>
                            <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-xs">Adjust your scanners and try again.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

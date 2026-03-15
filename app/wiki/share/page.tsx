'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    BuildingOfficeIcon,
    BriefcaseIcon,
    AcademicCapIcon,
    SparklesIcon,
    ArrowRightIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Company } from '@/types';

export default function ShareExperiencePage() {
    const [step, setStep] = useState(1);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        company_id: '',
        role: '',
        round: 'Technical 1',
        content: '',
        difficulty: 'Medium',
        outcome: 'offered',
        year: new Date().getFullYear()
    });

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) router.push('/auth/login');
            else setUserId(user.id);
        });

        loadCompanies();
    }, [router]);

    const loadCompanies = async () => {
        const { data } = await supabase.from('companies').select('*').eq('is_active', true);
        setCompanies(data || []);
    };

    const handleSubmit = async () => {
        if (!userId) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('interview_experiences')
                .insert({
                    ...formData,
                    user_id: userId
                });

            if (!error) {
                // Award points
                await supabase.rpc('award_activity_points', {
                    p_user_id: userId,
                    p_activity: 'wiki_contribution'
                });
                setStep(4);
            }
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    return (
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center py-20 px-6">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-[var(--brand-primary)] opacity-5 blur-[150px] rounded-full" />
                <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-[var(--brand-secondary)] opacity-5 blur-[150px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                <Link
                    href="/wiki"
                    className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors group"
                >
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Abort Transmission</span>
                </Link>

                <div className="glass-card rounded-[3rem] p-12 border border-[var(--border-subtle)] shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 rounded-2xl">
                                <SparklesIcon className="w-6 h-6 text-[var(--brand-primary)]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">Share Intel</h2>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">Step {step} of 3</p>
                            </div>
                        </div>

                        <div className="flex gap-1.5">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-[var(--brand-primary)]' : 'w-2 bg-[var(--bg-overlay)]'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Target Entity</label>
                                    <div className="relative group">
                                        <BuildingOfficeIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors" />
                                        <select
                                            value={formData.company_id}
                                            onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                                            className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-[1.5rem] pl-14 pr-6 py-4 text-sm text-[var(--text-primary)] outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Company...</option>
                                            {companies.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Assigned Role</label>
                                    <div className="relative group">
                                        <BriefcaseIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Senior Software Engineer"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-[1.5rem] pl-14 pr-6 py-4 text-sm text-[var(--text-primary)] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={nextStep}
                                    disabled={!formData.company_id || !formData.role}
                                    className="w-full btn-primary py-5 rounded-[1.5rem] font-bold flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale transition-all"
                                >
                                    Proceed to Tactics
                                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Phase</label>
                                        <select
                                            value={formData.round}
                                            onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                                            className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl px-6 py-4 text-sm text-[var(--text-primary)] outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="Online Test">Online Test</option>
                                            <option value="Technical 1">Technical 1</option>
                                            <option value="Technical 2">Technical 2</option>
                                            <option value="Managerial">Managerial</option>
                                            <option value="HR">HR</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Intensity</label>
                                        <select
                                            value={formData.difficulty}
                                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                            className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl px-6 py-4 text-sm text-[var(--text-primary)] outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Tactical De-brief</label>
                                    <textarea
                                        placeholder="Describe the interview flow, specific questions, and your approach..."
                                        rows={6}
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-[1.5rem] px-6 py-4 text-sm text-[var(--text-primary)] outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={prevStep} className="flex-1 py-5 bg-[var(--bg-overlay)] text-[var(--text-secondary)] font-bold rounded-[1.5rem] hover:bg-[var(--bg-muted)] transition-all">Back</button>
                                    <button
                                        onClick={nextStep}
                                        disabled={!formData.content}
                                        className="flex-[2] btn-primary py-5 rounded-[1.5rem] font-bold flex items-center justify-center gap-2 group disabled:opacity-50 transition-all"
                                    >
                                        Finalize Deployment
                                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Outcome</label>
                                        <select
                                            value={formData.outcome}
                                            onChange={(e) => setFormData({ ...formData, outcome: e.target.value as any })}
                                            className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl px-6 py-4 text-sm text-[var(--text-primary)] outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="offered">Offered</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="pending">Pending</option>
                                            <option value="withdrawn">Withdrawn</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Year</label>
                                        <input
                                            type="number"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                            className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl px-6 py-4 text-sm text-[var(--text-primary)] outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/10 rounded-[2rem]">
                                    <div className="flex items-center gap-4 mb-3">
                                        <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                                        <h4 className="font-display font-bold text-[var(--text-primary)]">Contributor Reward</h4>
                                    </div>
                                    <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                                        By contributing to the vanguard, you will be awarded <span className="text-[var(--brand-primary)] font-bold">75 Strategy Credits</span>. Your intel helps synchronize the collective prep of the placement community.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={prevStep} className="flex-1 py-5 bg-[var(--bg-overlay)] text-[var(--text-secondary)] font-bold rounded-[1.5rem] hover:bg-[var(--bg-muted)] transition-all">Back</button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-[2] btn-primary py-5 rounded-[1.5rem] font-bold flex items-center justify-center gap-2 group disabled:opacity-50 transition-all shadow-[var(--shadow-glow-brand)]"
                                    >
                                        {loading ? 'Transmitting...' : 'Upload Intel'}
                                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-10"
                            >
                                <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                                    <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
                                </div>
                                <h2 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-4">Intel Synchronized</h2>
                                <p className="text-[var(--text-secondary)] mb-10 max-w-sm mx-auto">
                                    Your interview experience has been successfully uploaded to the neural core. Vanguard points awarded.
                                </p>
                                <button
                                    onClick={() => router.push('/wiki')}
                                    className="btn-primary px-12 py-5 rounded-[1.5rem] font-bold"
                                >
                                    Return to Wiki
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

import Link from 'next/link';

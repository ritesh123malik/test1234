'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeftIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    BriefcaseIcon,
    AcademicCapIcon,
    ShareIcon,
    ShieldCheckIcon,
    TrophyIcon,
    ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { InterviewExperience } from '@/types';
import Link from 'next/link';

export default function InterviewDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [experience, setExperience] = useState<InterviewExperience | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadExperience();
    }, [id]);

    const loadExperience = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('interview_experiences')
                .select(`
                    *,
                    profiles:user_id(full_name, avatar_url, college),
                    companies:company_id(*)
                `)
                .eq('id', id)
                .single();

            setExperience(data);
        } catch (error) {
            console.error('Error loading experience:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center p-8">
                <div className="w-12 h-12 border-4 border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)] rounded-full animate-spin mb-4"></div>
                <p className="text-[var(--text-secondary)] font-medium animate-pulse uppercase tracking-[0.2em] text-[10px]">Retrieving Tactical Intel...</p>
            </div>
        );
    }

    if (!experience) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center p-8 text-center">
                <h1 className="text-4xl font-display font-bold text-[var(--text-primary)] mb-4">Intel Link Broken</h1>
                <p className="text-[var(--text-secondary)] mb-8">The requested transmission could not be decrypted or does not exist.</p>
                <Link href="/wiki" className="btn-primary px-8 py-3 rounded-xl">Back to Wiki</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-base)] py-12 px-6 lg:px-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--brand-primary)] opacity-[0.03] blur-[150px] -mr-96 -mt-96 pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <Link
                    href="/experiences"
                    className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-12 transition-colors group"
                >
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Experiences Archive</span>
                </Link>

                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-[3rem] p-12 border border-[var(--border-subtle)] shadow-2xl mb-12"
                >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                        <div className="flex items-center gap-8">
                            <div className="w-24 h-24 bg-white rounded-3xl p-4 flex items-center justify-center shadow-2xl ring-1 ring-black/5">
                                {(experience.companies as any)?.logo_url ? (
                                    <img src={(experience.companies as any).logo_url} alt={(experience.companies as any).name} className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl font-display font-bold text-[var(--text-primary)]">{(experience.companies as any)?.name}</h1>
                                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                                        Verified Intel
                                    </div>
                                </div>
                                <p className="text-xl text-[var(--text-secondary)] font-medium">{experience.role}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 bg-[var(--bg-overlay)] px-4 py-2 rounded-xl border border-[var(--border-subtle)]">
                                <CalendarIcon className="w-4 h-4 text-[var(--text-muted)]" />
                                <span className="text-xs font-bold text-[var(--text-secondary)]">{experience.year} Batch</span>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${experience.difficulty === 'Easy' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' :
                                experience.difficulty === 'Medium' ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' :
                                    'bg-rose-500/5 border-rose-500/20 text-rose-500'
                                }`}>
                                <ShieldCheckIcon className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">{experience.difficulty} Intensity</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card rounded-[2.5rem] p-10 border border-[var(--border-subtle)]"
                        >
                            <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3">
                                <div className="p-2 bg-[var(--brand-primary)]/10 rounded-xl">
                                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-[var(--brand-primary)]" />
                                </div>
                                Tactical De-briefing
                            </h2>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap text-lg">
                                    {experience.content}
                                </p>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="glass-card rounded-3xl p-8 border border-[var(--border-subtle)]">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">Interview Phase</h3>
                                <p className="text-2xl font-display font-bold text-[var(--text-primary)]">{experience.round}</p>
                            </div>
                            <div className="glass-card rounded-3xl p-8 border border-[var(--border-subtle)]">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">Strategic Outcome</h3>
                                <p className={`text-2xl font-display font-bold capitalize ${experience.outcome === 'offered' ? 'text-emerald-500' :
                                    experience.outcome === 'rejected' ? 'text-rose-500' :
                                        'text-amber-500'
                                    }`}>{experience.outcome}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Profile & Sidebar */}
                    <div className="space-y-8">
                        {/* Contributor Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card rounded-[2rem] p-8 border border-[var(--border-subtle)] text-center"
                        >
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] mx-auto mb-6 flex items-center justify-center text-white text-3xl font-display font-bold shadow-2xl">
                                {experience.profiles?.full_name?.[0] || 'U'}
                            </div>
                            <h3 className="text-xl font-display font-bold text-[var(--text-primary)] mb-1">{experience.profiles?.full_name || 'Anonymous Strategist'}</h3>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">{experience.profiles?.college || 'Engineering Vanguard'}</p>

                            <div className="pt-6 border-t border-[var(--border-subtle)]">
                                <div className="flex items-center justify-center gap-2 text-amber-500">
                                    <TrophyIcon className="w-5 h-5" />
                                    <span className="font-display font-bold">Strategy Veteran</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Company Stats Sidebar */}
                        <div className="glass-card rounded-[2rem] p-8 border border-[var(--border-subtle)]">
                            <h3 className="font-display font-bold text-[var(--text-primary)] mb-6">Company Profile</h3>
                            <div className="space-y-5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--text-muted)]">Industry</span>
                                    <span className="text-[var(--text-secondary)] font-medium">{(experience.companies as any)?.industry || 'Technology'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--text-muted)]">Compensation</span>
                                    <span className="text-[var(--text-secondary)] font-medium">{(experience.companies as any)?.package_lpa_max} LPA Max</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--text-muted)]">Hiring Tier</span>
                                    <span className="text-[var(--brand-primary)] font-bold uppercase tracking-widest text-[10px]">{(experience.companies as any)?.tier}</span>
                                </div>
                            </div>

                            <Link
                                href={`/companies/${(experience.companies as any)?.slug}`}
                                className="w-full btn-secondary mt-8 py-3 rounded-xl flex items-center justify-center gap-2"
                            >
                                <BuildingOfficeIcon className="w-4 h-4" />
                                <span>Master Company Prep</span>
                            </Link>
                        </div>

                        {/* AI Analysis Teaser */}
                        <div className="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-indigo-400 mb-4">
                                    <AcademicCapIcon className="w-5 h-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Archon Neural Analysis</span>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
                                    Analyzing this tactical data against historical patterns... Potential optimization vectors detected.
                                </p>
                                <button className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 group">
                                    Unlock Review
                                    <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <AcademicCapIcon className="w-24 h-24 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { ArrowRightIcon } from '@heroicons/react/24/outline';

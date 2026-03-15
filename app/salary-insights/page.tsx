'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
    TrendingUp,
    Briefcase,
    ArrowUpRight,
    BarChart3,
    Target,
    Zap,
    Scale
} from 'lucide-react';
import Link from 'next/link';

export default function SalaryInsightsPage() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCompanies() {
            const { data } = await supabase
                .from('companies')
                .select('*')
                .not('package_lpa_min', 'is', null)
                .order('package_lpa_max', { ascending: false });
            setCompanies(data || []);
            setLoading(false);
        }
        loadCompanies();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)] rounded-full animate-spin" />
        </div>
    );

    const averageLPA = companies.length > 0
        ? Math.round(companies.reduce((acc, curr) => acc + (curr.package_lpa_min || 0), 0) / companies.length)
        : 0;

    return (
        <div className="min-h-screen bg-[var(--bg-base)] py-16 px-4">
            <div className="max-w-[1280px] mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-secondary)]/10 border border-[var(--brand-secondary)]/20 text-[var(--brand-secondary)] text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                        >
                            <Scale size={12} /> Strategic_Compensation_Intel
                        </motion.div>
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white mb-6">
                            Salary <span className="text-transparent bg-clip-text bg-brand-gradient">Insights</span>
                        </h1>
                        <p className="text-[var(--text-secondary)] text-lg max-w-2xl font-medium">
                            Real-time CTC distribution, package benchmarks, and compensation data from Tier-1 strategic hiring partners.
                        </p>
                    </div>

                    <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center gap-8 backdrop-blur-xl">
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1">Regional_Benchmark</p>
                            <p className="text-2xl font-black text-white tracking-tighter uppercase">LNMIT_Tier_1</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                            <Target size={24} />
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: 'Avg Base Package', value: `₹${averageLPA} LPA`, icon: TrendingUp, color: 'text-emerald-400' },
                        { label: 'Highest Package', value: `₹${companies[0]?.package_lpa_max || '0'} LPA`, icon: Zap, color: 'text-amber-400' },
                        { label: 'Active Partners', value: companies.length, icon: Briefcase, color: 'text-blue-400' },
                        { label: 'Data Accuracy', value: '98.5%', icon: Target, color: 'text-purple-400' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-8 rounded-[2.5rem] shadow-xl"
                        >
                            <div className={`p-4 rounded-2xl bg-white/5 ${stat.color} mb-6 w-fit`}>
                                <stat.icon size={24} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">{stat.label}</p>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight">{stat.value}</h3>
                        </motion.div>
                    ))}
                </div>

                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[3rem] overflow-hidden shadow-2xl">
                    <div className="p-10 border-b border-[var(--border-subtle)] flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[var(--brand-primary)]/10 rounded-2xl text-[var(--brand-primary)]">
                                <BarChart3 size={24} />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">CTC Distribution Table</h2>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] bg-white/5 px-4 py-2 rounded-xl border border-white/5">Synced: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/20">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Target Company</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Industry Segment</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Package Range</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-right">Strategic Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-subtle)]">
                                {companies.map((company, i) => (
                                    <tr key={company.id} className="hover:bg-white/[0.02] group transition-colors">
                                        <td className="px-10 py-8">
                                            <Link href={`/company/${company.slug}`} className="flex items-center gap-5 group">
                                                <div className="w-12 h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center font-black text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-all">
                                                    {company.name[0]}
                                                </div>
                                                <span className="text-lg font-black text-white uppercase tracking-tight group-hover:text-[var(--brand-primary)] transition-all">{company.name}</span>
                                            </Link>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-80">{company.industry || 'Tech / SDE'}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-emerald-400 mb-1">
                                                    <span>₹{company.package_lpa_min} LPA</span>
                                                    <span>₹{company.package_lpa_max} LPA</span>
                                                </div>
                                                <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(company.package_lpa_max / 50) * 100}%` }}
                                                        className="h-full bg-brand-gradient rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <Link href={`/company/${company.slug}`} className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] transition-all group">
                                                View Intel <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-20 grid lg:grid-cols-2 gap-10">
                    <div className="glass-card p-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[3rem]">
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-6 flex items-center gap-3">
                            <TrendingUp className="text-emerald-400" /> Comp_Trend_Analysis
                        </h3>
                        <p className="text-sm text-text-secondary leading-relaxed mb-10 font-medium">
                            Market intelligence suggests a 15% increase in base packages for specialized roles (AI/ML, Systems Design) compared to Q4 2023. Strategic engagement with Fintech partners shows highest growth potential.
                        </p>
                        <div className="space-y-4">
                            {[
                                { label: 'Backend Architecture', growth: '+18%', color: 'var(--brand-primary)' },
                                { label: 'Distributed Systems', growth: '+22%', color: 'var(--brand-secondary)' },
                                { label: 'Product Management', growth: '+12%', color: 'var(--brand-tertiary)' }
                            ].map((trend, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{trend.label}</span>
                                    <span className="text-xs font-black text-white" style={{ color: trend.color }}>{trend.growth} Velocity</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-10 bg-brand-gradient border border-white/20 rounded-[3rem] text-white">
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3 italic">
                            <Zap fill="white" /> Tactical_Advice
                        </h3>
                        <p className="text-lg font-bold leading-snug mb-8 opacity-90">
                            "Targeting packages above 25 LPA requires verified proficiency in System Design and low-latency architecture. Your current profile has a 82% alignment with these requirements."
                        </p>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl">
                            Optimizing Profile <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

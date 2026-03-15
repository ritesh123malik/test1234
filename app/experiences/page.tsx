'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    Building2,
    User,
    Clock,
    ArrowUpRight,
    Plus,
    Search,
    Filter
} from 'lucide-react';

export default function ExperiencesPage() {
    const [experiences, setExperiences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchExperiences();
    }, []);

    async function fetchExperiences() {
        setLoading(true);
        const { data, error } = await supabase
            .from('interview_experiences')
            .select(`
                *,
                companies (name, slug)
            `)
            .order('created_at', { ascending: false });

        if (!error) setExperiences(data || []);
        setLoading(false);
    }

    const filtered = experiences.filter(exp =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.companies?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[var(--bg-base)] py-12">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Experiences' }]} className="mb-8" />

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
                            Interview <span className="text-transparent bg-clip-text bg-brand-gradient">Experiences</span>
                        </h1>
                        <p className="text-[var(--text-secondary)] text-lg font-medium max-w-2xl">
                            Real intel from the front lines. Verified interview loops, questions, and tactical advice from successful candidates.
                        </p>
                    </div>

                    <Link href="/experiences/add" className="btn-primary-lg !py-4 !px-8 flex items-center gap-3 shadow-xl shadow-[var(--brand-primary)]/20">
                        <Plus size={20} strokeWidth={3} /> Share Experience
                    </Link>
                </div>

                <div className="relative max-w-xl mb-12">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                    <input
                        type="text"
                        placeholder="Search by company or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-5 bg-[var(--bg-card)] border-2 border-[var(--border-subtle)] rounded-2xl text-white placeholder-[var(--text-muted)] outline-none focus:border-[var(--brand-primary)] transition-all shadow-xl"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="glass-card h-64 animate-pulse opacity-50" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="glass-card py-20 text-center">
                        <MessageSquare size={48} className="mx-auto text-[var(--text-muted)] opacity-20 mb-6" />
                        <p className="text-[var(--text-secondary)] font-bold text-xl uppercase tracking-widest">No intel found matching your search</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filtered.map((exp) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={exp.id}
                                className="glass-card p-8 hover:border-[var(--brand-primary)] transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Building2 size={80} />
                                </div>

                                <div className="flex items-center gap-3 mb-6">
                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${exp.difficulty === 'Hard' ? 'text-red-500 border-red-500/20 bg-red-500/5' :
                                            exp.difficulty === 'Medium' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' :
                                                'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                                        }`}>
                                        {exp.difficulty}
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                        {exp.role}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 group-hover:text-[var(--brand-primary)] transition-colors leading-tight">
                                    {exp.title}
                                </h3>

                                <div className="flex items-center gap-6 text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest mb-8">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={14} className="text-[var(--brand-primary)]" />
                                        {exp.companies?.name}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} />
                                        {new Date(exp.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </div>
                                </div>

                                <Link
                                    href={`/experiences/${exp.id}`}
                                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-[var(--brand-primary)] transition-colors"
                                >
                                    Read Intel <ArrowUpRight size={14} />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

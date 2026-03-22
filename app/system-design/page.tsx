'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SystemDesignWhiteboard from '@/components/system-design/SystemDesignWhiteboard';
import {
    PlusIcon,
    DocumentDuplicateIcon,
    ChartBarIcon,
    ClockIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function SystemDesignPage() {
    const [designs, setDesigns] = useState<any[]>([]);
    const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkUser();
        loadDesigns();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/auth/login');
            return;
        }
        setUserId(user.id);
    };

    const loadDesigns = async () => {
        const { data } = await supabase
            .from('system_designs')
            .select('*')
            .order('created_at', { ascending: false });

        setDesigns(data || []);
        setLoading(false);
    };

    const createNewDesign = async () => {
        if (!userId) return;

        const { data, error } = await supabase
            .from('system_designs')
            .insert({
                user_id: userId,
                title: 'New Design',
                description: '',
                problem_statement: ''
            })
            .select()
            .single();

        if (data) {
            setSelectedDesign(data.id);
            loadDesigns();
        }
    };

    const problems = [
        { title: 'Design Twitter', difficulty: 'Hard', time: '45 min' },
        { title: 'Design URL Shortener', difficulty: 'Medium', time: '30 min' },
        { title: 'Design WhatsApp', difficulty: 'Hard', time: '60 min' },
        { title: 'Design Netflix', difficulty: 'Hard', time: '60 min' },
        { title: 'Design Uber', difficulty: 'Hard', time: '45 min' },
        { title: 'Design Dropbox', difficulty: 'Medium', time: '30 min' },
    ];

    if (selectedDesign) {
        return (
            <SystemDesignWhiteboard
                designId={selectedDesign}
                userId={userId!}
                onSave={() => setSelectedDesign(null)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-bg-base py-12">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border border-brand-primary/20">Arch_v1.0</span>
                            <div className="h-px w-10 bg-border-subtle" />
                            <span className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em]">Sector: System_Design</span>
                        </div>
                        <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4">System Architecture</h1>
                        <p className="max-w-xl text-text-secondary text-lg font-medium leading-relaxed">
                            Draft high-fidelity architectural blueprints. Leverage AI telemetry to identify bottlenecks and optimize for global scale.
                        </p>
                    </div>
                    <button
                        onClick={createNewDesign}
                        className="btn-primary rounded-2xl flex items-center gap-2 px-8 py-4 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20"
                    >
                        <PlusIcon className="w-4 h-4" />
                        New Blueprint
                    </button>
                </div>

                {/* Stats HUD */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Blueprints_Logged', value: designs.length, icon: DocumentDuplicateIcon, color: 'var(--brand-primary)' },
                        { label: 'AI_Synthesized', value: designs.filter(d => d.ai_feedback).length, icon: ChartBarIcon, color: 'var(--brand-success)' },
                        { label: 'Collab_Nodes', value: 12, icon: UserGroupIcon, color: 'var(--brand-secondary)' },
                        { label: 'Research_Time', value: '3.5h', icon: ClockIcon, color: 'var(--brand-tertiary)' }
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-8 rounded-[2.5rem] border border-border-subtle relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[40px] rounded-full group-hover:bg-white/10 transition-all" />
                            <stat.icon className="w-6 h-6 mb-4 opacity-50" style={{ color: stat.color }} />
                            <div>
                                <div className="text-3xl font-black text-white mb-1 tracking-tighter">{stat.value}</div>
                                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-text-muted">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* My Designs Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.5)]" />
                            Personal_Archives
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {designs.map((design) => (
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    key={design.id}
                                    onClick={() => setSelectedDesign(design.id)}
                                    className="glass-card p-6 cursor-pointer border border-border-subtle hover:border-brand-primary/40 rounded-3xl group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="font-black text-white uppercase tracking-tight text-lg group-hover:text-brand-primary transition-colors">{design.title}</h3>
                                        {design.ai_feedback && (
                                            <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-md text-[8px] font-black uppercase tracking-widest">
                                                AI_SYNTH
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-text-secondary mb-6 line-clamp-2 h-8 leading-relaxed">{design.problem_statement || 'No problem statement defined yet.'}</p>
                                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-text-muted">
                                        <span>INIT: {new Date(design.created_at).toLocaleDateString()}</span>
                                        {design.is_public && <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-brand-success" /> GLOBAL</span>}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Operational Protocols (Practice Problems) */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary shadow-[0_0_8px_rgba(var(--brand-secondary-rgb),0.5)]" />
                            Design_Protocols
                        </h2>
                        <div className="glass-card p-8 rounded-[2.5rem] border border-border-subtle">
                            <div className="space-y-4">
                                {problems.map((problem, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-brand-secondary/30 transition-all cursor-pointer group"
                                    >
                                        <h3 className="font-bold text-white mb-2 group-hover:text-brand-secondary transition-colors text-sm uppercase tracking-tight">{problem.title}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                                                problem.difficulty === 'Hard' 
                                                ? 'bg-brand-danger/10 text-brand-danger border-brand-danger/20' 
                                                : 'bg-brand-warning/10 text-brand-warning border-brand-warning/20'
                                            }`}>
                                                {problem.difficulty}
                                            </span>
                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                                <ClockIcon className="w-3 h-3" /> {problem.time}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

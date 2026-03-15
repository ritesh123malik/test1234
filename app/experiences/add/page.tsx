'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import {
    Plus,
    Building2,
    Trophy,
    AlertCircle,
    CheckCircle,
    Loader2,
    Zap
} from 'lucide-react';

export default function AddExperiencePage() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        company_id: '',
        title: '',
        role: 'SDE',
        difficulty: 'Medium',
        content: '',
        is_premium: false
    });

    const router = useRouter();

    useEffect(() => {
        async function fetchCompanies() {
            const { data } = await supabase.from('companies').select('id, name').order('name');
            setCompanies(data || []);
        }
        fetchCompanies();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/auth/login');
            return;
        }

        const { error } = await supabase.from('interview_experiences').insert({
            ...formData,
            user_id: user.id
        });

        if (error) {
            alert('Error: ' + error.message);
        } else {
            setSuccess(true);
            setTimeout(() => router.push('/experiences'), 2000);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-[var(--bg-base)] py-12">
            <div className="max-w-[800px] mx-auto px-4">
                <Breadcrumbs
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Experiences', href: '/experiences' },
                        { label: 'Share Intel' }
                    ]}
                    className="mb-8"
                />

                <div className="mb-12">
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">
                        Share <span className="text-transparent bg-clip-text bg-brand-gradient">Intel</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg font-medium">
                        Contribute to the collective intelligence. Your experience helps others target Tier-1 strategic assets.
                    </p>
                </div>

                <div className="glass-card p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient" />

                    {success ? (
                        <div className="py-20 text-center space-y-6">
                            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-2xl shadow-emerald-500/20">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Transmission Successful</h2>
                            <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-sm">Your intelligence has been archived.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Target Company</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                        <select
                                            required
                                            value={formData.company_id}
                                            onChange={(e) => setFormData(prev => ({ ...prev, company_id: e.target.value }))}
                                            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-[var(--brand-primary)] transition-all appearance-none"
                                        >
                                            <option value="" className="bg-gray-900">Select Company</option>
                                            {companies.map(c => (
                                                <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Threat Level (Difficulty)</label>
                                    <div className="flex gap-2">
                                        {['Easy', 'Medium', 'Hard'].map(d => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, difficulty: d }))}
                                                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.difficulty === d
                                                        ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white shadow-lg'
                                                        : 'bg-white/5 border-white/10 text-[var(--text-muted)] hover:bg-white/10'
                                                    }`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Intel Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. SDE-1 Interview Loop @ Google Jan 2024"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-[var(--brand-primary)] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Tactical Report (Experience Details)</label>
                                <textarea
                                    required
                                    placeholder="Describe the rounds, questions asked, and your advice..."
                                    value={formData.content}
                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-[var(--brand-primary)] transition-all h-64 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.company_id}
                                className="w-full py-5 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-[var(--brand-primary)] hover:text-white transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3 group"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} className="group-hover:fill-current" />}
                                Initiate Transmission
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

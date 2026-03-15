'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    ExternalLink,
    Plus,
    Loader2,
    AlertCircle,
    Timer,
    ChevronRight
} from 'lucide-react';

interface Contest {
    id: string;
    title: string;
    platform: string;
    start_time: string;
    url: string;
}

export default function ContestCalendar() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchContests() {
            try {
                const res = await fetch('/api/contests');
                const data = await res.json();
                setContests(data.contests || []);
            } catch (err) {
                setError('Failed to load contest schedule');
            } finally {
                setIsLoading(false);
            }
        }
        fetchContests();
    }, []);

    const addToGoogleCalendar = (contest: Contest) => {
        const start = new Date(contest.start_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
        const end = new Date(new Date(contest.start_time).getTime() + 7200000).toISOString().replace(/-|:|\.\d\d\d/g, '');
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(contest.title)}&dates=${start}/${end}&details=${encodeURIComponent('Sync via placement-intel Dashboard')}&location=${encodeURIComponent(contest.url)}`;
        window.open(url, '_blank');
    };

    if (isLoading) return (
        <div className="bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border-subtle)] p-10 h-[500px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-[var(--brand-primary)] animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Neural_Sync_Active</p>
            </div>
        </div>
    );

    return (
        <div className="bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border-subtle)] p-10 h-full overflow-hidden flex flex-col shadow-2xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-primary)]/5 blur-[80px] rounded-full" />

            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 rounded-2xl text-[var(--brand-primary)]">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h3 className="text-[var(--text-primary)] font-black uppercase tracking-widest text-xs">Contest Intelligence</h3>
                        <p className="text-[9px] font-bold text-[var(--brand-success)] mt-1 tracking-wider uppercase opacity-80">Global Schedule Sync</p>
                    </div>
                </div>
                <div className="px-4 py-1.5 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl text-[10px] text-[var(--text-secondary)] font-black tracking-widest uppercase shadow-inner">
                    {contests.length} Events
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar relative z-10">
                <AnimatePresence>
                    {contests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)]">
                            <AlertCircle className="mb-4 opacity-20" size={48} />
                            <p className="font-bold text-sm uppercase tracking-tighter italic">No upcoming strategic events</p>
                        </div>
                    ) : contests.map((c, i) => (
                        <motion.div
                            key={c.id || i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group p-5 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/40 hover:bg-[var(--bg-overlay)] transition-all flex items-center justify-between shadow-lg"
                        >
                            <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-tighter transition-all shadow-inner ${c.platform.includes('codeforces') ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                    c.platform.includes('leetcode') ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                        c.platform.includes('atcoder') ? 'bg-[var(--bg-muted)] text-[var(--text-primary)] border border-white/5' :
                                            'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20'
                                    }`}>
                                    {c.platform.slice(0, 4)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[15px] font-black text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--brand-primary)] transition-colors uppercase tracking-tight">{c.title}</h4>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] text-[var(--text-secondary)] font-mono mt-1.5 opacity-80">
                                        <span className="flex items-center gap-2"><Calendar size={13} className="text-[var(--brand-primary)]" /> {new Date(c.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                        <span className="flex items-center gap-2 uppercase font-black"><Timer size={13} className="text-[var(--brand-primary)]" /> {new Date(c.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pl-4">
                                <button
                                    onClick={() => addToGoogleCalendar(c)}
                                    className="p-3 bg-[var(--bg-muted)] hover:bg-[var(--brand-primary)] text-[var(--text-muted)] hover:text-white rounded-xl transition-all shadow-sm"
                                    title="Add to Google Calendar"
                                >
                                    <Plus size={16} />
                                </button>
                                <a
                                    href={c.url}
                                    target="_blank"
                                    className="p-3 bg-[var(--bg-muted)] hover:bg-[var(--brand-primary)] text-[var(--text-muted)] hover:text-white rounded-xl transition-all shadow-sm"
                                >
                                    <ChevronRight size={18} />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--brand-primary); }
            `}</style>
        </div>
    );
}


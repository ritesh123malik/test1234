// components/leaderboard/Leaderboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { subDays, format } from 'date-fns';
import {
    TrophyIcon,
    FireIcon,
    AcademicCapIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

interface LeaderboardProps {
    userId: string;
}

export default function Leaderboard({ userId }: LeaderboardProps) {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [heatmapData, setHeatmapData] = useState<any[]>([]);
    const [userStats, setUserStats] = useState<any>(null);
    const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [timeframe]);

    const loadData = async () => {
        // Load leaderboard
        const { data: leaderboardData } = await supabase
            .from('leaderboard_entries')
            .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
            .order('total_points', { ascending: false })
            .limit(100);

        setLeaderboard(leaderboardData || []);

        // Load heatmap data for current user
        const startDate = subDays(new Date(), 365);
        const { data: heatmap } = await supabase
            .from('contribution_heatmap')
            .select('*')
            .eq('user_id', userId)
            .gte('activity_date', startDate.toISOString().split('T')[0]);

        setHeatmapData(heatmap || []);

        // Get user stats
        const { data: stats } = await supabase
            .from('leaderboard_entries')
            .select('*')
            .eq('user_id', userId)
            .single();

        setUserStats(stats);
        setLoading(false);
    };

    const getContributionColor = (value: number) => {
        if (!value) return 'color-empty';
        if (value < 5) return 'color-scale-1';
        if (value < 10) return 'color-scale-2';
        if (value < 20) return 'color-scale-3';
        return 'color-scale-4';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-12 h-12 border-4 border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)] rounded-full animate-spin mb-4"></div>
                <p className="text-[var(--text-secondary)] font-medium">Synchronizing Leaderboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 text-[var(--text-primary)]">
            {/* User Strategy Stats */}
            {userStats && (
                <div className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] opacity-10 blur-3xl pointer-events-none" />
                    <div className="glass-card rounded-[2rem] border border-[var(--border-subtle)] p-8 relative z-10 shadow-2xl transition-all duration-500 hover:border-[var(--brand-primary)]/40">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 rounded-xl">
                                <ChartBarIcon className="w-5 h-5 text-[var(--brand-primary)]" />
                            </div>
                            <h2 className="text-xl font-display font-bold">Your Performance Intelligence</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Strategic Score</p>
                                <div className="text-4xl font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">{userStats.total_points}</div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Challenges Won</p>
                                <div className="text-4xl font-display font-bold text-[var(--text-primary)]">{userStats.questions_solved}</div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Simulations</p>
                                <div className="text-4xl font-display font-bold text-[var(--text-primary)]">{userStats.quizzes_taken}</div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Operational Streak</p>
                                <div className="flex items-center gap-2">
                                    <FireIcon className="w-6 h-6 text-orange-500 animate-pulse" />
                                    <div className="text-4xl font-display font-bold text-[var(--text-primary)]">{userStats.streak_days}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tactical Engagement Heatmap */}
            <div className="glass-card rounded-[2rem] border border-[var(--border-subtle)] p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h3 className="text-xl font-display font-bold flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                                <FireIcon className="w-6 h-6 text-orange-500" />
                            </div>
                            Contribution Intelligence
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">Daily engagement activity over the last 365 days.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-[var(--bg-base)]/50 px-4 py-2 border border-[var(--border-subtle)] rounded-xl">
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Activity Intensity</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-[var(--bg-overlay)] rounded-sm" />
                            <div className="w-3 h-3 bg-indigo-500/30 rounded-sm" />
                            <div className="w-3 h-3 bg-indigo-500/60 rounded-sm" />
                            <div className="w-3 h-3 bg-indigo-500 rounded-sm" />
                        </div>
                    </div>
                </div>

                <div className="heatmap-container overflow-hidden">
                    <CalendarHeatmap
                        startDate={subDays(new Date(), 365)}
                        endDate={new Date()}
                        values={heatmapData.map(d => ({
                            date: d.activity_date,
                            count: d.count
                        }))}
                        classForValue={(value) => {
                            if (!value) return 'color-empty';
                            const count = value.count;
                            if (count < 5) return 'color-scale-1';
                            if (count < 10) return 'color-scale-2';
                            if (count < 20) return 'color-scale-3';
                            return 'color-scale-4';
                        }}
                        showWeekdayLabels={true}
                    />
                </div>
            </div>

            {/* Strategy Timeframe & Leaderboard */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-display font-bold flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                            <TrophyIcon className="w-6 h-6 text-yellow-500" />
                        </div>
                        Vanguard Leaderboard
                    </h3>

                    <div className="flex bg-[var(--bg-card)]/50 p-1.5 border border-[var(--border-subtle)] rounded-2xl">
                        {['weekly', 'monthly', 'alltime'].map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf as any)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${timeframe === tf
                                    ? 'bg-[var(--brand-primary)] text-white shadow-lg'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="glass-card rounded-[2.5rem] border border-[var(--border-subtle)] overflow-hidden shadow-2xl">
                    <div className="divide-y divide-[var(--border-subtle)]">
                        {leaderboard.map((entry, index) => {
                            const isCurrentUser = entry.user_id === userId;
                            const rank = index + 1;

                            return (
                                <div
                                    key={entry.user_id}
                                    className={`p-6 flex items-center transition-colors hover:bg-[var(--bg-overlay)]/40 ${isCurrentUser ? 'bg-[var(--brand-primary)]/5 border-l-4 border-l-[var(--brand-primary)]' : ''
                                        }`}
                                >
                                    <div className="w-16 flex justify-center">
                                        {rank <= 3 ? (
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg ${rank === 1 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                                                    rank === 2 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30' :
                                                        'bg-amber-700/20 text-amber-700 border border-amber-700/30'
                                                }`}>
                                                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                                            </div>
                                        ) : (
                                            <span className="text-[var(--text-muted)] font-mono font-bold">#{rank.toString().padStart(2, '0')}</span>
                                        )}
                                    </div>

                                    <div className="flex-1 flex items-center px-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-2xl flex items-center justify-center text-white font-display font-bold shadow-xl">
                                                {entry.profiles?.full_name?.[0] || 'U'}
                                            </div>
                                            {rank <= 3 && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[var(--bg-surface)] rounded-full" />
                                            )}
                                        </div>
                                        <div className="ml-5">
                                            <p className="font-display font-bold text-lg flex items-center gap-2">
                                                {entry.profiles?.full_name || 'Anonymous Strategist'}
                                                {isCurrentUser && <span className="text-[8px] font-bold uppercase tracking-widest bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] px-2 py-0.5 rounded-full border border-[var(--brand-primary)]/20">AGENT</span>}
                                            </p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">
                                                {entry.questions_solved} Solutions • {entry.quizzes_taken} Validations
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right pr-4">
                                        <p className="font-display font-bold text-2xl text-[var(--text-primary)] leading-none">{entry.total_points}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)] mt-1">CREDITS</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style jsx global>{`
              .heatmap-container .color-empty { fill: var(--bg-overlay) !important; }
              .heatmap-container .color-scale-1 { fill: rgba(99, 102, 241, 0.3) !important; }
              .heatmap-container .color-scale-2 { fill: rgba(99, 102, 241, 0.6) !important; }
              .heatmap-container .color-scale-3 { fill: var(--brand-primary) !important; }
              .heatmap-container .color-scale-4 { fill: var(--brand-secondary) !important; }
              .react-calendar-heatmap rect { rx: 2; ry: 2; }
            `}</style>
        </div>
    );
}

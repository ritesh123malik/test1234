'use client';
import { useState, useEffect, useCallback } from 'react';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import GeoFilter from '@/components/leaderboard/GeoFilter';
import MyRankCard from '@/components/leaderboard/MyRankCard';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type TabType = 'global' | 'college' | 'city' | 'weekly';

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState<TabType>('global');
    const [college, setCollege] = useState('');
    const [city, setCity] = useState('');
    const [entries, setEntries] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [filterOptions, setFilterOptions] = useState<any>({ colleges: [], cities: [] });
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>();

    // Fetch filter options + my rank on mount
    useEffect(() => {
        async function init() {
            try {
                // Get session from Supabase
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.id) setCurrentUserId(user.id);

                const [filters, rankData] = await Promise.all([
                    fetch('/api/leaderboard?action=filters').then(r => r.json()),
                    fetch('/api/leaderboard?action=my_rank').then(r => r.json()).catch(() => null)
                ]);
                setFilterOptions(filters ?? { colleges: [], cities: [] });
                if (rankData?.rank) setMyRank(rankData.rank);
            } catch (e) {
                console.error('Init error:', e);
            }
        }
        init();
    }, []);

    // Fetch leaderboard on tab/filter change
    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                action: 'list',
                type: activeTab,
                limit: '50'
            });
            if (college) params.set('college', college);
            if (city) params.set('city', city);

            const res = await fetch(`/api/leaderboard?${params}`);
            const { data } = await res.json();
            setEntries(data ?? []);
        } catch (e) {
            console.error('Fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, [activeTab, college, city]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    const tabs: { id: TabType; label: string; icon: string }[] = [
        { id: 'global', label: 'Global', icon: '🏆' },
        { id: 'college', label: 'College', icon: '🏛️' },
        { id: 'city', label: 'City', icon: '📍' },
        { id: 'weekly', label: 'Weekly', icon: '🔥' },
    ];

    return (
        <div className='max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-10'>
            <header className='flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8'>
                <div className="space-y-2 md:space-y-3 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <svg width="20" height="20" md-width="24" md-height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                        </div>
                        <h1 className='text-3xl md:text-5xl font-black tracking-tighter'>Arena</h1>
                    </div>
                    <p className='text-gray-400 text-sm md:text-lg max-w-lg'>Compete with top students across India. Based on total XP from interviews and daily challenges.</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-1 md:p-2 rounded-2xl md:rounded-3xl flex gap-1 shadow-2xl overflow-x-auto hide-scrollbar">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                                : 'text-gray-500 hover:text-white'
                                }`}>
                            <span className="opacity-70 text-xs md:text-base">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>


            {/* My Rank Card */}
            <AnimatePresence mode="wait">
                {myRank && activeTab !== 'weekly' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                    >
                        <MyRankCard rank={myRank} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filter Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-y border-gray-800/50">
                <div className='flex flex-wrap gap-4 items-center'>
                    <GeoFilter
                        type='college' value={college} onChange={setCollege}
                        options={filterOptions?.colleges || []} placeholder='All Colleges'
                    />
                    <GeoFilter
                        type='city' value={city} onChange={setCity}
                        options={filterOptions?.cities || []} placeholder='All Cities'
                    />
                    {(college || city) && (
                        <button
                            onClick={() => { setCollege(''); setCity(''); }}
                            className='px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5'>
                            Reset
                        </button>
                    )}
                </div>

                {!myRank && !loading && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-2xl animate-pulse">
                        <span className="text-xs">👋</span>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                            New here? Go to <Link href="/profile" className="underline decoration-blue-500/30 hover:text-blue-300">Profile</Link> to set your identity!
                        </p>
                    </div>
                )}

                <div className="text-right">
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-1">Last Update</p>
                    <div className="flex items-center gap-2 text-gray-400 font-mono text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Synced 15m ago
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <LeaderboardTable
                    entries={entries}
                    type={activeTab}
                    currentUserId={currentUserId}
                    isLoading={loading}
                />
            </motion.div>

            {/* Footer Info */}
            <div className="text-center pt-8">
                <p className="text-gray-500 text-sm">
                    🏆 Tie-breaker is based on avg interview score.
                    <br />
                    Level caps at 100.
                </p>
            </div>
        </div>
    );
}

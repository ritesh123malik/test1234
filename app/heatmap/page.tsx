'use client';
import { useState, useEffect } from 'react';
import ActivityGrid from '@/components/heatmap/ActivityGrid';
import TopicRadar from '@/components/heatmap/TopicRadar';
import WeaknessCards from '@/components/heatmap/WeaknessCards';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeatmapPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'topics' | 'trend'>('overview');

    useEffect(() => {
        fetch('/api/heatmap')
            .then(r => r.json())
            .then(d => {
                if (d.error) setError(d.error);
                else setData(d);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to fetch heatmap data');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className='max-w-6xl mx-auto px-4 py-12 space-y-8 h-screen'>
                <div className='animate-pulse space-y-8'>
                    <div className='h-32 bg-gray-800/50 rounded-3xl w-full' />
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                        <div className='h-[400px] bg-gray-800/50 rounded-3xl' />
                        <div className='h-[400px] bg-gray-800/50 rounded-3xl' />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data || (!data.grid?.length && !data.topics?.length)) {
        return (
            <div className='max-w-6xl mx-auto px-4 py-24 text-center'>
                <div className='bg-gray-900 rounded-3xl border border-gray-800 p-16 shadow-2xl'>
                    <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-8">
                        <span className='text-5xl'>📉</span>
                    </div>
                    <h2 className='text-white text-3xl font-black mb-4'>Insight Reservoir Empty</h2>
                    <p className='text-gray-400 text-lg max-w-md mx-auto leading-relaxed'>
                        We need at least one completed AI interview session to generate your topical performance map.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <a href='/interviewer'
                            className='px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white
                  font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95'>
                            Initiate AI Interview
                        </a>
                        <button
                            onClick={() => window.location.reload()}
                            className='px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300
                  font-bold rounded-2xl transition-all active:scale-95'>
                            Refresh Data
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='max-w-6xl mx-auto px-4 py-12 space-y-10'>
            <header className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                        </div>
                        <h1 className='text-white text-4xl font-black tracking-tight'>Performance Heatmap</h1>
                    </div>
                    <p className="text-gray-400 text-lg">Detailed analysis of your technical and behavioral interview sessions.</p>
                </div>

                <div className='flex bg-gray-900 border border-gray-800 p-1.5 rounded-2xl'>
                    {(['overview', 'topics'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${activeTab === tab
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-gray-500 hover:text-white'
                                }`}>
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <ActivityGrid data={data.grid ?? []} />
            </motion.section>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                        className='grid grid-cols-1 lg:grid-cols-5 gap-8'
                    >
                        <div className="lg:col-span-2">
                            <TopicRadar topics={data.topics ?? []} />
                        </div>
                        <div className="lg:col-span-3">
                            <WeaknessCards topics={data.topics ?? []} summary={data.summary} />
                        </div>
                    </motion.div>
                )}

                {activeTab === 'topics' && (
                    <motion.div
                        key="topics"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className='bg-gray-900 rounded-3xl border border-gray-800 p-8 shadow-xl'
                    >
                        <div className="mb-10">
                            <h3 className='text-white font-black text-2xl'>Topic Deep-Dive</h3>
                            <p className="text-gray-400">Granular view of performance across all evaluated domains.</p>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8'>
                            {(data.topics ?? []).map((t: any) => (
                                <div key={t.topic} className='flex flex-col gap-2 group'>
                                    <div className="flex items-center justify-between">
                                        <span className='text-gray-200 font-bold group-hover:text-blue-400 transition-colors'>{t.topic}</span>
                                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{t.attempt_count} ATTEMPTS</span>
                                    </div>
                                    <div className='flex items-center gap-4'>
                                        <div className='flex-1 h-3 bg-gray-800 rounded-full overflow-hidden'>
                                            <div
                                                className={`h-full transition-all duration-1000 ease-out ${t.avg_score >= 8 ? 'bg-emerald-500' :
                                                        t.avg_score >= 6 ? 'bg-amber-500' :
                                                            t.avg_score >= 4 ? 'bg-orange-500' : 'bg-rose-500'
                                                    }`}
                                                style={{ width: `${t.avg_score * 10}%` }}
                                            />
                                        </div>
                                        <span className={`text-xs font-black min-w-[44px] text-right ${t.avg_score >= 8 ? 'text-emerald-400' :
                                                t.avg_score >= 6 ? 'text-amber-400' :
                                                    t.avg_score >= 4 ? 'text-orange-400' : 'text-rose-400'
                                            }`}>
                                            {t.avg_score.toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

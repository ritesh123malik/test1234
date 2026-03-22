'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    Play,
    CheckCircle2,
    BookOpen,
    Clock,
    Zap,
    Brain,
    Trophy
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const TOPIC_DETAILS: Record<string, any> = {
    'dsa': { name: 'Data Structures & Algorithms', count: 1200, icon: <Brain className="text-blue-500" /> },
    'os': { name: 'Operating Systems', count: 150, icon: <Zap className="text-emerald-500" /> },
    'dbms': { name: 'DBMS & SQL', count: 200, icon: <Trophy className="text-amber-500" /> },
    'system-design': { name: 'System Design', count: 85, icon: <BookOpen className="text-purple-500" /> },
    'networking': { name: 'Computer Networks', count: 110, icon: <Clock className="text-rose-500" /> }
};

export default function TopicPractice() {
    const { topicId } = useParams();
    const router = useRouter();
    const topic = TOPIC_DETAILS[topicId as string] || {
        name: (topicId as string)?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Practice Modules',
        count: 0,
        icon: <Brain className="text-gray-500" />
    };
    
    const [filter, setFilter] = useState('All');
    const [questions, setQuestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStartingTest, setIsStartingTest] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/practice/questions?category=${topicId}&difficulty=${filter}`);
                const data = await res.json();
                setQuestions(data.questions || []);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, [topicId, filter]);

    const handleStartTimed = async () => {
        setIsStartingTest(true);
        try {
            const res = await fetch('/api/practice/timed', {
                method: 'POST',
                body: JSON.stringify({
                    topicId,
                    difficulty: filter === 'All' ? 'Medium' : filter,
                    duration: 60
                })
            });
            const data = await res.json();
            if (data.attempt) {
                router.push(`/oa-simulator/${data.attempt.id}`);
            } else {
                alert(data.error || 'Failed to start timed test');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsStartingTest(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white py-12 px-6">
            <div className="max-w-7xl mx-auto">
                <Link href="/practice" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 group font-black uppercase tracking-widest text-[10px]">
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back_to_Lobby
                </Link>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                {topic.icon}
                            </div>
                            <div>
                                <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter leading-none">
                                    {topic.name}
                                </h1>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3 italic">Active_Domain: {topicId}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleStartTimed}
                        disabled={isStartingTest}
                        className="group relative px-8 py-5 bg-blue-600 rounded-2xl flex items-center gap-4 overflow-hidden transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        <Clock size={20} className="text-white" />
                        <div className="text-left">
                            <div className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Initialize_Sprint</div>
                            <div className="text-md font-black uppercase tracking-tighter leading-none">Start Timed Test (60m)</div>
                        </div>
                        <Play size={16} fill="white" className="ml-4" />
                    </button>
                </div>

                <div className="grid lg:grid-cols-4 gap-12">
                    <div className="lg:col-span-1 space-y-8">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6">Execution_Filters</h3>
                            <div className="flex flex-col gap-2">
                                {['All', 'Easy', 'Medium', 'Hard'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                    >
                                        {f}_Modules
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-4">
                        {isLoading ? (
                            <div className="p-20 text-center font-black uppercase tracking-[0.5em] text-white/10">Synchronizing_Archives...</div>
                        ) : questions.length > 0 ? (
                            questions.map((q, idx) => (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => {
                                        const query = encodeURIComponent(`${q.title} interview question`);
                                        window.open(`https://www.google.com/search?q=${query}`, '_blank');
                                    }}
                                    className="group p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-blue-500/30 transition-all flex items-center justify-between cursor-pointer"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-2 h-12 rounded-full ${q.difficulty === 'Easy' ? 'bg-emerald-500/50' : q.difficulty === 'Medium' ? 'bg-amber-500/50' : 'bg-red-500/50'}`} />
                                        <div>
                                            <h4 className="text-lg font-black uppercase tracking-tight group-hover:text-blue-400 transition-colors">{q.title}</h4>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${q.difficulty === 'Easy' ? 'border-emerald-500/20 text-emerald-500' : q.difficulty === 'Medium' ? 'border-amber-500/20 text-amber-500' : 'border-red-500/20 text-red-500'}`}>
                                                    {q.difficulty}
                                                </span>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">Archived_ID_{q.id.toString().slice(0, 8)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-blue-600 text-gray-400 group-hover:text-white transition-all group-hover:scale-105 active:scale-95">
                                            <Play size={16} fill="currentColor" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                                <h3 className="text-xl font-black text-gray-500 uppercase tracking-widest mb-2">No Modules Found</h3>
                                <p className="text-gray-600 text-xs font-bold">Try adjusting your filters or checking back later.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

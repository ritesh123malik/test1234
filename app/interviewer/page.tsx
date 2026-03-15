'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Code2, Users, Layout, UserCircle2, ArrowRight, Sparkles } from 'lucide-react';

const INTERVIEW_TYPES = [
    {
        id: 'DSA',
        title: 'Data Structures & Algorithms',
        description: 'Solve complex algorithmic problems and optimize your code logic.',
        icon: Code2,
        color: 'blue',
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        id: 'Behavioral',
        title: 'Behavioral Round',
        description: 'Master the STAR method and showcase your soft skills and experience.',
        icon: Users,
        color: 'purple',
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        id: 'System Design',
        title: 'System Design',
        description: 'Buid scalable, high-performance architectures for global applications.',
        icon: Layout,
        color: 'orange',
        gradient: 'from-orange-500 to-red-500',
    },
    {
        id: 'HR',
        title: 'Human Resources',
        description: 'Perfect your introduction, salary negotiation, and cultural fit.',
        icon: UserCircle2,
        color: 'green',
        gradient: 'from-green-500 to-emerald-500',
    },
];

export default function InterviewerHome() {
    const router = useRouter();
    const [loadingType, setLoadingType] = useState<string | null>(null);

    const handleStartSession = async (type: string) => {
        setLoadingType(type);
        try {
            const res = await fetch('/api/interviewer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'start', type }),
            });

            const { sessionId, error } = await res.json();
            if (error) throw new Error(error);

            router.push(`/interviewer/${sessionId}`);
        } catch (err) {
            console.error('Failed to start session:', err);
            setLoadingType(null);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-20 selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-blue-400 font-bold tracking-widest text-xs uppercase"
                    >
                        <Sparkles size={14} />
                        AI Powered Mock Interviews
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black tracking-tight"
                    >
                        Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Battleground</span>.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-lg max-w-2xl leading-relaxed"
                    >
                        Experience realistic, adaptive mock interviews with real-time feedback and structured scoring. Choose a track to begin your journey to excellence.
                    </motion.p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {INTERVIEW_TYPES.map((type, index) => (
                        <motion.div
                            key={type.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            whileHover={{ scale: 1.02 }}
                            className="group relative cursor-pointer"
                            onClick={() => handleStartSession(type.id)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl -z-10 transition-colors group-hover:from-white/10" />
                            <div className="absolute inset-0 border border-white/10 rounded-3xl -z-10 group-hover:border-white/20 transition-colors" />

                            <div className="p-8 h-full flex flex-col items-start justify-between min-h-[300px]">
                                <div className="space-y-6">
                                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${type.gradient} shadow-lg shadow-${type.color}-500/20`}>
                                        <type.icon size={28} className="text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold group-hover:text-blue-400 transition-colors">{type.title}</h2>
                                        <p className="text-gray-400 text-sm leading-relaxed">{type.description}</p>
                                    </div>
                                </div>

                                <div className="w-full flex items-center justify-between pt-8">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-black bg-gray-900 flex items-center justify-center text-[10px] font-bold text-gray-400`}>
                                                {i}k+
                                            </div>
                                        ))}
                                        <span className="pl-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold self-center">Practicing Now</span>
                                    </div>

                                    <button
                                        disabled={loadingType === type.id}
                                        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest group-hover:gap-4 transition-all"
                                    >
                                        {loadingType === type.id ? 'Starting...' : 'Enter Stream'}
                                        <ArrowRight size={16} className="text-blue-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Decorative light effect */}
                            <div className={`absolute -top-24 -left-24 w-48 h-48 bg-${type.color}-500/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cpu,
    Brain,
    MessageSquare,
    BarChart3,
    Zap,
    Timer,
    Target,
    ArrowRight,
    Search,
    ChevronRight,
    Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header as Navbar } from '@/components/layout/Header';
import UpgradeModal from '@/components/ui/UpgradeModal';

const CATEGORIES = [
    { id: 'quantitative', name: 'Quantitative', icon: Cpu, color: 'from-blue-500 to-indigo-600', description: 'Numbers, algebra, geometry & arithmetic.' },
    { id: 'logical', name: 'Logical', icon: Brain, color: 'from-purple-500 to-indigo-600', description: 'Syllogisms, puzzles, and series.' },
    { id: 'verbal', name: 'Verbal', icon: MessageSquare, color: 'from-pink-500 to-rose-600', description: 'Reading, grammar, and vocabulary.' },
    { id: 'data_interpretation', name: 'Data Interpretation', icon: BarChart3, color: 'from-emerald-500 to-teal-600', description: 'Charts, tables, and raw data analysis.' },
];

const MODES = [
    { id: 'practice', name: 'Casual Practice', icon: Zap, label: 'Free for everyone', desc: 'No timer. Infinite time per question.' },
    { id: 'timed_mock', name: 'Timed HIIT Mock', icon: Timer, label: 'Premium Required', desc: 'Strict time limits. Exam simulation.' },
    { id: 'company_mock', name: 'Company OA Mock', icon: Target, label: 'Premium Required', desc: 'Authentic TCS/Infosys pattern sets.' },
];

export default function AptitudeLobby() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedMode, setSelectedMode] = useState('practice');
    const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
    const [isLoading, setIsLoading] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const handleStart = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/aptitude', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'start',
                    mode: selectedMode,
                    category: selectedCategory,
                    difficulty: selectedDifficulty,
                    count: 10
                })
            });

            const data = await res.json();

            if (res.status === 403 && data.upgrade) {
                setIsUpgradeModalOpen(true);
                return;
            }

            if (data.session) {
                router.push(`/aptitude/${data.session.id}`);
            }
        } catch (error) {
            console.error('Lobby error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Navbar />
            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} featureName="Advanced Aptitude Mocks" />

            <main className="pt-32 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Header */}
                    <div className="mb-20">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                        >
                            <Brain size={12} /> Neural_Reasoning_Sector
                        </motion.div>
                        <h1 className="text-5xl sm:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
                            Aptitude <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Forge.</span>
                        </h1>
                        <p className="text-gray-500 max-w-2xl text-lg font-medium">
                            The highest fidelity aptitude engine for LNMITians. Crushing TCS NQT, Infosys SP, and Big Tech OAs starts here.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Selector Section */}
                        <div className="lg:col-span-8 space-y-12">
                            {/* Mode Selection */}
                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6 flex items-center gap-4">
                                    <div className="h-[1px] flex-1 bg-white/5" /> Choose_Protocol <div className="h-[1px] flex-1 bg-white/5" />
                                </h3>
                                <div className="grid sm:grid-cols-3 gap-6">
                                    {MODES.map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => setSelectedMode(mode.id)}
                                            className={`relative group p-6 rounded-[2rem] border text-left transition-all duration-500 ${selectedMode === mode.id
                                                ? 'bg-blue-600 border-blue-500 shadow-2xl shadow-blue-600/20'
                                                : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${selectedMode === mode.id ? 'bg-white text-blue-600 border-white' : 'bg-white/5 text-gray-500 border-white/5'}`}>
                                                <mode.icon size={24} />
                                            </div>
                                            <h4 className="text-lg font-black uppercase tracking-tight mb-1">{mode.name}</h4>
                                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                {mode.id !== 'practice' && <Lock size={10} />}
                                                {mode.label}
                                            </div>
                                            <p className="text-gray-500 text-xs font-medium leading-relaxed">{mode.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Category Grid */}
                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6 flex items-center gap-4">
                                    <div className="h-[1px] flex-1 bg-white/5" /> Target_Vector <div className="h-[1px] flex-1 bg-white/5" />
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setSelectedCategory('All')}
                                        className={`p-6 rounded-3xl border text-left flex items-center justify-between transition-all ${selectedCategory === 'All' ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.02] border-white/5 text-gray-500 hover:text-white'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                                                <Target size={20} />
                                            </div>
                                            <span className="font-black uppercase tracking-widest text-sm">All_Neural_Pathways</span>
                                        </div>
                                        <ChevronRight size={16} />
                                    </button>
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.name)}
                                            className={`p-6 rounded-3xl border text-left flex items-center justify-between transition-all ${selectedCategory === cat.name ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.02] border-white/5 text-gray-500 hover:text-white'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white`}>
                                                    <cat.icon size={20} />
                                                </div>
                                                <span className="font-black uppercase tracking-widest text-sm">{cat.name}</span>
                                            </div>
                                            <ChevronRight size={16} />
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Config Sidebar */}
                        <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-8">Session_Config</h3>

                                <div className="space-y-8 mb-12">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4">Initial_Complexity</label>
                                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                                            {['easy', 'medium', 'hard'].map((d) => (
                                                <button
                                                    key={d}
                                                    onClick={() => setSelectedDifficulty(d)}
                                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedDifficulty === d ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleStart}
                                    disabled={isLoading}
                                    className="w-full py-6 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-4 group"
                                >
                                    {isLoading ? 'Booting_Session...' : 'Initialize_Practice'}
                                    {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                                </button>

                                <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4 opacity-40">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Neural_Sync_Ready</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Code2,
    Zap,
    Target,
    ChevronRight,
    Search,
    Cpu,
    Sparkles,
    ArrowRight,
    Terminal,
    Layers
} from 'lucide-react';
import { Header as Navbar } from '@/components/layout/Header';
import UpgradeModal from '@/components/ui/UpgradeModal';
import { toast } from 'sonner';

export default function DSAPatterns() {
    const [input, setInput] = useState('');
    const [inputType, setInputType] = useState<'description' | 'code'>('description');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const handleIdentify = async () => {
        if (!input.trim()) return;

        setIsAnalyzing(true);
        try {
            const res = await fetch('/api/dsa-patterns', {
                method: 'POST',
                body: JSON.stringify({
                    [inputType]: input
                })
            });

            const data = await res.json();

            if (res.status === 403 && data.upgrade) {
                setIsUpgradeModalOpen(true);
                return;
            }

            if (data.pattern_name) {
                setResult(data);
                toast.success('Pattern Identified');
            } else {
                toast.error('Identification Failed');
            }
        } catch (e) {
            console.error(e);
            toast.error('Sync Error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Navbar />
            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} featureName="Neural DSA Patterns" />

            <main className="pt-32 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-20">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                        >
                            <Brain size={12} /> Pattern_Intuition_Sector
                        </motion.div>
                        <h1 className="text-5xl sm:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
                            DSA <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">Cognito.</span>
                        </h1>
                        <p className="text-gray-500 max-w-2xl text-lg font-medium">
                            Stop memorizing questions. Start recognizing the universal architectural patterns behind every DSA problem.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Control Panel */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                                <button
                                    onClick={() => setInputType('description')}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inputType === 'description' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Problem_Text
                                </button>
                                <button
                                    onClick={() => setInputType('code')}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inputType === 'code' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Logic_Code
                                </button>
                            </div>

                            <div className="relative group">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={inputType === 'description' ? "Paste problem description here..." : "Paste your messy code snippet here..."}
                                    className="w-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 text-sm font-mono placeholder:text-gray-700 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.04] transition-all min-h-[400px] resize-none"
                                />
                                <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-100 transition-opacity">
                                    <Cpu size={24} className="text-purple-500" />
                                </div>
                            </div>

                            <button
                                onClick={handleIdentify}
                                disabled={isAnalyzing || !input.trim()}
                                className="w-full py-6 rounded-3xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-purple-600/30 transition-all flex items-center justify-center gap-4 group"
                            >
                                {isAnalyzing ? 'Mapping_Neural_Paths...' : 'Identify_Pattern'}
                                {!isAnalyzing && <Zap size={16} className="group-hover:scale-110 transition-transform" />}
                            </button>
                        </div>

                        {/* Intelligence Feed */}
                        <div className="lg:col-span-7">
                            <AnimatePresence mode="wait">
                                {!result && !isAnalyzing && (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-full border border-white/5 rounded-[3rem] bg-white/[0.01] flex flex-col items-center justify-center p-12 text-center"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-8 border border-purple-500/20">
                                            <Search size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-white">Intuition_Idle</h3>
                                        <p className="text-gray-500 text-sm max-w-xs leading-relaxed font-medium">
                                            Inject a problem description or a code snippet to decode the structural pattern.
                                        </p>
                                    </motion.div>
                                )}

                                {isAnalyzing && (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-full border border-purple-500/20 rounded-[3rem] bg-purple-500/5 flex flex-col items-center justify-center p-12 overflow-hidden relative"
                                    >
                                        <div className="relative z-10 text-center">
                                            <div className="flex gap-2 justify-center mb-8">
                                                {[1, 2, 3].map(i => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ height: [16, 48, 16] }}
                                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                                        className="w-1.5 bg-purple-500 rounded-full"
                                                    />
                                                ))}
                                            </div>
                                            <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">Analyzing_Symmetry</h3>
                                            <p className="text-purple-400/60 text-[10px] font-black uppercase tracking-widest">Traversing Decision Trees</p>
                                        </div>
                                    </motion.div>
                                )}

                                {result && !isAnalyzing && (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-8"
                                    >
                                        {/* Main Result Card */}
                                        <div className="relative group p-10 rounded-[3rem] bg-gradient-to-br from-purple-600 to-indigo-900 border border-purple-400/30 overflow-hidden">
                                            <div className="absolute top-0 right-0 p-8 opacity-20">
                                                <Brain size={120} />
                                            </div>

                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 text-white text-[10px] font-black uppercase tracking-widest mb-4">
                                                    Matched_{result.confidence}%_Confidence
                                                </div>
                                                <h2 className="text-5xl font-black uppercase tracking-tighter text-white mb-6">
                                                    {result.pattern_name}
                                                </h2>
                                                <p className="text-purple-100/80 font-medium leading-relaxed max-w-xl">
                                                    {result.logic_explanation}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Complexity */}
                                            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                                                <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                                                    <Terminal size={12} /> Neural_Complexity
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Time</span>
                                                        <span className="text-sm font-mono text-white">{result.complexity.time}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Space</span>
                                                        <span className="text-sm font-mono text-white">{result.complexity.space}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pitfalls */}
                                            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                                                <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                                                    <AlertCircle size={12} /> Optimization_Traps
                                                </div>
                                                <ul className="space-y-3">
                                                    {result.common_pitfalls.map((p: string, i: number) => (
                                                        <li key={i} className="text-xs font-bold text-gray-400 flex items-start gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                                                            {p}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Template Snippet */}
                                        <div className="p-8 rounded-[3rem] bg-black border border-white/5 overflow-hidden">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-3">
                                                    <Code2 size={12} /> Reference_Template.cpp
                                                </div>
                                                <button className="text-[9px] font-black uppercase text-purple-400 hover:text-white transition-colors">Copy_Buffer</button>
                                            </div>
                                            <pre className="text-xs font-mono text-gray-400 p-6 bg-white/[0.02] rounded-2xl overflow-x-auto">
                                                {result.template_snippet}
                                            </pre>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

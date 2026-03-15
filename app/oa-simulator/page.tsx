'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Header as Navbar } from '@/components/layout/Header';
import {
    Timer,
    ChevronRight,
    ArrowRight,
    Cpu,
    Brain,
    Lock,
    Zap,
    Search,
    Rocket,
    Shield
} from 'lucide-react';
import UpgradeModal from '@/components/ui/UpgradeModal';

export default function OALobby() {
    const router = useRouter();
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await fetch('/api/oa-simulator');
                const data = await res.json();
                setTemplates(data.templates || []);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    const handleStart = async (templateId: string) => {
        try {
            const res = await fetch('/api/oa-simulator', {
                method: 'POST',
                body: JSON.stringify({ action: 'start', templateId })
            });
            const data = await res.json();

            if (res.status === 403 && data.upgrade) {
                setIsUpgradeModalOpen(true);
                return;
            }

            if (data.attempt) {
                router.push(`/oa-simulator/${data.attempt.id}`);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Mock templates if none found for prototype
    const displayTemplates = filteredTemplates.length > 0 ? filteredTemplates : [
        { id: 'mock-1', company_name: 'TCS', title: 'NQT 2024 Hiring Mock', duration_minutes: 90, difficulty: 'medium' },
        { id: 'mock-2', company_name: 'Infosys', title: 'Specialist Programmer Mock', duration_minutes: 180, difficulty: 'hard' },
        { id: 'mock-3', company_name: 'Google', title: 'Summer Intern OA', duration_minutes: 60, difficulty: 'hard' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Navbar />
            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} featureName="Unlimited OA Simulations" />

            <main className="pt-32 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                            >
                                <Shield size={12} /> Proctor_Secured_Zone
                            </motion.div>
                            <h1 className="text-5xl sm:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
                                OA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Sim.</span>
                            </h1>
                            <p className="text-gray-500 max-w-xl text-lg font-medium leading-relaxed">
                                Don't fail the first round. Practice in the exact environment of top recruiters with full proctoring simulation.
                            </p>
                        </div>

                        <div className="relative group w-full lg:w-96">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search Company or Exam..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-sm font-bold placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.04] transition-all"
                            />
                        </div>
                    </div>

                    {/* Template Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayTemplates.map((template, idx) => (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
                                    <Rocket size={40} className="text-blue-500" />
                                </div>

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/5 group-hover:border-blue-500/30 transition-colors">
                                        <Cpu size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">{template.company_name}</h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{template.difficulty} Complexity</span>
                                    </div>
                                </div>

                                <h2 className="text-2xl font-black uppercase tracking-tight mb-8 leading-tight">
                                    {template.title}
                                </h2>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <Timer size={16} className="text-blue-500" />
                                        <span className="font-bold">{template.duration_minutes} Minutes</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <Brain size={16} className="text-purple-500" />
                                        <span className="font-bold">Aptitude + Coding</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-emerald-400">
                                        <Shield size={16} />
                                        <span className="font-bold uppercase tracking-widest text-[10px]">Anti-Cheat Active</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleStart(template.id)}
                                    className="w-full py-5 rounded-2xl bg-white/5 group-hover:bg-blue-600 text-gray-400 group-hover:text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3"
                                >
                                    Initialize Simulation
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

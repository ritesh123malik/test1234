'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    BookOpen,
    ShieldCheck,
    Users,
    ChevronRight,
    ArrowRight,
    Building2,
    MessageSquare,
    Trophy
} from 'lucide-react';
import { Header as Navbar } from '@/components/layout/Header';
import Link from 'next/link';

export default function WikiHome() {
    const [wikis, setWikis] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWikis = async () => {
            try {
                // Mock for prototype if table empty
                const mockWikis = [
                    { id: '1', company_name: 'TCS', interview_count: 1420, is_verified: true, hiring_process_tags: ['NQT', 'Interview', 'HR'], logo_url: '' },
                    { id: '2', company_name: 'Infosys', interview_count: 980, is_verified: true, hiring_process_tags: ['HackWithInfy', 'SP', 'DSE'], logo_url: '' },
                    { id: '3', company_name: 'Google', interview_count: 450, is_verified: false, hiring_process_tags: ['OA', 'Phone Screen', 'Onsite'], logo_url: '' },
                    { id: '4', company_name: 'Meta', interview_count: 320, is_verified: true, hiring_process_tags: ['Product', 'System Design'], logo_url: '' },
                ];
                setWikis(mockWikis);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchWikis();
    }, []);

    const filteredWikis = wikis.filter(w =>
        w.company_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Hero */}
                    <div className="mb-20">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                        >
                            <Users size={12} /> Community_Intelligence_Sync
                        </motion.div>
                        <h1 className="text-5xl sm:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
                            Company <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">Wiki.</span>
                        </h1>
                        <p className="text-gray-500 max-w-2xl text-lg font-medium">
                            Real interview patterns, hiring processes, and salary insights shared by the community. Fully verified by ex-interviewers.
                        </p>
                    </div>

                    {/* Search & Stats */}
                    <div className="flex flex-col lg:flex-row gap-8 mb-16">
                        <div className="relative group flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search Company Wiki (e.g. TCS, Amazon)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-sm font-bold placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.04] transition-all"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="px-8 py-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col justify-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total_Logs</span>
                                <span className="text-xl font-black">12.4k+</span>
                            </div>
                            <div className="px-8 py-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col justify-center text-emerald-400">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Contributors</span>
                                <span className="text-xl font-black">840+</span>
                            </div>
                        </div>
                    </div>

                    {/* Wiki Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredWikis.map((wiki, idx) => (
                            <Link
                                href={`/company/${wiki.company_name.toLowerCase()}`}
                                key={wiki.id}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all duration-500 relative h-full flex flex-col"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                            <Building2 size={24} />
                                        </div>
                                        {wiki.is_verified && (
                                            <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-emerald-400">
                                                <ShieldCheck size={10} /> Verified
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-2xl font-black uppercase tracking-tight mb-4 group-hover:text-emerald-400 transition-colors">
                                        {wiki.company_name}
                                    </h3>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {wiki.hiring_process_tags?.slice(0, 2).map((tag: string) => (
                                            <span key={tag} className="px-2 py-1 rounded-md bg-white/5 text-[8px] font-black uppercase text-gray-500 tracking-widest">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <MessageSquare size={12} />
                                            <span className="text-[10px] font-black">{wiki.interview_count} Logs</span>
                                        </div>
                                        <ArrowRight size={14} className="text-gray-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

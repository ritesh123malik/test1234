'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header as Navbar } from '@/components/layout/Header';
import {
    Plus,
    Layers,
    Share2,
    Save,
    ChevronRight,
    FileText,
    Clock,
    Brush
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WhiteboardLobby() {
    const router = useRouter();
    const [boards, setBoards] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const res = await fetch('/api/whiteboard');
                const data = await res.json();
                setBoards(data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBoards();
    }, []);

    const handleCreate = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/whiteboard', {
                method: 'POST',
                body: JSON.stringify({ title: 'New System Design', content_json: {} })
            });
            const data = await res.json();
            if (data.id) {
                router.push(`/whiteboard/${data.id}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                            >
                                <Brush size={12} /> Design_Architect_Module
                            </motion.div>
                            <h1 className="text-5xl sm:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
                                Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-600">Canvas.</span>
                            </h1>
                            <p className="text-gray-500 max-w-xl text-lg font-medium leading-relaxed">
                                Don't just explain. Architect. High-fidelity whiteboard for system design, flowcharts, and technical sketching.
                            </p>
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={isLoading}
                            className="bg-orange-600 hover:bg-orange-500 text-white px-10 py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-4 transition-all shadow-2xl shadow-orange-600/30"
                        >
                            {isLoading ? 'Booting_Canvas...' : 'New_Canvas_Sector'}
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Boards List */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {boards.map((board, idx) => (
                            <Link href={`/whiteboard/${board.id}`} key={board.id}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-orange-500/30 transition-all group relative h-64 flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-orange-400">
                                            <Layers size={20} />
                                        </div>
                                        <div className="flex items-center gap-2 text-[8px] font-black uppercase text-gray-700 tracking-[0.2em]">
                                            <Clock size={10} /> {new Date(board.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-orange-400 transition-colors">
                                            {board.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                            Sector_{board.id.slice(0, 4)}
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}

                        {boards.length === 0 && !isLoading && (
                            <div className="col-span-full py-32 border border-white/5 border-dashed rounded-[3rem] flex flex-col items-center justify-center text-center">
                                <FileText size={48} className="text-gray-800 mb-6" />
                                <h3 className="text-lg font-black uppercase text-gray-700">No_Canvas_Detected</h3>
                                <p className="text-sm text-gray-800 font-bold uppercase tracking-widest mt-2">Initialize your first design sector above.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Calendar,
    Video,
    Clock,
    ChevronRight,
    ShieldCheck,
    Plus,
    X,
    Filter,
    Search,
    Brain,
    Headset,
    ArrowRight
} from 'lucide-react';
import { Header as Navbar } from '@/components/layout/Header';
import { toast } from 'sonner';

export default function P2PLobby() {
    const [slots, setSlots] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [scheduledAt, setScheduledAt] = useState('');

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/p2p-mock');
            const data = await res.json();
            setSlots(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!scheduledAt) return;
        try {
            const res = await fetch('/api/p2p-mock', {
                method: 'POST',
                body: JSON.stringify({ action: 'create', scheduledAt })
            });
            if (res.ok) {
                toast.success('Interview Slot Hosted');
                setShowCreateModal(false);
                fetchSlots();
            }
        } catch (e) {
            toast.error('Sync Error');
        }
    };

    const handleBook = async (slotId: string) => {
        try {
            const res = await fetch('/api/p2p-mock', {
                method: 'POST',
                body: JSON.stringify({ action: 'book', slotId })
            });
            if (res.ok) {
                const data = await res.json();
                toast.success('Interview Booked!', { description: `Meeting Link: ${data.meeting_link}` });
                fetchSlots();
            }
        } catch (e) {
            toast.error('Booking Error');
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
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                            >
                                <Users size={12} /> Peer_Collaboration_Protocol
                            </motion.div>
                            <h1 className="text-5xl sm:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
                                P2P <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Mock.</span>
                            </h1>
                            <p className="text-gray-500 max-w-xl text-lg font-medium leading-relaxed">
                                Don't interview alone. Practice with other LNMITians, trade feedback, and build the nerves of steel required for real placements.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-4 transition-all shadow-2xl shadow-blue-600/30"
                        >
                            Host_New_Session
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-4 mb-12 overflow-x-auto">
                        {['All_Peers', 'System_Design', 'DSA_Heavy', 'Behavioral', 'Mixed_Tactical'].map((f, i) => (
                            <button key={f} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${i === 0 ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Slots List */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {slots.map((slot, idx) => (
                            <motion.div
                                key={slot.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-500 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black">
                                                {slot.profiles?.avatar_url ? <img src={slot.profiles.avatar_url} className="w-full h-full rounded-full" /> : 'U'}
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-white uppercase tracking-widest">{slot.profiles?.full_name || 'Anonymous Peer'}</div>
                                                <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1">
                                                    <ShieldCheck size={10} className="text-blue-500" /> Community_ID_{slot.host_id.slice(0, 4)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <Video size={14} />
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-10">
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <Calendar size={16} className="text-blue-500" />
                                            <span className="font-bold">{new Date(slot.scheduled_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <Clock size={16} className="text-purple-500" />
                                            <span className="font-bold">{new Date(slot.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleBook(slot.id)}
                                    className="w-full py-5 rounded-2xl bg-white/5 group-hover:bg-blue-600 text-gray-400 group-hover:text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3"
                                >
                                    Accept_Mission
                                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        ))}

                        {slots.length === 0 && !isLoading && (
                            <div className="col-span-full py-40 bg-white/[0.01] border border-white/5 border-dashed rounded-[4rem] flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-gray-700 mb-8">
                                    <Headset size={40} />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-500">No_Available_Hosts</h3>
                                <p className="text-sm text-gray-700 font-bold uppercase tracking-widest mt-2 max-w-xs">Be the pioneer. Host a session to match with a peer.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-600 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <h3 className="text-3xl font-black uppercase tracking-tight mb-2">Host_Session</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-10">Neural_Calendar_Sync</p>

                            <div className="space-y-8 mb-12">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4 px-2">Scheduled_Time_Log</label>
                                    <input
                                        type="datetime-local"
                                        value={scheduledAt}
                                        onChange={(e) => setScheduledAt(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleCreate}
                                className="w-full py-6 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-4 group"
                            >
                                Deploy_Slot_to_Lobby
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

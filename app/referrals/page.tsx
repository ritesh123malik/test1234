'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Gift,
    Copy,
    Check,
    Share2,
    Zap,
    Rocket,
    Trophy,
    ArrowRight,
    QrCode
} from 'lucide-react';
import { Header as Navbar } from '@/components/layout/Header';
import { toast } from 'sonner';

export default function ReferralDashboard() {
    const [referralData, setReferralData] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        const res = await fetch('/api/referrals');
        const data = await res.json();
        setReferralData(data);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/referrals', { method: 'POST' });
            const data = await res.json();
            setReferralData(data);
            toast.success('Referral Code Generated');
        } catch (e) {
            toast.error('Sync Error');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        const link = `${window.location.origin}/auth?ref=${referralData?.referral_code}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success('Link Copied to Clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-20">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                        >
                            <Rocket size={12} /> Viral_Growth_Protocol
                        </motion.div>
                        <h1 className="text-5xl sm:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
                            Refer & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Ascend.</span>
                        </h1>
                        <p className="text-gray-500 max-w-2xl text-lg font-medium">
                            Help your friends crush their placements and unlock premium architecture access for yourself. Win-Win, Engineering style.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Main Interaction */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="p-12 rounded-[3.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Gift size={200} />
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-3xl font-black uppercase tracking-tight mb-8">Deploy_Your_Link</h3>

                                    {!referralData?.referral_code ? (
                                        <button
                                            onClick={handleGenerate}
                                            disabled={isGenerating}
                                            className="px-10 py-6 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-blue-600/30 transition-all flex items-center gap-4"
                                        >
                                            {isGenerating ? 'Initializing_Generator...' : 'Generate_Referral_Code'}
                                            {!isGenerating && <Zap size={16} />}
                                        </button>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="flex-1 bg-black/40 border border-white/10 rounded-3xl p-6 font-mono text-blue-400 text-xl font-bold flex items-center justify-between">
                                                    {referralData.referral_code}
                                                    <QrCode size={24} className="opacity-20" />
                                                </div>
                                                <button
                                                    onClick={copyToClipboard}
                                                    className="px-8 py-6 rounded-3xl bg-white text-black font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-blue-500 hover:text-white transition-all shadow-xl"
                                                >
                                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                                    {copied ? 'Copied' : 'Copy_Link'}
                                                </button>
                                            </div>
                                            <p className="text-gray-500 text-sm font-medium">
                                                Share this link with your peers. When they sign up, you both get closer to Premium rewards.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Rewards Roadmap */}
                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="p-10 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20">
                                        <Users size={24} />
                                    </div>
                                    <h4 className="text-xl font-black uppercase tracking-tight text-white mb-4">Refer_3_Peers</h4>
                                    <p className="text-gray-500 text-xs font-medium leading-relaxed mb-8">Unlock 7 days of Premium access including all AI features and OA simulators.</p>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((referralData?.referral_count || 0) / 3 * 100, 100)}%` }}
                                            className="h-full bg-emerald-500"
                                        />
                                    </div>
                                    <div className="mt-4 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                        {referralData?.referral_count || 0} / 3 Refers
                                    </div>
                                </div>
                                <div className="p-10 rounded-[3rem] bg-purple-500/5 border border-purple-500/10">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center mb-8 shadow-lg shadow-purple-500/20">
                                        <Trophy size={24} />
                                    </div>
                                    <h4 className="text-xl font-black uppercase tracking-tight text-white mb-4">Refer_10_Peers</h4>
                                    <p className="text-gray-500 text-xs font-medium leading-relaxed mb-8">Unlock Life-Time Gold access and become a verified Community Moderator.</p>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((referralData?.referral_count || 0) / 10 * 100, 100)}%` }}
                                            className="h-full bg-purple-500"
                                        />
                                    </div>
                                    <div className="mt-4 text-[10px] font-black text-purple-500 uppercase tracking-widest">
                                        {referralData?.referral_count || 0} / 10 Refers
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                                <h3 className="text-xs font-black uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Activity_Stream</h3>
                                <div className="space-y-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-4 opacity-40">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black">U</div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-300">New user joined via referral</p>
                                                <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">{i}h ago</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button className="w-full p-8 rounded-[2.5rem] bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/30 text-white text-left group transition-all hover:scale-[1.02]">
                                <h4 className="font-black uppercase tracking-widest text-[10px] mb-2">Leaderboard_Sync</h4>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-black uppercase tracking-tighter leading-none">Global_Influencers</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

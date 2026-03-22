// components/profile/SocialShareCard.tsx
'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { 
    Download, 
    Share2, 
    Trophy, 
    Flame, 
    Code2, 
    Zap,
    Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface SocialShareCardProps {
    user: {
        name: string;
        avatar?: string;
        role: string;
        college?: string;
    };
    stats: {
        leetcodeSolved: number;
        codeforcesRating: number;
        neuralScore: number;
        topLanguages: { name: string; color: string; percent: number }[];
    };
}

export default function SocialShareCard({ user, stats }: SocialShareCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [exporting, setExporting] = useState(false);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setExporting(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null,
                scale: 2,
                logging: false,
                useCORS: true
            });
            const link = document.createElement('a');
            link.download = `placement-intel-${user.name.toLowerCase().replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-8 py-10">
            {/* The actual Card to be captured */}
            <div 
                ref={cardRef}
                className="w-[450px] aspect-[1.6/1] bg-[#0A0A0B] rounded-[2.5rem] border border-white/10 p-8 relative overflow-hidden shadow-2xl"
                style={{ 
                    backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)' 
                }}
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/5 blur-[80px] rounded-full" />
                
                {/* Header */}
                <div className="flex items-center gap-6 mb-8 relative z-10">
                    <div className="w-20 h-20 rounded-[1.8rem] bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-xl shadow-indigo-500/20">
                        <div className="w-full h-full rounded-[1.8rem] bg-[#0A0A0B] flex items-center justify-center text-3xl font-black text-white">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-[1.8rem]" />
                            ) : (
                                user.name[0]
                            )}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-2">{user.name}</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                                {user.role}
                            </span>
                            {user.college && (
                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">
                                    • {user.college}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center group hover:bg-white/10 transition-colors">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                            <Flame size={10} className="text-orange-500" /> Solved
                        </p>
                        <p className="text-2xl font-black text-white leading-none">{stats.leetcodeSolved}</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center group hover:bg-white/10 transition-colors">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                            <Trophy size={10} className="text-sky-400" /> Rating
                        </p>
                        <p className="text-2xl font-black text-white leading-none">{stats.codeforcesRating}</p>
                    </div>
                    <div className="bg-white/5 border border-indigo-500/20 p-4 text-center group hover:bg-indigo-500/10 transition-colors shadow-inner shadow-indigo-500/5">
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                            <Zap size={10} /> Neural ID
                        </p>
                        <p className="text-2xl font-black text-white leading-none">{stats.neuralScore}<span className="text-xs ml-0.5 text-indigo-500 opacity-80">N</span></p>
                    </div>
                </div>

                {/* Footer: Languages & Branding */}
                <div className="flex items-center justify-between relative z-10 mt-auto pt-4 border-t border-white/5">
                    <div className="flex gap-2">
                        {stats.topLanguages.slice(0, 3).map((lang, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lang.color }} />
                                <span className="text-[9px] font-black text-white/70 uppercase tracking-tighter">{lang.name}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">PlacementIntel_Protocol</p>
                        <div className="flex items-center gap-2">
                            <Globe size={10} className="text-indigo-500/40" />
                            <span className="text-[9px] font-mono text-white/30 italic">v2.5_Stable</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    onClick={handleDownload}
                    disabled={exporting}
                    className="flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-[1.5rem] hover:bg-indigo-50 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                >
                    {exporting ? (
                        <>Digitizing_Neural_Core...</>
                    ) : (
                        <>
                            <Download size={14} /> Download Identity Card
                        </>
                    )}
                </button>
                <button
                    onClick={() => toast.success('Link Copied to Clipboard!')}
                    className="p-4 bg-white/5 border border-white/10 text-white rounded-[1.5rem] hover:bg-white/10 transition-all active:scale-95"
                >
                    <Share2 size={18} />
                </button>
            </div>
        </div>
    );
}

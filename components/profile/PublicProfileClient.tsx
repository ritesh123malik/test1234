'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
    Download,
    ExternalLink,
    ShieldCheck,
    Trophy,
    Code2,
    Github,
    Layout,
    Terminal,
    Activity,
    Award
} from 'lucide-react';

interface PlatformStat {
    platform: string;
    stats_json: any;
}

interface InterviewSession {
    overall_score: number;
    type: string;
    ended_at: string;
}

interface PublicProfileClientProps {
    profile: any;
    stats: PlatformStat[];
    sessions: InterviewSession[];
}

const PLATFORM_ICONS: Record<string, any> = {
    leetcode: Code2,
    github: Github,
    codeforces: Trophy,
    codechef: Award,
    hackerrank: Terminal
};

export default function PublicProfileClient({ profile, stats, sessions }: PublicProfileClientProps) {
    const profileRef = useRef<HTMLDivElement>(null);

    const downloadPDF = async () => {
        if (!profileRef.current) return;
        const canvas = await html2canvas(profileRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#050505'
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${profile.username}-portfolio.pdf`);
    };

    const avgScore = sessions.length
        ? (sessions.reduce((s, r) => s + (r.overall_score ?? 0), 0) / sessions.length).toFixed(1)
        : 'N/A';

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 md:mb-10 text-center sm:text-left">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-black text-emerald-500/80">Recruiter_Portal_Live</span>
                </div>
                <button
                    onClick={downloadPDF}
                    className="flex items-center justify-center gap-2 w-full sm:w-fit px-6 py-3.5 sm:py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
                >
                    <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                    <span className="hidden sm:inline">Export_Portfolio</span>
                    <span className="sm:hidden">Export_PDF</span>
                </button>
            </div>

            <div ref={profileRef} className="space-y-8 bg-[#050505]">
                {/* Profile Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-gradient-to-br from-gray-900 to-black rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-gray-800 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-6 md:p-10 opacity-[0.03]">
                        <ShieldCheck size={160} md-size={200} />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
                        <img
                            src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                            className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl border-2 border-blue-500/20 shadow-2xl"
                            alt={profile.full_name}
                        />
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight">{profile.full_name}</h1>
                                <p className="text-gray-500 font-mono text-[10px] md:text-sm">@{profile.username} • Technical Analyst</p>
                            </div>

                            <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
                                <div className="bg-blue-500/10 border border-blue-500/20 px-3 md:px-4 py-1.5 md:py-2 rounded-xl flex items-center gap-2 md:gap-3">
                                    <span className="text-blue-400 font-black text-lg md:text-xl">{avgScore}</span>
                                    <div className="h-5 md:h-6 w-[1px] bg-blue-500/20" />
                                    <span className="text-[8px] md:text-[9px] uppercase tracking-widest font-black text-gray-500 leading-none text-left">AI Interview<br />Strategic Score</span>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 md:px-4 py-1.5 md:py-2 rounded-xl flex items-center gap-2 md:gap-3">
                                    <span className="text-emerald-400 font-black text-lg md:text-xl">{sessions.length}</span>
                                    <div className="h-5 md:h-6 w-[1px] bg-emerald-500/20" />
                                    <span className="text-[8px] md:text-[9px] uppercase tracking-widest font-black text-gray-500 leading-none text-left">Verified<br />Simulations</span>
                                </div>
                            </div>

                            <p className="text-gray-400 text-xs md:text-sm max-w-xl leading-relaxed">
                                {profile.bio || "Full-stack developer focused on operational efficiency and high-performance algorithms. Verified candidate on placement-intel."}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {stats.map((s, idx) => {
                        const Icon = PLATFORM_ICONS[s.platform.toLowerCase()] || Code2;
                        return (
                            <motion.div
                                key={s.platform}
                                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className="bg-gray-900/40 backdrop-blur-md rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-gray-800 hover:border-gray-700 transition-colors group"
                            >
                                <div className="flex justify-between items-start mb-4 md:mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-800 rounded-lg md:rounded-xl group-hover:bg-blue-600 transition-colors">
                                            <Icon size={18} md-size={20} className="text-white" />
                                        </div>
                                        <span className="font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-[9px] md:text-[10px] text-gray-400">{s.platform}</span>
                                    </div>
                                    <ExternalLink size={12} md-size={14} className="text-gray-600" />
                                </div>


                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(s.stats_json).slice(0, 4).map(([key, val]: [string, any]) => (
                                        <div key={key} className="space-y-1">
                                            <p className="text-[9px] uppercase tracking-widest font-bold text-gray-600">{key.replace(/_/g, ' ')}</p>
                                            <p className="text-lg font-black text-white">{val.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Simulation History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900/20 rounded-[2rem] border border-gray-800/40 p-8"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-purple-500/10 rounded-xl">
                            <Activity size={20} className="text-purple-400" />
                        </div>
                        <h3 className="font-black uppercase tracking-widest text-xs">Interview Simulation History</h3>
                    </div>

                    <div className="space-y-4">
                        {sessions.map((session, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-gray-800/50">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${session.overall_score >= 8 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                        <Trophy size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-200">{session.type} Simulation</p>
                                        <p className="text-[10px] text-gray-500 font-mono">{new Date(session.ended_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-white">{session.overall_score}/10</p>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">VERIFIED</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Footer / Badge */}
            <div className="mt-12 text-center opacity-30 select-none">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">PlacementIntel_Verified_Profile_ID_{profile.id.slice(0, 8)}</p>
            </div>
        </div>
    );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Target, 
    Clock, 
    Zap, 
    TrendingUp, 
    CheckCircle2, 
    AlertTriangle, 
    ChevronRight,
    BarChart3,
    ShieldCheck,
    Dna
} from 'lucide-react';

interface MockTacticalReportProps {
    score: number;
    total: number;
    timeSeconds: number;
    weakAreas: string[];
    strongAreas: string[];
    onClose: () => void;
}

export default function MockTacticalReport({ 
    score, 
    total, 
    timeSeconds, 
    weakAreas, 
    strongAreas,
    onClose 
}: MockTacticalReportProps) {
    const accuracy = Math.round((score / total) * 100);
    const avgTimePerQuestion = Math.round(timeSeconds / total);
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-5xl bg-bg-surface border border-border-subtle rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(var(--brand-primary-rgb),0.15)] flex flex-col max-h-[90vh]"
            >
                {/* Header Section */}
                <div className="p-8 md:p-12 bg-gradient-to-br from-brand-primary/10 to-transparent border-b border-border-subtle relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <BarChart3 size={200} />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)]">Post_Simulation_Report</span>
                            <div className="h-px w-12 bg-border-subtle" />
                            <span className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em]">Sector: Technical_Logic</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4">Tactical Analysis</h1>
                        <p className="max-w-xl text-text-secondary text-base font-medium leading-relaxed">
                            Your performance telemetry has been processed. Review the findings to optimize your next deployment.
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-premium">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {/* High-Level Stats */}
                        <div className="glass-card p-8 rounded-[2.5rem] border border-border-subtle relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Target size={60} />
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Simulation_Precision</div>
                            <div className="text-5xl font-black text-brand-primary tracking-tighter mb-4">{accuracy}%</div>
                            <div className="text-xs font-medium text-text-muted">
                                {score} of {total} targets neutralized
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-[2.5rem] border border-border-subtle relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Clock size={60} />
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Deployment_Time</div>
                            <div className="text-5xl font-black text-brand-tertiary tracking-tighter mb-4">{Math.floor(timeSeconds / 60)}m {timeSeconds % 60}s</div>
                            <div className="text-xs font-medium text-text-muted">
                                Avg {avgTimePerQuestion}s per operational segment
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-[2.5rem] border border-border-subtle relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap size={60} />
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Combat_Velocity</div>
                            <div className="text-5xl font-black text-brand-secondary tracking-tighter mb-4">
                                {accuracy > 80 ? 'Elite' : accuracy > 60 ? 'Standard' : 'Subpar'}
                            </div>
                            <div className="text-xs font-medium text-text-muted uppercase tracking-widest">
                                Proficiency_Level
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Domain Insights */}
                        <div className="space-y-6">
                            <h3 className="flex items-center gap-3 text-lg font-black text-white uppercase tracking-tighter">
                                <ShieldCheck className="text-brand-success" size={20} />
                                Strong_Parameters
                            </h3>
                            <div className="space-y-3">
                                {strongAreas.map((area, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-brand-success/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-brand-success shadow-[0_0_8px_rgba(var(--brand-success-rgb),0.5)]" />
                                            <span className="font-bold text-sm text-text-primary tracking-tight uppercase tracking-widest">{area}</span>
                                        </div>
                                        <CheckCircle2 size={16} className="text-brand-success opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                                {strongAreas.length === 0 && (
                                    <p className="text-xs text-text-muted italic">No strong parameters identified in this segment.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="flex items-center gap-3 text-lg font-black text-white uppercase tracking-tighter">
                                <AlertTriangle className="text-brand-danger" size={20} />
                                Vulnerabilities_Detected
                            </h3>
                            <div className="space-y-3">
                                {weakAreas.map((area, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-brand-danger/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-brand-danger shadow-[0_0_8px_rgba(var(--brand-danger-rgb),0.5)]" />
                                            <span className="font-bold text-sm text-text-primary tracking-tight uppercase tracking-widest">{area}</span>
                                        </div>
                                        <TrendingUp size={16} className="text-brand-danger opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                                {weakAreas.length === 0 && (
                                    <p className="text-xs text-text-muted italic">No significant vulnerabilities detected.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 md:p-12 border-t border-border-subtle bg-black/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                            <Dna size={24} className="text-brand-primary" />
                        </div>
                        <div>
                            <div className="text-sm font-black text-white uppercase tracking-tighter">Profile Synced</div>
                            <div className="text-[10px] font-medium text-text-muted uppercase tracking-widest">+125 XP Rewarded</div>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto">
                        <button 
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-10 py-4 bg-brand-primary hover:bg-brand-primary/90 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all shadow-[0_0_30px_rgba(var(--brand-primary-rgb),0.2)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            Log_Out & Exit <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

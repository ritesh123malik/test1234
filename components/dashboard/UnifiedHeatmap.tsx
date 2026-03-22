// components/dashboard/UnifiedHeatmap.tsx
'use client';

import React, { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, 
    Flame, 
    Info,
    LayoutGrid,
    Target
} from 'lucide-react';

interface HeatmapValue {
    date: string;
    total_sessions: number;
    total_submissions: number;
    total_activity: number;
    intensity_level: number;
}

export default function UnifiedHeatmap() {
    const [values, setValues] = useState<HeatmapValue[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchHeatmapData();
    }, []);

    const fetchHeatmapData = async () => {
        try {
            const res = await fetch('/api/heatmap?section=unified');
            const data = await res.json();
            if (data.unified) {
                // Map activity_date to date for the library
                const mapped = data.unified.map((v: any) => ({
                    ...v,
                    date: v.activity_date
                }));
                setValues(mapped);
            }
        } catch (err) {
            console.error('Failed to fetch unified heatmap:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center">
                        <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-display font-bold text-white tracking-tight">Unified Alpha Stream</h3>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5 italic">Cross-Platform_Activity_Core</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Intensity:</span>
                        <div className="flex gap-1.5 size-fit items-center">
                            {[0, 1, 2, 3, 4].map((level) => (
                                <div 
                                    key={level} 
                                    className={`w-3 h-3 rounded-sm transition-all duration-500 ${
                                        level === 0 ? 'bg-white/5 border border-white/5' :
                                        level === 1 ? 'bg-emerald-900/40' :
                                        level === 2 ? 'bg-emerald-700/60' :
                                        level === 3 ? 'bg-emerald-500/80' :
                                        'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative bg-[var(--bg-base)]/30 border border-[var(--border-subtle)] p-8 rounded-[2rem] overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--brand-primary)_0%,transparent_100%)] opacity-0 group-hover:opacity-[0.03] transition-opacity duration-1000" />
                
                <div className="relative z-10 heatmap-container">
                    {loading ? (
                        <div className="h-[150px] flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <CalendarHeatmap
                            startDate={oneYearAgo}
                            endDate={today}
                            values={values}
                            classForValue={(value: any) => {
                                if (!value) return 'color-empty';
                                return `color-scale-${value.intensity_level}`;
                            }}
                            titleForValue={(value: any) => {
                                if (!value) return 'No activity';
                                return `${value.total_activity} actions on ${value.date}`;
                            }}
                        />
                    )}
                </div>
            </div>

            <style jsx global>{`
                .react-calendar-heatmap text {
                    font-size: 8px;
                    fill: var(--text-muted);
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .react-calendar-heatmap .color-empty { fill: rgba(255, 255, 255, 0.03); }
                .react-calendar-heatmap .color-scale-1 { fill: rgba(16, 185, 129, 0.2); }
                .react-calendar-heatmap .color-scale-2 { fill: rgba(16, 185, 129, 0.4); }
                .react-calendar-heatmap .color-scale-3 { fill: rgba(16, 185, 129, 0.7); }
                .react-calendar-heatmap .color-scale-4 { fill: #34d399; }
                
                .heatmap-container rect {
                    rx: 3px;
                    transition: all 0.3s ease;
                }
                .heatmap-container rect:hover {
                    stroke: white;
                    stroke-width: 1px;
                    opacity: 0.8 !important;
                }
            `}</style>
        </div>
    );
}

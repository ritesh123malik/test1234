'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TimerBarProps {
    remaining: number;
    total: number;
}

export default function TimerBar({ remaining, total }: TimerBarProps) {
    const percent = (remaining / total) * 100;
    const isCritical = remaining < 300; // Under 5 minutes

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full bg-gray-900 border-b border-white/5 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Session_Time</span>
                        <motion.span
                            animate={isCritical ? { color: ['#fff', '#ef4444', '#fff'] } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                            className={`text-2xl font-black font-mono transition-colors ${isCritical ? 'text-red-500' : 'text-white'}`}
                        >
                            {formatTime(remaining)}
                        </motion.span>
                    </div>
                </div>

                <div className="flex-1 max-w-md mx-8">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: `${percent}%` }}
                            className={`h-full transition-colors ${isCritical ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Secure_Environment
                    </span>
                </div>
            </div>
        </div>
    );
}

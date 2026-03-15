'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakWidgetProps {
    streak: number;
}

export function StreakWidget({ streak }: StreakWidgetProps) {
    const circumference = 2 * Math.PI * 14; // r=14
    const progress = Math.min(streak / 30, 1);
    const offset = circumference - progress * circumference;

    return (
        <button className="group relative flex items-center justify-center p-1 rounded-full transition-all hover:scale-110">
            <div className="relative w-9 h-9 flex items-center justify-center">
                {/* Progress Ring */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="18"
                        cy="18"
                        r="14"
                        className="stroke-border-subtle fill-none"
                        strokeWidth="3"
                    />
                    <motion.circle
                        cx="18"
                        cy="18"
                        r="14"
                        className="stroke-brand-warning fill-none"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                        style={{
                            strokeDasharray: circumference,
                        }}
                    />
                </svg>

                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                        className="text-lg transition-transform group-hover:scale-125"
                        animate={streak > 0 ? { y: [0, -2, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        🔥
                    </motion.span>
                </div>
            </div>

            {/* Streak Count Bubble */}
            <span className="absolute -bottom-1 -right-1 bg-brand-warning text-bg-base text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-bg-base shadow-glow-warn">
                {streak}
            </span>

            {/* Tooltip (Simplified) */}
            <div className="absolute top-full mt-2 w-40 p-3 glass-card bg-bg-elevated/95 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-[60]">
                <p className="text-[10px] font-bold text-brand-warning mb-2">🔥 {streak} DAY STREAK</p>
                <div className="flex gap-1 justify-center">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <div
                            key={day}
                            className={`w-2.5 h-2.5 rounded-sm ${day < 5 ? 'bg-brand-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-bg-muted border border-border-subtle'}`}
                        />
                    ))}
                </div>
                <p className="text-[8px] text-text-muted mt-2 text-center uppercase tracking-widest font-bold">Keep it up!</p>
            </div>
        </button>
    );
}

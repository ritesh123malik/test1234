'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
    score: number;
    label?: string;
}

export default function ScoreGauge({ score, label = "ATS_MATCH_SCORE" }: ScoreGaugeProps) {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s >= 80) return '#10b981'; // emerald-500
        if (s >= 60) return '#fbbf24'; // amber-400
        return '#f43f5e'; // rose-500
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        fill="transparent"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                    />
                    <motion.circle
                        cx="96"
                        cy="96"
                        r={radius}
                        fill="transparent"
                        stroke={getColor(score)}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Score Number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl font-black text-white leading-none"
                    >
                        {score}
                    </motion.span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">PERCENT</span>
                </div>
            </div>

            <div className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-4">
                <div className="h-[1px] w-8 bg-white/5" />
                {label}
                <div className="h-[1px] w-8 bg-white/5" />
            </div>
        </div>
    );
}

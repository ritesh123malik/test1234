// components/charts/SkillRadarChart.tsx
'use client';

import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

interface SkillPoint {
    subject: string;
    A: number; // User value
    fullMark: number;
}

interface SkillRadarChartProps {
    data: SkillPoint[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-3 rounded-xl shadow-2xl backdrop-blur-xl">
                <p className="text-[9px] font-black text-[var(--brand-primary)] uppercase tracking-[0.2em]">Neural_Proficiency</p>
                <p className="text-sm font-bold text-white mt-1">
                    {payload[0].payload.subject}: <span className="text-sky-400">{payload[0].value}%</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function SkillRadarChart({ data }: SkillRadarChartProps) {
    return (
        <div className="w-full h-[400px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="var(--border-subtle)" opacity={0.3} />
                    <PolarAngleAxis 
                        dataKey="subject" 
                        stroke="var(--text-muted)" 
                        fontSize={9} 
                        tick={{ fontWeight: 900 }}
                    />
                    <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        axisLine={false} 
                        tick={false} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Radar
                        name="Neural Capacity"
                        dataKey="A"
                        stroke="var(--brand-primary)"
                        fill="var(--brand-primary)"
                        fillOpacity={0.4}
                        animationDuration={1500}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}

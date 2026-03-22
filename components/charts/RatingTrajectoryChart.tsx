// components/charts/RatingTrajectoryChart.tsx
'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    Legend
} from 'recharts';
import { motion } from 'framer-motion';

interface DataPoint {
    date: string;
    leetcode?: number;
    codeforces?: number;
    codechef?: number;
}

interface RatingTrajectoryChartProps {
    data: DataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 italic">Ref_Time: {label}</p>
                <div className="space-y-2">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-tighter">
                                {entry.name}: <span className="text-[var(--brand-primary)]">{entry.value}</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default function RatingTrajectoryChart({ data }: RatingTrajectoryChartProps) {
    return (
        <div className="w-full h-[300px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorLC" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFA116" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#FFA116" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCF" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke="var(--border-subtle)" 
                        opacity={0.3} 
                    />
                    <XAxis 
                        dataKey="date" 
                        stroke="var(--text-muted)" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(str) => {
                            const date = new Date(str);
                            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        }}
                    />
                    <YAxis 
                        stroke="var(--text-muted)" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false}
                        domain={['dataMin - 100', 'dataMax + 100']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        verticalAlign="top" 
                        align="right" 
                        iconType="circle"
                        wrapperStyle={{ 
                            paddingBottom: '20px',
                            fontSize: '9px',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}
                    />
                    <Area 
                        name="LeetCode"
                        type="monotone" 
                        dataKey="leetcode" 
                        stroke="#FFA116" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorLC)" 
                        animationDuration={1500}
                    />
                    <Area 
                        name="Codeforces"
                        type="monotone" 
                        dataKey="codeforces" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorCF)" 
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

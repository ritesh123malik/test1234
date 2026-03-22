'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Target } from 'lucide-react';

interface CGPAChipProps {
    cgpa: number;
}

export function CGPAChip({ cgpa }: CGPAChipProps) {
    const router = useRouter();
    const getStatusColor = () => {
        if (cgpa >= 8.5) return 'text-brand-success bg-brand-success/10 border-brand-success/20';
        if (cgpa >= 7.5) return 'text-brand-warning bg-brand-warning/10 border-brand-warning/20';
        return 'text-brand-danger bg-brand-danger/10 border-brand-danger/20';
    };

    const getLabel = () => {
        if (cgpa >= 8.5) return 'EXCELLENT';
        if (cgpa >= 7.5) return 'GOOD';
        return 'IMPROVE';
    };

    return (
        <button
            onClick={() => router.push('/cgpa-calculator')}
            className="group relative flex items-center gap-2 pl-3 pr-2 py-1 rounded-full border border-border-subtle hover:bg-bg-overlay/50 transition-all cursor-pointer"
        >
            <span className="text-[10px] font-black text-text-muted tracking-widest">CGPA</span>
            <div className={`px-2 py-0.5 rounded-lg border font-mono font-bold text-xs ${getStatusColor()}`}>
                {cgpa.toFixed(2)}
            </div>

            {/* Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 p-3 glass-card bg-bg-elevated/95 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-[60]">
                <div className="flex flex-col items-center gap-1">
                    <Target size={14} className="text-text-muted mb-1" />
                    <p className="text-[10px] font-black text-text-primary tracking-widest">{getLabel()}</p>
                    <p className="text-[8px] text-text-muted uppercase font-bold">Click to improve</p>
                </div>
            </div>
        </button>
    );
}


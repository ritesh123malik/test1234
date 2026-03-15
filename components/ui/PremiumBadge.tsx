'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface PremiumBadgeProps {
    className?: string;
}

export function PremiumBadge({ className = "" }: PremiumBadgeProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400/30 shadow-lg shadow-blue-500/20 ${className}`}
        >
            <Sparkles size={12} className="text-white fill-white" />
            <span className="text-[10px] font-black uppercase tracking-wider">Premium</span>
        </motion.div>
    );
}

'use client';

import { motion } from 'framer-motion';
import {
    Scale,
    Target
} from 'lucide-react';
import PlacementTracker from '@/components/analytics/PlacementTracker';

export default function SalaryInsightsPage() {
    return (
        <div className="min-h-screen bg-[#050505] py-20 px-6">
            <div className="max-w-[1400px] mx-auto">
                {/* Tactical Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6c63ff]/10 border border-[#6c63ff]/20 text-[#6c63ff] text-[10px] font-black uppercase tracking-[0.2em] mb-8"
                        >
                            <Scale size={12} /> Strategic_Compensation_Intel
                        </motion.div>
                        <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-white mb-8 leading-none">
                            Placement <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6c63ff] to-[#ff6584]">Vault.</span>
                        </h1>
                        <p className="text-[#6b6b85] text-xl max-w-3xl font-medium leading-relaxed">
                            Real-time drive tracking, automated CTC distribution, and high-fidelity compensation analytics for the LNMIIT 2026 cohort.
                        </p>
                    </div>

                    <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] flex items-center gap-10 backdrop-blur-2xl">
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#6b6b85] mb-2">Regional_Node</p>
                            <p className="text-3xl font-black text-white tracking-tighter uppercase">LNMIIT_Sector_Alpha</p>
                        </div>
                        <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-[#6c63ff] to-[#ff6584] flex items-center justify-center text-white shadow-2xl shadow-[#6c63ff]/30">
                            <Target size={32} />
                        </div>
                    </div>
                </div>

                {/* Main Tracker & Insights Component */}
                <PlacementTracker />
            </div>
        </div>
    );
}

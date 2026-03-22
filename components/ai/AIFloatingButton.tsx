'use client';

import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const AIAssistant = dynamic(() => import('@/components/ai/AIAssistant'), {
    ssr: false,
    loading: () => (
        <div className="fixed bottom-28 right-8 w-[450px] h-[650px] glass-card border border-[var(--border-subtle)] rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] z-50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
    ),
});

interface AIFloatingButtonProps {
    selectedProblem?: string;
}

export default function AIFloatingButton({ selectedProblem }: AIFloatingButtonProps) {
    const [showAI, setShowAI] = useState(false);

    return (
        <>
            {/* AI Assistant Button */}
            <AnimatePresence>
                {!showAI && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setShowAI(true)}
                        className="fixed bottom-20 md:bottom-8 right-6 md:right-8 z-40 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center border border-white/20 hover:scale-110 active:scale-90 transition-all duration-300 group"
                        aria-label="Ask Career Architect"
                    >
                        <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping opacity-20 pointer-events-none" />
                        <SparklesIcon className="w-8 h-8 text-white group-hover:animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* AI Assistant Modal */}
            <AnimatePresence>
                {showAI && (
                    <AIAssistant
                        problem={selectedProblem || "Consult your Career Architect..."}
                        onClose={() => setShowAI(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

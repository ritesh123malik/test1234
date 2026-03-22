'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, X, Rocket, Zap, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
}

export default function UpgradeModal({ isOpen, onClose, featureName }: UpgradeModalProps) {
    const router = useRouter();

    const handleUpgrade = () => {
        router.push('/pricing');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-500/10"
                    >
                        {/* Glow Effect */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full" />
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/20 blur-[80px] rounded-full" />

                        <div className="p-8 sm:p-10 relative z-10 text-center">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center border border-white/10 relative">
                                    <Sparkles className="text-blue-400 w-10 h-10" />
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1"
                                    >
                                        <Rocket className="text-white w-3 h-3" />
                                    </motion.div>
                                </div>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 uppercase tracking-tight">
                                Unlock Premium Power
                            </h3>
                            <p className="text-gray-400 text-sm mb-8">
                                {featureName ? `You've reached your free limit for ${featureName}.` : "You've discovered a Premium feature."}
                                <br /> Join the elite and dominate your interview prep.
                            </p>

                            <div className="space-y-4 mb-10 text-left">
                                {[
                                    { icon: Zap, text: "Unlimited AI Interviews & Voice Simulation" },
                                    { icon: ShieldCheck, text: "Full OA Simulator & Anti-Proctor Intel" },
                                    { icon: Rocket, text: "SDE Sheet Progress Sync & Advanced Heatmaps" },
                                    { icon: Check, text: "AI Pattern Identifier & Audio Hints" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                                        <item.icon className="text-blue-400 w-5 h-5 flex-shrink-0" />
                                        <span className="text-sm font-bold text-gray-200">{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={onClose}
                                    className="py-4 rounded-2xl border border-gray-800 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                                >
                                    Maybe Later
                                </button>
                                <button
                                    onClick={handleUpgrade}
                                    className="py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 transition-all transform active:scale-95"
                                >
                                    Upgrade Now
                                </button>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic2, Play, Volume2, Loader2, Sparkles, Headset } from 'lucide-react';
import { toast } from 'sonner';

interface AudioHintButtonProps {
    problemText: string;
    currentCode?: string;
}

export default function AudioHintButton({ problemText, currentCode }: AudioHintButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const getHint = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/audio-hints', {
                method: 'POST',
                body: JSON.stringify({ problem_text: problemText, current_code: currentCode })
            });
            const data = await res.json();

            if (data.hint) {
                playVoice(data.hint);
            } else if (data.error) {
                toast.error(data.error);
            }
        } catch (e) {
            toast.error('Sync Error');
        } finally {
            setIsLoading(false);
        }
    };

    const playVoice = (text: string) => {
        if (!window.speechSynthesis) {
            toast.error('Voice synthesis not supported in this browser.');
            return;
        }

        // Stop existing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Find a cool voice if possible
        const voices = window.speechSynthesis.getVoices();
        const neuralVoice = voices.find(v => v.name.includes('Neural') || v.name.includes('Premium'));
        if (neuralVoice) utterance.voice = neuralVoice;

        utterance.rate = 1.0;
        utterance.pitch = 1.1;

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="relative group">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={getHint}
                disabled={isLoading || isPlaying}
                className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-500 overflow-hidden relative ${isPlaying
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-blue-500/50 hover:text-white'
                    }`}
            >
                {/* Pulse for isPlaying */}
                {isPlaying && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 0.2, 0], scale: [1, 2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-white"
                    />
                )}

                <div className="relative z-10 flex items-center gap-3">
                    {isLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : isPlaying ? (
                        <Volume2 size={16} className="animate-pulse" />
                    ) : (
                        <Headset size={16} />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                        {isLoading ? 'Neural_Sync...' : isPlaying ? 'Transmitting...' : 'Listen_to_Hint'}
                    </span>
                </div>

                {/* Neural Sparkle Overlay */}
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.button>

            <AnimatePresence>
                {isPlaying && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-16 left-0 w-64 p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed shadow-2xl"
                    >
                        Tactical Audio Transmission in progress...
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

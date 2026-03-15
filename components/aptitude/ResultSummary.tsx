'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface ResultSummaryProps {
    session: any;
    onRestart?: () => void;
}

export default function ResultSummary({ session, onRestart }: ResultSummaryProps) {
    const isPass = session.score_percent >= 60;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-12 sm:p-20 text-center relative overflow-hidden bg-white/[0.02] border-white/5"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />

                <div className="flex justify-center mb-10">
                    <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl ${isPass ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-600 shadow-rose-500/20'
                        }`}>
                        <Trophy size={64} />
                    </div>
                </div>

                <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter text-white mb-6">
                    {isPass ? 'Mission_Won' : 'Mission_Failed'}
                </h1>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: 'Score', value: `${session.score_percent}%`, icon: Trophy, color: 'text-blue-400' },
                        { label: 'Correct', value: `${session.correct_answers}/${session.total_questions}`, icon: CheckCircle, color: 'text-emerald-400' },
                        { label: 'Time', value: `${Math.floor(session.time_taken_seconds / 60)}m ${session.time_taken_seconds % 60}s`, icon: Clock, color: 'text-amber-400' },
                        { label: 'Status', value: isPass ? 'PASS' : 'FAIL', icon: CheckCircle, color: isPass ? 'text-emerald-400' : 'text-rose-400' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/5">
                            <stat.icon size={20} className={`${stat.color} mb-3 mx-auto`} />
                            <div className="text-lg font-black text-white">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <button
                        onClick={onRestart}
                        className="btn-secondary-lg px-12 order-2 sm:order-1"
                    >
                        <RotateCcw size={18} className="mr-2" />
                        Try Again
                    </button>
                    <Link href="/aptitude">
                        <button className="btn-primary-lg px-12 w-full sm:w-auto">
                            Back to Lobby
                            <ArrowRight size={18} className="ml-2" />
                        </button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

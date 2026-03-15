'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, BarChart3, Code } from 'lucide-react';

const SCORE_LABELS = ['correctness', 'depth', 'clarity', 'structure', 'confidence'];
const CODE_SCORE_LABELS = [
    'code_correctness', 'time_complexity', 'space_complexity',
    'code_readability', 'edge_case_handling'
];

interface Evaluation {
    score_breakdown: Record<string, number>;
    feedback: {
        overall: string;
        strengths: string[];
        weaknesses: string[];
        missing_points: string[];
        code_feedback?: string;
        complexity_analysis?: {
            time: string;
            space: string;
            optimal_time: string;
            optimal_space: string;
        };
    };
    model_code_solution?: string;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
    const color = value >= 8 ? 'bg-green-500' : value >= 5 ? 'bg-yellow-500' : 'bg-red-500';
    const shadowColor = value >= 8 ? 'shadow-green-500/20' : value >= 5 ? 'shadow-yellow-500/20' : 'shadow-red-500/20';

    return (
        <div className='space-y-1.5'>
            <div className='flex justify-between text-xs font-medium'>
                <span className='text-gray-400 uppercase tracking-wider'>{label}</span>
                <span className='text-white font-bold'>{value}/10</span>
            </div>
            <div className='h-2.5 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/30'>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 10}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${color} ${shadowColor} shadow-lg transition-all`}
                />
            </div>
        </div>
    );
}

export default function EvaluationDashboard({
    evaluation,
    allEvals
}: {
    evaluation: Evaluation;
    allEvals: Evaluation[]
}) {
    if (!evaluation) return null;

    const currentScore = Object.values(evaluation.score_breakdown).reduce((a, b) => a + b, 0) / SCORE_LABELS.length;

    return (
        <div className='w-full lg:w-[400px] space-y-5 sticky top-6 self-start'>
            {/* Latest Score Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className='bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-2xl relative overflow-hidden'
            >
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <BarChart3 size={120} />
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <BarChart3 className="text-blue-400" size={20} />
                    </div>
                    <h3 className='text-white font-bold text-lg'>Live Analytics</h3>
                </div>

                <div className='space-y-4'>
                    {SCORE_LABELS.map(label => (
                        <ScoreBar
                            key={label}
                            label={label}
                            value={evaluation.score_breakdown[label] || 0}
                        />
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Latest Response Accuracy</span>
                    <div className="text-2xl font-black text-blue-400">
                        {Math.round(currentScore * 10)}%
                    </div>
                </div>
            </motion.div>

            {/* Feedback Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-2xl'
            >
                <div className='space-y-5'>
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-blue-400">
                            <Info size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Interviewer Notes</span>
                        </div>
                        <p className='text-gray-300 text-sm leading-relaxed italic'>
                            "{evaluation.feedback.overall}"
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {evaluation.feedback.strengths.length > 0 && (
                            <div className="space-y-2">
                                <p className='text-green-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5'>
                                    <CheckCircle2 size={12} />
                                    Core Strengths
                                </p>
                                <div className="space-y-1.5">
                                    {evaluation.feedback.strengths.map((s, i) => (
                                        <div key={i} className='text-gray-400 text-xs flex items-start gap-2 bg-green-500/5 p-2 rounded-lg border border-green-500/10'>
                                            <span className="text-green-500 mt-0.5">•</span>
                                            <span>{s}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {evaluation.feedback.weaknesses.length > 0 && (
                            <div className="space-y-2">
                                <p className='text-red-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5'>
                                    <AlertCircle size={12} />
                                    Critical Improvements
                                </p>
                                <div className="space-y-1.5">
                                    {evaluation.feedback.weaknesses.map((w, i) => (
                                        <div key={i} className='text-gray-400 text-xs flex items-start gap-2 bg-red-500/5 p-2 rounded-lg border border-red-500/10'>
                                            <span className="text-red-500 mt-0.5">•</span>
                                            <span>{w}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Code Analysis Section */}
            {evaluation.score_breakdown.code_correctness !== undefined && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className='space-y-5'
                >
                    {/* Code Score Card */}
                    <div className='bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-2xl relative overflow-hidden'>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <CheckCircle2 className="text-green-400" size={20} />
                            </div>
                            <h3 className='text-white font-bold text-lg'>Code Quality</h3>
                        </div>
                        <div className='space-y-4'>
                            {CODE_SCORE_LABELS.map(l => (
                                <ScoreBar key={l} label={l.replace(/_/g, ' ')} value={evaluation.score_breakdown[l] || 0} />
                            ))}
                        </div>
                    </div>

                    {/* Complexity Analysis Card */}
                    {evaluation.feedback.complexity_analysis && (
                        <div className='bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-2xl space-y-4'>
                            <div className="flex items-center gap-2 text-yellow-400">
                                <Info size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">Big O Analysis</span>
                            </div>
                            <div className='grid grid-cols-2 gap-3'>
                                <div className='bg-black/40 border border-gray-800 rounded-xl p-3'>
                                    <p className='text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1'>Your Time</p>
                                    <p className='text-sm text-yellow-400 font-mono'>{evaluation.feedback.complexity_analysis.time}</p>
                                </div>
                                <div className='bg-black/40 border border-gray-800 rounded-xl p-3'>
                                    <p className='text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1'>Optimal Time</p>
                                    <p className='text-sm text-green-400 font-mono'>{evaluation.feedback.complexity_analysis.optimal_time}</p>
                                </div>
                                <div className='bg-black/40 border border-gray-800 rounded-xl p-3'>
                                    <p className='text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1'>Your Space</p>
                                    <p className='text-sm text-yellow-500 font-mono'>{evaluation.feedback.complexity_analysis.space}</p>
                                </div>
                                <div className='bg-black/40 border border-gray-800 rounded-xl p-3'>
                                    <p className='text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1'>Optimal Space</p>
                                    <p className='text-sm text-green-500 font-mono'>{evaluation.feedback.complexity_analysis.optimal_space}</p>
                                </div>
                            </div>
                            {evaluation.feedback.code_feedback && (
                                <p className='text-gray-400 text-xs leading-relaxed italic border-t border-gray-800 pt-3'>
                                    {evaluation.feedback.code_feedback}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Model Solution Card */}
                    {evaluation.model_code_solution && (
                        <div className='bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-2xl'>
                            <p className='text-gray-500 text-[10px] uppercase font-black tracking-widest mb-3 flex items-center gap-2'>
                                <Code size={12} />
                                Ideal Implementation_
                            </p>
                            <pre className='text-[11px] text-green-300 font-mono bg-black/40 p-4 rounded-xl border border-gray-800 overflow-x-auto whitespace-pre'>
                                {evaluation.model_code_solution}
                            </pre>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}

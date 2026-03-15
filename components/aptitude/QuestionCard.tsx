'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface QuestionCardProps {
    question: any;
    selectedOption: string | null;
    onSelect: (option: string) => void;
    showExplanation?: boolean;
    explanationContent?: string;
    onAIExplain?: () => void;
    isCorrect?: boolean;
}

export default function QuestionCard({
    question,
    selectedOption,
    onSelect,
    showExplanation,
    explanationContent,
    onAIExplain,
    isCorrect
}: QuestionCardProps) {
    const options = question.options as string[];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl mx-auto"
        >
            <div className="glass-card p-8 sm:p-12 relative overflow-hidden bg-white/[0.02] border-white/5">
                {/* Meta Header */}
                <div className="flex items-center justify-between mb-8">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {question.category} / {question.sub_category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${question.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            question.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                        {question.difficulty}
                    </span>
                </div>

                {/* Question Text */}
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-10 leading-relaxed">
                    {question.question}
                </h2>

                {/* Options */}
                <div className="space-y-4">
                    {['A', 'B', 'C', 'D'].map((optKey, idx) => {
                        const optionText = options[idx];
                        const isSelected = selectedOption === optKey;
                        const isCorrectOption = showExplanation && question.correct_option === optKey;
                        const isWrongSelection = showExplanation && isSelected && !isCorrect;

                        return (
                            <button
                                key={optKey}
                                onClick={() => !showExplanation && onSelect(optKey)}
                                disabled={showExplanation}
                                className={`w-full p-6 rounded-2xl border text-left flex items-center gap-4 transition-all duration-300 ${isSelected && !showExplanation ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-600/20' :
                                        isCorrectOption ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' :
                                            isWrongSelection ? 'bg-rose-600/20 border-rose-500 text-rose-400' :
                                                'bg-white/5 border-white/5 hover:border-white/10 text-gray-400 hover:text-white'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${isSelected && !showExplanation ? 'bg-white text-blue-600' :
                                        isCorrectOption ? 'bg-emerald-500 text-white' :
                                            isWrongSelection ? 'bg-rose-500 text-white' :
                                                'bg-white/10'
                                    }`}>
                                    {optKey}
                                </div>
                                <span className="text-sm sm:text-base font-medium">{optionText}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Explanation Section */}
                {showExplanation && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-12 pt-8 border-t border-white/5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black uppercase tracking-tight text-white">Solution_Intelligence</h3>
                            {onAIExplain && (
                                <button
                                    onClick={onAIExplain}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-blue-500/20"
                                >
                                    AI Teacher Insight
                                </button>
                            )}
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            {question.explanation}
                        </p>

                        {explanationContent && (
                            <div className="p-6 rounded-2xl bg-blue-600/5 border border-blue-500/20 text-blue-100 text-sm italic leading-relaxed">
                                <Sparkles size={16} className="text-blue-400 mb-2" />
                                {explanationContent}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

import { Sparkles } from 'lucide-react';

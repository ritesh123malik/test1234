'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Play, Send, LayoutPanelLeft } from 'lucide-react';
import AudioHintButton from '@/components/ui/AudioHintButton';

interface CodingSectionProps {
    question: any;
    onRun?: (code: string) => void;
    onSubmit?: (code: string) => void;
}

export default function CodingSection({ question, onRun, onSubmit }: CodingSectionProps) {
    const [code, setCode] = useState(question?.starter_codes?.cpp || '// Write your code here...');
    const [language, setLanguage] = useState('cpp');
    const [isRunning, setIsRunning] = useState(false);

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] lg:flex-row gap-6">
            {/* Problem Statement */}
            <div className="lg:w-1/3 bg-white/[0.02] border border-white/5 rounded-3xl overflow-y-auto p-8 prose prose-invert max-w-none">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6">
                    <LayoutPanelLeft size={14} /> Problem_Architecture
                </div>
                <h2 className="text-2xl font-black mb-6">{question.title}</h2>
                <div className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {question.problem_statement}
                </div>

                {question.constraints && (
                    <div className="mt-8 pt-8 border-t border-white/5">
                        <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">Constraints</h4>
                        <div className="text-gray-500 text-xs font-mono bg-white/5 p-4 rounded-xl">
                            {question.constraints}
                        </div>
                    </div>
                )}
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col gap-6">
                <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                    {/* Editor Header */}
                    <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-transparent text-xs font-black uppercase tracking-widest text-gray-400 focus:outline-none"
                            >
                                <option value="cpp">C++ (GCC 13)</option>
                                <option value="java">Java 21</option>
                                <option value="python">Python 3.12</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4">
                            <AudioHintButton
                                problemText={question.problem_statement}
                                currentCode={code}
                            />
                            <button
                                onClick={() => onRun?.(code)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all"
                            >
                                <Play size={14} /> Run_Tests
                            </button>
                            <button
                                onClick={() => onSubmit?.(code)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-blue-500/20"
                            >
                                <Send size={14} /> Commit_Logic
                            </button>
                        </div>
                    </div>

                    {/* Pseudo Editor (Textarea for prototype) */}
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 w-full bg-transparent p-8 font-mono text-sm text-gray-300 resize-none focus:outline-none"
                        spellCheck={false}
                    />
                </div>

                {/* Console Output */}
                <div className="h-40 bg-black border border-white/5 rounded-3xl p-6 font-mono text-xs overflow-y-auto">
                    <div className="text-gray-600 uppercase tracking-widest font-black mb-4">Console_Intelligence</div>
                    <div className="text-emerald-500">&gt; Environment ready. Code synchronization active.</div>
                </div>
            </div>
        </div>
    );
}

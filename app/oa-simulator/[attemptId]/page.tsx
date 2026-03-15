'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import TimerBar from '@/components/aptitude/TimerBar';
import QuestionCard from '@/components/aptitude/QuestionCard';
import CodingSection from '@/components/oa/CodingSection';
import TabSwitchDetector from '@/components/oa/TabSwitchDetector';
import ResultSummary from '@/components/aptitude/ResultSummary';
import {
    ChevronLeft,
    ChevronRight,
    Send,
    LayoutGrid,
    Code2,
    AlertCircle,
    Brain,
    Rocket
} from 'lucide-react';
import { toast } from 'sonner';

export default function OASession() {
    const { attemptId } = useParams();
    const router = useRouter();

    const [sessionData, setSessionData] = useState<any>(null);
    const [aptQuestions, setAptQuestions] = useState<any[]>([]);
    const [codingQuestions, setCodingQuestions] = useState<any[]>([]);
    const [activeSection, setActiveSection] = useState<'aptitude' | 'coding'>('aptitude');
    const [currentIdx, setCurrentIdx] = useState(0);
    const [aptAnswers, setAptAnswers] = useState<Record<string, string>>({});
    const [codingCodes, setCodingCodes] = useState<Record<string, string>>({});

    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [totalTime, setTotalTime] = useState(0);
    const [tabSwitches, setTabSwitches] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch data
    useEffect(() => {
        const loadAttempt = async () => {
            try {
                const res = await fetch(`/api/oa-simulator?attemptId=${attemptId}`);
                const data = await res.json();

                if (data.attempt) {
                    setSessionData(data.attempt);
                    // Mock questions if not in data (prototype fallback)
                    setAptQuestions(data.aptitudeQuestions || [
                        { id: 'apt-1', question: "What is 25% of 25% of 400?", options: ["25", "100", "50", "12.5"], correct_option: "A", category: "Quantitative", explanation: "Calculated as 0.25 * 0.25 * 400 = 25.", difficulty: "easy" }
                    ]);
                    setCodingQuestions(data.codingQuestions || [
                        { id: 'cod-1', title: "Two Sum", problem_statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", starter_codes: { cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};" } }
                    ]);

                    const duration = (data.attempt.oa_templates?.duration_minutes || 60) * 60;
                    setTotalTime(duration);
                    setTimeRemaining(duration);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadAttempt();
    }, [attemptId]);

    const handleTabSwitch = async () => {
        setTabSwitches(prev => prev + 1);
        try {
            await fetch('/api/oa-simulator', {
                method: 'POST',
                body: JSON.stringify({ action: 'tab_switch', attemptId })
            });
            if (tabSwitches >= 2) {
                toast.error('FINAL WARNING: Next switch will trigger auto-submission.');
            }
            if (tabSwitches >= 3) {
                handleComplete(true);
            }
        } catch (e) { }
    };

    const handleComplete = useCallback(async (isAuto = false) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/oa-simulator', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'submit',
                    attemptId,
                    aptitudeAnswers: aptAnswers,
                    codingSubmissions: codingCodes,
                    isAutoSubmit: isAuto
                })
            });
            const data = await res.json();
            setSessionData(data);
            setIsCompleted(true);
            if (isAuto) toast.error('Exam auto-submitted due to proctoring violation.');
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    }, [attemptId, aptAnswers, codingCodes]);

    // Timer
    useEffect(() => {
        if (timeRemaining === null || isCompleted) return;
        if (timeRemaining <= 0) {
            handleComplete(true);
            return;
        }
        const timer = setInterval(() => setTimeRemaining(t => (t as number) - 1), 1000);
        return () => clearInterval(timer);
    }, [timeRemaining, isCompleted, handleComplete]);

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black tracking-widest">BOOTING_SIMULATOR...</div>;

    if (isCompleted) return <ResultSummary session={sessionData} onRestart={() => router.push('/oa-simulator')} />;

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <TimerBar remaining={timeRemaining || 0} total={totalTime} />
            <TabSwitchDetector onSwitch={handleTabSwitch} currentSwitches={tabSwitches} />

            {/* Section Switcher */}
            <div className="bg-white/5 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 flex items-center gap-8">
                    <button
                        onClick={() => { setActiveSection('aptitude'); setCurrentIdx(0); }}
                        className={`py-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'aptitude' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Brain size={14} /> Section_1: Aptitude
                    </button>
                    <button
                        onClick={() => { setActiveSection('coding'); setCurrentIdx(0); }}
                        className={`py-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'coding' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Code2 size={14} /> Section_2: Coding
                    </button>
                    <div className="flex-1" />
                    <button
                        onClick={() => handleComplete(false)}
                        className="btn-primary-sm py-2 px-6"
                    >
                        Finish_Exam
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <AnimatePresence mode="wait">
                    {activeSection === 'aptitude' ? (
                        <motion.div
                            key="apt"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-12"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Question {currentIdx + 1} of {aptQuestions.length}</span>
                            </div>
                            <QuestionCard
                                question={aptQuestions[currentIdx]}
                                selectedOption={aptAnswers[aptQuestions[currentIdx].id] || null}
                                onSelect={(opt) => setAptAnswers(prev => ({ ...prev, [aptQuestions[currentIdx].id]: opt }))}
                            />
                            <div className="flex justify-center gap-4 mt-12">
                                <button
                                    onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                                    disabled={currentIdx === 0}
                                    className="p-4 rounded-full bg-white/5 border border-white/5 disabled:opacity-30"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={() => setCurrentIdx(prev => Math.min(aptQuestions.length - 1, prev + 1))}
                                    disabled={currentIdx === aptQuestions.length - 1}
                                    className="p-4 rounded-full bg-white/5 border border-white/5 disabled:opacity-30"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="cod"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <CodingSection
                                question={codingQuestions[currentIdx]}
                                onSubmit={(code) => setCodingCodes(prev => ({ ...prev, [codingQuestions[currentIdx].id]: code }))}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Proctor Alert Overlay */}
            {tabSwitches > 0 && (
                <div className="fixed bottom-10 left-10 z-[100]">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-rose-600/20 backdrop-blur-md border border-rose-500/50 p-6 rounded-3xl flex items-center gap-4 shadow-2xl shadow-rose-500/20"
                    >
                        <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white animate-pulse">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-rose-400">Proctor_Alert</div>
                            <div className="text-white font-bold">{tabSwitches} Unauthorized Switches</div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Header as Navbar } from '@/components/layout/Header';
import TimerBar from '@/components/aptitude/TimerBar';
import QuestionCard from '@/components/aptitude/QuestionCard';
import ResultSummary from '@/components/aptitude/ResultSummary';
import { ChevronLeft, ChevronRight, Send, AlertTriangle } from 'lucide-react';

export default function AptitudeSession() {
    const { sessionId } = useParams();
    const router = useRouter();

    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [totalTime, setTotalTime] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [sessionData, setSessionData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});

    // Fetch session data
    useEffect(() => {
        const fetchSession = async () => {
            try {
                // In a real app, we'd fetch the existing session and questions from DB
                // For this prototype, we'll assume the session was just created and we might need to fetch it
                // Since this is a client component, we'll hit the API
                const res = await fetch(`/api/aptitude?sessionId=${sessionId}`);
                // Note: I need to implement the GET method for /api/aptitude or similar
                // For now, let's assume we fetch it
            } catch (e) {
                console.error(e);
            }
        };
        // Mocking for now because I need to implement the GET route
        // fetchSession();
    }, [sessionId]);

    const handleAnswer = (option: string) => {
        const qId = questions[currentIdx].id;
        setAnswers(prev => ({ ...prev, [qId]: option }));
    };

    const handleComplete = useCallback(async () => {
        setIsSubmitting(true);
        try {
            const timeTaken = totalTime - (timeRemaining || 0);
            const res = await fetch('/api/aptitude', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'complete',
                    session_id: sessionId,
                    time_taken_seconds: timeTaken
                })
            });
            const data = await res.json();
            setSessionData(data);
            setIsCompleted(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }, [sessionId, timeRemaining, totalTime]);

    // Timer Logic
    useEffect(() => {
        if (timeRemaining === null || isCompleted) return;
        if (timeRemaining <= 0) {
            handleComplete();
            return;
        }
        const timer = setInterval(() => setTimeRemaining(t => (t as number) - 1), 1000);
        return () => clearInterval(timer);
    }, [timeRemaining, isCompleted, handleComplete]);

    const handleAIExplain = async (question: any) => {
        if (aiExplanations[question.id]) return;

        try {
            const res = await fetch('/api/aptitude', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'ai_explain',
                    question_text: question.question,
                    selected_option: answers[question.id],
                    correct_option: question.correct_option
                })
            });
            const { explanation } = await res.json();
            setAiExplanations(prev => ({ ...prev, [question.id]: explanation }));
        } catch (e) {
            console.error(e);
        }
    };

    // Fetch session and questions
    useEffect(() => {
        const loadSession = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/aptitude?sessionId=${sessionId}`);
                const data = await res.json();

                if (data.session && data.questions) {
                    setSessionData(data.session);
                    setQuestions(data.questions);
                    setTotalTime(data.session.time_limit_seconds || 0);
                    setTimeRemaining(data.session.time_limit_seconds);
                }
            } catch (e) {
                console.error('Session load error:', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadSession();
    }, [sessionId]);

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Neural_Logic_Loading...</div>;

    if (isCompleted) return <ResultSummary session={sessionData} onRestart={() => router.push('/aptitude')} />;

    const currentQuestion = questions[currentIdx];

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
            <TimerBar remaining={timeRemaining || 0} total={totalTime} />

            <main className="max-w-7xl mx-auto px-6 py-20">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Question Area */}
                    <div className="lg:col-span-8 flex-1">
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Question_Vector</span>
                                <div className="h-px w-12 bg-white/10" />
                                <span className="text-xl font-black text-white">{currentIdx + 1} / {questions.length}</span>
                            </div>
                        </div>

                        <QuestionCard
                            question={currentQuestion}
                            selectedOption={answers[currentQuestion.id] || null}
                            onSelect={handleAnswer}
                        />

                        {/* Navigation Footer */}
                        <div className="mt-12 flex items-center justify-between max-w-3xl mx-auto px-4">
                            <button
                                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                                disabled={currentIdx === 0}
                                className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>

                            <div className="flex gap-2">
                                {questions.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentIdx ? 'bg-blue-500 scale-125' :
                                            answers[questions[i].id] ? 'bg-white/40' : 'bg-white/10'
                                            }`}
                                    />
                                ))}
                            </div>

                            {currentIdx < questions.length - 1 ? (
                                <button
                                    onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                                    className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white hover:text-blue-400 transition-all"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    disabled={isSubmitting}
                                    className="px-6 py-3 bg-blue-600 rounded-xl text-xs font-black uppercase tracking-widest text-white flex items-center gap-3 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
                                >
                                    {isSubmitting ? 'Processing...' : 'Submit_Mission'} <Send size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Status Board */}
                    <div className="lg:w-80 space-y-8">
                        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
                            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-6">Mission_Status</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Answered</span>
                                    <span className="text-lg font-black text-white">{Object.keys(answers).length}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 text-amber-400">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Remaining</span>
                                    <span className="text-lg font-black">{questions.length - Object.keys(answers).length}</span>
                                </div>
                            </div>

                            <p className="text-[10px] font-medium text-gray-500 leading-relaxed italic border-t border-white/5 pt-6">
                                WARNING: External network detection active. Switching tabs may result in mission termination.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// components/quiz/QuizEngine.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ClockIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correct_option: number;
    explanation: string;
    subject: string;
    difficulty: string;
    time_limit_seconds: number;
}

import MockTacticalReport from '@/components/test/MockTacticalReport';

interface QuizEngineProps {
    categoryId: string;
    subject: string;
    userId: string;
    isTimed?: boolean;
    totalTimeSeconds?: number;
    onComplete?: (score: number, total: number) => void;
}

export default function QuizEngine({ categoryId, subject, userId, isTimed = false, totalTimeSeconds = 0, onComplete }: QuizEngineProps) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState<number[]>([]);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [showReport, setShowReport] = useState(false);

    useEffect(() => {
        loadQuestions();
    }, [categoryId]);

    useEffect(() => {
        if (questions.length > 0 && !quizCompleted) {
            // Initialize timer for each question
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    const newTime = [...prev];
                    if (newTime[currentIndex] > 0) {
                        newTime[currentIndex] -= 1;
                    } else if (newTime[currentIndex] === 0) {
                        // Auto-move to next question when time runs out
                        handleNext();
                    }
                    return newTime;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [currentIndex, questions, quizCompleted]);

    const loadQuestions = async () => {
        const { data } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('category_id', categoryId)
            .order('difficulty', { ascending: true });

        if (data) {
            setQuestions(data);
            setSelectedAnswers(new Array(data.length).fill(-1));
            setTimeLeft(data.map(q => q.time_limit_seconds));
        }
        setLoading(false);
    };

    const handleAnswer = (optionIndex: number) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentIndex] = optionIndex;
        setSelectedAnswers(newAnswers);

        // Check if answer is correct
        if (optionIndex === questions[currentIndex].correct_option) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowExplanation(false);
        } else {
            completeQuiz();
        }
    };

    const completeQuiz = async () => {
        setQuizCompleted(true);

        // Calculate final score
        const finalScore = selectedAnswers.reduce((acc, answer, idx) => {
            return acc + (answer === questions[idx]?.correct_option ? 1 : 0);
        }, 0);

        // Save attempt to database
        await supabase
            .from('quiz_attempts')
            .insert({
                user_id: userId,
                category_id: categoryId,
                score: finalScore,
                total_questions: questions.length,
                answers: selectedAnswers,
                completed_at: new Date().toISOString()
            });

        // Update user progress
        await updateUserProgress(finalScore, questions.length);

        onComplete?.(finalScore, questions.length);
    };

    const updateUserProgress = async (score: number, total: number) => {
        // Get current progress
        const { data: progress } = await supabase
            .from('user_subject_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('subject', subject)
            .single();

        const newCorrect = (progress?.correct_answers || 0) + score;
        const newAttempted = (progress?.questions_attempted || 0) + total;
        const newAccuracy = (newCorrect / newAttempted) * 100;

        await supabase
            .from('user_subject_progress')
            .upsert({
                user_id: userId,
                subject,
                questions_attempted: newAttempted,
                correct_answers: newCorrect,
                accuracy: newAccuracy,
                last_attempt: new Date().toISOString()
            });
    };

    if (loading) {
        return <div className="text-center py-12">Loading questions...</div>;
    }

    if (quizCompleted && showReport) {
        // Derive some simple areas for the mock report
        const scoreByDiff: any = {};
        questions.forEach((q, i) => {
            if (!scoreByDiff[q.difficulty]) scoreByDiff[q.difficulty] = { correct: 0, total: 0 };
            scoreByDiff[q.difficulty].total++;
            if (selectedAnswers[i] === q.correct_option) scoreByDiff[q.difficulty].correct++;
        });

        const weakAreas = Object.keys(scoreByDiff).filter(d => scoreByDiff[d].correct / scoreByDiff[d].total < 0.6);
        const strongAreas = Object.keys(scoreByDiff).filter(d => scoreByDiff[d].correct / scoreByDiff[d].total >= 0.6);

        return (
            <MockTacticalReport 
                score={score}
                total={questions.length}
                timeSeconds={totalTimeSeconds}
                weakAreas={weakAreas.length > 0 ? weakAreas : ['Foundation Concepts']}
                strongAreas={strongAreas.length > 0 ? strongAreas : ['General Logic']}
                onClose={() => onComplete?.(score, questions.length)}
            />
        );
    }

    if (quizCompleted) {
        const percentage = Math.round((score / questions.length) * 100);

        return (
            <div className="glass-card rounded-3xl p-10 text-center border border-[var(--border-subtle)] shadow-2xl">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                    <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-2 text-[var(--text-primary)]">Quiz Complete! 🎉</h2>
                <p className="text-6xl font-display font-bold text-[var(--brand-primary)] mb-6">{percentage}%</p>
                <p className="text-[var(--text-secondary)] mb-8 font-medium">
                    You scored {score} out of {questions.length}
                </p>

                <div className="max-w-md mx-auto mb-8">
                    <div className="bg-[var(--bg-base)] rounded-full h-4 mb-4 overflow-hidden border border-[var(--border-subtle)]">
                        <div
                            className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] h-4 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <p className="text-sm text-[var(--text-muted)] font-medium">
                        {percentage >= 80 ? 'Elite performance! You\'re ready for the big leagues.' :
                            percentage >= 60 ? 'Strong foundation. Keep sharpening your edge.' :
                                'Room for growth. Every attempt is a step forward!'}
                    </p>
                </div>

                <button 
                    onClick={() => setShowReport(true)}
                    className="btn-primary w-full py-4 text-[10px] font-black uppercase tracking-widest"
                >
                    Generate Tactical Report
                </button>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="glass-card rounded-3xl p-12 text-center border border-[var(--border-subtle)]">
                <h2 className="text-2xl font-display font-bold mb-4 text-[var(--text-primary)] opacity-50">No Data Found</h2>
                <p className="text-[var(--text-secondary)]">Could not locate any challenges for this segment.</p>
            </div>
        )
    }

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="glass-card rounded-3xl p-8 border border-[var(--border-subtle)] shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-primary)]/5 blur-[120px] pointer-events-none" />

            {/* Progress Bar */}
            <div className="mb-10 relative z-10">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">
                    <span className="flex items-center gap-2">
                        <span className="text-[var(--brand-primary)]">Challenge</span> {currentIndex + 1} of {questions.length}
                    </span>
                    <span>{Math.round(progress)}% Progress</span>
                </div>
                <div className="w-full bg-[var(--bg-base)] rounded-full h-2.5 border border-[var(--border-subtle)]/50">
                    <div
                        className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] h-2.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Timer & Meta */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="px-3 py-1 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-full text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter">
                    {currentQuestion.subject} • {currentQuestion.difficulty}
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl">
                    <ClockIcon className="w-5 h-5 text-[var(--brand-primary)]" />
                    <span className={`font-mono text-xl font-bold ${timeLeft[currentIndex] < 10 ? 'text-red-500 animate-pulse' : 'text-[var(--text-primary)]'}`}>
                        {Math.floor(timeLeft[currentIndex] / 60)}:{(timeLeft[currentIndex] % 60).toString().padStart(2, '0')}
                    </span>
                </div>
            </div>

            {/* Question */}
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--brand-primary)]">Decryption_In_Progress</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-[1.1] mb-10 drop-shadow-2xl">
                    {currentQuestion.question}
                </h3>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-8 relative z-10">
                {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswers[currentIndex] === idx;
                    const isCorrect = idx === currentQuestion.correct_option;
                    const showsResult = selectedAnswers[currentIndex] !== -1;

                    let optionStyles = 'border-[var(--border-subtle)] bg-[var(--bg-card)]/50 hover:border-[var(--brand-primary)] hover:bg-[var(--bg-card)]';
                    if (isSelected) {
                        optionStyles = isCorrect
                            ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                            : 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]';
                    } else if (showsResult && isCorrect) {
                        optionStyles = 'border-emerald-500/50 bg-emerald-500/5';
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            className={`w-full p-5 text-left rounded-2xl border-2 transition-all duration-300 group ${optionStyles}`}
                            disabled={selectedAnswers[currentIndex] !== -1}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${isSelected ? 'bg-white/20 text-white' : 'bg-[var(--bg-base)] text-[var(--text-muted)] group-hover:text-[var(--brand-primary)]'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <span className={`font-medium text-lg ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                    {option}
                                </span>
                                {isSelected && (
                                    <div className="ml-auto">
                                        {isCorrect ? <CheckCircleIcon className="w-6 h-6 text-emerald-500" /> : <XCircleIcon className="w-6 h-6 text-red-500" />}
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Explanation */}
            {selectedAnswers[currentIndex] !== -1 && (
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500 relative z-10">
                    <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <DocumentTextIcon className="w-5 h-5 text-indigo-400" />
                            <h4 className="font-bold text-indigo-300 text-sm uppercase tracking-widest">Logic Insight</h4>
                        </div>
                        <p className="text-[var(--text-secondary)] leading-relaxed italic text-sm">
                            {currentQuestion.explanation}
                        </p>
                    </div>
                </div>
            )}

            {/* Next Button */}
            <button
                onClick={handleNext}
                disabled={selectedAnswers[currentIndex] === -1}
                className="w-full h-16 bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white rounded-2xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(79,70,229,0.3)] relative z-10"
            >
                {currentIndex === questions.length - 1 ? 'Finalize Performance' : 'Advance Challenge'}
            </button>
        </div>
    );
}

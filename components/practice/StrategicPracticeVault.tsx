'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal,
    ChevronRight,
    ChevronLeft,
    RotateCcw,
    CheckCircle2,
    XCircle,
    Hexagon,
    Zap,
    Trophy,
    Target,
    BookOpen,
    Layers,
    Cpu,
    Database,
    Globe,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

// --- Topic Definitions ---
const TOPICS: Record<string, {
    name: string;
    label: string;
    icon: any;
    symbol: string;
    title: string;
    accent: string;
    sub: string;
    subtopics: string[];
    count: string;
}> = {
    dsa: {
        name: 'Data Structures & Algorithms',
        label: 'DSA',
        icon: Hexagon,
        symbol: '⬡',
        title: 'Data Structures &',
        accent: 'Algorithms',
        sub: 'Select the subtopics you want to practice. Mix and match freely — questions will be distributed across your selection.',
        subtopics: [
            'Arrays & Strings', 'Linked Lists', 'Stacks & Queues',
            'Trees & Binary Trees', 'Binary Search Trees', 'Heaps & Priority Queues',
            'Hashing & Hash Maps', 'Graphs & BFS/DFS', 'Dynamic Programming',
            'Recursion & Backtracking', 'Sorting Algorithms', 'Binary Search',
            'Two Pointers & Sliding Window', 'Greedy Algorithms', 'Tries',
            'Segment Trees & BIT', 'Disjoint Set Union', 'Bit Manipulation'
        ],
        count: '1200+'
    },
    os: {
        name: 'Operating Systems',
        label: 'OS',
        icon: Cpu,
        symbol: '◈',
        title: 'Operating',
        accent: 'Systems',
        sub: 'Practice core OS concepts tested in system-level and backend engineering interviews.',
        subtopics: [
            'Processes & Threads', 'CPU Scheduling Algorithms', 'Process Synchronization',
            'Deadlocks & Prevention', 'Memory Management', 'Virtual Memory & Paging',
            'File Systems', 'I/O Management', 'Inter-Process Communication',
            'Semaphores & Mutexes', 'Context Switching', 'Kernel vs User Space'
        ],
        count: '150+'
    },
    dbms: {
        name: 'DBMS & SQL',
        label: 'DBMS',
        icon: Database,
        symbol: '◉',
        title: 'DBMS &',
        accent: 'SQL',
        sub: 'Master database internals, query writing, and design principles for backend and data roles.',
        subtopics: [
            'ER Diagrams & Modeling', 'Normalization (1NF–BCNF)', 'SQL Joins & Subqueries',
            'Indexes & Query Optimization', 'Transactions & ACID', 'Concurrency Control',
            'Locking & Isolation Levels', 'Stored Procedures & Triggers', 'NoSQL vs SQL',
            'MongoDB & Document Stores', 'Partitioning & Sharding', 'Views & Materialized Views'
        ],
        count: '200+'
    },
    sd: {
        name: 'System Design',
        label: 'System Design',
        icon: Layers,
        symbol: '◎',
        title: 'System',
        accent: 'Design',
        sub: 'Practice HLD and LLD concepts critical for senior and staff engineering interviews.',
        subtopics: [
            'Scalability Principles', 'Load Balancing', 'Caching Strategies',
            'Database Design Patterns', 'Message Queues & Kafka', 'Microservices Architecture',
            'API Design & REST', 'Rate Limiting & Throttling', 'CDN & Edge Computing',
            'Consistent Hashing', 'CAP Theorem & BASE', 'Designing Real Systems'
        ],
        count: '85+'
    },
    cn: {
        name: 'Computer Networks',
        label: 'Networks',
        icon: Globe,
        symbol: '◐',
        title: 'Computer',
        accent: 'Networks',
        sub: 'Deep-dive into networking concepts tested in software and infrastructure interviews.',
        subtopics: [
            'OSI Model & Layers', 'TCP/IP & UDP', 'HTTP & HTTPS',
            'DNS & DHCP', 'IP Addressing & Subnetting', 'Routing Protocols',
            'Firewalls & NAT', 'TLS/SSL & Encryption', 'WebSockets & Long Polling',
            'REST vs gRPC vs GraphQL', 'CDN & Proxy Servers', 'Network Security'
        ],
        count: '110+'
    }
};

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed'];
const COUNTS = [5, 10, 20];

export default function StrategicPracticeVault() {
    // --- App Level State ---
    const [currentTopicKey, setCurrentTopicKey] = useState('dsa');
    const [checkedSubtopics, setCheckedSubtopics] = useState<Record<string, Set<string>>>(() => {
        const initial: Record<string, Set<string>> = {};
        Object.keys(TOPICS).forEach(k => initial[k] = new Set());
        return initial;
    });

    const [selectedDiff, setSelectedDiff] = useState('Easy');
    const [selectedCount, setSelectedCount] = useState(10);
    const [view, setView] = useState<'config' | 'quiz' | 'score'>('config');

    // --- Quiz Data ---
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [sessionScore, setSessionScore] = useState(0);
    const [loading, setLoading] = useState(false);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [subtopicScores, setSubtopicScores] = useState<Record<string, { correct: number, total: number }>>({});

    // --- Cumulative Session Stats (Sidebar) ---
    const [stats, setStats] = useState({
        answered: 0,
        correct: 0,
        wrong: 0,
        accuracy: 0
    });

    // --- Helpers ---
    const toggleSubtopic = (topicKey: string, name: string) => {
        const newChecked = { ...checkedSubtopics };
        const set = new Set(newChecked[topicKey]);
        if (set.has(name)) set.delete(name);
        else set.add(name);
        newChecked[topicKey] = set;
        setCheckedSubtopics(newChecked);
    };

    const selectAll = () => {
        const newChecked = { ...checkedSubtopics };
        newChecked[currentTopicKey] = new Set(TOPICS[currentTopicKey].subtopics);
        setCheckedSubtopics(newChecked);
    };

    const selectNone = () => {
        const newChecked = { ...checkedSubtopics };
        newChecked[currentTopicKey] = new Set();
        setCheckedSubtopics(newChecked);
    };

    const generateQuestions = async () => {
        const selected = Array.from(checkedSubtopics[currentTopicKey]);
        if (selected.length === 0) {
            toast.error('Level 1 Alert: Select at least one subtopic to continue.');
            return;
        }

        setLoading(true);
        setView('quiz');
        setQuestions([]);
        setCurrentIdx(0);
        setSessionScore(0);
        setUserAnswers({});
        setSubtopicScores({});

        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate-questions',
                    topic: TOPICS[currentTopicKey].name,
                    difficulty: selectedDiff,
                    count: selectedCount,
                    subtopics: selected
                })
            });

            const data = await res.json();
            if (data.success && data.result) {
                setQuestions(data.result);
            } else {
                throw new Error(data.error || 'Failed to fetch');
            }
        } catch (error) {
            console.error(error);
            toast.error('Neural Link Error: Failed to generate question set.');
            setView('config');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (idx: number) => {
        if (userAnswers[currentIdx] !== undefined) return;

        const q = questions[currentIdx];
        const isCorrect = idx === q.answer;

        setUserAnswers(prev => ({ ...prev, [currentIdx]: idx }));

        const st = q.subtopic || 'General';
        setSubtopicScores(prev => {
            const current = prev[st] || { correct: 0, total: 0 };
            return {
                ...prev,
                [st]: {
                    correct: current.correct + (isCorrect ? 1 : 0),
                    total: current.total + 1
                }
            };
        });

        if (isCorrect) setSessionScore(s => s + 1);

        // Update overall session stats
        setStats(prev => {
            const newAnswered = prev.answered + 1;
            const newCorrect = prev.correct + (isCorrect ? 1 : 0);
            const newWrong = prev.wrong + (isCorrect ? 0 : 1);
            return {
                answered: newAnswered,
                correct: newCorrect,
                wrong: newWrong,
                accuracy: Math.round((newCorrect / newAnswered) * 100)
            };
        });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-[#e8e8f0] font-[family-name:var(--font-jetbrains-mono)] selection:bg-[#6c63ff]/30 overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(108,99,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(108,99,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px]" />
                <div className="absolute top-[-100px] right-[-100px] w-[420px] h-[420px] bg-[#6c63ff] opacity-10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-50px] left-[-80px] w-[320px] h-[320px] bg-[#ff6584] opacity-10 blur-[80px] rounded-full" />
            </div>

            {/* Header */}
            <header className="relative z-50 px-6 lg:px-9 py-4 border-b border-[#2a2a3a] bg-[#0a0a0f]/80 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-3 font-syne font-extrabold text-[#e8e8f0] text-sm tracking-tight uppercase">
                    <div className="w-7 h-7 bg-gradient-to-br from-[#6c63ff] to-[#ff6584] rounded-lg flex items-center justify-center text-xs">⚡</div>
                    Strategic Practice Vault
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden sm:block px-3 py-1 bg-[#111118] border border-[#2a2a3a] rounded-full text-[9px] font-black uppercase tracking-widest text-[#6b6b80]">AI-POWERED</div>
                    <div className="px-3 py-1 bg-[#111118] border border-[#2a2a3a] rounded-full text-[9px] font-black uppercase tracking-widest text-[#6b6b80]">
                        SESSION: <span className="text-[#6c63ff]">{stats.answered} Qs</span>
                    </div>
                </div>
            </header>

            <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-61px)]">
                {/* Sidebar Nav */}
                <aside className="w-full lg:w-[232px] border-b lg:border-r border-[#2a2a3a] bg-[#111118]/70 backdrop-blur-md flex flex-col py-4 lg:py-6 shrink-0">
                    <div className="px-5 mb-3 text-[9px] font-black uppercase tracking-[0.2em] text-[#6b6b80]">TOPIC_SELECTION</div>
                    <nav className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto px-4 lg:px-0 gap-1 lg:gap-0 no-scrollbar">
                        {Object.entries(TOPICS).map(([key, topic]) => (
                            <button
                                key={key}
                                onClick={() => {
                                    setCurrentTopicKey(key);
                                    if (view !== 'config') setView('config');
                                }}
                                className={`flex items-center gap-3 px-5 py-3.5 border-b-[3px] lg:border-b-0 lg:border-l-[3px] transition-all text-[11px] font-bold group shrink-0 ${currentTopicKey === key
                                        ? 'bg-[#6c63ff]/10 border-[#6c63ff] text-[#e8e8f0]'
                                        : 'border-transparent text-[#6b6b80] hover:bg-[#6c63ff]/5 hover:text-[#e8e8f0]'
                                    }`}
                            >
                                <topic.icon size={14} className={currentTopicKey === key ? 'text-[#6c63ff]' : 'text-[#6b6b80] group-hover:text-[#e8e8f0]'} />
                                <span className="flex-1 text-left line-clamp-1 uppercase tracking-tight">{key.toUpperCase()}</span>
                                {checkedSubtopics[key].size > 0 && (
                                    <span className="text-[9px] font-black text-[#6c63ff]">{checkedSubtopics[key].size}✓</span>
                                )}
                                <span className="hidden sm:inline text-[8px] font-black px-1.5 py-0.5 bg-[#1a1a24] rounded text-[#6b6b80]">{topic.count}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="hidden lg:block px-5 pt-6 border-t border-[#2a2a3a] mt-auto">
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b6b80] mb-4">SESSION_METRICS</div>
                        <div className="space-y-1">
                            <MetricRow label="Answered" value={stats.answered} />
                            <MetricRow label="Correct" value={stats.correct} color="text-[#43e97b]" />
                            <MetricRow label="Wrong" value={stats.wrong} color="text-[#ff6584]" />
                            <MetricRow label="Accuracy" value={stats.answered > 0 ? `${stats.accuracy}%` : "—"} />
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 py-10 px-4 lg:px-12 max-w-[840px] mx-auto w-full">
                    <AnimatePresence mode="wait">
                        {view === 'config' && (
                            <motion.div
                                key="config"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-10"
                            >
                                <div className="space-y-3">
                                    <h1 className="font-syne text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight uppercase">
                                        {TOPICS[currentTopicKey].title} <br />
                                        <span className="text-[#6c63ff]">{TOPICS[currentTopicKey].accent}</span>
                                    </h1>
                                    <p className="text-[#6b6b80] text-sm font-medium max-w-2xl leading-relaxed">
                                        {TOPICS[currentTopicKey].sub}
                                    </p>
                                </div>

                                <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6 lg:p-8 relative overflow-hidden">
                                     <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#6c63ff] to-transparent opacity-30" />
                                    
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-2.5 font-syne font-bold text-xs uppercase tracking-tight">
                                            <span className="text-xl leading-none text-[#6c63ff] font-syne">{TOPICS[currentTopicKey].symbol}</span>
                                            {TOPICS[currentTopicKey].label} SUBTOPICS
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <button onClick={selectAll} className="text-[10px] font-black text-[#6c63ff] uppercase hover:opacity-70 transition-opacity tracking-widest">Select All</button>
                                            <div className="w-[1px] h-3 bg-[#2a2a3a]" />
                                            <button onClick={selectNone} className="text-[10px] font-black text-[#6c63ff] uppercase hover:opacity-70 transition-opacity tracking-widest">Clear</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {TOPICS[currentTopicKey].subtopics.map((st) => {
                                            const isChecked = checkedSubtopics[currentTopicKey].has(st);
                                            return (
                                                <button
                                                    key={st}
                                                    onClick={() => toggleSubtopic(currentTopicKey, st)}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left group ${isChecked
                                                            ? 'bg-[#6c63ff]/10 border-[#6c63ff] text-[#e8e8f0]'
                                                            : 'bg-[#1a1a24] border-[#2a2a3a] text-[#6b6b80] hover:border-[#6c63ff] hover:text-[#e8e8f0]'
                                                        }`}
                                                >
                                                    <div className={`w-4 h-4 border rounded flex items-center justify-center text-[9px] transition-all shrink-0 ${isChecked ? 'bg-[#6c63ff] border-[#6c63ff] text-white' : 'border-[#2a2a3a] bg-transparent group-hover:border-[#6c63ff]'}`}>
                                                        {isChecked && "✓"}
                                                    </div>
                                                    <span className="text-[11px] font-bold line-clamp-1">{st}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-[#6b6b80] uppercase tracking-widest">
                                        <div className={`w-2 h-2 rounded-full ${checkedSubtopics[currentTopicKey].size > 0 ? 'bg-[#6c63ff] shadow-[0_0_8px_#6c63ff]' : 'bg-[#2a2a3a]'}`} />
                                        <span>{checkedSubtopics[currentTopicKey].size} SUBTOPICS SELECTED</span>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b6b80] flex items-center gap-2">
                                            <Target size={12} strokeWidth={3} /> Difficulty
                                        </div>
                                        <div className="flex gap-2">
                                            {DIFFICULTIES.map(d => (
                                                <button
                                                    key={d}
                                                    onClick={() => setSelectedDiff(d)}
                                                    className={`flex-1 px-3 py-2.5 rounded-lg border transition-all text-[11px] font-bold ${selectedDiff === d
                                                            ? getDiffClasses(d)
                                                            : 'bg-[#111118] border-[#2a2a3a] text-[#6b6b80] hover:text-[#e8e8f0] hover:border-[#6b6b80]'
                                                        }`}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b6b80] flex items-center gap-2">
                                            <BookOpen size={12} strokeWidth={3} /> Question Count
                                        </div>
                                        <div className="flex gap-2">
                                            {COUNTS.map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setSelectedCount(c)}
                                                    className={`flex-1 px-4 py-2.5 rounded-lg border transition-all text-[11px] font-bold ${selectedCount === c
                                                            ? 'bg-[#6c63ff]/10 border-[#6c63ff] text-[#6c63ff]'
                                                            : 'bg-[#111118] border-[#2a2a3a] text-[#6b6b80] hover:text-[#e8e8f0] hover:border-[#6b6b80]'
                                                        }`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={generateQuestions}
                                    disabled={loading}
                                    className="group relative w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-br from-[#6c63ff] to-[#9b59b6] rounded-2xl text-white font-syne font-extrabold text-[14px] tracking-tight uppercase hover:translate-y-[-2px] hover:shadow-[0_12px_40px_rgba(108,99,255,0.4)] transition-all active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-2xl"
                                >
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Zap size={18} fill="currentColor" />
                                    <span>Sync with Intelligence Vault</span>
                                </button>
                            </motion.div>
                        )}

                        {view === 'quiz' && (
                            <motion.div
                                key="quiz"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="space-y-8"
                            >
                                {loading ? (
                                    <div className="py-32 flex flex-col items-center justify-center space-y-8">
                                        <div className="relative">
                                             <div className="w-16 h-16 border-2 border-[#2a2a3a] border-t-[#6c63ff] rounded-full animate-spin" />
                                             <Zap className="absolute inset-0 m-auto text-[#6c63ff] animate-pulse" size={20} />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-[#e8e8f0] font-syne font-extrabold text-lg tracking-tight uppercase">Querying Intelligence...</p>
                                            <p className="text-[#6b6b80] text-[10px] uppercase tracking-[0.3em] font-black animate-pulse">Establishing Groq // Neural // Link</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="text-[10px] font-black tracking-widest uppercase text-[#6b6b80]">
                                                    UNIT <span className="text-[#6c63ff]">{currentIdx + 1}</span> // {questions.length}
                                                </div>
                                                <div className="flex items-center gap-6 text-[10px] font-black tracking-widest uppercase text-[#6b6b80]">
                                                     <span>SYSTEM_DS: <span className="text-[#6c63ff]">{TOPICS[currentTopicKey].label}</span></span>
                                                    <div className="w-[1px] h-3 bg-[#2a2a3a]" />
                                                    <span>Neutralized: <span className="text-[#43e97b]">{sessionScore}</span></span>
                                                </div>
                                            </div>

                                            <div className="w-full h-1.5 bg-[#1a1a24] rounded-full overflow-hidden shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${((currentIdx + (userAnswers[currentIdx] !== undefined ? 1 : 0)) / questions.length) * 100}%` }}
                                                    className="h-full bg-gradient-to-r from-[#6c63ff] to-[#ff6584] shadow-[0_0_10px_rgba(108,99,255,0.5)]"
                                                />
                                            </div>
                                        </div>

                                        {questions[currentIdx] && (
                                            <div className="relative group">
                                                <div className="absolute -inset-1 bg-gradient-to-r from-[#6c63ff] to-[#ff6584] rounded-[2.5rem] opacity-0 group-hover:opacity-10 blur-2xl transition-all duration-700" />
                                                <div className="relative bg-[#111118] border border-[#2a2a3a] rounded-[2rem] p-8 lg:p-12 border-t-4 border-t-[#6c63ff] shadow-2xl">
                                                    <div className="flex items-center gap-3 mb-10">
                                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5 shadow-sm ${getDiffTextClasses(questions[currentIdx].difficulty)}`}>
                                                            {questions[currentIdx].difficulty}
                                                        </span>
                                                        <span className="px-2.5 py-1 bg-[#1a1a24] rounded-lg text-[9px] font-black uppercase tracking-widest text-[#6c63ff] border border-[#6c63ff]/20">
                                                            {questions[currentIdx].subtopic}
                                                        </span>
                                                    </div>

                                                    <h2 className="font-syne text-xl lg:text-2xl font-extrabold leading-tight mb-12 tracking-tight">
                                                        {questions[currentIdx].question}
                                                    </h2>

                                                    <div className="space-y-3.5 mb-10">
                                                        {questions[currentIdx].options.map((opt: string, i: number) => {
                                                            const isSelected = userAnswers[currentIdx] === i;
                                                            const isCorrect = questions[currentIdx].answer === i;
                                                            const hasAnswered = userAnswers[currentIdx] !== undefined;

                                                            let borderClass = 'border-[#2a2a3a]';
                                                            let bgClass = 'bg-[#1a1a24] hover:border-[#6c63ff] hover:bg-[#6c63ff]/5';
                                                            let keyClass = 'border-[#2a2a3a] text-[#6b6b80]';

                                                            if (hasAnswered) {
                                                                if (isCorrect) {
                                                                    borderClass = 'border-[#43e97b]';
                                                                    bgClass = 'bg-[#43e97b]/10';
                                                                    keyClass = 'bg-[#43e97b] border-[#43e97b] text-[#0a0a0f]';
                                                                } else if (isSelected) {
                                                                    borderClass = 'border-[#ff6584]';
                                                                    bgClass = 'bg-[#ff6584]/10';
                                                                    keyClass = 'bg-[#ff6584] border-[#ff6584] text-white';
                                                                } else {
                                                                    bgClass = 'bg-[#1a1a24] opacity-30';
                                                                    borderClass = 'border-[#2a2a3a] opacity-30';
                                                                }
                                                            } else if (isSelected) {
                                                                borderClass = 'border-[#6c63ff]';
                                                                bgClass = 'bg-[#6c63ff]/10';
                                                                keyClass = 'bg-[#6c63ff] border-[#6c63ff] text-white';
                                                            }

                                                            return (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => handleAnswer(i)}
                                                                    disabled={hasAnswered}
                                                                    className={`w-full flex items-center gap-5 px-5 py-4.5 rounded-2xl border transition-all text-left group/opt ${borderClass} ${bgClass}`}
                                                                >
                                                                    <div className={`w-7 h-7 rounded-xl border flex items-center justify-center text-[11px] font-black transition-all shrink-0 ${keyClass}`}>
                                                                        {['A', 'B', 'C', 'D'][i]}
                                                                    </div>
                                                                    <span className="text-[14px] font-bold tracking-tight">{opt}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    <AnimatePresence>
                                                        {userAnswers[currentIdx] !== undefined && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                className="pt-10 border-t border-[#2a2a3a] space-y-4"
                                                            >
                                                                <div className="flex items-center gap-3 text-[10px] font-black text-[#43e97b] uppercase tracking-[0.2em]">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#43e97b]" />
                                                                    INTELLIGENCE_ANALYSIS
                                                                </div>
                                                                <div className="px-6 py-5 bg-[#0a0a0f] border border-[#2a2a3a] rounded-2xl shadow-inner">
                                                                    <p className="text-[13px] leading-relaxed text-[#6b6b80] italic font-medium">
                                                                        {questions[currentIdx].explanation}
                                                                    </p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-6">
                                            <button
                                                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                                                disabled={currentIdx === 0}
                                                className="flex items-center gap-2 px-8 py-3 bg-[#111118] border border-[#2a2a3a] rounded-xl text-[#6b6b80] font-black text-[10px] uppercase tracking-widest hover:text-white hover:border-[#6b6b80] transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                                            >
                                                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                                            </button>

                                            {userAnswers[currentIdx] !== undefined && (
                                                <button
                                                    onClick={() => {
                                                        if (currentIdx < questions.length - 1) {
                                                            setCurrentIdx(prev => prev + 1);
                                                        } else {
                                                            setView('score');
                                                        }
                                                    }}
                                                    className="flex items-center gap-3 px-10 py-4 bg-[#6c63ff] rounded-xl text-white font-syne font-extrabold text-[12px] uppercase tracking-wide hover:bg-[#7c74ff] transition-all shadow-[0_8px_30px_rgba(108,99,255,0.3)] group active:scale-95"
                                                >
                                                    {currentIdx < questions.length - 1 ? (
                                                        <>NExt UNIT <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                                    ) : (
                                                        <>COMPLETE_SESSION <CheckCircle2 size={18} /></>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {view === 'score' && (
                            <motion.div
                                key="score"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-10"
                            >
                                <div className="bg-[#111118] border border-[#2a2a3a] rounded-[2.5rem] p-10 lg:p-16 text-center relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 p-12 text-[#6c63ff] pointer-events-none opacity-5">
                                        <Trophy size={180} strokeWidth={1} />
                                    </div>

                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="mb-10 relative flex items-center justify-center">
                                            <div className="w-32 h-32 rounded-full border-[6px] border-[#2a2a3a] flex items-center justify-center relative shadow-2xl shadow-black/50">
                                                <svg className="absolute -inset-[6px] w-[140px] h-[140px] -rotate-90">
                                                    <circle
                                                        cx="70" cy="70" r="64"
                                                        fill="none" stroke="currentColor" strokeWidth="6"
                                                        className="text-[#6c63ff]"
                                                        strokeDasharray={2 * Math.PI * 64}
                                                        strokeDashoffset={2 * Math.PI * 64 * (1 - sessionScore / questions.length)}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <span className="font-syne font-black text-3xl text-[#e8e8f0]">
                                                    {Math.round((sessionScore / questions.length) * 100)}%
                                                </span>
                                            </div>
                                        </div>

                                        <h2 className="font-syne text-3xl font-black tracking-tight uppercase mb-3">
                                            {sessionScore / questions.length >= 0.8 ? "🏆 LEGENDARY_Neutralizer" :
                                                sessionScore / questions.length >= 0.6 ? "👍 STRATEGIC_ASSET" : "📚 KNOWLEDGE_EXPANSION_REQ"}
                                        </h2>
                                        <p className="text-[#6b6b80] text-sm font-bold uppercase tracking-widest mb-12 opacity-80">
                                            {sessionScore} / {questions.length} TARGETS SECURED CORRECTLY
                                        </p>

                                        <div className="w-full grid grid-cols-3 border border-[#2a2a3a] rounded-2xl overflow-hidden mb-12 shadow-inner">
                                            <ScoreMetric label="CORRECT" value={sessionScore} color="text-[#43e97b]" />
                                            <ScoreMetric label="MISSED" value={questions.length - sessionScore} color="text-[#ff6584]" />
                                            <ScoreMetric label="ACCURACY" value={`${Math.round((sessionScore / questions.length) * 100)}%`} color="text-[#6c63ff]" />
                                        </div>

                                        <div className="w-full text-left space-y-6 mb-12">
                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6b6b80] flex items-center gap-3">
                                                <div className="flex-1 h-[1px] bg-[#2a2a3a]" />
                                                SUBTOPIC_NEURAL_MAPPING
                                                <div className="flex-1 h-[1px] bg-[#2a2a3a]" />
                                            </div>
                                            <div className="space-y-4">
                                                {Object.entries(subtopicScores).map(([name, s]) => {
                                                    const p = Math.round((s.correct / s.total) * 100);
                                                    return (
                                                        <div key={name} className="flex items-center gap-6">
                                                            <span className="flex-1 text-[12px] font-bold text-[#e8e8f0] line-clamp-1">{name}</span>
                                                            <div className="w-40 h-2 bg-[#0a0a0f] border border-[#2a2a3a] rounded-full overflow-hidden shrink-0">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${p}%` }}
                                                                    className={`h-full rounded-full transition-colors ${p >= 80 ? 'bg-[#43e97b]' : p >= 50 ? 'bg-orange-400' : 'bg-[#ff6584]'}`}
                                                                />
                                                            </div>
                                                            <span className="text-[11px] font-black min-w-[50px] text-right">
                                                                <span className={p >= 80 ? 'text-[#43e97b]' : p >= 50 ? 'text-orange-400' : 'text-[#ff6584]'}>{p}%</span>
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                                            <button
                                                onClick={() => setView('config')}
                                                className="flex-1 px-8 py-4 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl text-[#6b6b80] font-black text-[11px] tracking-[0.2em] uppercase hover:text-white hover:border-[#6b6b80] transition-all flex items-center justify-center gap-2"
                                            >
                                                <ChevronLeft size={14} /> Back to Config
                                            </button>
                                            <button
                                                onClick={generateQuestions}
                                                className="flex-1 px-8 py-4 bg-gradient-to-r from-[#6c63ff] to-[#7c74ff] rounded-xl text-white font-syne font-extrabold text-[12px] tracking-wide uppercase hover:scale-[1.02] transition-transform shadow-[0_8px_30px_rgba(108,99,255,0.4)] flex items-center justify-center gap-2"
                                            >
                                                <RotateCcw size={14} /> Tactical Restart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

// --- Helper Components ---

function MetricRow({ label, value, color = "text-[#e8e8f0]" }: { label: string, value: string | number, color?: string }) {
    return (
        <div className="flex justify-between items-center py-2.5 border-b border-[#2a2a3a]/50 last:border-0 group/metric">
            <span className="text-[10px] font-black text-[#6b6b80] uppercase tracking-wider group-hover/metric:text-[#e8e8f0] transition-colors">{label}</span>
            <span className={`text-[12px] font-black ${color}`}>{value}</span>
        </div>
    );
}

function ScoreMetric({ label, value, color = "text-[#e8e8f0]" }: { label: string, value: string | number, color?: string }) {
    return (
        <div className="flex flex-col p-6 border-r border-[#2a2a3a] last:border-r-0 bg-[#0a0a0f]/30">
            <span className={`text-2xl font-syne font-black mb-1 ${color}`}>{value}</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b6b80]">{label}</span>
        </div>
    );
}

function getDiffClasses(diff: string) {
    switch (diff) {
        case 'Easy': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
        case 'Medium': return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
        case 'Hard': return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
        default: return 'bg-[#6c63ff]/10 border-[#6c63ff]/30 text-[#6c63ff]';
    }
}

function getDiffTextClasses(diff: string) {
    switch (diff) {
        case 'Easy': return 'text-emerald-400';
        case 'Medium': return 'text-orange-400';
        case 'Hard': return 'text-rose-400';
        default: return 'text-[#6c63ff]';
    }
}

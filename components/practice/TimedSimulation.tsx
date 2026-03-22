'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Target,
    Trophy,
    Clock,
    Brain,
    ArrowLeft,
    ChevronRight,
    Search,
    Building2,
    Activity,
    Dna,
    BarChart3,
    ShieldAlert,
    Terminal,
    CheckCircle2,
    XCircle,
    RotateCcw,
    ChevronLeft,
    Briefcase,
    TrendingUp,
    MapPin,
    ArrowUpRight,
    Quote,
    MessageSquare,
    Star,
    Plus,
    ShieldCheck,
    Layout,
    ExternalLink,
    ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

/* ═══════════════════════════════
   DATA & TYPES
═══════════════════════════════ */

interface Company {
    id: string;
    name: string;
    slug: string;
    logo_url: string;
    industry: string;
    hq?: string;
    verified?: boolean;
    description?: string;
    specialties?: string;
    website?: string;
}

const TOPICS: Record<string, any> = {
    dsa: {
        name: 'Data Structures & Algorithms',
        ico: '⬡',
        count: '1200+',
        tags: ['Arrays', 'DP', 'Graphs'],
        subtopics: ['Arrays & Strings', 'Linked Lists', 'Stacks & Queues', 'Trees & Binary Trees', 'Binary Search Trees', 'Heaps & Priority Queues', 'Hashing & Hash Maps', 'Graphs & BFS/DFS', 'Dynamic Programming', 'Recursion & Backtracking', 'Sorting Algorithms', 'Binary Search', 'Two Pointers & Sliding Window', 'Greedy Algorithms', 'Tries', 'Segment Trees & BIT', 'Disjoint Set Union', 'Bit Manipulation']
    },
    os: {
        name: 'Operating Systems',
        ico: '◈',
        count: '150+',
        tags: ['Processes', 'Memory', 'Deadlocks'],
        subtopics: ['Processes & Threads', 'CPU Scheduling Algorithms', 'Process Synchronization', 'Deadlocks & Prevention', 'Memory Management', 'Virtual Memory & Paging', 'File Systems', 'I/O Management', 'Inter-Process Communication', 'Semaphores & Mutexes', 'Context Switching', 'Kernel vs User Space']
    },
    dbms: {
        name: 'DBMS & SQL',
        ico: '◉',
        count: '200+',
        tags: ['SQL', 'Normalization', 'Indexes'],
        subtopics: ['ER Diagrams & Modeling', 'Normalization (1NF–BCNF)', 'SQL Joins & Subqueries', 'Indexes & Query Optimization', 'Transactions & ACID', 'Concurrency Control', 'Locking & Isolation Levels', 'Stored Procedures & Triggers', 'NoSQL vs SQL', 'MongoDB & Document Stores', 'Partitioning & Sharding', 'Views & Materialized Views']
    },
    sd: {
        name: 'System Design',
        ico: '◎',
        count: '85+',
        tags: ['HLD', 'LLD', 'Scalability'],
        subtopics: ['Scalability Principles', 'Load Balancing', 'Caching Strategies', 'Database Design Patterns', 'Message Queues & Kafka', 'Microservices Architecture', 'API Design & REST', 'Rate Limiting & Throttling', 'CDN & Edge Computing', 'Consistent Hashing', 'CAP Theorem & BASE', 'Designing Real Systems']
    },
    cn: {
        name: 'Computer Networks',
        ico: '◐',
        count: '110+',
        tags: ['TCP/IP', 'HTTP', 'DNS'],
        subtopics: ['OSI Model & Layers', 'TCP/IP & UDP', 'HTTP & HTTPS', 'DNS & DHCP', 'IP Addressing & Subnetting', 'Routing Protocols', 'Firewalls & NAT', 'TLS/SSL & Encryption', 'WebSockets & Long Polling', 'REST vs gRPC vs GraphQL', 'CDN & Proxy Servers', 'Network Security']
    },
};

export default function TimedSimulation() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialCompanySlug = searchParams.get('company');
    const initialTopicKey = searchParams.get('topic');

    const [simMode, setSimMode] = useState<'company' | 'topic'>('company');
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [selCompany, setSelCompany] = useState<Company | null>(null);
    const [selTopicKey, setSelTopicKey] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [checkedChips, setCheckedChips] = useState<Set<string>>(new Set());

    const [selFmt, setSelFmt] = useState<'coding' | 'mcq' | 'mixed'>('coding');
    const [selDif, setSelDif] = useState<'Easy' | 'Medium' | 'Hard' | 'Mixed'>('Easy');
    const [selCnt, setSelCnt] = useState(10);
    const [selMin, setSelMin] = useState(30);

    const [gameState, setGameState] = useState<'landing' | 'loading' | 'exam' | 'results'>('landing');
    const [loadingTitle, setLoadingTitle] = useState('Building Simulation…');
    const [loadingSub, setLoadingSub] = useState('Generating tactical questions');

    const [questions, setQuestions] = useState<any[]>([]);
    const [userAns, setUserAns] = useState<any[]>([]);
    const [doneFlags, setDoneFlags] = useState<boolean[]>([]);
    const [curIdx, setCurIdx] = useState(0);

    const [secLeft, setSecLeft] = useState(0);
    const [totalSec, setTotalSec] = useState(0);
    const [isCounting, setIsCounting] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    /* ═══════════════════════════════
       INITIAL DATA FETCH
    ═══════════════════════════════ */
    useEffect(() => {
        const fetchCompanies = async () => {
            const { data } = await supabase
                .from('companies')
                .select('*')
                .order('name');
            setCompanies(data || []);
            setLoadingCompanies(false);

            if (initialCompanySlug && data) {
                const found = data.find(c => c.slug === initialCompanySlug);
                if (found) {
                    setSelCompany(found);
                    setSimMode('company');
                }
            }

            if (initialTopicKey && TOPICS[initialTopicKey.toLowerCase()]) {
                setSelTopicKey(initialTopicKey.toLowerCase());
                setSimMode('topic');
            }
        };
        fetchCompanies();
    }, [initialCompanySlug, initialTopicKey]);

    /* ═══════════════════════════════
       TIMER LOGIC
    ═══════════════════════════════ */
    useEffect(() => {
        if (isCounting && secLeft > 0) {
            timerRef.current = setInterval(() => {
                setSecLeft(prev => prev - 1);
            }, 1000);
        } else if (secLeft === 0 && isCounting) {
            setIsCounting(false);
            finishExam(true);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isCounting, secLeft]);

    const startTimer = (mins: number) => {
        const secs = mins * 60;
        setTotalSec(secs);
        setSecLeft(secs);
        setIsCounting(true);
    };

    /* ═══════════════════════════════
       SELECTION HANDLERS
    ═══════════════════════════════ */
    const toggleChip = (s: string) => {
        const newChips = new Set(checkedChips);
        if (newChips.has(s)) newChips.delete(s);
        else newChips.add(s);
        setCheckedChips(newChips);
    };

    const selAllChips = () => {
        if (selTopicKey) setCheckedChips(new Set(TOPICS[selTopicKey].subtopics));
    };

    const clearChips = () => setCheckedChips(new Set());

    /* ═══════════════════════════════
       SIMULATION START
    ═══════════════════════════════ */
    const startSim = async () => {
        if (simMode === 'company' && !selCompany) {
            toast.error('Select a company first.');
            return;
        }
        if (simMode === 'topic' && !selTopicKey) {
            toast.error('Select a topic first.');
            return;
        }

        setGameState('loading');
        const target = simMode === 'company' ? selCompany?.name : TOPICS[selTopicKey!].name;
        setLoadingTitle(`Building ${target} Simulation`);
        setLoadingSub(`Generating ${selCnt} ${selFmt} questions…`);

        try {
            const resp = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate-simulation',
                    topic: target,
                    mode: simMode,
                    format: selFmt,
                    difficulty: selDif,
                    count: selCnt,
                    subtopics: Array.from(checkedChips)
                })
            });

            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'Failed to generate questions');

            const generatedQuestions = data.questions || [];
            if (generatedQuestions.length === 0) {
              throw new Error('AI returned no questions. This usually happens when the topic is too niche or the provider is busy. Please try a different company or topic.');
            }

            setQuestions(generatedQuestions);
            setUserAns(new Array(generatedQuestions.length).fill(null));
            setDoneFlags(new Array(generatedQuestions.length).fill(false));
            setCurIdx(0);
            startTimer(selMin);
            setGameState('exam');
        } catch (err: any) {
            toast.error(err.message);
            setGameState('landing');
        }
    };

    /* ═══════════════════════════════
       EXAM INTERACTIONS
    ═══════════════════════════════ */
    const navQ = (idx: number) => {
        if (idx >= 0 && idx < questions.length) setCurIdx(idx);
    };

    const submitAnswer = (ans: any) => {
        const newUserAns = [...userAns];
        newUserAns[curIdx] = ans;
        setUserAns(newUserAns);

        const newDoneFlags = [...doneFlags];
        newDoneFlags[curIdx] = true;
        setDoneFlags(newDoneFlags);

        // Auto-advance if not last
        if (curIdx < questions.length - 1) {
            setTimeout(() => setCurIdx(prev => prev + 1), 500);
        }
    };

    const finishExam = (auto = false) => {
        setIsCounting(false);
        setShowSubmitModal(false);
        setGameState('results');
    };

    /* ═══════════════════════════════
       RESULT CALCULATIONS
    ═══════════════════════════════ */
    const calculateResults = () => {
        let correct = 0;
        let wrong = 0;
        let skipped = 0;

        questions.forEach((q, i) => {
            if (!doneFlags[i]) {
                skipped++;
            } else if (q.type === 'mcq') {
                if (userAns[i] === q.answer) correct++;
                else wrong++;
            } else {
                // For coding, we assume participation is "correct" for now in sim mode
                // or just mark as "Attempted"
                if (userAns[i]?.trim()) correct++;
                else skipped++;
            }
        });

        const pct = Math.round((correct / questions.length) * 100);
        const grade = pct >= 90 ? 'A+' : pct >= 75 ? 'A' : pct >= 60 ? 'B' : pct >= 45 ? 'C' : 'D';

        return { correct, wrong, skipped, pct, grade };
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    /* ═══════════════════════════════
       RENDER HELPERS
    ═══════════════════════════════ */
    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (gameState === 'loading') {
        return (
            <div className="fixed inset-0 z-[200] bg-[rgba(10,10,15,0.96)] backdrop-blur-2xl flex flex-col items-center justify-center gap-8">
                <div className="relative">
                    <div className="w-24 h-24 border-2 border-white/5 border-t-[var(--accent)] rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="text-[var(--accent)] animate-pulse" size={32} />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="font-syne text-3xl font-bold tracking-tight text-white">{loadingTitle}</h2>
                    <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">{loadingSub}</p>
                </div>
                <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            className="w-2 h-2 bg-[var(--accent)] rounded-full"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-gray-200 font-mono selection:bg-[var(--accent)]/30">
            {/* Background elements */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(108,99,255,0.05),transparent_70%)] pointer-events-none" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(108,99,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(108,99,255,0.02)_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none" />

            {/* Header */}
            <nav className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-black/80 backdrop-blur-xl z-[100] px-8 flex items-center justify-between">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => gameState === 'exam' ? (confirm('Exit simulation?') && setGameState('landing')) : setGameState('landing')}>
                    <div className="p-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg border border-[var(--accent)]/20 shadow-[0_0_20px_rgba(108,99,255,0.2)]">
                        <Terminal size={20} />
                    </div>
                    <div>
                        <span className="font-syne font-black text-white tracking-widest uppercase text-sm">Vault.Sim</span>
                        <div className="flex items-center gap-2 opacity-50 text-[10px] font-black uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" />
                            Tactical Interface v2.0
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {gameState === 'exam' && (
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-1">
                                {questions.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-4 h-4 rounded-sm border border-white/10 ${i === curIdx ? 'bg-white/20 border-white/40' : doneFlags[i] ? (questions[i].type === 'coding' ? 'bg-[var(--accent)]/40 border-[var(--accent)]' : (userAns[i] === questions[i].answer ? 'bg-green-500/40 border-green-500' : 'bg-red-500/40 border-red-500')) : 'bg-white/5'}`}
                                    />
                                ))}
                            </div>
                            <div className={`px-4 py-2 rounded-xl flex items-center gap-3 border ${secLeft < 60 ? 'border-red-500/50 bg-red-500/10 text-red-500 animate-pulse' : 'border-white/10 bg-white/5'}`}>
                                <Clock size={16} />
                                <span className="font-bold text-lg">{formatTime(secLeft)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <main className="pt-24 pb-20 px-8 relative z-10 min-h-screen">
                <AnimatePresence mode="wait">
                    {gameState === 'landing' && (
                        <motion.div
                            key="landing"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="max-w-6xl mx-auto space-y-12"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-[var(--accent)] text-[10px] font-black uppercase tracking-[0.3em]">
                                        <div className="h-px w-8 bg-[var(--accent)]" />
                                        Advanced Simulation Protocol
                                    </div>
                                    <h1 className="font-syne text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                                        REAL PRESSURE.<br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-purple-400">REAL RESULTS.</span>
                                    </h1>
                                    <p className="text-gray-500 max-w-xl text-sm font-medium leading-relaxed">
                                        Choose a company or technical domain to initiate a high-fidelity interview simulation. All sessions are timed and AI-proctored.
                                    </p>
                                </div>

                                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                                    <button
                                        onClick={() => setSimMode('company')}
                                        className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${simMode === 'company' ? 'bg-[var(--accent)] text-white shadow-[0_0_30px_rgba(108,99,255,0.3)]' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        🏢 Company
                                    </button>
                                    <button
                                        onClick={() => setSimMode('topic')}
                                        className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${simMode === 'topic' ? 'bg-[var(--accent)] text-white shadow-[0_0_30px_rgba(108,99,255,0.3)]' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        📚 Topic
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                <div className="lg:col-span-8 space-y-8">
                                    {simMode === 'company' ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-white/5 rounded-lg">
                                                        <Search size={18} className="text-gray-500" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="SEARCH_TACTICAL_DATASET..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="bg-transparent border-none outline-none font-black uppercase tracking-widest text-xs w-64 placeholder:opacity-30"
                                                    />
                                                </div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                    Found <span className="text-white">{filteredCompanies.length}</span> Assets
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {filteredCompanies.map(c => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => setSelCompany(c)}
                                                        className={`p-6 rounded-2xl border text-left transition-all group relative overflow-hidden ${selCompany?.id === c.id ? 'bg-[var(--accent)]/10 border-[var(--accent)] shadow-[0_0_40px_rgba(108,99,255,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                                    >
                                                        <div className={`absolute top-0 left-0 right-0 h-1 bg-[var(--accent)] transition-transform duration-500 ${selCompany?.id === c.id ? 'translate-y-0' : '-translate-y-full'}`} />
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="w-12 h-12 rounded-xl bg-white/5 p-2 border border-white/5 group-hover:scale-110 transition-transform">
                                                                <img src={c.logo_url} alt="" className="w-full h-full object-contain filter grayscale invert brightness-200" />
                                                            </div>
                                                            {c.verified && <ShieldCheck size={14} className="text-[var(--accent)]" />}
                                                        </div>
                                                        <div className="font-syne font-black text-white uppercase tracking-tight text-lg mb-1">{c.name}</div>
                                                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{c.industry || 'Tech Sector'}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {Object.entries(TOPICS).map(([key, t]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => { setSelTopicKey(key); setCheckedChips(new Set()); }}
                                                        className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden ${selTopicKey === key ? 'bg-[var(--accent)]/10 border-[var(--accent)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                                    >
                                                        <div className="text-3xl mb-4">{t.ico}</div>
                                                        <div className="font-syne font-black text-white uppercase tracking-tight text-lg mb-1">{t.name}</div>
                                                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{t.count} Specialized Modules</div>
                                                    </button>
                                                ))}
                                            </div>

                                            {selTopicKey && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-white/5 border border-white/5 rounded-[2rem] p-8 space-y-6"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                                                                <Layers size={18} />
                                                            </div>
                                                            <h3 className="font-syne font-black text-white uppercase tracking-widest text-sm">Target Subtopics</h3>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <button onClick={selAllChips} className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] hover:underline">Select All</button>
                                                            <button onClick={clearChips} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white">Clear</button>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {TOPICS[selTopicKey].subtopics.map((s: string) => {
                                                            const active = checkedChips.has(s);
                                                            return (
                                                                <button
                                                                    key={s}
                                                                    onClick={() => toggleChip(s)}
                                                                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${active ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}
                                                                >
                                                                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${active ? 'bg-white text-[var(--accent)] border-white' : 'border-white/10'}`}>
                                                                        {active && <Check size={10} />}
                                                                    </div>
                                                                    <span className="text-[11px] font-bold uppercase tracking-tight">{s}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="lg:col-span-4 space-y-6">
                                    <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-8 sticky top-24">
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Selection Preview</label>
                                                {simMode === 'company' && selCompany ? (
                                                    <div className="p-6 bg-black border border-[var(--accent)]/30 rounded-2xl flex items-center gap-4">
                                                        <div className="w-12 h-12 p-2 bg-white/5 rounded-xl border border-white/10">
                                                            <img src={selCompany.logo_url} alt="" className="w-full h-full object-contain filter grayscale invert brightness-200" />
                                                        </div>
                                                        <div>
                                                            <div className="font-syne font-bold text-white uppercase">{selCompany.name}</div>
                                                            <div className="text-[10px] text-[var(--accent)] font-black uppercase tracking-widest">Tactical Target</div>
                                                        </div>
                                                    </div>
                                                ) : simMode === 'topic' && selTopicKey ? (
                                                    <div className="p-6 bg-black border border-[var(--accent)]/30 rounded-2xl flex items-center gap-4">
                                                        <div className="text-2xl">{TOPICS[selTopicKey].ico}</div>
                                                        <div>
                                                            <div className="font-syne font-bold text-white uppercase">{TOPICS[selTopicKey].name}</div>
                                                            <div className="text-[10px] text-[var(--accent)] font-black uppercase tracking-widest">{checkedChips.size} Modules Selected</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-8 border border-white/5 border-dashed rounded-2xl text-center text-gray-600">
                                                        <Target size={24} className="mx-auto mb-2 opacity-20" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Objective</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Config Parameters</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="bg-black/50 p-2 rounded-xl border border-white/5">
                                                            <div className="text-[8px] font-black text-gray-600 uppercase mb-1">Format</div>
                                                            <select
                                                                value={selFmt}
                                                                onChange={(e: any) => setSelFmt(e.target.value)}
                                                                className="bg-transparent text-white font-bold text-[10px] uppercase outline-none w-full appearance-none cursor-pointer"
                                                            >
                                                                <option value="coding">{'{ }'} Coding</option>
                                                                <option value="mcq">⬜ MCQ</option>
                                                                <option value="mixed">⚡ Mixed</option>
                                                            </select>
                                                        </div>
                                                        <div className="bg-black/50 p-2 rounded-xl border border-white/5">
                                                            <div className="text-[8px] font-black text-gray-600 uppercase mb-1">Difficulty</div>
                                                            <select
                                                                value={selDif}
                                                                onChange={(e: any) => setSelDif(e.target.value)}
                                                                className="bg-transparent text-white font-bold text-[10px] uppercase outline-none w-full appearance-none cursor-pointer"
                                                            >
                                                                <option value="Easy">Easy</option>
                                                                <option value="Medium">Medium</option>
                                                                <option value="Hard">Hard</option>
                                                                <option value="Mixed">Mixed</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-2">
                                                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-600">Quest_Count</label>
                                                        <div className="flex gap-1">
                                                            {[5, 10, 15].map(v => (
                                                                <button
                                                                    key={v}
                                                                    onClick={() => setSelCnt(v)}
                                                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black border transition-all ${selCnt === v ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-black border-white/5 text-gray-500'}`}
                                                                >
                                                                    {v}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-600">Sim_Limit</label>
                                                        <div className="flex gap-1">
                                                            {[15, 30, 60].map(v => (
                                                                <button
                                                                    key={v}
                                                                    onClick={() => setSelMin(v)}
                                                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black border transition-all ${selMin === v ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-black border-white/5 text-gray-500'}`}
                                                                >
                                                                    {v}m
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={startSim}
                                            disabled={simMode === 'company' ? !selCompany : !selTopicKey}
                                            className="w-full py-5 bg-[var(--accent)] text-white font-black uppercase text-xs tracking-[.2em] rounded-2xl shadow-[0_0_50px_rgba(108,99,255,0.3)] hover:scale-[1.02] disabled:opacity-30 disabled:hover:scale-100 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Zap size={16} fill="white" />
                                            Initialize Simulation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'exam' && (
                        <motion.div
                            key="exam"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12"
                        >
                            <div className="lg:col-span-8 space-y-8">
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Question_{curIdx + 1}</div>
                                            <div className="h-px w-8 bg-white/10" />
                                            <div className={`text-[10px] font-black uppercase tracking-widest ${questions[curIdx].difficulty === 'Hard' ? 'text-red-400' : questions[curIdx].difficulty === 'Medium' ? 'text-amber-400' : 'text-green-400'}`}>
                                                {questions[curIdx].difficulty}
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            {questions[curIdx].topic}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="font-syne text-3xl font-bold tracking-tight text-white leading-tight">
                                            {questions[curIdx].type === 'mcq' ? questions[curIdx].question : questions[curIdx].title}
                                        </h2>
                                        <div className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                                            {questions[curIdx].description || ''}
                                        </div>

                                        {questions[curIdx].type === 'coding' && questions[curIdx].examples && (
                                            <div className="space-y-4">
                                                {questions[curIdx].examples.map((ex: any, i: number) => (
                                                    <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 font-mono text-xs">
                                                        <div className="text-gray-500 uppercase font-black tracking-widest mb-3">Example_{i + 1}</div>
                                                        <div className="space-y-2">
                                                            <div className="flex gap-4"><span className="text-[var(--accent)]">Input:</span> {ex.input}</div>
                                                            <div className="flex gap-4"><span className="text-[var(--accent)]">Output:</span> {ex.output}</div>
                                                            {ex.explanation && <div className="flex gap-4 text-gray-500"><span className="text-gray-600">Explain:</span> {ex.explanation}</div>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="pt-8">
                                            {questions[curIdx].type === 'mcq' ? (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {(questions[curIdx].options || []).map((opt: string, i: number) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => !doneFlags[curIdx] && submitAnswer(i)}
                                                            className={`p-5 rounded-2xl border text-left transition-all flex items-center gap-5 ${doneFlags[curIdx] ? (i === questions[curIdx].answer ? 'bg-green-500/10 border-green-500 text-green-400' : (userAns[curIdx] === i ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-white/5 border-white/5 opacity-50')) : (userAns[curIdx] === i ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-white' : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]')}`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border ${doneFlags[curIdx] ? (i === questions[curIdx].answer ? 'bg-green-500 border-green-500 text-black' : (userAns[curIdx] === i ? 'bg-red-500 border-red-500 text-white' : 'border-white/10')) : (userAns[curIdx] === i ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-black border-white/10 text-gray-500')}`}>
                                                                {['A', 'B', 'C', 'D'][i]}
                                                            </div>
                                                            <span className="font-bold">{opt}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
                                                        <div className="px-6 py-3 border-b border-white/5 flex justify-between items-center bg-black/40">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Source_Editor.exe</span>
                                                            <div className="flex gap-2">
                                                                <button className="px-3 py-1 bg-[var(--accent)]/20 text-[var(--accent)] text-[8px] font-black uppercase rounded border border-[var(--accent)]/20">Python</button>
                                                                <button className="px-3 py-1 bg-white/5 text-gray-500 text-[8px] font-black uppercase rounded">C++</button>
                                                            </div>
                                                        </div>
                                                        <textarea
                                                            value={userAns[curIdx] || ''}
                                                            onChange={(e) => {
                                                                const newAns = [...userAns];
                                                                newAns[curIdx] = e.target.value;
                                                                setUserAns(newAns);
                                                            }}
                                                            placeholder="# WRITE_YOUR_ALGORITHM_HERE..."
                                                            className="w-full h-80 bg-transparent p-8 text-sm outline-none resize-none font-mono text-white placeholder:opacity-20 leading-relaxed"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end items-center gap-4">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Auto-save active</span>
                                                        <button
                                                            onClick={() => submitAnswer(userAns[curIdx])}
                                                            className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${doneFlags[curIdx] ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-[var(--accent)] text-white shadow-xl'}`}
                                                        >
                                                            {doneFlags[curIdx] ? 'Solution Submitted' : 'Submit Code'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-6">
                                <div className="space-y-6 sticky top-24">
                                    <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                        <div className="space-y-2">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Operation Navigator</h3>
                                            <div className="grid grid-cols-5 gap-2">
                                                {questions.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => navQ(i)}
                                                        className={`aspect-square rounded-xl flex items-center justify-center font-black text-xs border transition-all ${i === curIdx ? 'bg-white text-black border-white' : doneFlags[i] ? (questions[i].type === 'coding' ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]' : (userAns[i] === questions[i].answer ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500')) : 'bg-black border-white/5 text-gray-500 hover:border-white/20'}`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/5 space-y-4">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-gray-500">Progress</span>
                                                <span className="text-white">{Math.round((doneFlags.filter(Boolean).length / questions.length) * 100)}%</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-[var(--accent)]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(doneFlags.filter(Boolean).length / questions.length) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowSubmitModal(true)}
                                            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all border border-white/10"
                                        >
                                            Finalize & Submit
                                        </button>
                                    </div>

                                    {doneFlags[curIdx] && questions[curIdx].explanation && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white/5 border border-[var(--accent)]/30 rounded-[2.5rem] p-8 space-y-4 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Zap size={64} className="text-[var(--accent)]" />
                                            </div>
                                            <div className="flex items-center gap-2 text-[var(--accent)] text-[10px] font-black uppercase tracking-widest">
                                                <Star size={12} fill="currentColor" />
                                                Strategic Insight
                                            </div>
                                            <p className="text-xs text-gray-400 leading-relaxed font-bold">
                                                {questions[curIdx].type === 'mcq' ? questions[curIdx].explanation : questions[curIdx].solution_approach}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'results' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto space-y-12"
                        >
                            <div className="text-center space-y-6">
                                <div className="inline-flex flex-col items-center">
                                    <div className="font-syne text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-tighter leading-none mb-4">
                                        {calculateResults().grade}
                                    </div>
                                    <h2 className="font-syne text-3xl font-black text-white uppercase tracking-tight">Operation Complete</h2>
                                    <p className="text-gray-500 uppercase tracking-widest text-[10px] font-black">Performance Audit Log_Finalized</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                                    {[
                                        { label: 'Precision', value: `${calculateResults().pct}%`, color: 'text-[var(--accent)]' },
                                        { label: 'Correct', value: calculateResults().correct, color: 'text-green-500' },
                                        { label: 'Tactical_Error', value: calculateResults().wrong + calculateResults().skipped, color: 'text-red-500' },
                                        { label: 'Time_Spent', value: formatTime(totalSec - secLeft), color: 'text-amber-500' }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6">
                                            <div className={`text-2xl font-black mb-1 ${stat.color}`}>{stat.value}</div>
                                            <div className="text-[8px] font-black uppercase text-gray-600 tracking-widest">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="font-syne font-black text-white uppercase tracking-widest text-sm flex items-center gap-4">
                                    <Activity className="text-[var(--accent)]" />
                                    Post-Deployment Review
                                </h3>
                                <div className="space-y-3">
                                    {questions.map((q, i) => (
                                        <div key={i} className="bg-white/5 border border-white/5 rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 items-start">
                                            <div className="flex-shrink-0">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border ${!doneFlags[i] ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : q.type === 'coding' ? 'bg-[var(--accent)]/10 border-[var(--accent)]/50 text-[var(--accent)]' : (userAns[i] === q.answer ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500')}`}>
                                                    {i + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <h4 className="font-syne font-black text-white uppercase tracking-tight text-lg">
                                                        {q.type === 'mcq' ? (q.question.length > 80 ? q.question.slice(0, 80) + '...' : q.question) : q.title}
                                                    </h4>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 px-3 py-1 bg-white/5 rounded-full">{q.topic}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 font-bold leading-relaxed">
                                                    {q.type === 'mcq' ? (
                                                        <div className="space-y-2">
                                                            <div className="flex gap-4"><span className="text-gray-600">Correct:</span> <span className="text-green-500">{q.options[q.answer]}</span></div>
                                                            {userAns[i] !== q.answer && userAns[i] !== null && <div className="flex gap-4"><span className="text-gray-600">Yours:</span> <span className="text-red-500">{q.options[userAns[i]]}</span></div>}
                                                            <div className="mt-4 p-4 bg-white/[0.03] rounded-xl">{q.explanation}</div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            <div className="p-4 bg-white/[0.03] rounded-xl italic">"{q.solution_approach}"</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-6">
                                <button
                                    onClick={() => setGameState('landing')}
                                    className="px-12 py-5 bg-[var(--accent)] text-white font-black uppercase text-xs tracking-[.2em] rounded-2xl shadow-[0_0_50px_rgba(108,99,255,0.3)] hover:scale-[1.05] transition-all"
                                >
                                    Return to HQ
                                </button>
                                <button className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors">Download Performance Report (PDF)</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Modals */}
            {showSubmitModal && (
                <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full bg-[#111] border border-white/5 rounded-[3rem] p-10 text-center space-y-8"
                    >
                        <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/20">
                            <ShieldAlert size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-syne text-2xl font-black text-white uppercase tracking-tight">Finalize Deployment?</h3>
                            <p className="text-gray-500 text-sm font-bold">
                                You have answered <span className="text-white">{doneFlags.filter(Boolean).length}</span> of <span className="text-white">{questions.length}</span> questions. Unsubmitted data will be lost.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => finishExam()}
                                className="w-full py-5 bg-[var(--accent)] text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] transition-all"
                            >
                                Confirm Submission
                            </button>
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="w-full py-5 bg-white/5 text-gray-500 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                            >
                                Continue Simulation
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
                
                :root {
                    --accent: #6c63ff;
                }

                .font-syne {
                    font-family: 'Syne', sans-serif;
                }
            `}</style>
        </div>
    );
}

const Layers = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);

const Check = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

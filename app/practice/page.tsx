'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Code2,
    Database,
    Layers,
    Cpu,
    Globe,
    ShieldCheck,
    ChevronRight,
    Search,
    BookOpen
} from 'lucide-react';
import Link from 'next/link';

const TOPICS = [
    {
        id: 'dsa',
        name: 'Data Structures & Algorithms',
        desc: 'Arrays, Trees, Graphs, DP, Sorting & Searching.',
        icon: Code2,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        count: 1200
    },
    {
        id: 'os',
        name: 'Operating Systems',
        desc: 'Process Management, Deadlocks, Memory, Multi-threading.',
        icon: Cpu,
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
        count: 150
    },
    {
        id: 'dbms',
        name: 'DBMS & SQL',
        desc: 'Normalization, Joins, Indexing, Transactions, NoSQL.',
        icon: Database,
        color: 'text-amber-400',
        bg: 'bg-amber-400/10',
        count: 200
    },
    {
        id: 'system-design',
        name: 'System Design',
        desc: 'HLD, LLD, Caching, Load Balancers, Scalability.',
        icon: Layers,
        color: 'text-purple-400',
        bg: 'bg-purple-400/10',
        count: 85
    },
    {
        id: 'networking',
        name: 'Computer Networks',
        desc: 'TCP/IP, HTTP, DNS, OSI Layers, Security.',
        icon: Globe,
        color: 'text-rose-400',
        bg: 'bg-rose-400/10',
        count: 110
    }
];

export default function PracticePage() {
    const [search, setSearch] = useState('');

    const filteredTopics = TOPICS.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.desc.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[var(--bg-base)] py-12 px-4">
            <div className="max-w-[1280px] mx-auto">
                <div className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                    >
                        <BookOpen size={12} /> Strategic_Practice_Vault
                    </motion.div>
                    <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-[var(--text-primary)] mb-6">
                        Practice by <span className="text-transparent bg-clip-text bg-brand-gradient">Topic</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl font-medium">
                        Master specific domains with curated question sets categorized by frequency and difficulty.
                    </p>
                </div>

                <div className="relative max-w-xl mb-12">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search for a topic (e.g. DP, SQL, Normalization)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-5 bg-[var(--bg-card)] border-2 border-[var(--border-subtle)] rounded-2xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand-primary)] outline-none shadow-2xl transition-all"
                    />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTopics.map((topic, i) => (
                        <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link
                                href={`/practice/${topic.id}`}
                                className="group block bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-8 hover:border-[var(--brand-primary)]/50 transition-all shadow-xl hover:shadow-[var(--brand-primary)]/5"
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div className={`p-4 rounded-2xl ${topic.bg} ${topic.color} border border-white/5`}>
                                        <topic.icon size={28} />
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                                        {topic.count}+ Concepts
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-[var(--text-primary)] mb-3 uppercase tracking-tight group-hover:text-[var(--brand-primary)] transition-colors line-clamp-1">
                                    {topic.name}
                                </h3>
                                <p className="text-[var(--text-secondary)] text-sm mb-10 line-clamp-2 leading-relaxed font-medium">
                                    {topic.desc}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-[var(--border-subtle)]">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">Start Training</span>
                                    <div className="p-2 rounded-xl bg-white/5 text-[var(--text-muted)] group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-all">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

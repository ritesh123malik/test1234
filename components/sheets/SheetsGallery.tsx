'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Library, Star, ChevronRight, Clock, Lock, ExternalLink, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Sheet {
    id: string;
    title: string;
    description: string | null;
    is_premium: boolean;
    is_public: boolean;
    category: string;
    difficulty_range: string | null;
    total_questions: number;
    author: string | null;
    banner_color: string;
    source_url: string | null;
    reference_url: string | null;
    questions_count: { count: number }[];
}

interface Props {
    initialSheets: Sheet[];
    hasPro: boolean;
}

export default function SheetsGallery({ initialSheets, hasPro }: Props) {
    const [category, setCategory] = useState<'all' | 'dsa' | 'cp' | 'interview'>('all');

    const filteredSheets = useMemo(() => {
        if (category === 'all') return initialSheets;
        return initialSheets.filter(s => s.category === category);
    }, [initialSheets, category]);

    const categories = [
        { id: 'all', label: 'All Sheets' },
        { id: 'dsa', label: 'DSA Sheets' },
        { id: 'cp', label: 'CP Ladders' },
        { id: 'interview', label: 'Interview Sets' },
    ];

    return (
        <div className="space-y-10">
            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-3">
                {categories.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => setCategory(c.id as any)}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${category === c.id
                            ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20'
                            : 'bg-white/5 text-text-muted hover:bg-white/10 border-white/5'
                            }`}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredSheets.map((sheet) => (
                        <motion.div
                            key={sheet.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="glass-card group flex flex-col h-full overflow-hidden border-border-subtle hover:border-brand-primary/40 transition-all relative">
                                {/* Left Color Border */}
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-1.5 z-10"
                                    style={{ backgroundColor: sheet.banner_color || '#3B82F6' }}
                                />

                                <div className="p-8 flex-1">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`p-3 rounded-2xl ${sheet.is_premium ? 'bg-amber-500/10 text-amber-500' : 'bg-brand-primary/10 text-brand-primary'}`}>
                                            <Library size={24} />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {sheet.is_premium && (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">
                                                    <Lock size={10} fill="currentColor" /> Premium
                                                </span>
                                            )}
                                            <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${sheet.category === 'dsa' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    sheet.category === 'cp' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                        'bg-purple-500/10 text-purple-500 border-purple-500/20'
                                                }`}>
                                                {sheet.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-display font-bold text-2xl text-text-primary group-hover:text-brand-primary transition-colors line-clamp-1">
                                                {sheet.title}
                                            </h3>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">
                                            By {sheet.author || 'PlacementIntel Core'}
                                        </p>
                                        <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed h-10">
                                            {sheet.description}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-2">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-bg-muted rounded-lg text-[9px] font-black uppercase tracking-widest text-text-muted border border-border-subtle">
                                            <Globe size={10} /> {sheet.difficulty_range || 'Mixed'}
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-bg-muted rounded-lg text-[9px] font-black uppercase tracking-widest text-text-muted border border-border-subtle">
                                            <Clock size={10} /> {sheet.total_questions || sheet.questions_count[0]?.count || 0} Questions
                                        </div>
                                    </div>
                                </div>

                                <div className="px-8 pb-8 pt-0 space-y-4">
                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link
                                            href={`/sheets/${sheet.id}`}
                                            className="btn-primary !py-2.5 !px-4 flex items-center justify-center gap-2 text-[10px]"
                                        >
                                            Infiltrate <ChevronRight size={14} />
                                        </Link>
                                        {sheet.reference_url && (
                                            <a
                                                href={sheet.reference_url}
                                                target="_blank"
                                                className="btn-secondary !py-2.5 !px-4 flex items-center justify-center gap-2 text-[10px]"
                                            >
                                                Original <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>

                                    {/* Source Link if any and no reference_url */}
                                    {!sheet.reference_url && sheet.source_url && (
                                        <a
                                            href={sheet.source_url}
                                            target="_blank"
                                            className="text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-brand-primary transition-colors flex items-center justify-center gap-2"
                                        >
                                            Source Document <ExternalLink size={10} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

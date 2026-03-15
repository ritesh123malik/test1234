'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui-store';
import { useSearch } from '@/hooks/useSearch';
import { Search, X, Building2, TrendingUp, History, Sparkles, Command, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CommandPalette() {
    const router = useRouter();
    const { isSearchOpen, setSearchOpen } = useUIStore();
    const { query, setQuery, results, isLoading, recentSearches, saveRecentSearch } = useSearch();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
            if (e.key === 'Escape') setSearchOpen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setSearchOpen]);

    useEffect(() => {
        if (isSearchOpen) setTimeout(() => inputRef.current?.focus(), 100);
    }, [isSearchOpen]);

    const handleSelect = (slug: string, name: string) => {
        saveRecentSearch(name);
        setSearchOpen(false);
        router.push(`/companies/${slug}`);
    };

    return (
        <AnimatePresence>
            {isSearchOpen && (
                <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSearchOpen(false)}
                        className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="w-full max-w-2xl bg-bg-elevated/95 border border-border-strong rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden relative z-10"
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-4 px-5 py-4 border-b border-border-subtle bg-bg-overlay/30">
                            <Search size={20} className="text-brand-primary" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search companies, questions, reviews..."
                                className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted font-medium"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-border-strong text-text-muted bg-bg-muted">ESC</span>
                                <button onClick={() => setSearchOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="max-h-[400px] overflow-y-auto p-2">
                            <AnimatePresence mode="wait">
                                {query.length > 0 ? (
                                    <motion.div
                                        key="results"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="px-3 py-2 text-[10px] font-black text-text-muted uppercase tracking-widest">Companies</div>
                                        {results.length > 0 ? (
                                            results.map((company) => (
                                                <button
                                                    key={company.id}
                                                    onClick={() => handleSelect(company.slug, company.name)}
                                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-bg-overlay transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-bg-muted flex items-center justify-center border border-border-subtle text-text-muted group-hover:text-brand-primary group-hover:border-brand-primary/30 transition-all">
                                                            <Building2 size={20} />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="font-bold text-sm text-text-primary group-hover:text-brand-primary transition-colors">{company.name}</p>
                                                            <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">AVG. {company.avg_package} LPA</p>
                                                        </div>
                                                    </div>
                                                    <ArrowRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center">
                                                {isLoading ? (
                                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent" />
                                                ) : (
                                                    <p className="text-sm text-text-muted">No results found for "{query}"</p>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="defaults"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {recentSearches.length > 0 && (
                                            <div className="mb-4">
                                                <div className="px-3 py-2 text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                                    <History size={12} /> Recent Searches
                                                </div>
                                                {recentSearches.map((term) => (
                                                    <button
                                                        key={term}
                                                        onClick={() => setQuery(term)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-overlay transition-all text-sm text-text-secondary hover:text-text-primary"
                                                    >
                                                        <Search size={14} className="opacity-40" />
                                                        {term}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <div>
                                            <div className="px-3 py-2 text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                                <TrendingUp size={12} /> Trending Now
                                            </div>
                                            {['Google 2025 Data', 'Flipkart SDE Roles', 'Infosys Interview Prep', 'CGPA Calculator 8+'].map((term) => (
                                                <button
                                                    key={term}
                                                    onClick={() => setQuery(term)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-overlay transition-all group text-sm text-text-secondary hover:text-text-primary"
                                                >
                                                    <Sparkles size={14} className="text-brand-tertiary opacity-40 group-hover:opacity-100" />
                                                    {term}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-border-subtle bg-bg-overlay/20 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted tracking-widest">
                                <span className="flex items-center gap-1.5"><Command size={10} className="mb-0.5" /> ↵ SELECT</span>
                                <span className="flex items-center gap-1.5">↑↓ NAVIGATE</span>
                            </div>
                            <p className="text-[10px] font-bold text-text-muted/40 tracking-tighter">PLACEMENTINTEL v1.0</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Breadcrumbs from '@/components/Breadcrumbs';
import CompanyCard from '@/components/CompanyCard';
import QuestionCard from '@/components/QuestionCard';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Building2,
    FileText,
    HelpCircle,
    ArrowRight,
    Loader2
} from 'lucide-react';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState<{
        companies: any[],
        sheets: any[],
        questions: any[]
    }>({ companies: [], sheets: [], questions: [] });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) performSearch();
    }, [query]);

    async function performSearch() {
        setLoading(true);

        try {
            const [compRes, sheetRes, questRes] = await Promise.all([
                supabase.from('companies').select('*').ilike('name', `%${query}%`).limit(6),
                supabase.from('question_sheets').select('*').ilike('title', `%${query}%`).limit(6),
                supabase.from('questions').select('*, companies(name, slug)').ilike('question', `%${query}%`).limit(10)
            ]);

            setResults({
                companies: compRes.data || [],
                sheets: sheetRes.data || [],
                questions: questRes.data || []
            });
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    }

    const totalResults = results.companies.length + results.sheets.length + results.questions.length;

    return (
        <div className="min-h-screen bg-[var(--bg-base)] py-12">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Search Results' }]} className="mb-8" />

                <div className="mb-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-primary)] mb-3">Global_Data_Query_Result</p>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
                        Search Intel: <span className="text-transparent bg-clip-text bg-brand-gradient">&quot;{query}&quot;</span>
                    </h1>
                    {!loading && <p className="text-[var(--text-secondary)] font-bold uppercase tracking-widest text-xs">
                        {totalResults} Tactical matches found across sectors
                    </p>}
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-6">
                        <Loader2 className="animate-spin text-[var(--brand-primary)]" size={48} />
                        <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-sm animate-pulse">Scanning Neural Archives...</p>
                    </div>
                ) : totalResults === 0 ? (
                    <div className="glass-card py-20 text-center">
                        <Search size={48} className="mx-auto text-[var(--text-muted)] opacity-20 mb-6" />
                        <p className="text-[var(--text-secondary)] font-bold text-xl uppercase tracking-tighter mb-2">No tactical data found</p>
                        <p className="text-[var(--text-muted)] text-sm font-medium">Try searching for generic terms like &quot;Google&quot;, &quot;Arrays&quot;, or &quot;Sheet&quot;</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* Companies Section */}
                        {results.companies.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                        <Building2 className="text-[var(--brand-primary)]" /> Strategic Assets
                                    </h2>
                                    <Link href="/companies" className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-2">
                                        View All <ArrowRight size={14} />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {results.companies.map(c => <CompanyCard key={c.id} company={c} />)}
                                </div>
                            </section>
                        )}

                        {/* Sheets Section */}
                        {results.sheets.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                        <FileText className="text-[var(--brand-secondary)]" /> Question Sheets
                                    </h2>
                                    <Link href="/sheets" className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-2">
                                        View All <ArrowRight size={14} />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {results.sheets.map(sheet => (
                                        <Link
                                            key={sheet.id}
                                            href={`/sheets/${sheet.id}`}
                                            className="glass-card p-8 hover:border-[var(--brand-secondary)] transition-all group flex flex-col justify-between"
                                        >
                                            <div>
                                                <h3 className="text-xl font-black text-white group-hover:text-[var(--brand-secondary)] transition-colors uppercase tracking-tight mb-2">
                                                    {sheet.title}
                                                </h3>
                                                <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-6">
                                                    {sheet.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${sheet.is_premium ? 'text-amber-500' : 'text-[var(--brand-primary)]'}`}>
                                                    {sheet.is_premium ? 'Premium' : 'Public'} Access
                                                </span>
                                                <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-white transition-colors" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Questions Section */}
                        {results.questions.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                        <HelpCircle className="text-[var(--brand-tertiary)]" /> Tactical Questions
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    {results.questions.map(q => (
                                        <QuestionCard
                                            key={q.id}
                                            question={q}
                                            isBookmarked={false}
                                            companyId={q.company_id}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
    ChevronLeft,
    BarChart3
} from 'lucide-react';
import QuestionList from '@/components/sheets/QuestionList';

export default async function SheetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    let user = null;
    try {
        const authPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth timeout')), 5000)
        );
        const { data } = await Promise.race([authPromise, timeoutPromise]) as any;
        user = data?.user ?? null;
    } catch (e) {
        console.warn('SheetDetailPage: Auth check timed out');
    }
    if (!user) redirect('/auth/login?redirect=/sheets/' + id);

    // 1. Fetch Sheet Metadata
    const { data: sheet } = await supabase
        .from('question_sheets')
        .select('*')
        .eq('id', id)
        .single();

    if (!sheet) notFound();

    // 2. Fetch Questions in Sheet
    const { data: questions } = await supabase
        .from('sheet_questions')
        .select('*')
        .eq('sheet_id', sheet.id)
        .order('question_number', { ascending: true });

    return (
        <div className="min-h-screen bg-bg-base py-12">
            <div className="max-w-container mx-auto px-4">
                <Link href="/sheets" className="flex items-center gap-2 text-text-muted hover:text-brand-primary transition-colors mb-8 text-xs font-black uppercase tracking-widest">
                    <ChevronLeft size={16} /> Back to Sheets
                </Link>

                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <h1 className="font-display font-bold text-4xl text-text-primary tracking-tight">{sheet.title}</h1>
                                {sheet.is_premium && (
                                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">Premium Content</span>
                                )}
                            </div>
                            <p className="text-text-muted max-w-2xl text-lg leading-relaxed">{sheet.description}</p>
                        </div>
                    </div>
                </div>

                <QuestionList
                    initialQuestions={questions || []}
                    sheetId={sheet.id}
                />
            </div>
        </div>
    );
}

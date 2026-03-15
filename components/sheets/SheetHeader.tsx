'use client';

import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SheetHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/auth/login');
            return;
        }

        const { data, error } = await supabase
            .from('question_sheets')
            .insert({
                title,
                description,
                user_id: user.id,
                is_public: false,
                is_premium: false
            })
            .select()
            .single();

        if (error) {
            alert('Error creating sheet: ' + error.message);
        } else {
            setIsOpen(false);
            setTitle('');
            setDescription('');
            router.refresh(); // Refresh the list
            router.push(`/sheets/${data.id}`); // Navigate to the new sheet
        }
        setLoading(false);
    }

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <p className="section-label mb-2">Platform Aggregator</p>
                    <h1 className="font-display font-bold text-4xl text-text-primary tracking-tight">Question Sheets</h1>
                    <p className="text-text-muted mt-2 max-w-xl text-lg">
                        Curated lists of the most important questions for top-tech roles. Track your progress across everything.
                    </p>
                </div>

                <button
                    onClick={() => setIsOpen(true)}
                    className="btn-primary w-fit flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all"
                >
                    <Plus size={18} strokeWidth={3} /> Create Custom Sheet
                </button>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-base/80 backdrop-blur-md">
                    <div className="glass-card w-full max-w-md p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary" />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-display font-bold text-text-primary mb-2">New Question Sheet</h2>
                        <p className="text-text-muted text-sm mb-8">Create a personal list to track your interview progress.</p>

                        <form onSubmit={handleCreate} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Sheet Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. My Meta Prep"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-bg-muted border border-border-default rounded-xl text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all placeholder:text-text-muted/50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Description (Optional)</label>
                                <textarea
                                    placeholder="What are you focusing on?"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-bg-muted border border-border-default rounded-xl text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all h-24 resize-none placeholder:text-text-muted/50"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Initialize Sheet'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

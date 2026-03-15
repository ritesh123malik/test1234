'use client';

import { useState, useEffect } from 'react';
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ChatBubbleLeftEllipsisIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface Submission {
    id: string;
    company_name: string;
    round: string;
    question: string;
    status: 'pending' | 'approved' | 'rejected';
    feedback: string | null;
    created_at: string;
}

export default function MySubmissions() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await fetch('/api/submissions');
            const data = await res.json();
            if (Array.isArray(data)) {
                setSubmissions(data);
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-12 bg-bg-muted rounded-xl" />
                <div className="h-12 bg-bg-muted rounded-xl" />
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="text-center py-10 bg-bg-overlay/20 rounded-[2.5rem] border border-border-subtle">
                <ClockIcon className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-secondary">No contributions yet. Start sharing!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {submissions.map((s) => (
                <div
                    key={s.id}
                    className={`glass-card rounded-3xl border border-border-subtle overflow-hidden transition-all ${expanded === s.id ? 'ring-1 ring-brand-primary/30' : ''}`}
                >
                    <button
                        onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                        className="w-full flex items-center justify-between p-5 text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${s.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                    s.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                        'bg-orange-500/10 text-orange-500'
                                }`}>
                                {s.status === 'approved' && <CheckCircleIcon className="w-5 h-5" />}
                                {s.status === 'rejected' && <XCircleIcon className="w-5 h-5" />}
                                {s.status === 'pending' && <ClockIcon className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-[var(--text-primary)] text-sm">{s.company_name}</h4>
                                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider bg-bg-muted px-2 py-0.5 rounded border border-border-subtle">
                                        {s.round}
                                    </span>
                                </div>
                                <p className="text-xs text-text-muted mt-1">
                                    {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${s.status === 'approved' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' :
                                    s.status === 'rejected' ? 'border-red-500/30 text-red-500 bg-red-500/5' :
                                        'border-orange-500/30 text-orange-500 bg-orange-500/5'
                                }`}>
                                {s.status}
                            </span>
                            {expanded === s.id ? <ChevronUpIcon className="w-4 h-4 text-text-muted" /> : <ChevronDownIcon className="w-4 h-4 text-text-muted" />}
                        </div>
                    </button>

                    {expanded === s.id && (
                        <div className="px-5 pb-5 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 bg-bg-base/50 rounded-2xl border border-border-subtle">
                                <p className="text-sm text-text-secondary leading-relaxed italic">
                                    "{s.question}"
                                </p>
                            </div>

                            {s.feedback && (
                                <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/20 flex gap-3">
                                    <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-brand-primary shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary mb-1">Admin Feedback</p>
                                        <p className="text-xs text-text-primary leading-relaxed">
                                            {s.feedback}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!s.feedback && s.status === 'pending' && (
                                <p className="text-[10px] text-text-muted text-center py-2 italic">
                                    Your intel is currently being synchronized with the neural core...
                                </p>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

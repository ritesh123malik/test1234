// components/problems/ProblemNotes.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
    Save, 
    Edit3, 
    Trash2, 
    Calendar, 
    Tag, 
    Star,
    ChevronRight,
    BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface Note {
    id?: string;
    problem_id: string;
    platform: string;
    title: string;
    content: string;
    tags: string[];
    is_favorite: boolean;
    next_revision_at: string;
}

interface ProblemNotesProps {
    problemId: string;
    platform: string;
    initialTitle?: string;
}

export default function ProblemNotes({ problemId, platform, initialTitle }: ProblemNotesProps) {
    const [note, setNote] = useState<Note | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editBuffer, setEditBuffer] = useState({
        title: initialTitle || '',
        content: '',
        tags: [] as string[]
    });

    useEffect(() => {
        fetchNote();
    }, [problemId, platform]);

    const fetchNote = async () => {
        try {
            const res = await fetch(`/api/notes?problemId=${problemId}&platform=${platform}`);
            const data = await res.json();
            if (data && data.length > 0) {
                setNote(data[0]);
                setEditBuffer({
                    title: data[0].title,
                    content: data[0].content,
                    tags: data[0].tags || []
                });
            } else {
                setNote(null);
                setEditBuffer({
                    title: initialTitle || '',
                    content: '',
                    tags: []
                });
            }
        } catch (err) {
            console.error('Failed to fetch note:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problemId,
                    platform,
                    ...editBuffer
                })
            });
            const data = await res.json();
            if (res.ok) {
                setNote(data);
                setIsEditing(false);
                toast.success('Note Synchronized');
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            toast.error('Sync Failed: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="h-32 flex items-center justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[2rem] overflow-hidden shadow-xl">
            {/* Header */}
            <div className="bg-white/5 border-b border-white/5 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Mission_Notes</span>
                </div>
                <div className="flex gap-2">
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-white/5 rounded-lg text-[var(--text-muted)] transition-all">
                            <Edit3 size={16} />
                        </button>
                    ) : (
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 transition-all disabled:opacity-50">
                            {saving ? 'Syncing...' : <><Save size={14} /> Commit</>}
                        </button>
                    )}
                </div>
            </div>

            <div className="p-8">
                {isEditing ? (
                    <div className="space-y-6">
                        <input 
                            type="text"
                            value={editBuffer.title}
                            onChange={(e) => setEditBuffer({ ...editBuffer, title: e.target.value })}
                            placeholder="Insight Title"
                            className="w-full bg-transparent text-xl font-bold text-white border-none outline-none placeholder:text-white/10"
                        />
                        <textarea 
                            value={editBuffer.content}
                            onChange={(e) => setEditBuffer({ ...editBuffer, content: e.target.value })}
                            placeholder="Capture technical nuances here... (Markdown supported)"
                            className="w-full min-h-[200px] bg-transparent text-sm text-white/70 border-none outline-none resize-none font-mono placeholder:text-white/10"
                        />
                        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                            <Tag size={14} className="text-white/20" />
                            <input 
                                type="text"
                                value={editBuffer.tags.join(', ')}
                                onChange={(e) => setEditBuffer({ ...editBuffer, tags: e.target.value.split(',').map(t => t.trim()) })}
                                placeholder="tags, separated by commas"
                                className="flex-1 bg-transparent text-[10px] font-bold text-indigo-400 border-none outline-none placeholder:text-white/10 uppercase tracking-widest"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-500">
                        {note ? (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-white tracking-tight">{note.title}</h3>
                                <div className="prose prose-invert max-w-none text-white/70 text-sm leading-relaxed font-medium">
                                    <ReactMarkdown>{note.content || '*No technical depth recorded yet.*'}</ReactMarkdown>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-6">
                                    {note.tags?.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                
                                {/* Revision Protocol */}
                                <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest">Revision_Loop</p>
                                            <p className="text-sm font-bold text-white">Next check: {new Date(note.next_revision_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-white/20" />
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center space-y-4">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-indigo-500/20">
                                    <Edit3 size={32} />
                                </div>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Neural_Void_Detected</p>
                                <p className="text-sm text-white/40 max-w-[200px] mx-auto font-medium leading-relaxed">No tactical insights recorded for this problem yet.</p>
                                <button onClick={() => setIsEditing(true)} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-all pt-4">Initialize Data Entry</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

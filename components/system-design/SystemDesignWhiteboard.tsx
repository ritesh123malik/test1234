// components/system-design/SystemDesignWhiteboard.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Tldraw, getSnapshot, loadSnapshot } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { supabase } from '@/lib/supabase';
import { groqAI } from '@/lib/groq';
import {
    CloudArrowUpIcon,
    SparklesIcon,
    ChatBubbleLeftRightIcon,
    ArrowPathIcon,
    ShareIcon,
    XMarkIcon,
    CpuChipIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';

interface SystemDesignWhiteboardProps {
    designId?: string;
    userId: string;
    onSave?: (id: string) => void;
}

export default function SystemDesignWhiteboard({ designId, userId, onSave }: SystemDesignWhiteboardProps) {
    const [editor, setEditor] = useState<any>(null);
    const [title, setTitle] = useState('Untitled Design');
    const [description, setDescription] = useState('');
    const [problem, setProblem] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiFeedback, setAiFeedback] = useState<any>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sharePublic, setSharePublic] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (designId) {
            loadDesign();
        }
    }, [designId]);

    const loadDesign = async () => {
        const { data, error } = await supabase
            .from('system_designs')
            .select('*')
            .eq('id', designId)
            .single();

        if (data) {
            setTitle(data.title);
            setDescription(data.description || '');
            setProblem(data.problem_statement || '');
            setSharePublic(data.is_public || false);
            if (data.ai_feedback) {
                setAiFeedback(data.ai_feedback);
            }
            // Load diagram data into editor
            if (editor && data.diagram_data) {
                try {
                    // Preferred API in current tldraw versions
                    loadSnapshot(editor.store, data.diagram_data);
                } catch {
                    // Fallback for older/editor-wrapped APIs
                    editor.loadSnapshot?.(data.diagram_data);
                }
            }
        }
    };

    const handleSave = async () => {
        if (!editor) return;
        setSaving(true);

        // Get current diagram state
        const snapshot = (() => {
            try {
                return getSnapshot(editor.store);
            } catch {
                return editor.getSnapshot?.();
            }
        })();

        // Generate image from canvas (you'd need to implement this)
        const imageData = await captureCanvas();

        const designData = {
            user_id: userId,
            title,
            description,
            problem_statement: problem,
            diagram_data: snapshot,
            image_url: imageData,
            is_public: sharePublic,
            updated_at: new Date().toISOString()
        };

        let result;
        if (designId) {
            result = await supabase
                .from('system_designs')
                .update(designData)
                .eq('id', designId)
                .select();
        } else {
            result = await supabase
                .from('system_designs')
                .insert(designData)
                .select();
        }

        if (result.data) {
            const newId = result.data[0].id;
            if (!designId) onSave?.(newId);

            // Award points for creating design
            await awardPoints('design_created');
        }

        setSaving(false);
    };

    const captureCanvas = async (): Promise<string> => {
        // In production, you'd use html2canvas or similar
        // For now, return empty string
        return '';
    };

    const requestAIFeedback = async () => {
        if (!editor || !problem) {
            alert('Please describe the problem first');
            return;
        }

        setLoading(true);
        setShowFeedback(true);

        try {
            // Get a stable snapshot of shapes from the store
            const snapshot = getSnapshot(editor.store);
            const shapes = Object.values((snapshot as any)?.document?.pages?.[0]?.shapes || {});
            const componentTypes = shapes
                .map((shape: any) => shape.type)
                .filter((type: string, idx: number, arr: string[]) => arr.indexOf(type) === idx);
            const components = componentTypes.join(', ') || 'No components drawn yet';

            const prompt = `You are a system design expert. Review this architecture for: ${problem}

Components in diagram: ${components}

Provide feedback on:
1. Single points of failure
2. Database choices and scalability
3. Caching strategy
4. Load balancing approach
5. Potential bottlenecks
6. Security considerations

Format your response in markdown with clear sections.`;

            const response = await groqAI.generateContent(prompt);

            const feedback = {
                review: response,
                timestamp: new Date().toISOString(),
                components
            };

            setAiFeedback(feedback);

            // Save feedback to database
            if (designId) {
                await supabase
                    .from('system_designs')
                    .update({ ai_feedback: feedback })
                    .eq('id', designId);
            }
        } catch (error) {
            console.error('AI Feedback error:', error);
        } finally {
            setLoading(false);
        }
    };

    const awardPoints = async (activity: string) => {
        await supabase.rpc('award_activity_points', {
            p_user_id: userId,
            p_activity: activity
        });
    };

    return (
        <div className="h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)]">
            {/* Strategy Header */}
            <div className="glass-card border-b border-[var(--border-subtle)] p-5 flex items-center justify-between backdrop-blur-3xl z-20">
                <div className="flex items-center space-x-6 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 rounded-xl">
                            <ShareIcon className="w-5 h-5 text-[var(--brand-primary)]" />
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-xl font-display font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] rounded-lg px-3 py-1.5 min-w-[200px] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                            placeholder="Tactical Design Title"
                        />
                    </div>

                    <div className="flex-1 max-w-2xl relative">
                        <ChatBubbleLeftRightIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            value={problem}
                            onChange={(e) => setProblem(e.target.value)}
                            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] rounded-[var(--radius-lg)] pl-11 pr-4 py-2.5 text-sm text-[var(--text-secondary)] outline-none transition-all placeholder-[var(--text-muted)] shadow-inner"
                            placeholder="Specify Architect Challenge (e.g., Scaling Distributed Global Feed)"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={sharePublic}
                                onChange={(e) => setSharePublic(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-full peer peer-checked:bg-[var(--brand-primary)] transition-all" />
                            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:left-6" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]">Public Link</span>
                    </label>

                    <div className="h-8 w-px bg-[var(--border-subtle)] mx-2" />

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-secondary-lg !px-5 !py-2.5 !text-sm !rounded-xl flex items-center space-x-2"
                    >
                        <CloudArrowUpIcon className="w-4 h-4" />
                        <span>{saving ? 'Syncing...' : 'Save Strategy'}</span>
                    </button>

                    <button
                        onClick={requestAIFeedback}
                        disabled={loading}
                        className="btn-primary !px-5 !py-2.5 !text-sm !rounded-xl shadow-[var(--shadow-glow-brand)] flex items-center space-x-2"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        <span>{loading ? 'Analyzing...' : 'Expert Review'}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Tactical Whiteboard Layer */}
                <div className={`flex-1 relative transition-all duration-500 ${showFeedback ? 'w-2/3' : 'w-full'}`} ref={canvasRef}>
                    <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,var(--brand-primary)/0.02,transparent)]" />
                    <Tldraw
                        onMount={(editor) => setEditor(editor)}
                        persistenceKey="system-design-vanguard"
                    />
                </div>

                {/* AI Tactical Feedback Panel */}
                {showFeedback && (
                    <div className="w-1/3 bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] flex flex-col shadow-2xl z-30 animate-in slide-in-from-right duration-500">
                        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-card)]/40 backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--brand-primary)]/10 rounded-xl">
                                    <CpuChipIcon className="w-5 h-5 text-[var(--brand-primary)]" />
                                </div>
                                <h3 className="font-display font-bold text-lg">Architect Intelligence</h3>
                            </div>
                            <button
                                onClick={() => setShowFeedback(false)}
                                className="p-2 hover:bg-[var(--bg-overlay)] rounded-xl transition-colors text-[var(--text-muted)]"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <div className="w-12 h-12 border-4 border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)] rounded-full animate-spin"></div>
                                    <p className="text-[var(--text-secondary)] font-medium animate-pulse">Running architectural analysis...</p>
                                </div>
                            ) : aiFeedback ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <div className="p-5 bg-[var(--bg-card)]/30 border border-[var(--border-subtle)] rounded-2xl text-[var(--text-secondary)] leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: aiFeedback.review }} />

                                    <div className="mt-8 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <SparklesIcon className="w-12 h-12 text-indigo-500" />
                                        </div>
                                        <h4 className="font-display font-bold text-indigo-400 mb-4 flex items-center gap-2">
                                            <AcademicCapIcon className="w-5 h-5" />
                                            Strategic Optimization
                                        </h4>
                                        <ul className="space-y-3">
                                            {[
                                                'Deploy Redis clusters for hot-path latency reduction',
                                                'Implement consistent hashing for elastic stateful scaling',
                                                'Leverage Event Sourcing for high-integrity audit trails',
                                                'Integrate Circuit Breakers for fault-tolerant microservices'
                                            ].map((tip, idx) => (
                                                <li key={idx} className="flex gap-3 text-sm text-[var(--text-secondary)]">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="p-6 bg-[var(--bg-overlay)] rounded-full mb-6">
                                        <SparklesIcon className="w-12 h-12 text-[var(--text-muted)]" />
                                    </div>
                                    <p className="text-[var(--text-secondary)] font-medium">Activate Intelligence Review</p>
                                    <p className="text-[var(--text-muted)] text-xs mt-2 max-w-[200px]">Get real-time feedback on your system architecture strategy.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    XMarkIcon,
    SparklesIcon,
    CommandLineIcon,
    CpuChipIcon,
    AcademicCapIcon,
    BriefcaseIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';

interface AIAssistantProps {
    problem?: string;
    onClose?: () => void;
}

export default function AIAssistant({ problem, onClose }: AIAssistantProps) {
    const [messages, setMessages] = useState<any[]>([
        {
            role: 'assistant',
            content: "Greetings, Vanguard. I am your AI Career Architect. Whether you're optimizing for FAANG, scaling your system design depth, or navigating offer negotiations, I'm here to synthesize your strategy. How shall we accelerate your trajectory today?"
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleAskAI = async (textOverride?: string) => {
        const textToSubmit = textOverride || input;
        if (!textToSubmit.trim()) return;

        const userMsg = { role: 'user', content: textToSubmit };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const systemPrompt = `You are the 'PlacementIntel Career Architect', an elite AI career coach for top-tier software engineers. 
            Your tone is professional, sophisticated, and highly strategic.
            Provide concise, high-impact advice on technical interviews, system design, resume optimization, and salary negotiation.
            Context: The user is currently looking at: ${problem || 'General Career Guidance'}.`;

            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'chat',
                    problem: textToSubmit,
                    systemPrompt
                })
            });
            const data = await res.json();

            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.result }]);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Apologies, the neural link is experiencing interference. Please re-synchronize your request." }]);
        } finally {
            setLoading(false);
        }
    };

    const QuickActions = [
        { icon: CpuChipIcon, label: 'System Design', prompt: 'Walk me through a system design strategy for a high-scale microservices architecture.' },
        { icon: CommandLineIcon, label: 'Mock Interview', prompt: 'Let\'s do a mock technical interview for a Senior SDE role.' },
        { icon: BriefcaseIcon, label: 'Negotiation', prompt: 'How should I negotiate a multi-offer situation between a startup and FAANG?' },
        { icon: AcademicCapIcon, label: 'Resume Audit', prompt: 'What are the top 3 things SDE recruiters look for in a 2026 resume?' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
            className="fixed bottom-28 right-8 w-[450px] h-[650px] glass-card border border-[var(--border-subtle)] rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] z-50 flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/30 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 rounded-xl">
                        <CpuChipIcon className="w-6 h-6 text-[var(--brand-primary)]" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-[var(--text-primary)] leading-none text-lg">Career Architect</h3>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1 italic">Neural Link: ACTIVE</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--bg-base)] rounded-xl transition-colors text-[var(--text-muted)] group"
                    >
                        <XMarkIcon className="w-6 h-6 group-hover:scale-110" />
                    </button>
                )}
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[radial-gradient(circle_at_top_right,var(--brand-primary)/0.03,transparent)]"
            >
                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.role === 'user'
                            ? 'bg-[var(--brand-primary)] text-white rounded-br-none'
                            : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-bl-none'
                            }`}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 rounded-2xl rounded-bl-none flex gap-1">
                            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-[var(--brand-primary)] rounded-full" />
                            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-[var(--brand-primary)] rounded-full" />
                            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-[var(--brand-primary)] rounded-full" />
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-2 overflow-x-auto flex gap-2 no-scrollbar border-t border-transparent bg-black/5">
                {QuickActions.map((action, i) => (
                    <button
                        key={i}
                        onClick={() => handleAskAI(action.prompt)}
                        className="whitespace-nowrap px-4 py-2 bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--text-primary)] transition-all"
                    >
                        <action.icon className="w-3 h-3 inline-block mr-1.5 opacity-60" />
                        {action.label}
                    </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-[var(--bg-card)]/30 backdrop-blur-xl border-t border-[var(--border-subtle)]">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAskAI();
                            }
                        }}
                        placeholder="Consult your Architect..."
                        className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl pl-5 pr-14 py-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none transition-all resize-none shadow-inner"
                        rows={1}
                    />
                    <button
                        onClick={() => handleAskAI()}
                        disabled={!input.trim() || loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-[var(--brand-primary)] text-white rounded-xl hover:bg-[var(--brand-secondary)] transition-all active:scale-90 disabled:opacity-50 disabled:grayscale shadow-lg shadow-indigo-500/20"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

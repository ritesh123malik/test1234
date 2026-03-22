'use client';
import { useState, useEffect } from 'react';

interface QuestionDetails {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    topic_tags: string[];
    url: string;
    xp_reward: number;
    platform?: 'leetcode' | 'codeforces';
    external_id?: string;
    rating?: number;
}

interface Challenge {
    id: string;
    challenge_date: string;
    bonus_xp: number;
    total_solvers: number;
    platform: 'leetcode' | 'codeforces';
    question: QuestionDetails;
}

interface Props {
    challenge: Challenge;
    submission: { status: string; xp_earned: number } | null;
    profile: { xp: number; level: number; current_streak: number };
    currentLevel: any;
    onDifficultyChange: (value: any) => void;
    onSubmit: (status: 'solved' | 'attempted' | 'skipped', platform: 'leetcode' | 'codeforces') => Promise<void>;
}

const PLATFORM_CONFIG = {
    leetcode: {
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        border: 'border-yellow-700/30',
        badge_text: 'LeetCode',
        icon: 'LC',
    },
    codeforces: {
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        border: 'border-blue-700/30',
        badge_text: 'Codeforces',
        icon: 'CF',
    }
};

const getDifficultyColor = (q: QuestionDetails) => {
    if (q.platform === 'codeforces' && q.rating) {
        if (q.rating <= 1200) return 'text-green-400 bg-green-400/10';
        if (q.rating <= 1800) return 'text-yellow-400 bg-yellow-400/10';
        return 'text-red-400 bg-red-400/10';
    }
    const colors = {
        Easy: 'text-green-400 bg-green-400/10',
        Medium: 'text-yellow-400 bg-yellow-400/10',
        Hard: 'text-red-400 bg-red-400/10',
    };
    return colors[q.difficulty as keyof typeof colors] || 'text-gray-400 bg-gray-400/10';
};

export default function DailyChallengeCard({ challenge, submission, profile, currentLevel, onDifficultyChange, onSubmit }: Props) {
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setUTCHours(24, 0, 0, 0);
            const diff = midnight.getTime() - now.getTime();
            if (diff <= 0) { setTimeLeft('0h 0m 0s'); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${h}h ${m}s`);
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, []);

    const q = challenge.question;
    const platform = challenge.platform;
    const config = PLATFORM_CONFIG[platform];
    const diffClass = getDifficultyColor(q);
    const isSolved = submission?.status === 'solved';

    return (
        <div className={`relative bg-gray-900/50 backdrop-blur-sm rounded-3xl border ${config.border} p-4 md:p-6 space-y-4 md:space-y-6 transition-all hover:scale-[1.01] group flex flex-col justify-between`}>

            {/* Header: Platform & Time */}
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} ${config.color} border border-current/10`}>
                        <span className='font-black text-[10px] tracking-widest uppercase'>{config.badge_text}</span>
                    </div>

                    {/* Level Selector */}
                    <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/5">
                        {[1, 2, 3].map((lvl) => (
                            <button
                                key={lvl}
                                onClick={() => onDifficultyChange(platform === 'leetcode' ? (lvl === 1 ? 'Easy' : lvl === 2 ? 'Medium' : 'Hard') : lvl)}
                                className={`px-2 py-0.5 rounded-md text-[9px] font-black transition-all ${
                                    (platform === 'leetcode' 
                                        ? (currentLevel === (lvl === 1 ? 'Easy' : lvl === 2 ? 'Medium' : 'Hard'))
                                        : currentLevel === lvl)
                                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                L{lvl}
                            </button>
                        ))}
                    </div>
                </div>
                <div className='flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider'>
                    <span className='w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse' />
                    {timeLeft}
                </div>
            </div>

            {/* Content: Title & Badges */}
            <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${diffClass}`}>
                        {platform === 'codeforces' && q.rating ? `Rating: ${q.rating}` : q.difficulty}
                    </span>
                    <span className='text-yellow-400 text-xs font-black tracking-widest'>
                        +{q.xp_reward} XP
                    </span>
                </div>

                <h3 className='text-xl font-bold text-white group-hover:text-blue-400 transition-colors leading-tight min-h-[3rem]'>
                    {q.title}
                </h3>

                <div className='flex flex-wrap gap-1.5'>
                    {q.topic_tags.map(tag => (
                        <span key={tag} className='text-[9px] font-bold bg-white/5 text-gray-400 px-2 py-0.5 rounded border border-white/5'>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Footer: Actions or Status */}
            <div className='pt-2'>
                {submission ? (
                    <div className='bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center'>
                        <p className='text-emerald-400 font-black text-xs uppercase tracking-widest'>
                            ✓ {submission.status === 'solved' ? 'Mission Success' : 'Logged'}
                        </p>
                        <p className='text-gray-500 text-[9px] font-bold uppercase mt-1'>+{submission.xp_earned} XP Harvested</p>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        <a href={q.url} target='_blank' rel='noopener noreferrer'
                            className={`block w-full py-3.5 ${platform === 'leetcode' ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'} 
                            border border-current/20 font-black rounded-2xl text-center text-xs uppercase tracking-[0.2em] transition-all`}>
                            Solve on {config.badge_text} →
                        </a>
                        <div className='grid grid-cols-2 gap-3'>
                            <button
                                onClick={() => { setLoading(true); onSubmit('solved', platform).finally(() => setLoading(false)); }}
                                disabled={loading}
                                className='py-3 bg-white/5 hover:bg-emerald-500/10 text-white hover:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-white/5 transition-all disabled:opacity-50'>
                                Confirm Solve
                            </button>
                            <button
                                onClick={() => { setLoading(true); onSubmit('attempted', platform).finally(() => setLoading(false)); }}
                                disabled={loading}
                                className='py-3 bg-white/5 hover:bg-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-white/5 transition-all disabled:opacity-50'>
                                Log Attempt
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';
import { useState, useEffect } from 'react';
import DailyChallengeCard from '@/components/daily-challenge/DailyChallengeCard';
import StreakCalendar from '@/components/daily-challenge/StreakCalendar';
import { toast } from 'sonner';
import { CardSkeleton } from '@/components/ui/Skeleton';

// Dynamic import for confetti to avoid SSR issues
const fireConfetti = async () => {
    const confetti = (await import('canvas-confetti')).default;
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']
    });
};

export default function DailyChallengePage() {
    const [data, setData] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Difficulty Settings
    const [lcDiff, setLcDiff] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
    const [cfLevel, setCfLevel] = useState<number>(1);

    const fetchData = async (lDiff = lcDiff, cLevel = cfLevel) => {
        try {
            setLoading(true);
            const [challengeRes, historyRes] = await Promise.all([
                fetch(`/api/daily-challenge?lc_diff=${lDiff}&cf_level=${cLevel}`),
                fetch('/api/daily-challenge/history')
            ]);

            const challengeData = await challengeRes.json();
            const historyData = await historyRes.json();

            if (challengeData.error) setError(challengeData.error);
            setData(challengeData);
            setHistory(historyData.history || []);
        } catch (err) {
            setError('Failed to load challenge data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDifficultyChange = (platform: 'leetcode' | 'codeforces', value: any) => {
        if (platform === 'leetcode') {
            setLcDiff(value);
            fetchData(value, cfLevel);
        } else {
            setCfLevel(value);
            fetchData(lcDiff, value);
        }
    };

    const handleSubmit = async (status: 'solved' | 'attempted' | 'skipped', platform: 'leetcode' | 'codeforces') => {
        const challenge = data[platform]?.challenge;
        if (!challenge?.id) return;

        try {
            const res = await fetch('/api/daily-challenge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challengeId: challenge.id, status, platform })
            });

            const result = await res.json();

            if (res.ok) {
                if (status === 'solved') {
                    await fireConfetti();
                    toast.success(`Success! +${result.xp_earned || 25} XP secured.`);
                } else {
                    toast.success(`Protocol updated: ${status}.`);
                }
                await fetchData();
            } else {
                toast.error(result.error || 'Submission failed');
            }
        } catch (err) {
            console.error('Submission Error:', err);
            toast.error('Tactical failure: link interrupted');
        }
    };

    if (loading) {
        return (
            <div className='max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12'>
                <div className="space-y-4">
                    <div className="h-12 bg-gray-800/50 rounded-2xl w-48 animate-pulse" />
                    <div className="h-4 bg-gray-800/50 rounded-lg w-64 animate-pulse" />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </div>
        );
    }

    const hasChallenges = data?.leetcode?.challenge || data?.codeforces?.challenge;

    if (!hasChallenges) {
        return (
            <div className='max-w-4xl mx-auto px-4 py-12 text-center text-gray-400'>
                <p>No challenges scheduled for today. Check back later!</p>
            </div>
        );
    }

    return (
        <div className='max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700'>
            <div className="space-y-2 text-center md:text-left pt-4 md:pt-0">
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Daily Arena</h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">1 LeetCode + 1 Codeforces every day • Tactical Mastery</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {data.leetcode?.challenge ? (
                    <DailyChallengeCard
                        challenge={data.leetcode.challenge}
                        submission={data.leetcode.submission}
                        profile={data.profile}
                        currentLevel={lcDiff}
                        onDifficultyChange={(v) => handleDifficultyChange('leetcode', v)}
                        onSubmit={handleSubmit}
                    />
                ) : (
                    <div className="bg-gray-900/50 rounded-3xl p-8 border border-dashed border-gray-800 flex items-center justify-center text-gray-500 text-xs uppercase font-black tracking-widest min-h-[300px]">
                        LeetCode Challenge Pending_
                    </div>
                )}
                {data.codeforces?.challenge ? (
                    <DailyChallengeCard
                        challenge={data.codeforces.challenge}
                        submission={data.codeforces.submission}
                        profile={data.profile}
                        currentLevel={cfLevel}
                        onDifficultyChange={(v) => handleDifficultyChange('codeforces', v)}
                        onSubmit={handleSubmit}
                    />
                ) : (
                    <div className="bg-gray-900/50 rounded-3xl p-8 border border-dashed border-gray-800 flex items-center justify-center text-gray-500 text-xs uppercase font-black tracking-widest min-h-[300px]">
                        Codeforces Challenge Pending_
                    </div>
                )}
            </div>

            <StreakCalendar history={history} />

            <div className="bg-blue-900/10 border border-blue-900/30 rounded-3xl p-8 relative overflow-hidden">
                <div className='absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl pointer-events-none' />
                <h3 className="text-blue-400 font-black uppercase tracking-widest text-sm mb-4">Operational Directives</h3>
                <ul className="text-xs text-gray-400 space-y-3 font-medium">
                    <li className="flex items-center gap-3"><span className="w-1 h-1 rounded-full bg-blue-500" /> Build muscle memory for common DSA patterns.</li>
                    <li className="flex items-center gap-3"><span className="w-1 h-1 rounded-full bg-blue-500" /> Earn XP to level up your profile and climb the leaderboard.</li>
                    <li className="flex items-center gap-3"><span className="w-1 h-1 rounded-full bg-blue-500" /> Maintain your streak and unlock exclusive badges.</li>
                    <li className="flex items-center gap-3"><span className="w-1 h-1 rounded-full bg-blue-500" /> Stay prepared for surprise online assessments (OAs).</li>
                </ul>
            </div>
        </div>
    );
}

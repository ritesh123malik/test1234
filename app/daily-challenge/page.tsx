'use client';
import { useState, useEffect } from 'react';
import DailyChallengeCard from '@/components/daily-challenge/DailyChallengeCard';
import StreakCalendar from '@/components/daily-challenge/StreakCalendar';

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

    const fetchData = async () => {
        try {
            const [challengeRes, historyRes] = await Promise.all([
                fetch('/api/daily-challenge'),
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
                if (status === 'solved') await fireConfetti();
                await fetchData();
            } else {
                alert(result.error || 'Submission failed');
            }
        } catch (err) {
            console.error('Submission Error:', err);
            alert('An unexpected error occurred');
        }
    };

    if (loading) {
        return (
            <div className='flex flex-col items-center justify-center min-h-[60vh] text-gray-400'>
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Loading Daily Challenges...</p>
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
        <div className='max-w-6xl mx-auto px-4 py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700'>
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Daily Challenges</h1>
                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">1 LeetCode + 1 Codeforces every day • Tactical Mastery</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {data.leetcode?.challenge && (
                    <DailyChallengeCard
                        challenge={data.leetcode.challenge}
                        submission={data.leetcode.submission}
                        profile={data.profile}
                        onSubmit={handleSubmit}
                    />
                )}
                {data.codeforces?.challenge && (
                    <DailyChallengeCard
                        challenge={data.codeforces.challenge}
                        submission={data.codeforces.submission}
                        profile={data.profile}
                        onSubmit={handleSubmit}
                    />
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

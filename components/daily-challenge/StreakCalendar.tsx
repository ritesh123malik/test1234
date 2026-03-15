'use client';
import { format, subDays } from 'date-fns';

interface Submission {
    challenge_date: string;
    status: string;
    xp_earned: number;
}

export default function StreakCalendar({ history }: { history: Submission[] }) {
    const submissionMap = new Map(history.map(s => [s.challenge_date, s]));
    const days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        const key = format(date, 'yyyy-MM-dd');
        return { date, key, submission: submissionMap.get(key) ?? null };
    });

    const getColor = (s: Submission | null) => {
        if (!s) return 'bg-gray-800';
        if (s.status === 'solved') return 'bg-green-500';
        if (s.status === 'attempted') return 'bg-yellow-600';
        return 'bg-gray-600';
    };

    return (
        <div className='bg-gray-900 rounded-2xl border border-gray-800 p-5'>
            <h3 className='text-white font-bold mb-4'>Last 30 Days</h3>
            <div className='grid grid-cols-10 gap-1.5'>
                {days.map(({ date, key, submission }) => (
                    <div key={key}
                        title={`${format(date, 'MMM d')} — ${submission?.status || 'not attempted'}`}
                        className={`w-full aspect-square rounded ${getColor(submission)} cursor-default transition-colors`}
                    />
                ))}
            </div>
            <div className='flex gap-4 mt-3 text-xs text-gray-400'>
                <span className='flex items-center gap-1'><span className='w-3 h-3 bg-green-500 rounded-sm' />Solved</span>
                <span className='flex items-center gap-1'><span className='w-3 h-3 bg-yellow-600 rounded-sm' />Attempted</span>
                <span className='flex items-center gap-1'><span className='w-3 h-3 bg-gray-800 rounded-sm' />Missed</span>
            </div>
        </div>
    );
}

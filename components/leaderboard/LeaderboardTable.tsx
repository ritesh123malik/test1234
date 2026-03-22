'use client';
import { TableRowSkeleton } from '@/components/ui/Skeleton';

interface Entry {
    user_id: string; username: string; full_name: string; avatar_url: string;
    college: string; city: string; xp?: number; weekly_xp?: number;
    level: number; current_streak: number; global_rank?: number;
    weekly_rank?: number; total_interviews?: number; avg_interview_score?: number;
}

const RANK_BADGES: Record<number, string> = {
    1: 'text-yellow-400 text-xl',
    2: 'text-gray-300 text-xl',
    3: 'text-amber-600 text-xl',
};
const RANK_ICONS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

interface Props {
    entries: Entry[];
    type: 'global' | 'college' | 'city' | 'weekly';
    currentUserId?: string;
    isLoading?: boolean;
}

export default function LeaderboardTable({ entries, type, currentUserId, isLoading }: Props) {
    const getXP = (e: Entry) => type === 'weekly' ? e.weekly_xp : e.xp;

    if (isLoading) {
        return (
            <div className='space-y-4 bg-gray-900/30 rounded-3xl border border-white/5 p-2'>
                {Array.from({ length: 8 }).map((_, i) => (
                    <TableRowSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className='text-center py-20 bg-gray-900 rounded-3xl border border-gray-800 border-dashed'>
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className='text-4xl opacity-50'>🏆</span>
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Arena is Empty</h3>
                <p className="text-gray-500 max-w-xs mx-auto">No challengers found for this category yet. Be the first to claim the top spot!</p>
            </div>
        );
    }

    return (
        <div className='space-y-3'>
            {entries.map((entry, index) => {
                const rank = type === 'weekly' ? entry.weekly_rank : (type === 'global' ? entry.global_rank : index + 1);
                const xp = getXP(entry) ?? 0;
                const isCurrentUser = entry.user_id === currentUserId;
                const isTop3 = rank !== undefined && rank <= 3;

                return (
                    <div key={entry.user_id}
                        className={`flex items-center gap-3 md:gap-5 px-4 md:px-6 py-3 md:py-4 rounded-2xl border transition-all duration-300 ${isCurrentUser
                            ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)] ring-1 ring-blue-500/20'
                            : isTop3
                                ? 'bg-gray-900 border-yellow-500/20 hover:border-yellow-500/40'
                                : 'bg-gray-900 border-gray-800/50 hover:bg-gray-800/50 hover:border-gray-700'
                            }`}
                    >
                        {/* Rank */}
                        <div className='w-8 md:w-10 flex-shrink-0 flex items-center justify-center font-display'>
                            {isTop3 ? (
                                <span className={RANK_BADGES[rank!]}>{RANK_ICONS[rank!]}</span>
                            ) : (
                                <span className='text-gray-600 font-black text-xs md:text-sm uppercase tracking-widest'>#{rank}</span>
                            )}
                        </div>

                        {/* Avatar */}
                        <div className='w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 p-[1px] md:p-[2px] flex-shrink-0'>
                            <div className="w-full h-full rounded-[10px] md:rounded-[14px] overflow-hidden bg-gray-900 flex items-center justify-center border border-white/5">
                                {entry.avatar_url ? (
                                    <img src={entry.avatar_url} alt='' className='w-full h-full object-cover' />
                                ) : (
                                    <div className='text-gray-400 font-bold text-sm md:text-lg'>
                                        {(entry.full_name || entry.username || '?')[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* User Info */}
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-0.5 leading-tight'>
                                <p className='text-white font-bold text-sm md:text-base truncate'>
                                    {entry.full_name || entry.username}
                                    {isCurrentUser && (
                                        <span className='ml-2 text-[8px] md:text-[10px] bg-blue-500/20 text-blue-400 px-1.5 md:px-2 py-0.5 rounded-full font-black uppercase tracking-widest'>You</span>
                                    )}
                                </p>
                                <span className='text-[8px] md:text-[10px] bg-gray-800 text-gray-400 px-1.5 md:px-2 py-0.5 rounded-lg flex-shrink-0 font-bold border border-white/5 uppercase tracking-wider hidden sm:inline-block'>
                                    Lvl {entry.level}
                                </span>
                            </div>
                            <p className='text-gray-500 text-[10px] md:text-xs truncate flex items-center gap-1.5'>
                                <span className="hidden md:inline-block">Level {entry.level} • </span>
                                {entry.college && <span className="truncate hidden md:inline-block">{entry.college}</span>}
                                {entry.college && entry.city && <span className="w-0.5 h-0.5 rounded-full bg-gray-800 hidden md:inline-block" />}
                                {entry.city && <span className="hidden md:inline-block">{entry.city}</span>}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className='text-right flex-shrink-0 flex flex-col items-end gap-1'>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center p-[2px]">
                                    <div className="w-full h-full rounded-full bg-brand-primary shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.4)]" />
                                </div>
                                <p className='text-brand-primary font-black text-base tabular-nums'>{xp?.toLocaleString()}</p>
                            </div>
                            {entry.current_streak > 0 && (
                                <div className='flex items-center gap-1 px-2 py-0.5 bg-brand-secondary/10 rounded-lg border border-brand-secondary/20'>
                                    <span className="text-[10px]">⚡</span>
                                    <p className='text-brand-secondary text-[10px] font-black uppercase tracking-widest'>{entry.current_streak} DAY STREAK</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

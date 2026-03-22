'use client';

interface Rank {
    global_rank: number;
    weekly_rank: number;
    college_rank: number;
    college_total: number;
    city_rank: number;
    city_total: number;
    college: string;
    city: string;
}

export default function MyRankCard({ rank }: { rank: Rank | null }) {
    if (!rank) return null;

    const stats = [
        { label: 'Global Rank', value: rank.global_rank ? `#${rank.global_rank}` : 'N/A', icon: '🌍', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        { label: 'Weekly Rank', value: rank.weekly_rank ? `#${rank.weekly_rank}` : 'Inactive', icon: '🔋', color: 'text-blue-400', bg: 'bg-blue-400/10' },
        {
            label: rank.college || 'College Rank',
            value: rank.college_rank ? `#${rank.college_rank} / ${rank.college_total}` : 'Set College',
            icon: '🏛️',
            color: 'text-violet-400',
            bg: 'bg-violet-400/10'
        },
        {
            label: rank.city || 'City Rank',
            value: rank.city_rank ? `#${rank.city_rank} / ${rank.city_total}` : 'Set City',
            icon: '📍',
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10'
        },
    ];

    return (
        <div className='bg-gray-900 rounded-3xl border border-gray-800 p-6 shadow-2xl overflow-hidden relative group'>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] rounded-full group-hover:bg-blue-600/10 transition-all duration-700" />

            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                    <span className="text-xl">🏆</span>
                </div>
                <div>
                    <h3 className='text-white font-black text-xl tracking-tight'>Personal Standing</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Real-time ranking analysis</p>
                </div>
            </div>

            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4'>
                {stats.map(s => (
                    <div key={s.label} className='bg-gray-800/50 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/5 flex flex-col justify-between group/card'>
                        <div className="flex items-center justify-between mb-1.5 md:mb-2">
                            <span className="text-xs md:text-sm opacity-80">{s.icon}</span>
                            <p className='text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-wider group-hover/card:text-gray-400 transition-colors'>{s.label}</p>
                        </div>
                        <p className={`text-lg md:text-xl font-black ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {(!rank.college || !rank.city) && (
                <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-blue-600/10 border border-blue-600/20 rounded-2xl">
                    <span className="text-lg">⚙️</span>
                    <p className='text-gray-400 text-xs'>
                        <a href='/profile' className='text-blue-400 font-bold hover:underline transition-all'>
                            Select your college & city
                        </a>
                        {' '}to unlock local bracket rankings and compete with peers.
                    </p>
                </div>
            )}
        </div>
    );
}

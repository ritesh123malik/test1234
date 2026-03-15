'use client';

interface TopicScore {
    topic: string;
    avg_score: number;
    attempt_count: number;
    last_attempt: string;
}

interface Summary {
    weak_topics: string[];
    strong_topics: string[];
    overall_avg: number;
    total_responses: number;
}

const SCORE_COLOR = (score: number) => {
    if (score >= 8) return 'text-emerald-400 bg-emerald-400/10';
    if (score >= 6) return 'text-amber-400 bg-amber-400/10';
    if (score >= 4) return 'text-orange-400 bg-orange-400/10';
    return 'text-rose-400 bg-rose-400/10';
};

const SCORE_BAR_COLOR = (score: number) => {
    if (score >= 8) return 'bg-emerald-500';
    if (score >= 6) return 'bg-amber-500';
    if (score >= 4) return 'bg-orange-500';
    return 'bg-rose-500';
};

export default function WeaknessCards({ topics, summary }: { topics: TopicScore[], summary: Summary }) {
    const weakTopics = topics
        .filter(t => t.attempt_count >= 1)
        .sort((a, b) => a.avg_score - b.avg_score)
        .slice(0, 5);

    const strongTopics = topics
        .filter(t => t.attempt_count >= 1)
        .sort((a, b) => b.avg_score - a.avg_score)
        .slice(0, 3);

    return (
        <div className='flex flex-col gap-6'>
            {/* Summary Stats */}
            <div className='grid grid-cols-3 gap-4'>
                {[
                    { label: 'Overall Perf', value: `${summary.overall_avg.toFixed(1)}/10`, icon: '🎯', color: 'text-blue-400' },
                    { label: 'Responses', value: summary.total_responses, icon: '💬', color: 'text-violet-400' },
                    { label: 'Topic Count', value: topics.length, icon: '📂', color: 'text-emerald-400' },
                ].map(stat => (
                    <div key={stat.label} className='bg-gray-900 rounded-2xl border border-gray-800 p-4 transition-all hover:bg-gray-800/50'>
                        <div className="text-xl mb-1">{stat.icon}</div>
                        <p className='text-gray-500 text-[10px] uppercase font-bold tracking-wider'>{stat.label}</p>
                        <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Weak Topics */}
            <div className='bg-gray-900 rounded-2xl border border-gray-800 p-6'>
                <div className='flex items-center gap-3 mb-6'>
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                        <span className='text-rose-500 text-sm'>⚠</span>
                    </div>
                    <h3 className='text-white font-bold text-lg'>Targeted Improvements</h3>
                </div>

                <div className='space-y-5'>
                    {weakTopics.length === 0 ? (
                        <p className='text-gray-500 text-sm italic py-4'>
                            No topic data available yet. Start practicing to see your weak areas.
                        </p>
                    ) : weakTopics.map(t => (
                        <div key={t.topic} className='group'>
                            <div className='flex justify-between items-center mb-1.5'>
                                <div className="flex items-center gap-2">
                                    <span className='text-gray-200 font-semibold group-hover:text-white transition-colors'>{t.topic}</span>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.attempt_count} ATTEMPTS</span>
                                </div>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${SCORE_COLOR(t.avg_score)}`}>
                                    {(t.avg_score).toFixed(1)} / 10
                                </span>
                            </div>
                            <div className='h-2 bg-gray-800 rounded-full overflow-hidden'>
                                <div
                                    className={`h-full transition-all duration-1000 ease-out shadow-[0_0_8px_initial] ${SCORE_BAR_COLOR(t.avg_score)}`}
                                    style={{ width: `${t.avg_score * 10}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Strong Topics */}
            <div className='bg-gray-900 rounded-2xl border border-gray-800 p-6'>
                <div className='flex items-center gap-3 mb-4'>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <span className='text-emerald-500 text-sm'>✓</span>
                    </div>
                    <h3 className='text-white font-bold text-lg'>Top Strengths</h3>
                </div>
                <div className='flex flex-wrap gap-2'>
                    {strongTopics.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">Analyze your first interview to see strengths.</p>
                    ) : strongTopics.map(t => (
                        <div key={t.topic}
                            className='bg-emerald-500/5 text-emerald-400 border border-emerald-500/20
                flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-500/10 transition-all'>
                            <span>{t.topic}</span>
                            <span className="w-px h-3 bg-emerald-500/20" />
                            <span className="opacity-80">{(t.avg_score).toFixed(1)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

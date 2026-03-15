'use client';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { useState } from 'react';

interface GridDay {
    activity_date: string;
    session_count: number;
    avg_score: number;
    intensity_level: number; // 0-4
}

interface Props {
    data: GridDay[];
    weeks?: number; // default 52
}

const INTENSITY_COLORS = [
    'bg-gray-800',           // 0 — no activity
    'bg-blue-900',           // 1 — low score (< 4)
    'bg-blue-700',           // 2 — medium score (4-6)
    'bg-blue-500',           // 3 — good score (6-8)
    'bg-blue-400',           // 4 — excellent (8+)
];

export default function ActivityGrid({ data, weeks = 52 }: Props) {
    const [tooltip, setTooltip] = useState<{
        date: string; sessions: number; score: number; x: number; y: number;
    } | null>(null);

    // Build a map of date -> grid data
    const dataMap = new Map(data.map(d => [d.activity_date, d]));

    // Generate all days for the grid
    const endDate = new Date();
    const startDate = subDays(endDate, weeks * 7 - 1);
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Group into weeks (columns)
    const weekColumns: Date[][] = [];
    let currentWeek: Date[] = [];
    allDays.forEach((day, i) => {
        currentWeek.push(day);
        if (day.getDay() === 6 || i === allDays.length - 1) {
            weekColumns.push(currentWeek);
            currentWeek = [];
        }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className='bg-gray-900 rounded-2xl border border-gray-800 p-6'>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className='text-white font-bold text-lg'>Interview Consistency</h3>
                    <p className="text-gray-400 text-sm">Tracking your prep frequency over the last year</p>
                </div>
                <div className='flex items-center gap-2 text-xs text-gray-500'>
                    <span>Less</span>
                    <div className="flex gap-1">
                        {INTENSITY_COLORS.map((c, i) => (
                            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className='flex flex-col'>
                {/* Month labels */}
                <div className='flex mb-2 ml-8 text-[10px] text-gray-500 uppercase tracking-tighter'>
                    {weekColumns.filter((_, i) => i % 4 === 0).map((week, i) => (
                        <span key={i} className="flex-shrink-0" style={{ width: '4.2rem' }}>
                            {months[week[0].getMonth()]}
                        </span>
                    ))}
                </div>

                <div className='flex gap-2 w-full overflow-x-auto no-scrollbar pb-2'>
                    {/* Day labels */}
                    <div className='flex flex-col gap-1 pr-1 text-[10px] text-gray-500 mt-[2px] font-medium'>
                        {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                            <div key={i} className="h-[10px] flex items-center">{d}</div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className='flex gap-[3px] h-full'>
                        {weekColumns.map((week, wi) => (
                            <div key={wi} className='flex flex-col gap-[3px] h-full'>
                                {week.map(day => {
                                    const key = format(day, 'yyyy-MM-dd');
                                    const d = dataMap.get(key);
                                    const level = d?.intensity_level ?? 0;
                                    return (
                                        <div
                                            key={key}
                                            className={`w-[10px] h-[10px] rounded-[1px] cursor-pointer transition-all duration-200
                        hover:scale-125 hover:z-10 hover:shadow-[0_0_8px_rgba(59,130,246,0.5)] ${INTENSITY_COLORS[level]}`}
                                            onMouseEnter={e => {
                                                const rect = (e.currentTarget).getBoundingClientRect();
                                                setTooltip({
                                                    date: format(day, 'MMMM d, yyyy'),
                                                    sessions: d?.session_count ?? 0,
                                                    score: d?.avg_score ?? 0,
                                                    x: rect.left,
                                                    y: rect.top,
                                                });
                                            }}
                                            onMouseLeave={() => setTooltip(null)}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div className='fixed z-[100] bg-gray-900/90 backdrop-blur-md text-white text-xs rounded-xl px-4 py-3
          pointer-events-none shadow-2xl border border-gray-700/50 animate-in fade-in zoom-in duration-100'
                    style={{
                        left: `${tooltip.x + 16}px`,
                        top: `${tooltip.y - 40}px`
                    }}
                >
                    <p className='font-bold text-blue-400 mb-1'>{tooltip.date}</p>
                    {tooltip.sessions > 0 ? (
                        <div className="space-y-0.5 opacity-90">
                            <p>Sessions: <span className="text-white font-medium">{tooltip.sessions}</span></p>
                            <p>Avg Score: <span className="text-white font-medium">{tooltip.score.toFixed(1)} / 10</span></p>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No interview sessions</p>
                    )}
                </div>
            )}
        </div>
    );
}

'use client';
import {
    LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts';
import { format } from 'date-fns';

interface SpeechSession {
    session_date: string;
    avg_comm_score: number;
    avg_wpm: number;
    avg_filler_rate: number;
}

export default function SpeechTrendChart({ sessions }: { sessions: SpeechSession[] }) {
    const chartData = sessions.map(s => ({
        date: format(new Date(s.session_date), 'MMM d'),
        score: s.avg_comm_score,
        wpm: s.avg_wpm,
        filler: s.avg_filler_rate,
    }));

    return (
        <div className='bg-gray-900 rounded-[2.5rem] border border-gray-800 p-8 space-y-6 shadow-2xl relative overflow-hidden'>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] rounded-full" />

            <div className="flex items-center justify-between">
                <div>
                    <h3 className='text-white font-black text-xl tracking-tight'>Communication Ecliptic</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Historical Articulation Accuracy</p>
                </div>
                <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">📈</div>
                </div>
            </div>

            <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                        <XAxis
                            dataKey='date'
                            tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            domain={[0, 10]}
                            tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: '#111827',
                                border: '1px solid #374151',
                                borderRadius: '1rem',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                            itemStyle={{ color: '#3b82f6', fontWeight: 800, fontSize: '12px' }}
                            labelStyle={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 900 }}
                            formatter={(v: any) => [`${v}/10`, 'Comm Score']}
                        />
                        <ReferenceLine
                            y={8}
                            stroke='#10b981'
                            strokeDasharray='5 5'
                            strokeWidth={1}
                            label={{ value: 'ELITE', fill: '#10b981', fontSize: 10, fontWeight: 900, position: 'right' }}
                        />
                        <ReferenceLine
                            y={6}
                            stroke='#f59e0b'
                            strokeDasharray='5 5'
                            strokeWidth={1}
                            label={{ value: 'TARGET', fill: '#f59e0b', fontSize: 10, fontWeight: 900, position: 'right' }}
                        />
                        <Line
                            type='monotone'
                            dataKey='score'
                            stroke='#3b82f6'
                            strokeWidth={4}
                            dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#111827' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            animationDuration={2000}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-gray-800/30 rounded-2xl border border-gray-800/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Peak Score</p>
                    <p className="text-xl font-black text-white">{Math.max(...chartData.map(d => d.score), 0)}<span className="text-xs text-gray-600">/10</span></p>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-2xl border border-gray-800/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Latest Form</p>
                    <p className="text-xl font-black text-white">{chartData[chartData.length - 1]?.score || 0}<span className="text-xs text-gray-600">/10</span></p>
                </div>
            </div>
        </div>
    );
}

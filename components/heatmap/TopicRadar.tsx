'use client';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface TopicScore {
    topic: string;
    avg_score: number;
    attempt_count: number;
}

export default function TopicRadar({ topics }: { topics: TopicScore[] }) {
    // Take top 8 most-attempted topics for the radar
    const radarData = topics
        .filter(t => t.attempt_count >= 1)
        .sort((a, b) => b.attempt_count - a.attempt_count)
        .slice(0, 8)
        .map(t => ({
            topic: t.topic.length > 12 ? t.topic.slice(0, 12) + '...' : t.topic,
            score: Math.round(t.avg_score * 10),  // scale 0-100 for better viz
            fullName: t.topic,
            attempts: t.attempt_count,
        }));

    if (radarData.length < 3) {
        return (
            <div className='bg-gray-900 rounded-2xl border border-gray-800 p-6 flex flex-col items-center justify-center min-h-[340px] text-center'>
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">📊</span>
                </div>
                <p className='text-gray-300 font-medium mb-1'>Skill Radar Unavailable</p>
                <p className='text-gray-500 text-sm max-w-[200px]'>
                    Complete 3+ distinct interview topics to see your skill distribution.
                </p>
            </div>
        );
    }

    return (
        <div className='bg-gray-900 rounded-2xl border border-gray-800 p-6'>
            <div className="mb-6">
                <h3 className='text-white font-bold text-lg'>Analysis Radar</h3>
                <p className="text-gray-400 text-sm">Visualizing your topical proficiency</p>
            </div>

            <div className="flex items-center justify-center">
                <ResponsiveContainer width='100%' height={340}>
                    <RadarChart data={radarData}>
                        <PolarGrid stroke='#374151' strokeDasharray="3 3" />
                        <PolarAngleAxis
                            dataKey='topic'
                            tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
                        />
                        <Radar
                            name='Score'
                            dataKey='score'
                            stroke='#3b82f6'
                            fill='#3b82f6'
                            fillOpacity={0.2}
                            strokeWidth={2}
                            animationDuration={1500}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(17, 24, 39, 0.95)',
                                border: '1px solid rgba(55, 65, 81, 0.5)',
                                borderRadius: '12px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                padding: '12px'
                            }}
                            itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
                            labelStyle={{ color: '#fff', marginBottom: '4px', fontWeight: 700 }}
                            formatter={(value: any, name: any, props: any) => [
                                `${(value / 10).toFixed(1)} / 10`,
                                `Attempts: ${props.payload.attempts}`
                            ]}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

'use client';
import type { SpeechMetrics } from '@/services/speech-analyzer';

const PACE_COLORS: Record<string, string> = {
    'too slow': 'text-blue-400 bg-blue-400/10',
    'slow': 'text-cyan-400 bg-cyan-400/10',
    'ideal': 'text-green-400 bg-green-400/10',
    'slightly fast': 'text-yellow-400 bg-yellow-400/10',
    'too fast': 'text-red-400 bg-red-400/10',
};

function ScoreGauge({ score, label }: { score: number; label: string }) {
    const color = score >= 8 ? 'text-green-400' : score >= 6 ? 'text-yellow-400' : 'text-red-400';
    const barColor = score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className='space-y-1'>
            <div className='flex justify-between text-xs'>
                <span className='text-gray-400'>{label}</span>
                <span className={`font-bold ${color}`}>{score}/10</span>
            </div>
            <div className='h-1.5 bg-gray-700 rounded-full overflow-hidden'>
                <div className={`h-full ${barColor} transition-all duration-700`}
                    style={{ width: `${score * 10}%` }} />
            </div>
        </div>
    );
}

export default function SpeechReport({ metrics }: { metrics: SpeechMetrics }) {
    const paceClass = PACE_COLORS[metrics.pace_label] ?? 'text-gray-400';

    const topFillers = Object.entries(metrics.filler_breakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return (
        <div className='bg-gray-900 rounded-3xl border border-gray-800 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
            <div className='flex items-center justify-between'>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl">🎙️</div>
                    <div>
                        <h3 className='text-white font-black tracking-tight text-lg'>Vocal Intelligence</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Post-Response Speech Diagnostics</p>
                    </div>
                </div>
                <div className='text-right'>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Comm Score</p>
                    <div className={`text-4xl font-display font-black leading-none ${metrics.communication_score >= 8 ? 'text-emerald-400' :
                        metrics.communication_score >= 6 ? 'text-amber-400' : 'text-rose-400'
                        }`}>{metrics.communication_score}<span className="text-sm text-gray-600 ml-1">/10</span></div>
                </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4'>
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl md:rounded-2xl p-4 md:p-5 text-center relative overflow-hidden group'>
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform text-xs md:text-base">⚡</div>
                    <p className='text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1.5 md:mb-2'>Pace</p>
                    <p className='text-white font-black text-xl md:text-2xl mb-1'>{metrics.words_per_minute}</p>
                    <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 md:py-1 rounded-full ${paceClass}`}>
                        {metrics.pace_label}
                    </span>
                </div>
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl md:rounded-2xl p-4 md:p-5 text-center relative overflow-hidden group'>
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform text-xs md:text-base">🛑</div>
                    <p className='text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1.5 md:mb-2'>Fillers</p>
                    <p className={`font-black text-xl md:text-2xl mb-1 ${metrics.filler_rate_percent <= 2 ? 'text-emerald-400' :
                        metrics.filler_rate_percent <= 5 ? 'text-amber-400' : 'text-rose-400'
                        }`}>{metrics.filler_rate_percent.toFixed(1)}%</p>
                    <p className='text-gray-500 text-[8px] md:text-[9px] font-bold'>{metrics.filler_count} detected</p>
                </div>
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl md:rounded-2xl p-4 md:p-5 text-center relative overflow-hidden group'>
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform text-xs md:text-base">📚</div>
                    <p className='text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1.5 md:mb-2'>Lexicon</p>
                    <p className={`font-black text-xl md:text-2xl mb-1 ${metrics.vocabulary_richness >= 0.65 ? 'text-emerald-400' :
                        metrics.vocabulary_richness >= 0.5 ? 'text-amber-400' : 'text-rose-400'
                        }`}>{Math.round(metrics.vocabulary_richness * 100)}%</p>
                    <p className='text-gray-500 text-[8px] md:text-[9px] font-bold'>Unique words</p>
                </div>
            </div>


            <div className="space-y-4">
                <ScoreGauge score={metrics.communication_score} label='Overall Articulation Performance' />
            </div>

            {topFillers.length > 0 && (
                <div className='space-y-3'>
                    <p className='text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1'>
                        Red-Flag Phrases
                    </p>
                    <div className='flex flex-wrap gap-2'>
                        {topFillers.map(([word, count]) => (
                            <span key={word}
                                className={`text-xs px-4 py-2 rounded-xl font-bold border flex items-center gap-2 transition-all hover:scale-105 ${count >= 5
                                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                                    : count >= 3
                                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                        : 'bg-gray-800 text-gray-400 border-gray-700'
                                    }`}
                            >
                                <span className="opacity-50">&quot;{word}&quot;</span>
                                <span className="w-5 h-5 rounded-md bg-black/20 flex items-center justify-center text-[10px]">{count}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {metrics.feedback_tips.length > 0 && (
                <div className='bg-gray-800/30 border border-gray-700/50 rounded-[2rem] p-6 space-y-4'>
                    <p className='text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1'>
                        Communication Roadmap
                    </p>
                    <div className='grid gap-3'>
                        {metrics.feedback_tips.map((tip, i) => (
                            <div key={i} className='flex items-start gap-4 p-3 bg-gray-900/50 rounded-2xl border border-gray-800 group hover:border-blue-500/30 transition-all'>
                                <div className='w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-[10px] text-blue-400 mt-0.5 group-hover:scale-110 transition-transform'>
                                    {i + 1}
                                </div>
                                <p className='text-gray-300 text-sm font-medium leading-relaxed'>{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {metrics.feedback_tips.length === 0 && metrics.communication_score >= 8 && (
                <div className='bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-6 text-center animate-pulse'>
                    <p className='text-emerald-400 font-black text-sm uppercase tracking-widest'>
                        Top-Tier Communication! Mastery Demonstrated.
                    </p>
                </div>
            )}
        </div>
    );
}

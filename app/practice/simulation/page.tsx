'use client';

import { Suspense } from 'react';
import TimedSimulation from '@/components/practice/TimedSimulation';
import { Terminal } from 'lucide-react';

export default function SimulationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Terminal className="text-[var(--accent)] animate-pulse" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Initializing_Simulation_Protocol</p>
                </div>
            </div>
        }>
            <TimedSimulation />
        </Suspense>
    );
}

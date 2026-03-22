'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { NotificationCenter } from '@/components/widgets/NotificationCenter';
import { Bell, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
    return (
        <div className="min-h-screen bg-bg-base text-text-primary pb-20">
            <Header />
            
            <main className="max-w-4xl mx-auto pt-32 px-6">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <Link href="/dashboard" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors mb-6 group w-fit">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Return to Command
                        </Link>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-brand-primary/10 rounded-2xl border border-brand-primary/20 text-brand-primary">
                                <Bell size={24} />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                                Neural <span className="text-transparent bg-clip-text bg-brand-gradient">Intel</span>
                            </h1>
                        </div>
                        <p className="text-text-muted text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck size={12} className="text-brand-success" />
                            Live_Data_Ingestion_Active
                        </p>
                    </div>
                </div>

                <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <NotificationCenter isOpen={true} onClose={() => {}} isStatic={true} />
                </div>
            </main>
        </div>
    );
}

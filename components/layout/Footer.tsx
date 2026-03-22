'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="py-20 px-6 border-t border-border-subtle bg-bg-surface/10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-xl tracking-tight text-text-primary">
                        placement<span className="text-brand-primary">intel</span>
                    </span>
                    <span className="badge-lnmiit">LNMIIT</span>
                </div>
                <div className="flex gap-8 text-[10px] font-black tracking-[0.2em] text-text-muted uppercase italic">
                    <a href="#" className="hover:text-brand-primary transition-colors">Privacy_Protocol</a>
                    <a href="#" className="hover:text-brand-primary transition-colors">Terms_and_Conditions</a>
                    <a href="#" className="hover:text-brand-primary transition-colors">Support_Sector</a>
                    <a href="#" className="hover:text-brand-secondary transition-colors text-brand-secondary/80">Download_Extension</a>
                    <a href="#" className="hover:text-brand-primary transition-colors">LinkedIn_Network</a>
                </div>
                <p className="text-[10px] font-bold text-text-muted/40 uppercase tracking-widest font-mono">© 2024 SELECTION INTELLIGENCE. MISSION ACCOMPLISHED.</p>
            </div>
        </footer>
    );
}

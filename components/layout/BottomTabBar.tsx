'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout, Library, Target, Terminal, User } from 'lucide-react';
import { motion } from 'framer-motion';

const TABS = [
    { title: 'Home', href: '/dashboard', icon: Layout },
    { title: 'Sheets', href: '/sheets', icon: Library },
    { title: 'Daily', href: '/daily-challenge', icon: Target },
    { title: 'Interview', href: '/interviewer', icon: Terminal },
    { title: 'Profile', href: '/profile', icon: User },
];

export function BottomTabBar() {
    const pathname = usePathname();

    // Hide on auth pages
    if (pathname.startsWith('/auth')) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-bg-elevated/80 backdrop-blur-xl border-t border-border-subtle safe-area-bottom">
            <div className="flex items-center justify-around h-16">
                {TABS.map((tab) => {
                    const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href));
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.title}
                            href={tab.href}
                            className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 group"
                        >
                            <div className={`relative p-1.5 transition-all duration-300 ${isActive ? 'text-brand-primary' : 'text-text-muted hover:text-text-secondary'}`}>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                {isActive && (
                                    <motion.div
                                        layoutId="tab-indicator"
                                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-primary rounded-full shadow-[0_0_8px_var(--brand-primary)]"
                                        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                                    />
                                )}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${isActive ? 'text-brand-primary' : 'text-text-muted/60'}`}>
                                {tab.title}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

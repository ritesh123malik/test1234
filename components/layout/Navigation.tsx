'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal,
    Bell,
    Settings,
    Building2,
    Layout,
    Users,
    Wrench,
    Target,
    Brain,
    FileText,
    MessagesSquare,
    TrendingUp,
    Scale,
    History,
    Calculator,
    Library,
    Info,
    Trophy,
    ChevronDown
} from 'lucide-react';

const MENU_ITEMS = [
    {
        title: 'Practice',
        icon: <Brain size={14} />,
        columns: [
            {
                items: [
                    { title: 'Strategic Practice Vault', desc: 'Arrays, Trees, DP, Graphs, OS, DBMS', href: '/practice', icon: <Brain size={16} />, badge: 'LIVE' },
                    { title: 'AI Mock Interview', desc: 'Real-time 1-on-1 AI interviewer', href: '/interviewer', icon: <Terminal size={16} />, badge: 'NEW' },
                    { title: 'Daily Challenge', desc: 'Solve one DSA problem daily & earn XP', href: '/daily-challenge', icon: <Target size={16} />, badge: 'HOT' },
                    { title: 'Resume Tips', desc: 'ATS optimization, project framing tips', href: '/resume', icon: <FileText size={16} /> }
                ]
            }
        ]
    },
    {
        title: 'Companies',
        icon: <Building2 size={14} />,
        columns: [
            {
                items: [
                    { title: 'All Companies', desc: 'Filter by package, industry, difficulty', href: '/companies', icon: <Building2 size={16} /> },
                    { title: 'Companies at LNMIIT', desc: 'Top 50 companies at LNMIIT', href: '/companies?filter=dream', icon: <TrendingUp size={16} />, badge: 'HOT' },
                    { title: 'Salary Insights', desc: 'CTC distribution charts and trends', href: '/salary-insights', icon: <Scale size={16} />, badge: 'NEW' }
                ]
            }
        ]
    },
    {
        title: 'Track',
        icon: <Layout size={14} />,
        columns: [
            {
                items: [
                    { title: 'My Dashboard', desc: 'Your full progress overview', href: '/dashboard', icon: <Layout size={16} /> },
                    { title: 'Question Sheets', desc: 'SDE Sheets (Striver, Blind75, etc)', href: '/sheets', icon: <Library size={16} />, badge: 'NEW' },
                    { title: 'Contest Calendar', desc: 'Global coding contest schedule', href: '/dashboard#contests', icon: <Trophy size={16} />, badge: 'LIVE' },
                ]
            }
        ]
    },
    {
        title: 'Community',
        icon: <Users size={14} />,
        columns: [
            {
                items: [
                    { title: 'Interview Reviews', desc: 'Read/write interview experiences', href: '/experiences', icon: <MessagesSquare size={16} /> },
                    { title: 'Topic Heatmap', desc: 'Visual strength & weakness analysis', href: '/heatmap', icon: <TrendingUp size={16} />, badge: 'NEW' },
                    { title: 'Leaderboard', desc: 'XP-based student rankings', href: '/leaderboard', icon: <Trophy size={16} />, badge: 'HOT' }
                ]
            }
        ]
    }
];

export function Navigation() {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    return (
        <nav className="flex items-center gap-1">
            {MENU_ITEMS.map((item) => (
                <div
                    key={item.title}
                    onMouseEnter={() => setActiveMenu(item.title)}
                    onMouseLeave={() => setActiveMenu(null)}
                    className="relative py-4"
                >
                    <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all
            ${activeMenu === item.title ? 'text-brand-primary bg-bg-overlay' : 'text-text-secondary hover:text-text-primary'}
          `}>
                        {item.title}
                        <ChevronDown size={14} className={`transition-transform duration-200 ${activeMenu === item.title ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {activeMenu === item.title && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute top-full left-0 pt-2 z-50 pointer-events-auto"
                            >
                                <div className="glass-card min-w-[320px] p-2 bg-bg-elevated/95 border-border-strong overflow-hidden">
                                    <div className="grid grid-cols-1 gap-1">
                                        {item.columns[0].items.map((subItem) => (
                                            <Link
                                                key={subItem.title}
                                                href={subItem.href}
                                                className="flex items-start gap-3 p-3 rounded-xl hover:bg-bg-overlay transition-all group/item"
                                            >
                                                <div className="mt-1 p-2 rounded-lg bg-bg-muted text-text-muted group-hover/item:text-brand-primary group-hover/item:bg-brand-primary/10 transition-all">
                                                    {subItem.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="font-bold text-sm text-text-primary group-hover/item:text-brand-primary transition-colors">
                                                            {subItem.title}
                                                        </span>
                                                        {subItem.badge && (
                                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded
                                ${subItem.badge === 'HOT' ? 'bg-red-500/10 text-red-500' :
                                                                    subItem.badge === 'NEW' ? 'bg-brand-success/10 text-brand-success' :
                                                                        'bg-brand-tertiary/10 text-brand-tertiary'}
                              `}>
                                                                {subItem.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-text-muted leading-relaxed uppercase tracking-widest font-medium opacity-60">
                                                        {subItem.desc}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </nav>
    );
}


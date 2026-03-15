'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui-store';
import Link from 'next/link';
import { X, Search, User, LayoutDashboard, Trophy, Settings, LogOut, Building2, Brain, FileText, MessagesSquare, GraduationCap } from 'lucide-react';
import { StreakWidget } from '../widgets/StreakWidget';
import { CGPAChip } from '../widgets/CGPAChip';

export function MobileDrawer() {
    const { isMobileMenuOpen, setMobileMenuOpen, setSearchOpen } = useUIStore();

    const NAV_LINKS = [
        { title: 'Topicwise Practice', icon: <Brain size={18} />, href: '/practice' },
        { title: 'AI Roadmaps', icon: <GraduationCap size={18} />, href: '/roadmap' },
        { title: 'Companies', icon: <Building2 size={18} />, href: '/companies' },
        { title: 'Reviews', icon: <MessagesSquare size={18} />, href: '/review' },
        { title: 'Resume', icon: <FileText size={18} />, href: '/resume' },
        { title: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/dashboard' },
    ];

    return (
        <AnimatePresence>
            {isMobileMenuOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm z-[200] bg-bg-elevated border-l border-border-strong flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                            <span className="font-display font-bold text-lg text-text-primary">
                                Menu
                            </span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 rounded-xl bg-bg-muted hover:bg-bg-overlay transition-all"
                            >
                                <X size={20} className="text-text-primary" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Search Trigger */}
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    setSearchOpen(true);
                                }}
                                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-bg-base border border-border-subtle text-text-muted"
                            >
                                <Search size={20} className="text-brand-primary" />
                                <span className="text-sm font-medium">Search anything...</span>
                            </button>

                            {/* Engagement Widgets */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-bg-base border border-border-subtle">
                                <div className="flex flex-col items-center gap-1">
                                    <StreakWidget streak={12} />
                                    <span className="text-[10px] font-black text-text-muted uppercase">Streak</span>
                                </div>
                                <div className="h-8 w-[1px] bg-border-subtle" />
                                <div className="flex flex-col items-center gap-1">
                                    <CGPAChip cgpa={8.92} />
                                    <span className="text-[10px] font-black text-text-muted uppercase">GPA</span>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <nav className="space-y-2">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-2 mb-4">Platform</p>
                                {NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.title}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-bg-overlay text-text-secondary hover:text-text-primary transition-all group"
                                    >
                                        <div className="p-2 rounded-xl bg-bg-muted text-text-muted group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-all">
                                            {link.icon}
                                        </div>
                                        <span className="font-bold text-sm">{link.title}</span>
                                    </Link>
                                ))}
                            </nav>

                            {/* User Section (Mocked) */}
                            <div className="space-y-4 pt-4 border-t border-border-subtle">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-2">Account</p>
                                <div className="p-4 rounded-2xl bg-bg-base border border-border-subtle flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold">R</div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-text-primary">Ritish Malik</p>
                                        <p className="text-[10px] text-text-muted">LNMIT Student</p>
                                    </div>
                                </div>
                                <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-brand-danger hover:bg-brand-danger/5 transition-all">
                                    <LogOut size={20} />
                                    <span className="font-bold text-sm text-left">Sign Out</span>
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 text-center border-t border-border-subtle">
                            <p className="text-[10px] font-black text-text-muted/30 tracking-widest">PLACEMENTINTEL © 2024</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

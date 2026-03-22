'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui-store';
import { useScrollHeader } from '@/hooks/useScrollHeader';
import { Search, Bell, Menu, X, Flame, GraduationCap, ChevronDown, LogOut, User, LayoutDashboard, Trophy, Settings, MessageSquare } from 'lucide-react';
import { Navigation } from './Navigation';
import { StreakWidget } from '../widgets/StreakWidget';
import { CGPAChip } from '../widgets/CGPAChip';
import { NotificationBell } from '../widgets/NotificationBell';
import { ThemeToggle } from '../widgets/ThemeToggle';
import { NotificationCenter } from '../widgets/NotificationCenter';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function Header() {
    useScrollHeader();
    const router = useRouter();
    const { headerScrolled, setMobileMenuOpen, setSearchOpen } = useUIStore();
    const [user, setUser] = useState<{ id: string; name: string; avatarUrl?: string; xp: number; streak: number; cgpa: number } | null>(null);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Try to get profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                setUser({
                    id: session.user.id,
                    name: profile?.full_name || session.user.user_metadata?.full_name || 'Student',
                    xp: profile?.xp || 0,
                    streak: profile?.streak || 0,
                    cgpa: Number(profile?.cgpa || 0)
                });
            } else {
                setUser(null);
            }
        };

        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                fetchUser();
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const readinessPercentage = user ? (user.xp / 1000) * 100 : 0;

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            {/* Readiness Progress Bar */}
            <div className="h-[3px] w-full bg-bg-muted overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${readinessPercentage}%` }}
                    transition={{ delay: 0.5, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                    className="h-full bg-brand-gradient"
                />
            </div>

            {/* Main Header Bar */}
            <div
                className={`h-[60px] px-6 transition-all duration-300 flex items-center justify-between border-b 
          ${headerScrolled
                        ? 'bg-bg-base/85 backdrop-blur-xl border-border-subtle shadow-lg'
                        : 'bg-transparent border-transparent'
                    }`}
            >
                {/* Left Section: Logo */}
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <div className="absolute inset-0 bg-brand-primary rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="w-6 h-6 border-2 border-brand-tertiary border-t-transparent rounded-full"
                            />
                            <div className="absolute w-2 h-2 bg-brand-primary rounded-full" />
                        </div>
                        <span className="font-display font-bold text-lg tracking-tight text-text-primary">
                            placement<span className="text-brand-primary">intel</span>
                        </span>
                        <span className="badge-lnmiit">LNMIIT</span>
                    </Link>
                </div>

                {/* Center Section: Navigation (Desktop) */}
                <div className="hidden lg:block flex-1 max-w-2xl px-8">
                    <Navigation />
                </div>

                {/* Right Section: Widgets & User */}
                <div className="flex items-center gap-4">
                    {/* Search Trigger (Center-ish on desktop, Icon on mobile) */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const q = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                            if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
                        }}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-overlay border border-border-subtle text-text-muted hover:border-border-accent transition-all group"
                    >
                        <Search size={16} className="group-hover:text-brand-primary transition-colors" />
                        <input
                            name="search"
                            type="text"
                            placeholder="Search intel..."
                            className="bg-transparent border-none outline-none text-sm w-24 lg:w-32 focus:w-48 transition-all"
                        />
                        <span className="hidden lg:inline-block text-[10px] bg-bg-muted px-1.5 py-0.5 rounded border border-border-strong ml-2">↵</span>
                    </form>

                    <button onClick={() => setSearchOpen(true)} className="md:hidden text-text-secondary p-2 touch-target">
                        <Search size={20} />
                    </button>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-3 pr-2 border-r border-border-default">
                                <StreakWidget streak={user.streak} />
                                <CGPAChip cgpa={user.cgpa} />
                            </div>
                            <NotificationBell onClick={() => setIsNotifOpen(true)} />
                            <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

                            {/* User Menu */}
                            <div className="relative group/user">
                                <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-bg-overlay transition-all">
                                    <div className="w-8 h-8 rounded-full bg-brand-gradient p-[1px]">
                                        <div className="w-full h-full rounded-full bg-bg-base flex items-center justify-center overflow-hidden">
                                            <User size={16} className="text-brand-primary" />
                                        </div>
                                    </div>
                                    <ChevronDown size={14} className="text-text-muted transition-transform group-hover/user:rotate-180" />
                                </button>

                                {/* User Dropdown */}
                                <div className="absolute top-full right-0 pt-2 w-56 opacity-0 translate-y-2 pointer-events-none group-hover/user:opacity-100 group-hover/user:translate-y-0 group-hover/user:pointer-events-auto transition-all duration-200">
                                    <div className="glass-card p-2 bg-bg-elevated/95 backdrop-blur-2xl">
                                        <div className="p-3 border-b border-border-subtle mb-1">
                                            <p className="font-bold text-sm text-text-primary capitalize">{user.name}</p>
                                            <p className="text-[10px] text-text-muted">LNMIIT Student • {user.xp} XP</p>
                                        </div>
                                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-overlay text-sm text-text-secondary hover:text-text-primary transition-all">
                                            <User size={16} /> My Profile
                                        </Link>
                                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-overlay text-sm text-text-secondary hover:text-text-primary transition-all">
                                            <LayoutDashboard size={16} /> My Dashboard
                                        </Link>
                                        <Link href="/leaderboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-overlay text-sm text-text-secondary hover:text-text-primary transition-all">
                                            <Trophy size={16} /> Leaderboard
                                        </Link>
                                        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-overlay text-sm text-text-secondary hover:text-text-primary transition-all">
                                            <Settings size={16} /> Settings
                                        </Link>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText('intelplacement0@gmail.com');
                                                toast.success('Support email copied! Opening mailer...');
                                                window.location.href = 'mailto:intelplacement0@gmail.com?subject=Feedback';
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-overlay text-sm text-text-secondary hover:text-text-primary transition-all text-left"
                                        >
                                            <MessageSquare size={16} /> Send Feedback
                                        </button>
                                        <div className="h-[1px] bg-border-subtle my-1" />
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brand-danger/10 text-sm text-brand-danger transition-all"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/auth/login" className="hidden sm:block text-sm font-semibold text-text-secondary hover:text-text-primary">Sign In</Link>
                            <Link href="/auth/signup" className="text-[11px] sm:text-sm font-bold text-white bg-brand-primary px-3 sm:px-4 py-2 rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all">Get Started</Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-text-secondary p-1 ml-1 sm:ml-2">
                        <Menu size={22} />
                    </button>
                </div>
            </div>
        </header>

    );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Calculator, Flame, Building2, MessagesSquare, Trophy, ArrowUpRight } from 'lucide-react';

const FEATURES = [
    {
        title: 'AI-Powered Insights',
        desc: 'Personalized placement roadmaps and interview predictions based on your skill profile and LNMIT target data.',
        icon: <Sparkles className="text-brand-primary" size={32} />,
        href: '/roadmap',
        span: 'col-span-full md:col-span-2 row-span-1',
        color: 'brand-primary'
    },
    {
        title: 'AI Mock Interview',
        desc: 'Real-time 1-on-1 AI interviewer with voice support and FAANG-level feedback.',
        icon: <MessagesSquare className="text-brand-tertiary" size={24} />,
        href: '/interviewer',
        span: 'col-span-1',
        color: 'brand-tertiary',
        badge: 'NEW'
    },
    {
        title: 'Smart CGPA',
        desc: 'Calculate SGPA and track your journey to the magic 8.5 mark.',
        icon: <Calculator className="text-brand-success" size={24} />,
        href: '/cgpa-calculator',
        span: 'col-span-1',
        color: 'brand-success'
    },
    {
        title: 'Live Streak',
        desc: 'Gamify your preparation with daily streaks and XP.',
        icon: <Flame className="text-brand-warning" size={24} />,
        href: '/dashboard',
        span: 'col-span-1',
        color: 'brand-warning'
    },
    {
        title: 'Company Intelligence',
        desc: 'Deep dives into 150+ companies that visit LNMIT. Test formats, interview rounds, and real student experiences.',
        icon: <Building2 className="text-brand-tertiary" size={24} />,
        href: '/companies',
        span: 'col-span-full',
        color: 'brand-tertiary'
    },
    {
        title: 'Interview Reviews',
        desc: 'Unfiltered experiences from seniors who joined top firms.',
        icon: <MessagesSquare className="text-text-accent" size={24} />,
        href: '/review',
        span: 'col-span-1',
        color: 'brand-primary'
    },
    {
        title: 'Leaderboard',
        desc: 'See where you stand among your peers in LNMIT.',
        icon: <Trophy className="text-brand-warning" size={24} />,
        href: '/leaderboard',
        span: 'col-span-1',
        color: 'brand-warning'
    }
];

export function Features() {
    return (
        <section className="py-24 px-6 relative max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-block px-4 py-1.5 rounded-full glass-card bg-bg-surface/40 mb-6 border-border-subtle"
                >
                    <span className="text-[10px] font-black tracking-widest text-brand-primary uppercase">Elite Toolkit</span>
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-display font-black text-text-primary tracking-tight mb-4">
                    Everything You Need, <span className="text-text-muted">In One Place</span>
                </h2>
                <p className="text-text-secondary max-w-2xl mx-auto font-medium">
                    Integrated technical and academic tools designed to handle every aspect of your placement journey at LNMIT.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
                {FEATURES.map((feature, i) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`${feature.span}`}
                    >
                        <Link href={feature.href} className="group block h-full">
                            <div className="glass-card bg-bg-surface/40 hover:bg-bg-overlay/60 border-border-subtle hover:border-border-accent h-full p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1">
                                {/* Glow Effect */}
                                <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${feature.color} opacity-0 group-hover:opacity-[0.05] blur-3xl transition-opacity duration-500`} />

                                <div>
                                    <div className="mb-4 p-3 inline-flex rounded-2xl bg-bg-muted group-hover:scale-110 transition-transform duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-display font-black text-text-primary group-hover:text-brand-primary transition-colors flex items-center gap-2">
                                        {feature.title}
                                        <ArrowUpRight size={16} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                                    </h3>
                                </div>

                                <p className="text-sm text-text-secondary leading-relaxed font-medium">
                                    {feature.desc}
                                </p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

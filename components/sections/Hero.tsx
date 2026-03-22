'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, Play, Star, Users, Building2, TrendingUp, ShieldCheck } from 'lucide-react';

export function Hero() {
    const router = useRouter();
    const [counts, setCounts] = useState({ students: 0, companies: 0, reviews: 0, rate: 0 });

    useEffect(() => {
        // Count-up animation simulation (actual data would come from stats-service if dynamic)
        const target = { students: 2400, companies: 150, reviews: 5000, rate: 98 };
        const duration = 2000;
        const frameDuration = 1000 / 60;
        const totalFrames = Math.round(duration / frameDuration);

        let frame = 0;
        const timer = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            setCounts({
                students: Math.floor(target.students * progress),
                companies: Math.floor(target.companies * progress),
                reviews: Math.floor(target.reviews * progress),
                rate: Math.floor(target.rate * progress)
            });
            if (frame === totalFrames) clearInterval(timer);
        }, frameDuration);

        return () => clearInterval(timer);
    }, []);

    const headlineWords = ["Elevate", "Your", "Placement", "Journey."];

    return (
        <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex flex-col items-center">
            {/* Background Decor */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-primary opacity-[0.08] blur-[120px]" />
                <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-brand-tertiary opacity-[0.05] blur-[100px]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-bg-base/50 to-bg-base" />
                <div className="absolute inset-0 bg-mesh opacity-20" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 max-w-5xl w-full text-center">
                {/* Animated Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-border-accent bg-bg-surface/40 mb-8 overflow-hidden group"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-tertiary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-tertiary"></span>
                    </span>
                    <span className="text-[10px] font-black tracking-widest text-text-primary uppercase flex items-center gap-2">
                        Built exclusively for LNMIIT Students
                        <div className="w-[1px] h-3 bg-border-strong mx-1" />
                        <span className="text-brand-tertiary">v1.3 Live</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </motion.div>

                {/* Headline */}
                <h1 className="text-4xl md:text-8xl font-display font-black tracking-tighter text-text-primary mb-8 leading-[1.1] md:leading-[0.9]">
                    {headlineWords.map((word, i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className={`inline-block mr-4 ${word === 'Placement' ? 'bg-brand-gradient bg-clip-text text-transparent' : ''}`}
                        >
                            {word}
                        </motion.span>
                    ))}
                </h1>

                {/* Subtext */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed"
                >
                    The ultimate toolkit to master technical interviews, track your progress, and secure placements at dream companies — powered by real LNMIIT data and AI insights.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
                >
                    <button
                        onClick={() => router.push('/auth/login?redirect=/dashboard')}
                        className="btn-primary-lg px-10 group"
                    >
                        Start Your Journey
                        <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => router.push('/companies')}
                        className="btn-secondary-lg px-10 group"
                    >
                        Explore Companies
                        <Search size={18} className="ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </button>
                </motion.div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 px-8 py-10 glass-card bg-bg-surface/20 border-border-subtle rounded-[var(--radius-xl)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-display font-black text-text-primary tracking-tighter">{counts.students.toLocaleString()}+</span>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-2 group/item">
                            Selected Questions (LC/CF)
                        </span>
                    </div>

                    <div className="flex flex-col items-center border-l border-border-subtle">
                        <span className="text-3xl font-display font-black text-text-primary tracking-tighter">{counts.companies}+</span>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-2">
                            Company Interview Loops
                        </span>
                    </div>

                    <div className="flex flex-col items-center border-t md:border-t-0 md:border-l border-border-subtle pt-8 md:pt-0">
                        <span className="text-3xl font-display font-black text-brand-success tracking-tighter">{counts.rate}%</span>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-2">
                            Data Accuracy
                        </span>
                    </div>

                    <div className="flex flex-col items-center border-t md:border-t-0 md:border-l border-border-subtle pt-8 md:pt-0">
                        <span className="text-3xl font-display font-black text-text-primary tracking-tighter">{counts.reviews.toLocaleString()}+</span>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-2">
                            Intel Nodes
                        </span>
                    </div>
                </div>

                {/* Company Logo Marquee */}
                <div className="mt-24 w-full relative overflow-hidden py-10">
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bg-base to-transparent z-10" />
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bg-base to-transparent z-10" />

                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-8">Companies you can prepare for</p>

                    <div className="flex gap-16 animate-[marquee_40s_linear_infinite] whitespace-nowrap">
                        {['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Adobe', 'Infosys', 'TCS', 'Wipro', 'Deloitte', 'Netflix', 'Meta', 'Apple', 'Oracle', 'Salesforce'].map((company) => (
                            <span key={company} className="flex items-center gap-3 text-2xl font-display font-black text-text-muted/20 hover:text-text-primary transition-colors cursor-default select-none">
                                <div className="w-8 h-8 rounded-lg bg-bg-muted/50 border border-border-subtle flex items-center justify-center grayscale">
                                    <Building2 size={16} />
                                </div>
                                {company.toUpperCase()}
                            </span>
                        ))}
                        {/* Duplicate for seamless loop */}
                        {['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Adobe', 'Infosys', 'TCS', 'Wipro', 'Deloitte', 'Netflix', 'Meta', 'Apple', 'Oracle', 'Salesforce'].map((company) => (
                            <span key={`${company}-2`} className="flex items-center gap-3 text-2xl font-display font-black text-text-muted/20 hover:text-text-primary transition-colors cursor-default select-none">
                                <div className="w-8 h-8 rounded-lg bg-bg-muted/50 border border-border-subtle flex items-center justify-center grayscale">
                                    <Building2 size={16} />
                                </div>
                                {company.toUpperCase()}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </section>
    );
}

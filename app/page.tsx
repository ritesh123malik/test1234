'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { Hero } from '@/components/sections/Hero';
import { Features } from '@/components/sections/Features';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="relative overflow-hidden bg-bg-base">
      <Hero />

      {/* Subtle Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
      </div>

      <Features />

      {/* CTA Section (Bottom) */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-primary/5 blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto glass-card p-12 md:p-24 text-center relative border-border-accent bg-bg-surface/30">
          <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-8 leading-tight">
              Built for <span className="text-brand-tertiary underline decoration-brand-tertiary/30">LNMIITians.</span>
            </h2>
            <p className="text-text-secondary text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
              Join 2,400+ your batchmates already using PlacementIntel to crack top tech companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => router.push('/auth/login')}
                className="btn-primary-lg px-12 group"
              >
                Create Account
                <ArrowUpRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/companies')}
                className="btn-secondary-lg px-12"
              >
                Start Preparation
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

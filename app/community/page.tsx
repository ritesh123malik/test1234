'use client';

import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Trophy, 
  Activity,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
  LayoutGrid,
  Search
} from 'lucide-react';
import { ExperienceFeed } from '@/components/community/ExperienceFeed';
import { ContestRadar } from '@/components/contests/ContestRadar';
import { Leaderboard } from '@/components/community/Leaderboard';
import { ExperienceForm } from '@/components/community/ExperienceForm';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommunityPage() {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'radar' | 'leaderboard'>('feed');

  return (
    <div className="min-h-screen bg-bg text-text pb-20 pt-24 px-6">
      {/* Tactical Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(108,99,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(108,99,255,0.02)_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none z-0"></div>

      <div className="relative max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/20 rounded-2xl border border-accent/30">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h1 className="text-4xl font-black font-syne tracking-tight">Intelligence Hub</h1>
                <p className="text-muted font-bold tracking-[0.2em] uppercase text-xs">Community Driven Placement Insights</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 p-1 bg-surface2/50 border border-border rounded-xl">
            {(['feed', 'radar', 'leaderboard'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                    : 'text-muted hover:text-text'
                }`}
              >
                {tab === 'feed' && <MessageSquare className="w-4 h-4" />}
                {tab === 'radar' && <Activity className="w-4 h-4" />}
                {tab === 'leaderboard' && <Trophy className="w-4 h-4" />}
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Feed Area */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === 'feed' && (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold font-syne flex items-center gap-3">
                       <TrendingUp className="w-6 h-6 text-accent" />
                       Intelligence Stream
                    </h2>
                    <button 
                      onClick={() => setShowForm(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-accent to-accent2 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-accent/20"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Share Experience
                    </button>
                  </div>
                  <ExperienceFeed />
                </motion.div>
              )}

              {activeTab === 'radar' && (
                <motion.div
                  key="radar"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <ContestRadar />
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Leaderboard />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar Stats */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 bg-surface border border-border rounded-3xl relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all"></div>
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2 text-accent font-black uppercase tracking-widest text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        Platform Integrity
                    </div>
                    <h3 className="text-2xl font-black font-syne leading-tight">Contribution Power</h3>
                    <p className="text-sm text-muted leading-relaxed">
                        Every verified experience shared increases your **Neural Power** and visibility to recruiters on the Strike Force.
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="p-4 bg-surface2 border border-border rounded-2xl">
                            <div className="text-2xl font-black font-syne text-accent">1.2k+</div>
                            <div className="text-[10px] text-muted font-bold uppercase">Shared Rounds</div>
                        </div>
                        <div className="p-4 bg-surface2 border border-border rounded-2xl">
                            <div className="text-2xl font-black font-syne text-accent2">45k+</div>
                            <div className="text-[10px] text-muted font-bold uppercase">Community Upvotes</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Shortcuts */}
            <div className="space-y-4">
                <h4 className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] px-2">Mission Control</h4>
                <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 bg-surface2/50 border border-border rounded-2xl flex items-center justify-between hover:bg-surface3/50 transition-colors cursor-not-allowed grayscale">
                        <div className="flex items-center gap-3">
                            <LayoutGrid className="w-5 h-5 text-muted" />
                            <span className="text-sm font-bold opacity-50">Career Roadmap</span>
                        </div>
                        <span className="text-[9px] font-black uppercase text-accent bg-accent/10 px-2 py-0.5 rounded">Coming Soon</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Experience Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-bg/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl"
            >
              <ExperienceForm 
                onSuccess={() => {
                  setShowForm(false);
                  // Optionally refresh feed
                }} 
                onClose={() => setShowForm(false)} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

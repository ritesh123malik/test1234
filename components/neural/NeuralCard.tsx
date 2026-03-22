'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Trophy, 
  Code2, 
  Github, 
  Activity,
  ChevronRight,
  Target,
  BarChart3
} from 'lucide-react';
import { NeuralStats, Profile } from '@/types';

interface NeuralCardProps {
  profile: Profile;
  isOwner?: boolean;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const NeuralCard: React.FC<NeuralCardProps> = ({ 
  profile, 
  isOwner, 
  onSync, 
  isSyncing 
}) => {
  const stats = profile.neural_cache as NeuralStats;
  const score = profile.neural_power_score || 0;

  // Calculate percentage for a hypothetical max of 10000 for the ring
  const scorePercentage = Math.min((score / 10000) * 100, 100);

  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-accent via-accent2 to-accent3 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative bg-surface border border-border rounded-2xl overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b border-border/50 bg-surface2/30">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-accent fill-accent/20" />
                <span className="text-xs font-bold tracking-widest uppercase text-muted">Neural Identity</span>
              </div>
              <h2 className="text-2xl font-bold font-syne text-text">Power Score</h2>
            </div>
            {isOwner && (
              <button 
                onClick={onSync}
                disabled={isSyncing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSyncing 
                    ? 'bg-surface3 text-muted cursor-not-allowed' 
                    : 'bg-accent/10 text-accent hover:bg-accent hover:text-white border border-accent/20'
                }`}
              >
                <Activity className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Profiles'}
              </button>
            )}
          </div>

          {/* Main Score Display */}
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-border"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={364.4}
                  initial={{ strokeDashoffset: 364.4 }}
                  animate={{ strokeDashoffset: 364.4 - (364.4 * scorePercentage) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-accent"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black font-syne">{score}</span>
                <span className="text-[10px] text-muted font-bold tracking-tighter uppercase">Nerve Units</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="p-3 rounded-xl bg-surface2/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted mb-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Global Rank</span>
                </div>
                <div className="text-lg font-bold font-syne">Top 2.4%</div>
              </div>
              <div className="p-3 rounded-xl bg-surface2/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted mb-1">
                  <Target className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Archetype</span>
                </div>
                <div className="text-lg font-bold font-syne text-accent2">Giga-Solver</div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Integration Summary */}
        <div className="p-6 bg-surface/50">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted mb-4">Connected Modules</h3>
          <div className="space-y-3">
            {/* LeetCode */}
            <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              profile.leetcode_handle ? 'bg-surface3/30 border-accent/20' : 'bg-surface2/20 border-border/50 grayscale opacity-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">{profile.leetcode_handle || 'Not Linked'}</div>
                  <div className="text-[10px] text-muted uppercase font-bold tracking-wider">
                    {stats?.leetcode ? `${stats.leetcode.totalSolved} Solved` : 'LeetCode Stats'}
                  </div>
                </div>
              </div>
              {profile.leetcode_handle && <ChevronRight className="w-4 h-4 text-muted" />}
            </div>

            {/* Codeforces */}
            <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              profile.codeforces_handle ? 'bg-surface3/30 border-accent/20' : 'bg-surface2/20 border-border/50 grayscale opacity-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">{profile.codeforces_handle || 'Not Linked'}</div>
                  <div className="text-[10px] text-muted uppercase font-bold tracking-wider">
                    {stats?.codeforces ? `${stats.codeforces.rating} Rating` : 'Codeforces Stats'}
                  </div>
                </div>
              </div>
              {profile.codeforces_handle && <ChevronRight className="w-4 h-4 text-muted" />}
            </div>

            {/* GitHub */}
            <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              profile.github_handle ? 'bg-surface3/30 border-accent/20' : 'bg-surface2/20 border-border/50 grayscale opacity-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">{profile.github_handle || 'Not Linked'}</div>
                  <div className="text-[10px] text-muted uppercase font-bold tracking-wider">
                    {stats?.github ? `${stats.github.stars} Stars` : 'GitHub Stats'}
                  </div>
                </div>
              </div>
              {profile.github_handle && <ChevronRight className="w-4 h-4 text-muted" />}
            </div>
          </div>
        </div>

        {/* Sync Status Footer */}
        {profile.neural_synced_at && (
          <div className="px-6 py-3 bg-surface3/20 border-t border-border/50 flex items-center justify-between">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Last Synced</span>
            <span className="text-[10px] text-accent font-bold uppercase tracking-wider">
              {new Date(profile.neural_synced_at).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  Bell, 
  Filter,
  Trophy,
  Activity,
  ChevronRight,
  Download
} from 'lucide-react';
import { Contest } from '@/types';

export const ContestRadar: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'leetcode' | 'codeforces' | 'atcoder'>('all');

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await fetch('/api/contests');
        const data = await res.json(); // Parse JSON first to get potential error message

        if (!res.ok) { // Check HTTP status
          throw new Error(data.error || `HTTP error! status: ${res.status}`);
        }
        
        if (data.error) {
          console.error('Contest API Error:', data.error);
          setContests([]);
        } else {
          // Ensure data is an array before setting it. This handles non-array responses.
          setContests(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch contests:', err); // Log the actual error object
        setContests([]); // Ensure contests are empty on error
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const filteredContests = contests.filter(c => 
    filter === 'all' || c.platform === filter
  ).slice(0, 10);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'leetcode': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'codeforces': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'atcoder': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-accent bg-accent/10 border-accent/20';
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-accent2 via-accent to-accent3 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
      
      <div className="relative bg-surface border border-border rounded-2xl overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="p-6 border-b border-border/50 bg-surface2/30">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Activity className="w-5 h-5 text-accent animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-syne text-text">Contest Radar</h2>
                <p className="text-[10px] text-muted font-bold tracking-widest uppercase">Live Global Tracker</p>
              </div>
            </div>
            <a 
              href="/api/contests/calendar.ics" 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface3 border border-border text-xs font-bold hover:bg-border transition-colors text-accent"
            >
              <Download className="w-3.5 h-3.5" />
              Subscribe .ics
            </a>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {(['all', 'leetcode', 'codeforces', 'atcoder'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all border ${
                  filter === f 
                    ? 'bg-accent text-white border-accent' 
                    : 'bg-surface2 text-muted border-border hover:border-accent/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-surface2/50 rounded-xl animate-pulse border border-border/30" />
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredContests.map((contest, idx) => (
                <motion.div
                  key={contest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group/item relative p-4 rounded-xl bg-surface2/30 border border-border/50 hover:border-accent/30 transition-all hover:bg-surface2/50"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase border ${getPlatformColor(contest.platform)}`}>
                        {contest.platform}
                      </div>
                      <h4 className="font-bold text-sm line-clamp-1 group-hover/item:text-accent transition-colors">
                        {contest.name}
                      </h4>
                      <div className="flex items-center gap-4 text-muted text-[10px] font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-accent" />
                          {new Date(contest.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-accent" />
                          {formatDuration(contest.duration)}
                        </div>
                      </div>
                    </div>
                    <a 
                      href={contest.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-surface3 border border-border text-muted hover:text-accent hover:border-accent transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Meta */}
        <div className="p-4 bg-surface3/10 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Auto-updating Live Feed</span>
          </div>
          <Trophy className="w-4 h-4 text-muted/30" />
        </div>
      </div>
    </div>
  );
};

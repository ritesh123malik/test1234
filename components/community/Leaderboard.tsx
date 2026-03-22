'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Zap, 
  TrendingUp,
  Search,
  User,
  ChevronRight
} from 'lucide-react';
import { Profile } from '@/types';
import { createClient } from '@/lib/supabase/client';

export const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('neural_power_score', { ascending: false })
          .limit(20);

        if (!error && data) {
          setUsers(data);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />;
      case 1: return <Medal className="w-5 h-5 text-slate-300 fill-slate-300/20" />;
      case 2: return <Medal className="w-5 h-5 text-amber-600 fill-amber-600/20" />;
      default: return <span className="text-xs font-black text-muted">#{index + 1}</span>;
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-accent via-accent2 to-accent3 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
      
      <div className="relative bg-surface border border-border rounded-2xl overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="p-6 border-b border-border/50 bg-surface2/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-syne text-text">Global Elites</h2>
              <p className="text-[10px] text-muted font-bold tracking-widest uppercase">Neural Supremacy Rankings</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search for username..."
              className="w-full pl-10 pr-4 py-2 bg-surface2 border border-border rounded-xl focus:border-accent outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-14 bg-surface2/50 rounded-xl animate-pulse" />
            ))
          ) : (
            users.map((user, idx) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`group/item flex items-center justify-between p-3 rounded-xl border transition-all ${
                    idx < 3 ? 'bg-accent/5 border-accent/20' : 'bg-surface2/30 border-border hover:bg-surface2/50 hover:border-accent/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 flex justify-center">
                    {getRankIcon(idx)}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface3 flex items-center justify-center overflow-hidden border border-border/50">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-5 h-5 text-muted" />
                        )}
                    </div>
                    <div>
                      <div className="text-sm font-bold group-hover/item:text-accent transition-colors">{user.username || 'Agent'}</div>
                      <div className="text-[10px] text-muted font-bold tracking-widest uppercase">
                          Level {Math.floor(Math.sqrt((user.neural_power_score || 0) / 100)) + 1}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-accent font-bold text-sm">
                        <Zap className="w-3.5 h-3.5 fill-accent/20" />
                        {user.neural_power_score}
                    </div>
                    <div className="text-[9px] text-muted font-bold uppercase tracking-tighter">N-Units</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted group-hover/item:text-accent transition-all group-hover/item:translate-x-1" />
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Profile Teaser */}
        <div className="p-4 bg-accent/10 border-t border-accent/20 flex items-center justify-between">
           <div className="flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-accent" />
               <span className="text-[10px] text-accent font-bold uppercase tracking-widest">You are in Top 5%</span>
           </div>
           <button className="text-[10px] font-black uppercase text-accent border-b border-accent/30">View My Rank</button>
        </div>
      </div>
    </div>
  );
};

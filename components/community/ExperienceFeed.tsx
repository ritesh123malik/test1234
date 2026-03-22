'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageSquare, 
  Share2, 
  ShieldCheck,
  User,
  Building2,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Filter
} from 'lucide-react';
import { InterviewExperience } from '@/types';
import { toast } from 'sonner';

export const ExperienceFeed: React.FC = () => {
  const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchExperiences = async () => {
    try {
      const res = await fetch('/api/experiences');
      const data = await res.json();
      
      if (data.error) {
        setExperiences([]);
        toast.error(`Feed Error: ${data.error}`);
        return;
      }
      
      setExperiences(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load feed');
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleVote = async (id: string, type: 'up' | 'down') => {
    try {
      const res = await fetch(`/api/experiences/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        fetchExperiences(); // Refresh to get new counts
        toast.success(type === 'up' ? 'Upvoted!' : 'Downvoted');
      }
    } catch (err) {
      toast.error('Vote failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Feed Filters */}
      <div className="flex items-center gap-4 p-4 bg-surface2/30 border border-border rounded-xl">
        <Filter className="w-4 h-4 text-muted" />
        <input 
          type="text" 
          placeholder="Filter by company or role..."
          className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-muted"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="flex gap-2">
            <button className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-[10px] font-bold uppercase tracking-wider">Top</button>
            <button className="px-3 py-1 bg-surface3 text-muted rounded-lg text-[10px] font-bold uppercase tracking-wider">New</button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-surface2/50 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {experiences.map((exp, idx) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-surface border border-border rounded-2xl overflow-hidden hover:border-accent/40 transition-all shadow-lg hover:shadow-accent/5"
              >
                <div className="flex">
                  {/* Vote Sidebar */}
                  <div className="w-12 bg-surface2/30 border-r border-border/50 flex flex-col items-center py-4 gap-2">
                    <button 
                      onClick={() => handleVote(exp.id, 'up')}
                      className="p-1 rounded hover:bg-accent/10 text-muted hover:text-accent transition-colors"
                    >
                      <ArrowBigUp className="w-6 h-6" />
                    </button>
                    <span className="text-xs font-bold font-mono">
                      {exp.upvotes - exp.downvotes}
                    </span>
                    <button 
                      onClick={() => handleVote(exp.id, 'down')}
                      className="p-1 rounded hover:bg-accent/10 text-muted hover:text-accent2 transition-colors"
                    >
                      <ArrowBigDown className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent2 p-[2px]">
                                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
                                    {exp.is_anonymous ? <User className="w-5 h-5 text-muted" /> : (
                                        <img src={exp.profiles?.avatar_url || ''} alt="" className="w-full h-full object-cover" />
                                    )}
                                </div>
                            </div>
                            {!exp.is_anonymous && (
                                <div className="absolute -bottom-1 -right-1 bg-accent rounded-full p-0.5 border border-surface">
                                    <ShieldCheck className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">
                                {exp.is_anonymous ? 'Anonymous Member' : exp.profiles?.username}
                            </span>
                            <span className="text-[10px] text-muted font-bold tracking-widest uppercase">• {new Date(exp.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-accent font-bold uppercase tracking-wider">
                            <TrendingUp className="w-3 h-3" />
                            Neural Power: {exp.profiles?.neural_power_score || 0}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                          exp.difficulty === 'Hard' ? 'text-accent2 border-accent2/20 bg-accent2/10' :
                          exp.difficulty === 'Medium' ? 'text-warn border-warn/20 bg-warn/10' :
                          'text-accent3 border-accent3/20 bg-accent3/10'
                        }`}>
                          {exp.difficulty}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-xl font-bold font-syne group-hover:text-accent transition-colors">
                        <Building2 className="w-5 h-5 opacity-50" />
                        {exp.company_name} <span className="text-muted/50 mx-2">—</span> {exp.role}
                      </div>
                      <p className="text-muted text-sm leading-relaxed line-clamp-3 italic">
                        "{exp.content}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted hover:text-text transition-colors cursor-pointer">
                          <MessageSquare className="w-4 h-4" />
                          <span>4 Threads</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted hover:text-text transition-colors cursor-pointer">
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </div>
                      </div>
                      <button className="flex items-center gap-1.5 text-xs font-bold text-accent hover:gap-3 transition-all">
                        Read Full Dossier
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

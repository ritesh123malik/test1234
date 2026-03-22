'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Building2, 
  Briefcase, 
  Clock, 
  BarChart3, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  BookOpen, 
  Lightbulb, 
  GraduationCap,
  Sparkles,
  ChevronRight,
  Target,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

export default function RoadmapPage() {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('entry');
  const [duration, setDuration] = useState('8');
  const [roadmap, setRoadmap] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  const companies = [
    { name: 'Google', icon: '🔍', color: 'from-blue-500/20 to-emerald-500/20', border: 'border-blue-500/30' },
    { name: 'Microsoft', icon: '💻', color: 'from-blue-600/20 to-indigo-600/20', border: 'border-indigo-500/30' },
    { name: 'Amazon', icon: '📦', color: 'from-orange-500/20 to-yellow-500/20', border: 'border-orange-500/30' },
    { name: 'Flipkart', icon: '🛒', color: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/30' },
    { name: 'Razorpay', icon: '💳', color: 'from-blue-500/20 to-sky-600/20', border: 'border-sky-500/30' },
    { name: 'Atlassian', icon: '🎯', color: 'from-blue-400/20 to-cyan-400/20', border: 'border-cyan-500/30' },
    { name: 'Adobe', icon: '🎨', color: 'from-red-500/20 to-pink-500/20', border: 'border-rose-500/30' },
    { name: 'DE_Shaw', icon: '⚖️', color: 'from-slate-500/20 to-gray-600/20', border: 'border-gray-500/30' },
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level', years: '0-2 years', icon: '🌱' },
    { value: 'mid', label: 'Mid Level', years: '2-5 years', icon: '🌿' },
    { value: 'senior', label: 'Senior Level', years: '5+ years', icon: '🌳' },
  ];

  const durations = [
    { value: '4', label: '4 Weeks', desc: 'Sprint', icon: '⚡' },
    { value: '8', label: '8 Weeks', desc: 'Standard', icon: '📅' },
    { value: '12', label: '12 Weeks', desc: 'Mastery', icon: '📚' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRoadmap('');
    setGenerated(false);

    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role, experience, duration })
      });

      const data = await res.json();

      if (res.ok) {
        setRoadmap(data.roadmap);
        setGenerated(true);
        toast.success('Roadmap_Protocol: Generated');
      } else {
        setError(data.error || 'Protocol Error: Generation Failed');
        toast.error('System Error');
      }
    } catch (err) {
      setError('Network sync failure. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCompany = companies.find(c => c.name === company);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pt-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden py-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-primary/10 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles size={12} />
            AI_Roadmap_Engine v1.3
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-4">
            Strategize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">Career_Path</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto font-medium">
            Deploy advanced AI to architect your preparation strategy. Personalized protocols for top-tier tech domains.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Form Side */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <div className="glass-card rounded-[2.5rem] border border-[var(--border-subtle)] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl group-hover:bg-brand-primary/10 transition-colors" />
              
              <h2 className="text-xl font-display font-bold text-white mb-8 flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 border border-brand-primary/20 rounded-xl">
                  <Target className="w-5 h-5 text-brand-primary" />
                </div>
                Protocol_Config
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Company Grid */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2 mb-4 block">Target_Organization</label>
                  <div className="grid grid-cols-2 gap-3">
                    {companies.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setCompany(c.name)}
                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 group/btn ${
                          company === c.name
                            ? `${c.color} ${c.border} border-current ring-1 ring-inset ring-current scale-[1.02]`
                            : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
                        }`}
                      >
                        <span className="text-2xl group-hover/btn:scale-110 transition-transform">{c.icon}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${company === c.name ? 'text-white' : 'text-[var(--text-muted)]'}`}>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2 block">Designation_Link</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g., QUANT_ENGINEER"
                      className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-brand-primary/50 transition-all font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Exp & Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2 block">Tier_Level</label>
                    <select 
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] text-white px-4 py-4 rounded-2xl outline-none focus:border-brand-primary/50 transition-all font-mono text-xs cursor-pointer"
                    >
                      {experienceLevels.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2 block">Cycle_Time</label>
                    <select 
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] text-white px-4 py-4 rounded-2xl outline-none focus:border-brand-primary/50 transition-all font-mono text-xs cursor-pointer"
                    >
                      {durations.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !company || !role}
                  className="w-full bg-gradient-to-r from-brand-primary to-brand-accent text-black p-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:opacity-90 transition-all shadow-xl shadow-brand-primary/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap size={18} />}
                  {loading ? 'Processing...' : 'Deploy_Roadmap'}
                </button>
              </form>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-8">
            {!generated && !loading && (
              <div className="h-full min-h-[500px] glass-card rounded-[2.5rem] border border-[var(--border-subtle)] border-dashed border-2 flex flex-col items-center justify-center text-center p-12 group">
                <div className="w-24 h-24 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-full flex items-center justify-center mb-8 relative">
                  <Lightbulb size={40} className="text-brand-primary group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-brand-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-4">Neural_Net Idle</h3>
                <p className="text-[var(--text-muted)] max-w-sm mb-10">Configure your target organization and designation to initialize the roadmap generation protocol.</p>
                <div className="grid grid-cols-3 gap-6 w-full max-w-lg">
                  {[
                    { label: 'WEEKLY_PLAN', icon: BookOpen },
                    { label: 'LC_CURATION', icon: CheckCircle2 },
                    { label: 'TECH_STACK', icon: Zap }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl flex flex-col items-center gap-2">
                      <item.icon size={20} className="text-[var(--text-muted)]" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[500px] glass-card rounded-[2.5rem] border border-brand-primary/30 flex flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="relative z-10 text-center">
                  <div className="w-24 h-24 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto mb-8" />
                  <Sparkles size={32} className="text-brand-primary animate-pulse mx-auto mb-6" />
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Architecting_Pathways</h3>
                  <p className="text-[var(--text-muted)] font-mono text-sm">
                    Processing clusters for <span className="text-brand-primary">{company}</span>...
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/5 to-transparent pointer-events-none" />
              </div>
            )}

            {roadmap && generated && (
              <div className="glass-card rounded-[2.5rem] border border-[var(--border-subtle)] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                <div className={`p-10 bg-gradient-to-br ${selectedCompany?.color || 'from-brand-primary/10 to-brand-accent/10'} border-b border-[var(--border-subtle)]`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-5xl">{selectedCompany?.icon}</div>
                      <div>
                        <h2 className="text-3xl font-display font-black text-white">{company}</h2>
                        <div className="flex gap-4 mt-2">
                          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                            <Briefcase size={12} /> {role}
                          </span>
                          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                            <Clock size={12} /> {duration} WEEKS
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <FileText size={32} className="text-white/40" />
                    </div>
                  </div>
                </div>

                <div className="p-10 roadmap-markdown">
                  <ReactMarkdown
                    components={{
                      h1: ({ ...props }) => <h1 className="text-2xl font-display font-black text-white mt-12 mb-6 flex items-center gap-3" {...props} />,
                      h2: ({ ...props }) => <h2 className="text-xl font-display font-bold text-brand-primary mt-10 mb-4 uppercase tracking-wider underline decoration-brand-primary/30 underline-offset-8" {...props} />,
                      h3: ({ ...props }) => <h3 className="text-lg font-bold text-white mt-8 mb-3" {...props} />,
                      ul: ({ ...props }) => <ul className="space-y-4 mb-8" {...props} />,
                      li: ({ children, ...props }: { children?: React.ReactNode }) => (
                        <li className="flex items-start gap-3 group" {...props}>
                          <ChevronRight size={16} className="text-brand-primary mt-1 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                          <span className="text-[var(--text-muted)] leading-relaxed">{children}</span>
                        </li>
                      ),
                      p: ({ ...props }) => <p className="text-[var(--text-muted)] mb-6 last:mb-0 leading-relaxed" {...props} />,
                      strong: ({ ...props }) => <strong className="font-bold text-white" {...props} />,
                      code: ({ ...props }) => <code className="bg-[var(--bg-base)] text-brand-accent px-2 py-0.5 rounded-md font-mono text-sm" {...props} />,
                    }}
                  >
                    {roadmap}
                  </ReactMarkdown>
                </div>

                <div className="p-8 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    <Sparkles size={14} className="text-brand-primary" />
                    Neural_Curation Authorized
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-brand-primary/50 transition-all"
                  >
                    <FileText size={14} /> Export_Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

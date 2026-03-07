'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  BriefcaseIcon,
  ClockIcon,
  SparklesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  LightBulbIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

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
    { name: 'Google', icon: '🔍', color: 'bg-blue-500/10 text-blue-400' },
    { name: 'Microsoft', icon: '💻', color: 'bg-indigo-500/10 text-indigo-400' },
    { name: 'Amazon', icon: '📦', color: 'bg-amber-500/10 text-amber-400' },
    { name: 'Flipkart', icon: '🛒', color: 'bg-violet-500/10 text-violet-400' },
    { name: 'Razorpay', icon: '💳', color: 'bg-blue-600/10 text-blue-300' },
    { name: 'Meesho', icon: '🛍️', color: 'bg-pink-500/10 text-pink-400' },
    { name: 'Atlassian', icon: '🎯', color: 'bg-cyan-500/10 text-cyan-400' },
    { name: 'Adobe', icon: '🎨', color: 'bg-red-500/10 text-red-400' },
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level', years: '0-2 years', icon: '🌱' },
    { value: 'mid', label: 'Mid Level', years: '2-5 years', icon: '🌿' },
    { value: 'senior', label: 'Senior Level', years: '5+ years', icon: '🌳' },
  ];

  const durations = [
    { value: '4', label: '4 Weeks', desc: 'Quick Prep', icon: '⚡' },
    { value: '8', label: '8 Weeks', desc: 'Standard', icon: '📅' },
    { value: '12', label: '12 Weeks', desc: 'Comprehensive', icon: '📚' },
    { value: '16', label: '16 Weeks', desc: 'Deep Dive', icon: '🎯' },
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
      } else {
        setError(data.error || 'Failed to generate roadmap');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] pt-32 pb-20">
      <main className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
            <SparklesIcon className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">AI Core</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6">
            Your Career, <span className="text-violet-500">Automated.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Generate a high-precision preparation roadmap tailored specifically for your target company and role.
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="glass-card sticky top-32">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <AcademicCapIcon className="w-6 h-6 text-violet-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Roadmap Builder</h2>
                  <p className="text-slate-500 text-sm">Configure your prep path</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 block">Target Company</label>
                  <div className="grid grid-cols-2 gap-3">
                    {companies.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setCompany(c.name)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${company === c.name
                            ? 'border-violet-600 bg-violet-600/5 ring-4 ring-violet-600/10'
                            : 'border-white/5 bg-white/5 hover:border-white/10'
                          }`}
                      >
                        <div className="text-2xl mb-2">{c.icon}</div>
                        <div className="text-sm font-bold text-white">{c.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 block">Position</label>
                  <div className="relative">
                    <BriefcaseIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-violet-600 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 block">Experience</label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:border-violet-600"
                    >
                      {experienceLevels.map(e => <option key={e.value} value={e.value} className="bg-[#030712]">{e.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 block">Duration</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:border-violet-600"
                    >
                      {durations.map(d => <option key={d.value} value={d.value} className="bg-[#030712]">{d.label}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !company || !role}
                  className="w-full bg-white text-black py-5 rounded-2xl font-bold text-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xl shadow-white/5 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="w-6 h-6 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-6 h-6" />
                      Initialize AI Engine
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7">
            {!generated && !loading && !error && (
              <div className="glass-card flex flex-col items-center justify-center py-32 text-center">
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center mb-8">
                  <LightBulbIcon className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Awaiting Configuration</h3>
                <p className="text-slate-500 max-w-sm">Complete the form on the left to generate your custom-built interview success path.</p>
              </div>
            )}

            {loading && (
              <div className="glass-card flex flex-col items-center justify-center py-32 text-center">
                <div className="relative mb-10">
                  <div className="w-24 h-24 border-4 border-violet-600/20 border-t-violet-600 rounded-full animate-spin"></div>
                  <SparklesIcon className="absolute inset-0 m-auto w-8 h-8 text-violet-500 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Analyzing Requirements</h3>
                <p className="text-slate-500">Mapping out {company} expectations for {role}...</p>
              </div>
            )}

            {error && (
              <div className="glass-card border-red-500/20 bg-red-500/5 p-12 text-center">
                <div className="text-4xl mb-6">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-2">Engine Malfunction</h3>
                <p className="text-slate-400 mb-8">{error}</p>
                <button onClick={() => setError('')} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 transition-all">
                  Reset System
                </button>
              </div>
            )}

            {roadmap && (
              <div className="glass-card relative overflow-hidden group">
                <header className="mb-12 relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-4xl">{companies.find(c => c.name === company)?.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{company} Portfolio</h2>
                      <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">{role} • {duration} Week Path</p>
                    </div>
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-violet-600/50 to-transparent"></div>
                </header>

                <div className="prose prose-invert max-w-none prose-p:text-slate-400 prose-headings:text-white prose-li:text-slate-400 prose-strong:text-violet-400">
                  <ReactMarkdown
                    components={{
                      h1: ({ ...props }) => <h1 className="text-3xl font-bold mb-8 mt-12 pb-4 border-b border-white/5" {...props} />,
                      h2: ({ ...props }) => <h2 className="text-2xl font-bold mb-6 mt-10 text-violet-100" {...props} />,
                      h3: ({ ...props }) => <h3 className="text-xl font-bold mb-4 mt-8" {...props} />,
                      ul: ({ ...props }) => <ul className="space-y-3 mb-8 list-none pl-0" {...props} />,
                      li: ({ children, ...props }) => (
                        <li className="flex items-start gap-3" {...props}>
                          <CheckCircleIcon className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                          <span>{children}</span>
                        </li>
                      ),
                    }}
                  >
                    {roadmap}
                  </ReactMarkdown>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" /> Finalized Roadmap
                  </p>
                  <button onClick={() => window.print()} className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white hover:bg-white/10 transition-all">
                    Export to PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

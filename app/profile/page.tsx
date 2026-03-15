'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LeetCodeConnect from '@/components/leetcode/LeetCodeConnect';
import CodeforcesConnect from '@/components/codeforces/CodeforcesConnect';
import MySubmissions from '@/components/profile/MySubmissions';
import SkillGapRadar from '@/components/profile/SkillGapRadar';
import SpeechTrendChart from '@/components/interviewer/SpeechTrendChart';
import CollegeCitySetup from '@/components/leaderboard/CollegeCitySetup';
import {
  UserIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import {
  Search,
  Bell,
  Menu,
  X,
  Flame,
  GraduationCap,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  Trophy,
  Settings,
  MessageSquare
} from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [authEmail, setAuthEmail] = useState<string>('');
  const [formData, setFormData] = useState({
    full_name: '',
    college: '',
    city: '',
    graduation_year: '',
    target_role: ''
  });
  const [speechSessions, setSpeechSessions] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchSpeechSummary();
  }, []);

  const fetchSpeechSummary = async () => {
    try {
      const res = await fetch('/api/heatmap?section=speech');
      const { speech } = await res.json();
      if (speech) setSpeechSessions(speech);
    } catch (err) {
      console.error('Failed to fetch speech summary:', err);
    }
  };

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setAuthEmail(user.email || '');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        college: data.college || '',
        city: data.city || '',
        graduation_year: data.graduation_year || '',
        target_role: data.target_role || 'SDE'
      });
    }

    setLoading(false);
  };

  const handleUpdateProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        college: formData.college,
        graduation_year: parseInt(formData.graduation_year) || null,
        target_role: formData.target_role,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (!error) {
      setEditing(false);
      fetchProfile();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-16 h-16 border-4 border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] py-12 pt-32 text-[var(--text-primary)] relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--brand-primary)]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <header className="mb-12 relative z-10">
          <h1 className="text-5xl font-display font-bold text-[var(--text-primary)] mb-3 tracking-tight">Career Architecture</h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl font-medium">Fine-tune your professional profile and analyze your competitive edge with our AI-driven Skill Gap Radar.</p>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Profile Info Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Identity Card */}
            <div className="glass-card rounded-[2.5rem] border border-[var(--border-subtle)] overflow-hidden shadow-2xl group transition-all duration-500 hover:shadow-indigo-500/10">
              <div className="h-32 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              </div>

              <div className="px-8 pb-10 relative">
                <div className="relative -mt-16 mb-6">
                  <div className="w-32 h-32 bg-[var(--bg-card)] rounded-[2rem] border-4 border-[var(--bg-base)] flex items-center justify-center text-5xl font-display font-bold text-[var(--brand-primary)] shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    {profile?.full_name?.[0] || authEmail?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-emerald-500 border-4 border-[var(--bg-base)] rounded-full shadow-lg" />
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-1">{profile?.full_name || 'Anonymous Strategist'}</h2>
                  <p className="text-[var(--text-muted)] font-mono text-sm tracking-tight">{authEmail}</p>
                </div>

                {!editing ? (
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 px-5 py-4 bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-2xl group/item hover:border-[var(--brand-primary)] transition-colors">
                      <BuildingOfficeIcon className="w-5 h-5 text-[var(--brand-primary)] shrink-0" />
                      <span className="text-sm font-bold text-[var(--text-secondary)] truncate">
                        {[profile?.college, profile?.city].filter(Boolean).join(' · ') || 'Location Unset'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 px-5 py-4 bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-2xl group/item hover:border-[var(--brand-primary)] transition-colors">
                      <CalendarIcon className="w-5 h-5 text-[var(--brand-primary)] shrink-0" />
                      <span className="text-sm font-bold text-[var(--text-secondary)]">{profile?.graduation_year || 'Batch Pending'}</span>
                    </div>
                    <div className="flex items-center gap-4 px-5 py-4 bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-2xl group/item hover:border-[var(--brand-primary)] transition-colors">
                      <ChartBarIcon className="w-5 h-5 text-[var(--brand-primary)] shrink-0" />
                      <span className="text-sm font-bold text-[var(--text-secondary)]">Target: {profile?.target_role || 'SDE'}</span>
                    </div>
                    <button
                      onClick={() => setEditing(true)}
                      className="w-full mt-4 h-14 border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--brand-primary)] text-[var(--text-primary)] font-bold rounded-2xl transition-all shadow-lg active:scale-95"
                    >
                      Refine Profile
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] ml-2">Full Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-5 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all placeholder:text-[var(--text-muted)]/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] ml-2">Institution (Autocomplete via Arena)</label>
                      <input
                        type="text"
                        placeholder="IIT Madras"
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        className="w-full px-5 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all placeholder:text-[var(--text-muted)]/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] ml-2">City</label>
                      <input
                        type="text"
                        placeholder="Mumbai"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-5 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all placeholder:text-[var(--text-muted)]/30"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] ml-2">Batch</label>
                        <input
                          type="number"
                          placeholder="2025"
                          value={formData.graduation_year}
                          onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                          className="w-full px-5 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all placeholder:text-[var(--text-muted)]/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] ml-2">Target Role</label>
                        <select
                          value={formData.target_role}
                          onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                          className="w-full px-5 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all appearance-none"
                        >
                          <option value="SDE">Software Engineer</option>
                          <option value="Frontend">Frontend Dev</option>
                          <option value="Backend">Backend Dev</option>
                          <option value="Full Stack">Full Stack Dev</option>
                          <option value="Data Science">Data Scientist</option>
                          <option value="ML Engineer">ML Engineer</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleUpdateProfile}
                        className="flex-1 h-14 bg-[var(--brand-primary)] text-white rounded-2xl font-bold hover:bg-[var(--brand-secondary)] transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                      >
                        Push Changes
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="px-6 h-14 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold rounded-2xl hover:text-[var(--text-primary)] transition-all active:scale-95"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Strategic Insights Card */}
            <div className="glass-card rounded-[2.5rem] border border-[var(--border-subtle)] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ChartBarIcon className="w-16 h-16 text-[var(--brand-primary)]" />
              </div>
              <h3 className="text-xl font-display font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3">
                <div className="p-2 bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 rounded-xl">
                  <ChartBarIcon className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                Engagement Metrics
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Strategy Since</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-[var(--text-muted)]" />
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-[var(--border-subtle)] to-transparent" />
                <div className="flex justify-between items-center group cursor-default">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Question Flow</p>
                    <p className="text-3xl font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">0</p>
                  </div>
                  <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-bold text-indigo-400">DAILY ATTEMPTS</div>
                </div>
                <div className="flex justify-between items-center group cursor-default">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Saved Records</p>
                    <p className="text-3xl font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">0</p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-400">ACTIVE INTEL</div>
                </div>
              </div>
            </div>

            {/* Arena Identity Card [NEW] */}
            <CollegeCitySetup
              currentCollege={profile?.college}
              currentCity={profile?.city}
              onSave={async (college, city) => {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) return;
                  const { error } = await supabase
                    .from('profiles')
                    .update({ college, city, updated_at: new Date().toISOString() })
                    .eq('id', user.id);
                  if (error) throw error;
                  alert('Arena Identity Synchronized Successfully');
                  fetchProfile();
                } catch (err: any) {
                  console.error('Arena Update Error:', err);
                  alert(`Failed to update Arena Identity: ${err.message || 'Unknown Error'}`);
                }
              }}
            />
          </div>

          {/* Deep Infrastructure Column */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            {/* Skill Gap Radar Section [NEW UI BLOCK] */}
            <div className="glass-card rounded-[2.5rem] border border-[var(--border-subtle)] p-10 shadow-2xl bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-base)]">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2 flex items-center gap-4">
                    <span className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-2xl">
                      <ChartBarIcon className="w-6 h-6 text-sky-400" />
                    </span>
                    Skill Gap Radar
                  </h3>
                  <p className="text-[var(--text-muted)] font-medium max-w-md">Multidimensional analysis of your technical readiness vs industry standards.</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-[var(--brand-primary)] rounded-full shadow-[0_0_8px_var(--brand-primary)]" />
                  <div className="w-3 h-3 bg-white/20 rounded-full" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Radar visualization placeholder */}
                <div className="relative aspect-square bg-[var(--bg-base)]/50 border border-dashed border-[var(--border-subtle)] rounded-[3rem] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--brand-primary)_0%,transparent_70%)]" />
                  <div className="text-center p-8">
                    <ChartBarIcon className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-20" />
                    <p className="text-[var(--text-muted)] font-bold text-sm tracking-widest uppercase">Initializing Visualization Engine...</p>
                  </div>
                  {/* Skill labels orbiting */}
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-3xl group hover:border-[var(--brand-primary)] transition-all">
                    <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3">Core Algorithm Mastery</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[var(--text-primary)] font-bold">Data Structures</span>
                      <span className="text-[var(--text-secondary)] font-mono">65/100</span>
                    </div>
                    <div className="w-full bg-[var(--bg-card)] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)]" style={{ width: '65%' }} />
                    </div>
                  </div>
                  <div className="p-6 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-3xl group hover:border-emerald-500 transition-all">
                    <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-3">Practical Architecture</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[var(--text-primary)] font-bold">System Design</span>
                      <span className="text-[var(--text-secondary)] font-mono">42/100</span>
                    </div>
                    <div className="w-full bg-[var(--bg-card)] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{ width: '42%' }} />
                    </div>
                  </div>
                  <div className="p-6 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-3xl group hover:border-amber-500 transition-all">
                    <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-3">Language Proficiency</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[var(--text-primary)] font-bold">TypeScript / Python</span>
                      <span className="text-[var(--text-secondary)] font-mono">88/100</span>
                    </div>
                    <div className="w-full bg-[var(--bg-card)] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.4)]" style={{ width: '88%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="glass-card rounded-[2.5rem] border border-[var(--border-subtle)] p-2 shadow-2xl relative">
                <div className="absolute top-10 left-10 z-10">
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FFA116]/10 border border-[#FFA116]/30 rounded-xl flex items-center justify-center">
                      <LeetCodeIcon className="w-5 h-5 text-[#FFA116]" />
                    </div>
                    LeetCode Sync
                  </h3>
                </div>
                <LeetCodeConnect />
              </div>

              <div className="glass-card rounded-[2.5rem] border border-[var(--border-subtle)] p-2 shadow-2xl relative">
                <div className="absolute top-10 left-10 z-10">
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-center">
                      <TrophyIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    Codeforces Sync
                  </h3>
                </div>
                <CodeforcesConnect />
              </div>
            </div>

            {/* My Submissions [NEW] */}
            <div className="glass-card rounded-[2.5rem] border border-[var(--border-subtle)] p-12 shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-primary/10 border border-brand-primary/30 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-brand-primary" />
                    </div>
                    My Contributions
                  </h3>
                  <p className="text-text-muted text-xs font-mono uppercase tracking-widest mt-2 ml-13">Intel synchronization status</p>
                </div>
              </div>
              <MySubmissions />
            </div>

            {/* Speech Analysis Trend [NEW] */}
            {speechSessions.length > 0 && (
              <SpeechTrendChart sessions={speechSessions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeetCodeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.483 0a1.374 1.374 0 0 0-.961.414l-9.88 9.88a1.374 1.374 0 1 0 1.94 1.94L14.463 2.35l9.123 9.123a1.374 1.374 0 1 0 1.94-1.94l-9.88-9.88a1.374 1.374 0 0 0-.961-.414z" />
      <path d="M13.483 24a1.374 1.374 0 0 1-.961-.414l-9.88-9.88a1.374 1.374 0 1 1 1.94-1.94l9.123 9.123 9.123-9.123a1.374 1.374 0 1 1 1.94 1.94l-9.88 9.88a1.374 1.374 0 0 1-.961.414z" />
    </svg>
  );
}

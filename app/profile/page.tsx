'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  MessageSquare,
  Copy,
  Check,
  Camera,
  Share2,
  Mail,
  Shield,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
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

  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'referrals'>('profile');

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
        email_notifications_enabled: profile.email_notifications_enabled,
        contest_reminders_enabled: profile.contest_reminders_enabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (!error) {
      setEditing(false);
      fetchProfile();
      router.refresh(); // Sync Header
      toast.success('Core Parameters Synchronized');
    }
  };

  const handleAvatarUpload = async (event: any) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success('Identity Visualization Updated');
    } catch (error: any) {
      toast.error('Upload Failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as any;
    const password = target.password.value;
    const confirm = target.confirm.value;

    if (password !== confirm) {
      toast.error('Cryptographic Mismatch: Passwords do not match');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error('Override Failed: ' + error.message);
    } else {
      toast.success('Master Key Rotated Successfully');
      target.reset();
    }
  };

  const generateReferral = async () => {
    const { error } = await supabase.rpc('generate_referral_code', { user_uuid: profile.id });
    if (error) {
      toast.error('Protocol Error: Could not generate code');
    } else {
      fetchProfile();
      toast.success('Network Protocol Established');
    }
  };

  const copyRef = () => {
    navigator.clipboard.writeText(profile?.referral_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Data Copied to Clipboard');
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
          {/* Profile Info Column */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            {/* Identity Card */}
            <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] border border-[var(--border-subtle)] overflow-hidden shadow-2xl group transition-all duration-500 hover:shadow-indigo-500/10">
              <div className="h-32 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              </div>

              <div className="px-8 pb-10 relative">
                <div className="relative -mt-16 mb-6">
                  <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()}>
                    <div className="w-32 h-32 bg-[var(--bg-card)] rounded-[2rem] border-4 border-[var(--bg-base)] flex items-center justify-center text-5xl font-display font-bold text-[var(--brand-primary)] shadow-2xl group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        profile?.full_name?.[0] || authEmail?.[0]?.toUpperCase() || 'U'
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {uploading ? <RefreshCw className="w-8 h-8 text-white animate-spin" /> : <Camera className="w-8 h-8 text-white" />}
                      </div>
                    </div>
                  </div>
                  <input id="avatar-input" type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-emerald-500 border-4 border-[var(--bg-base)] rounded-full shadow-lg" />
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-1">{profile?.full_name || 'Anonymous Strategist'}</h2>
                  <p className="text-[var(--text-muted)] font-mono text-[10px] tracking-widest uppercase opacity-60 italic">{profile?.referral_code ? `Node_${profile.referral_code}` : 'Awaiting_Activation'}</p>
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

            {/* Tab Navigation */}
            <div className="flex bg-[var(--bg-surface)] p-1.5 rounded-2xl border border-[var(--border-subtle)] gap-2 mb-6">
              {[
                { id: 'profile', icon: UserIcon, label: 'Identity' },
                { id: 'security', icon: Shield, label: 'Protocols' },
                { id: 'referrals', icon: Share2, label: 'Network' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <CollegeCitySetup
                  currentCollege={profile?.college}
                  currentCity={profile?.city}
                  currentCgpa={profile?.cgpa}
                  onSave={async (college, city, cgpa) => {
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) return;
                      const { error } = await supabase
                        .from('profiles')
                        .update({ college, city, cgpa, updated_at: new Date().toISOString() })
                        .eq('id', user.id);
                      if (error) throw error;
                      toast.success('Arena Identity Synchronized');
                      fetchProfile();
                      router.refresh(); // Sync Header
                    } catch (err: any) {
                      toast.error(`Update Failed: ${err.message}`);
                    }
                  }}
                />

                {/* Notification Preferences */}
                <div className="glass-card rounded-[2.5rem] border border-[var(--border-subtle)] p-8 shadow-2xl">
                  <h3 className="text-xl font-display font-bold text-white mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 rounded-xl flex items-center justify-center">
                      <Bell className="w-5 h-5 text-[var(--brand-primary)]" />
                    </div>
                    Comms_Protocols
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-2xl">
                      <div>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">Email Notifications</p>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-1">Direct system alerts</p>
                      </div>
                      <button
                        onClick={() => {
                          const val = !profile.email_notifications_enabled;
                          setProfile({ ...profile, email_notifications_enabled: val });
                          supabase.from('profiles').update({ email_notifications_enabled: val }).eq('id', profile.id).then(() => toast.success('Preference Logged'));
                        }}
                        className={`w-12 h-6 rounded-full transition-all relative ${profile.email_notifications_enabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profile.email_notifications_enabled ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-2xl">
                      <div>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">Contest Reminders</p>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-1">Calendar sync alerts</p>
                      </div>
                      <button
                        onClick={() => {
                          const val = !profile.contest_reminders_enabled;
                          setProfile({ ...profile, contest_reminders_enabled: val });
                          supabase.from('profiles').update({ contest_reminders_enabled: val }).eq('id', profile.id).then(() => toast.success('Preference Logged'));
                        }}
                        className={`w-12 h-6 rounded-full transition-all relative ${profile.contest_reminders_enabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profile.contest_reminders_enabled ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="glass-card rounded-[2.5rem] border border-[var(--border-subtle)] p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-xl font-display font-bold text-white mb-10 flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-rose-500" />
                  </div>
                  Security_Override
                </h3>
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">New Master Key</label>
                    <input name="password" type="password" required className="w-full px-6 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] text-white rounded-2xl outline-none focus:border-rose-500/50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Verify Key</label>
                    <input name="confirm" type="password" required className="w-full px-6 py-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] text-white rounded-2xl outline-none focus:border-rose-500/50 transition-all" />
                  </div>
                  <button type="submit" className="w-full py-4 bg-rose-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-xl shadow-rose-500/20 active:scale-[0.98]">Rotate Access Keys</button>
                </form>
              </div>
            )}

            {activeTab === 'referrals' && (
              <div className="glass-card rounded-[2.5rem] border border-[var(--border-subtle)] p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-amber-500" />
                    </div>
                    Network_Expansion
                  </h3>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Active_Nodes</p>
                    <p className="text-2xl font-black text-amber-500 uppercase tracking-tighter">{profile?.referral_count || 0}</p>
                  </div>
                </div>

                <div className="bg-[var(--bg-base)]/50 border border-dashed border-[var(--border-subtle)] rounded-3xl p-8 text-center">
                  {profile?.referral_code ? (
                    <div className="space-y-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Your_Personal_Protocol_ID</p>
                      <div className="flex items-center justify-center gap-4">
                        <code className="text-4xl font-black text-white tracking-[0.2em]">{profile.referral_code}</code>
                        <button onClick={copyRef} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                          {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                        </button>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] font-medium max-w-xs mx-auto">Invite fellow strategists to earn Elite status and exclusive dataset access.</p>
                    </div>
                  ) : (
                    <div className="space-y-6 py-4">
                      <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-tight">Referral Protocol Offline</p>
                      <button onClick={generateReferral} className="px-8 py-4 bg-amber-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-xl shadow-amber-500/20 active:scale-[0.98]">Initialize Network Expansion</button>
                    </div>
                  )}
                </div>
              </div>
            )}
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

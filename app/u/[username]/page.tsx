import React from 'react';
import { notFound } from 'next/navigation';
import { 
  ShieldCheck, 
  MapPin, 
  Globe, 
  Twitter, 
  Linkedin, 
  Mail,
  Calendar,
  Share2,
  Download,
  Flame,
  LayoutGrid,
  TrendingUp
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getUserByUsername, getSimilarUsers } from '@/lib/db/queries';
import { NeuralCard } from '@/components/neural/NeuralCard';
import { ProfileSync } from '@/components/profile/ProfileSync';
import { Profile } from '@/types';

export default async function DossierPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  // Wrap auth in a timeout to prevent page hang when Supabase auth is slow/unreachable
  let currentUser = null;
  try {
    const authPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), 5000)
    );
    const { data } = await Promise.race([authPromise, timeoutPromise]) as any;
    currentUser = data?.user ?? null;
  } catch (e) {
    console.warn('DossierPage: Auth check skipped (timeout or error)');
  }

  const profile = await getUserByUsername(username);

  if (!profile) {
    notFound();
  }

  const similarUsers = await getSimilarUsers(profile.neural_power_score || 0);

  return (
    <div className="min-h-screen bg-bg text-text pb-20">
      {/* Tactical Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(108,99,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(108,99,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>
      
      {/* Hero Header */}
      <div className="relative pt-24 pb-12 px-6 border-b border-border/30 bg-surface/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-end justify-between">
          <div className="flex gap-6 items-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accent2 rounded-full blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative w-32 h-32 rounded-full border-4 border-surface overflow-hidden bg-surface2">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-muted">
                    {profile.username?.[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 bg-accent rounded-full p-2 border-2 border-surface shadow-xl">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black font-syne tracking-tight">
                  {profile.full_name || profile.username}
                </h1>
                <span className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-black uppercase tracking-widest text-accent">
                   Tier 1 Candidate
                </span>
                {profile.id === currentUser?.id && (
                  <ProfileSync 
                    userId={profile.id} 
                    leetcodeHandle={profile.leetcode_handle}
                    codeforcesHandle={profile.codeforces_handle}
                    githubHandle={profile.github_handle}
                    lastSyncedAt={profile.neural_synced_at}
                  />
                )}
              </div>
              <p className="text-lg text-muted font-medium italic">
                {profile.professional_headline || 'Building the future of software, one commit at a time.'}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted">
                  <MapPin className="w-4 h-4 text-accent" />
                  {profile.college || 'LNMIIT'}
                </div>
                {profile.graduation_year && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted">
                    <Calendar className="w-4 h-4 text-accent" />
                    Class of {profile.graduation_year}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted">
                  <Globe className="w-4 h-4 text-accent" />
                  India
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pb-2">
            <button className="flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-xl text-sm font-bold hover:bg-surface3 transition-all">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 hover:scale-105 transition-all">
              <Download className="w-4 h-4" />
              Export Dossier
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <NeuralCard profile={profile} />
            
            <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted">Contact Interface</h3>
              <div className="space-y-2">
                <a href={`mailto:${profile.email}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface2 transition-colors border border-transparent hover:border-border/50">
                  <Mail className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">{profile.email}</span>
                </a>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center p-3 rounded-xl bg-surface2 border border-border hover:border-accent/40 transition-all">
                    <Linkedin className="w-5 h-5 text-blue-500" />
                  </button>
                  <button className="flex-1 flex items-center justify-center p-3 rounded-xl bg-surface2 border border-border hover:border-accent/40 transition-all">
                    <Twitter className="w-5 h-5 text-sky-400" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-surface border border-border rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-6">Similar Profiles</h3>
              <div className="space-y-4">
                {similarUsers.map((user) => (
                  <a key={user.id} href={`/u/${user.name}`} className="flex items-center justify-between group/user transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface2 border border-border overflow-hidden group-hover/user:border-accent transition-colors">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full flex items-center justify-center font-bold text-muted">?</div>}
                      </div>
                      <span className="text-sm font-bold group-hover/user:text-accent transition-colors">{user.name}</span>
                    </div>
                    <div className="text-[10px] font-black text-accent">{user.score} N</div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Center Space */}
          <div className="lg:col-span-8 space-y-8">
            {/* Bio Section */}
            <section className="p-8 bg-surface border border-border rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                    <LayoutGrid className="w-32 h-32" />
                </div>
                <h3 className="text-xl font-bold font-syne mb-4 flex items-center gap-2">
                    <div className="w-2 h-6 bg-accent rounded-full"></div>
                    Professional Dossier
                </h3>
                <p className="text-muted leading-relaxed text-lg italic">
                    {profile.bio || "This candidate hasn't documented their journey yet. Their Neural Score suggests a high-proficiency individual focused on technical excellence."}
                </p>
            </section>



            {/* Evidence & Experiences */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-surface border border-border rounded-2xl hover:border-accent/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-accent2/10">
                            <ShieldCheck className="w-6 h-6 text-accent2" />
                        </div>
                        <h4 className="font-bold font-syne text-lg">Verified Outcomes</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-border/50">
                            <span className="text-sm font-bold">Atlassian SDE-1</span>
                            <span className="text-accent3 font-black text-xs uppercase tracking-widest">Offered</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-border/50">
                            <span className="text-sm font-bold">Google STEP Intern</span>
                            <span className="text-accent2 font-black text-xs uppercase tracking-widest">Rejected</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-surface border border-border rounded-2xl hover:border-accent/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-accent/10">
                            <TrendingUp className="w-6 h-6 text-accent" />
                        </div>
                        <h4 className="font-bold font-syne text-lg">Platform Growth</h4>
                    </div>
                    <div className="h-24 flex items-end justify-between gap-1">
                        {Array.from({ length: 12 }).map((_, i) => {
                            const h = 20 + Math.random() * 80;
                            return <div key={i} className="flex-1 bg-accent/20 rounded-t-sm group-hover:bg-accent/40 transition-all" style={{ height: `${h}%` }} />;
                        })}
                    </div>
                    <p className="mt-4 text-[10px] text-muted font-bold text-center uppercase tracking-widest">Activity Trend (12 Months)</p>
                </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}


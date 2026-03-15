// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { BookOpen, FileText, Map, Bookmark, TrendingUp, ArrowRight, Zap, Clock, Library } from 'lucide-react';
import ContestCalendar from '@/components/dashboard/ContestCalendar';
import ProfileStats from '@/components/dashboard/ProfileStats';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/dashboard');

  // Fetch all user data in parallel
  const [profileRes, subRes, progressRes, bookmarksRes, resumeRes, roadmapsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
    supabase.from('user_progress').select('*, company:companies(name, slug)').eq('user_id', user.id).order('last_studied_at', { ascending: false }).limit(5),
    supabase.from('bookmarks').select('id').eq('user_id', user.id),
    supabase.from('resumes').select('score, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
    supabase.from('roadmaps').select('id').eq('user_id', user.id),
    supabase.from('question_sheets').select('id').eq('user_id', user.id),
  ]);

  const profile = profileRes.data;
  const subscription = subRes.data;
  const progress = progressRes.data || [];
  const bookmarkCount = bookmarksRes.data?.length || 0;
  const latestResume = resumeRes.data?.[0];
  const roadmapCount = roadmapsRes.data?.length || 0;
  const sheetCount = subRes.data?.length || 0; // Temporary fallback
  const isPro = subscription?.plan !== 'free' && subscription?.status === 'active';
  const firstName = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there';

  const QUICK_ACTIONS = [
    { href: '/companies', icon: BookOpen, label: 'Browse Companies', desc: '40+ companies', color: 'blue' },
    { href: '/resume', icon: FileText, label: 'Score Resume', desc: 'AI analysis', color: 'gold' },
    { href: '/roadmap', icon: Map, label: 'Build Roadmap', desc: '4-week plan', color: 'green' },
    { href: '/profile#bookmarks', icon: Bookmark, label: 'My Bookmarks', desc: `${bookmarkCount} saved`, color: 'blue' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--brand-primary)]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-[var(--brand-secondary)]/5 blur-[100px] rounded-full pointer-events-none" />

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="flex items-start justify-between mb-16 flex-wrap gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 text-[var(--brand-primary)] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <Zap size={12} /> Mission_Command_Center
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              Protocol <span className="text-transparent bg-clip-text bg-brand-gradient">Alpha</span>, {firstName}
            </h1>
            <p className="text-[var(--text-primary)] text-xl font-medium max-w-xl leading-relaxed opacity-90 drop-shadow-md">
              {progress.length === 0
                ? "Tactical engine idle. Select a target company to begin data ingestion."
                : `Active engagement with ${progress.length} strategic ${progress.length === 1 ? 'target' : 'targets'}. Keep pushing.`}
            </p>
          </div>

          {isPro && (
            <div className="bg-gradient-to-br from-[var(--brand-warning)]/20 to-amber-600/5 border border-[var(--brand-warning)]/30 p-6 rounded-[2rem] flex items-center gap-4 shadow-xl shadow-amber-900/5">
              <div className="w-12 h-12 bg-[var(--brand-warning)]/20 rounded-2xl flex items-center justify-center text-[var(--brand-warning)]">
                <Zap size={24} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-warning)] opacity-80 mb-1">Elite_Status</p>
                <p className="font-black text-white uppercase tracking-tight">Premium Access Active</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <ProfileStats profile={profile} isPro={isPro} />

          {[
            { label: 'Strategic Bookmarks', value: bookmarkCount, icon: Bookmark, color: 'var(--brand-secondary)', suffix: 'Assets' },
            { label: 'Operation Roadmaps', value: roadmapCount, icon: Map, color: 'var(--brand-tertiary)', suffix: 'Plans' },
          ].map(({ label, value, icon: Icon, color, suffix }) => (
            <div key={label} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-8 rounded-[2.5rem] shadow-xl relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity translate-x-8 -translate-y-8" style={{ color }}>
                <Icon size={96} />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl border bg-white/5" style={{ color, borderColor: `${color}33` }}>
                  <Icon size={20} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">{label}</p>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-4xl font-black text-[var(--text-primary)] tracking-tighter uppercase">{value}</p>
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">{suffix}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <h2 className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-[var(--brand-primary)]" /> Rapid_Response
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc, color }) => (
                <Link key={href} href={href} className="group p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl hover:border-[var(--brand-primary)]/50 transition-all flex items-center gap-5 shadow-lg">
                  <div className="p-3 rounded-2xl bg-white/5 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] group-hover:bg-[var(--brand-primary)]/10 transition-all">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-[var(--brand-primary)] transition-colors">{label}</p>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">{desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-[var(--text-muted)] transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-[var(--brand-primary)]" /> Operational_History
            </h2>
            {progress.length === 0 ? (
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-dashed rounded-[2.5rem] p-20 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-[var(--text-muted)]">
                  <BookOpen size={40} className="opacity-20" />
                </div>
                <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-2">Zero Data Points</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-10 max-w-xs mx-auto leading-relaxed">Analyze your first target to generate strategic prep intelligence.</p>
                <Link href="/companies" className="btn-primary-lg !py-3 !text-sm">Initiate First Scan</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {progress.map((p: any) => (
                  <Link key={p.id} href={`/company/${p.company?.slug}`}
                    className="group p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[2.5rem] hover:border-[var(--brand-primary)]/40 transition-all flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-2xl font-black text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors">
                        {p.company?.name?.[0]}
                      </div>
                      <div>
                        <p className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-[var(--brand-primary)] transition-colors">{p.company?.name}</p>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">
                          {p.questions_viewed} Viewed // {p.questions_bookmarked} Bookmarked
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Prep_Score</p>
                        <p className="text-2xl font-black text-[var(--brand-primary)] tracking-tighter">{p.prep_score}%</p>
                      </div>
                      <div className="relative w-14 h-14 hidden sm:block">
                        <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" className="text-white/5" strokeWidth="4" />
                          <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor"
                            className={`${p.prep_score >= 80 ? 'text-[var(--brand-success)]' : p.prep_score >= 50 ? 'text-[var(--brand-warning)]' : 'text-[var(--brand-primary)]'}`}
                            strokeWidth="4"
                            strokeDasharray={`${(p.prep_score / 100) * 100.5} 100.5`}
                            strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Zap size={12} className={p.prep_score >= 80 ? 'text-[var(--brand-success)]' : 'text-[var(--text-muted)]'} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                <Link href="/companies" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] hover:gap-3 transition-all mt-4 ml-2">
                  Expand Reconnaissance <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Global Contest Intelligence */}
        <div id="contests" className="mt-24 mb-20 scroll-mt-24">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-2">Contest <span className="text-[var(--brand-secondary)]">Intel</span></h1>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Clist v4 Real-time Synchronization Loop Active.</p>
            </div>
            <div className="hidden sm:block">
              <div className="h-px w-64 bg-gradient-to-r from-[var(--brand-secondary)]/50 to-transparent" />
            </div>
          </div>
          <div className="h-[650px]">
            <ContestCalendar />
          </div>
        </div>
      </main>
    </div>
  );
}


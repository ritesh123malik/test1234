// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { BookOpen, FileText, Map, Bookmark, TrendingUp, ArrowRight, Clock, Zap } from 'lucide-react';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/dashboard');

  const [profileRes, subRes, progressRes, bookmarksRes, resumeRes, roadmapsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
    supabase.from('user_progress').select('*, company:companies(name, slug)').eq('user_id', user.id).order('last_studied_at', { ascending: false }).limit(5),
    supabase.from('bookmarks').select('id').eq('user_id', user.id),
    supabase.from('resumes').select('score, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
    supabase.from('roadmaps').select('id').eq('user_id', user.id),
  ]);

  const profile = profileRes.data;
  const progress = progressRes.data || [];
  const bookmarkCount = bookmarksRes.data?.length || 0;
  const latestResume = resumeRes.data?.[0];
  const roadmapCount = roadmapsRes.data?.length || 0;
  const firstName = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there';

  const QUICK_ACTIONS = [
    { href: '/companies', icon: BookOpen, label: 'Browse Companies', desc: '40+ companies', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { href: '/resume', icon: FileText, label: 'Score Resume', desc: 'AI analysis', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { href: '/roadmap', icon: Map, label: 'Build Roadmap', desc: '4-week plan', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { href: '/profile#bookmarks', icon: Bookmark, label: 'My Bookmarks', desc: `${bookmarkCount} saved`, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  ];

  return (
    <div className="min-h-screen bg-[#030712] pt-24 pb-20">
      <main className="max-w-7xl mx-auto px-6">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-violet-500/10 text-violet-400 text-xs font-bold uppercase tracking-widest rounded-full border border-violet-500/20">
              Overview
            </span>
            <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
            <span className="text-slate-500 text-xs font-medium">Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Welcome back, <span className="text-violet-500">{firstName}</span>
          </h1>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            {progress.length === 0
              ? "You haven't started studying yet. Ready to land your dream job? Pick a company and let's go."
              : `Great to see you again. You've made progress in ${progress.length} companies. Keep pushing!`}
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { label: 'Companies Studied', value: progress.length, icon: BookOpen, color: 'text-blue-400' },
            { label: 'Bookmarked Items', value: bookmarkCount, icon: Bookmark, color: 'text-indigo-400' },
            { label: 'Latest Resume Score', value: latestResume?.score ? `${latestResume.score}%` : '—', icon: FileText, color: 'text-amber-400' },
            { label: 'Generated Roadmaps', value: roadmapCount, icon: Map, color: 'text-emerald-400' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card group hover:translate-y-[-4px]">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div className="w-8 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-violet-600 rounded-full"></div>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Recent Activity */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-500" />
                Recent Progression
              </h2>
              <Link href="/companies" className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                View all companies →
              </Link>
            </div>

            {progress.length === 0 ? (
              <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Build your first roadmap</h3>
                <p className="text-slate-400 max-w-xs mb-8">
                  Get a personalized AI roadmap based on your dream company and current skills.
                </p>
                <Link href="/roadmap" className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-slate-200 transition-all">
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {progress.map((p: any) => (
                  <Link key={p.id} href={`/company/${p.company?.slug}`} className="glass-card block !p-6 hover:bg-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                          {p.company?.name[0]}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">{p.company?.name}</h3>
                          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                            <span>{p.questions_viewed} Viewed</span>
                            <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                            <span>{p.questions_bookmarked} Bookmarked</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="hidden sm:block text-right">
                          <p className="text-xl font-bold text-white">{p.prep_score}%</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prep Score</p>
                        </div>
                        <div className="relative w-12 h-12">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="3" />
                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-violet-600" strokeWidth="3"
                              strokeDasharray={`${p.prep_score} 100`} strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-500" />
              Quick Launch
            </h2>
            <div className="grid gap-4">
              {QUICK_ACTIONS.map((action) => (
                <Link key={action.href} href={action.href} className="glass-card !p-5 group hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl border ${action.color}`}>
                      <action.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-white mb-0.5">{action.label}</h3>
                      <p className="text-xs text-slate-500">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

import { Zap, Loader2, Bookmark, Map, Layout, BookOpen } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--brand-primary)]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="flex items-start justify-between mb-16 flex-wrap gap-8 animate-pulse">
          <div>
            <div className="h-6 w-48 bg-white/5 rounded-full mb-4" />
            <div className="h-16 w-96 bg-white/10 rounded-2xl mb-4" />
            <div className="h-6 w-80 bg-white/5 rounded-xl" />
          </div>
          <div className="h-24 w-64 bg-white/5 rounded-[2rem]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-8 rounded-[2.5rem] h-48 animate-pulse">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-white/5" />
                <div className="h-4 w-24 bg-white/5 rounded-full" />
              </div>
              <div className="h-10 w-32 bg-white/10 rounded-xl" />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-4">
            <div className="h-6 w-32 bg-white/5 rounded-full mb-8" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 w-full bg-white/5 rounded-3xl animate-pulse" />
            ))}
          </div>

          <div className="lg:col-span-2">
            <div className="h-6 w-48 bg-white/5 rounded-full mb-8" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 w-full bg-white/5 rounded-[2.5rem] animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Neural Sync Loader Overlay (Subtle) */}
        <div className="fixed bottom-10 right-10 flex items-center gap-3 px-6 py-3 bg-bg-elevated/80 backdrop-blur-xl border border-border-accent rounded-full shadow-2xl z-50">
          <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Neural_Link_Synchronizing...</span>
        </div>
      </main>
    </div>
  );
}

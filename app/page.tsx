'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { SparklesIcon, BookOpenIcon, DocumentMagnifyingGlassIcon, CalculatorIcon, ClockIcon, ComputerDesktopIcon, BriefcaseIcon, BeakerIcon, TrophyIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const features = [
    { icon: <BookOpenIcon className="w-6 h-6" />, title: 'Interview Core', desc: 'Hand-picked questions from 40+ top tech companies.', href: '/companies', color: 'text-blue-400' },
    { icon: <SparklesIcon className="w-6 h-6" />, title: 'AI Roadmaps', desc: 'Customized 4-week preparation plans built by AI.', href: '/roadmap', color: 'text-violet-400' },
    { icon: <DocumentMagnifyingGlassIcon className="w-6 h-6" />, title: 'Resume Scorer', desc: 'Instant ATS compatibility and design feedback.', href: '/resume', color: 'text-emerald-400' },
    { icon: <CalculatorIcon className="w-6 h-6" />, title: 'Advanced CGPA', desc: 'Precise analysis to reach your academic goals.', href: '/cgpa-calculator', color: 'text-amber-400' },
    { icon: <ClockIcon className="w-6 h-6" />, title: 'Recall Engine', desc: 'Spaced repetition for long-term concept mastery.', href: '/spaced-repetition', color: 'text-indigo-400' },
    { icon: <ComputerDesktopIcon className="w-6 h-6" />, title: 'System Design', desc: 'Master architectural scale with deep-dives.', href: '/system-design', color: 'text-cyan-400' },
    { icon: <BriefcaseIcon className="w-6 h-6" />, title: 'Job Tracker', desc: 'Organize applications through a premium Kanban.', href: '/applications', color: 'text-rose-400' },
    { icon: <BeakerIcon className="w-6 h-6" />, title: 'CS Fundamentals', desc: 'Language-specific assessments and quizzes.', href: '/quiz', color: 'text-blue-500' },
    { icon: <TrophyIcon className="w-6 h-6" />, title: 'Leaderboard', desc: 'See where you stand among your peers.', href: '/leaderboard', color: 'text-yellow-400' },
  ];

  return (
    <div className="bg-[#030712] min-h-screen selection:bg-violet-500/30">
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#7c3aed_0%,transparent_50%)]" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.2 } } }}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Exclusively for LNMIITians</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
              Master Your <br />
              <span className="text-violet-500">Selection Intelligence.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed mb-12">
              The ultimate high-fidelity toolkit to crack technical interviews, track applications, and secure your dream offer with pure precision.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/auth/signup" className="group px-10 py-5 bg-white text-black rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all flex items-center gap-2 active:scale-95 shadow-2xl shadow-white/5">
                Join the Elite
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/companies" className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all active:scale-95">
                Explore Companies
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">The Placement <span className="text-violet-500">Stack.</span></h2>
              <p className="text-slate-500 text-lg">Every utility you need to handle the placement season with extreme efficiency.</p>
            </div>
            <Link href="/dashboard" className="text-sm font-bold text-violet-400 uppercase tracking-widest hover:text-violet-300 transition-colors flex items-center gap-2">
              View your dashboard <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Link key={i} href={f.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card group h-full hover:border-violet-500/50 transition-all cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${f.color}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-400 transition-colors">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm font-medium">{f.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-40 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-[3rem] overflow-hidden bg-violet-600 p-12 md:p-20 text-center shadow-2xl shadow-violet-600/20 group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Ready to <br className="sm:hidden" /> Secure the Offer?</h2>
              <p className="text-violet-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium opacity-80">
                Join the most ambitious students at LNMIIT and turn your preparation into a systematic success story.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/auth/signup" className="px-12 py-5 bg-white text-black rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95">
                  Get Started
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

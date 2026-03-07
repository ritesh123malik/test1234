'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navLinks = useMemo(() => [
    { href: '/companies', label: 'Companies' },
    { href: '/roadmap', label: 'AI Roadmap' },
    { href: '/applications', label: 'Job Tracker' },
    { href: '/quiz', label: 'Quizzes' },
  ], []);

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-all shadow-lg shadow-violet-500/20">
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tighter text-white">PlacementIntel</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${isActive(link.href) ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                <UserCircleIcon className="w-5 h-5" />
                <span>{user.email?.split('@')[0]}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-slate-200 transition-all font-semibold active:scale-95"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup" className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-slate-200 transition-all font-semibold active:scale-95">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-t border-white/5 bg-[#030712] px-6 py-8 space-y-6"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-xl font-bold text-slate-400 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
              {user ? (
                <>
                  <Link href="/profile" className="text-slate-300 text-lg font-medium">Profile</Link>
                  <button onClick={handleSignOut} className="text-red-400 text-lg font-medium text-left">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-slate-300 text-lg font-medium text-center">Sign In</Link>
                  <Link href="/auth/signup" className="px-6 py-4 bg-white text-black rounded-full font-bold text-center text-lg active:scale-95 transition-transform">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

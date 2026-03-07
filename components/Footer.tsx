'use client';

import Link from 'next/link';

export default function Footer() {
  const footerLinks = {
    Product: [
      { href: '/roadmap', label: 'AI Roadmap' },
      { href: '/applications', label: 'Job Tracker' },
      { href: '/resume', label: 'Resume Scorer' },
    ],
    Resources: [
      { href: '/companies', label: 'Interview Hub' },
      { href: '/guides', label: 'Guides' },
      { href: '/community', label: 'Community' },
    ],
    Support: [
      { href: '/help', label: 'Help Center' },
      { href: '/contact', label: 'Contact' },
      { href: '/status', label: 'Status' },
    ]
  };

  return (
    <footer className="border-t border-white/5 bg-[#030712] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2 mb-6 group transition-opacity hover:opacity-80">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="font-bold text-lg text-white">PlacementIntel</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Crafted for students, by students. The ultimate companion for your professional journey.
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-5 h-5 bg-slate-800 rounded"></div>
              <div className="w-5 h-5 bg-slate-800 rounded"></div>
              <div className="w-5 h-5 bg-slate-800 rounded"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-sm font-bold mb-6 text-white">{category}</h4>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-slate-500 hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500 text-center sm:text-left">
            © 2024 PlacementIntel. Not affiliated with LNMIIT Administration.
          </div>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-xs text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-slate-500 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

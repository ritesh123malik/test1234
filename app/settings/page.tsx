'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
    User,
    Shield,
    Bell,
    CreditCard,
    LogOut,
    ChevronRight,
    CheckCircle2,
    Loader2,
    Mail,
    Smartphone
} from 'lucide-react';

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [signingOut, setSigningOut] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/auth/login');
                return;
            }

            setUser(user);

            // Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(profileData);

            // Fetch Subscription
            const { data: subData } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();
            setSubscription(subData);

            setLoading(false);
        };

        fetchData();
    }, [router]);

    const handleSignOut = async () => {
        setSigningOut(true);
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-base">
                <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            </div>
        );
    }

    const SETTINGS_SECTIONS = [
        {
            title: 'Profile Information',
            desc: profile?.full_name || 'Set up your identity',
            icon: <User size={20} />,
            href: '/profile'
        },
        {
            title: 'Security & Auth',
            desc: user?.email || 'Manage security',
            icon: <Shield size={20} />,
            badge: 'Secured'
        },
        {
            title: 'Notifications',
            desc: 'Email alerts enabled',
            icon: <Bell size={20} />,
            active: true
        },
        {
            title: 'Billing & Plans',
            desc: `${subscription?.plan?.toUpperCase() || 'FREE'} Plan`,
            icon: <CreditCard size={20} />,
            badge: subscription?.plan === 'pro' ? 'PRO' : 'FREE'
        },
    ];

    return (
        <div className="min-h-screen bg-bg-base py-12 pt-32">
            <div className="max-w-2xl mx-auto px-6">
                <div className="mb-12">
                    <h1 className="font-display font-bold text-4xl text-text-primary tracking-tight">Account Settings</h1>
                    <p className="text-text-secondary mt-3 text-lg">Manage your placement-intel experience and professional core.</p>
                </div>

                {/* Account Summary Widget */}
                <div className="glass-card p-6 mb-10 border-brand-primary/20 bg-brand-primary/5 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-brand-gradient p-[1px]">
                        <div className="w-full h-full rounded-3xl bg-bg-elevated flex items-center justify-center text-2xl font-bold text-brand-primary">
                            {profile?.full_name?.[0] || user?.email?.[0].toUpperCase()}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="font-bold text-xl text-text-primary">{profile?.full_name || 'Career Architect'}</h2>
                        <p className="text-sm text-text-muted font-mono">{user?.email}</p>
                    </div>
                    {subscription?.plan === 'pro' && (
                        <div className="px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/30 rounded-full text-[10px] font-black text-brand-primary tracking-widest uppercase">
                            Pro Member
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {SETTINGS_SECTIONS.map((section) => {
                        const Content = (
                            <div className="glass-card p-5 group transition-all flex items-center justify-between hover:border-brand-primary/50">
                                <div className="flex items-center gap-5">
                                    <div className="p-3.5 rounded-2xl bg-bg-muted text-text-muted group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-all">
                                        {section.icon}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-base text-text-primary group-hover:text-brand-primary transition-colors">
                                                {section.title}
                                            </h3>
                                            {section.badge && (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${section.badge === 'PRO' ? 'bg-brand-primary text-white' : 'bg-bg-muted text-text-muted'
                                                    }`}>
                                                    {section.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-text-secondary mt-0.5">{section.desc}</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                            </div>
                        );

                        return section.href ? (
                            <Link key={section.title} href={section.href} className="block">
                                {Content}
                            </Link>
                        ) : (
                            <div key={section.title} className="cursor-default">
                                {Content}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-16 pt-10 border-t border-border-subtle">
                    <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="w-full flex items-center justify-center gap-3 p-5 rounded-[2rem] bg-brand-danger/10 text-brand-danger font-bold text-base hover:bg-brand-danger hover:text-white transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                    >
                        {signingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut size={20} />}
                        Sign Out of Account
                    </button>

                    <div className="flex flex-col items-center gap-4 mt-10">
                        <div className="flex gap-6">
                            <Link href="/privacy" className="text-[11px] text-text-muted uppercase tracking-widest font-bold hover:text-brand-primary transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="text-[11px] text-text-muted uppercase tracking-widest font-bold hover:text-brand-primary transition-colors">Terms of Service</Link>
                        </div>
                        <p className="text-[10px] text-text-muted/40 uppercase font-black tracking-[0.2em]">
                            placement-intel portal v2.5 // build_2026.03.14
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

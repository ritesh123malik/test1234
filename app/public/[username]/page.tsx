import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PublicProfileClient from '@/components/profile/PublicProfileClient';
import { Metadata } from 'next';

interface Props {
    params: Promise<{ username: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    const supabase = await createClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('username', params.username)
        .single();

    if (!profile) return { title: 'Profile Not Found' };

    return {
        title: `${profile.full_name} (@${profile.username}) | placement-intel`,
        description: `View ${profile.full_name}'s technical interview scores, coding activity, and platform ratings.`,
        openGraph: {
            title: `${profile.full_name} on placement-intel`,
            description: 'Senior Technical Candidate Profile',
            url: `https://placement-intel.com/public/${profile.username}`,
            type: 'profile',
            images: [
                {
                    url: `/api/og?username=${profile.username}`,
                    width: 1200,
                    height: 630,
                    alt: `${profile.full_name}'s Profile`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${profile.full_name} | placement-intel Portfolio`,
            description: 'Recruiter-ready technical dashboard.',
        },
    };
}

export default async function PublicProfilePage(props: Props) {
    const params = await props.params;
    const supabase = await createClient();

    // 1. Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio')
        .eq('username', params.username)
        .single();

    if (!profile) notFound();

    // 2. Fetch Stats (Aggregated from LeetCode/GitHub/etc)
    const { data: stats } = await supabase
        .from('user_social_stats')
        .select('platform, stats_json')
        .eq('user_id', profile.id);

    // 3. Fetch AI Interview Performance
    const { data: sessions } = await supabase
        .from('interviewer_sessions')
        .select('overall_score, type, ended_at')
        .eq('user_id', profile.id)
        .eq('status', 'completed')
        .order('ended_at', { ascending: false });

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans">
            <PublicProfileClient
                profile={profile}
                stats={stats || []}
                sessions={sessions || []}
            />
        </div>
    );
}

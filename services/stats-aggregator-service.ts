import { createClient } from '@/lib/supabase/server';

const SYNC_COOLDOWN_MINUTES = 60;

export async function syncPlatformStats(userId: string, platform: string, username: string) {
    const supabase = await createClient();

    // ── Enforce cooldown ──────────────────────────────────────
    const { data: existing } = await supabase
        .from('user_social_links')
        .select('last_synced_at')
        .eq('user_id', userId).eq('platform', platform).single();

    if (existing?.last_synced_at) {
        const minsAgo = (Date.now() - new Date(existing.last_synced_at).getTime()) / 60000;
        if (minsAgo < SYNC_COOLDOWN_MINUTES) {
            throw new Error(`Sync cooldown: wait ${Math.ceil(SYNC_COOLDOWN_MINUTES - minsAgo)} more minutes`);
        }
    }

    // ── Fetch stats ───────────────────────────────────────────
    const stats = await fetchStatsByPlatform(platform, username);

    // ── Upsert to Supabase ────────────────────────────────────
    const { error: statsError } = await supabase.from('user_social_stats').upsert({
        user_id: userId, platform, stats_json: stats, fetched_at: new Date().toISOString()
    }, { onConflict: 'user_id,platform' });

    if (statsError) throw new Error(`Stats upsert failed: ${statsError.message}`);

    const { error: linksError } = await supabase.from('user_social_links').upsert({
        user_id: userId, platform, username, last_synced_at: new Date().toISOString()
    }, { onConflict: 'user_id,platform' });

    if (linksError) throw new Error(`Links upsert failed: ${linksError.message}`);

    return stats;
}

async function fetchStatsByPlatform(platform: string, username: string) {
    switch (platform) {
        case 'leetcode': return fetchLeetCode(username);
        case 'github': return fetchGitHub(username);
        case 'codeforces': return fetchCodeforces(username);
        default: throw new Error(`Unsupported platform: ${platform}`);
    }
}

async function fetchLeetCode(username: string) {
    const query = `query { matchedUser(username: "${username}") {
    submitStats { acSubmissionNum { difficulty count } }
    profile { ranking starRating } } }`;
    const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
        body: JSON.stringify({ query })
    });
    const data = await res.json();
    const user = data?.data?.matchedUser;
    if (!user) throw new Error('LeetCode user not found');
    const counts = user.submitStats.acSubmissionNum;
    return {
        total_solved: counts.find((c: any) => c.difficulty === 'All')?.count ?? 0,
        easy_solved: counts.find((c: any) => c.difficulty === 'Easy')?.count ?? 0,
        medium_solved: counts.find((c: any) => c.difficulty === 'Medium')?.count ?? 0,
        hard_solved: counts.find((c: any) => c.difficulty === 'Hard')?.count ?? 0,
        ranking: user.profile.ranking,
    };
}

async function fetchGitHub(username: string) {
    const headers: Record<string, string> = { 'Accept': 'application/vnd.github+json' };
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    } else {
        console.warn('GITHUB_TOKEN missing, proceeding without auth header (rate limits apply)');
    }

    const res = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!res.ok) throw new Error('GitHub user not found');
    const d = await res.json();
    return { public_repos: d.public_repos, followers: d.followers, following: d.following };
}

async function fetchCodeforces(handle: string) {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const d = await res.json();
    if (d.status !== 'OK') throw new Error('Codeforces handle not found');
    const u = d.result[0];
    return { rating: u.rating, max_rating: u.maxRating, rank: u.rank, max_rank: u.maxRank };
}

import { createClient } from '@/lib/supabase/server';

const SYNC_COOLDOWN_MINUTES = 1; // Temporarily reduced for V1.3 Individual Sync Deployment

export async function syncPlatformStats(userId: string, platform: string, username: string) {
    const supabase = await createClient();

    // ── Enforce cooldown (TEMPORARILY DISABLED FOR V1.3 DEPLOYMENT) ──
    /*
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
    */

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

    // ── Update specialized tables for individual solve tracking ──
    if (platform === 'leetcode') {
        const s = stats as any;
        // 1. Sync counts
        await supabase.from('user_solved_questions_summary').upsert({
            user_id: userId, platform: 'leetcode',
            total_solved: s.total_solved, easy_solved: s.easy_solved,
            medium_solved: s.medium_solved, hard_solved: s.hard_solved,
            last_synced_at: new Date().toISOString()
        }, { onConflict: 'user_id,platform' });

        // 2. Sync individual slugs (recent only due to API limits)
        if (s.recent_ac_slugs?.length > 0) {
            const solves = s.recent_ac_slugs.map((slug: string) => ({
                user_id: userId, platform: 'leetcode', lc_slug: slug, solved_at: new Date().toISOString()
            }));
            await supabase.from('user_solved_questions').upsert(solves, { onConflict: 'user_id,lc_slug' });
            return { ...stats, individual_count: s.recent_ac_slugs.length };
        }
    } else if (platform === 'codeforces') {
        const s = stats as any;
        // 1. Sync rating
        await supabase.from('user_solved_questions_summary').upsert({
            user_id: userId, platform: 'codeforces',
            total_solved: s.total_solved || 0,
            last_synced_at: new Date().toISOString()
        }, { onConflict: 'user_id,platform' });

        // 2. Sync individual problems
        if (s.solved_problem_ids?.length > 0) {
            const solves = s.solved_problem_ids.map((id: string) => ({
                user_id: userId, platform: 'codeforces', cf_problem_id: id, solved_at: new Date().toISOString()
            }));
            // Batch upsert
            for (let i = 0; i < solves.length; i += 100) {
                await supabase.from('user_solved_questions').upsert(solves.slice(i, i + 100), { onConflict: 'user_id,cf_problem_id' });
            }
            return { ...stats, individual_count: s.solved_problem_ids.length };
        }
    }

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
    const query = `
        query userPublicProfile($username: String!) {
            matchedUser(username: $username) {
                submitStats: submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
                profile {
                    ranking
                }
            }
        }
    `;
    
    const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { username } })
    });
    
    const data = await res.json();
    const user = data?.data?.matchedUser;
    if (!user) throw new Error('LeetCode protocol error: Identity not found');
    
    const counts = user.submitStats.acSubmissionNum;

    // Also fetch recent entries for sync (using standard query)
    const recentQuery = `
        query recentSubmissions($username: String!, $limit: Int) {
            recentSubmissionList(username: $username, limit: $limit) {
                titleSlug
                statusDisplay
            }
        }
    `;
    const recentRes = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: recentQuery, variables: { username, limit: 1000 } }) // Massive bump
    });
    const recentData = await recentRes.json();
    const acSlugs = recentData?.data?.recentSubmissionList
        ?.filter((s: any) => s.statusDisplay === 'Accepted')
        ?.map((s: any) => s.titleSlug) || [];

    return {
        total_solved: counts.find((c: any) => c.difficulty === 'All')?.count ?? 0,
        easy_solved: counts.find((c: any) => c.difficulty === 'Easy')?.count ?? 0,
        medium_solved: counts.find((c: any) => c.difficulty === 'Medium')?.count ?? 0,
        hard_solved: counts.find((c: any) => c.difficulty === 'Hard')?.count ?? 0,
        ranking: user.profile?.ranking || 0,
        recent_ac_slugs: Array.from(new Set(acSlugs)) // Unique slugs
    };
}

async function fetchGitHub(username: string) {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) throw new Error('GitHub Protocol Error');
    const d = await res.json();
    return { public_repos: d.public_repos, followers: d.followers, following: d.following };
}

async function fetchCodeforces(handle: string) {
    const [infoRes, statusRes] = await Promise.all([
        fetch(`https://codeforces.com/api/user.info?handles=${handle}`),
        fetch(`https://codeforces.com/api/user.status?handle=${handle}`)
    ]);

    const info = await infoRes.json();
    const status = await statusRes.json();

    if (info.status !== 'OK') throw new Error('Codeforces handle not found');
    const u = info.result[0];

    // Filter for solved problems (verdict OK)
    const solved = new Set<string>();
    if (status.status === 'OK') {
        status.result.forEach((sub: any) => {
            if (sub.verdict === 'OK' && sub.problem) {
                solved.add(`${sub.problem.contestId}_${sub.problem.index}`);
            }
        });
    }

    return {
        rating: u.rating || 0,
        max_rating: u.maxRating || 0,
        rank: u.rank || 'unrated',
        max_rank: u.maxRank || 'unrated',
        total_solved: solved.size,
        solved_problem_ids: Array.from(solved)
    };
}

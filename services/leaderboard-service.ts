import { createClient } from '@/lib/supabase/server';

export type LeaderboardType = 'global' | 'college' | 'city' | 'weekly';

interface LeaderboardFilters {
    type: LeaderboardType;
    college?: string;
    city?: string;
    limit?: number;
    offset?: number;
}

// ── FETCH LEADERBOARD ─────────────────────────────────────────
export async function getLeaderboard(filters: LeaderboardFilters) {
    const supabase = await createClient();
    const { type, college, city, limit = 50, offset = 0 } = filters;

    if (type === 'weekly') {
        let query = supabase
            .from('mv_leaderboard_weekly')
            .select('user_id, username, full_name, avatar_url, college, city, level, current_streak, weekly_xp, weekly_rank')
            .order('weekly_rank', { ascending: true })
            .range(offset, offset + limit - 1);

        if (college) query = query.eq('college', college);
        if (city) query = query.eq('city', city);

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return data ?? [];
    }

    // Global / College / City — all use mv_leaderboard_global
    let query = supabase
        .from('mv_leaderboard_global')
        .select('user_id, username, full_name, avatar_url, college, city, xp, level, current_streak, global_rank, total_interviews, avg_interview_score')
        .order('global_rank', { ascending: true })
        .range(offset, offset + limit - 1);

    // Apply filters if provided, regardless of type
    if (college) query = query.eq('college', college);
    if (city) query = query.eq('city', city);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
}

// ── GET USER'S OWN RANK ───────────────────────────────────────
export async function getUserRank(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .rpc('get_user_rank', { p_user_id: userId });
    if (error) throw new Error(error.message);
    return data;
}

// ── GET FILTER OPTIONS (colleges + cities with user counts) ──
export async function getFilterOptions() {
    const supabase = await createClient();

    // Get colleges that have at least 1 user on the leaderboard
    const { data: collegeData } = await supabase
        .from('mv_leaderboard_global')
        .select('college')
        .not('college', 'is', null)
        .not('college', 'eq', '');

    // Get cities with at least 1 user
    const { data: cityData } = await supabase
        .from('mv_leaderboard_global')
        .select('city')
        .not('city', 'is', null)
        .not('city', 'eq', '');

    // Count users per college
    const collegeCounts = (collegeData ?? []).reduce((acc: Record<string, number>, row: any) => {
        if (row.college) acc[row.college] = (acc[row.college] || 0) + 1;
        return acc;
    }, {});

    const cityCounts = (cityData ?? []).reduce((acc: Record<string, number>, row: any) => {
        if (row.city) acc[row.city] = (acc[row.city] || 0) + 1;
        return acc;
    }, {});

    return {
        colleges: Object.entries(collegeCounts)
            .map(([name, count]) => ({ name, count: count as number }))
            .sort((a, b) => b.count - a.count),
        cities: Object.entries(cityCounts)
            .map(([name, count]) => ({ name, count: count as number }))
            .sort((a, b) => b.count - a.count),
    };
}

// ── AUTOCOMPLETE SEARCH ───────────────────────────────────────
export async function searchColleges(query: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('colleges')
        .select('name, city, state, tier')
        .ilike('name', `%${query}%`)
        .order('tier', { ascending: true })
        .limit(10);
    return data ?? [];
}

export async function searchCities(query: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('cities')
        .select('name, state')
        .ilike('name', `%${query}%`)
        .limit(10);
    return data ?? [];
}

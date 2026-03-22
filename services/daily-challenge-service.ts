import { createClient } from '@/lib/supabase/server';

// ── GET TODAY'S CHALLENGE ─────────────────────────────────────
export async function getTodaysChallenge(userId: string, lcDiff?: string, cfLevel?: number) {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Fetch today's challenges (one per platform)
    const { data: challenges } = await supabase
        .from('daily_challenges')
        .select(`
            id, challenge_date, bonus_xp, total_solvers, platform,
            question:daily_challenge_pool (
                id, title, slug, difficulty, topic_tags, url, xp_reward, platform, external_id, rating
            )
        `)
        .eq('challenge_date', today);

    // Fetch user submissions for today
    const { data: submissions } = await supabase
        .from('daily_challenge_submissions')
        .select('status, xp_earned, submitted_at, platform')
        .eq('user_id', userId)
        .eq('challenge_date', today);

    // Fetch user profile for XP/Streak context
    const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level, current_streak, longest_streak')
        .eq('id', userId)
        .single();

    const platforms = ['leetcode', 'codeforces', 'tle'] as const;
    const challengeMap: Record<string, any> = {};

    for (const p of platforms) {
        let challenge = challenges?.find(c => c.platform === p);
        const question = Array.isArray(challenge?.question) ? challenge?.question[0] : challenge?.question;
        
        // If challenge exists but difficulty doesn't match, or if it doesn't exist, get from pool
        const isLeetCodeDiffMatch = p === 'leetcode' && lcDiff && question?.difficulty === lcDiff;
        const isCodeforcesDiffMatch = p === 'codeforces' && cfLevel && isRatingInLevel(question?.rating, cfLevel);

        if (!challenge || (p === 'leetcode' && lcDiff && !isLeetCodeDiffMatch) || (p === 'codeforces' && cfLevel && !isCodeforcesDiffMatch)) {
            challenge = await getFallbackFromPool(supabase, p, p === 'leetcode' ? lcDiff : undefined, p === 'codeforces' ? cfLevel : undefined);
        }

        challengeMap[p] = {
            challenge: challenge as any,
            submission: (submissions?.find(s => s.platform === p) ?? null) as any
        };
    }

    return {
        ...challengeMap,
        profile: profile ?? null
    } as any;
}

async function getFallbackFromPool(supabase: any, platform: string, difficulty?: string, level?: number) {
    let query = supabase
        .from('daily_challenge_pool')
        .select('id, title, slug, difficulty, topic_tags, url, xp_reward, platform, external_id, rating')
        .eq('platform', platform)
        .eq('is_active', true);

    if (platform === 'leetcode' && difficulty) {
        query = query.eq('difficulty', difficulty);
    } else if (platform === 'codeforces' && level) {
        const ranges: Record<number, [number, number]> = {
            1: [800, 1200],
            2: [1300, 1800],
            3: [1900, 3500]
        };
        const range = ranges[level];
        if (range) {
            query = query.gte('rating', range[0]).lte('rating', range[1]);
        }
    }

    const { data } = await query.limit(1);

    if (!data || data.length === 0) {
        // Absolute fallback if no match
        const { data: anyData } = await supabase
            .from('daily_challenge_pool')
            .select('id, title, slug, difficulty, topic_tags, url, xp_reward, platform, external_id, rating')
            .eq('platform', platform)
            .eq('is_active', true)
            .limit(1);
        if (!anyData || anyData.length === 0) return null;
        return formatAsChallenge(anyData[0], platform);
    }

    return formatAsChallenge(data[0], platform);
}

function formatAsChallenge(question: any, platform: string) {
    return {
        id: `pool-${question.id}`,
        challenge_date: new Date().toISOString().split('T')[0],
        bonus_xp: 0,
        total_solvers: 0,
        platform,
        question: question
    };
}

function isRatingInLevel(rating: number | undefined, level: number) {
    if (!rating) return false;
    if (level === 1) return rating <= 1200;
    if (level === 2) return rating > 1200 && rating <= 1800;
    if (level === 3) return rating > 1800;
    return true;
}

// ── SUBMIT DAILY CHALLENGE ───────────────────────────────────
export async function submitDailyChallenge(
    userId: string,
    challengeId: string,
    status: 'solved' | 'attempted' | 'skipped',
    platform: 'leetcode' | 'codeforces' | 'tle' = 'leetcode'
) {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Check not already submitted for this specific platform
    const { data: existing } = await supabase
        .from('daily_challenge_submissions')
        .select('id')
        .eq('user_id', userId)
        .eq('challenge_date', today)
        .eq('platform', platform)
        .single();

    if (existing) throw new Error(`Already submitted ${platform} today`);

    // Get challenge details
    const { data: challenge } = await supabase
        .from('daily_challenges')
        .select(`
            bonus_xp, total_solvers, 
            question:daily_challenge_pool(xp_reward)
        `)
        .eq('id', challengeId)
        .single();

    if (!challenge) throw new Error('Challenge not found');

    const questionData = challenge.question as any;
    const baseXP = status === 'solved' ? (questionData?.xp_reward || 0) : 0;
    const bonusXP = status === 'solved' && (challenge.total_solvers || 0) < 100
        ? (challenge.bonus_xp || 0) : 0;
    const totalXP = baseXP + bonusXP;

    // Insert submission
    const { error: insertError } = await supabase.from('daily_challenge_submissions').insert({
        user_id: userId,
        challenge_id: challengeId,
        challenge_date: today,
        platform,
        status,
        xp_earned: totalXP,
    });

    if (insertError) throw insertError;

    // Award XP atomically via DB function
    let xpResult = null;
    if (totalXP > 0) {
        const { data, error: rpcError } = await supabase.rpc('award_xp', {
            p_user_id: userId,
            p_amount: totalXP,
            p_source: 'daily_challenge',
            p_reference: challengeId,
            p_description: `Daily challenge ${today} (${platform}) — ${status}`,
        });
        if (rpcError) console.error('Award XP Error:', rpcError);
        xpResult = data;
    }

    // Increment total_solvers if solved
    if (status === 'solved') {
        await supabase.rpc('increment', {
            table_name: 'daily_challenges',
            column_name: 'total_solvers',
            row_id: challengeId
        });
    }

    return { status, xp_earned: totalXP, xp_result: xpResult };
}

// ── GET USER STREAK HISTORY (last 30 days) ───────────────────
export async function getStreakHistory(userId: string) {
    const supabase = await createClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
        .from('daily_challenge_submissions')
        .select('challenge_date, status, xp_earned')
        .eq('user_id', userId)
        .gte('challenge_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('challenge_date', { ascending: false });

    return data ?? [];
}

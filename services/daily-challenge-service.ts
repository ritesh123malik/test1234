import { createClient } from '@/lib/supabase/server';

// ── GET TODAY'S CHALLENGE ─────────────────────────────────────
export async function getTodaysChallenge(userId: string) {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Fetch today's challenges (could be multiple rows: leetcode, codeforces)
    const { data: challenges, error } = await supabase
        .from('daily_challenges')
        .select(`
            id, challenge_date, bonus_xp, total_solvers, platform,
            question:daily_challenge_pool (
                id, title, slug, difficulty, topic_tags, url, xp_reward, platform, external_id, rating
            )
        `)
        .eq('challenge_date', today);

    // Fetch all user submissions for today
    const { data: submissions } = await supabase
        .from('daily_challenge_submissions')
        .select('status, xp_earned, submitted_at, platform')
        .eq('user_id', userId)
        .eq('challenge_date', today);

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level, current_streak, longest_streak')
        .eq('id', userId)
        .single();

    // Organize by platform
    const leetcode = challenges?.find(c => c.platform === 'leetcode');
    const codeforces = challenges?.find(c => c.platform === 'codeforces');

    const lcSubmission = submissions?.find(s => s.platform === 'leetcode');
    const cfSubmission = submissions?.find(s => s.platform === 'codeforces');

    return {
        leetcode: { challenge: leetcode, submission: lcSubmission },
        codeforces: { challenge: codeforces, submission: cfSubmission },
        profile
    };
}

// ── SUBMIT DAILY CHALLENGE ───────────────────────────────────
export async function submitDailyChallenge(
    userId: string,
    challengeId: string,
    status: 'solved' | 'attempted' | 'skipped',
    platform: 'leetcode' | 'codeforces' = 'leetcode'
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

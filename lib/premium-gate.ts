import { createClient } from './supabase/server';

export type GatedFeature = 'ai_interviews' | 'ats_scans' | 'p2p_sessions' | 'aptitude_mocks' | 'oa_simulator' | 'dsa_patterns' | 'audio_hints' | 'ai_roadmap';

export const FREE_LIMITS: Record<string, number> = {
    ai_interviews: 3,
    ats_scans: 2,
    p2p_sessions: 2,
};

export async function checkPremiumGate(userId: string, feature: GatedFeature) {
    const supabase = await createClient();

    // 1. Fetch profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !profile) {
        return { allowed: false, reason: 'Profile not found' };
    }

    // 2. Check Premium Status
    const isPremium = profile.is_premium &&
        profile.premium_expires_at &&
        new Date(profile.premium_expires_at) > new Date();

    if (isPremium) {
        return { allowed: true, isPremium: true };
    }

    // 3. Handle Usage Reset (Monthly)
    const today = new Date();
    const lastReset = new Date(profile.usage_reset_at);
    const isNewMonth = today.getMonth() !== lastReset.getMonth() ||
        today.getFullYear() !== lastReset.getFullYear();

    if (isNewMonth) {
        // Reset counters server-side
        await supabase
            .from('profiles')
            .update({
                ai_interviews_this_month: 0,
                ats_scans_this_month: 0,
                p2p_sessions_this_month: 0,
                usage_reset_at: today.toISOString().split('T')[0]
            })
            .eq('id', userId);

        return { allowed: true, isPremium: false, remaining: FREE_LIMITS[feature] };
    }

    // 4. Check Free Limits
    const limit = FREE_LIMITS[feature];
    if (limit === undefined) {
        // Features not in FREE_LIMITS are premium-only (e.g., oa_simulator for non-TCS)
        return { allowed: false, reason: 'This feature requires a Premium subscription.' };
    }

    const currentUsage = (profile as any)[`${feature}_this_month`] || 0;

    if (currentUsage >= limit) {
        return {
            allowed: false,
            reason: `You have reached your free monthly limit for ${feature.replace('_', ' ')}.`,
            upgrade: true
        };
    }

    return {
        allowed: true,
        isPremium: false,
        remaining: limit - currentUsage
    };
}

export async function incrementUsage(userId: string, feature: GatedFeature) {
    const supabase = await createClient();
    const column = `${feature}_this_month`;

    const { data: profile } = await supabase
        .from('profiles')
        .select(column)
        .eq('id', userId)
        .single();

    if (profile) {
        await supabase
            .from('profiles')
            .update({ [column]: ((profile as any)[column] || 0) + 1 })
            .eq('id', userId);
    }
}

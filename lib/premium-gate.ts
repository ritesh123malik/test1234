import { createClient } from './supabase/server';
import { getSupabaseAdmin } from './supabase/admin';

export type GatedFeature = 'ai_interviews' | 'ats_scans' | 'p2p_sessions' | 'aptitude_mocks' | 'oa_simulator' | 'dsa_patterns' | 'audio_hints' | 'ai_roadmap';

export const FREE_LIMITS: Record<string, number> = {
    ai_interviews: 3,
    ats_scans: 2,
    p2p_sessions: 2,
};

export async function checkPremiumGate(userId: string, feature: GatedFeature) {
    const supabase = await createClient();
    const column = `${feature}_this_month`;

    // 1. Fetch only required columns
    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`is_premium, premium_expires_at, usage_reset_at, ${column}`)
        .eq('id', userId)
        .single() as { data: any, error: any };

    if (error || !profile) {
        // FAIL-SAFE: If profile is missing but user is authenticated, create it on-the-fly
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id === userId) {
            console.log(`Auto-creating missing profile for user ${userId} using ADMIN client`);
            const admin = getSupabaseAdmin();
            const { data: newProfile, error: createError } = await admin
                .from('profiles')
                .insert({
                    id: userId,
                    email: user.email!,
                    full_name: user.user_metadata?.full_name || 'Operative',
                    username: user.user_metadata?.username || user.email?.split('@')[0],
                    is_premium: false
                })
                .select()
                .single();

            if (createError) {
                console.error('Failed to auto-create profile with admin:', createError);
                return { allowed: false, reason: 'Profile not found and could not be created even with admin access.' };
            }
            
            // Also create initial free subscription using admin
            await admin.from('subscriptions').insert({ user_id: userId, plan: 'free', status: 'active' });
            
            return { allowed: true, isPremium: false, remaining: FREE_LIMITS[feature] || 5 };
        }
        return { allowed: false, reason: 'Profile not found' };
    }

    // 2. Check Premium Status
    const isPremium = profile.is_premium &&
        profile.premium_expires_at &&
        new Date(profile.premium_expires_at) > new Date();

    if (isPremium) {
        return { allowed: true, isPremium: true };
    }

    // 3. Handle Usage Reset (Monthly) - Atomic check
    const today = new Date();
    const lastReset = profile.usage_reset_at ? new Date(profile.usage_reset_at) : new Date(0);
    const isNewMonth = today.getMonth() !== lastReset.getMonth() ||
        today.getFullYear() !== lastReset.getFullYear();

    if (isNewMonth) {
        // Reset counters and allow
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
        return { allowed: false, reason: 'This feature requires a Premium subscription.' };
    }

    const currentUsage = profile[column] || 0;

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

    // Optimized read-then-write
    const { data: profile } = await supabase
        .from('profiles')
        .select(column)
        .eq('id', userId)
        .single() as { data: any };

    if (profile) {
        await supabase
            .from('profiles')
            .update({ [column]: (profile[column] || 0) + 1 })
            .eq('id', userId);
    }
}

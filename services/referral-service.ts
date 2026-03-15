import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function generateReferralCode(userId: string) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error } = await supabaseAdmin
        .from('profiles')
        .update({ referral_code: code })
        .eq('id', userId);

    if (error) throw error;
    return code;
}

export async function processReferral(referralCode: string, newUserId: string) {
    // 1. Find referrer
    const { data: referrer, error: rError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

    if (rError || !referrer) return null;

    // 2. Log referral
    const { error: iError } = await supabaseAdmin
        .from('referrals')
        .insert({
            referrer_id: referrer.id,
            referred_user_id: newUserId,
            status: 'pending'
        });

    if (iError) return null;

    // 3. Increment referrer count
    await supabaseAdmin.rpc('increment_referral_count', { ref_id: referrer.id });

    return referrer.id;
}

import { createClient } from './client';
// Note: We use the browser client for these helpers if called on client, 
// or one should pass a client. For now, matching legacy lib/supabase.ts behavior.
const supabase = createClient();

export async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function isPro(userId: string): Promise<boolean> {
    const { data } = await supabase
        .from('subscriptions')
        .select('plan, status, expires_at')
        .eq('user_id', userId)
        .single();

    if (!data) return false;
    if (data.plan === 'free') return false;
    if (data.status !== 'active') return false;
    if (data.expires_at && new Date(data.expires_at) < new Date()) return false;
    return true;
}

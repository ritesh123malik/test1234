import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function createInterviewSlot(userId: string, scheduledAt: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('mock_interview_slots')
        .insert({
            host_id: userId,
            scheduled_at: scheduledAt,
            status: 'available'
        })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function bookInterviewSlot(userId: string, slotId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('mock_interview_slots')
        .update({
            peer_id: userId,
            status: 'booked',
            meeting_link: `https://meet.jit.si/PlacementIntel-${slotId.slice(0, 8)}`
        })
        .eq('id', slotId)
        .eq('status', 'available')
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getUpcomingSlots() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('mock_interview_slots')
        .select('*, profiles:host_id(full_name, avatar_url)')
        .eq('status', 'available')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });
    if (error) throw error;
    return data;
}

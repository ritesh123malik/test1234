import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function saveWhiteboard(userId: string, data: { id?: string, title: string, content_json: any }) {
    const supabase = await createClient();

    if (data.id) {
        const { data: result, error } = await supabase
            .from('whiteboards')
            .update({
                title: data.title,
                content_json: data.content_json
            })
            .eq('id', data.id)
            .eq('user_id', userId)
            .select()
            .single();
        if (error) throw error;
        return result;
    } else {
        const { data: result, error } = await supabase
            .from('whiteboards')
            .insert({
                user_id: userId,
                title: data.title,
                content_json: data.content_json
            })
            .select()
            .single();
        if (error) throw error;
        return result;
    }
}

export async function getWhiteboards(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('whiteboards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

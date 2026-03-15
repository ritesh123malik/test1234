import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function getCompanyWiki(companyName: string) {
    const { data: wiki, error } = await supabaseAdmin
        .from('company_wiki')
        .select('*')
        .ilike('company_name', companyName)
        .single();

    if (error) return null;
    return wiki;
}

export async function submitContribution(wikiId: string, userId: string, contentDelta: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('wiki_contributions')
        .insert({
            wiki_id: wikiId,
            user_id: userId,
            content_delta: contentDelta,
            status: 'pending'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

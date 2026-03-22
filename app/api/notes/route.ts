// app/api/notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get('problemId');
    const platform = searchParams.get('platform');

    let query = supabase.from('problem_notes').select('*').eq('user_id', user.id);
    
    if (problemId) query = query.eq('problem_id', problemId);
    if (platform) query = query.eq('platform', platform);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { problemId, platform, title, content, tags, isFavorite } = body;

    const { data, error } = await supabase
        .from('problem_notes')
        .upsert({
            user_id: user.id,
            problem_id: problemId,
            platform,
            title,
            content,
            tags,
            is_favorite: isFavorite,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,problem_id,platform' })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabase
        .from('problem_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}

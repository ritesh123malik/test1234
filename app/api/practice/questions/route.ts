import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');

    let query = supabase
        .from('daily_challenge_pool')
        .select('*');

    if (category) query = query.eq('category', category);
    if (difficulty && difficulty !== 'All') query = query.eq('difficulty', difficulty);

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ questions: data });
}

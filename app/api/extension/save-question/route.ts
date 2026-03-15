import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { question, token } = await req.json();

    if (!token) return NextResponse.json({ error: 'Token missing' }, { status: 401 });

    // ── Verify session explicitly with token ──────────────────
    // Note: getUser(token) is for Supabase v2
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    try {
        // 1. Ensure "Unorganized" sheet exists for user
        let { data: sheet } = await supabase
            .from('question_sheets')
            .select('id')
            .eq('user_id', user.id)
            .eq('title', 'Unorganized')
            .single();

        if (!sheet) {
            const { data: newSheet, error: sheetError } = await supabase
                .from('question_sheets')
                .insert({
                    user_id: user.id,
                    title: 'Unorganized',
                    description: 'Questions saved via Chrome Extension',
                    is_public: false
                })
                .select()
                .single();

            if (sheetError) throw sheetError;
            sheet = newSheet;
        }

        if (!sheet) throw new Error('Unorganized sheet could not be initialized');

        // 2. Save the question
        const { error: saveError } = await supabase
            .from('sheet_questions')
            .insert({
                sheet_id: sheet.id,
                title: question.title,
                url: question.url,
                platform: question.platform,
                difficulty: question.difficulty,
                status: 'unsolved'
            });

        if (saveError) throw saveError;

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error('Extension Save Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
